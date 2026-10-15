import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, MEMBERS, SITE } from "../brand";
import { Backdrop, EASE_IN_OUT, Eyebrow, Grain, SplitText, prog, useLayout } from "../fx";

// Full (360f): intro 0–150 · work showcase 150–300 · CTA 300–360.
// Compact (150f): the intro only, used back-to-back in "Meet the team".
export const SPOTLIGHT_FULL = 360;
export const SPOTLIGHT_COMPACT = 150;

export const MemberSpotlight: React.FC<{ slug: string; compact?: boolean }> = ({ slug, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width, height, portrait } = useLayout();
  const m = MEMBERS.find((x) => x.slug === slug) ?? MEMBERS[0];
  const first = m.name.split(" ")[0];

  const slab = prog(frame, 0, 22, EASE_IN_OUT);
  const rise = spring({ frame: frame - 6, fps, config: { damping: 15, stiffness: 90 } });
  // In the full cut the portrait steps aside for the work showcase.
  const aside = compact ? 0 : prog(frame, 150, 26, EASE_IN_OUT);
  const showcase = compact ? 0 : prog(frame, 160, 20);
  const cta = compact ? 0 : prog(frame, 300, 18);

  const photoH = (portrait ? 1180 : 940) * u;
  const marqueeX = -((frame * 4 * u) % (width * 1.2));

  return (
    <AbsoluteFill>
      <Backdrop tint={m.color} dark />

      {/* nickname marquee behind everything */}
      <div style={{ position: "absolute", top: height * (portrait ? 0.42 : 0.3), left: 0, display: "flex", whiteSpace: "nowrap", translate: `${marqueeX}px 0`, opacity: 0.9 * (1 - showcase * 0.7) }}>
        {[0, 1, 2, 3].map((k) => (
          <span key={k} style={{ fontFamily: F.display, fontWeight: 700, fontSize: 330 * u, lineHeight: 1, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: `${3 * u}px ${m.color}`, paddingRight: 80 * u }}>
            {m.nickname}
          </span>
        ))}
      </div>

      {/* colour slab + portrait */}
      <div
        style={{
          position: "absolute",
          left: interpolate(aside, [0, 1], [width / 2, portrait ? width * 0.22 : width * 0.16]),
          bottom: interpolate(aside, [0, 1], [0, portrait ? height * 0.66 : height * 0.5]),
          translate: "-50% 0",
          scale: interpolate(aside, [0, 1], [1, portrait ? 0.3 : 0.42]),
          transformOrigin: "50% 100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            translate: "-50% 0",
            width: photoH * 0.78,
            height: photoH * 0.82,
            borderRadius: `${photoH * 0.4}px ${photoH * 0.4}px ${40 * u}px ${40 * u}px`,
            background: `linear-gradient(180deg, ${m.color}, ${m.color}55)`,
            clipPath: `inset(${(1 - slab) * 100}% 0 0 0)`,
          }}
        />
        <Img
          src={staticFile(m.photo)}
          style={{
            position: "relative",
            height: photoH,
            width: photoH,
            objectFit: "contain",
            objectPosition: "bottom",
            translate: `0 ${(1 - rise) * 260 * u}px`,
            opacity: Math.min(1, rise * 1.5),
            scale: 1 + frame * 0.0004,
            filter: `drop-shadow(0 ${30 * u}px ${50 * u}px rgba(0,0,0,0.5))`,
          }}
        />
      </div>

      {/* identity */}
      <div
        style={{
          position: "absolute",
          left: 80 * u,
          right: 80 * u,
          top: (portrait ? 170 : 90) * u,
          display: "flex",
          flexDirection: "column",
          gap: 20 * u,
          opacity: 1 - showcase,
          translate: `0 ${-showcase * 60 * u}px`,
        }}
      >
        <Eyebrow color={m.color} start={14}>{m.discipline}</Eyebrow>
        <SplitText text={m.name} size={(portrait ? 112 : 104) * u} start={18} stagger={1} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * u }}>
          {m.roles.map((r, i) => {
            const p = spring({ frame: frame - 44 - i * 5, fps, config: { damping: 12 } });
            return (
              <span key={r} style={{ scale: p, opacity: Math.min(1, p), border: `${2.5 * u}px solid ${C.ink}`, borderRadius: 999, padding: `${10 * u}px ${24 * u}px`, fontFamily: F.display, fontWeight: 500, fontSize: 32 * u, color: C.ink, background: `${C.paperDeep}cc` }}>
                {r}
              </span>
            );
          })}
        </div>
      </div>

      {/* tagline card over the lower photo */}
      <div
        style={{
          position: "absolute",
          left: 80 * u,
          right: 80 * u,
          bottom: (portrait ? 150 : 70) * u,
          padding: `${28 * u}px ${34 * u}px`,
          borderRadius: 28 * u,
          background: `${C.paperDeep}e6`,
          border: `${2 * u}px solid ${m.color}66`,
          fontFamily: F.display,
          fontWeight: 500,
          fontSize: (portrait ? 44 : 38) * u,
          lineHeight: 1.25,
          color: C.ink,
          opacity: prog(frame, 76, 16) * (1 - showcase),
          translate: `0 ${(1 - prog(frame, 76, 16)) * 50 * u}px`,
        }}
      >
        “{m.tagline}”
      </div>

      {/* work showcase */}
      {!compact && (
        <div
          style={{
            position: "absolute",
            left: 80 * u,
            right: 80 * u,
            top: portrait ? height * 0.36 : height * 0.18,
            bottom: (portrait ? 220 : 90) * u,
            opacity: showcase * (1 - cta),
            display: "flex",
            flexDirection: "column",
            gap: 26 * u,
          }}
        >
          <Eyebrow color={m.color} start={164}>{m.works.length ? `Selected work · ${first}` : `${first}'s toolkit`}</Eyebrow>
          {m.works.some((w) => w.image) ? (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 * u, perspective: 1400 * u }}>
              {m.works.slice(0, 4).map((w, i) => {
                const p = spring({ frame: frame - 168 - i * 8, fps, config: { damping: 14 } });
                return (
                  <div key={w.title} style={{ borderRadius: 22 * u, overflow: "hidden", border: `${2 * u}px solid ${C.line}`, background: C.surface, opacity: Math.min(1, p), rotate: `x ${(1 - p) * 70}deg`, translate: `0 ${(1 - p) * 80 * u}px`, display: "flex", flexDirection: "column" }}>
                    {w.image && <Img src={staticFile(w.image)} style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", scale: 1 + (frame - 168) * 0.0008 }} />}
                    <div style={{ padding: `${14 * u}px ${18 * u}px`, fontFamily: F.display, fontWeight: 500, fontSize: 28 * u, color: C.ink }}>{w.title}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 * u }}>
              {(m.works.length ? m.works.map((w) => w.title) : m.tools.length ? m.tools : ["Profile coming soon"]).map((t, i) => {
                const p = spring({ frame: frame - 168 - i * 6, fps, config: { damping: 12 } });
                return (
                  <span key={t} style={{ scale: p, opacity: Math.min(1, p), fontFamily: F.display, fontWeight: 700, fontSize: 64 * u, color: i % 2 ? m.color : C.ink, letterSpacing: "-0.03em" }}>
                    {t}
                    {i < 9 && <span style={{ color: C.muted }}> /</span>}
                  </span>
                );
              })}
            </div>
          )}
          {m.tools.length > 0 && (
            <div style={{ fontFamily: F.mono, fontSize: 24 * u, color: C.muted, letterSpacing: "0.12em", opacity: prog(frame, 210, 16) }}>
              TOOLS · {m.tools.join(" · ").toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {!compact && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30 * u, opacity: cta, scale: interpolate(cta, [0, 1], [0.94, 1]) }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 120 * u, color: C.ink, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>
            Work with {first}<span style={{ color: m.color }}>.</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 30 * u, color: C.muted, textAlign: "center", overflowWrap: "anywhere", maxWidth: 900 * u }}>{SITE}/team</div>
          <div style={{ background: C.ink, color: C.paper, borderRadius: 999, padding: `${22 * u}px ${50 * u}px`, fontFamily: F.display, fontWeight: 700, fontSize: 42 * u }}>
            Exenova<span style={{ color: C.coral }}>.</span> collective
          </div>
        </div>
      )}
      <Grain />
    </AbsoluteFill>
  );
};
