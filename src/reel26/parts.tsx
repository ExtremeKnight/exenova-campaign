import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../brand";
import { prog, useLayout } from "../fx";

/** A footage clip from public/reel/clips, filling the frame with a slow push-in. */
export const Footage: React.FC<{ clip: string; zoom?: [number, number]; dur?: number; startFrom?: number; dim?: number }> = ({
  clip,
  zoom = [1.12, 1.0],
  dur = 60,
  startFrom = 0,
  dim = 0.25,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, dur], zoom, { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`reel/clips/${clip}.mp4`)}
        muted
        startFrom={startFrom}
        style={{ width: "100%", height: "100%", objectFit: "cover", scale: s }}
      />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${dim * 0.6}) 0%, transparent 35%, transparent 55%, rgba(0,0,0,${dim + 0.35}) 100%)` }} />
    </AbsoluteFill>
  );
};

/** A small artwork still as a framed card over a blurred, darkened copy of itself. */
export const StillCard: React.FC<{ src: string; dur?: number; tilt?: number }> = ({ src, dur = 60, tilt = -2 }) => {
  const frame = useCurrentFrame();
  const { u, width, height, portrait } = useLayout();
  const p = prog(frame, 0, 14);
  const drift = interpolate(frame, [0, dur], [0, -18 * u]);
  const w = portrait ? width * 0.86 : Math.min(width * 0.62, height * 1.25);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep, overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: -40 * u, width: width + 80 * u, height: height + 80 * u, objectFit: "cover", filter: `blur(${36 * u}px) brightness(0.45) saturate(1.3)` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile(src)}
          style={{
            width: w,
            borderRadius: 22 * u,
            boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.6)`,
            rotate: `${tilt * (1 - p) + tilt * 0.4}deg`,
            scale: interpolate(p, [0, 1], [1.12, 1]),
            translate: `0 ${drift}px`,
            border: `${3 * u}px solid ${C.ink}22`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Project label in the lower left: category, title and credit. */
export const WorkLabel: React.FC<{ kind: string; title: string; by: string; color?: string; start?: number }> = ({
  kind,
  title,
  by,
  color = C.accent,
  start = 6,
}) => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const p = prog(frame, start, 14);
  const q = prog(frame, start + 6, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: (portrait ? 70 : 90) * u,
        right: (portrait ? 70 : 90) * u,
        bottom: (portrait ? 330 : 80) * u,
        display: "flex",
        flexDirection: "column",
        gap: 10 * u,
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 24 * u, letterSpacing: "0.22em", textTransform: "uppercase", color, opacity: p, translate: `${(1 - p) * -24 * u}px 0` }}>
        {kind}
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: (portrait ? 64 : 58) * u,
          letterSpacing: "-0.03em",
          lineHeight: 1.02,
          color: C.ink,
          opacity: q,
          translate: `0 ${(1 - q) * 30 * u}px`,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
      >
        {title}
      </div>
      <div style={{ fontFamily: F.body, fontSize: 26 * u, color: `${C.ink}cc`, opacity: q }}>by {by}</div>
    </div>
  );
};

/** A white flash and chromatic split for the first frames after a cut. */
export const CutFlash: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4], [strength, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/** Shot counter in the top corner, e.g. 03 / 08. */
export const ShotCounter: React.FC<{ n: number; of: number; color?: string }> = ({ n, of, color = C.accent }) => {
  const { u, portrait } = useLayout();
  return (
    <div
      style={{
        position: "absolute",
        top: (portrait ? 170 : 70) * u,
        right: (portrait ? 70 : 90) * u,
        fontFamily: F.mono,
        fontSize: 24 * u,
        letterSpacing: "0.2em",
        color: C.ink,
        display: "flex",
        gap: 12 * u,
        alignItems: "center",
      }}
    >
      <span style={{ width: 10 * u, height: 10 * u, borderRadius: 99, background: color }} />
      {String(n).padStart(2, "0")} / {String(of).padStart(2, "0")}
    </div>
  );
};

/** Big centered statement words that punch in, used over footage. */
export const Punch: React.FC<{ text: string; color?: string; start?: number }> = ({ text, color = C.ink, start = 0 }) => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const p = prog(frame - start, 0, 8);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: (portrait ? 150 : 170) * u,
          letterSpacing: "-0.05em",
          lineHeight: 0.92,
          color,
          textAlign: "center",
          opacity: p,
          scale: interpolate(p, [0, 1], [1.35, 1]),
          filter: `blur(${(1 - p) * 10}px)`,
          textShadow: "0 8px 60px rgba(0,0,0,0.55)",
          padding: `0 ${60 * u}px`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
