import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Same palette and type as the website (dark theme).
export const C = {
  paper: "#17130f",
  paperDeep: "#0d0b09",
  surface: "#201a15",
  ink: "#f2ede4",
  muted: "#a89f8c",
  line: "#362c22",
  accent: "#9880ff",
  violet: "#623fef",
  coral: "#ff6a4d",
  amber: "#ffb454",
  moss: "#7fae7d",
};

export const F = {
  display: loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily,
  body: loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).fontFamily,
};

export const SITE = "exenova-portfolio.vercel.app";
export const HANDLE = "@exenova";

export type ServiceKey = "brand" | "web" | "film" | "interactive" | "uiux";

export const SERVICES: {
  key: ServiceKey;
  slug: string;
  title: string;
  short: string;
  hook: string;
  pitch: string;
  deliverables: string[];
  work: string[];
  color: string;
}[] = [
  {
    key: "brand",
    slug: "brand-graphic-design",
    title: "Brand & Graphic Design",
    short: "Brand",
    hook: "Your brand looks like everyone else's?",
    pitch: "Logos, identity systems, packaging and campaign graphics people remember.",
    deliverables: ["Logo & identity system", "Brand guidelines", "Social & campaign graphics", "Print & packaging"],
    work: ["Magbungkal PH", "BRWTL Rebrand", "Hanea Crystara", "Persona Pixel"],
    color: C.accent,
  },
  {
    key: "web",
    slug: "web-development",
    title: "Web Development",
    short: "Web",
    hook: "Still sending people to a link-in-bio?",
    pitch: "Fast, accessible websites and web apps — with a CMS you can actually use.",
    deliverables: ["Design-to-code build", "CMS & admin dashboard", "Hosting & deployment", "Performance & SEO"],
    work: ["Exenova Labs", "Novamind", "DiscordSRV Embed", "This website"],
    color: C.coral,
  },
  {
    key: "film",
    slug: "film-video-production",
    title: "Film & Video Production",
    short: "Film",
    hook: "Scrolling past your own videos?",
    pitch: "Showreels, music videos, ads and short films — concept, shoot, edit, colour.",
    deliverables: ["Concept & storyboard", "Shoot & direction", "Edit & colour grade", "Social cut-downs"],
    work: ["B-Desk Production", "Komorebi Films", "AUX Studio", "coquette — MV"],
    color: C.amber,
  },
  {
    key: "interactive",
    slug: "interactive-games",
    title: "Interactive & Games",
    short: "Interactive",
    hook: "What if your audience could play it?",
    pitch: "Small games, AR moments and playful tools for web and mobile.",
    deliverables: ["Playable prototype", "Game & interaction design", "Web, mobile or AR build"],
    work: ["Egg Timer", "WebAR Exhibition", "Lantern Keeper"],
    color: C.moss,
  },
  {
    key: "uiux",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    short: "UI/UX",
    hook: "Users getting lost in your app?",
    pitch: "Interfaces people enjoy: flows, wireframes, prototypes and polished UI.",
    deliverables: ["User flows & wireframes", "High-fidelity UI", "Clickable prototype", "Design system"],
    work: ["Exenova CMS", "Novamind UI", "Team pages"],
    color: C.violet,
  },
];

export const PROJECTS = [
  "Magbungkal PH",
  "BRWTL Rebrand",
  "Hanea Crystara",
  "B-Desk Production",
  "Komorebi Films",
  "AUX Studio",
  "Egg Timer",
  "Exenova Labs",
  "Novamind",
  "DiscordSRV Embed",
  "Persona Pixel",
  "The Castaways",
];

export const ROLES = ["Illustrators & 2D artists", "Video editors & motion designers", "Web & game developers"];

export const TEAM = [
  { initials: "SP", role: "Design & Dev" },
  { initials: "??", role: "Illustrator" },
  { initials: "??", role: "Editor" },
  { initials: "??", role: "Developer" },
  { initials: "??", role: "Motion" },
  { initials: "??", role: "Sound" },
];
