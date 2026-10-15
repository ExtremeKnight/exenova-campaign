# Exenova — 30-day social campaign

Motion graphics, ads and posters for TikTok, Instagram and Facebook, built in code with [Remotion](https://www.remotion.dev) so every asset stays on-brand and can be re-rendered after a text change.

| Output | Formats | Compositions |
|---|---|---|
| Showreel (≈39 s) | 9:16 · 4:5 · 16:9 | `Showreel-9x16`, `Showreel-4x5`, `Showreel-16x9` |
| Ads (15 s) | 9:16 | `Ad-brand`, `Ad-web`, `Ad-film`, `Ad-interactive`, `Ad-uiux`, `Ad-join` |
| Posters | 4:5 feed · 9:16 story | `Poster-*`, `Process-0..5` (carousel), `Quote-*`, `Tip-*`, `Countdown-*` |

The day-by-day plan with captions, hashtags and posting times is in [`campaign/PLAN.md`](campaign/PLAN.md) (spreadsheet: `campaign/plan.csv`).

## Editing

- Brand colours, service copy, project names, open roles: `src/brand.ts`
- Showreel scene order and timing: `src/Showreel.tsx`; each scene is in `src/scenes/`
- Ad copy per service comes from `src/brand.ts`; the recruitment ad is `joinAd` in `src/Ads.tsx`
- Poster text: `defaultProps` in `src/Root.tsx`
- The plan: edit `campaign/plan.mjs`, then `node campaign/plan.mjs`

Preview everything interactively with `npm run dev` (Remotion Studio).

## Rendering

Rendering runs on GitHub Actions so it doesn't load the laptop: **Actions → Render campaign → Run workflow**.

- `preview` renders sample frames from each video plus all posters (a few minutes)
- `full` renders every MP4 and poster (≈15–20 minutes)
- `only` limits the run to some ids, e.g. `Ad-web,Poster-Join-4x5`

Download the result from the run's **Artifacts**. Locally: `node scripts/render.mjs [preview]`.

## Posting notes

- Videos ship with transition sound effects only — add a trending sound in TikTok / Instagram when posting.
- Burned-in text sits inside the 9:16 safe area, clear of the TikTok/Reels UI on the right and bottom.

Remotion is free for individuals and companies of up to 3 people; larger teams need a [company license](https://www.remotion.dev/license).
