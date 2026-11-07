import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F, SERVICES, type ServiceKey } from "../brand";
import { Backdrop, Eyebrow, Grain, SplitText, prog, useLayout } from "../fx";
import { ServiceGlyph } from "../glyphs";
import { CutFlash, Footage } from "./parts";
import { BEAT } from "./timeline";

const HEAD = 30;
const EACH = 3 * BEAT; // 1.5 s per service
const CLIP: Record<ServiceKey, string> = {
  brand: "b-mug",
  web: "q-laptop",
  film: "k-face",
  interactive: "q-arch",
  uiux: "q-glasses",
};

const ServicePanel: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait, width, height } = useLayout();
  const s = SERVICES[i];
  const g = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const glyph = (portrait ? 520 : 560) * u;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 0.32 }}>
        <Footage
          clip={CLIP[s.key]}
          dur={EACH}
          zoom={[1.15, 1.05]}
          startFrom={8}
          dim={0.5}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${portrait ? 180 : 100}deg, ${C.paperDeep} 20%, ${s.color}33 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: portrait ? width / 2 - glyph / 2 : width - glyph - 120 * u,
          top: portrait ? height * 0.52 : height / 2 - glyph / 2,
          width: glyph,
          height: glyph,
          display: "grid",
          placeItems: "center",
          rotate: `${interpolate(g, [0, 1], [-60, 0]) + frame * 0.6}deg`,
          scale: g,
          opacity: 0.95,
          filter: `drop-shadow(0 0 ${60 * u}px ${s.color}88)`,
        }}
      >
        <ServiceGlyph kind={s.key} size={glyph} color={s.color} />
      </div>
      <div
        style={{
          position: "absolute",
          left: (portrait ? 80 : 120) * u,
          right: portrait ? 80 * u : width * 0.42,
          top: portrait ? 260 * u : undefined,
          bottom: portrait ? undefined : height * 0.3,
          display: "flex",
          flexDirection: "column",
          gap: 22 * u,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26 * u,
            letterSpacing: "0.22em",
            color: s.color,
          }}
        >
          {String(i + 1).padStart(2, "0")} / 05
        </div>
        <SplitText
          text={s.title}
          size={(portrait ? 104 : 112) * u}
          start={0}
          stagger={0.4}
        />
        <div
          style={{
            fontFamily: F.body,
            fontSize: (portrait ? 34 : 32) * u,
            lineHeight: 1.35,
            color: `${C.ink}cc`,
            opacity: prog(frame, 8, 12),
            maxWidth: 820 * u,
          }}
        >
          {s.pitch}
        </div>
      </div>
      <CutFlash strength={0.35} />
    </AbsoluteFill>
  );
};

const OneTeam: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height, portrait } = useLayout();
  const merge = prog(frame, 30, 36);
  const size = 120 * u;
  const cx = width / 2;
  const cy = portrait ? height * 0.62 : height * 0.66;
  return (
    <AbsoluteFill>
      <Backdrop tint={C.accent} dark />
      {SERVICES.map((s, i) => {
        const a =
          (i / SERVICES.length) * Math.PI * 2 - Math.PI / 2 + frame * 0.01;
        const r = (portrait ? 300 : 340) * u * (1 - merge);
        const appear = prog(frame, i * 3, 12);
        return (
          <div
            key={s.key}
            style={{
              position: "absolute",
              left: cx + Math.cos(a) * r - size / 2,
              top: cy + Math.sin(a) * r - size / 2,
              width: size,
              height: size,
              display: "grid",
              placeItems: "center",
              opacity: appear * (1 - merge * 0.9),
              scale: appear * (1 - merge * 0.6),
            }}
          >
            <ServiceGlyph kind={s.key} size={size} color={s.color} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: cx - 70 * u,
          top: cy - 70 * u,
          width: 140 * u,
          height: 140 * u,
          borderRadius: 999,
          background: `linear-gradient(135deg, ${C.accent}, ${C.coral})`,
          scale: interpolate(merge, [0.6, 1], [0, 1], {
            extrapolateLeft: "clamp",
          }),
          boxShadow: `0 0 ${90 * u}px ${C.accent}`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: (portrait ? 330 : 150) * u,
          gap: 6 * u,
        }}
      >
        <SplitText
          text="One team."
          size={(portrait ? 120 : 120) * u}
          start={2}
          stagger={1}
          style={{ justifyContent: "center" }}
        />
        <SplitText
          text="One point of contact."
          size={(portrait ? 84 : 92) * u}
          start={14}
          stagger={0.5}
          color={C.accent}
          style={{ justifyContent: "center", textAlign: "center" }}
        />
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

export const Services: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={HEAD} layout="none">
        <AbsoluteFill>
          <Backdrop tint={C.coral} dark />
          <AbsoluteFill
            style={{
              justifyContent: "center",
              padding: `0 ${(portrait ? 80 : 160) * u}px`,
              gap: 24 * u,
            }}
          >
            <Eyebrow color={C.coral}>What we make</Eyebrow>
            <SplitText
              text="Five crafts."
              size={(portrait ? 140 : 150) * u}
              start={2}
              stagger={1}
            />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              backgroundColor: "#fff",
              opacity: interpolate(frame, [0, 4], [0.6, 0], {
                extrapolateRight: "clamp",
              }),
            }}
          />
        </AbsoluteFill>
      </Sequence>
      {SERVICES.map((s, i) => (
        <Sequence
          key={s.key}
          from={HEAD + i * EACH}
          durationInFrames={EACH}
          layout="none"
        >
          <ServicePanel i={i} />
        </Sequence>
      ))}
      <Sequence from={HEAD + SERVICES.length * EACH} layout="none">
        <OneTeam />
      </Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
