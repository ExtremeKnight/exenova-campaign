import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, HANDLE, SITE } from "../brand";
import { Backdrop, Glitch, Grain, TypeLine, prog, useLayout } from "../fx";
import { Footage } from "./parts";
import { SECTIONS } from "./timeline";
import { wordFrame } from "./voice";

const TILES = ["q-group", "k-title", "q-artwall", "b-mug", "q-cheer", "k-logo", "q-glasses", "q-smiles", "b-date"];
const local = (lineId: string, word: string) => wordFrame(lineId, word) - SECTIONS.outro.from;

// "Design meets code meets story" lands word by word over a wall of the work,
// the wall collapses into the logo on the 56 s hit, then the call to action.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, width, height } = useLayout();
  const HIT = 4 * 30; // 56 s, the song's final impact
  const words = [
    { w: "Design", at: local("09", "Design"), color: C.ink },
    { w: "meets code", at: local("09", "code"), color: C.accent },
    { w: "meets story.", at: local("09", "story"), color: C.coral },
  ];
  const wall = interpolate(frame, [HIT - 8, HIT + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cols = 3;
  const tileW = width / cols;
  const tileH = height / 3;
  const logo = spring({ frame: frame - HIT, fps, config: { damping: 12, stiffness: 140 } });
  // The narrator says "Let's make yours" right on the hit; the button follows a beat later.
  const cta = spring({ frame: frame - Math.max(HIT + 15, local("10", "yours")), fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      {/* Wall of work */}
      <AbsoluteFill style={{ opacity: wall, scale: interpolate(wall, [0, 1], [0.6, 1]) }}>
        {TILES.map((clip, i) => {
          const x = (i % cols) * tileW;
          const y = Math.floor(i / cols) * tileH;
          const show = prog(frame, i * 2, 10);
          return (
            <div key={clip} style={{ position: "absolute", left: x, top: y, width: tileW, height: tileH, overflow: "hidden", opacity: show * 0.55, border: `${2 * u}px solid ${C.paperDeep}` }}>
              <Sequence layout="none">
                <Footage clip={clip} dur={HIT} zoom={[1.2, 1.05]} startFrom={4} dim={0.4} />
              </Sequence>
            </div>
          );
        })}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${C.paperDeep}cc 20%, ${C.paperDeep}55 70%)` }} />
      </AbsoluteFill>

      {/* Tagline */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", opacity: wall }}>
        {words.map(({ w, at, color }) => {
          const s = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 170 } });
          return (
            <div
              key={w}
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: (portrait ? 130 : 140) * u,
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
                color,
                opacity: Math.min(1, s * 1.5),
                scale: interpolate(s, [0, 1], [1.4, 1]),
                filter: `blur(${(1 - Math.min(1, s)) * 12}px)`,
                textShadow: "0 8px 50px rgba(0,0,0,0.6)",
              }}
            >
              {w}
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Logo and call to action, from the hit */}
      <Sequence from={HIT} layout="none">
        <AbsoluteFill>
          <Backdrop tint={C.accent} dark />
          <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [HIT, HIT + 6], [0.8, 0], { extrapolateRight: "clamp" }) }} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 30 * u }}>
            <Glitch at={[HIT + 2, HIT + 30]} strength={20}>
              <div
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: (portrait ? 210 : 240) * u,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: C.ink,
                  scale: interpolate(logo, [0, 1], [1.6, 1]),
                  opacity: Math.min(1, logo * 1.4),
                }}
              >
                Exenova<span style={{ color: C.coral }}>.</span>
              </div>
            </Glitch>
            <div style={{ height: 4 * u, width: 640 * u * prog(frame, HIT + 8, 22), background: `linear-gradient(90deg, ${C.accent}, ${C.coral})` }} />
            <div
              style={{
                marginTop: 14 * u,
                scale: cta,
                opacity: Math.min(1, cta),
                background: C.ink,
                color: C.paper,
                borderRadius: 999,
                padding: `${26 * u}px ${60 * u}px`,
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 48 * u,
                boxShadow: `0 0 ${80 * u}px ${C.accent}88`,
              }}
            >
              Let's make yours →
            </div>
            <div style={{ maxWidth: 900 * u, textAlign: "center" }}>
              <TypeLine text={SITE} start={HIT + 26} cps={1.6} size={(portrait ? 36 : 34) * u} color={C.muted} cursor={frame < HIT + 80} />
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 24 * u, letterSpacing: "0.2em", color: C.accent, opacity: prog(frame, HIT + 50, 16) }}>
              {HANDLE} · TIKTOK · INSTAGRAM · FACEBOOK
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(frame, [SECTIONS.outro.dur - 24, SECTIONS.outro.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      <Grain />
    </AbsoluteFill>
  );
};
