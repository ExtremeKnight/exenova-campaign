import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SITE } from "../brand";
import { Backdrop, Eyebrow, Grain, SplitText, prog, useLayout } from "../fx";
import { SECTIONS } from "./timeline";
import { wordFrame } from "./voice";

const at = (lineId: string, word: string) => wordFrame(lineId, word) - SECTIONS.web.from;

/** A screenshot that scrolls inside a fixed window. */
const Scroller: React.FC<{ src: string; w: number; h: number; imgW: number; imgH: number; from: number; to: number; start: number; dur: number }> = ({
  src,
  w,
  h,
  imgW,
  imgH,
  from,
  to,
  start,
  dur,
}) => {
  const frame = useCurrentFrame();
  const scale = w / imgW;
  const maxY = imgH * scale - h;
  const y = interpolate(frame, [start, start + dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t),
  });
  return <Img src={staticFile(src)} style={{ position: "absolute", top: -Math.max(0, Math.min(maxY, y * maxY)), left: 0, width: w }} />;
};

// The breakdown: the site the team built, on a laptop and a phone.
export const Web: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, landscape, width, height } = useLayout();
  const inL = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 90 } });
  const inP = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 90 } });

  // Laptop screen size; phone sits in front of it.
  const lw = portrait ? width * 0.86 : landscape ? width * 0.5 : width * 0.8;
  const lh = lw * 0.625;
  const pw = portrait ? 300 * u : 250 * u;
  const ph = pw * 2.05;
  const lx = portrait ? (width - lw) / 2 : landscape ? width * 0.08 : (width - lw) / 2;
  const ly = portrait ? height * 0.36 : landscape ? height * 0.24 : height * 0.36;
  const px = portrait ? width - pw - 60 * u : landscape ? lx + lw - pw * 0.4 : width - pw - 60 * u;
  const py = portrait ? ly + lh - ph * 0.35 : landscape ? ly + lh - ph * 0.7 : ly + lh - ph * 0.45;

  const screens = [
    { src: "reel/site/desk-home.webp", imgW: 1440, imgH: 5200, from: 0, to: 0.55, start: 10, dur: 100 },
    { src: "reel/site/desk-gallery.webp", imgW: 1440, imgH: 900, from: 0, to: 0, start: 0, dur: 1 },
    { src: "reel/site/desk-member.webp", imgW: 1440, imgH: 900, from: 0, to: 0, start: 0, dur: 1 },
  ];
  const which = frame < 130 ? 0 : frame < 180 ? 1 : 2;
  const chips = [
    { label: "Fast", at: at("07", "fast"), color: C.amber },
    { label: "Accessible", at: at("07", "accessible"), color: C.moss },
    { label: "Easy to run", at: at("07", "easy"), color: C.coral },
  ];

  return (
    <AbsoluteFill>
      <Backdrop tint={C.violet} />
      <div
        style={{
          position: "absolute",
          left: landscape ? width * 0.62 : 80 * u,
          right: 80 * u,
          top: portrait ? 170 * u : landscape ? height * 0.26 : 110 * u,
          display: "flex",
          flexDirection: "column",
          gap: 22 * u,
        }}
      >
        <Eyebrow color={C.accent}>We build the platform too</Eyebrow>
        <SplitText text="Built in-house." size={(portrait ? 110 : landscape ? 96 : 104) * u} start={6} stagger={1} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 * u, marginTop: 8 * u }}>
          {chips.map((c) => {
            const s = spring({ frame: frame - c.at, fps, config: { damping: 11, stiffness: 180 } });
            return (
              <div
                key={c.label}
                style={{
                  scale: s,
                  opacity: Math.min(1, s * 1.5),
                  border: `${3 * u}px solid ${c.color}`,
                  color: c.color,
                  borderRadius: 999,
                  padding: `${12 * u}px ${28 * u}px`,
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 38 * u,
                  background: `${c.color}1a`,
                }}
              >
                {c.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Laptop */}
      <div
        style={{
          position: "absolute",
          left: lx,
          top: ly,
          width: lw,
          height: lh,
          translate: `0 ${(1 - inL) * 120 * u}px`,
          opacity: Math.min(1, inL * 1.4),
          rotate: `${(1 - inL) * -4}deg`,
        }}
      >
        <div style={{ position: "absolute", inset: -14 * u, borderRadius: 28 * u, background: "#0a0a0c", border: `${2 * u}px solid #2a2a30`, boxShadow: `0 ${50 * u}px ${140 * u}px rgba(0,0,0,0.6), 0 0 ${80 * u}px ${C.accent}33` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 14 * u, overflow: "hidden", background: C.paper }}>
          {screens.map((s, i) => (
            <div key={s.src} style={{ position: "absolute", inset: 0, opacity: which === i ? 1 : 0 }}>
              <Scroller {...s} w={lw} h={lh} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: -lw * 0.06, right: -lw * 0.06, bottom: -14 * u - 22 * u, height: 22 * u, borderRadius: `0 0 ${20 * u}px ${20 * u}px`, background: "linear-gradient(#2a2a30, #121216)" }} />
      </div>

      {/* Phone */}
      <div
        style={{
          position: "absolute",
          left: px,
          top: py,
          width: pw,
          height: ph,
          translate: `0 ${(1 - inP) * 200 * u}px`,
          opacity: Math.min(1, inP * 1.4),
          rotate: `${(1 - inP) * 8 + 3}deg`,
        }}
      >
        <div style={{ position: "absolute", inset: -10 * u, borderRadius: 46 * u, background: "#0a0a0c", border: `${2 * u}px solid #2a2a30`, boxShadow: `0 ${40 * u}px ${100 * u}px rgba(0,0,0,0.7)` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 38 * u, overflow: "hidden", background: C.paper }}>
          <Scroller src="reel/site/phone-home.webp" imgW={780} imgH={4400} w={pw} h={ph} from={0} to={0.7} start={24} dur={180} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: (portrait ? 300 : 60) * u,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 28 * u,
          letterSpacing: "0.12em",
          color: C.muted,
          opacity: prog(frame, 60, 16),
        }}
      >
        {SITE}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
