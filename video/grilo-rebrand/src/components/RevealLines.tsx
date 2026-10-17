import React from "react";
import { useCurrentFrame } from "remotion";
import { INTER, ease } from "../brand";
import { progress } from "../geometry";

type Line = { text: string; color: string };

type Props = {
  lines: Line[];
  x: number;
  centerY: number;
  size: number;
  inAt: number;
  outAt: number;
  stagger?: number;
};

// Cada linha sobe de trás de uma máscara e sai por cima, em cascata.
// As margens negativas abrem espaço na máscara para acentos e descendentes
// (ê, ç, p) sem mudar o espaçamento entre as linhas.
export const RevealLines: React.FC<Props> = ({ lines, x, centerY, size, inAt, outAt, stagger = 4 }) => {
  const f = useCurrentFrame();
  const top = centerY - (lines.length * size) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top,
        fontFamily: INTER,
        fontWeight: 700,
        fontSize: size,
        lineHeight: `${size}px`,
        letterSpacing: "-0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {lines.map((line, i) => {
        const pin = progress(f, inAt + i * stagger, 22, ease.out);
        const pout = progress(f, outAt + i * stagger, 14, ease.in);
        const y = (1 - pin) * 130 - pout * 130;
        return (
          <div key={i} style={{ overflow: "hidden", padding: "0.14em 0 0.18em", margin: "-0.14em 0 -0.18em" }}>
            <div style={{ transform: `translateY(${y}%)`, color: line.color }}>{line.text}</div>
          </div>
        );
      })}
    </div>
  );
};
