"""Gera o áudio (Groq Orpheus) das frases das aulas e grava em frontend/assets/audio/.

Uso:
    .venv/Scripts/python.exe scripts/gen_lesson_audio.py --groups A
    .venv/Scripts/python.exe scripts/gen_lesson_audio.py --groups A B C D --voice troy
    .venv/Scripts/python.exe scripts/gen_lesson_audio.py --groups A --dry-run
    .venv/Scripts/python.exe scripts/gen_lesson_audio.py --source voice   # frases fixas do Chat de Voz

Incremental: só gera o que ainda não está no manifesto (ou foi gerado com outra
voz). Se o limite do Groq estourar no meio, a próxima execução continua de onde
parou. O front (grilo-tts.js) procura o texto no manifesto antes de chamar /api/tts.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_JS = ROOT / "frontend" / "assets" / "js" / "lessons-4p-data.js"
AUDIO_DIR = ROOT / "frontend" / "assets" / "audio"
MANIFEST = AUDIO_DIR / "manifest.json"

MODEL = "canopylabs/orpheus-v1-english"
VOICES = {"autumn", "diana", "hannah", "austin", "daniel", "troy"}
MAX_CHARS = 200  # limite por requisição do Orpheus (docs do Groq)
PAUSE_S = 6.5    # free tier: ~10 requisições/min

# Mesma normalização do grilo-tts.js: o manifesto é indexado por este texto.
def norm(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip()


def load_env():
    env = ROOT / "backend" / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


DICTATION_JS = ROOT / "frontend" / "assets" / "js" / "dictation-data.js"
SERVICES_PY = ROOT / "backend" / "services.py"
FALLBACK_PY = ROOT / "backend" / "fallback.py"

# Amostra do seletor de voz do Chat de Voz: cada voz grava a SUA frase (o texto
# muda com o nome, então cada uma é uma entrada própria no manifesto).
VOICE_SAMPLE = "Hi, I'm {name}. Let's practice English together!"


def extract_voice_chat_texts():
    """Frases FIXAS do Chat de Voz (as respostas da conversa são dinâmicas e
    ficam no cache de disco do /api/tts). Lê o código sem importar o backend.
    Retorna [(texto, voz_forçada_ou_None)]."""
    out = []
    src = SERVICES_PY.read_text(encoding="utf-8")
    # Respostas locais (NO_LLM) — só o bloco em inglês; Orpheus não fala PT
    block = src.split("_NO_LLM_RESPONSES = {", 1)[1].split("# Portuguese", 1)[0]
    out += [(t, None) for t in re.findall(r':\s*"([^"]+)"', block)]
    # Frase de ruído ("não ouvi") do gate de entendimento
    m = re.search(r'reply = "(Sorry, I didn\'t quite hear you[^"]*)"', src)
    if m:
        out.append((m.group(1), None))
    # Respostas de reserva quando a API falha; as que terminam em ":" são
    # concatenadas com outra frase em runtime, então nunca batem inteiras
    fb = FALLBACK_PY.read_text(encoding="utf-8")
    fb_block = fb.split("FALLBACK_RESPONSES = {", 1)[1].split("\n}", 1)[0]
    out += [(t, None) for t in re.findall(r':\s*"([^"]+)"', fb_block) if not t.rstrip().endswith(":")]
    for v in sorted(VOICES):
        out.append((VOICE_SAMPLE.format(name=v.capitalize()), v))
    return out


def extract_dictation_texts():
    """Frases do ditado (todas as trilhas)."""
    js = (
        "global.window={};"
        f"eval(require('fs').readFileSync({json.dumps(str(DICTATION_JS))},'utf8'));"
        "const out=[];"
        "window.GriloDictation.TRACKS.forEach(t=>t.sentences.forEach(s=>out.push(s.en)));"
        "console.log(JSON.stringify(out));"
    )
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def extract_texts(groups, source="lessons"):
    """Todo texto em inglês falado: nas aulas, palavras/frases do escopo,
    exemplos das seções e áudios dos checkpoints 'ouvir'; no ditado, as frases
    das trilhas."""
    if source == "dictation":
        raw = extract_dictation_texts()
        seen, ordered = set(), []
        for t in raw:
            t = norm(t)
            if t and t not in seen:
                seen.add(t)
                ordered.append(t)
        return ordered
    js = (
        "global.window={};"
        f"eval(require('fs').readFileSync({json.dumps(str(DATA_JS))},'utf8'));"
        f"const G={json.dumps(groups)};"
        "const out=[];"
        "window.Grilo4P.LESSONS.filter(l=>G.includes(l.group)).forEach(l=>{"
        "l.scope.words.forEach(w=>out.push(w.en));"
        "l.scope.phrases.forEach(p=>out.push(p.en));"
        "l.sections.forEach(s=>{(s.examples||[]).forEach(e=>out.push(e.en));"
        "(s.checkpoint||[]).forEach(c=>c.audio&&out.push(c.audio));});});"
        "console.log(JSON.stringify(out));"
    )
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    seen, ordered = set(), []
    for t in json.loads(res.stdout):
        t = norm(t)
        if t and t not in seen:
            seen.add(t)
            ordered.append(t)
    return ordered


def load_manifest():
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {"model": MODEL, "files": {}}


def save_manifest(m):
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(m, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")


def synth_mp3(client, text, voice, dest: Path):
    result = client.audio.speech.create(
        model=MODEL, voice=voice, input=text, response_format="wav",
    )
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "in.wav"
        wav.write_bytes(result.read())
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
             "-ac", "1", "-b:a", "64k", str(dest)],
            check=True,
        )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=["lessons", "dictation", "voice"], default="lessons",
                    help="de onde extrair as frases (padrão: lessons; voice = frases fixas do Chat de Voz)")
    ap.add_argument("--groups", nargs="+", default=[], help="aulas: ex. A ou A B C D")
    ap.add_argument("--voice", default="troy", choices=sorted(VOICES))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if args.source == "lessons" and not args.groups:
        sys.exit("--groups é obrigatório para --source lessons")
    # voice_of: voz de cada frase (amostras do seletor forçam a própria voz)
    if args.source == "voice":
        pairs, seen = [], set()
        for t, v in extract_voice_chat_texts():
            t = norm(t)
            if t and t not in seen:
                seen.add(t)
                pairs.append((t, v or args.voice))
        texts = [t for t, _ in pairs]
        voice_of = dict(pairs)
    else:
        texts = extract_texts(args.groups, args.source)
        voice_of = {t: args.voice for t in texts}
    manifest = load_manifest()
    files = manifest["files"]
    todo = [t for t in texts
            if t not in files or files[t].get("v") != voice_of[t]
            or not (AUDIO_DIR / files[t]["f"]).exists()]
    origem = {"lessons": f"grupos {args.groups}", "dictation": "ditado", "voice": "chat de voz"}[args.source]
    print(f"{len(texts)} frases ({origem}) | {len(todo)} a gerar | voz={args.voice}")
    too_long = [t for t in todo if len(t) > MAX_CHARS]
    if too_long:
        sys.exit(f"Frases acima de {MAX_CHARS} caracteres (Orpheus recusa): {too_long}")
    if args.dry_run or not todo:
        return

    load_env()
    if not os.getenv("GROQ_API_KEY"):
        sys.exit("GROQ_API_KEY não encontrada (backend/.env).")
    import groq
    client = groq.Groq(api_key=os.environ["GROQ_API_KEY"], timeout=30, max_retries=0)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    done = 0
    for i, text in enumerate(todo, 1):
        voice = voice_of[text]
        name = hashlib.sha1(f"{voice}|{text}".encode("utf-8")).hexdigest()[:12] + ".mp3"
        try:
            synth_mp3(client, text, voice, AUDIO_DIR / name)
        except groq.RateLimitError as exc:
            print(f"\nLimite do Groq atingido após {done} áudios — rode de novo mais tarde.\n{str(exc)[:200]}")
            break
        except Exception as exc:  # frase isolada falhou: segue com as outras
            print(f"[{i}/{len(todo)}] FALHOU {text!r}: {str(exc)[:150]}")
            continue
        files[text] = {"f": name, "v": voice}
        save_manifest(manifest)  # grava a cada áudio: queda no meio não perde nada
        done += 1
        print(f"[{i}/{len(todo)}] {name}  {text}")
        time.sleep(PAUSE_S)

    missing = [t for t in texts if t not in files]
    print(f"\nGerados agora: {done} | sem áudio: {len(missing)}")
    for t in missing:
        print("  -", t)


if __name__ == "__main__":
    main()
