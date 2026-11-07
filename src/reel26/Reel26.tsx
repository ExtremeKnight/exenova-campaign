import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
} from "remotion";
import { C } from "../brand";
import { Sfx } from "../fx";
import { Captions } from "./Captions";
import { Intro } from "./Intro";
import { MONTAGE, Montage } from "./Montage";
import { Outro } from "./Outro";
import { Services } from "./Services";
import { Team } from "./Team";
import { Web } from "./Web";
import { BAR, BEAT, FPS, REEL26_FRAMES, SECTIONS } from "./timeline";
import { VOICE, lineFrame, wordFrame } from "./voice";

export type Reel26Props = { narration: boolean };

const sfx = (name: string) => staticFile(`reel/audio/sfx/${name}.mp3`);

// Every sound effect, by global frame. The song itself carries the risers and
// the impacts on each section's downbeat (scripts/reel26-audio.py).
function soundEffects(): { at: number; name: string; volume: number }[] {
  const out: { at: number; name: string; volume: number }[] = [];
  const add = (at: number, name: string, volume: number) =>
    out.push({ at: Math.round(at), name, volume });

  // Intro: a tick under each word of the opening line, glitches, shimmer on the logo
  for (let i = 0; i < 5; i++) add(BEAT + i * BEAT, "tick", 0.35);
  add(88, "glitch", 0.4);
  add(100, "glitch", 0.3);
  add(118, "whoosh", 0.3);
  add(122, "shimmer", 0.35);
  for (const f of [150, 196, 226]) add(f, "glitch", 0.22);

  // Montage: a whoosh into every shot, a swipe on second angles, a shutter on artwork
  MONTAGE.forEach((shot, i) => {
    const at = SECTIONS.montage.from + i * BAR;
    if (i > 0) add(at - 4, "whoosh", 0.32);
    if (shot.then) add(at + BAR / 2, "swipe", 0.3);
    if (shot.still) add(at + 2, "shutter", 0.35);
    if (shot.punch) add(at + 2, "pop", 0.3);
  });

  // Services: swipe per panel, shimmer as the five marks merge
  add(SECTIONS.services.from - 4, "whoosh", 0.3);
  for (let i = 0; i < 5; i++)
    add(SECTIONS.services.from + 30 + i * 3 * BEAT, "swipe", 0.34);
  add(SECTIONS.services.from + 30 + 15 * BEAT + 56, "shimmer", 0.3);

  // Web: soft whoosh in, a pop for each feature chip as it's said
  add(SECTIONS.web.from - 4, "whoosh", 0.22);
  for (const w of ["fast", "accessible", "easy"])
    add(wordFrame("07", w), "pop", 0.4);

  // Team: a pop as each portrait appears
  add(SECTIONS.team.from - 4, "whoosh", 0.28);
  for (const n of ["Shan", "Justine", "Rei", "Orlando"])
    add(wordFrame("08", n), "pop", 0.42);

  // Outro: ticks on the tagline, impact + shimmer on the logo hit
  for (const w of ["Design", "code", "story"])
    add(wordFrame("09", w), "tick", 0.32);
  add(SECTIONS.outro.from + 4 * FPS, "impact", 0.3);
  add(SECTIONS.outro.from + 4 * FPS + 2, "shimmer", 0.4);
  return out;
}

/** Song level: full on its own, dipped under each narration line. */
function songVolume(frame: number, narration: boolean) {
  const base = 0.85;
  const fadeOut = interpolate(
    frame,
    [REEL26_FRAMES - 45, REEL26_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (!narration) return base * fadeOut;
  let duck = 0;
  for (const l of VOICE) {
    const a = l.at * FPS - 5;
    const b = (l.at + l.dur) * FPS + 8;
    duck = Math.max(
      duck,
      interpolate(frame, [a - 6, a, b, b + 10], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
  }
  // About -16 dB under the voice, so the narration sits ~10 dB above the music.
  return (base - duck * 0.72) * fadeOut;
}

export const Reel26: React.FC<Reel26Props> = ({ narration }) => {
  const order = [
    ["Intro", SECTIONS.intro, Intro],
    ["Montage", SECTIONS.montage, Montage],
    ["Services", SECTIONS.services, Services],
    ["Web", SECTIONS.web, Web],
    ["Team", SECTIONS.team, Team],
    ["Outro", SECTIONS.outro, Outro],
  ] as const;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      {order.map(([name, s, Scene]) => (
        <Sequence key={name} name={name} from={s.from} durationInFrames={s.dur}>
          <Scene />
        </Sequence>
      ))}

      {narration && <Captions />}

      <Audio
        src={staticFile("reel/audio/song.mp3")}
        volume={(f) => songVolume(f, narration)}
      />
      {narration &&
        VOICE.map((l) => (
          <Sequence key={l.id} from={lineFrame(l)} layout="none">
            <Audio src={staticFile(`reel/audio/vo/${l.id}.mp3`)} volume={1} />
          </Sequence>
        ))}
      {soundEffects().map((s, i) => (
        <Sfx
          key={i}
          at={s.at}
          src={sfx(s.name)}
          volume={narration ? s.volume * 0.8 : s.volume}
        />
      ))}
    </AbsoluteFill>
  );
};
