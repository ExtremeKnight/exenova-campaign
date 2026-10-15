import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SERVICES } from "../brand";
import { ServiceGlyph } from "../glyphs";
import { Backdrop, EASE_IN_OUT, Grain, prog, useLayout } from "../fx";

// 2D character animation: four glyphs drop in with squash & stretch, orbit,
// then snap into a grid as the line "Brand · Web · Film · Interactive" writes on.
const CAST = SERVICES.slice(0, 4);

export const ShapesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, width, height } = useLayout();
  const size = 190 * u;
  const cx = width / 2;
  const cy = height / 2 - (portrait ? 80 : 40) * u;
  const gridGap = (portrait ? 300 : 340) * u;
  const toGrid = prog(frame, 80, 26, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <Backdrop tint={C.moss} />
      {/* orbit ring */}
      <div
        style={{
          position: "absolute",
          left: cx - 330 * u,
          top: cy - 330 * u,
          width: 660 * u,
          height: 660 * u,
          borderRadius: "50%",
          border: `${2 * u}px dashed ${C.line}`,
          opacity: interpolate(frame, [20, 40, 80, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          rotate: `${frame * 0.6}deg`,
        }}
      />
      {/* connecting lines draw between grid slots */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {[
          [-0.5, -0.5, 0.5, -0.5],
          [0.5, -0.5, 0.5, 0.5],
          [0.5, 0.5, -0.5, 0.5],
          [-0.5, 0.5, -0.5, -0.5],
        ].map(([x1, y1, x2, y2], i) => {
          const len = gridGap;
          const p = prog(frame, 106 + i * 6, 16);
          return (
            <line
              key={i}
              x1={cx + x1 * gridGap}
              y1={cy + y1 * gridGap}
              x2={cx + x2 * gridGap}
              y2={cy + y2 * gridGap}
              stroke={C.line}
              strokeWidth={3 * u}
              strokeDasharray={len}
              strokeDashoffset={len * (1 - p)}
              opacity={0.9}
            />
          );
        })}
      </svg>
      {CAST.map((s, i) => {
        // drop: fall from above with a bounce
        const drop = spring({ frame: frame - i * 7, fps, config: { damping: 7, stiffness: 140, mass: 0.9 } });
        const fallY = interpolate(drop, [0, 1], [-height * 0.7, 0]);
        // squash on landing: brief, driven by velocity proxy
        const land = prog(frame, i * 7 + 8, 10);
        const squash = Math.sin(land * Math.PI) * 0.35;
        // orbit
        const angle = (i / CAST.length) * Math.PI * 2 + prog(frame, 30, 60, EASE_IN_OUT) * Math.PI * 1.5;
        const ox = Math.cos(angle) * 330 * u;
        const oy = Math.sin(angle) * 330 * u;
        // grid slot
        const gx = (i % 2 ? 0.5 : -0.5) * gridGap;
        const gy = (i < 2 ? -0.5 : 0.5) * gridGap;
        const x = cx + interpolate(toGrid, [0, 1], [ox, gx]);
        const y = cy + interpolate(toGrid, [0, 1], [oy, gy]) + fallY;
        const label = prog(frame, 100 + i * 5, 14);
        return (
          <div key={s.key} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size }}>
            <div
              style={{
                width: size,
                height: size,
                display: "grid",
                placeItems: "center",
                scale: `${1 + squash} ${1 - squash}`,
                transformOrigin: "50% 100%",
                rotate: `${(1 - toGrid) * frame * (i % 2 ? 2 : -2)}deg`,
                filter: `drop-shadow(0 ${16 * u}px ${30 * u}px ${s.color}66)`,
              }}
            >
              <ServiceGlyph kind={s.key} size={size * 0.82} color={s.color} />
            </div>
            <div
              style={{
                position: "absolute",
                left: -60 * u,
                right: -60 * u,
                top: size + 10 * u,
                textAlign: "center",
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 44 * u,
                color: C.ink,
                opacity: label,
                translate: `0 ${(1 - label) * 20 * u}px`,
              }}
            >
              {s.short}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: (portrait ? 260 : 70) * u,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 30 * u,
          letterSpacing: "0.3em",
          color: C.accent,
          opacity: prog(frame, 120, 16),
        }}
      >
        ONE STUDIO · FOUR WORLDS
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
