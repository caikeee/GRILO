import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, H, STAGE_Y, W, ease } from "../brand";
import { RevealLines } from "../components/RevealLines";
import { progress, symCenter } from "../geometry";
import { useTimeline } from "../timeline";
import { heroPush, heroSymRect } from "./Hero";

// O papel claro se abre a partir do símbolo da cena anterior e traz a
// frase-tese da nova identidade.
export const Statement: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();

  const c = symCenter(heroSymRect(tl.hero.wipeAt, tl));
  const push = heroPush(tl.hero.wipeAt);
  const cx = W / 2 + (c.x - W / 2) * push;
  const cy = H / 2 + (c.y - H / 2) * push;
  const r = progress(f, 0, 26, ease.inOut) * 2400;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill={C.paper} />
      </svg>
      <RevealLines
        x={96}
        centerY={STAGE_Y}
        size={124}
        inAt={12}
        outAt={tl.statement.outAt}
        lines={[
          { text: "Cara nova.", color: C.ink },
          { text: "Mesma", color: C.ink },
          { text: "conversa.", color: C.deep },
        ]}
      />
    </AbsoluteFill>
  );
};
