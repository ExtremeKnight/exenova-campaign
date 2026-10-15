import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, TEAM } from "../brand";
import { Backdrop, Eyebrow, Grain, SplitText, prog, useLayout } from "../fx";

// Avatars pop into a ring, links draw between them, and an empty "you?" seat pulses.
export const TeamScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, width, height } = useLayout();
  const cx = portrait ? width / 2 : width * 0.68;
  const cy = portrait ? height * 0.6 : height / 2;
  const R = (portrait ? 300 : 300) * u;
  const nodes = [...TEAM, { initials: "+YOU", role: "We're hiring" }];
  const pos = nodes.map((_, i) => {
    const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });
  const av = 150 * u;

  return (
    <AbsoluteFill>
      <Backdrop tint={C.coral} />
      <div
        style={{
          position: "absolute",
          left: portrait ? 90 * u : 110 * u,
          right: portrait ? 90 * u : width * 0.45,
          top: portrait ? 200 * u : height * 0.3,
          display: "flex",
          flexDirection: "column",
          gap: 24 * u,
        }}
      >
        <Eyebrow color={C.coral}>The collective</Eyebrow>
        <SplitText text="Artists, developers" size={(portrait ? 92 : 84) * u} start={4} stagger={1} />
        <SplitText text="& storytellers." size={(portrait ? 92 : 84) * u} start={14} stagger={1} color={C.coral} />
      </div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {pos.map((p, i) => {
          const q = pos[(i + 1) % pos.length];
          const len = Math.hypot(q.x - p.x, q.y - p.y);
          const d = prog(frame, 40 + i * 5, 18);
          return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.line} strokeWidth={3 * u} strokeDasharray={len} strokeDashoffset={len * (1 - d)} />;
        })}
        {pos.map((p, i) =>
          i % 2 === 0 ? (
            <line
              key={`c${i}`}
              x1={p.x}
              y1={p.y}
              x2={cx}
              y2={cy}
              stroke={C.accent}
              strokeOpacity={0.35}
              strokeWidth={2 * u}
              strokeDasharray={R}
              strokeDashoffset={R * (1 - prog(frame, 70 + i * 4, 18))}
            />
          ) : null,
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx - 70 * u,
          top: cy - 70 * u,
          width: 140 * u,
          height: 140 * u,
          borderRadius: "50%",
          background: C.ink,
          display: "grid",
          placeItems: "center",
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 34 * u,
          color: C.paper,
          scale: spring({ frame: frame - 60, fps, config: { damping: 12 } }),
        }}
      >
        EXN<span style={{ color: C.coral }}>.</span>
      </div>
      {nodes.map((n, i) => {
        const pop = spring({ frame: frame - 24 - i * 6, fps, config: { damping: 10, stiffness: 150 } });
        const isYou = i === nodes.length - 1;
        const pulse = isYou ? 1 + Math.sin(frame / 5) * 0.05 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos[i].x - av / 2,
              top: pos[i].y - av / 2,
              width: av,
              height: av,
              borderRadius: 36 * u,
              background: isYou ? "transparent" : C.surface,
              border: `${3 * u}px ${isYou ? "dashed" : "solid"} ${isYou ? C.coral : C.line}`,
              display: "grid",
              placeItems: "center",
              scale: pop * pulse,
              opacity: Math.min(1, pop),
            }}
          >
            <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: (isYou ? 34 : 50) * u, color: isYou ? C.coral : C.accent }}>{n.initials}</span>
            <span
              style={{
                position: "absolute",
                top: av + 8 * u,
                whiteSpace: "nowrap",
                fontFamily: F.mono,
                fontSize: 20 * u,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: isYou ? C.coral : C.muted,
              }}
            >
              {n.role}
            </span>
          </div>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};
