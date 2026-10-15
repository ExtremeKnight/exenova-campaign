import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { whoosh, ding } from "@remotion/sfx";
import { C, MEMBERS } from "./brand";
import { Backdrop, Eyebrow, Grain, Sfx, SplitText, useLayout } from "./fx";
import { MemberSpotlight, SPOTLIGHT_COMPACT } from "./scenes/MemberSpotlight";
import { OutroScene } from "./scenes/OutroScene";

const MT = 12;
const INTRO = 70;
const OUTRO = 110;
export const MEET_FRAMES = INTRO + MEMBERS.length * SPOTLIGHT_COMPACT + OUTRO - MT * (MEMBERS.length + 1);

const Intro: React.FC = () => {
  const { u } = useLayout();
  return (
    <AbsoluteFill>
      <Backdrop tint={C.coral} />
      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${90 * u}px`, gap: 26 * u }}>
        <Eyebrow color={C.coral}>The collective</Eyebrow>
        <SplitText text="Meet the people" size={130 * u} start={4} stagger={1} />
        <SplitText text="behind the work." size={130 * u} start={16} stagger={1} color={C.coral} />
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

export const MeetTheTeam: React.FC = () => {
  const cuts = [0, ...MEMBERS.map((_, i) => i + 1)].map((k) => INTRO + k * SPOTLIGHT_COMPACT - MT * (k + 1));
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Intro" durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        {MEMBERS.flatMap((m, i) => [
          <TransitionSeries.Transition
            key={`t${m.slug}`}
            presentation={slide({ direction: i % 2 ? "from-left" : "from-right" })}
            timing={linearTiming({ durationInFrames: MT })}
          />,
          <TransitionSeries.Sequence key={m.slug} name={m.name} durationInFrames={SPOTLIGHT_COMPACT}>
            <MemberSpotlight slug={m.slug} compact />
          </TransitionSeries.Sequence>,
        ])}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: MT })} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={OUTRO}>
          <OutroScene cta="Meet the team" path="/team" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {cuts.map((at, i) => (
        <Sfx key={i} at={at} src={whoosh} volume={0.3} />
      ))}
      <Sfx at={MEET_FRAMES - OUTRO + 34} src={ding} volume={0.3} />
    </AbsoluteFill>
  );
};
