import React from "react";
import { logoParts } from "../logoParts.generated";
import { EN_CENTER, NOME_LEFT_ADJUST, PT_CENTER, SymRect, TAIL_LEFT, TAIL_RIGHT, lerp } from "../geometry";

const GEO = logoParts["1-horizontal/colorida"].symbol!;

type Props = {
  id: string;
  rect: SymRect;
  leftColor: string;
  rightColor: string;
  ptColor: string;
  enColor: string;
  // 0 = escondido, 1 = no lugar; valores acima de 1 vêm do overshoot da mola
  popL?: number;
  popR?: number;
  pt?: number;
  en?: number;
  // 0 = proporção padrão do símbolo, 1 = proporção do "nome no balão"
  nome?: number;
  maskStroke?: number;
  opacity?: number;
};

const about = (o: readonly [number, number], inner: string) =>
  `translate(${o[0]}px, ${o[1]}px) ${inner} translate(${-o[0]}px, ${-o[1]}px)`;

const st = (transform: string): React.CSSProperties => ({
  transformBox: "view-box",
  transformOrigin: "0px 0px",
  transform,
});

// Os dois balões como peças independentes. Cada um nasce do próprio
// rabicho, como um balão de fala saindo de quem fala; a fresta entre eles
// (máscara) acompanha o balão âmbar, então só aparece quando ele chega.
export const BrandSymbol: React.FC<Props> = ({
  id,
  rect,
  leftColor,
  rightColor,
  ptColor,
  enColor,
  popL = 1,
  popR = 1,
  pt = 1,
  en = 1,
  nome = 0,
  maskStroke = 7.2,
  opacity = 1,
}) => {
  if (opacity <= 0.001) return null;

  const adjust = `translate(${NOME_LEFT_ADJUST.tx * nome}px, ${NOME_LEFT_ADJUST.ty * nome}px) scale(${lerp(1, NOME_LEFT_ADJUST.s, nome)})`;
  const leftT = `${adjust} ${about(TAIL_LEFT, `rotate(${(1 - Math.min(popL, 1)) * -18}deg) scale(${popL})`)}`;
  const rightT = about(TAIL_RIGHT, `rotate(${(1 - Math.min(popR, 1)) * 18}deg) scale(${popR})`);

  return (
    <svg
      viewBox="0 0 100 100"
      width={rect.size}
      height={rect.size}
      style={{ position: "absolute", left: rect.x, top: rect.y, overflow: "visible", opacity }}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-100} y={-100} width={300} height={300}>
          <rect x={-100} y={-100} width={300} height={300} fill="#fff" />
          <path d={GEO.right.d} fill="#000" stroke="#000" strokeWidth={maskStroke} strokeLinejoin="round" style={st(rightT)} />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <path d={GEO.left.d} fill={leftColor} style={st(leftT)} />
      </g>
      <path d={GEO.right.d} fill={rightColor} style={st(rightT)} />
      {pt > 0.001 && <path d={GEO.letters[0].d} fill={ptColor} style={st(`${leftT} ${about(PT_CENTER, `scale(${pt})`)}`)} />}
      {en > 0.001 && <path d={GEO.letters[1].d} fill={enColor} style={st(`${rightT} ${about(EN_CENTER, `scale(${en})`)}`)} />}
    </svg>
  );
};
