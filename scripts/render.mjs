// Bundles once, then renders everything into out/.
//
//   node scripts/render.mjs              # all videos + stills
//   node scripts/render.mjs preview      # a few frames from each video + all stills (fast check)
//   ONLY=Ad-web,Poster-Join-4x5 node scripts/render.mjs
//   FRAMES=772,1540 ONLY=Reel26-4x5 node scripts/render.mjs preview   # those frames, full size
import path from "node:path";
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";

const mode = process.argv[2] === "preview" ? "preview" : "full";
const only = (process.env.ONLY || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const pick = (process.env.FRAMES || "")
  .split(",")
  .map(Number)
  .filter((n) => Number.isFinite(n) && n >= 0);
const out = path.resolve("out");

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = (await getCompositions(serveUrl)).filter(
  (c) =>
    !c.id.startsWith("Scene-") && (only.length === 0 || only.includes(c.id)),
);

for (const comp of comps) {
  const isStill = comp.durationInFrames === 1;
  const t0 = Date.now();
  if (isStill) {
    mkdirSync(path.join(out, "posters"), { recursive: true });
    await renderStill({
      composition: comp,
      serveUrl,
      output: path.join(out, "posters", `${comp.id}.png`),
      inputProps: comp.defaultProps,
    });
  } else if (mode === "preview") {
    mkdirSync(path.join(out, "previews"), { recursive: true });
    const n = Math.max(6, Math.round(comp.durationInFrames / 45));
    const frames = pick.length
      ? pick.filter((f) => f < comp.durationInFrames)
      : Array.from({ length: n }, (_, i) =>
          Math.min(
            comp.durationInFrames - 1,
            Math.round(((i + 0.5) / n) * comp.durationInFrames),
          ),
        );
    for (const frame of frames) {
      await renderStill({
        composition: comp,
        serveUrl,
        frame,
        output: path.join(
          out,
          "previews",
          `${comp.id}-f${String(frame).padStart(4, "0")}.jpg`,
        ),
        imageFormat: "jpeg",
        jpegQuality: 70,
        scale: pick.length ? 0.75 : 0.4,
        inputProps: comp.defaultProps,
      });
    }
  } else {
    mkdirSync(path.join(out, "videos"), { recursive: true });
    await renderMedia({
      composition: comp,
      serveUrl,
      codec: "h264",
      crf: 18,
      audioBitrate: "192k",
      outputLocation: path.join(out, "videos", `${comp.id}.mp4`),
      inputProps: comp.defaultProps,
      concurrency: null,
    });
  }
  console.log(
    `${comp.id.padEnd(28)} ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
}
