// The 2026 showreel, separate from the original Showreel-* (src/Showreel.tsx).
// Music is 120 BPM: 1 beat = 15 frames, 1 bar = 60 frames at 30 fps, so every
// section and most cuts start on a beat. Section boundaries match the song's
// arrangement in scripts/reel26-audio.py.
export const FPS = 30;
export const BEAT = 15;
export const BAR = 60;

export const SECTIONS = {
  intro: { from: 0, dur: 3 * BAR }, // 0–6 s: the line, then the logo, riser
  montage: { from: 3 * BAR, dur: 5 * BAR }, // 6–16 s: first drop, the work
  services: { from: 8 * BAR, dur: 4 * BAR }, // 16–24 s
  web: { from: 12 * BAR, dur: 2 * BAR }, // 24–28 s: breakdown, the website
  team: { from: 14 * BAR, dur: 3 * BAR }, // 28–34 s
  outro: { from: 17 * BAR, dur: 3 * BAR }, // 34–40 s: logo hit at 36 s, music fades out
} as const;

// Bottom band kept free for the narrated cut's captions (and, on 9:16, the
// TikTok/Reels buttons). Labels and cards sit above it in every version, so
// both cuts share one layout.
export const CAPTION_BAND = { portrait: 300, other: 46 } as const;
export const ABOVE_CAPTIONS = { portrait: 440, other: 170 } as const;

/** 9:16 phones: the TikTok/Reels buttons cover the bottom, so keep more room there. */
export const isTall = (width: number, height: number) => height / width > 1.6;

export const REEL26_FRAMES = SECTIONS.outro.from + SECTIONS.outro.dur; // 1200 = 40 s
