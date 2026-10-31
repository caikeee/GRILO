import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, H, INTER, STAGE_Y, W, ease } from "../brand";
import { BrandSymbol } from "../components/BrandSymbol";
import { LogoRest } from "../components/LogoRest";
import { RevealLines } from "../components/RevealLines";
import { fitLogo, lerp, progress } from "../geometry";
import { logoParts } from "../logoParts.generated";
import { Cue, MUSIC_CREDIT } from "../timeline";
import { Phone, SH, SW, Sheet, Shot, SoundRings, Tap, deviceSize } from "./Phone";
import { META, StoryContext, VOICE, buildStory, useStory } from "./storyTimeline";
import { StorySoundtrack } from "./StorySoundtrack";

// ─── Palco ───────────────────────────────────────────────────────
// Cartelas no alto (abaixo da faixa que o Instagram cobre com o perfil);
// o celular embaixo, com a base acima da barra de resposta do story.
const PHONE_W = 520;
const PHONE_Y = 1110;
const CAP_Y = 395;
const WHIP = 1500;
const WHIP_DUR = 9;

type Vec = { x: number; y: number };
const RIGHT: Vec = { x: 1, y: 0 };
const LEFT: Vec = { x: -1, y: 0 };
const DOWN: Vec = { x: 0, y: 1 };

// ─── Câmera ──────────────────────────────────────────────────────
// Cada chave diz para onde a câmera olha: escala, ponto da tela em foco
// (fx, fy em px da tela 390x844), onde esse ponto fica no palco (ay) e
// a inclinação do aparelho. Entre chaves, ease in-out.
type Key = { at: number; s: number; fx: number; fy: number; ay?: number; rx: number; ry: number };

function cam(keys: Key[], f: number) {
  if (f <= keys[0].at) return { ...keys[0], ay: keys[0].ay ?? PHONE_Y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.at) {
      const t = progress(f, a.at, b.at - a.at, ease.inOut);
      return {
        at: f,
        s: lerp(a.s, b.s, t),
        fx: lerp(a.fx, b.fx, t),
        fy: lerp(a.fy, b.fy, t),
        ay: lerp(a.ay ?? PHONE_Y, b.ay ?? PHONE_Y, t),
        rx: lerp(a.rx, b.rx, t),
        ry: lerp(a.ry, b.ry, t),
      };
    }
  }
  const last = keys[keys.length - 1];
  return { ...last, ay: last.ay ?? PHONE_Y };
}

type Move = { dir: Vec; dur: number; dist?: number };

function moveOffset(f: number, enter?: Move, exitAt?: number, exit?: Move): Vec {
  let x = 0;
  let y = 0;
  if (enter && f < enter.dur) {
    const k = (1 - ease.out(Math.max(0, f) / enter.dur)) * (enter.dist ?? WHIP);
    x += enter.dir.x * k;
    y += enter.dir.y * k;
  }
  if (exit && exitAt !== undefined && f > exitAt) {
    const k = ease.in(Math.min(1, (f - exitAt) / exit.dur)) * (exit.dist ?? WHIP);
    x += exit.dir.x * k;
    y += exit.dir.y * k;
  }
  return { x, y };
}

type ShotProps = {
  keys: Key[];
  enter?: Move;
  exitAt?: number;
  exit?: Move;
  width?: number;
  children: React.ReactNode;
};

// O celular como ator. No whip pan ganha um rastro na direção do movimento.
const PhoneShot: React.FC<ShotProps> = ({ keys, enter, exitAt, exit, width = PHONE_W, children }) => {
  const f = useCurrentFrame();
  const c = cam(keys, f);
  const { k, w, h } = deviceSize(width);
  const off = moveOffset(f, enter, exitAt, exit);
  const prev = moveOffset(f - 1, enter, exitAt, exit);
  const v = { x: off.x - prev.x, y: off.y - prev.y };
  const speed = Math.hypot(v.x, v.y);

  // ponto em foco cai em (540, ay): o centro do aparelho se desloca ao contrário
  const cx = W / 2 - (c.fx - SW / 2) * k * c.s;
  const cy = c.ay - (c.fy - SH / 2) * k * c.s;

  const layer = (dx: number, dy: number, opacity: number, key: string) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        opacity,
        transform: `translate3d(${off.x + dx}px, ${off.y + dy}px, 0) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s})`,
        transformOrigin: "50% 50%",
      }}
    >
      <Phone width={width}>{children}</Phone>
    </div>
  );

  const ghosts = speed > 40 ? [4, 3, 2, 1].map((j) => layer(-v.x * j * 0.32, -v.y * j * 0.32, 0.1 + (4 - j) * 0.05, `g${j}`)) : [];
  return (
    <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: `50% ${PHONE_Y}px` }}>
      {ghosts}
      {layer(0, 0, 1, "main")}
    </AbsoluteFill>
  );
};

// Brilho sálvia atrás do aparelho, para ele não flutuar no escuro.
const Glow: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: W / 2 - 700,
      top: PHONE_Y - 700,
      width: 1400,
      height: 1400,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(122,158,132,0.30) 0%, rgba(122,158,132,0.10) 38%, rgba(15,30,24,0) 68%)",
      opacity,
    }}
  />
);

type Line = { text: string; color: string };
const Caption: React.FC<{ lines: Line[]; inAt: number; outAt: number }> = ({ lines, inAt, outAt }) => (
  <RevealLines x={96} centerY={CAP_Y} size={76} inAt={inAt} outAt={outAt} stagger={4} lines={lines} />
);
const P = (text: string): Line => ({ text, color: C.paper });
const G = (text: string): Line => ({ text, color: C.sageLight });

// ─── Cenas ───────────────────────────────────────────────────────

// 0 · Abertura: só tipografia.
const Hook: React.FC<{ outAt: number }> = ({ outAt }) => (
  <AbsoluteFill>
    <RevealLines
      x={96}
      centerY={STAGE_Y}
      size={124}
      inAt={8}
      outAt={outAt}
      lines={[P("Tem muita"), G("gente nova"), P("chegando"), P("no GRILO.")]}
    />
  </AbsoluteFill>
);

// 1 · O site novo no celular: o aparelho sobe com o hub de aulas, rola e toca "Começar".
// A rolagem para antes de o cartão "Continuar" passar por baixo da ilha.
const HUB_SCROLL = 110;
const SceneHub: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const { b } = useStory();
  const f = useCurrentFrame();
  const t = (n: number) => b(n) - start;
  const scroll = interpolate(f, [t(3), t(5)], [0, HUB_SCROLL], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const exitAt = end - start - 5 - WHIP_DUR / 2;

  return (
    <AbsoluteFill>
      <Glow opacity={progress(f, 0, 24)} />
      <PhoneShot
        enter={{ dir: DOWN, dur: 30, dist: 1300 }}
        exitAt={exitAt}
        exit={{ dir: LEFT, dur: WHIP_DUR }}
        keys={[
          { at: 0, s: 0.9, fx: 195, fy: 422, rx: 28, ry: -16 },
          { at: t(2), s: 1, fx: 195, fy: 422, rx: 6, ry: -6 },
          { at: t(6), s: 1.03, fx: 195, fy: 400, rx: 3, ry: 3 },
          { at: t(8), s: 1.05, fx: 195, fy: 380, rx: 2, ry: 6 },
        ]}
      >
        <Shot src="hub-aulas-full" y={scroll} height={1616} />
        <Tap x={META.hubTap.x} y={META.hubTap.y - HUB_SCROLL} at={t(7)} />
      </PhoneShot>
      <Caption lines={[P("Então a gente refez"), G("o site pro celular.")]} inAt={14} outAt={t(8) - 16} />
    </AbsoluteFill>
  );
};

// 2 · Voz nova + feedback no polegar (mesma tela da aula "Ouvir e falar").
const SceneAula: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const { b } = useStory();
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = (n: number) => b(n) - start;
  const tapPlay = t(9);
  const voiceFrom = tapPlay + 4 + Math.round(VOICE.goodMorning.speechStart * fps);
  const voiceTo = tapPlay + 4 + Math.round(VOICE.goodMorning.speechEnd * fps);
  const tapOpt = t(15);
  const sheetP = spring({ frame: f - tapOpt - 4, fps, config: { damping: 16, stiffness: 120, mass: 0.8 } });
  const exitAt = end - start - 5 - WHIP_DUR / 2;

  return (
    <AbsoluteFill>
      <Glow />
      <PhoneShot
        enter={{ dir: RIGHT, dur: WHIP_DUR + 2 }}
        exitAt={exitAt}
        exit={{ dir: RIGHT, dur: WHIP_DUR }}
        keys={[
          { at: 0, s: 1.04, fx: 195, fy: 400, rx: 3, ry: -6 },
          { at: t(9), s: 1.24, fx: 195, fy: 250, ay: 1000, rx: 0, ry: -3 },
          { at: t(13.5), s: 1.3, fx: 195, fy: 240, ay: 1000, rx: 2, ry: 4 },
          { at: t(14.7), s: 1.04, fx: 195, fy: 470, rx: 4, ry: 2 },
          { at: t(16.5), s: 1.04, fx: 195, fy: 640, ay: 1480, rx: 3, ry: -4 },
          { at: t(20), s: 1.06, fx: 195, fy: 650, ay: 1480, rx: 2, ry: 3 },
        ]}
      >
        <Shot src={f < tapOpt + 2 ? "aula-ouvir" : "aula-respondida"} />
        <SoundRings x={META.aulaPlay.x} y={META.aulaPlay.y} from={voiceFrom - 4} to={voiceTo} r0={56} />
        <Tap x={META.aulaPlay.x} y={META.aulaPlay.y} at={tapPlay} />
        <Tap x={META.aulaTap.x} y={META.aulaTap.y} at={tapOpt} />
        <Sheet src="aula-sheet" top={META.aulaSheetTop} p={sheetP} />
      </PhoneShot>
      <Caption lines={[P("Ouça a voz nova:"), G("mais natural.")]} inAt={t(8) + 10} outAt={t(14) - 14} />
      <Caption lines={[P("Resposta na hora,"), G("no seu polegar.")]} inAt={t(14) + 4} outAt={t(20) - 16} />
    </AbsoluteFill>
  );
};

// 3 · Ditação: ouvir, digitar e ver a frase se montar nos blocos.
const TYPED = ["dit-0", "dit-t01", "dit-t02", "dit-t03", "dit-t04", "dit-t05", "dit-t06", "dit-t07", "dit-t08", "dit-t09", "dit-t10"];

const SceneDitacao: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const story = useStory();
  const { b, beatF } = story;
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = (n: number) => b(n) - start;
  const tapPlay = t(21);
  const typeFrom = t(23);
  const typeStep = beatF / 2;
  const tapCheck = Math.round(t(28.5));
  const sheetP = spring({ frame: f - tapCheck - 4, fps, config: { damping: 16, stiffness: 120, mass: 0.8 } });
  const exitAt = end - start - 5 - WHIP_DUR / 2;

  let src = "dit-0";
  if (f >= tapPlay + 2 && f < typeFrom) src = "dit-tocando";
  if (f >= typeFrom) src = TYPED[Math.min(TYPED.length - 1, 1 + Math.floor((f - typeFrom) / typeStep))];
  if (f >= tapCheck + 2) src = "dit-conferida";

  return (
    <AbsoluteFill>
      <Glow />
      <PhoneShot
        enter={{ dir: LEFT, dur: WHIP_DUR + 2 }}
        exitAt={exitAt}
        exit={{ dir: DOWN, dur: WHIP_DUR }}
        keys={[
          { at: 0, s: 1.04, fx: 195, fy: 420, rx: 3, ry: 6 },
          { at: t(21), s: 1.2, fx: 170, fy: 250, ay: 1000, rx: 2, ry: 5 },
          { at: t(23), s: 1.24, fx: 195, fy: 300, ay: 1010, rx: 3, ry: -2 },
          { at: t(28), s: 1.26, fx: 195, fy: 310, ay: 1010, rx: 2, ry: -8 },
          { at: t(29.5), s: 1.04, fx: 195, fy: 660, ay: 1490, rx: 3, ry: -3 },
          { at: t(32), s: 1.06, fx: 195, fy: 665, ay: 1490, rx: 2, ry: 3 },
        ]}
      >
        <Shot src={src} />
        <Tap x={META.ditPlay.x} y={META.ditPlay.y} at={tapPlay} />
        <Tap x={META.ditCheck.x} y={META.ditCheck.y} at={tapCheck} />
        <Sheet src="dit-sheet" top={META.ditSheetTop} p={sheetP} />
      </PhoneShot>
      <Caption lines={[P("Você escreve."), G("A frase se monta.")]} inAt={t(20) + 10} outAt={t(32) - 16} />
    </AbsoluteFill>
  );
};

// 4 · Shadowing no ciclo novo: primeiro ouve a frase (a palavra que a voz do
// app diz acende em lima), depois repete (as palavras ficam verdes no ritmo
// de quem fala). Telas sh-l-* (ouvir) e sh-r-* (repetir).
const pad = (k: number) => String(k).padStart(2, "0");

const SceneShadowing: React.FC<{ start: number }> = ({ start }) => {
  const { b } = useStory();
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = (n: number) => b(n) - start;
  const v = VOICE.shadowCoffee;
  const voiceAt = t(34);
  const repeatAt = t(40.5);
  const sayFrom = t(41.5);
  const sec = (f - voiceAt) / fps;
  const n = v.words.length;

  let src = "sh-l-pre";
  if (f >= repeatAt) {
    // quem repete fala um pouco mais devagar que a voz nativa
    const said = v.words.filter((w) => (f - sayFrom) / fps >= (w - v.words[0]) * 1.15 + 0.25).length;
    src = `sh-r-${pad(f < sayFrom ? 0 : said)}`;
  } else if (sec >= v.speechEnd) {
    src = `sh-l-${pad(n)}`;
  } else if (sec >= v.words[0]) {
    src = `sh-l-${pad(v.words.filter((w) => sec >= w).length - 1)}`;
  }

  return (
    <AbsoluteFill>
      <Glow />
      <PhoneShot
        enter={{ dir: { x: 0, y: -1 }, dur: WHIP_DUR + 2 }}
        keys={[
          { at: 0, s: 1.04, fx: 195, fy: 420, rx: 4, ry: -4 },
          { at: t(33.5), s: 1.22, fx: 195, fy: 360, ay: 1150, rx: 4, ry: -8 },
          { at: t(40.5), s: 1.24, fx: 195, fy: 365, ay: 1150, rx: 3, ry: 2 },
          { at: t(46.5), s: 1.26, fx: 195, fy: 368, ay: 1150, rx: 2, ry: 9 },
          { at: t(48), s: 1, fx: 195, fy: 422, rx: 0, ry: 0 },
        ]}
      >
        <Shot src={src} />
        <SoundRings x={195} y={762} from={voiceAt + Math.round(v.speechStart * fps) - 4} to={voiceAt + Math.round(v.speechEnd * fps)} r0={44} />
      </PhoneShot>
      <Caption lines={[P("Primeiro,"), G("ouça a frase.")]} inAt={t(32) + 10} outAt={repeatAt - 14} />
      <Caption lines={[P("Depois,"), G("repita em voz alta.")]} inAt={repeatAt + 2} outAt={t(48) - 16} />
    </AbsoluteFill>
  );
};

// 5 · Visão do todo: a câmera recua e as três práticas aparecem lado a lado.
const SceneMontage: React.FC<{ start: number }> = ({ start }) => {
  const { b } = useStory();
  const f = useCurrentFrame();
  const t = (n: number) => b(n) - start;
  const back = progress(f, 0, t(50), ease.inOut);
  const side = progress(f, t(48.5), t(50.5) - t(48.5), ease.out);
  const drift = interpolate(f, [0, t(56)], [0, 1]);
  const centerS = lerp(1, 0.6, back);

  const phone = (src: string, x: number, y: number, s: number, ry: number, z: number) => {
    const { w, h } = deviceSize(PHONE_W);
    return (
      <div
        style={{
          position: "absolute",
          left: x - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          zIndex: z,
          transform: `rotateY(${ry}deg) scale(${s})`,
        }}
      >
        <Phone width={PHONE_W}>
          <Shot src={src} />
        </Phone>
      </div>
    );
  };

  const off = lerp(900, 318, side);
  return (
    <AbsoluteFill>
      <Glow />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: `50% ${PHONE_Y}px` }}>
        {phone("hub-aulas", W / 2 - off - drift * 14, PHONE_Y + 40, 0.52, 24 - drift * 6, 1)}
        {phone("dit-conferida", W / 2 + off + drift * 14, PHONE_Y + 40, 0.52, -24 + drift * 6, 1)}
        {phone("sh-r-08", W / 2, PHONE_Y, centerS, lerp(0, -4, drift), 2)}
      </AbsoluteFill>
      <Caption lines={[P("Pensado para quem"), G("está chegando agora.")]} inAt={t(48) + 12} outAt={t(56) - 16} />
    </AbsoluteFill>
  );
};

// 6 · Marco: o papel claro se abre do centro com a frase de continuidade.
const SceneStatement: React.FC<{ outAt: number }> = ({ outAt }) => {
  const f = useCurrentFrame();
  const r = progress(f, 0, 26, ease.inOut) * 2400;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={W / 2} cy={PHONE_Y} r={r} fill={C.paper} />
      </svg>
      <RevealLines
        x={96}
        centerY={STAGE_Y}
        size={112}
        inAt={12}
        outAt={outAt}
        lines={[
          { text: "E a gente", color: C.ink },
          { text: "segue", color: C.ink },
          { text: "melhorando.", color: C.deep },
        ]}
      />
    </AbsoluteFill>
  );
};

// 7 · Assinatura: os balões nascem e o logo horizontal se abre. O CTA fica
// numa cartela própria, bem abaixo do logo, e aponta para o sticker de link
// do story (o GRILO é um site preparado para o celular, não um app).
const LOGO_KEY = "1-horizontal/colorida";
const LOGO = fitLogo(LOGO_KEY, W / 2, STAGE_Y - 20, 780, 560);
const SYM = logoParts[LOGO_KEY].symbol!;

const SceneEnd: React.FC<{ popR: number; restAt: number; ctaAt: number; credit?: string }> = ({ popR, restAt, ctaAt, credit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (s: number) => spring({ frame: f - s, fps, config: { damping: 11, stiffness: 150, mass: 0.7 } });
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, transform: `scale(${interpolate(f, [0, 120], [1, 1.04])})` }}>
      <LogoRest id="story-rest" logoKey={LOGO_KEY} svg={LOGO.svg} reveal={progress(f, restAt, 30, ease.out)} />
      <BrandSymbol
        id="story-sym"
        rect={LOGO.sym}
        leftColor={SYM.left.fill}
        rightColor={SYM.right.fill}
        ptColor={SYM.letters[0].fill}
        enColor={SYM.letters[1].fill}
        popL={pop(4)}
        popR={pop(popR)}
        pt={pop(14)}
        en={pop(popR + 10)}
        maskStroke={SYM.maskStroke}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: 1230,
          textAlign: "center",
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 54,
          lineHeight: "64px",
          letterSpacing: "-0.03em",
          color: C.deep,
        }}
      >
        {["Toque no link e abra o GRILO", "no navegador do celular."].map((line, i) => (
          <div key={i} style={{ overflow: "hidden", padding: "0.14em 0 0.18em", margin: "-0.14em 0 -0.18em" }}>
            <div style={{ transform: `translateY(${(1 - progress(f, ctaAt + i * 4, 22, ease.out)) * 130}%)`, color: i ? C.sage : C.deep }}>{line}</div>
          </div>
        ))}
      </div>
      {credit && (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: W,
            top: 1560,
            textAlign: "center",
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: 24,
            color: C.sage,
            opacity: progress(f, ctaAt + 10, 16),
          }}
        >
          {credit}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Filme ───────────────────────────────────────────────────────
export const StoryMobileVideo: React.FC<{ cue: Cue }> = ({ cue }) => {
  const story = useMemo(() => buildStory(cue), [cue]);
  const { b, total } = story;
  const s = (from: number, to: number) => ({ from, durationInFrames: Math.max(1, to - from) });

  const hub = s(b(0) - 2, b(8) + 5);
  const aula = s(b(8) - 5, b(20) + 5);
  const dit = s(b(20) - 5, b(32) + 5);
  const sh = s(b(32) - 5, b(48));
  const mont = s(b(48), b(56) + 26);
  const stmt = s(b(56), b(60) + 2);
  const end = s(b(60), total);

  return (
    <StoryContext.Provider value={story}>
      <AbsoluteFill style={{ backgroundColor: C.studio }}>
        <Sequence {...s(0, b(0) + 2)}>
          <Hook outAt={b(0) - 24} />
        </Sequence>
        <Sequence {...hub}>
          <SceneHub start={hub.from} end={hub.from + hub.durationInFrames} />
        </Sequence>
        <Sequence {...aula}>
          <SceneAula start={aula.from} end={aula.from + aula.durationInFrames} />
        </Sequence>
        <Sequence {...dit}>
          <SceneDitacao start={dit.from} end={dit.from + dit.durationInFrames} />
        </Sequence>
        <Sequence {...sh}>
          <SceneShadowing start={sh.from} />
        </Sequence>
        <Sequence {...mont}>
          <SceneMontage start={mont.from} />
        </Sequence>
        <Sequence {...stmt}>
          <SceneStatement outAt={b(60) - b(56) - 14} />
        </Sequence>
        <Sequence {...end}>
          <SceneEnd popR={b(61) - b(60)} restAt={b(62) - b(60)} ctaAt={b(63) - b(60)} credit={MUSIC_CREDIT[cue.id]} />
        </Sequence>
        <StorySoundtrack />
      </AbsoluteFill>
    </StoryContext.Provider>
  );
};
