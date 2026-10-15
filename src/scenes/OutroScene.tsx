import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, HANDLE, SITE } from "../brand";
import { Backdrop, Grain, TypeLine, prog, useLayout } from "../fx";

export const OutroScene: React.FC<{ cta?: string; path?: string }> = ({ cta = "Book a project", path = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const logo = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const btn = spring({ frame: frame - 34, fps, config: { damping: 12 } });
  const pulse = 1 + Math.max(0, Math.sin((frame - 60) / 6)) * 0.04 * prog(frame, 60, 4);

  return (
    <AbsoluteFill>
      <Backdrop tint={C.accent} dark />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 34 * u }}>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: (portrait ? 200 : 220) * u,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: C.ink,
            scale: interpolate(logo, [0, 1], [0.7, 1]),
            opacity: Math.min(1, logo * 1.4),
            filter: `blur(${(1 - Math.min(1, logo)) * 14}px)`,
          }}
        >
          Exenova<span style={{ color: C.coral }}>.</span>
        </div>
        <div style={{ height: 4 * u, width: 640 * u * prog(frame, 14, 22), background: `linear-gradient(90deg, ${C.accent}, ${C.coral})` }} />
        <div style={{ maxWidth: 900 * u, textAlign: "center", overflowWrap: "anywhere" }}>
          <TypeLine text={`${SITE}${path}`} start={22} cps={2.4} size={(portrait ? 34 : 32) * u} color={C.muted} cursor={frame < 70} wrap />
        </div>
        <div
          style={{
            marginTop: 20 * u,
            scale: btn * pulse,
            opacity: Math.min(1, btn),
            background: C.ink,
            color: C.paper,
            borderRadius: 999,
            padding: `${26 * u}px ${58 * u}px`,
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 46 * u,
            boxShadow: `0 0 ${70 * u}px ${C.accent}88`,
          }}
        >
          {cta} →
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 26 * u, letterSpacing: "0.2em", color: C.accent, opacity: prog(frame, 50, 16) }}>
          {HANDLE} · TIKTOK · INSTAGRAM · FACEBOOK
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
