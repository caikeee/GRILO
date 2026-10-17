import { interpolate } from "remotion";
import { logoParts } from "./logoParts.generated";

export type SymRect = { x: number; y: number; size: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const progress = (f: number, start: number, dur: number, easing?: (t: number) => number) =>
  interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpRect = (a: SymRect, b: SymRect, t: number): SymRect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  size: lerp(a.size, b.size, t),
});

// Pontos do símbolo no espaço 0-100 (iguais em todos os logos do kit)
export const TAIL_LEFT = [16.9, 60.6] as const;
export const TAIL_RIGHT = [84.3, 81.4] as const;
export const PT_CENTER = [29.7, 36.9] as const;
export const EN_CENTER = [61.8, 53.0] as const;
export const SYMBOL_VISUAL_CENTER = [51, 50.5] as const;

// No "nome no balão" os balões são maiores e mais afastados. Mapeamento
// medido a partir dos paths do SVG: balão âmbar = 2x o padrão deslocado
// (4,-34); balão sálvia = 1.8x deslocado (-1.21,-18.19), o que no espaço do
// símbolo vira escala 0.9 + translação (-2.605, 7.905).
export const NOME_LEFT_ADJUST = { s: 0.9, tx: -2.605, ty: 7.905 };
export const NOME_MASK_STROKE = 6;

// Enquadra pelo desenho real (box), não pelo viewBox do arquivo.
export function fitLogo(key: string, cx: number, cy: number, boxW: number, boxH: number) {
  const { vb, box, symbol } = logoParts[key];
  const k = Math.min(boxW / (box[2] - box[0]), boxH / (box[3] - box[1]));
  const svg = {
    x: cx - ((box[0] + box[2]) / 2 - vb[0]) * k,
    y: cy - ((box[1] + box[3]) / 2 - vb[1]) * k,
    w: vb[2] * k,
    h: vb[3] * k,
  };

  let sym: SymRect;
  if (symbol) {
    sym = { x: svg.x + (symbol.tx - vb[0]) * k, y: svg.y + (symbol.ty - vb[1]) * k, size: 100 * symbol.s * k };
  } else {
    // posição do símbolo que coincide com os balões do "nome no balão"
    sym = { x: svg.x + 4 * k, y: svg.y - 34 * k, size: 200 * k };
  }
  const content = {
    x: svg.x + (box[0] - vb[0]) * k,
    y: svg.y + (box[1] - vb[1]) * k,
    w: (box[2] - box[0]) * k,
    h: (box[3] - box[1]) * k,
  };
  return { svg, sym, content, k };
}

export const symCenter = (r: SymRect) => ({
  x: r.x + (SYMBOL_VISUAL_CENTER[0] / 100) * r.size,
  y: r.y + (SYMBOL_VISUAL_CENTER[1] / 100) * r.size,
});
