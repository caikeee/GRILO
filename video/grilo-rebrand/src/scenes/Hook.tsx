import React from "react";
import { AbsoluteFill } from "remotion";
import { C, STAGE_Y } from "../brand";
import { RevealLines } from "../components/RevealLines";
import { useTimeline } from "../timeline";

// Abertura: a pergunta que todo brasileiro aprendendo inglês reconhece.
// Só tipografia, sobre o fundo escuro global; as linhas saem a tempo de o
// primeiro balão nascer na primeira batida da trilha.
export const Hook: React.FC = () => (
  <AbsoluteFill>
    <RevealLines
      x={96}
      centerY={STAGE_Y}
      size={124}
      inAt={8}
      outAt={useTimeline().hook.outAt}
      lines={[
        { text: "Misturou", color: C.paper },
        { text: "português", color: C.sage },
        { text: "no meio", color: C.paper },
        { text: "da frase?", color: C.paper },
      ]}
    />
  </AbsoluteFill>
);
