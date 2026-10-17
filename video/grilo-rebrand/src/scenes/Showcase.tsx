import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, H, INTER, STAGE_Y, W, ease } from "../brand";
import { BrandSymbol } from "../components/BrandSymbol";
import { LogoRest } from "../components/LogoRest";
import { NOME_MASK_STROKE, SymRect, fitLogo, lerp, lerpRect, progress, symCenter } from "../geometry";
import { logoParts } from "../logoParts.generated";
import { useTimeline } from "../timeline";

type Stage = { key: string; bg: string; cy?: number; boxW?: number; boxH?: number };

// Cada logo na versão de cor feita para o fundo em que aparece.
const STAGES: Stage[] = [
  { key: "3-conversa/colorida", bg: C.paper },
  { key: "4-pingo-do-i/para-fundo-verde", bg: C.deep },
  { key: "6-nome-primeiro/para-fundo-escuro", bg: C.studio },
  { key: "7-selo/colorida", bg: C.paper },
  { key: "5-nome-no-balao/para-fundo-verde", bg: C.deep, boxW: 680, boxH: 500 },
  { key: "2-vertical/para-fundo-escuro", bg: C.studio, cy: 800, boxH: 480 },
];

const LAYOUTS = STAGES.map((s) => fitLogo(s.key, W / 2, s.cy ?? STAGE_Y, s.boxW ?? 760, s.boxH ?? 560));

type SymState = {
  rect: SymRect;
  left: string;
  right: string;
  ptC: string | null;
  enC: string | null;
  letters: number;
  nome: number;
  mask: number;
};

const STATES: SymState[] = STAGES.map((s, i) => {
  const p = logoParts[s.key];
  const sym = p.symbol;
  const hasLetters = !!sym && sym.letters.length === 2;
  return {
    rect: LAYOUTS[i].sym,
    left: p.balloons.left,
    right: p.balloons.right,
    ptC: hasLetters ? sym.letters[0].fill : null,
    enC: hasLetters ? sym.letters[1].fill : null,
    letters: hasLetters ? 1 : 0,
    nome: sym ? 0 : 1,
    mask: sym ? sym.maskStroke : NOME_MASK_STROKE,
  };
});

const mixColor = (t: number, a: string | null, b: string | null) =>
  a && b ? interpolateColors(t, [0, 1], [a, b]) : (a ?? b ?? C.ink);

// A família inteira com um único símbolo como fio condutor: ele viaja de um
// logo para o outro (vira o "o", encolhe até o pingo do i, cresce até
// carregar o nome dentro do balão), o nome de cada logo se abre a partir
// dele, e a cor de fundo muda num círculo que nasce do próprio símbolo.
export const Showcase: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tl = useTimeline();
  // T[k]: frame local em que começa a passagem para o estágio k (sempre numa batida)
  const T = tl.showcase.logoAt;
  const TRAVEL = tl.travel;
  const CTA_AT = tl.showcase.ctaAt;
  const pop = (frame: number) => spring({ frame, fps, config: { damping: 11, stiffness: 150, mass: 0.7 } });

  const k = T.filter((start, i) => i > 0 && f >= start).length;
  const tf = f - T[k];
  const A = STATES[Math.max(k - 1, 0)];
  const B = STATES[k];
  const leavingNome = k > 0 && A.nome === 1;
  const enteringNome = k > 0 && B.nome === 1;
  const travelStart = leavingNome ? 8 : 0;
  const t = k === 0 ? 1 : progress(tf, travelStart, TRAVEL, ease.inOut);

  let letters = 0;
  if (A.letters && B.letters) letters = 1;
  else if (A.letters) letters = 1 - progress(tf, 0, 8, ease.in);
  else if (B.letters) letters = pop(tf - (travelStart + TRAVEL - 6));

  let symOpacity = 1;
  if (enteringNome) symOpacity = 1 - progress(tf, TRAVEL + 4, 10);
  if (leavingNome) symOpacity = progress(tf, 0, 8);

  const rect = lerpRect(A.rect, B.rect, t);
  const center = symCenter(rect);

  const prevBg = STAGES[Math.max(k - 1, 0)].bg;
  const nextBg = STAGES[k].bg;
  const radius = k > 0 && nextBg !== prevBg ? progress(tf, travelStart + 4, 24, ease.inOut) * 2400 : 0;

  const rests: React.ReactNode[] = [];
  if (k === 0) {
    rests.push(
      <LogoRest key="r0" id="rest-0" logoKey={STAGES[0].key} svg={LAYOUTS[0].svg} reveal={progress(f, 14, 26, ease.out)} />,
    );
  } else {
    const prev = k - 1;
    if (leavingNome) {
      if (tf < 9) rests.push(<LogoRest key={`r${prev}`} id={`rest-${prev}`} logoKey={STAGES[prev].key} svg={LAYOUTS[prev].svg} reveal={1} />);
    } else {
      rests.push(
        <LogoRest
          key={`r${prev}`}
          id={`rest-${prev}`}
          logoKey={STAGES[prev].key}
          svg={LAYOUTS[prev].svg}
          reveal={1 - progress(tf, 0, 12, ease.in)}
        />,
      );
    }
    rests.push(
      <LogoRest
        key={`r${k}`}
        id={`rest-${k}`}
        logoKey={STAGES[k].key}
        svg={LAYOUTS[k].svg}
        reveal={enteringNome ? 1 : progress(tf, travelStart + 14, 26, ease.out)}
        opacity={enteringNome ? progress(tf, TRAVEL, 4) : 1}
      />,
    );
  }

  const push = interpolate(f, [0, tl.showcase.dur], [1, 1.05], { easing: Easing.out(Easing.quad) });

  const end = LAYOUTS[5].content;
  const ctaY = end.y + end.h + 110;
  const cta = progress(f, CTA_AT, 24, ease.out);
  const handle = progress(f, CTA_AT + 8, 22, ease.out);

  return (
    <AbsoluteFill style={{ backgroundColor: prevBg, transform: `scale(${push})` }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {radius > 0 && <circle cx={center.x} cy={center.y} r={radius} fill={nextBg} />}
      </svg>

      {rests}

      <BrandSymbol
        id="showcase-sym"
        rect={rect}
        leftColor={interpolateColors(t, [0, 1], [A.left, B.left])}
        rightColor={interpolateColors(t, [0, 1], [A.right, B.right])}
        ptColor={mixColor(t, A.ptC, B.ptC)}
        enColor={mixColor(t, A.enC, B.enC)}
        popL={k === 0 ? pop(f - 4) : 1}
        popR={k === 0 ? pop(f - 11) : 1}
        pt={letters}
        en={letters}
        nome={lerp(A.nome, B.nome, t)}
        maskStroke={lerp(A.mask, B.mask, t)}
        opacity={symOpacity}
      />

      {k === 5 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: ctaY, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                clipPath: `inset(0 ${(1 - cta) * 50}% 0 ${(1 - cta) * 50}% round 999px)`,
                backgroundColor: C.amber,
                color: C.studio,
                fontFamily: INTER,
                fontWeight: 700,
                fontSize: 38,
                letterSpacing: "-0.01em",
                padding: "24px 48px",
                borderRadius: 999,
              }}
            >
              Beta aberta e gratuita
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: ctaY + 132,
              textAlign: "center",
              fontFamily: INTER,
              fontWeight: 600,
              fontSize: 32,
              color: C.sageLight,
              opacity: handle,
              transform: `translateY(${(1 - handle) * 16}px)`,
            }}
          >
            @griloai
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
