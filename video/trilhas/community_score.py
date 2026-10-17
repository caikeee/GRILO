# -*- coding: utf-8 -*-
"""
Trilha do filme da Comunidade.

CONCEITO — "Uma sala onde as pessoas decidem juntas".
A peca e construida em Re bemol maior (Db), a tonalidade mais macia para
timbres digitais: sem as ressonancias duras de Do ou Mi. Tres camadas:

  FUNDO   um colchao de vidro (FM de indice baixo) em Db, que so respira.
          Nao tem ataque, nao tem ritmo — e o ar da sala.
  CORPO   marimba sintetica (FM com razao 1:3.5, o timbre de barra de
          madeira) para cada toque humano. Toda interacao da pessoa soa
          como madeira percutida: quente, curta, sem brilho agressivo.
  SISTEMA cordas de Karplus-Strong para o que o SISTEMA responde (voto
          registrado, status mudado). Timbre de harpa/celesta — cristalino,
          claramente diferente do toque humano.

A logica dramatica: a pessoa toca madeira, o sistema responde em cristal.
No fim, os dois se encontram no acorde de revelacao.

Tudo passa por uma cadeia de estudio (pedalboard/Spotify): compressao suave,
reverb de sala pequena, high-shelf para ar, e limitador brickwall.
"""
import numpy as np
from pedalboard import (Pedalboard, Reverb, Compressor, LadderFilter, Chorus,
                        Delay, HighShelfFilter, LowShelfFilter, BrickwallLimiter,
                        Gain, HighpassFilter, PeakFilter)
import soundfile as sf

SR = 48000
RNG = np.random.default_rng(20260921)

# ── Db maior. Notas em Hz. ────────────────────────────────────────
DB2, AB2 = 69.30, 103.83
DB3, F3, AB3 = 138.59, 174.61, 207.65
DB4, EB4, F4, AB4, BB4 = 277.18, 311.13, 349.23, 415.30, 466.16
DB5, EB5, F5, AB5 = 554.37, 622.25, 698.46, 830.61
DB6, F6, AB6 = 1108.73, 1396.91, 1661.22


def t(dur):
    return np.arange(int(dur * SR)) / SR


def exp_env(dur, attack, decay, floor=1e-4):
    """Envelope exponencial — como corpos fisicos realmente decaem.
    O ataque linear-rapido evita o clique de um degrau."""
    n = int(dur * SR)
    e = np.empty(n)
    a = max(int(attack * SR), 2)
    a = min(a, n)
    e[:a] = np.linspace(0.0, 1.0, a) ** 0.6
    rest = n - a
    if rest > 0:
        # decaimento exponencial ate floor ao longo de `decay`
        k = -np.log(floor) / max(decay, 1e-3)
        e[a:] = np.exp(-k * (np.arange(rest) / SR))
    return e


def fm(carrier, ratio, index, dur, attack=0.002, decay=0.5, idx_decay=None):
    """Sintese FM de 2 operadores (Chowning).
    O indice de modulacao cai mais rapido que a amplitude — e isso que faz
    o timbre 'fechar' ao longo da nota, como um instrumento acustico."""
    x = t(dur)
    idx_dec = idx_decay if idx_decay is not None else decay * 0.45
    idx_env = np.exp(-(-np.log(1e-3) / max(idx_dec, 1e-3)) * x)
    mod = np.sin(2 * np.pi * carrier * ratio * x) * index * idx_env
    y = np.sin(2 * np.pi * carrier * x + mod)
    return y * exp_env(dur, attack, decay)


def pluck(freq, dur, damping=0.5, bright=0.5, seed=None):
    """Karplus-Strong: excita um atraso com ruido e filtra a realimentacao.
    Produz corda/harpa real, nao uma senoide disfarcada."""
    rng = np.random.default_rng(seed if seed is not None else RNG.integers(1 << 30))
    n = int(dur * SR)
    N = max(int(SR / freq), 2)
    buf = rng.uniform(-1, 1, N)
    # filtra a excitacao: menos brilho = mais doce
    if bright < 1.0:
        k = max(int((1.0 - bright) * 12), 1)
        buf = np.convolve(buf, np.ones(k) / k, mode='same')
    out = np.empty(n)
    a = np.clip(damping, 0.0, 0.999)
    prev = 0.0
    for i in range(n):
        v = buf[i % N]
        out[i] = v
        # media movel de 2 pontos + perda: o filtro classico de KS
        nxt = (v + prev) * 0.5 * (0.5 + 0.5 * a)
        prev = v
        buf[i % N] = nxt
    return out * exp_env(dur, 0.0006, dur * 0.85)


def noise_burst(dur, lo, hi, seed=None):
    """Ruido em banda — o 'ar' de um toque, o corpo de um whoosh."""
    rng = np.random.default_rng(seed if seed is not None else RNG.integers(1 << 30))
    x = rng.normal(0, 1, int(dur * SR)).astype(np.float32)
    bd = Pedalboard([HighpassFilter(lo), LadderFilter(
        mode=LadderFilter.Mode.LPF24, cutoff_hz=hi, resonance=0.1)])
    return bd(x.reshape(1, -1), SR)[0].astype(np.float64)


def stereo(mono, width=0.0, pan=0.0):
    """Converte para estereo. `width` gera um leve atraso entre os canais
    (efeito Haas), `pan` desloca a imagem."""
    n = len(mono)
    L = mono.copy()
    R = mono.copy()
    if width > 0:
        d = int(width * SR)
        if d > 0:
            R = np.concatenate([np.zeros(d), mono[:-d]])
    if pan != 0:
        a = np.clip((1 - pan) / 2 + 0.5, 0, 1)
        L *= np.sqrt(a)
        R *= np.sqrt(1 - a + 0.5)
    return np.stack([L, R])


# ── VOZES ─────────────────────────────────────────────────────────

def bed(dur):
    """Colchao de vidro: FM de indice muito baixo, varias vozes levemente
    desafinadas. Sem ataque perceptivel — aparece e some."""
    x = t(dur)
    out = np.zeros(int(dur * SR))
    voices = [(DB3, 0.30), (AB3, 0.22), (F4, 0.15), (DB4, 0.18), (AB4, 0.09)]
    for i, (f, amp) in enumerate(voices):
        # deriva lenta de afinacao: o que faz um pad soar vivo
        drift = 1.0 + 0.0022 * np.sin(2 * np.pi * (0.037 + i * 0.019) * x + i)
        mod = np.sin(2 * np.pi * f * 2.0 * x * drift) * 0.55 * (
            0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * x + i))
        v = np.sin(2 * np.pi * f * x * drift + mod)
        # cada voz respira no seu tempo
        breath = 0.55 + 0.45 * np.sin(2 * np.pi * (0.055 + i * 0.011) * x - np.pi / 2)
        out += v * amp * breath
    fi, fo = int(1.6 * SR), int(2.4 * SR)
    out[:fi] *= np.linspace(0, 1, fi) ** 1.6
    out[-fo:] *= np.linspace(1, 0, fo) ** 1.4
    board = Pedalboard([
        LadderFilter(mode=LadderFilter.Mode.LPF12, cutoff_hz=1500, resonance=0.05),
        Chorus(rate_hz=0.22, depth=0.32, mix=0.35),
        Reverb(room_size=0.85, damping=0.55, wet_level=0.34, dry_level=0.66, width=1.0),
    ])
    st = stereo(out, width=0.012)
    return board(st.astype(np.float32), SR).astype(np.float64) * 0.30


def marimba(freq, dur=0.42, amp=1.0, soft=0.0):
    """Toque humano: FM razao 1:3.5 = barra de madeira.
    `soft` abre o ataque e tira indice, para toques menos assertivos."""
    idx = 3.1 - soft * 1.3
    body = fm(freq, 3.5, idx, dur, attack=0.0016 + soft * 0.004,
              decay=dur * 0.72, idx_decay=dur * 0.16)
    # oitava abaixo da uma cauda de madeira
    sub = fm(freq * 0.5, 3.5, 1.1, dur, attack=0.003, decay=dur * 0.9) * 0.22
    # o "toc" do martelo
    click = noise_burst(0.012, 1800, 7000) * 0.16
    out = body + sub
    out[:len(click)] += click
    return out * amp


def harp(freq, dur=1.2, amp=1.0, bright=0.55):
    """Resposta do sistema: corda pinçada, timbre de harpa/celesta."""
    return pluck(freq, dur, damping=0.62, bright=bright) * amp


def air_swell(dur=0.7, peak=0.30):
    """Whoosh: ruido filtrado com envelope gaussiano e varredura de corte."""
    x = t(dur)
    n = RNG.normal(0, 1, len(x)).astype(np.float32)
    cut = 300 + 3200 * np.exp(-((x - peak * dur) ** 2) / (2 * (dur * 0.16) ** 2))
    # varredura por blocos (o filtro nao aceita automacao por amostra)
    out = np.zeros(len(x))
    step = 512
    for i in range(0, len(x), step):
        seg = n[i:i + step]
        if not len(seg):
            break
        c = float(np.clip(cut[min(i, len(cut) - 1)], 100, 16000))
        bd = Pedalboard([HighpassFilter(220),
                         LadderFilter(mode=LadderFilter.Mode.LPF12,
                                      cutoff_hz=c, resonance=0.12)])
        out[i:i + len(seg)] = bd(seg.reshape(1, -1), SR)[0]
    shape = np.exp(-((x - peak * dur) ** 2) / (2 * (dur * 0.20) ** 2))
    return out * shape


# ── GESTOS (o vocabulario do filme) ──────────────────────────────

def g_tap(note=AB4, soft=0.25):
    """Toque simples: filtro, botao."""
    return marimba(note, 0.34, 0.50, soft=soft)


def g_vote(root=DB5):
    """Voto: madeira (a pessoa toca) + harpa subindo (o sistema conta)."""
    out = np.zeros(int(1.5 * SR))
    m = marimba(root, 0.36, 0.52, soft=0.1)
    out[:len(m)] += m
    # o numero subindo: terca e quinta em cristal
    for k, (f, d) in enumerate([(F5, 0.07), (AB5, 0.15)]):
        h = harp(f, 1.0, 0.30 - k * 0.07, bright=0.62)
        i = int(d * SR)
        out[i:i + len(h)] += h[:len(out) - i]
    return out


def g_expand():
    """Expansao do card: o gesto maior do filme.
    Ar subindo + acorde de madeira arpejado + brilho de harpa no topo."""
    dur = 1.6
    out = np.zeros(int(dur * SR))
    a = air_swell(0.75, 0.42) * 0.30
    out[:len(a)] += a
    # arpejo ascendente Db-F-Ab-Db: abre como o card abre
    for k, f in enumerate([DB4, F4, AB4, DB5]):
        m = marimba(f, 0.85, 0.30 - k * 0.035, soft=0.35)
        i = int((0.055 + k * 0.048) * SR)
        out[i:i + len(m)] += m[:len(out) - i]
    # cristal no topo, confirmando a abertura
    h = harp(AB5, 1.1, 0.16, bright=0.7)
    i = int(0.30 * SR)
    out[i:i + len(h)] += h[:len(out) - i]
    return out


def g_key(i):
    """Tecla: madeira muito curta e grave, quase um toque de feltro.
    Varia de altura para nao soar como metronomo."""
    notes = [DB4, EB4, DB4, F4, EB4, DB4, F4, EB4]
    f = notes[i % len(notes)] * 2
    out = marimba(f, 0.075, 0.085, soft=0.75)
    return out


def g_send():
    """Envio: ar curto + intervalo de quarta em madeira, subindo."""
    dur = 0.9
    out = np.zeros(int(dur * SR))
    a = air_swell(0.45, 0.30) * 0.26
    out[:len(a)] += a
    for k, (f, d) in enumerate([(AB4, 0.0), (DB5, 0.075)]):
        m = marimba(f, 0.5, 0.34 - k * 0.06, soft=0.2)
        i = int(d * SR)
        out[i:i + len(m)] += m[:len(out) - i]
    return out


def g_confirm():
    """Confirmacao do sistema: tres cristais subindo (Db-F-Ab), sem madeira.
    E o sistema falando, nao a pessoa."""
    dur = 2.0
    out = np.zeros(int(dur * SR))
    for k, (f, d, a) in enumerate([(DB5, 0.0, 0.34), (F5, 0.085, 0.30), (AB5, 0.17, 0.26)]):
        h = harp(f, 1.5, a, bright=0.68)
        i = int(d * SR)
        out[i:i + len(h)] += h[:len(out) - i]
    # sub grave marcando o peso da decisao
    s = fm(AB2, 1.0, 0.8, 0.8, attack=0.008, decay=0.6) * 0.16
    out[:len(s)] += s
    return out


def g_reveal():
    """Revelacao final: Dbmaj9 aberto. Madeira e cristal juntos —
    a pessoa e o sistema no mesmo acorde."""
    dur = 3.4
    out = np.zeros(int(dur * SR))
    # fundamento
    s = fm(DB2, 2.0, 1.2, 2.8, attack=0.02, decay=2.2) * 0.30
    out[:len(s)] += s
    # madeira: o acorde propriamente
    for k, (f, a, d) in enumerate([(DB4, 0.26, 0.0), (F4, 0.22, 0.035),
                                   (AB4, 0.19, 0.07), (DB5, 0.16, 0.105)]):
        m = marimba(f, 2.2, a, soft=0.45)
        i = int(d * SR)
        out[i:i + len(m)] += m[:len(out) - i]
    # cristal: a nona e a terca no alto, entrando depois
    for k, (f, a, d) in enumerate([(EB5, 0.15, 0.22), (F5, 0.13, 0.30), (AB5, 0.11, 0.38)]):
        h = harp(f, 2.6, a, bright=0.72)
        i = int(d * SR)
        out[i:i + len(h)] += h[:len(out) - i]
    return out


def g_transition():
    """Passagem desktop -> mobile: um sopro curto e uma quinta em harpa."""
    dur = 1.4
    out = np.zeros(int(dur * SR))
    a = air_swell(0.6, 0.45) * 0.30
    out[:len(a)] += a
    for k, (f, d) in enumerate([(AB4, 0.04), (EB5, 0.12)]):
        h = harp(f, 1.2, 0.20 - k * 0.05, bright=0.6)
        i = int(d * SR)
        out[i:i + len(h)] += h[:len(out) - i]
    return out


# ── MONTAGEM ──────────────────────────────────────────────────────

def place(track, snd, at, pan=0.0, width=0.008):
    """Mistura um gesto mono na trilha estereo, com posicao na imagem."""
    st = stereo(snd, width=width, pan=pan)
    i = int(at * SR)
    if i < 0:
        st = st[:, -i:]
        i = 0
    n = min(st.shape[1], track.shape[1] - i)
    if n > 0:
        track[:, i:i + n] += st[:, :n]


def master(track):
    """Cadeia de masterizacao: corta o subgrave inutil, controla dinamica,
    da ar no topo, cola tudo numa sala e limita."""
    board = Pedalboard([
        HighpassFilter(34),
        PeakFilter(cutoff_frequency_hz=340, gain_db=-1.6, q=0.9),   # tira barro
        Compressor(threshold_db=-19, ratio=2.4, attack_ms=12, release_ms=210),
        HighShelfFilter(cutoff_frequency_hz=7200, gain_db=2.4, q=0.7),
        LowShelfFilter(cutoff_frequency_hz=110, gain_db=1.4, q=0.7),
        Reverb(room_size=0.42, damping=0.62, wet_level=0.15, dry_level=0.85, width=0.95),
        Gain(gain_db=2.0),
        BrickwallLimiter(ceiling_db=-0.9, release_ms=90),
    ])
    return board(track.astype(np.float32), SR).astype(np.float64)


def build(dur, events, out_path):
    trk = bed(dur)
    if trk.shape[1] < int(dur * SR):
        trk = np.pad(trk, ((0, 0), (0, int(dur * SR) - trk.shape[1])))
    trk = trk[:, :int(dur * SR)]

    for kind, at, *rest in events:
        # typing carrega (k0, k1, n, pan); os demais so (pan)
        pan = rest[2] if kind == 'typing' and len(rest) > 2 else (
            rest[0] if rest and kind != 'typing' else 0.0)
        if kind == 'tap':
            place(trk, g_tap(), at, pan, 0.010)
        elif kind == 'tap_hi':
            place(trk, g_tap(DB5, soft=0.15), at, pan, 0.010)
        elif kind == 'vote':
            place(trk, g_vote(), at, pan, 0.014)
        elif kind == 'expand':
            place(trk, g_expand(), at, pan, 0.018)
        elif kind == 'send':
            place(trk, g_send(), at, pan, 0.012)
        elif kind == 'confirm':
            place(trk, g_confirm(), at, pan, 0.016)
        elif kind == 'reveal':
            place(trk, g_reveal(), at, pan, 0.020)
        elif kind == 'transition':
            place(trk, g_transition(), at, pan, 0.016)
        elif kind == 'phone_in':
            # O celular deslizando: sopro curto panoramizado para a direita,
            # acompanhando o movimento na tela.
            place(trk, g_transition() * 0.75, at, pan, 0.020)
        elif kind == 'typing':
            # ('typing', inicio, fim, n_teclas, pan): `at` ja e o inicio
            k0, k1, n = at, rest[0], int(rest[1])
            for i in range(n):
                # espacamento irregular: ninguem digita em grade
                frac = (i + RNG.uniform(-0.28, 0.28)) / n
                place(trk, g_key(i), k0 + (k1 - k0) * np.clip(frac, 0, 1),
                      pan=RNG.uniform(-0.25, 0.25), width=0.004)

    trk = master(trk)
    peak = float(np.max(np.abs(trk)))
    if peak > 0:
        trk = trk / peak * 0.94
    sf.write(out_path, trk.T, SR, subtype='PCM_16')
    rms = float(np.sqrt(np.mean(trk ** 2)))
    print('escrito %s  %.2fs  pico %.2f dB  rms %.1f dB'
          % (out_path, trk.shape[1] / SR, 20 * np.log10(peak if peak else 1e-9),
             20 * np.log10(rms if rms else 1e-9)))


if __name__ == '__main__':
    # Tempos medidos nesta gravacao (ja no tempo do corte, a partir da claquete).
    # O som entra um pouco antes do marcador, que e registrado apos a pausa.
    # Desktop 0-15s; o celular desliza aos 9s e fica ate o fim.
    build(15.0, [
        ('tap',        1.86, -0.18),   # filtro Sugestoes
        ('tap',        2.93, -0.06),   # filtro Tudo
        ('vote',       4.90,  0.10),   # voto: 5 -> 6
        ('expand',     6.42,  0.00),   # card expande
        ('typing',     7.10, 8.55, 20, 0.0),
        ('send',       9.85,  0.08),   # resposta enviada
        ('phone_in',   8.95,  0.30),   # celular entra
        ('tap_hi',    11.03,  0.12),   # escolhe status
        ('confirm',   11.95,  0.00),   # status aplicado
        ('reveal',    12.85,  0.00),   # revelacao
    ], 'C:/GRILO/_rec/score-final.wav')
