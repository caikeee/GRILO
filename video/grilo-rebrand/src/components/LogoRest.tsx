import React from "react";
import { logoParts } from "../logoParts.generated";
import { SYMBOL_VISUAL_CENTER, lerp } from "../geometry";

type Props = {
  id: string;
  logoKey: string;
  svg: { x: number; y: number; w: number; h: number };
  reveal: number;
  opacity?: number;
};

// Tudo do logo que não é o símbolo (nome, descritor, pílula do selo).
// Revela por um corte que se abre a partir do centro do símbolo, então o
// nome parece sair dos balões em vez de surgir do nada.
export const LogoRest: React.FC<Props> = ({ id, logoKey, svg, reveal, opacity = 1 }) => {
  if (reveal <= 0.001 || opacity <= 0.001) return null;

  const { vb, symbol, rest } = logoParts[logoKey];
  const origin = symbol ? symbol.tx + SYMBOL_VISUAL_CENTER[0] * symbol.s : vb[0] + vb[2] / 2;
  const left = lerp(origin, vb[0] - 20, reveal);
  const right = lerp(origin, vb[0] + vb[2] + 20, reveal);

  return (
    <svg
      viewBox={vb.join(" ")}
      width={svg.w}
      height={svg.h}
      style={{ position: "absolute", left: svg.x, top: svg.y, overflow: "visible", opacity }}
    >
      <defs>
        <clipPath id={id}>
          <rect x={left} y={vb[1] - 40} width={right - left} height={vb[3] + 80} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} dangerouslySetInnerHTML={{ __html: rest }} />
    </svg>
  );
};
