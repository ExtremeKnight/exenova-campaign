# Exenova — 30-day social campaign

Motion graphics, ads and posters for TikTok, Instagram and Facebook, built in code with [Remotion](https://www.remotion.dev) so every asset stays on-brand and can be re-rendered after a text change.

| Output | Formats | Compositions |
|---|---|---|
| Showreel (≈39 s) | 9:16 · 4:5 · 16:9 | `Showreel-9x16`, `Showreel-4x5`, `Showreel-16x9` |
| Showreel 2026 (62 s) — music + SFX | 16:9 · 9:16 · 4:5 | `Reel26-16x9`, `Reel26-9x16`, `Reel26-4x5` |
| Showreel 2026 — narrated, captioned | 16:9 · 9:16 · 4:5 | `Reel26-Narrated-16x9`, `Reel26-Narrated-9x16`, `Reel26-Narrated-4x5` |
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

## Showreel 2026

A separate reel from the original Showreel, built from the team's real work: clips from the Quasar exhibit, Komorebi Films' *CAIN* and the BRWTL ad (`public/reel/clips`), illustrations and 3D stills, screens of the live site (`public/reel/site`) and the four members. Scenes live in `src/reel26/`; section timing is in `src/reel26/timeline.ts`.

- **Soundtrack:** original, synthesised in code — 120 BPM, A minor, 62 s, so every cut lands on a beat (one bar = 60 frames). Rebuild with `python scripts/reel26-audio.py && node scripts/reel26-encode.mjs` (needs numpy + scipy).
- **Sound effects:** whoosh, swipe, impact, riser, glitch, tick, shutter, shimmer, pop — synthesised by the same script, placed in `src/reel26/Reel26.tsx`.
- **Narration:** script in `src/reel26/narration.json`, voiced with Microsoft's neural `en-US-AndrewNeural` via `edge-tts`: `python scripts/reel26-voice.py`. It also writes word timings (`narration-timing.json`) that drive the captions, the feature chips and the team portraits, so re-voicing keeps everything in sync. The song ducks under the voice.

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
