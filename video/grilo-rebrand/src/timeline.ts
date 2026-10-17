import { createContext, useContext } from "react";

export const FPS = 30;

// Cada versão do vídeo é amarrada à grade de batidas da sua trilha.
// bpm e firstBeat foram medidos na faixa (detecção de batidas BeatRoot +
// regressão linear; desvio mediano de 3–6 ms).
export type Cue = {
  id: string;
  music: string;
  musicVolume: number;
  bpm: number;
  firstBeat: number;
  totalSeconds: number;
  fadeOutSeconds: number;
};

export const CUE_A: Cue = {
  id: "A",
  music: "audio/music-a-friends-like-us.mp3",
  musicVolume: 0.78,
  bpm: 128.05,
  firstBeat: 3.539,
  totalSeconds: 33.3, // a faixa termina sozinha em 33,29s
  fadeOutSeconds: 0,
};

export const CUE_B: Cue = {
  id: "B",
  music: "audio/music-b-bossa-nova-summer.mp3",
  musicVolume: 0.88,
  bpm: 139.98,
  firstBeat: 3.486,
  totalSeconds: 31,
  fadeOutSeconds: 2.6,
};

// Marcos em batidas: balões na 0 e 1, logo horizontal na 4, fundo claro na
// 12, família de logos na 20 com uma troca a cada 6, CTA na 56.
export function buildTimeline(cue: Cue) {
  const beat = (n: number) => Math.round((cue.firstBeat + (n * 60) / cue.bpm) * FPS);
  const travel = beat(2) - beat(0);
  const pop = beat(0);

  const heroFrom = pop - 4;
  const heroWipeAt = beat(12) - heroFrom;
  const showcaseFrom = beat(20) - 4;
  const statementFrom = beat(12);
  const total = Math.round(cue.totalSeconds * FPS);

  return {
    cue,
    travel,
    pop,
    total,
    hook: { from: 0, dur: pop + 2, outAt: pop - 26 },
    hero: {
      from: heroFrom,
      dur: heroWipeAt + 26,
      popR: beat(1) - heroFrom,
      travelAt: beat(4) - heroFrom,
      wipeAt: heroWipeAt,
    },
    statement: {
      from: statementFrom,
      dur: showcaseFrom - statementFrom + 2,
      outAt: showcaseFrom - statementFrom - 24,
    },
    showcase: {
      from: showcaseFrom,
      dur: total - showcaseFrom,
      logoAt: [0, 1, 2, 3, 4, 5].map((k) => (k === 0 ? 0 : beat(20 + 6 * k) - showcaseFrom)),
      ctaAt: beat(56) - showcaseFrom,
    },
  };
}

export type Timeline = ReturnType<typeof buildTimeline>;

export const TimelineContext = createContext<Timeline>(buildTimeline(CUE_A));
export const useTimeline = () => useContext(TimelineContext);
