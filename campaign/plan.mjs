// The 30-day plan. `node campaign/plan.mjs` writes plan.csv (for schedulers
// like Meta Business Suite / TikTok's scheduler) and PLAN.md next to this file.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const START = "2026-10-19"; // Monday
const SITE = "exenova-portfolio.vercel.app";
const TAGS = {
  core: "#Exenova #CreativeStudio #PHCreatives",
  brand: "#Branding #GraphicDesign #LogoDesign #BrandIdentity",
  web: "#WebDevelopment #WebDesign #Nextjs #UIUX",
  film: "#VideoEditing #Filmmaking #MusicVideo #ColorGrading",
  motion: "#MotionDesign #MotionGraphics #2DAnimation #Showreel",
  game: "#GameDev #IndieGame #InteractiveDesign #WebAR",
  hiring: "#Hiring #FreelancePH #CreativeJobs #RemoteWork",
};

// platform: TT = TikTok, IG = Instagram (Reel / Feed / Story), FB = Facebook
export const DAYS = [
  // ── Week 0: tease ──────────────────────────────────────────────
  { phase: "Tease", theme: "Countdown 3", platforms: "IG Story · FB Story", format: "Story", asset: "posters/Countdown-3.png", time: "19:00",
    caption: "Something new is coming. 3 days.", tags: TAGS.core, cta: "Turn on notifications" },
  { phase: "Tease", theme: "Countdown 2 + kinetic teaser", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:05)", asset: "videos/Showreel-9x16.mp4 (trim 0:03–0:08)", time: "20:00",
    caption: "Design. Code. Story. In 2 days, they meet. 👀", tags: `${TAGS.core} ${TAGS.motion}`, cta: "Follow so you don't miss it" },
  { phase: "Tease", theme: "Countdown 1", platforms: "IG Story · FB Story", format: "Story", asset: "posters/Countdown-1.png", time: "19:00",
    caption: "Tomorrow.", tags: TAGS.core, cta: "Set a reminder" },

  // ── Week 1: launch ─────────────────────────────────────────────
  { phase: "Launch", theme: "LAUNCH — the showreel", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:39)", asset: "videos/Showreel-9x16.mp4", time: "20:00",
    caption: "Exenova is now a team. Brand, web, film and interactive — designed, coded and told by one creative collective. This is our showreel. 🎬", tags: `${TAGS.core} ${TAGS.motion}`, cta: `Book a project → ${SITE}` },
  { phase: "Launch", theme: "Launch poster", platforms: "IG Feed · FB Post", format: "Image 4:5", asset: "posters/Poster-Launch-4x5.png", time: "12:00",
    caption: "Design meets code meets story. Exenova is now a creative collective — and our new site has a page for every member. Link in bio.", tags: `${TAGS.core} ${TAGS.brand}`, cta: "Visit the site" },
  { phase: "Launch", theme: "Showreel (landscape)", platforms: "FB Video", format: "Video 16:9 (0:39)", asset: "videos/Showreel-16x9.mp4", time: "20:00",
    caption: "Our 2026 showreel, in full. Every frame of this video was built in code — kinetic type, 2D animation and UI motion.", tags: `${TAGS.core} ${TAGS.motion}`, cta: "Share with someone who needs a creative team" },
  { phase: "Launch", theme: "Services overview", platforms: "TT · IG Reel", format: "Video 9:16", asset: "videos/Showreel-9x16.mp4 (trim Services scene 0:08–0:14)", time: "19:30",
    caption: "One team. Every craft. Which one do you need right now? 👇", tags: `${TAGS.core} ${TAGS.brand} ${TAGS.web}`, cta: "Comment your answer" },
  { phase: "Launch", theme: "Process carousel", platforms: "IG Feed · FB Post", format: "Carousel 6 × 4:5", asset: "posters/Process-0..5.png", time: "12:00",
    caption: "From idea to launch in 5 steps. Save this for your next project. 📌", tags: `${TAGS.core} ${TAGS.brand}`, cta: "Save & share" },
  { phase: "Launch", theme: "Behind the build (SaaS UI)", platforms: "TT · IG Reel", format: "Video 9:16", asset: "videos/Showreel-9x16.mp4 (trim SaaS scene 0:14–0:21)", time: "20:00",
    caption: "We don't just build sites — we built our own CMS, team pages and analytics. Want one like this?", tags: `${TAGS.core} ${TAGS.web}`, cta: "DM us 'SITE'" },
  { phase: "Launch", theme: "Quote #1", platforms: "IG Feed · FB Post", format: "Image 4:5", asset: "posters/Quote-1.png", time: "12:00",
    caption: "Kind words from a client. Thank you! 🙏", tags: TAGS.core, cta: "Work with us" },

  // ── Week 2: services deep dive ─────────────────────────────────
  { phase: "Services", theme: "Brand — ad", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:15)", asset: "videos/Ad-brand.mp4", time: "20:00",
    caption: "Your brand looks like everyone else's? Let's fix that. Logos, identity systems and campaign graphics people remember.", tags: `${TAGS.core} ${TAGS.brand}`, cta: `Get a quote → ${SITE}/services/brand-graphic-design` },
  { phase: "Services", theme: "Brand — poster + tip", platforms: "IG Feed · FB Post", format: "Carousel 2 × 4:5", asset: "posters/Poster-Service-brand.png + posters/Tip-logo.png", time: "12:00",
    caption: "3 signs your logo needs a refresh — swipe for #2. 👉", tags: `${TAGS.core} ${TAGS.brand}`, cta: "Save this" },
  { phase: "Services", theme: "Web — ad", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:15)", asset: "videos/Ad-web.mp4", time: "20:00",
    caption: "Still sending people to a link-in-bio? Get a fast site with a CMS you'll actually use.", tags: `${TAGS.core} ${TAGS.web}`, cta: `Get a quote → ${SITE}/services/web-development` },
  { phase: "Services", theme: "Web — poster + tip", platforms: "IG Feed · FB Post", format: "Carousel 2 × 4:5", asset: "posters/Poster-Service-web.png + posters/Tip-web.png", time: "12:00",
    caption: "Is your website slow? 3 fixes that make it feel instant.", tags: `${TAGS.core} ${TAGS.web}`, cta: "Save this" },
  { phase: "Services", theme: "Film — ad", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:15)", asset: "videos/Ad-film.mp4", time: "20:00",
    caption: "Scrolling past your own videos? Showreels, music videos, ads and short films — from concept to colour.", tags: `${TAGS.core} ${TAGS.film}`, cta: `Get a quote → ${SITE}/services/film-video-production` },
  { phase: "Services", theme: "Film — poster + tip", platforms: "IG Feed · FB Post", format: "Carousel 2 × 4:5", asset: "posters/Poster-Service-film.png + posters/Tip-video.png", time: "12:00",
    caption: "Hook viewers in 2 seconds — the rules we edit by.", tags: `${TAGS.core} ${TAGS.film}`, cta: "Save this" },
  { phase: "Services", theme: "Interactive & UI/UX — ads", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:15) × 2", asset: "videos/Ad-interactive.mp4, videos/Ad-uiux.mp4", time: "20:00",
    caption: "What if your audience could play it? Games, AR moments and interfaces people enjoy.", tags: `${TAGS.core} ${TAGS.game}`, cta: `Explore → ${SITE}/services` },

  // ── Week 3: team & recruitment ─────────────────────────────────
  { phase: "Team", theme: "Meet the collective", platforms: "IG Feed · FB Post", format: "Image 4:5", asset: "posters/Poster-Team-4x5.png", time: "12:00",
    caption: "Every member of Exenova gets their own page on our site. New faces every week — meet the first ones soon.", tags: TAGS.core, cta: `Meet the team → ${SITE}/team` },
  { phase: "Team", theme: "Recruitment ad", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16 (0:15)", asset: "videos/Ad-join.mp4", time: "20:00",
    caption: "Great work deserves a team behind it. We're looking for illustrators, editors, motion designers and developers. Remote. 🌏", tags: `${TAGS.core} ${TAGS.hiring}`, cta: `Apply → ${SITE}/join` },
  { phase: "Team", theme: "We're hiring (stories)", platforms: "IG Story · FB Story", format: "Story", asset: "posters/Poster-Join-9x16.png", time: "19:00",
    caption: "Tag a creative who should join us 👇", tags: TAGS.hiring, cta: "Link sticker → /join" },
  { phase: "Team", theme: "Team scene (2D)", platforms: "TT · IG Reel", format: "Video 9:16", asset: "videos/Showreel-9x16.mp4 (trim Team scene 0:31–0:36)", time: "20:00",
    caption: "Artists, developers & storytellers. One seat's still empty. 👀", tags: `${TAGS.core} ${TAGS.hiring}`, cta: "Apply via link in bio" },
  { phase: "Team", theme: "Client tip", platforms: "IG Feed · FB Post", format: "Image 4:5", asset: "posters/Tip-hire.png", time: "12:00",
    caption: "Before you hire a creative team, do these 3 things. You'll save time and money.", tags: TAGS.core, cta: "Save this" },
  { phase: "Team", theme: "Join poster (feed)", platforms: "IG Feed · FB Post · FB Groups", format: "Image 4:5", asset: "posters/Poster-Join-4x5.png", time: "12:00",
    caption: "Join the collective: your own page, real client work and credit on everything you touch.", tags: `${TAGS.core} ${TAGS.hiring}`, cta: `Apply → ${SITE}/join` },
  { phase: "Team", theme: "Quote #2", platforms: "IG Feed · FB Post", format: "Image 4:5", asset: "posters/Quote-2.png", time: "12:00",
    caption: "Balance looks with usability — always.", tags: TAGS.core, cta: "Work with us" },

  // ── Week 4: proof & conversion ─────────────────────────────────
  { phase: "Proof", theme: "Work montage", platforms: "TT · IG Reel · FB Reel", format: "Video 9:16", asset: "videos/Showreel-9x16.mp4 (trim Work scene 0:21–0:26)", time: "20:00",
    caption: "12+ projects shipped — brands, music videos, web apps and games. Which one should we break down next?", tags: `${TAGS.core} ${TAGS.motion}`, cta: "Comment a project name" },
  { phase: "Proof", theme: "Case study: brand", platforms: "IG Feed · FB Post", format: "Carousel (your project images)", asset: "Gallery: Magbungkal PH / BRWTL images from the site", time: "12:00",
    caption: "Case study: how we built a consistent identity for Magbungkal PH across every platform.", tags: `${TAGS.core} ${TAGS.brand}`, cta: "Read more on our site" },
  { phase: "Proof", theme: "Case study: film", platforms: "FB Video · IG Reel", format: "Repost (existing video)", asset: "Gallery: B-Desk Production showreel / Komorebi Films", time: "20:00",
    caption: "From our film work: on-set roles, edit and colour. Full credits on the site.", tags: `${TAGS.core} ${TAGS.film}`, cta: `See the gallery → ${SITE}/gallery` },
  { phase: "Proof", theme: "Quote #3", platforms: "IG Feed · FB Post", format: "Image 4:5", asset: "posters/Quote-3.png", time: "12:00",
    caption: "What clients say about working with us.", tags: TAGS.core, cta: "Work with us" },
  { phase: "Proof", theme: "Showreel (feed cut)", platforms: "IG Feed · FB Post", format: "Video 4:5 (0:39)", asset: "videos/Showreel-4x5.mp4", time: "20:00",
    caption: "In case you missed it: our 2026 showreel. Built in code, frame by frame.", tags: `${TAGS.core} ${TAGS.motion}`, cta: "Share it" },
  { phase: "Proof", theme: "Final CTA — booking", platforms: "All platforms + Stories", format: "Image 4:5 + Story", asset: "posters/Poster-Launch-4x5.png + posters/Poster-Launch-9x16.png", time: "19:00",
    caption: "30 days in. If you've got a brand, a site, a film or a game in mind, let's make it together. Free first call. ✨", tags: `${TAGS.core} ${TAGS.brand} ${TAGS.web} ${TAGS.film}`, cta: `Book → ${SITE}/#contact` },
];

// Calendar dates only, so do the arithmetic in UTC to avoid timezone shifts.
function dateFor(i) {
  const [y, m, d] = START.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const here = dirname(fileURLToPath(import.meta.url));
  const rows = DAYS.map((d, i) => ({ day: i + 1, date: dateFor(i), ...d }));
  const cols = ["day", "date", "time", "phase", "theme", "platforms", "format", "asset", "caption", "tags", "cta"];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  writeFileSync(join(here, "plan.csv"), [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n"));
  const md = [
    "# Exenova — 30-day social campaign",
    "",
    `Runs ${dateFor(0)} → ${dateFor(29)} on TikTok, Instagram and Facebook. Times are Philippine time (PHT).`,
    "Assets live in `out/` after a render (see README). Add a trending sound in-app for every video post.",
    "",
    "| Day | Date | Time | Phase | Post | Platforms | Asset |",
    "|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.day} | ${r.date} | ${r.time} | ${r.phase} | ${r.theme} | ${r.platforms} | \`${r.asset}\` |`),
    "",
    "## Captions",
    "",
    ...rows.flatMap((r) => [`**Day ${r.day} — ${r.theme}**`, "", r.caption, "", `CTA: ${r.cta}`, "", r.tags, ""]),
  ].join("\n");
  writeFileSync(join(here, "PLAN.md"), md);
  console.log(`Wrote ${rows.length} days to plan.csv and PLAN.md`);
}
