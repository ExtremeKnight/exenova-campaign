import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Sfx } from "../fx";
import { Captions } from "../reel26/Captions";
import type { VoiceLine } from "../reel26/voice";
import { Wipe } from "./kit";
import timing from "./narration-timing.json";
import { Crafts, Open, Outro, Process, TYPE_AT, Type } from "./Scenes";
import { BAR, BEAT, FPS, HIT, M, MOTION26_FRAMES } from "./timeline";

const VOICE: VoiceLine[] = timing.lines;
// Its own tuned kit (scripts/score.py motion26-sfx) plus a few from the showreel set.
const own = (n: string) => staticFile(`motion26/audio/sfx/${n}.mp3`);
const reel = (n: string) => staticFile(`reel/audio/sfx/${n}.mp3`);

export type Motion26Props = { narration: boolean };

function soundEffects(): { at: number; src: string; volume: number }[] {
  const out: { at: number; src: string; volume: number }[] = [];
  const add = (at: number, src: string, volume: number) => out.push({ at: Math.round(at), src, volume });
  // Notes are D minor pentatonic like the song, so runs of pops play in key.
  const pop = (n: string) => own(`pop-${n}`);
  const bell = (n: string) => own(`bell-${n}`);

  // Section wipes: the circle swells in for 8 frames, then pops open
  for (const at of [M.type.from, M.crafts.from, M.process.from, M.outro.from]) add(at - 8, own("wipe"), 0.3);

  // Open: the dot whistles down, lands with a squash on each beat, a rising note per bounce
  add(0, own("fall"), 0.14);
  [BEAT, 2 * BEAT, 3 * BEAT, BAR].forEach((at, k) => {
    add(at, own(`thud-${Math.min(2, k)}`), 0.36 - k * 0.04);
    add(at, pop(["D5", "F5", "A5", "D6"][k]), 0.22);
  });
  for (const w of VOICE[0].words) add((VOICE[0].at + w.t) * FPS - 1, own("key"), 0.16); // the hook types on
  add(BAR - 1, own("zip-up"), 0.14); // pushed off to the right
  add(BAR - 2, own("swoosh"), 0.32);
  for (let i = 0; i < 3; i++) {
    add(BAR + 6 + i * BEAT, own("draw"), 0.32); // a pen draws each shape
    add(BAR + 6 + i * BEAT, pop(["A5", "C6", "D6"][i]), 0.26);
  }
  add(2 * BAR + 30 - 6, own("suck"), 0.3); // the shapes collapse into the wipe

  // Type: rising stamps per word, the letters dance, fly apart, EXENOVA plays a run
  const t = M.type.from;
  TYPE_AT.forEach((at, i) => {
    add(t + at - 4, own("whip"), 0.26);
    add(t + at, own(`stamp-${["D3", "F3", "A3"][i]}`), 0.34);
  });
  add(t + BAR, own("wiggle"), 0.12);
  add(t + BAR + 2 * BEAT, own("wiggle"), 0.09);
  add(t + 2 * BAR - 14, own("swoosh"), 0.34);
  add(t + 2 * BAR - 12, own("whip"), 0.28);
  add(t + 2 * BAR, own("key"), 0.3); // WE ARE
  add(t + 2 * BAR + 3, own("key"), 0.24);
  ["D5", "F5", "G5", "A5", "C6", "D6", "F6"].forEach((n, k) => add(t + 2 * BAR + 6 + k * (BEAT / 2), pop(n), 0.32));
  add(t + 2 * BAR + 6 + 4 * BEAT, own("bubble"), 0.3); // the coral full stop
  add(t + 2 * BAR + 6 + 4 * BEAT, bell("A6"), 0.24);

  // Crafts: a swoosh into each, alternating sides, then each icon's own sounds
  const c = M.crafts.from;
  for (let k = 1; k < 5; k++) add(c + k * BAR - 4, own(k % 2 ? "swoosh" : "swoosh-back"), 0.34);
  // Brand: three pieces pop in, then snap together
  ["D5", "F5", "A5"].forEach((n, i) => {
    add(c + i * BEAT, own("bubble"), 0.26);
    add(c + i * BEAT, pop(n), 0.26);
  });
  add(c + 3 * BEAT + 7, own("snap"), 0.55);
  add(c + 3 * BEAT + 8, bell("D6"), 0.22);
  // Web: the browser draws, the page builds block by block as a quick run
  add(c + BAR, own("draw"), 0.3);
  [[BEAT, "G5"], [2 * BEAT, "A5"], [2 * BEAT + 4, "C6"], [3 * BEAT, "D6"], [3 * BEAT + 3, "F6"], [3 * BEAT + 6, "G6"]].forEach(([at, n]) =>
    add(c + BAR + (at as number), pop(n as string), 0.28),
  );
  // Film: the aperture whirrs open, play pops, the shutter fires
  add(c + 2 * BAR, own("whirr"), 0.4);
  add(c + 2 * BAR + 2 * BEAT, pop("D6"), 0.3);
  add(c + 2 * BAR + 2 * BEAT, reel("shutter"), 0.3);
  // Interactive: a chiptune jump per hop, a coin per life
  for (let k = 0; k < 4; k++) add(c + 3 * BAR + k * BEAT, own("chip-jump"), 0.1);
  add(c + 3 * BAR + 23, own("chip-coin"), 0.1);
  add(c + 3 * BAR + 45, own("chip-coin"), 0.1);
  // UI/UX: the cursor glides, clicks the toggle, a heart pops with a sparkle
  add(c + 4 * BAR + 2, own("swoosh-back"), 0.14);
  add(c + 4 * BAR + BEAT + 6, own("toggle"), 0.42);
  add(c + 4 * BAR + BEAT + 8, pop("A5"), 0.2);
  add(c + 4 * BAR + 3 * BEAT, pop("D6"), 0.3);
  add(c + 4 * BAR + 3 * BEAT, own("sparkle"), 0.32);

  // Process: the heading types, each step rings a step higher, launch takes off
  const p = M.process.from;
  for (let k = 0; k < 3; k++) add(p + 2 + k * 3, own("key"), 0.2);
  ["D6", "F6", "A6", "D7"].forEach((n, i) => {
    add(p + BEAT + i * 3 * BEAT, own("bubble"), 0.24);
    add(p + BEAT + i * 3 * BEAT, bell(n), 0.28);
  });
  add(p + BEAT + 9 * BEAT + 2, own("rocket"), 0.5);

  // Outro: the point swells and pulls everything in, the hit, sparkle, the URL
  const o = M.outro.from;
  add(o + HIT - 36, own("suck"), 0.42);
  add(o + HIT, reel("impact"), 0.08); // the song carries the boom
  add(o + HIT + 3, own("sparkle"), 0.38);
  add(o + HIT + 2, reel("shimmer"), 0.3);
  add(o + HIT + 1, own("swoosh"), 0.22); // the shapes burst out
  add(o + HIT + 2 * BAR, pop("D6"), 0.32);
  add(o + HIT + 2 * BAR, own("bubble"), 0.26);
  add(o + HIT + 2 * BAR + 2, bell("A6"), 0.18);
  for (let k = 0; k < 4; k++) add(o + HIT + 2 * BAR + 8 + k * 3, own("key"), 0.16);
  return out;
}

function songVolume(frame: number, narration: boolean) {
  const base = 0.76; // a touch under full so the sound effects sit on top without clipping
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
        <Sfx key={i} at={s.at} src={s.src} volume={narration ? s.volume * 0.75 : s.volume} />
      ))}
    </AbsoluteFill>
  );
};
