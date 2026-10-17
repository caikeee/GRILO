import React, { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { C } from "./brand";
import { Hero } from "./scenes/Hero";
import { Hook } from "./scenes/Hook";
import { Showcase } from "./scenes/Showcase";
import { Statement } from "./scenes/Statement";
import { Soundtrack } from "./Soundtrack";
import { Cue, TimelineContext, buildTimeline } from "./timeline";

export const GriloRebrandVideo: React.FC<{ cue: Cue }> = ({ cue }) => {
  const tl = useMemo(() => buildTimeline(cue), [cue]);

  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.studio }}>
        <Sequence from={tl.hook.from} durationInFrames={tl.hook.dur}>
          <Hook />
        </Sequence>
        <Sequence from={tl.hero.from} durationInFrames={tl.hero.dur}>
          <Hero />
        </Sequence>
        <Sequence from={tl.statement.from} durationInFrames={tl.statement.dur}>
          <Statement />
        </Sequence>
        <Sequence from={tl.showcase.from} durationInFrames={tl.showcase.dur}>
          <Showcase />
        </Sequence>
        <Soundtrack />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
