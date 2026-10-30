import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../brand";
import { Backdrop, Glitch, Grain, prog, useLayout } from "../fx";
import { Footage } from "./parts";
import { BEAT } from "./timeline";

const WORDS = ["Every", "idea", "deserves", "to be", "seen."];
const FLICKER = ["q-expo", "k-red", "q-laptop", "b-cafe", "q-stage", "k-face"];

// 0–100: the opening line lands word by word on the beat.
// 100–118: flashes of the work. 118–240: the logo assembles under the riser.
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const linesOut = interpolate(frame, [92, 102], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoSize = (portrait ? 200 : 250) * u;
  const push = interpolate(frame, [150, 240], [1, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Backdrop dark tint={C.violet} />

      {/* Opening line */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: `0 ${(portrait ? 80 : 160) * u}px`,
          opacity: linesOut,
        }}
      >
        <Glitch at={[88]} strength={26}>
          {WORDS.map((w, i) => {
            const at = BEAT + i * BEAT;
            const s = spring({
              frame: frame - at,
              fps,
              config: { damping: 14, stiffness: 180 },
            });
            return (
              <div
                key={w}
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: (portrait ? 150 : 140) * u,
                  lineHeight: 0.98,
                  letterSpacing: "-0.05em",
                  color: i === WORDS.length - 1 ? C.coral : C.ink,
                  opacity: Math.min(1, s * 1.4),
                  translate: `${(1 - s) * -80 * u}px 0`,
                  filter: `blur(${(1 - Math.min(1, s)) * 12}px)`,
                }}
              >
                {w}
              </div>
            );
          })}
        </Glitch>
      </AbsoluteFill>

      {/* Flashes of the work, 3 frames each */}
      {FLICKER.map((clip, i) => (
        <Sequence
          key={clip}
          from={100 + i * 3}
          durationInFrames={3}
          layout="none"
        >
          <Footage
            clip={clip}
            zoom={[1.2, 1.2]}
            dur={3}
            startFrom={20}
            dim={0.1}
          />
        </Sequence>
      ))}

      {/* Logo under the riser, with the crowd behind it */}
      <Sequence from={118} layout="none">
        <AbsoluteFill style={{ opacity: 0.22, filter: `blur(${8 * u}px)` }}>
          <Footage clip="q-crowd" zoom={[1.25, 1.1]} dur={122} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            scale: push,
          }}
        >
          <Glitch at={[150 - 118, 196 - 118, 226 - 118]} strength={24}>
            <div
              style={{
                display: "flex",
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: logoSize,
                letterSpacing: "-0.05em",
                color: C.ink,
                lineHeight: 1,
              }}
            >
              {[..."Exenova"].map((ch, i) => {
                const s = spring({
                  frame: frame - 122 - i * 3,
                  fps,
                  config: { damping: 11, stiffness: 150 },
                });
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: Math.min(1, s * 1.5),
                      scale: interpolate(s, [0, 1], [2.4, 1]),
                      filter: `blur(${(1 - Math.min(1, s)) * 16}px)`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
              <span style={{ color: C.coral, opacity: prog(frame, 146, 4) }}>
                .
              </span>
            </div>
          </Glitch>
          <div
            style={{
              marginTop: 28 * u,
              height: 4 * u,
              width: (portrait ? 560 : 680) * u * prog(frame, 150, 26),
              background: `linear-gradient(90deg, ${C.accent}, ${C.coral})`,
            }}
          />
          <div
            style={{
              marginTop: 30 * u,
              fontFamily: F.mono,
              fontSize: (portrait ? 26 : 28) * u,
              letterSpacing: "0.32em",
              color: C.accent,
              textAlign: "center",
              opacity: prog(frame, 160, 14),
              padding: `0 ${40 * u}px`,
            }}
          >
            DESIGNERS · DEVELOPERS · FILMMAKERS
          </div>
          <div
            style={{
              marginTop: 18 * u,
              fontFamily: F.mono,
              fontSize: 22 * u,
              letterSpacing: "0.4em",
              color: C.muted,
              opacity: prog(frame, 176, 14),
            }}
          >
            SHOWREEL 2026
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Dip to white on the last beat, into the drop */}
      <AbsoluteFill
        style={{
          backgroundColor: "#fff",
          opacity: interpolate(frame, [228, 240], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
