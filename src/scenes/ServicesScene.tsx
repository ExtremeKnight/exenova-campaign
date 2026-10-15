import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SERVICES } from "../brand";
import { ServiceGlyph } from "../glyphs";
import { Backdrop, Eyebrow, Grain, SplitText, prog, useLayout } from "../fx";

// Heading 0–40, then a service card every 26 frames; cards fly in with a 3D swing.
export const ServicesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const cardW = portrait ? 900 * u : 560 * u;

  return (
    <AbsoluteFill>
      <Backdrop tint={C.accent} />
      <AbsoluteFill
        style={{
          padding: portrait ? `${200 * u}px ${90 * u}px` : `${90 * u}px ${110 * u}px`,
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          gap: (portrait ? 60 : 90) * u,
          alignItems: portrait ? "stretch" : "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 * u, flex: portrait ? undefined : 1 }}>
          <Eyebrow>What we make</Eyebrow>
          <SplitText text="One team." size={(portrait ? 120 : 130) * u} start={4} stagger={2} />
          <SplitText text="Every craft." size={(portrait ? 120 : 130) * u} start={16} stagger={2} color={C.accent} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 * u, perspective: 1600 * u }}>
          {SERVICES.map((s, i) => {
            const start = 34 + i * 26;
            const sp = spring({ frame: frame - start, fps, config: { damping: 15, stiffness: 110 } });
            const glow = prog(frame, start + 8, 20);
            return (
              <div
                key={s.key}
                style={{
                  width: cardW,
                  display: "flex",
                  alignItems: "center",
                  gap: 30 * u,
                  padding: `${26 * u}px ${32 * u}px`,
                  borderRadius: 26 * u,
                  background: `linear-gradient(110deg, ${C.surface} 40%, ${s.color}22)`,
                  border: `${2 * u}px solid ${glow > 0.5 ? s.color + "88" : C.line}`,
                  opacity: Math.min(1, sp * 1.4),
                  translate: `${(1 - sp) * 420 * u}px 0`,
                  rotate: `y ${(1 - sp) * -55}deg`,
                  boxShadow: `0 ${20 * u}px ${60 * u}px rgba(0,0,0,${0.35 * sp})`,
                }}
              >
                <div style={{ width: 84 * u, height: 84 * u, display: "grid", placeItems: "center", rotate: `${(1 - sp) * 180 + frame * 0.4}deg` }}>
                  <ServiceGlyph kind={s.key} size={70 * u} color={s.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F.mono, fontSize: 22 * u, color: s.color, letterSpacing: "0.2em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: (portrait ? 54 : 44) * u, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                    {s.title}
                  </div>
                </div>
                <div style={{ fontFamily: F.display, fontSize: 48 * u, color: s.color, opacity: glow, translate: `${(1 - glow) * -20 * u}px 0` }}>→</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 6 * u,
          width: `${interpolate(frame, [0, 230], [0, 100], { extrapolateRight: "clamp" })}%`,
          background: `linear-gradient(90deg, ${SERVICES.map((s) => s.color).join(", ")})`,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
