// "In Motion" — a pure motion-graphics reel: shapes and type only, no footage.
// 120 BPM like the other reels: 1 beat = 15 frames, 1 bar = 60 frames at
// 30 fps. Sections match the song's arrangement in scripts/score.py
// (motion_song), so every hit lands on a beat.
export const FPS = 30;
export const BEAT = 15;
export const BAR = 60;

export const M = {
  open: { from: 0, dur: 3 * BAR }, // 0–6 s: a point bounces in and finds its shapes
  type: { from: 3 * BAR, dur: 4 * BAR }, // 6–14 s: "Ideas in motion", "Exenova"
  crafts: { from: 7 * BAR, dur: 5 * BAR }, // 14–24 s: one bar per craft
  process: { from: 12 * BAR, dur: 3 * BAR }, // 24–30 s: idea → launch
  outro: { from: 15 * BAR, dur: 5 * BAR }, // 30–40 s: build, logo hit on bar 16 (32 s)
} as const;

/** Frame of the logo hit, local to the outro. */
export const HIT = BAR;

export const MOTION26_FRAMES = M.outro.from + M.outro.dur; // 1200 = 40 s
