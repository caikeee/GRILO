import React from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { FPS, useTimeline } from "./timeline";

// Pico de cada efeito, medido no arquivo (segundos desde o início do som).
// Cada efeito é posicionado para o pico cair no quadro exato do movimento.
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

export const Soundtrack: React.FC = () => {
  const tl = useTimeline();
  const { cue, travel, hero, statement, showcase } = tl;
  const fadeFrames = cue.fadeOutSeconds * FPS;

  const hits: Hit[] = [
    // os dois balões nascendo: "pt" e, uma batida depois, "en" um tom acima
    { sfx: "pop", at: tl.pop + 2, volume: 0.5 },
    { sfx: "pop", at: hero.from + hero.popR + 2, volume: 0.5, tone: 1.12 },
    // o par desliza e o logo horizontal se abre
    { sfx: "thin", at: hero.from + hero.travelAt + travel / 2, volume: 0.45 },
    // o papel claro se abre a partir do símbolo
    { sfx: "air", at: statement.from + 13, volume: 0.4 },
    // primeiro logo da família nasce
    { sfx: "pop", at: showcase.from + 4 + 2, volume: 0.45 },
    { sfx: "pop", at: showcase.from + 11 + 2, volume: 0.45, tone: 1.12 },
  ];

  for (let k = 1; k <= 5; k++) {
    const travelStart = k === 5 ? 8 : 0; // saindo do "nome no balão" o símbolo espera o nome sumir
    const start = showcase.from + showcase.logoAt[k] + travelStart;
    hits.push({ sfx: "swoosh", at: start + travel / 2, volume: k % 2 ? 0.38 : 0.32 });
    // pt/en reaparecem no símbolo ao chegar no "nome primeiro" (k=2) e no vertical (k=5)
    if (k === 2 || k === 5) hits.push({ sfx: "pop", at: start + travel - 6 + 3, volume: 0.22, tone: 1.3 });
  }

  hits.push({ sfx: "chime", at: showcase.from + showcase.ctaAt, volume: 0.9 });

  return (
    <>
      <Html5Audio
        src={staticFile(cue.music)}
        volume={(f) =>
          cue.musicVolume *
          (fadeFrames > 0 ? interpolate(f, [tl.total - fadeFrames, tl.total - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1)
        }
      />
      {hits.map((h, i) => (
        <Sfx key={i} {...h} />
      ))}
    </>
  );
};
