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

// Bottom band kept free for the narrated cut's captions (and, on 9:16, the
// TikTok/Reels buttons). Labels and cards sit above it in every version, so
// both cuts share one layout.
export const CAPTION_BAND = { portrait: 300, other: 46 } as const;
export const ABOVE_CAPTIONS = { portrait: 440, other: 170 } as const;

/** 9:16 phones: the TikTok/Reels buttons cover the bottom, so keep more room there. */
export const isTall = (width: number, height: number) => height / width > 1.6;

export const REEL26_FRAMES = SECTIONS.outro.from + SECTIONS.outro.dur; // 1860 = 62 s
