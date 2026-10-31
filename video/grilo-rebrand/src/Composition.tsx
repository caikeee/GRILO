import { Composition } from "remotion";
import { GriloRebrandVideo } from "./GriloRebrandVideo";
import { StoryMobileVideo } from "./story/StoryMobile";
import { buildStory } from "./story/storyTimeline";
import { CUE_A, CUE_B, CUE_E, FPS, buildTimeline } from "./timeline";

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
    {/* Story do redesenho mobile (video/ROTEIRO-story-mobile.md), versão final
        com "Samba Isobel". As versões A–D (outras trilhas) ficaram em out/ e
        usavam o shadowing antigo, de 12 batidas. */}
    {[CUE_E].map((cue) => (
      <Composition
        key={`story-${cue.id}`}
        id={`StoryMobile-${cue.id}`}
        component={StoryMobileVideo}
        durationInFrames={buildStory(cue).total}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ cue }}
      />
    ))}
  </>
);
