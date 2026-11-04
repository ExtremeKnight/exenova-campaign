import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, HANDLE, SERVICES, SITE } from "../brand";
import { EASE_IN_OUT, Grain, prog } from "../fx";
import { At, Shape, type ShapeKind, kickAt, useStage } from "./kit";
import { BAR, BEAT, HIT } from "./timeline";

const TRIO: { kind: ShapeKind; color: string }[] = [
  { kind: "circle", color: C.accent },
  { kind: "square", color: C.amber },
  { kind: "triangle", color: C.moss },
];

const Dark: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.paperDeep }) => (
  <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
    {children}
    <Grain opacity={0.08} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- 1. a single point
/** A dot drops in and bounces on the beat, pulses, then is pushed into three shapes that orbit and collapse. */
export const Open: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, cx, cy, stageH, width } = useStage();
  const r = 26 * u;
  const H = stageH * 0.42;

  // Bounce: falls during beat 0, three shrinking bounces, lands for good on frame 60.
  let y = 0;
  if (frame < BEAT) y = -H * (1 - (frame / BEAT) ** 2);
  else if (frame < BAR) {
    const k = Math.floor(frame / BEAT);
    const p = (frame % BEAT) / BEAT;
    y = -H * [0, 0.5, 0.25, 0.1][k] * 4 * p * (1 - p);
  }
  const land = [BEAT, 2 * BEAT, 3 * BEAT, BAR].reduce((m, at) => Math.max(m, kickAt(frame, at, 3)), 0);
  const pulse = frame >= BAR && frame < 2 * BAR ? kickAt(frame, BAR + Math.floor((frame - BAR) / BEAT) * BEAT, 4) : 0;

  // Bar 2: the push — the dot shoots right, a trail draws each shape in turn.
  const push = prog(frame, 2 * BAR, 10);
  const dotX = cx + interpolate(push, [0, 1], [0, width * 0.32]) * (1 - prog(frame, 2 * BAR + 10, 20, EASE_IN_OUT));
  const collapse = prog(frame, 3 * BAR + 30, 28, EASE_IN_OUT);
  const orbit = prog(frame, 2 * BAR + 40, 90, EASE_IN_OUT) * Math.PI * 1.5 + collapse * Math.PI;
  const spread = (portraitSpread(width, stageH) * u) * (1 - collapse);
  const shapeSize = 180 * u;

  return (
    <Dark>
      {/* ripples on each pulse */}
      {[0, 1, 2, 3].map((k) => {
        const at = BAR + k * BEAT;
        const t = frame - at;
        if (t < 0 || t > 40) return null;
        const s = 1 + t * 0.35;
        return (
          <At key={k} x={cx} y={cy}>
            <div style={{ width: 2 * r * s, height: 2 * r * s, borderRadius: "50%", border: `${3 * u}px solid ${C.coral}`, opacity: 1 - t / 40 }} />
          </At>
        );
      })}

      {TRIO.map((s, i) => {
        const start = 2 * BAR + 6 + i * BEAT;
        const draw = prog(frame, start, 14);
        const a = orbit + (i / 3) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * spread;
        const yy = cy + Math.sin(a) * spread;
        const sc = (0.6 + 0.4 * spring({ frame: frame - start, fps: 30, config: { damping: 11 } })) * (1 - collapse * 0.85);
        return (
          <At key={s.kind} x={x} y={yy} style={{ scale: sc, rotate: `${(orbit * 180) / Math.PI / 2 + i * 20}deg` }}>
            <Shape kind={s.kind} size={shapeSize} color={s.color} draw={draw} fill={prog(frame, start + 14, 20) * 0.2} stroke={7} />
          </At>
        );
      })}

      <At x={dotX} y={cy + y}>
        <div
          style={{
            width: 2 * r,
            height: 2 * r,
            borderRadius: "50%",
            background: C.coral,
            boxShadow: `0 0 ${40 * u}px ${C.coral}aa`,
            scale: `${1 + land * 0.45 + pulse * 0.4} ${1 - land * 0.35 + pulse * 0.4}`,
            translate: `0 ${land * 0.35 * r}px`,
          }}
        />
      </At>
      {/* faint floor line the dot bounces on */}
      <At x={cx} y={cy + r + 2 * u}>
        <div style={{ width: 380 * u * (1 - prog(frame, 2 * BAR, 20)), height: 2 * u, background: C.line, opacity: 0.8 }} />
      </At>
    </Dark>
  );
};

const portraitSpread = (width: number, stageH: number) => (stageH > width ? 250 : 300);

// ---------------------------------------------------------------- 2. ideas in motion
const WORDS = [
  { text: "IDEAS", at: 0, color: C.ink },
  { text: "IN", at: BEAT, color: C.coral },
  { text: "MOTION", at: 2 * BEAT, color: C.accent },
];

export const Type: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, cx, cy, portrait, width } = useStage();
  const size = Math.min(width * 0.86 / (6 * 0.66), (portrait ? 230 : 210) * u);
  const out = prog(frame, 2 * BAR - 12, 12, EASE_IN_OUT); // words fly apart before "Exenova"
  const ring = frame / 30;

  // Bar 6+: "We are" then EXENOVA, one letter per eighth note.
  const exStart = 2 * BAR + 6;
  const exSize = Math.min(width * 0.88 / (7 * 0.68), (portrait ? 200 : 230) * u);

  return (
    <Dark>
      {/* a slow ring of the three shapes behind everything */}
      {TRIO.map((s, i) => {
        const a = ring + (i / 3) * Math.PI * 2;
        const rad = (portrait ? 380 : 420) * u;
        return (
          <At key={s.kind} x={cx + Math.cos(a) * rad * 1.15} y={cy + Math.sin(a) * rad * 0.8} style={{ opacity: 0.35, rotate: `${frame * (i + 1)}deg` }}>
            <Shape kind={s.kind} size={150 * u} color={s.color} fill={0.12} stroke={5} />
          </At>
        );
      })}

      {frame < 2 * BAR && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", height: cy * 2, gap: 6 * u }}>
          {WORDS.map((w, i) => {
            const s = spring({ frame: frame - w.at, fps, config: { damping: 12, stiffness: 200 } });
            const isMotion = w.text === "MOTION";
            return (
              <div
                key={w.text}
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: size,
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  color: w.color,
                  opacity: frame >= w.at ? 1 : 0,
                  scale: interpolate(s, [0, 1], [1.8, 1]),
                  filter: `blur(${(1 - Math.min(1, s)) * 12}px)`,
                  translate: `${(i - 1) * out * width * 0.9}px ${(i - 1) * out * 200 * u}px`,
                  display: "flex",
                }}
              >
                {isMotion
                  ? [...w.text].map((ch, k) => (
                      <span
                        key={k}
                        style={{
                          display: "inline-block",
                          translate: `0 ${Math.sin((frame - w.at) / 4 - k * 0.9) * 26 * u * prog(frame, BAR, 10)}px`,
                          rotate: `${Math.sin((frame - w.at) / 5 - k) * 8 * prog(frame, BAR, 10)}deg`,
                          color: [C.accent, C.coral, C.amber, C.moss, C.accent, C.coral][k],
                        }}
                      >
                        {ch}
                      </span>
                    ))
                  : w.text}
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {frame >= 2 * BAR && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", height: cy * 2 }}>
          <div style={{ fontFamily: F.mono, fontSize: 30 * u, letterSpacing: "0.4em", color: C.muted, opacity: prog(frame, 2 * BAR, 10) }}>WE ARE</div>
          <div style={{ display: "flex", fontFamily: F.display, fontWeight: 700, fontSize: exSize, letterSpacing: "-0.05em", lineHeight: 1.05 }}>
            {[..."EXENOVA"].map((ch, k) => {
              const at = exStart + k * (BEAT / 2);
              const s = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 180 } });
              return (
                <span key={k} style={{ display: "inline-block", color: C.ink, opacity: frame >= at ? 1 : 0, translate: `0 ${(1 - s) * -160 * u}px`, scale: interpolate(s, [0, 1], [0.4, 1]) }}>
                  {ch}
                </span>
              );
            })}
            <span style={{ color: C.coral, scale: spring({ frame: frame - (exStart + 4 * BEAT), fps, config: { damping: 9 } }) }}>.</span>
          </div>
          <div
            style={{
              marginTop: 18 * u,
              fontFamily: F.body,
              fontSize: 40 * u,
              color: C.muted,
              opacity: prog(frame, exStart + 5 * BEAT, 14),
              translate: `0 ${(1 - prog(frame, exStart + 5 * BEAT, 14)) * 20 * u}px`,
            }}
          >
            a creative studio
          </div>
        </AbsoluteFill>
      )}
    </Dark>
  );
};

// ---------------------------------------------------------------- 3. one bar per craft
const Icon: React.FC<{ k: number; t: number; size: number; color: string }> = ({ k, t, size, color }) => {
  const { fps } = useVideoConfig();
  const pop = (at: number) => spring({ frame: t - at, fps, config: { damping: 11, stiffness: 170 } });
  const box: React.CSSProperties = { position: "relative", width: size, height: size };
  const S = size / 100;

  if (k === 0) {
    // Brand: three shapes slide in and lock into a monogram mark
    const lock = prog(t, 3 * BEAT, 10, EASE_IN_OUT);
    return (
      <div style={box}>
        {TRIO.map((s, i) => {
          const p = pop(i * BEAT);
          const from = [[-80, -50], [80, -50], [0, 80]][i];
          const to = [[-26, -14], [26, -14], [0, 30]][i];
          const x = interpolate(lock, [0, 1], [from[0] * (1 - p) + to[0] * 1.8, to[0]]);
          const y = interpolate(lock, [0, 1], [from[1] * (1 - p) + to[1] * 1.8, to[1]]);
          return (
            <At key={i} x={size / 2 + x * S} y={size / 2 + y * S} style={{ rotate: `${(1 - lock) * 90 * (i - 1)}deg`, opacity: Math.min(1, p * 2) }}>
              <Shape kind={s.kind} size={46 * S} color={i === 0 ? color : s.color} fill={0.9} stroke={0} />
            </At>
          );
        })}
      </div>
    );
  }
  if (k === 1) {
    // Web: a browser draws, then the page builds block by block on the beats
    const frameDraw = prog(t, 0, 12);
    const blocks = [
      { x: 8, y: 22, w: 84, h: 12, at: BEAT },
      { x: 8, y: 38, w: 52, h: 26, at: 2 * BEAT },
      { x: 64, y: 38, w: 28, h: 26, at: 2 * BEAT + 4 },
      { x: 8, y: 68, w: 26, h: 22, at: 3 * BEAT },
      { x: 37, y: 68, w: 26, h: 22, at: 3 * BEAT + 3 },
      { x: 66, y: 68, w: 26, h: 22, at: 3 * BEAT + 6 },
    ];
    return (
      <div style={box}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 6 * S, border: `${2.4 * S}px solid ${C.ink}`, clipPath: `inset(0 ${100 - frameDraw * 100}% 0 0)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14 * S, borderBottom: `${2 * S}px solid ${C.ink}`, opacity: frameDraw }} />
        {[0, 1, 2].map((d) => (
          <div key={d} style={{ position: "absolute", left: (5 + d * 6) * S, top: 5 * S, width: 4 * S, height: 4 * S, borderRadius: "50%", background: [C.coral, C.amber, C.moss][d], opacity: frameDraw }} />
        ))}
        {blocks.map((b, i) => {
          const p = pop(b.at);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: b.x * S,
                top: b.y * S,
                width: b.w * S,
                height: b.h * S,
                borderRadius: 3 * S,
                background: i === 0 ? color : i === 1 ? `${C.ink}e6` : `${C.ink}66`,
                scale: `${p} ${p}`,
                transformOrigin: "left top",
              }}
            />
          );
        })}
      </div>
    );
  }
  if (k === 2) {
    // Film: an aperture spins open, a play button pops, the scrubber runs
    const open = prog(t, 0, 2 * BEAT, EASE_IN_OUT);
    const blades = 6;
    return (
      <div style={box}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <circle cx={50} cy={46} r={40} fill="none" stroke={C.ink} strokeWidth={2.4} />
          <g transform={`rotate(${t * 3} 50 46)`}>
            {Array.from({ length: blades }).map((_, i) => {
              const a = (i / blades) * Math.PI * 2;
              const rIn = 6 + open * 24;
              const x1 = 50 + Math.cos(a) * rIn;
              const y1 = 46 + Math.sin(a) * rIn;
              const x2 = 50 + Math.cos(a + 1.2) * 40;
              const y2 = 46 + Math.sin(a + 1.2) * 40;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />;
            })}
          </g>
          <g transform={`translate(50 46) scale(${pop(2 * BEAT)})`}>
            <path d="M-9 -12 L14 0 L-9 12 Z" fill={C.ink} />
          </g>
          <line x1={10} y1={96} x2={90} y2={96} stroke={`${C.ink}44`} strokeWidth={3} strokeLinecap="round" />
          <line x1={10} y1={96} x2={10 + 80 * prog(t, BEAT, 3 * BEAT, (x) => x)} y2={96} stroke={color} strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (k === 3) {
    // Interactive: a pixel hero hops a block on every beat
    const beatT = (t % BEAT) / BEAT;
    const hop = Math.sin(Math.PI * beatT) * 34;
    const scroll = (t / BEAT) * 30;
    return (
      <div style={{ ...box, overflow: "hidden", borderRadius: 6 * S, border: `${2.4 * S}px solid ${C.ink}` }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14 * S, height: 2 * S, background: C.ink }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ position: "absolute", bottom: 16 * S, left: (40 + i * 30 - scroll + 15) * S, width: 10 * S, height: 10 * S, background: C.amber }} />
        ))}
        <div
          style={{
            position: "absolute",
            left: 22 * S,
            bottom: (16 + hop) * S,
            width: 14 * S,
            height: 14 * S,
            background: color,
            rotate: `${beatT * 90}deg`,
            boxShadow: `0 0 ${10 * S}px ${color}`,
          }}
        />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", right: (6 + i * 8) * S, top: 6 * S, width: 5 * S, height: 5 * S, background: i < 1 + Math.floor(t / (BEAT * 1.5)) ? C.coral : `${C.ink}33` }} />
        ))}
      </div>
    );
  }
  // UI/UX: a cursor glides to a toggle, clicks it on the beat, a heart pops
  const move = prog(t, 0, BEAT + 6, EASE_IN_OUT);
  const on = t >= BEAT + 8;
  const knob = prog(t, BEAT + 8, 8);
  const heart = pop(3 * BEAT);
  return (
    <div style={box}>
      <div style={{ position: "absolute", left: 6 * S, top: 8 * S, width: 88 * S, height: 56 * S, borderRadius: 8 * S, background: `${C.ink}14`, border: `${2 * S}px solid ${C.ink}55` }}>
        <div style={{ position: "absolute", left: 8 * S, top: 10 * S, width: 40 * S, height: 6 * S, borderRadius: 3 * S, background: `${C.ink}aa` }} />
        <div style={{ position: "absolute", left: 8 * S, top: 22 * S, width: 28 * S, height: 4 * S, borderRadius: 2 * S, background: `${C.ink}55` }} />
        <div style={{ position: "absolute", right: 8 * S, top: 34 * S, width: 30 * S, height: 16 * S, borderRadius: 8 * S, background: on ? color : `${C.ink}33` }}>
          <div style={{ position: "absolute", top: 2 * S, left: (2 + knob * 14) * S, width: 12 * S, height: 12 * S, borderRadius: "50%", background: C.ink }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 30 * S, top: 74 * S, fontSize: 22 * S, color: C.coral, scale: heart, opacity: Math.min(1, heart * 2) }}>♥</div>
      <svg
        width={16 * S}
        height={22 * S}
        viewBox="0 0 16 22"
        style={{
          position: "absolute",
          left: interpolate(move, [0, 1], [10, 74]) * S,
          top: interpolate(move, [0, 1], [90, 46]) * S,
          scale: t >= BEAT + 6 && t < BEAT + 12 ? 0.85 : 1,
        }}
      >
        <path d="M1 1 L1 18 L5.5 13.5 L8.5 21 L11.5 19.8 L8.6 12.5 L15 12.5 Z" fill={C.ink} stroke={C.paperDeep} strokeWidth={1.2} />
      </svg>
    </div>
  );
};

export const Crafts: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, cx, cy, portrait, width } = useStage();
  const k = Math.min(SERVICES.length - 1, Math.floor(frame / BAR));
  const t = frame - k * BAR;
  const s = SERVICES[k];
  const prev = SERVICES[Math.max(0, k - 1)];
  const slide = k === 0 ? 1 : prog(t, 0, 9, EASE_IN_OUT);
  const iconSize = (portrait ? 520 : 420) * u;
  const title = prog(t, 4, 12);

  return (
    <AbsoluteFill style={{ backgroundColor: `color-mix(in srgb, ${prev.color} 22%, ${C.paperDeep})`, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundColor: `color-mix(in srgb, ${s.color} 22%, ${C.paperDeep})`, clipPath: `inset(0 0 0 ${(1 - slide) * 100}%)` }} />
      {/* big outlined index behind */}
      <div
        style={{
          position: "absolute",
          right: portrait ? 40 * u : 90 * u,
          top: portrait ? 140 * u : 60 * u,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: (portrait ? 300 : 340) * u,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `${2 * u}px ${s.color}66`,
          translate: `${(1 - slide) * 200 * u}px 0`,
        }}
      >
        0{k + 1}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: cy * 2,
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: (portrait ? 70 : 110) * u,
        }}
      >
        <div style={{ scale: 0.85 + 0.15 * prog(t, 0, 10), opacity: prog(t, 0, 6) }}>
          <Icon k={k} t={t} size={iconSize} color={s.color} />
        </div>
        <div style={{ textAlign: portrait ? "center" : "left", maxWidth: portrait ? width * 0.86 : 640 * u }}>
          <div style={{ fontFamily: F.mono, fontSize: 26 * u, letterSpacing: "0.3em", color: s.color, opacity: title }}>
            0{k + 1} / 0{SERVICES.length}
          </div>
          <div
            style={{
              marginTop: 14 * u,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: (portrait ? 92 : 96) * u,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: C.ink,
              opacity: title,
              translate: `0 ${(1 - title) * 30 * u}px`,
            }}
          >
            {s.title}
          </div>
        </div>
      </div>
      {/* bar progress dots */}
      <div style={{ position: "absolute", left: cx, top: cy * 2 - 10 * u, translate: "-50% 0", display: "flex", gap: 14 * u }}>
        {SERVICES.map((x, i) => (
          <div key={x.key} style={{ width: i === k ? 40 * u : 12 * u, height: 12 * u, borderRadius: 6 * u, background: i <= k ? x.color : `${C.ink}33` }} />
        ))}
      </div>
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4. idea → launch
const STEPS = ["Idea", "Sketch", "Build", "Launch"];

export const Process: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width, cy, stageH, portrait } = useStage();
  const top = cy - stageH / 2;
  const pts = STEPS.map((_, i) =>
    portrait
      ? { x: width * (i % 2 ? 0.68 : 0.32), y: top + stageH * (0.16 + i * 0.22) }
      : { x: width * (0.14 + i * 0.24), y: cy + (i % 2 ? 1 : -1) * stageH * 0.14 },
  );
  const at = (i: number) => BEAT + i * 3 * BEAT; // one node every three beats
  const travel = interpolate(frame, [at(0), at(3)], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const seg = Math.min(2, Math.floor(travel));
  const f = travel - seg;
  const dot = { x: pts[seg].x + (pts[seg + 1].x - pts[seg].x) * f, y: pts[seg].y + (pts[seg + 1].y - pts[seg].y) * f };
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const launch = prog(frame, at(3) + 4, 26, (x) => x * x * x);
  // Launch flies off the top corner on its side, away from the other steps.
  const fly = { x: (pts[3].x > width / 2 ? 1 : -1) * width * 0.5, y: -(pts[3].y + 200 * u) };

  return (
    <Dark>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={C.line} strokeWidth={4 * u} strokeDasharray={`${10 * u} ${12 * u}`} />
        <path d={d} fill="none" stroke={C.accent} strokeWidth={5 * u} pathLength={3} strokeDasharray={3} strokeDashoffset={3 - travel} strokeLinecap="round" />
      </svg>
      {pts.map((p, i) => {
        const s = spring({ frame: frame - at(i), fps, config: { damping: 10, stiffness: 170 } });
        const last = i === STEPS.length - 1;
        return (
          <At key={i} x={p.x} y={p.y}>
            <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
              <div
                style={{
                  width: 64 * u,
                  height: 64 * u,
                  borderRadius: "50%",
                  background: frame >= at(i) ? [C.accent, C.amber, C.moss, C.coral][i] : C.surface,
                  border: `${3 * u}px solid ${C.line}`,
                  scale: 0.6 + 0.4 * s,
                  translate: last ? `${launch * fly.x}px ${launch * fly.y}px` : undefined,
                  boxShadow: frame >= at(i) ? `0 0 ${40 * u}px ${[C.accent, C.amber, C.moss, C.coral][i]}88` : undefined,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 80 * u,
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 58 * u,
                  letterSpacing: "-0.03em",
                  color: C.ink,
                  whiteSpace: "nowrap",
                  opacity: Math.min(1, s * 1.5) * (last ? 1 - launch * 0.3 : 1),
                  translate: `0 ${(1 - s) * 20 * u}px`,
                }}
              >
                {STEPS[i]}
              </div>
            </div>
          </At>
        );
      })}
      {frame < at(3) && (
        <At x={dot.x} y={dot.y}>
          <div style={{ width: 24 * u, height: 24 * u, borderRadius: "50%", background: C.ink, boxShadow: `0 0 ${30 * u}px ${C.ink}` }} />
        </At>
      )}
      {/* launch trail: fading ghosts behind the flying node */}
      {launch > 0 &&
        [0.2, 0.4, 0.6, 0.8].map((k) => (
          <At key={k} x={pts[3].x + launch * k * fly.x} y={pts[3].y + launch * k * fly.y}>
            <div style={{ width: 64 * u * (0.4 + k * 0.5), height: 64 * u * (0.4 + k * 0.5), borderRadius: "50%", background: C.coral, opacity: k * 0.35 }} />
          </At>
        ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: portrait ? top - 30 * u : 70 * u,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 26 * u,
          letterSpacing: "0.35em",
          color: C.muted,
          opacity: prog(frame, 0, 12),
        }}
      >
        HOW WE WORK
      </div>
    </Dark>
  );
};

// ---------------------------------------------------------------- 5. the logo hit
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, cx, cy, portrait, width, height } = useStage();
  const build = prog(frame, 0, HIT, (x) => x * x);
  const hit = frame >= HIT;
  const logo = spring({ frame: frame - HIT, fps, config: { damping: 12, stiffness: 130 } });
  const flash = hit ? Math.max(0, 1 - (frame - HIT) / 10) : 0;
  const fadeEnd = interpolate(frame, [5 * BAR - 24, 5 * BAR], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = Math.min((width * 0.84) / (7 * 0.68), (portrait ? 200 : 230) * u);

  // Twelve shapes spiral in during the build and burst out on the hit.
  const cast = Array.from({ length: 12 }, (_, i) => ({ ...TRIO[i % 3], i }));
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep, overflow: "hidden", opacity: fadeEnd }}>
      {cast.map(({ kind, color, i }) => {
        const a = (i / cast.length) * Math.PI * 2 + build * Math.PI * 3 + (hit ? (frame - HIT) / 60 : 0);
        const rIn = Math.max(width, height) * 0.6 * (1 - build) + 30 * u;
        const burst = hit ? spring({ frame: frame - HIT, fps, config: { damping: 18, stiffness: 60 } }) : 0;
        const rad = hit ? 30 * u + burst * Math.max(width, height) * (0.36 + (i % 3) * 0.06) : rIn;
        return (
          <At key={i} x={cx + Math.cos(a) * rad} y={cy + Math.sin(a) * rad} style={{ rotate: `${frame * 4 + i * 30}deg`, opacity: hit ? 0.35 : 0.9 }}>
            <Shape kind={kind} size={(hit ? 90 : 70) * u} color={color} fill={hit ? 0.15 : 0.6} stroke={5} />
          </At>
        );
      })}
      {/* the opening's single point returns, swelling into the hit */}
      {!hit && (
        <At x={cx} y={cy}>
          <div
            style={{
              width: (26 + build * 120) * 2 * u,
              height: (26 + build * 120) * 2 * u,
              borderRadius: "50%",
              background: C.coral,
              boxShadow: `0 0 ${(40 + build * 160) * u}px ${C.coral}`,
              scale: 1 + Math.sin(frame / 2.2) * 0.04 * build,
            }}
          />
        </At>
      )}
      {hit &&
        [0, 1].map((k) => {
          const t = frame - HIT - k * 6;
          if (t < 0 || t > 40) return null;
          const s = t * 0.07;
          return (
            <At key={k} x={cx} y={cy}>
              <div style={{ width: 600 * u * s, height: 600 * u * s, borderRadius: "50%", border: `${(6 - k * 3) * u}px solid ${k ? C.coral : C.accent}`, opacity: 1 - t / 40 }} />
            </At>
          );
        })}
      {hit && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", height: cy * 2 }}>
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: size,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: C.ink,
              scale: interpolate(logo, [0, 1], [0.6, 1]),
              filter: `blur(${(1 - Math.min(1, logo)) * 12}px)`,
            }}
          >
            EXENOVA<span style={{ color: C.coral }}>.</span>
          </div>
          <div style={{ marginTop: 26 * u, fontFamily: F.body, fontSize: 40 * u, color: C.muted, opacity: prog(frame, HIT + 10, 14) }}>
            Design meets code meets story.
          </div>
          <div
            style={{
              marginTop: 36 * u,
              padding: `${14 * u}px ${30 * u}px`,
              borderRadius: 999,
              background: C.ink,
              color: C.paperDeep,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 34 * u,
              scale: spring({ frame: frame - (HIT + 2 * BAR), fps, config: { damping: 11 } }),
            }}
          >
            {SITE}
          </div>
          <div style={{ marginTop: 16 * u, fontFamily: F.mono, fontSize: 24 * u, letterSpacing: "0.2em", color: C.muted, opacity: prog(frame, HIT + 2 * BAR + 8, 12) }}>
            {HANDLE}
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ backgroundColor: C.ink, opacity: flash * 0.8, pointerEvents: "none" }} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
