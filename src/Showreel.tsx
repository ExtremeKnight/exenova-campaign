import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { pushCut } from "@remotion/transitions/push-cut";
import { fade } from "@remotion/transitions/fade";
import { whoosh, whip, ding } from "@remotion/sfx";
import { BootScene } from "./scenes/BootScene";
import { KineticScene } from "./scenes/KineticScene";
import { ServicesScene } from "./scenes/ServicesScene";
import { SaasScene } from "./scenes/SaasScene";
import { WorkScene } from "./scenes/WorkScene";
import { ShapesScene } from "./scenes/ShapesScene";
import { TeamScene } from "./scenes/TeamScene";
import { OutroScene } from "./scenes/OutroScene";
import { Sfx } from "./fx";
import { C } from "./brand";

export const T = 15; // transition length in frames

// Scene lengths in frames. The composition length is their sum minus one
// transition per cut (both scenes play during a transition).
export const SHOWREEL_SCENES = [95, 150, 200, 240, 170, 160, 150, 120];
export const SHOWREEL_FRAMES = SHOWREEL_SCENES.reduce((a, b) => a + b, 0) - T * (SHOWREEL_SCENES.length - 1);

export const Showreel: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [boot, kinetic, services, saas, work, shapes, team, outro] = SHOWREEL_SCENES;
  // Frame where each transition starts, for the sound effects.
  const cuts = SHOWREEL_SCENES.slice(0, -1).map((_, i) => SHOWREEL_SCENES.slice(0, i + 1).reduce((a, b) => a + b, 0) - T * (i + 1));
  const sounds = [whip, whoosh, whoosh, whip, whoosh, whoosh, whoosh];

  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Boot" durationInFrames={boot}>
          <BootScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Kinetic type" durationInFrames={kinetic}>
          <KineticScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom-left" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Services" durationInFrames={services}>
          <ServicesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence name="SaaS UI" durationInFrames={saas}>
          <SaasScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence name="Work" durationInFrames={work}>
          <WorkScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={clockWipe({ width, height })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Shapes" durationInFrames={shapes}>
          <ShapesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({ width, height })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Team" durationInFrames={team}>
          <TeamScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={outro}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {cuts.map((at, i) => (
        <Sfx key={i} at={at} src={sounds[i]} volume={0.35} />
      ))}
      <Sfx at={SHOWREEL_FRAMES - outro + 34} src={ding} volume={0.3} />
    </AbsoluteFill>
  );
};
