import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../brand";
import { Backdrop, Glitch, Grain, TypeLine, prog, useLayout } from "../fx";

const BOOT = ["loading brand.pkg", "loading motion.pkg", "loading code.pkg", "mounting /showreel"];

// 0–30 typed command, 20–50 boot log, 42+ logo slams in letter by letter.
export const BootScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const letters = [..."EXENOVA"];
  const logoSize = (portrait ? 190 : 230) * u;

  return (
    <AbsoluteFill>
      <Backdrop dark tint={C.violet} />
      <AbsoluteFill style={{ padding: `${(portrait ? 220 : 110) * u}px ${90 * u}px`, display: "flex", flexDirection: "column", gap: 14 * u }}>
        <TypeLine text="$ exenova --showreel --2026" size={34 * u} cursor={frame < 44} />
        {BOOT.map((line, i) => {
          const p = prog(frame, 20 + i * 6, 8);
          return (
            <div key={line} style={{ fontFamily: F.mono, fontSize: 24 * u, color: C.muted, opacity: p * interpolate(frame, [70, 85], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              {line} <span style={{ color: C.moss }}>[ok]</span>
            </div>
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Glitch at={[52, 66, 80]} strength={22}>
          <div style={{ display: "flex", fontFamily: F.display, fontWeight: 700, fontSize: logoSize, letterSpacing: "-0.05em", color: C.ink, lineHeight: 1 }}>
            {letters.map((ch, i) => {
              const s = spring({ frame: frame - 42 - i * 3, fps, config: { damping: 11, stiffness: 160 } });
              return (
                <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.5), scale: interpolate(s, [0, 1], [2.6, 1]), filter: `blur(${(1 - Math.min(1, s)) * 18}px)` }}>
                  {ch}
                </span>
              );
            })}
            <span style={{ color: C.coral, opacity: prog(frame, 66, 6), scale: interpolate(spring({ frame: frame - 66, fps }), [0, 1], [0, 1]) }}>.</span>
          </div>
        </Glitch>
        <div
          style={{
            marginTop: 26 * u,
            fontFamily: F.mono,
            fontSize: 28 * u,
            letterSpacing: "0.45em",
            color: C.accent,
            opacity: prog(frame, 70, 14),
            translate: `0 ${(1 - prog(frame, 70, 14)) * 20 * u}px`,
          }}
        >
          CREATIVE COLLECTIVE
        </div>
        <div style={{ marginTop: 30 * u, height: 3 * u, width: 520 * u * prog(frame, 64, 22), background: `linear-gradient(90deg, ${C.accent}, ${C.coral})` }} />
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
