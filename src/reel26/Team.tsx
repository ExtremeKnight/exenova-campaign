import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F, MEMBERS } from "../brand";
import { Backdrop, Eyebrow, Grain, SplitText, useLayout } from "../fx";
import { ABOVE_CAPTIONS, BEAT, SECTIONS, isTall } from "./timeline";
import { wordFrame } from "./voice";

// Each portrait pops in as the narrator says the name (same timing in the
// music-only version), then the cards light up one per beat.
const NAMES = ["Shan", "Justine", "Rei", "Orlando"];

export const Team: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, landscape, width, height } = useLayout();
  const appear = NAMES.map((n) => wordFrame("08", n) - SECTIONS.team.from);
  const cols = landscape ? 4 : 2;
  const gap = 26 * u;
  const areaTop = portrait
    ? height * 0.36
    : landscape
      ? height * 0.36
      : height * 0.32;
  // Cards fill the width, but stay above the caption band.
  const rows = MEMBERS.length / cols;
  const ratio = landscape ? 1.32 : 1.1;
  const availH =
    height -
    areaTop -
    (isTall(width, height) ? ABOVE_CAPTIONS.portrait : ABOVE_CAPTIONS.other) *
      u;
  const cardH = Math.min(
    ((width - (portrait ? 120 : 160) * u - gap * (cols - 1)) / cols) * ratio,
    (availH - gap * (rows - 1)) / rows,
  );
  const cardW = cardH / ratio;
  const areaW = cardW * cols + gap * (cols - 1);
  const glowBeat = Math.floor((frame - 170) / BEAT);

  return (
    <AbsoluteFill>
      <Backdrop tint={C.coral} />
      <div
        style={{
          position: "absolute",
          left: (portrait ? 60 : 80) * u,
          right: 60 * u,
          top: (portrait ? 150 : 80) * u,
          display: "flex",
          flexDirection: "column",
          gap: 18 * u,
        }}
      >
        <Eyebrow color={C.coral}>The people behind the work</Eyebrow>
        <SplitText
          text="Meet the team."
          size={(portrait ? 120 : landscape ? 104 : 112) * u}
          start={4}
          stagger={1}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: (width - areaW) / 2,
          top: areaTop,
          width: areaW,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
          gap,
        }}
      >
        {MEMBERS.map((m, i) => {
          const s = spring({
            frame: frame - appear[i],
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          const lit = glowBeat >= 0 && glowBeat % MEMBERS.length === i;
          const lift = interpolate(
            frame,
            [appear[i], appear[i] + 90],
            [30 * u, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div
              key={m.slug}
              style={{
                position: "relative",
                width: cardW,
                height: cardH,
                borderRadius: 26 * u,
                overflow: "hidden",
                background: `linear-gradient(160deg, ${m.color}55, ${C.surface} 70%)`,
                border: `${3 * u}px solid ${lit ? m.color : `${C.ink}1f`}`,
                boxShadow: lit
                  ? `0 0 ${60 * u}px ${m.color}aa`
                  : `0 ${20 * u}px ${60 * u}px rgba(0,0,0,0.4)`,
                scale: s,
                opacity: Math.min(1, s * 1.5),
                translate: `0 ${lift}px`,
              }}
            >
              <Img
                src={staticFile(m.photo)}
                style={{
                  position: "absolute",
                  left: "8%",
                  bottom: cardH * 0.24,
                  width: "84%",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: `${18 * u}px ${20 * u}px`,
                  background: `linear-gradient(transparent, ${C.paperDeep}f0 40%)`,
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: cardW * 0.055,
                    letterSpacing: "0.18em",
                    color: m.color,
                  }}
                >
                  {m.nickname}
                </div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: cardW * 0.1,
                    lineHeight: 1.05,
                    color: C.ink,
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: cardW * 0.058,
                    color: `${C.ink}b0`,
                    marginTop: 4 * u,
                  }}
                >
                  {m.discipline}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
