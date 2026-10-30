// The 2026 showreel, separate from the original Showreel-* (src/Showreel.tsx).
// Music is 120 BPM: 1 beat = 15 frames, 1 bar = 60 frames at 30 fps, so every
// section and most cuts start on a beat. Section boundaries match the song's
// arrangement in scripts/reel26-audio.py.
export const FPS = 30;
export const BEAT = 15;
export const BAR = 60;

export const SECTIONS = {
  intro: { from: 0, dur: 4 * BAR }, // 0–8 s: filtered intro, riser
  montage: { from: 4 * BAR, dur: 8 * BAR }, // 8–24 s: first drop, the work
  services: { from: 12 * BAR, dur: 6 * BAR }, // 24–36 s
  web: { from: 18 * BAR, dur: 4 * BAR }, // 36–44 s: breakdown, the website
  team: { from: 22 * BAR, dur: 4 * BAR }, // 44–52 s
  outro: { from: 26 * BAR, dur: 5 * BAR }, // 52–62 s: logo hit at 56 s, music fades out
} as const;

export const REEL26_FRAMES = SECTIONS.outro.from + SECTIONS.outro.dur; // 1860 = 62 s
