"""Voices a video's narration with a Microsoft neural voice (edge-tts).

The whole script is read in ONE continuous take, then cut into its lines at
the pauses between words. Reading each line on its own made every line end
like a full stop, so lists and sentences that run across lines sounded
choppy; one take keeps the natural flow and intonation of a person reading.

Reads src/<folder>/narration.json, writes <vo folder>/<id>.mp3 (the "vo" key
in the JSON, default public/reel/audio/vo) and src/<folder>/narration-timing.json
(each line's length and word timings, used for captions and visual timing).

    pip install edge-tts
    python scripts/reel26-voice.py              # src/reel26 (Showreel 2026)
    python scripts/reel26-voice.py showreel     # the original showreel
    python scripts/reel26-voice.py motion26     # the motion-graphics reel
"""
import asyncio
import json
import os
import re
import subprocess
import sys
import wave

import edge_tts
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
FOLDER = sys.argv[1] if len(sys.argv) > 1 else "reel26"
SCRIPT = os.path.join(ROOT, "src", FOLDER, "narration.json")
VO_REL = json.load(open(SCRIPT, encoding="utf8")).get("vo", "reel/audio/vo")
VO = os.path.join(ROOT, "public", *VO_REL.split("/"))
TIMING = os.path.join(ROOT, "src", FOLDER, "narration-timing.json")
SR = 48000
LEAD, TAIL = 0.1, 0.3  # silence kept before a line's first word / after its last


def ffmpeg():
    plat = {"win32": "win32-x64-msvc", "darwin": "darwin-arm64", "linux": "linux-x64-gnu"}.get(sys.platform, "linux-x64-gnu")
    exe = "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg"
    return os.path.join(ROOT, "node_modules", "@remotion", f"compositor-{plat}", exe)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


async def take(text, cfg, path):
    comm = edge_tts.Communicate(text, cfg["voice"], rate=cfg.get("rate", "+0%"), pitch=cfg.get("pitch", "+0Hz"), boundary="WordBoundary")
    words = []
    with open(path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":  # offsets are in 100 ns units
                words.append({"t": chunk["offset"] / 1e7, "d": chunk["duration"] / 1e7, "w": chunk["text"]})
    return words


def split_words(lines, words):
    """Hand each line the spoken words that make up its text, in order."""
    out, k = [], 0
    for line in lines:
        need, got, mine = len(norm(line["text"])), 0, []
        while k < len(words) and got < need:
            mine.append(words[k])
            got += len(norm(words[k]["w"]))
            k += 1
        if not mine:
            raise SystemExit(f"no words matched line {line['id']}: {line['text']}")
        out.append(mine)
    return out


def main():
    cfg = json.load(open(SCRIPT, encoding="utf8"))
    lines = cfg["lines"]
    os.makedirs(VO, exist_ok=True)
    full = os.path.join(VO, "_take.mp3")
    words = asyncio.run(take(" ".join(l["text"].strip() for l in lines), cfg, full))
    tmp = full[:-4] + ".wav"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", full, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", tmp], check=True)
    with wave.open(tmp) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2") / 32768.0
    os.remove(full)
    os.remove(tmp)
    groups = split_words(lines, words)

    out = []
    for i, (line, ws) in enumerate(zip(lines, groups)):
        first, last_end = ws[0]["t"], ws[-1]["t"] + ws[-1]["d"]
        prev_end = groups[i - 1][-1]["t"] + groups[i - 1][-1]["d"] if i else 0.0
        next_start = groups[i + 1][0]["t"] if i + 1 < len(groups) else len(audio) / SR
        # cut in the pause between lines, never into the neighbouring words
        start = max(first - LEAD, (prev_end + first) / 2)
        end = min(last_end + TAIL, (last_end + next_start) / 2)
        clip = audio[int(start * SR) : int(end * SR)].copy()
        fi, fo = int(0.008 * SR), int(0.03 * SR)
        clip[:fi] *= np.linspace(0, 1, fi)
        clip[-fo:] *= np.linspace(1, 0, fo)
        dst = os.path.join(VO, f"{line['id']}.mp3")
        tmp = dst[:-4] + ".wav"
        with wave.open(tmp, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(clip, -1, 1) * 32767).astype("<i2").tobytes())
        subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", tmp, "-c:a", "libmp3lame", "-b:a", "128k", dst], check=True)
        os.remove(tmp)
        rel = [{"t": round(w["t"] - start, 3), "d": round(w["d"], 3), "w": w["w"]} for w in ws]
        out.append({"id": line["id"], "at": line["at"], "text": line["text"], "dur": round(last_end - start, 3), "words": rel})

    json.dump({"voice": cfg["voice"], "lines": out}, open(TIMING, "w", encoding="utf8"), indent=1)
    for i, l in enumerate(out):
        nxt = out[i + 1]["at"] if i + 1 < len(out) else cfg.get("end", 60)
        gap = nxt - (l["at"] + l["dur"])
        print(f"{l['id']} {l['at']:5.1f}s + {l['dur']:4.2f}s -> ends {l['at'] + l['dur']:5.2f}s (gap {gap:+.2f}s)  {l['text'][:50]}")


main()

# Level the lines so the voice sits clearly above the music.
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "reel26-vo-master.py"), VO_REL], check=True)
