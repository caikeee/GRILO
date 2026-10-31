import React from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { FPS } from "../timeline";
import { VOICE, useStory } from "./storyTimeline";

// Pico de cada efeito (s desde o início do arquivo), medido no vídeo de
// lançamento: o efeito é posicionado para o pico cair no quadro do movimento.
const SFX = {
  pop: { src: "audio/sfx-pop.mp3", peak: 0.17 },
  swoosh: { src: "audio/sfx-swoosh.mp3", peak: 0.5 },
  thin: { src: "audio/sfx-swoosh-thin.mp3", peak: 0.58 },
  air: { src: "audio/sfx-swoosh-air.mp3", peak: 0.87 },
  chime: { src: "audio/sfx-chime.mp3", peak: 0.07 },
};

type Hit = { sfx: keyof typeof SFX; at: number; volume: number; tone?: number };

const Sfx: React.FC<Hit> = ({ sfx, at, volume, tone }) => {
  const s = SFX[sfx];
  const from = Math.max(0, Math.round(at - s.peak * FPS));
  return (
    <Sequence from={from} durationInFrames={4 * FPS} layout="none">
      <Html5Audio src={staticFile(s.src)} volume={volume} toneFrequency={tone} />
    </Sequence>
  );
};

const DUCK = 0.28;   // trilha enquanto a voz do app fala
const RAMP = 6;      // quadros de rampa do ducking

export const StorySoundtrack: React.FC = () => {
  const { cue, b, total } = useStory();
  const fade = cue.fadeOutSeconds * FPS;

  // A voz real do app: "Good morning! How are you?" no toque do botão da
  // aula, "My name is Ana." no "Ouvir" da ditação e a frase do shadowing
  // que a pessoa ouve antes de repetir.
  const voices = [
    { ...VOICE.goodMorning, at: b(9) + 4 },
    { ...VOICE.myNameIsAna, at: b(21) + 3 },
    { ...VOICE.shadowCoffee, at: b(34) },
  ];
  const windows = voices.map((v) => [v.at + v.speechStart * FPS - 4, v.at + v.speechEnd * FPS + 4]);

  const duck = (f: number) =>
    windows.reduce((m, [a, z]) => {
      const d = interpolate(f, [a - RAMP, a, z, z + RAMP * 2], [1, DUCK, DUCK, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return Math.min(m, d);
    }, 1);

  const half = (n: number) => Math.round(b(n));
  const hits: Hit[] = [
    // o celular sobe com o hub
    { sfx: "air", at: b(0) + 12, volume: 0.38 },
    // toques do polegar
    { sfx: "pop", at: b(7), volume: 0.32 },
    { sfx: "pop", at: b(9), volume: 0.28 },
    { sfx: "pop", at: b(15), volume: 0.34 },
    { sfx: "pop", at: b(21), volume: 0.28 },
    { sfx: "pop", at: half(28.5), volume: 0.34 },
    // sheets subindo
    { sfx: "thin", at: b(15) + 10, volume: 0.3 },
    { sfx: "thin", at: half(28.5) + 10, volume: 0.3 },
    // whip pans entre as práticas
    { sfx: "swoosh", at: b(8), volume: 0.4 },
    { sfx: "swoosh", at: b(20), volume: 0.36 },
    { sfx: "swoosh", at: b(32), volume: 0.4 },
    // shadowing: vira a vez de quem aprende repetir
    { sfx: "thin", at: b(40.5), volume: 0.28 },
    // recuo para os três celulares e papel claro
    { sfx: "air", at: b(48) + 10, volume: 0.32 },
    { sfx: "air", at: b(56) + 13, volume: 0.36 },
    // balões do logo e o nome se abrindo
    { sfx: "pop", at: b(60) + 6, volume: 0.45 },
    { sfx: "pop", at: b(61) + 2, volume: 0.45, tone: 1.12 },
    { sfx: "chime", at: b(62), volume: 0.85 },
  ];

  return (
    <>
      <Html5Audio
        src={staticFile(cue.music)}
        trimBefore={Math.round((cue.trimSeconds ?? 0) * FPS)}
        volume={(f) =>
          cue.musicVolume *
          duck(f) *
          (cue.trimSeconds ? interpolate(f, [0, 6], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1) *
          (fade > 0 ? interpolate(f, [total - fade, total - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1)
        }
      />
      {voices.map((v, i) => (
        <Sequence key={i} from={v.at} durationInFrames={Math.ceil(v.dur * FPS) + 2} layout="none">
          <Html5Audio src={staticFile(v.src)} volume={v.volume} />
        </Sequence>
      ))}
      {hits.map((h, i) => (
        <Sfx key={i} {...h} />
      ))}
    </>
  );
};
