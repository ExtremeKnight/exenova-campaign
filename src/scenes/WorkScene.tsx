import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, PROJECTS } from "../brand";
import { Backdrop, Counter, Grain, prog, useLayout } from "../fx";

const TAGS = ["Branding", "Music videos", "Web apps", "Games", "Packaging", "Short films"];

// Rows of project names scroll in opposite directions; a stat pill and tags pop on top.
export const WorkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, width } = useLayout();
  const rows = portrait ? 6 : 4;
  const size = (portrait ? 132 : 120) * u;
  const pill = spring({ frame: frame - 40, fps, config: { damping: 13 } });

  return (
    <AbsoluteFill>
      <Backdrop tint={C.coral} grid={false} dark />
      <AbsoluteFill style={{ justifyContent: "center", gap: 12 * u, rotate: "-6deg", scale: 1.15 }}>
        {Array.from({ length: rows }).map((_, r) => {
          const dir = r % 2 ? 1 : -1;
          const offset = ((frame * (5 + r) * u * dir) % (width * 2)) - (dir > 0 ? width * 2 : 0);
          const names = [...PROJECTS.slice(r * 2), ...PROJECTS, ...PROJECTS];
          return (
            <div key={r} style={{ display: "flex", gap: 50 * u, whiteSpace: "nowrap", translate: `${offset}px 0`, opacity: prog(frame, r * 4, 14) }}>
              {names.map((n, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: size,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    color: (i + r) % 3 === 0 ? C.ink : "transparent",
                    WebkitTextStroke: (i + r) % 3 === 0 ? undefined : `${2 * u}px ${(i + r) % 3 === 1 ? C.accent : C.muted}`,
                  }}
                >
                  {n} <span style={{ color: C.coral, WebkitTextStroke: "0" }}>✦</span>
                </span>
              ))}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${C.paperDeep}ee 25%, transparent 70%)` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 28 * u }}>
        <div
          style={{
            scale: pill,
            opacity: Math.min(1, pill),
            background: C.ink,
            color: C.paper,
            borderRadius: 999,
            padding: `${28 * u}px ${56 * u}px`,
            display: "flex",
            alignItems: "baseline",
            gap: 18 * u,
            boxShadow: `0 0 ${80 * u}px ${C.accent}66`,
          }}
        >
          <Counter to={12} start={44} dur={36} suffix="+" style={{ fontFamily: F.display, fontWeight: 700, fontSize: 110 * u, letterSpacing: "-0.04em" }} />
          <span style={{ fontFamily: F.display, fontWeight: 500, fontSize: 46 * u }}>projects shipped</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 * u, maxWidth: 900 * u }}>
          {TAGS.map((t, i) => {
            const p = spring({ frame: frame - 70 - i * 6, fps, config: { damping: 11 } });
            return (
              <span
                key={t}
                style={{
                  scale: p,
                  opacity: Math.min(1, p),
                  border: `${2 * u}px solid ${C.ink}`,
                  borderRadius: 999,
                  padding: `${10 * u}px ${26 * u}px`,
                  fontFamily: F.display,
                  fontWeight: 500,
                  fontSize: 32 * u,
                  color: C.ink,
                  background: C.paperDeep,
                }}
              >
                {t}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
