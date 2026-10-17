import { Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const INTER = `${fontFamily}, sans-serif`;

// Cores oficiais do kit (grilo-logos/LEIA-ME.txt)
export const C = {
  studio: "#0F1E18",
  ink: "#1A2A22",
  deep: "#3A5E47",
  sage: "#7A9E84",
  sageLight: "#B5CDB0",
  amber: "#E6B800",
  paper: "#FBFCFB",
};

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
};

export const W = 1080;
export const H = 1920;
// Centro óptico das peças: um pouco acima do meio, longe da zona inferior
// que o Instagram cobre com legenda e botões.
export const STAGE_Y = 880;
