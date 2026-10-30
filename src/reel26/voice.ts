import timing from "./narration-timing.json";
import { FPS } from "./timeline";

// Narration lines with their start time and word timings, written by
// scripts/reel26-voice.py. Visual beats (chips, portraits) key off the words,
// so they stay in sync if the narration is re-voiced.
export type VoiceLine = { id: string; at: number; text: string; dur: number; words: { t: number; d: number; w: string }[] };
export const VOICE: VoiceLine[] = timing.lines;

/** Global frame where a word in a line is spoken (first match). */
export function wordFrame(lineId: string, word: string): number {
  const line = VOICE.find((l) => l.id === lineId);
  const w = line?.words.find((x) => x.w.toLowerCase().startsWith(word.toLowerCase()));
  if (!line || !w) throw new Error(`No "${word}" in narration line ${lineId}`);
  return Math.round((line.at + w.t) * FPS);
}

export const lineFrame = (l: VoiceLine) => Math.round(l.at * FPS);
export const lineEndFrame = (l: VoiceLine) => Math.round((l.at + l.dur) * FPS);
