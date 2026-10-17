import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { STAGE_Y, ease } from "../brand";
import { BrandSymbol } from "../components/BrandSymbol";
import { LogoRest } from "../components/LogoRest";
import { SymRect, fitLogo, lerpRect, progress } from "../geometry";
import { logoParts } from "../logoParts.generated";
import { Timeline, useTimeline } from "../timeline";

const KEY = "1-horizontal/para-fundo-escuro";
const SYM = logoParts[KEY].symbol!;
const BIG: SymRect = { x: 540 - 260, y: STAGE_Y - 260, size: 520 };
const LOCKUP = fitLogo(KEY, 540, STAGE_Y, 820, 600);

export const heroPush = (f: number) => interpolate(f, [0, 180], [1, 1.06]);
export const heroSymRect = (f: number, tl: Timeline) =>
  lerpRect(BIG, LOCKUP.sym, progress(f, tl.hero.travelAt, tl.travel, ease.inOut));

// A resposta à pergunta: o balão "pt" nasce na primeira batida, o "en"
// responde por cima na seguinte, e o par desliza para o lado abrindo
// espaço para o nome. É a assinatura principal (horizontal) se formando.
export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tl = useTimeline();
  const pop = (start: number) => spring({ frame: f - start, fps, config: { damping: 11, stiffness: 150, mass: 0.7 } });

  return (
    <AbsoluteFill style={{ transform: `scale(${heroPush(f)})` }}>
      <LogoRest id="hero-rest" logoKey={KEY} svg={LOCKUP.svg} reveal={progress(f, tl.hero.travelAt + 14, 30, ease.out)} />
      <BrandSymbol
        id="hero-sym"
        rect={heroSymRect(f, tl)}
        leftColor={SYM.left.fill}
        rightColor={SYM.right.fill}
        ptColor={SYM.letters[0].fill}
        enColor={SYM.letters[1].fill}
        popL={pop(4)}
        popR={pop(tl.hero.popR)}
        pt={pop(14)}
        en={pop(tl.hero.popR + 10)}
        maskStroke={SYM.maskStroke}
      />
    </AbsoluteFill>
  );
};
