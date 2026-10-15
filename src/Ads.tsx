import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { pushCut } from "@remotion/transitions/push-cut";
import { fade } from "@remotion/transitions/fade";
import { whoosh, whip, ding } from "@remotion/sfx";
import { C, F, ROLES, SERVICES, type ServiceKey } from "./brand";
import { ServiceGlyph } from "./glyphs";
import { Backdrop, Eyebrow, Glitch, Grain, Sfx, SplitText, prog, useLayout } from "./fx";
import { OutroScene } from "./scenes/OutroScene";

const AT = 10;
// hook, reveal, list, proof, cta — sum minus transitions = 450 frames (15s @ 30fps)
const PARTS = [80, 140, 95, 65, 110];
export const AD_FRAMES = PARTS.reduce((a, b) => a + b, 0) - AT * (PARTS.length - 1);

type AdContent = {
  hook: string;
  color: string;
  glyph: ServiceKey;
  eyebrow: string;
  title: string;
  pitch: string;
  listTitle: string;
  list: string[];
  proofTitle: string;
  proof: string[];
  cta: string;
  path: string;
};

const Hook: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const words = text.split(" ");
  return (
    <AbsoluteFill>
      <Backdrop tint={color} dark />
      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${90 * u}px` }}>
        <Glitch at={[46, 62]} strength={18}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: `0 ${28 * u}px` }}>
            {words.map((w, i) => {
              const p = prog(frame, 4 + i * 5, 14);
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: (portrait ? 128 : 110) * u,
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                    color: i === words.length - 1 ? color : C.ink,
                    opacity: p,
                    translate: `0 ${(1 - p) * 80 * u}px`,
                    rotate: `${(1 - p) * 8}deg`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </Glitch>
      </AbsoluteFill>
      <Grain opacity={0.12} />
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{ c: AdContent }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const g = spring({ frame, fps, config: { damping: 10, stiffness: 90 } });
  return (
    <AbsoluteFill>
      <Backdrop tint={c.color} />
      <AbsoluteFill style={{ padding: `${(portrait ? 230 : 100) * u}px ${90 * u}px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 * u }}>
        <div style={{ width: 300 * u, height: 300 * u, display: "grid", placeItems: "center", scale: g, rotate: `${(1 - g) * -200 + frame * 0.5}deg`, filter: `drop-shadow(0 0 ${60 * u}px ${c.color}88)` }}>
          <ServiceGlyph kind={c.glyph} size={260 * u} color={c.color} />
        </div>
        <Eyebrow color={c.color} start={10}>{c.eyebrow}</Eyebrow>
        <SplitText text={c.title} size={(portrait ? 104 : 96) * u} start={14} stagger={1} />
        <div style={{ fontFamily: F.body, fontSize: (portrait ? 44 : 38) * u, lineHeight: 1.35, color: C.muted, maxWidth: 900 * u, opacity: prog(frame, 40, 20), translate: `0 ${(1 - prog(frame, 40, 20)) * 30 * u}px` }}>
          {c.pitch}
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

const List: React.FC<{ c: AdContent }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  return (
    <AbsoluteFill>
      <Backdrop tint={c.color} dark />
      <AbsoluteFill style={{ padding: `${(portrait ? 260 : 100) * u}px ${90 * u}px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 * u }}>
        <Eyebrow color={c.color}>{c.listTitle}</Eyebrow>
        {c.list.map((item, i) => {
          const s = spring({ frame: frame - 8 - i * 12, fps, config: { damping: 14 } });
          const tick = prog(frame, 14 + i * 12, 10);
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28 * u,
                padding: `${26 * u}px ${30 * u}px`,
                borderRadius: 24 * u,
                background: C.surface,
                border: `${2 * u}px solid ${C.line}`,
                opacity: Math.min(1, s),
                translate: `${(1 - s) * -300 * u}px 0`,
              }}
            >
              <div style={{ width: 56 * u, height: 56 * u, borderRadius: "50%", background: c.color, display: "grid", placeItems: "center", scale: tick }}>
                <svg width={30 * u} height={30 * u} viewBox="0 0 24 24">
                  <path d="M4 12.5l5 5L20 6" fill="none" stroke={C.paperDeep} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" strokeDashoffset={30 * (1 - tick)} />
                </svg>
              </div>
              <span style={{ fontFamily: F.display, fontWeight: 500, fontSize: (portrait ? 52 : 44) * u, color: C.ink }}>{item}</span>
            </div>
          );
        })}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

const Proof: React.FC<{ c: AdContent }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { u, width } = useLayout();
  return (
    <AbsoluteFill style={{ backgroundColor: c.color, justifyContent: "center", gap: 22 * u, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 160 * u, left: 90 * u, fontFamily: F.mono, fontSize: 28 * u, letterSpacing: "0.25em", color: C.paperDeep }}>
        {c.proofTitle}
      </div>
      {[0, 1, 2].map((r) => {
        const dir = r % 2 ? 1 : -1;
        const items = [...c.proof, ...c.proof, ...c.proof];
        return (
          <div key={r} style={{ display: "flex", gap: 40 * u, whiteSpace: "nowrap", translate: `${dir * frame * 9 * u - (dir > 0 ? width : 0)}px 0` }}>
            {items.map((p, i) => (
              <span key={i} style={{ fontFamily: F.display, fontWeight: 700, fontSize: 120 * u, letterSpacing: "-0.04em", color: (i + r) % 2 ? C.paperDeep : "transparent", WebkitTextStroke: (i + r) % 2 ? undefined : `${3 * u}px ${C.paperDeep}` }}>
                {p} ✦
              </span>
            ))}
          </div>
        );
      })}
      <Grain opacity={0.15} />
    </AbsoluteFill>
  );
};

export const AdVideo: React.FC<AdContent> = (c) => {
  const [hook, reveal, list, proof, cta] = PARTS;
  const cuts = PARTS.slice(0, -1).map((_, i) => PARTS.slice(0, i + 1).reduce((a, b) => a + b, 0) - AT * (i + 1));
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={hook}>
          <Hook text={c.hook} color={c.color} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={linearTiming({ durationInFrames: AT })} />
        <TransitionSeries.Sequence name="Reveal" durationInFrames={reveal}>
          <Reveal c={c} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: AT })} />
        <TransitionSeries.Sequence name="List" durationInFrames={list}>
          <List c={c} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: AT })} />
        <TransitionSeries.Sequence name="Proof" durationInFrames={proof}>
          <Proof c={c} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: AT })} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={cta}>
          <OutroScene cta={c.cta} path={c.path} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {cuts.map((at, i) => (
        <Sfx key={i} at={at} src={i === 0 ? whip : whoosh} volume={0.35} />
      ))}
      <Sfx at={AD_FRAMES - cta + 34} src={ding} volume={0.3} />
    </AbsoluteFill>
  );
};

export const serviceAd = (key: ServiceKey): AdContent => {
  const s = SERVICES.find((x) => x.key === key)!;
  return {
    hook: s.hook,
    color: s.color,
    glyph: s.key,
    eyebrow: "Exenova · " + s.short,
    title: s.title + ".",
    pitch: s.pitch,
    listTitle: "What you get",
    list: s.deliverables,
    proofTitle: "WORK LIKE",
    proof: s.work,
    cta: "Get a quote",
    path: `/services/${s.slug}`,
  };
};

export const joinAd: AdContent = {
  hook: "Great work deserves a team behind it.",
  color: C.coral,
  glyph: "brand",
  eyebrow: "Exenova is hiring",
  title: "Join the collective.",
  pitch: "Your own page, shared client work and credit on every project you touch.",
  listTitle: "Open roles",
  list: ROLES,
  proofTitle: "WHAT YOU GET",
  proof: ["Your own page", "Real clients", "Full credit", "Remote"],
  cta: "Apply now",
  path: "/join",
};

