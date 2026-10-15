import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F, HANDLE, MEMBERS, ROLES, SERVICES, SITE, type ServiceKey } from "./brand";
import { ServiceGlyph } from "./glyphs";
import { Backdrop, Grain, useLayout } from "./fx";

// Static artwork for feed posts (4:5) and stories (9:16). Nothing here animates:
// stills render a single frame.

const Frame: React.FC<{ tint?: string; children: React.ReactNode; footer?: string }> = ({ tint = C.accent, children, footer }) => {
  const { u, portrait } = useLayout();
  return (
    <AbsoluteFill>
      <Backdrop tint={tint} />
      <AbsoluteFill style={{ padding: `${(portrait ? 170 : 90) * u}px ${84 * u}px`, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 44 * u, color: C.ink, letterSpacing: "-0.02em" }}>
            Exenova<span style={{ color: C.coral }}>.</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 22 * u, letterSpacing: "0.2em", color: C.muted }}>{HANDLE.toUpperCase()}</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 * u }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `${2 * u}px solid ${C.line}`, paddingTop: 26 * u }}>
          <div style={{ fontFamily: F.mono, fontSize: 24 * u, color: C.ink }}>{SITE}{footer || ""}</div>
          <div style={{ width: 18 * u, height: 18 * u, borderRadius: "50%", background: tint }} />
        </div>
      </AbsoluteFill>
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.accent }) => {
  const { u } = useLayout();
  return (
    <div style={{ fontFamily: F.mono, fontSize: 26 * u, letterSpacing: "0.24em", textTransform: "uppercase", color, display: "flex", alignItems: "center", gap: 14 * u }}>
      <span style={{ width: 12 * u, height: 12 * u, borderRadius: "50%", background: color }} />
      {children}
    </div>
  );
};

const Big: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 128 }) => {
  const { u } = useLayout();
  return (
    <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: size * u, lineHeight: 0.95, letterSpacing: "-0.045em", color: C.ink }}>{children}</div>
  );
};

const Pill: React.FC<{ children: React.ReactNode; solid?: boolean }> = ({ children, solid }) => {
  const { u } = useLayout();
  return (
    <span
      style={{
        display: "inline-block",
        border: `${2.5 * u}px solid ${C.ink}`,
        background: solid ? C.ink : "transparent",
        color: solid ? C.paper : C.ink,
        borderRadius: 999,
        padding: `${12 * u}px ${30 * u}px`,
        fontFamily: F.display,
        fontWeight: 500,
        fontSize: 34 * u,
      }}
    >
      {children}
    </span>
  );
};

export const LaunchPoster: React.FC = () => {
  const { u } = useLayout();
  return (
    <Frame>
      <Label>Now a team</Label>
      <Big size={150}>
        Design meets <span style={{ color: C.coral }}>code</span> meets story<span style={{ color: C.coral }}>.</span>
      </Big>
      <div style={{ fontFamily: F.body, fontSize: 40 * u, lineHeight: 1.4, color: C.muted }}>
        Exenova is now a creative collective — brand, web, film and interactive under one roof.
      </div>
      <div style={{ display: "flex", gap: 34 * u, marginTop: 10 * u }}>
        {SERVICES.map((s) => (
          <ServiceGlyph key={s.key} kind={s.key} size={86 * u} color={s.color} />
        ))}
      </div>
    </Frame>
  );
};

export const ServicePoster: React.FC<{ service: ServiceKey; index: number }> = ({ service, index }) => {
  const { u } = useLayout();
  const s = SERVICES.find((x) => x.key === service)!;
  return (
    <Frame tint={s.color} footer={`/services/${s.slug}`}>
      <div style={{ position: "absolute", right: -170 * u, bottom: 110 * u, opacity: 0.38, filter: `drop-shadow(0 0 ${80 * u}px ${s.color}66)` }}>
        <ServiceGlyph kind={s.key} size={620 * u} color={s.color} filled={false} strokeWidth={10 * u} />
      </div>
      <Label color={s.color}>{String(index).padStart(2, "0")} — Services</Label>
      <Big size={128}>{s.title}<span style={{ color: s.color }}>.</span></Big>
      <div style={{ fontFamily: F.body, fontSize: 40 * u, lineHeight: 1.4, color: C.muted, maxWidth: 820 * u }}>{s.pitch}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 * u }}>
        {s.deliverables.map((d) => (
          <Pill key={d}>{d}</Pill>
        ))}
      </div>
      <div style={{ marginTop: 6 * u }}>
        <Pill solid>Get a quote →</Pill>
      </div>
    </Frame>
  );
};

export const JoinPoster: React.FC = () => {
  const { u } = useLayout();
  return (
    <Frame tint={C.coral} footer="/join">
      <Label color={C.coral}>We're hiring</Label>
      <Big size={150}>
        Join the <span style={{ color: C.coral }}>collective.</span>
      </Big>
      <div style={{ fontFamily: F.body, fontSize: 40 * u, lineHeight: 1.4, color: C.muted }}>Your own page. Real client work. Credit on everything you touch.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 * u }}>
        {ROLES.map((r) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `${2 * u}px solid ${C.line}`, background: C.surface, borderRadius: 22 * u, padding: `${24 * u}px ${30 * u}px` }}>
            <span style={{ fontFamily: F.display, fontWeight: 500, fontSize: 40 * u, color: C.ink }}>{r}</span>
            <span style={{ fontFamily: F.mono, fontSize: 22 * u, color: C.coral, letterSpacing: "0.15em" }}>REMOTE</span>
          </div>
        ))}
      </div>
    </Frame>
  );
};

export const TeamPoster: React.FC = () => {
  const { u } = useLayout();
  return (
    <Frame tint={C.violet} footer="/team">
      <Label>The collective</Label>
      <Big size={130}>Meet the people behind the work.</Big>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 * u, marginTop: 6 * u }}>
        {MEMBERS.map((m) => (
          <div key={m.slug} style={{ position: "relative", borderRadius: 30 * u, overflow: "hidden", background: `linear-gradient(180deg, ${m.color}, ${m.color}55)`, aspectRatio: "1.25" }}>
            <Img src={staticFile(m.photo)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `${40 * u}px ${20 * u}px ${16 * u}px`, background: `linear-gradient(0deg, ${C.paperDeep}f0, transparent)` }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 34 * u, color: C.ink }}>{m.name}</div>
              <div style={{ fontFamily: F.mono, fontSize: 18 * u, letterSpacing: "0.14em", color: m.color, textTransform: "uppercase" }}>{m.roles[0]}</div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
};

export const MemberPoster: React.FC<{ slug: string }> = ({ slug }) => {
  const { u } = useLayout();
  const m = MEMBERS.find((x) => x.slug === slug) ?? MEMBERS[0];
  return (
    <Frame tint={m.color} footer="/team">
      <div style={{ position: "absolute", left: 0, right: 0, top: 120 * u, fontFamily: F.display, fontWeight: 700, fontSize: 300 * u, lineHeight: 1, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: `${3 * u}px ${m.color}`, whiteSpace: "nowrap", textAlign: "center", opacity: 0.8 }}>
        {m.nickname}
      </div>
      <div style={{ position: "absolute", right: 30 * u, bottom: 110 * u, width: 640 * u, height: 860 * u }}>
        <div style={{ position: "absolute", left: "8%", right: "8%", bottom: 0, height: "78%", borderRadius: `${300 * u}px ${300 * u}px ${30 * u}px ${30 * u}px`, background: `linear-gradient(180deg, ${m.color}, ${m.color}44)` }} />
        <Img src={staticFile(m.photo)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }} />
      </div>
      <div style={{ position: "relative", maxWidth: 560 * u, display: "flex", flexDirection: "column", gap: 22 * u, marginTop: 260 * u }}>
        <Label color={m.color}>Meet the team</Label>
        <Big size={96}>{m.name}<span style={{ color: m.color }}>.</span></Big>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * u }}>
          {m.roles.slice(0, 4).map((r) => (
            <span key={r} style={{ fontFamily: F.display, fontWeight: 500, fontSize: 34 * u, color: C.ink }}>
              <span style={{ color: m.color }}>✦ </span>
              {r}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
};

const STEPS = [
  ["Brief", "We listen first: goals, audience, budget, deadline."],
  ["Concept", "Moodboards, sketches and a clear direction you sign off."],
  ["Make", "The right specialists on the team build it together."],
  ["Polish", "Revisions, details, and testing on every screen."],
  ["Launch", "We ship it, hand over files, and stay on call."],
];

export const ProcessSlide: React.FC<{ step: number }> = ({ step }) => {
  const { u } = useLayout();
  if (step === 0) {
    return (
      <Frame>
        <Label>How we work</Label>
        <Big size={160}>From idea to launch in 5 steps.</Big>
        <div style={{ fontFamily: F.mono, fontSize: 30 * u, color: C.accent, letterSpacing: "0.2em" }}>SWIPE →</div>
      </Frame>
    );
  }
  const [title, body] = STEPS[step - 1];
  return (
    <Frame tint={SERVICES[(step - 1) % SERVICES.length].color}>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 380 * u, lineHeight: 0.8, color: "transparent", WebkitTextStroke: `${4 * u}px ${C.accent}` }}>
        0{step}
      </div>
      <Big size={150}>{title}.</Big>
      <div style={{ fontFamily: F.body, fontSize: 46 * u, lineHeight: 1.4, color: C.muted }}>{body}</div>
      <div style={{ display: "flex", gap: 10 * u }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ height: 8 * u, flex: 1, borderRadius: 4 * u, background: i < step ? C.accent : C.line }} />
        ))}
      </div>
    </Frame>
  );
};

export const QuotePoster: React.FC<{ quote: string; who: string }> = ({ quote, who }) => {
  const { u } = useLayout();
  return (
    <Frame tint={C.amber}>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 260 * u, lineHeight: 0.6, color: C.amber }}>“</div>
      <div style={{ fontFamily: F.display, fontWeight: 500, fontSize: 70 * u, lineHeight: 1.15, letterSpacing: "-0.02em", color: C.ink }}>{quote}</div>
      <div style={{ fontFamily: F.mono, fontSize: 28 * u, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>— {who}</div>
    </Frame>
  );
};

export const TipPoster: React.FC<{ kicker: string; title: string; points: string[]; tint?: string }> = ({ kicker, title, points, tint = C.accent }) => {
  const { u } = useLayout();
  return (
    <Frame tint={tint}>
      <Label color={tint}>{kicker}</Label>
      <Big size={112}>{title}</Big>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 * u, marginTop: 8 * u }}>
        {points.map((p, i) => (
          <div key={p} style={{ display: "flex", gap: 26 * u, alignItems: "baseline" }}>
            <span style={{ fontFamily: F.mono, fontSize: 30 * u, color: tint }}>0{i + 1}</span>
            <span style={{ fontFamily: F.body, fontSize: 42 * u, lineHeight: 1.3, color: C.ink }}>{p}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
};

export const CountdownStory: React.FC<{ n: number; label: string }> = ({ n, label }) => {
  const { u } = useLayout();
  return (
    <Frame tint={C.coral}>
      <Label color={C.coral}>{label}</Label>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 620 * u, lineHeight: 0.85, letterSpacing: "-0.06em", color: C.ink }}>
        {n}
        <span style={{ color: C.coral }}>.</span>
      </div>
      <Big size={110}>{n === 1 ? "day to go." : "days to go."}</Big>
      <div style={{ fontFamily: F.body, fontSize: 40 * u, color: C.muted }}>Turn on notifications so you don't miss it.</div>
    </Frame>
  );
};
