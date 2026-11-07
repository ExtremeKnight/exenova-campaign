import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { pushCut } from "@remotion/transitions/push-cut";
import { fade } from "@remotion/transitions/fade";
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
import { Captions } from "./reel26/Captions";
import type { VoiceLine } from "./reel26/voice";
import timing from "./showreel/narration-timing.json";

const VOICE: VoiceLine[] = timing.lines;

export const T = 15; // transition length in frames

// Scene lengths in frames. The composition length is their sum minus one
// transition per cut (both scenes play during a transition). All are
// multiples of 15 frames (one beat of the 120 BPM score in
// scripts/score.py), so every cut lands on a beat: 3, 6, 12.5, 20, 25.5,
// 30.5 and 35 s.
export const SHOWREEL_SCENES = [105, 105, 210, 240, 180, 165, 150, 120];
export const SHOWREEL_FRAMES = SHOWREEL_SCENES.reduce((a, b) => a + b, 0) - T * (SHOWREEL_SCENES.length - 1);

const sfx = (name: string) => staticFile(`reel/audio/sfx/${name}.mp3`);

// Frame a word is spoken, relative to its scene: what appears on screen follows
// the narration in both cuts, so re-voicing keeps them in sync.
const CUTS = SHOWREEL_SCENES.slice(0, -1).map((_, i) => SHOWREEL_SCENES.slice(0, i + 1).reduce((a, b) => a + b, 0) - T * (i + 1));
const spoken = (lineId: string, word: string, sceneCut: number) => {
  const line = VOICE.find((l) => l.id === lineId);
  const w = line?.words.find((x) => x.w.toLowerCase().startsWith(word));
  if (!line || !w) throw new Error(`No "${word}" in narration line ${lineId}`);
  return Math.round((line.at + w.t) * 30) - sceneCut;
};
const WORD_AT = VOICE.find((l) => l.id === "02")!.words.map((w) => Math.round((VOICE.find((l) => l.id === "02")!.at + w.t) * 30) - CUTS[0]);
const CARD_AT = ["brand", "web", "film", "games", "ui"].map((w) => spoken("03", w, CUTS[1]));
const TAG_AT = ["branding", "music", "web", "games", "packaging", "short"].map((w) => spoken("06", w, CUTS[3]));

export type ShowreelProps = { narration?: boolean };

/** Every sound effect, by global frame, keyed to what appears in each scene. */
function soundEffects(cuts: number[]): { at: number; name: string; volume: number }[] {
  const out: { at: number; name: string; volume: number }[] = [];
  const add = (at: number, name: string, volume: number) => out.push({ at: Math.round(at), name, volume });
  const [kinetic, services, saas, work, shapes, team, outro] = cuts;
  const into = ["glitch", "whoosh", "swipe", "whoosh", "whoosh", "whoosh", "whoosh"];
  cuts.forEach((c, i) => add(c - 3, into[i], 0.3));

  // Boot: a tick per terminal line, glitches on the logo
  for (let i = 0; i < 6; i++) add(20 + i * 6, "tick", 0.25);
  for (const f of [52, 66, 80]) add(f, "glitch", 0.25);
  add(66, "pop", 0.3);
  // Kinetic: a hit on every word
  WORD_AT.forEach((at, i) => add(kinetic + at, i === 4 ? "impact" : "pop", i === 4 ? 0.3 : 0.24));
  // Services: the headline, then a swipe per card
  add(services + 4, "tick", 0.3);
  add(services + 16, "tick", 0.3);
  CARD_AT.forEach((at) => add(services + at, "swipe", 0.3));
  // SaaS: clicks as the dashboard changes view
  for (const f of [40, 92, 108, 160, 205]) add(saas + f, "pop", 0.26);
  for (let i = 0; i < 5; i++) add(saas + 114 + i * 4, "tick", 0.15);
  // Work: shutter on the stat pill
  add(work + 40, "shutter", 0.35);
  TAG_AT.forEach((at) => add(work + at, "tick", 0.22));
  // Shapes: the cast lands, regroups into a grid, labels shimmer in
  add(shapes + 80, "whoosh", 0.22);
  add(shapes + 106, "shimmer", 0.3);
  // Team: a pop per person, then the badge
  for (let i = 0; i < 6; i++) add(team + 24 + i * 6, "pop", 0.24);
  add(team + 60, "impact", 0.2);
  // Outro: logo lands, then the button
  add(outro + 2, "shimmer", 0.35);
  add(outro + 34, "pop", 0.4);
  return out;
}

/** Song level: full on its own, dipped under each narration line. */
function songVolume(frame: number, narration: boolean) {
  const base = 0.85;
  const fadeOut = interpolate(frame, [SHOWREEL_FRAMES - 40, SHOWREEL_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (!narration) return base * fadeOut;
  let duck = 0;
  for (const l of VOICE) {
    const a = l.at * 30 - 5;
    const b = (l.at + l.dur) * 30 + 8;
    duck = Math.max(duck, interpolate(frame, [a - 6, a, b, b + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return (base - duck * 0.72) * fadeOut;
}

export const Showreel: React.FC<ShowreelProps> = ({ narration = false }) => {
  const { width, height } = useVideoConfig();
  const [boot, kinetic, services, saas, work, shapes, team, outro] = SHOWREEL_SCENES;
  // Frame where each transition starts, for the sound effects.
  const cuts = SHOWREEL_SCENES.slice(0, -1).map((_, i) => SHOWREEL_SCENES.slice(0, i + 1).reduce((a, b) => a + b, 0) - T * (i + 1));

  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Boot" durationInFrames={boot}>
          <BootScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Kinetic type" durationInFrames={kinetic}>
          <KineticScene wordAt={WORD_AT} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom-left" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence name="Services" durationInFrames={services}>
          <ServicesScene cardAt={CARD_AT} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence name="SaaS UI" durationInFrames={saas}>
          <SaasScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence name="Work" durationInFrames={work}>
          <WorkScene tagAt={TAG_AT} />
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
      {narration && <Captions lines={VOICE} />}

      <Audio src={staticFile("showreel/audio/song.mp3")} volume={(f) => songVolume(f, narration)} />
      {narration &&
        VOICE.map((l) => (
          <Sequence key={l.id} from={Math.round(l.at * 30)} layout="none">
            <Audio src={staticFile(`showreel/audio/vo/${l.id}.mp3`)} />
          </Sequence>
        ))}
      {soundEffects(cuts).map((s, i) => (
        <Sfx key={i} at={s.at} src={sfx(s.name)} volume={narration ? s.volume * 0.8 : s.volume} />
      ))}
    </AbsoluteFill>
  );
};
