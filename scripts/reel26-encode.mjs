// Converts the showreel's generated WAVs (scripts/reel26-audio.py) to MP3s
// with Remotion's bundled ffmpeg, so the repo only carries small files.
//
//   node scripts/reel26-encode.mjs
import { execFileSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import path from "node:path";

const dir = path.resolve("public/reel/audio");
const jobs = [
  [path.join(dir, "song.wav"), "192k"],
  ...readdirSync(path.join(dir, "sfx"))
    .filter((f) => f.endsWith(".wav"))
    .map((f) => [path.join(dir, "sfx", f), "160k"]),
];
for (const [wav, rate] of jobs) {
  const mp3 = wav.replace(/\.wav$/, ".mp3");
  execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", rate, mp3], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  rmSync(wav);
  console.log(path.relative(process.cwd(), mp3));
}
