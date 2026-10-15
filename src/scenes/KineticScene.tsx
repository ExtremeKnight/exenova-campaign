import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../brand";
import { Grain, useLayout } from "../fx";

// One word every 30 frames; the background flips colour on each beat.
const WORDS: { text: string; bg: string; fg: string }[] = [
  { text: "DESIGN", bg: C.paper, fg: C.ink },
  { text: "MEETS", bg: C.accent, fg: C.paperDeep },
  { text: "CODE", bg: C.paperDeep, fg: C.coral },
  { text: "MEETS", bg: C.coral, fg: C.paperDeep },
  { text: "STORY.", bg: C.ink, fg: C.paper },
];
const BEAT = 30;

export const KineticScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { u, portrait } = useLayout();
  const i = Math.min(WORDS.length - 1, Math.floor(frame / BEAT));
  const local = frame - i * BEAT;
  const w = WORDS[i];
  const s = spring({ frame: local, fps, config: { damping: 12, stiffness: 180 } });
  // Fit the word to ~88% of the width (Space Grotesk caps ≈ 0.68em wide).
  const size = Math.min((width * 0.88) / (w.text.length * 0.68), (portrait ? 330 : 300) * u);
  const stripes = 7;

  return (
    <AbsoluteFill style={{ backgroundColor: w.bg, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      {/* speed stripes sweeping across on each beat */}
      {Array.from({ length: stripes }).map((_, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(k + 0.5) * (100 / stripes)}%`,
            height: 2 * u,
            background: w.fg,
            opacity: 0.08,
            translate: `${interpolate(local, [0, BEAT], [-100, 100]) * (k % 2 ? 1 : -1)}% 0`,
          }}
        />
      ))}
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          color: w.fg,
          scale: interpolate(s, [0, 1], [1.5, 1]),
          rotate: `${interpolate(s, [0, 1], [i % 2 ? 6 : -6, 0])}deg`,
          filter: `blur(${(1 - Math.min(1, s)) * 10}px)`,
          transform: `skewX(${interpolate(local, [0, 8], [-14, 0], { extrapolateRight: "clamp" })}deg)`,
        }}
      >
        {w.text}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: (portrait ? 220 : 80) * u,
          fontFamily: F.mono,
          fontSize: 26 * u,
          letterSpacing: "0.3em",
          color: w.fg,
          opacity: 0.6,
        }}
      >
        {String(i + 1).padStart(2, "0")} / {String(WORDS.length).padStart(2, "0")}
      </div>
      <Grain opacity={0.12} />
    </AbsoluteFill>
  );
};
