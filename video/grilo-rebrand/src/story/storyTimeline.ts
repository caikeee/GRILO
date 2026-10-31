import { createContext, useContext } from "react";
import { Cue, FPS } from "../timeline";

// Story "O GRILO no seu celular" — roteiro em video/ROTEIRO-story-mobile.md.
// Tudo é marcado em batidas (b(0) = primeira batida). Com cue.refBpm, os
// marcos seguem esse andamento e caem na colcheia mais próxima da trilha.
export function buildStory(cue: Cue) {
  const refBeat = 60 / (cue.refBpm ?? cue.bpm);
  const eighth = 60 / cue.bpm / 2;
  const beatF = refBeat * FPS;
  const b = (n: number) => {
    const t = cue.firstBeat + n * refBeat;
    const snapped = cue.refBpm ? cue.firstBeat + Math.round((t - cue.firstBeat) / eighth) * eighth : t;
    return Math.round(snapped * FPS);
  };
  const total = Math.round(cue.totalSeconds * FPS);
  return { cue, b, beatF, total };
}

export type Story = ReturnType<typeof buildStory>;

export const StoryContext = createContext<Story | null>(null);
export const useStory = () => useContext(StoryContext)!;

// Posições medidas nas capturas (public/story/meta.json), em px da tela 390x844.
export const META = {
  hubTap: { x: 195, y: 386 },
  aulaPlay: { x: 195, y: 194 },
  aulaTap: { x: 160, y: 361 },
  aulaSheetTop: 596,
  ditPlay: { x: 76, y: 192 },
  ditCheck: { x: 251, y: 787 },
  ditSheetTop: 620,
};

// A voz real do app (Groq Orpheus "troy", o mesmo modelo/voz dos MP3 de
// frontend/assets/audio), normalizada para o mesmo nível (RMS ≈ -19 dB) e
// salva em WAV. speechStart/End: onde a fala começa e termina no arquivo;
// words: início de cada palavra (medido pelos vales de energia da fala).
export const VOICE = {
  goodMorning: { src: "audio/voz-good-morning.wav", speechStart: 0.3, speechEnd: 1.56, dur: 1.92, volume: 1 },
  myNameIsAna: { src: "audio/voz-my-name-is-ana.wav", speechStart: 0.17, speechEnd: 1.81, dur: 2.24, volume: 1 },
  shadowCoffee: {
    src: "audio/voz-shadow-coffee.wav",
    speechStart: 0.23,
    speechEnd: 3.03,
    dur: 3.2,
    volume: 1,
    // I · get · the · same · coffee · every · single · day.
    words: [0.23, 0.38, 0.59, 0.69, 0.85, 1.2, 1.74, 2.3],
  },
};
