import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "./brand";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 over [start, start + dur], clamped and eased. */
export const prog = (frame: number, start: number, dur: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/**
 * Layout unit: 1u = 1px on the short side of a 1080-wide canvas, so every
 * composition (9:16, 4:5, 1:1, 16:9) scales from the same numbers.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return { u, width, height, portrait: height > width * 1.2, landscape: width > height * 1.2 };
};

export const useSpring = (delay = 0, config = { damping: 14, stiffness: 120, mass: 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

/** Drifting blueprint grid, two slow glow orbs and a vignette. */
export const Backdrop: React.FC<{ tint?: string; grid?: boolean; dark?: boolean }> = ({
  tint = C.accent,
  grid = true,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { u, width, height } = useLayout();
  const cell = 90 * u;
  const drift = (frame * 0.6 * u) % cell;
  return (
    <AbsoluteFill style={{ backgroundColor: dark ? C.paperDeep : C.paper, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100 * u,
          height: 1100 * u,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tint}55 0%, transparent 65%)`,
          left: width * 0.15 + Math.sin(frame / 50) * 160 * u - 550 * u,
          top: height * 0.25 + Math.cos(frame / 60) * 140 * u - 550 * u,
          filter: `blur(${40 * u}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900 * u,
          height: 900 * u,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.coral}33 0%, transparent 65%)`,
          left: width * 0.85 + Math.cos(frame / 45) * 140 * u - 450 * u,
          top: height * 0.8 + Math.sin(frame / 55) * 120 * u - 450 * u,
          filter: `blur(${40 * u}px)`,
        }}
      />
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${C.ink}0d 1px, transparent 1px), linear-gradient(90deg, ${C.ink}0d 1px, transparent 1px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `${drift}px ${drift}px`,
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />
      )}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Animated film grain; the noise seed changes every 2 frames. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Characters rise and un-blur one after another. */
export const SplitText: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  size: number;
  color?: string;
  font?: string;
  weight?: number;
  tracking?: number;
  style?: React.CSSProperties;
}> = ({ text, start = 0, stagger = 2, size, color = C.ink, font = F.display, weight = 700, tracking = -0.04, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: `${tracking}em`,
        color,
        display: "flex",
        flexWrap: "wrap",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {[...text].map((ch, i) => {
        const p = prog(frame, start + i * stagger, 18);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              translate: `0 ${(1 - p) * 0.55 * size}px`,
              filter: `blur(${(1 - p) * 12}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Typewriter reveal with a blinking block cursor. */
export const TypeLine: React.FC<{ text: string; start?: number; cps?: number; size: number; color?: string; cursor?: boolean }> = ({
  text,
  start = 0,
  cps = 1.4,
  size,
  color = C.amber,
  cursor = true,
}) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor((frame - start) * cps));
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{ fontFamily: F.mono, fontSize: size, color, whiteSpace: "pre" }}>
      {text.slice(0, shown)}
      {cursor && <span style={{ opacity: blink ? 1 : 0 }}>▋</span>}
    </div>
  );
};

export const Counter: React.FC<{ to: number; start: number; dur?: number; style?: React.CSSProperties; suffix?: string }> = ({
  to,
  start,
  dur = 40,
  style,
  suffix = "",
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(to * prog(frame, start, dur, EASE_IN_OUT));
  return <span style={style}>{v.toLocaleString("en-US") + suffix}</span>;
};

/** Small mono label with an accent dot, used as a scene eyebrow. */
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; start?: number }> = ({
  children,
  color = C.accent,
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const p = prog(frame, start, 16);
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 26 * u,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: p,
        translate: `${(1 - p) * -30 * u}px 0`,
        display: "flex",
        alignItems: "center",
        gap: 14 * u,
      }}
    >
      <span style={{ width: 12 * u, height: 12 * u, borderRadius: "50%", background: color }} />
      {children}
    </div>
  );
};

/** RGB-split glitch for a few frames at each listed frame (text-shadow inherits into all text). */
export const Glitch: React.FC<{ children: React.ReactNode; at: number[]; strength?: number }> = ({ children, at, strength = 14 }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const active = at.some((f) => frame >= f && frame < f + 5);
  const dx = active ? (random(`g${frame}`) - 0.5) * strength * 2 * u : 0;
  return (
    <div
      style={{
        position: "relative",
        translate: `${dx / 2}px 0`,
        textShadow: active ? `${dx}px 0 #ff2d55, ${-dx}px 0 #00e5ff` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Plays a sound effect at a frame. */
export const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.5 }) => (
  <Sequence from={at} durationInFrames={60} layout="none">
    <Audio src={src} volume={volume} />
  </Sequence>
);
