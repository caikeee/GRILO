import { Composition } from "remotion";
import { GriloRebrandVideo } from "./GriloRebrandVideo";
import { CUE_A, CUE_B, FPS, buildTimeline } from "./timeline";

// Duas versões do mesmo filme, cada uma montada na grade da sua trilha:
// A = pop otimista, B = bossa nova.
export const MyComposition = () => (
  <>
    {[CUE_A, CUE_B].map((cue) => (
      <Composition
        key={cue.id}
        id={`GriloRebrand-${cue.id}`}
        component={GriloRebrandVideo}
        durationInFrames={buildTimeline(cue).total}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ cue }}
      />
    ))}
  </>
);
