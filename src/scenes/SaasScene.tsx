import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SERVICES, SITE } from "../brand";
import { Backdrop, Counter, Eyebrow, Grain, TypeLine, prog, useLayout, EASE_IN_OUT } from "../fx";

// Window rises 0–30 · site hero until 110 · cursor clicks "Team" at 92 ·
// team grid 110–160 · admin dashboard 160–240 with counters, chart and a toast.
export const SaasScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, portrait } = useLayout();
  const W = (portrait ? 940 : 1180) * u;
  const H = (portrait ? 1180 : 760) * u;
  const rise = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });

  const viewB = prog(frame, 108, 14);
  const viewC = prog(frame, 160, 16);
  const s = W / 1180; // inner content scale relative to the landscape design

  // Cursor path: enter bottom-right → hover "Team" → hold → drift down.
  // "Team" sits ~142 design-px left of the nav's right edge, ~60 below the chrome.
  const teamX = W - 142 * s;
  const teamY = 52 * u + 60 * s;
  const cx = interpolate(frame, [40, 85, 120, 175, 200], [W * 0.95, teamX, teamX, W * 0.3, W * 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const cy = interpolate(frame, [40, 85, 120, 175, 200], [H * 0.95, teamY, teamY, H * 0.55, H * 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const click = prog(frame, 92, 18);

  return (
    <AbsoluteFill>
      <Backdrop tint={C.violet} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 50 * u }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * u, opacity: prog(frame, 6, 16) }}>
          <Eyebrow>Built in-house</Eyebrow>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: (portrait ? 64 : 58) * u, color: C.ink, letterSpacing: "-0.03em", textAlign: "center" }}>
            Our own CMS, team pages <span style={{ color: C.accent }}>&amp; analytics.</span>
          </div>
        </div>

        <div style={{ perspective: 2000 * u }}>
          <div
            style={{
              width: W,
              height: H,
              borderRadius: 28 * u,
              background: C.paper,
              border: `${2 * u}px solid ${C.line}`,
              overflow: "hidden",
              position: "relative",
              translate: `0 ${(1 - rise) * 400 * u}px`,
              rotate: `x ${(1 - rise) * 28}deg`,
              opacity: Math.min(1, rise * 1.6),
              boxShadow: `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.55), 0 0 ${120 * u}px ${C.violet}33`,
            }}
          >
            {/* Browser chrome */}
            <div style={{ height: 52 * u, display: "flex", alignItems: "center", gap: 10 * u, padding: `0 ${20 * u}px`, background: C.surface, borderBottom: `${1.5 * u}px solid ${C.line}` }}>
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                <div key={c} style={{ width: 14 * u, height: 14 * u, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ marginLeft: 16 * u, flex: 1, height: 32 * u, borderRadius: 999, background: C.paper, display: "flex", alignItems: "center", padding: `0 ${16 * u}px` }}>
                <TypeLine text={viewC > 0.5 ? `${SITE}/admin` : viewB > 0.5 ? `${SITE}/team` : SITE} start={viewC > 0.5 ? 160 : viewB > 0.5 ? 108 : 10} cps={2.2} size={18 * u} color={C.muted} cursor={false} />
              </div>
            </div>

            {/* View A: site hero */}
            <div style={{ position: "absolute", inset: `${52 * u}px 0 0 0`, opacity: 1 - viewB, padding: 46 * s }}>
              <SiteNav s={s} highlight={click > 0 && click < 1} />
              <div style={{ marginTop: 60 * s, fontFamily: F.mono, fontSize: 16 * s, color: C.accent, letterSpacing: "0.3em" }}>CREATIVE STUDIO — 2026</div>
              <div style={{ marginTop: 18 * s, fontFamily: F.display, fontWeight: 700, fontSize: 96 * s, lineHeight: 0.95, color: C.ink, letterSpacing: "-0.04em" }}>
                Design meets<br />
                <span style={{ color: C.coral }}>code</span> meets<br />
                story<span style={{ color: C.coral }}>.</span>
              </div>
              <div style={{ marginTop: 36 * s, display: "flex", gap: 12 * s, flexWrap: "wrap" }}>
                {SERVICES.slice(0, 4).map((sv, i) => (
                  <div key={sv.key} style={{ border: `${2 * s}px solid ${C.ink}`, borderRadius: 999, padding: `${8 * s}px ${20 * s}px`, fontFamily: F.display, fontSize: 20 * s, color: C.ink, opacity: prog(frame, 30 + i * 5, 12) }}>
                    {sv.short}
                  </div>
                ))}
              </div>
            </div>

            {/* View B: team grid */}
            <div style={{ position: "absolute", inset: `${52 * u}px 0 0 0`, opacity: viewB * (1 - viewC), padding: 46 * s }}>
              <SiteNav s={s} />
              <div style={{ marginTop: 50 * s, fontFamily: F.display, fontWeight: 700, fontSize: 70 * s, color: C.ink }}>Meet Exenova.</div>
              <div style={{ marginTop: 30 * s, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 * s }}>
                {["SP", "AR", "JM", "KL", "RD", "+"].map((ini, i) => {
                  const pop = spring({ frame: frame - 114 - i * 4, fps, config: { damping: 12 } });
                  return (
                    <div key={i} style={{ background: C.surface, border: `${2 * s}px solid ${C.line}`, borderRadius: 22 * s, padding: 20 * s, scale: pop, opacity: Math.min(1, pop) }}>
                      <div style={{ width: 70 * s, height: 70 * s, borderRadius: 18 * s, border: `${2 * s}px solid ${C.line}`, display: "grid", placeItems: "center", fontFamily: F.display, fontWeight: 700, fontSize: 30 * s, color: ini === "+" ? C.coral : C.accent }}>
                        {ini}
                      </div>
                      <div style={{ marginTop: 14 * s, height: 14 * s, width: "70%", borderRadius: 8 * s, background: C.ink, opacity: 0.85 }} />
                      <div style={{ marginTop: 10 * s, height: 10 * s, width: "50%", borderRadius: 8 * s, background: C.muted, opacity: 0.6 }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View C: admin dashboard */}
            <div style={{ position: "absolute", inset: `${52 * u}px 0 0 0`, opacity: viewC, display: "flex", translate: `${(1 - viewC) * 60 * s}px 0` }}>
              <div style={{ width: 210 * s, borderRight: `${1.5 * s}px solid ${C.line}`, padding: 26 * s, display: "flex", flexDirection: "column", gap: 14 * s }}>
                <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 24 * s, color: C.ink }}>Dashboard<span style={{ color: C.coral }}>.</span></div>
                {["Members", "Services", "Projects", "Applications", "Inquiries"].map((l, i) => (
                  <div key={l} style={{ fontFamily: F.body, fontSize: 17 * s, color: i === 0 ? C.paper : C.muted, background: i === 0 ? C.ink : "transparent", borderRadius: 10 * s, padding: `${6 * s}px ${10 * s}px` }}>
                    {l}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 30 * s, display: "flex", flexDirection: "column", gap: 22 * s }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 * s }}>
                  {[
                    ["Team members", 6],
                    ["Services", 5],
                    ["Projects", 12],
                    ["Page views", 3842],
                  ].map(([label, n], i) => (
                    <div key={label as string} style={{ border: `${2 * s}px solid ${C.line}`, borderRadius: 18 * s, padding: 18 * s }}>
                      <Counter to={n as number} start={168 + i * 4} style={{ fontFamily: F.display, fontWeight: 700, fontSize: 40 * s, color: C.ink }} />
                      <div style={{ fontFamily: F.mono, fontSize: 12 * s, color: C.muted, letterSpacing: "0.12em", marginTop: 6 * s, textTransform: "uppercase" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, border: `${2 * s}px solid ${C.line}`, borderRadius: 18 * s, padding: 24 * s, display: "flex", alignItems: "flex-end", gap: 14 * s }}>
                  {[0.35, 0.55, 0.42, 0.7, 0.62, 0.85, 0.78, 0.95, 0.88, 1].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h * 100 * prog(frame, 172 + i * 3, 24)}%`,
                        borderRadius: `${8 * s}px ${8 * s}px 0 0`,
                        background: `linear-gradient(180deg, ${i > 6 ? C.coral : C.accent}, ${C.violet}55)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* toast */}
              <div
                style={{
                  position: "absolute",
                  right: 28 * s,
                  bottom: 28 * s,
                  background: C.ink,
                  color: C.paper,
                  borderRadius: 16 * s,
                  padding: `${16 * s}px ${22 * s}px`,
                  fontFamily: F.body,
                  fontWeight: 600,
                  fontSize: 20 * s,
                  translate: `0 ${(1 - prog(frame, 205, 14)) * 140 * s}px`,
                  opacity: prog(frame, 205, 10),
                }}
              >
                ✦ New application — Illustrator
              </div>
            </div>

            {/* cursor + click ripple */}
            <div style={{ position: "absolute", left: cx, top: cy, opacity: prog(frame, 40, 8) }}>
              <div style={{ position: "absolute", left: -40 * u, top: -40 * u, width: 80 * u, height: 80 * u, borderRadius: "50%", border: `${3 * u}px solid ${C.accent}`, scale: click * 1.6, opacity: click > 0 ? 1 - click : 0 }} />
              <svg width={34 * u} height={34 * u} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.6))" }}>
                <path d="M3 2l7 19 2.5-7.5L20 11z" fill={C.ink} stroke={C.paperDeep} strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

const SiteNav: React.FC<{ s: number; highlight?: boolean }> = ({ s, highlight }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18 * s, borderBottom: `${1.5 * s}px solid ${C.line}` }}>
    <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 28 * s, color: C.ink }}>
      Exenova<span style={{ color: C.coral }}>.</span>
    </div>
    <div style={{ display: "flex", gap: 26 * s, fontFamily: F.body, fontWeight: 500, fontSize: 18 * s }}>
      {["Services", "Work", "Team", "Join"].map((l) => (
        <span key={l} style={{ color: l === "Team" && highlight ? C.accent : C.ink }}>
          {l}
        </span>
      ))}
    </div>
  </div>
);
