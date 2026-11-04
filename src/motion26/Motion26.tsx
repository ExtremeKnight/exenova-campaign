import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Sfx } from "../fx";
import { Captions } from "../reel26/Captions";
import type { VoiceLine } from "../reel26/voice";
import { Wipe } from "./kit";
import timing from "./narration-timing.json";
import { Crafts, Open, Outro, Process, Type } from "./Scenes";
import { BAR, BEAT, FPS, HIT, M, MOTION26_FRAMES } from "./timeline";

const VOICE: VoiceLine[] = timing.lines;
// Its own playful set (scripts/score.py) plus the showreel set.
const own = (n: string) => staticFile(`motion26/audio/sfx/${n}.mp3`);
const reel = (n: string) => staticFile(`reel/audio/sfx/${n}.mp3`);

export type Motion26Props = { narration: boolean };

function soundEffects(): { at: number; src: string; volume: number }[] {
  const out: { at: number; src: string; volume: number }[] = [];
  const add = (at: number, src: string, volume: number) => out.push({ at: Math.round(at), src, volume });

  // Open: the dot lands and bounces, pulses, gets pushed, draws the shapes, collapses
  add(BEAT - 2, own("drop"), 0.4);
  for (const k of [2, 3, 4]) add(k * BEAT - 1, own("boing"), 0.32 - k * 0.05);
  for (let k = 0; k < 4; k++) add(BAR + k * BEAT, own("blip"), 0.22);
  add(2 * BAR, reel("whoosh"), 0.32);
  for (let i = 0; i < 3; i++) add(2 * BAR + 6 + i * BEAT, own("click"), 0.4);
  add(3 * BAR + 30, reel("whoosh"), 0.26);

  // Type: a slam per word, a blip per letter of EXENOVA, a tick on the subtitle
  const t = M.type.from;
  for (let i = 0; i < 3; i++) add(t + i * BEAT, own("slam"), 0.32);
  add(t + 2 * BAR - 12, reel("whoosh"), 0.3);
  for (let k = 0; k < 7; k++) add(t + 2 * BAR + 6 + k * (BEAT / 2), own("blip"), 0.2);
  add(t + 2 * BAR + 6 + 4 * BEAT, reel("pop"), 0.35);
  add(t + 2 * BAR + 6 + 5 * BEAT, reel("tick"), 0.3);

  // Crafts: a swipe into each, then each icon's own beat
  const c = M.crafts.from;
  for (let k = 0; k < 5; k++) add(c + k * BAR - 2, reel("swipe"), 0.32);
  for (let i = 0; i < 3; i++) add(c + i * BEAT, reel("pop"), 0.26); // brand pieces
  add(c + 3 * BEAT, own("click"), 0.4); // ...lock together
  for (const f of [BEAT, 2 * BEAT, 3 * BEAT]) add(c + BAR + f, reel("pop"), 0.22); // web blocks
  add(c + 2 * BAR + 2 * BEAT, reel("shutter"), 0.35); // film: play
  for (let k = 0; k < 4; k++) add(c + 3 * BAR + k * BEAT + 7, own("blip"), 0.18); // game hops
  add(c + 4 * BAR + BEAT + 8, own("click"), 0.45); // ui toggle
  add(c + 4 * BAR + 3 * BEAT, reel("pop"), 0.3); // heart

  // Process: a pop per step, a whoosh on launch
  const p = M.process.from;
  for (let i = 0; i < 4; i++) add(p + BEAT + i * 3 * BEAT, reel("pop"), 0.32);
  add(p + BEAT + 9 * BEAT + 4, reel("whoosh"), 0.36);

  // Outro: the hit, shimmer, the URL
  const o = M.outro.from;
  add(o + HIT, reel("impact"), 0.32);
  add(o + HIT + 2, reel("shimmer"), 0.42);
  add(o + HIT + 2 * BAR, own("click"), 0.4);
  return out;
}

function songVolume(frame: number, narration: boolean) {
  const base = 0.85;
  const fadeOut = interpolate(frame, [MOTION26_FRAMES - 40, MOTION26_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (!narration) return base * fadeOut;
  let duck = 0;
  for (const l of VOICE) {
    const a = l.at * FPS - 5;
    const b = (l.at + l.dur) * FPS + 8;
    duck = Math.max(duck, interpolate(frame, [a - 6, a, b, b + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return (base - duck * 0.72) * fadeOut;
}

const Wipes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Wipe frame={frame} at={M.type.from} color={C.coral} />
      <Wipe frame={frame} at={M.crafts.from} color={C.accent} />
      <Wipe frame={frame} at={M.process.from} color={C.violet} />
      <Wipe frame={frame} at={M.outro.from} color={C.amber} />
    </>
  );
};

/** "In Motion": a motion-graphics reel, with or without narration and captions. */
export const Motion26: React.FC<Motion26Props> = ({ narration }) => {
  const order = [
    ["Open", M.open, Open],
    ["Type", M.type, Type],
    ["Crafts", M.crafts, Crafts],
    ["Process", M.process, Process],
    ["Outro", M.outro, Outro],
  ] as const;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      {order.map(([name, s, Scene]) => (
        <Sequence key={name} name={name} from={s.from} durationInFrames={s.dur}>
          <Scene />
        </Sequence>
      ))}
      <Wipes />
      {narration && <Captions lines={VOICE} />}

      <Audio src={staticFile("motion26/audio/song.mp3")} volume={(f) => songVolume(f, narration)} />
      {narration &&
        VOICE.map((l) => (
          <Sequence key={l.id} from={Math.round(l.at * FPS)} layout="none">
            <Audio src={staticFile(`motion26/audio/vo/${l.id}.mp3`)} />
          </Sequence>
        ))}
      {soundEffects().map((s, i) => (
        <Sfx key={i} at={s.at} src={s.src} volume={narration ? s.volume * 0.8 : s.volume} />
      ))}
    </AbsoluteFill>
  );
};
