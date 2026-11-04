import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useLayout } from "../fx";
import { ABOVE_CAPTIONS, isTall } from "../reel26/timeline";

export type ShapeKind = "circle" | "square" | "triangle";

// 100×100 outlines; pathLength=1 lets any of them "draw" with one number.
const PATHS: Record<ShapeKind, string> = {
  circle: "M50 6 A44 44 0 1 1 49.99 6 Z",
  square: "M8 8 H92 V92 H8 Z",
  triangle: "M50 6 L94 90 H6 Z",
};

/** A primitive shape, outlined (drawn 0→1) and/or filled. */
export const Shape: React.FC<{
  kind: ShapeKind;
  size: number;
  color: string;
  draw?: number;
  fill?: number;
  stroke?: number;
  style?: React.CSSProperties;
}> = ({ kind, size, color, draw = 1, fill = 0, stroke = 6, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", ...style }}>
    <path d={PATHS[kind]} fill={color} fillOpacity={fill} stroke="none" />
    <path
      d={PATHS[kind]}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
      opacity={draw > 0 ? 1 : 0}
    />
  </svg>
);

/** Absolutely centred at (x, y). */
export const At: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", ...style }}>{children}</div>
);

/**
 * The stage: the part of the frame above the caption band (and, on 9:16,
 * the TikTok/Reels buttons), so the plain and narrated cuts share a layout.
 */
export const useStage = () => {
  const l = useLayout();
  const reserve = (isTall(l.width, l.height) ? ABOVE_CAPTIONS.portrait : ABOVE_CAPTIONS.other) * l.u;
  const top = l.portrait ? 120 * l.u : 0;
  const h = l.height - reserve - top;
  return { ...l, cx: l.width / 2, cy: top + h / 2, stageH: h, reserve };
};

/** A disc that covers the frame just before a cut and uncovers just after. */
export const Wipe: React.FC<{ frame: number; at: number; color: string }> = ({ frame, at, color }) => {
  const { width, height } = useLayout();
  const d = Math.hypot(width, height) * 1.05;
  const grow = interpolate(frame, [at - 8, at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const open = interpolate(frame, [at, at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at - 8 || frame > at + 10) return null;
  const size = frame < at ? d * grow ** 2 : d;
  const hole = frame < at ? 0 : d * open ** 0.6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: height / 2,
          width: size,
          height: size,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: hole > 0 ? `radial-gradient(circle, transparent ${hole / 2 - 1}px, ${color} ${hole / 2}px)` : color,
        }}
      />
    </AbsoluteFill>
  );
};

/** A jump on landing: 1 at the beat, settling to 0 (for squash and pulses). */
export const kickAt = (frame: number, at: number, decay = 4) => (frame < at ? 0 : Math.exp(-(frame - at) / decay));
