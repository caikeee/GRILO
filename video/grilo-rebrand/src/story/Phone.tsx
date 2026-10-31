import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { INTER } from "../brand";
import { progress } from "../geometry";

// Tela lógica do app (as capturas são 390x844 @3x).
export const SW = 390;
export const SH = 844;
const BEZEL = 12;
const RADIUS = 56;

export const deviceSize = (width: number) => {
  const k = width / SW;
  return { k, w: width + 2 * BEZEL * k, h: SH * k + 2 * BEZEL * k };
};

// iPhone desenhado: moldura escura com fio de luz, ilha, status bar e
// barra de "home". O conteúdo trabalha em coordenadas da tela (390x844).
export const Phone: React.FC<{ width: number; children: React.ReactNode }> = ({ width, children }) => {
  const { k, w, h } = deviceSize(width);
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: (RADIUS + BEZEL) * k,
        padding: BEZEL * k,
        boxSizing: "border-box",
        background: "linear-gradient(150deg, #39443d 0%, #121815 22%, #0a0e0c 60%, #1d2621 100%)",
        boxShadow: `inset 0 0 0 ${1.2 * k}px rgba(255,255,255,0.10), 0 ${50 * k}px ${110 * k}px rgba(0,0,0,0.55)`,
      }}
    >
      <div style={{ position: "relative", width, height: SH * k, borderRadius: RADIUS * k, overflow: "hidden", background: "#f4f7f5" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${k})`, transformOrigin: "0 0" }}>
          {children}
          <StatusBar />
          <div style={{ position: "absolute", left: (SW - 124) / 2, top: 11, width: 124, height: 35, borderRadius: 18, background: "#050706" }} />
          <div style={{ position: "absolute", left: (SW - 134) / 2, bottom: 8, width: 134, height: 5, borderRadius: 3, background: "rgba(31,59,45,0.85)" }} />
        </div>
      </div>
    </div>
  );
};

const StatusBar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: 50, color: "#1f3b2d", fontFamily: INTER }}>
    <span style={{ position: "absolute", left: 44, top: 17, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>9:41</span>
    <svg width={80} height={14} viewBox="0 0 80 14" style={{ position: "absolute", right: 26, top: 20 }}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 5} y={10 - i * 3} width={3.4} height={4 + i * 3} rx={1} fill="#1f3b2d" />
      ))}
      <path d="M33 5.2a8.5 8.5 0 0112 0M35.4 7.7a5 5 0 017.2 0M37.8 10.2a1.6 1.6 0 012.4 0" fill="none" stroke="#1f3b2d" strokeWidth={1.8} strokeLinecap="round" />
      <rect x={52} y={1.5} width={23} height={11} rx={3.2} fill="none" stroke="#1f3b2d" strokeOpacity={0.45} strokeWidth={1.2} />
      <rect x={54} y={3.5} width={17} height={7} rx={1.8} fill="#1f3b2d" />
      <rect x={76.3} y={5} width={1.6} height={4} rx={0.8} fill="#1f3b2d" fillOpacity={0.45} />
    </svg>
  </div>
);

// Uma captura do app ocupando a tela inteira.
export const Shot: React.FC<{ src: string; y?: number; height?: number; opacity?: number }> = ({ src, y = 0, height = SH, opacity = 1 }) => (
  <Img src={staticFile(`story/${src}.png`)} style={{ position: "absolute", left: 0, top: -y, width: SW, height, opacity }} />
);

// O sheet do app subindo de baixo (recorte com fundo transparente).
export const Sheet: React.FC<{ src: string; top: number; p: number }> = ({ src, top, p }) => {
  if (p <= 0) return null;
  const h = SH - top;
  return (
    <Img
      src={staticFile(`story/${src}.png`)}
      style={{ position: "absolute", left: 0, top, width: SW, height: h, transform: `translateY(${(1 - p) * (h + 30)}px)` }}
    />
  );
};

// Toque do polegar: a ponta do dedo pousa e solta uma onda.
export const Tap: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const f = useCurrentFrame();
  if (f < at - 8 || f > at + 20) return null;
  const press = progress(f, at - 8, 8);
  const lift = progress(f, at + 3, 10);
  const dot = 26 * interpolate(press, [0, 1], [1.25, 1]) * (1 - lift * 0.4);
  const ring = progress(f, at, 18);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - dot,
          top: y - dot,
          width: dot * 2,
          height: dot * 2,
          borderRadius: "50%",
          background: "rgba(15,30,24,0.22)",
          border: "2.5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          opacity: press * (1 - lift),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 26 - ring * 40,
          top: y - 26 - ring * 40,
          width: (26 + ring * 40) * 2,
          height: (26 + ring * 40) * 2,
          borderRadius: "50%",
          border: "2px solid rgba(74,124,94,0.7)",
          opacity: f >= at ? 1 - ring : 0,
        }}
      />
    </>
  );
};

// Ondas saindo do botão de áudio enquanto a voz fala.
export const SoundRings: React.FC<{ x: number; y: number; from: number; to: number; r0: number }> = ({ x, y, from, to, r0 }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 22) return null;
  const rings = [0, 11];
  return (
    <>
      {rings.map((off) => {
        const local = f - from - off;
        if (local < 0) return null;
        const cycle = (local % 22) / 22;
        const alive = f - off <= to + 22 && f - (local % 22) <= to;
        if (!alive) return null;
        const r = r0 + cycle * 70;
        return (
          <div
            key={off}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: "3px solid rgba(74,124,94,0.55)",
              opacity: (1 - cycle) * 0.9,
            }}
          />
        );
      })}
    </>
  );
};
