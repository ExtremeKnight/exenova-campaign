"""Voices a video's narration with a Microsoft neural voice (edge-tts).

Reads src/<folder>/narration.json, writes <vo folder>/<id>.mp3 (the "vo" key
in the JSON, default public/reel/audio/vo) and src/<folder>/narration-timing.json
(each line's length and word timings, used for the burned-in captions).

    pip install edge-tts
    python scripts/reel26-voice.py              # src/reel26 (Showreel 2026)
    python scripts/reel26-voice.py showreel     # the original showreel
    python scripts/reel26-voice.py motion26     # the motion-graphics reel
"""
import asyncio
import json
import os
import subprocess
import sys

import edge_tts

ROOT = os.path.join(os.path.dirname(__file__), "..")
FOLDER = sys.argv[1] if len(sys.argv) > 1 else "reel26"
SCRIPT = os.path.join(ROOT, "src", FOLDER, "narration.json")
VO_REL = json.load(open(SCRIPT, encoding="utf8")).get("vo", "reel/audio/vo")
VO = os.path.join(ROOT, "public", *VO_REL.split("/"))
TIMING = os.path.join(ROOT, "src", FOLDER, "narration-timing.json")


async def voice(line, cfg):
    comm = edge_tts.Communicate(line["text"], cfg["voice"], rate=cfg.get("rate", "+0%"), boundary="WordBoundary")
    words = []
    with open(os.path.join(VO, f"{line['id']}.mp3"), "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # offsets are in 100 ns units
                words.append({"t": round(chunk["offset"] / 1e7, 3), "d": round(chunk["duration"] / 1e7, 3), "w": chunk["text"]})
    end = round(words[-1]["t"] + words[-1]["d"], 3) if words else 0
    return {"id": line["id"], "at": line["at"], "text": line["text"], "dur": end, "words": words}


async def main():
    cfg = json.load(open(SCRIPT, encoding="utf8"))
    os.makedirs(VO, exist_ok=True)
    out = [await voice(line, cfg) for line in cfg["lines"]]
    json.dump({"voice": cfg["voice"], "lines": out}, open(TIMING, "w", encoding="utf8"), indent=1)
    for i, l in enumerate(out):
        nxt = out[i + 1]["at"] if i + 1 < len(out) else cfg.get("end", 60)
        gap = nxt - (l["at"] + l["dur"])
        print(f"{l['id']} {l['at']:5.1f}s + {l['dur']:4.2f}s -> ends {l['at'] + l['dur']:5.2f}s (gap {gap:+.2f}s)  {l['text'][:50]}")


asyncio.run(main())

# Level the lines so the voice sits clearly above the music.
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "reel26-vo-master.py"), VO_REL], check=True)
