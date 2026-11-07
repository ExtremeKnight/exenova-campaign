"""Original soundtracks for the original showreel and the motion-graphics reel.

Synthesised here from the building blocks in reel26-audio.py (no samples),
so the music is ours to use anywhere. Both are 120 BPM, so one beat is 15
video frames at 30 fps and every cut in the videos lands on a beat.

    python scripts/score.py showreel   # public/showreel/audio/song.mp3
    python scripts/score.py motion26   # public/motion26/audio/song.mp3 + sfx/*.mp3

Arrangements are written in beats from the start of the video; the section
boundaries match src/Showreel.tsx (SHOWREEL_SCENES) and src/motion26/timeline.ts.
"""
import importlib.util
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
_spec = importlib.util.spec_from_file_location("blocks", os.path.join(HERE, "reel26-audio.py"))
b = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(b)

SR, BEAT = b.SR, 0.5
secs, note, lp, hp, bp, saw = b.secs, b.note, b.lp, b.hp, b.bp, b.saw
env_adsr, place, stereo, delay, reverb = b.env_adsr, b.place, b.stereo, b.delay, b.reverb
rng = np.random.default_rng(1985)


# ---------------------------------------------------------------- extra voices
def snare():
    t = secs(0.4)
    body = np.sin(2 * np.pi * (180 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 22)
    noise = bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 13)
    return np.tanh((body * 0.7 + noise * 0.7) * 1.4) * 0.8


def marimba(f, dur=0.5):
    """FM mallet: bright attack that mellows fast."""
    t = secs(dur)
    idx = 2.2 * np.exp(-t * 22)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 4 * f * t))
    return x * np.exp(-t * 7.5) * env_adsr(len(t), 0.002, 0.05, 1, 0.03)


def supersaw(chord, dur, cutoff=3200):
    x = np.zeros(int(dur * SR))
    for nm in chord:
        for det in (-14, -6, 0, 7, 15):
            x += saw(note(nm), dur, det, phase=rng.uniform(0, 6.28))
    return lp(x, cutoff) / (len(chord) * 3)


def sub(f, dur, glide_from=None):
    t = secs(dur)
    ff = f if glide_from is None else f + (glide_from - f) * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(ff) / SR)
    x = np.tanh(x * 1.6) * env_adsr(len(t), 0.004, 0.1, 0.85, 0.05)
    return x


def lead_tone(f, dur):
    t = secs(dur)
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t * 3, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph) + 0.1 * np.sin(4 * ph)
    return lp(x, 4200) * env_adsr(len(t), 0.015, 0.12, 0.75, 0.12)


def master(mix, total_s, fade_s=2.5):
    for ch in range(2):
        mix[:, ch] = hp(mix[:, ch], 28)
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    mix *= 0.89 / np.max(np.abs(mix))
    end = int(total_s * SR)
    fade = int(fade_s * SR)
    mix[end - fade : end] *= np.linspace(1, 0, fade)[:, None]
    return mix[:end]


def pump(kick_beats, n, depth=0.55):
    duck = np.ones(n)
    for kb in kick_beats:
        i = int(kb * BEAT * SR)
        m = int(0.22 * SR)
        seg = 1 - depth * np.exp(-np.arange(m) / SR * 18)
        duck[i : i + m] = np.minimum(duck[i : i + m], seg[: len(duck[i : i + m])])
    return duck


def sections_at(sections):
    """[(start_beat, name)] -> beat -> (name, local beat)."""
    def at(beat):
        cur = sections[0]
        for s in sections:
            if beat >= s[0]:
                cur = s
        return cur[1], beat - cur[0]
    return at


# ---------------------------------------------------------------- the original showreel
# Cuts (beats): boot 0, kinetic 6, services 15, saas 28, work 43, shapes 54,
# team 64, outro 73; the video ends at beat 81. E minor, synthwave.
SHOWREEL = [(0, "boot"), (6, "kinetic"), (15, "services"), (28, "saas"), (43, "work"), (54, "shapes"), (64, "team"), (73, "outro"), (81, "tail")]
SR_CHORDS = [["E3", "G3", "B3"], ["C3", "E3", "G3"], ["G3", "B3", "D4"], ["D3", "F#3", "A3"]]
SR_ROOTS = ["E1", "C1", "G1", "D1"]


def showreel_song():
    total_beats = 87
    n = int(total_beats * BEAT * SR)
    drums, hats, bass, fx = np.zeros(n), np.zeros(n), np.zeros(n), np.zeros(n)
    pad, arp, lead, stabs = (np.zeros((n, 2)) for _ in range(4))
    K, CL, SN, HC, HO = b.kick(), b.clap(), snare(), b.hat(), b.hat(True)
    kicks = []
    at = sections_at(SHOWREEL)
    starts = {name: s for s, name in SHOWREEL}

    for beat in range(total_beats):
        sec, lb = at(beat)
        t = beat * BEAT
        ci = (lb // 4) % 4
        chord, root = SR_CHORDS[ci], SR_ROOTS[ci]
        full = sec in ("kinetic", "services", "work", "team")

        # drums
        if full:
            place(drums, K, t)
            kicks.append(beat)
            if lb % 2 == 1:
                place(drums, CL, t, 0.85)
                place(drums, SN, t, 0.45)
            place(hats, HO if sec in ("work", "team") else HC, t + BEAT / 2, 0.75)
            if sec in ("services", "work", "team"):
                for x in (1, 3):
                    place(hats, HC, t + x * BEAT / 4, 0.3)
        elif sec == "saas":
            if lb % 2 == 0:
                place(drums, K, t, 0.8)
                kicks.append(beat)
            if lb % 4 == 3:
                place(drums, SN, t, 0.4)
            place(hats, HC, t + BEAT / 2, 0.45)
        elif sec == "shapes":  # half-time
            if lb % 4 == 0:
                place(drums, K, t)
                kicks.append(beat)
            if lb % 4 == 2:
                place(drums, SN, t, 0.9)
                place(drums, CL, t, 0.5)
            place(hats, HC, t + BEAT / 2, 0.4)
        elif sec == "boot" and beat >= 2:
            place(hats, HC, t + BEAT / 2, 0.15 + 0.05 * beat)
        elif sec == "outro" and lb == 0:
            place(drums, K, t)

        # bass: driving octave eighths in the full parts
        if full or sec == "saas":
            for e in range(2):
                f = note(root) * (2 if e == 1 and sec != "saas" else 1)
                d = BEAT / 2 * 0.88
                x = (saw(f, d) * 0.7 + np.sin(2 * np.pi * f * secs(d)) * 0.6) * env_adsr(int(d * SR), 0.004, 0.07, 0.6, 0.03)
                place(bass, lp(x, 800 if sec != "saas" else 500), t + e * BEAT / 2, 0.55 if sec != "saas" else 0.4)
        elif sec == "shapes" and lb % 4 == 0:
            d = 4 * BEAT
            place(bass, sub(note(root) * 2, d) * 0.6, t, 0.6)

        # pad: one chord per 4 beats of a section (or until the next cut)
        if lb % 4 == 0 and sec != "tail":
            nxt = min([s for s, _ in SHOWREEL if s > beat] + [total_beats])
            d = min(4, nxt - beat) * BEAT + 0.05
            if sec == "outro":
                d = (total_beats - beat) * BEAT
                chord = ["E3", "B3", "E4", "G4"]
            v = np.zeros(int(d * SR))
            for nm in chord:
                for det in (-10, 0, 9):
                    v += saw(note(nm), d, det, phase=rng.uniform(0, 6.28))
            soft = sec in ("boot", "saas", "shapes", "outro")
            v *= env_adsr(len(v), 0.2 if soft else 0.04, 0.4, 0.75, 0.4 if sec == "outro" else 0.15)
            cutoff = 400 + 260 * beat if sec == "boot" else (1600 if soft else 2600)
            v = lp(v, cutoff) * (0.13 if soft else 0.1)
            place(pad[:, 0], np.roll(v, int(0.009 * SR)), t)
            place(pad[:, 1], v, t)

        # kinetic: a big stab on every word (every other beat)
        if sec == "kinetic" and lb % 2 == 0:
            st = supersaw([x[:-1] + str(int(x[-1]) + 1) for x in chord], 0.42, 5000) * np.exp(-secs(0.42) * 6)
            place(stabs[:, 0], st, t, 0.5)
            place(stabs[:, 1], np.roll(st, 300), t, 0.5)

        # arp: sixteenths over the chord
        if sec in ("services", "saas", "work", "shapes", "team"):
            tones = [note(x) * 2 for x in chord] + [note(chord[0]) * 4]
            pat = [0, 1, 2, 3] if sec != "saas" else [0, 2, 1, 3]
            for x in range(4):
                d = BEAT / 4 * 0.95
                pl = lp(saw(tones[pat[(lb * 4 + x) % 4]], d) * np.exp(-secs(d) * 24), 3600)
                place(arp[:, 0], pl, t + x * BEAT / 4, 0.1)
                place(arp[:, 1], pl, t + x * BEAT / 4, 0.1)

        # lead hook over work and team, written per 4-beat block
        if sec in ("work", "team") and lb % 4 == 0:
            hook = [("B4", 0, 1), ("D5", 1, 0.5), ("E5", 1.5, 1.5), ("G5", 3, 1)] if (lb // 4) % 2 == 0 else [("F#5", 0, 1), ("E5", 1, 0.5), ("D5", 1.5, 0.5), ("B4", 2, 2)]
            for nm, o, ln in hook:
                if beat + o >= [s for s, _ in SHOWREEL if s > beat][0]:
                    continue
                x = lead_tone(note(nm), ln * BEAT)
                place(lead[:, 0], x, t + o * BEAT, 0.11)
                place(lead[:, 1], x, t + o * BEAT + 0.012, 0.11)

    # risers into the big cuts, booms on them
    for into, length in ((6, 4), (15, 2), (43, 4), (64, 2), (73, 3)):
        place(fx, b.riser(length * BEAT), (into - length) * BEAT, 0.45)
    for at_beat, g in ((6, 0.75), (15, 0.5), (28, 0.35), (43, 0.7), (54, 0.45), (64, 0.6), (73, 0.85)):
        place(fx, b.boom(), at_beat * BEAT, g)
        place(hats, b.crash(), at_beat * BEAT, 0.9 if g > 0.5 else 0.5)
    for x in range(8):  # clap roll into the team
        place(drums, CL, (62 + x / 4) * BEAT, 0.2 + x * 0.07)

    duck = pump(kicks, n)
    pad *= duck[:, None]
    arp *= duck[:, None] ** 0.5
    bass *= duck**0.8
    arp = reverb(delay(arp, BEAT * 0.75, 0.35, 0.3), 1.4, 0.2)
    lead = reverb(delay(lead, BEAT * 0.75, 0.3, 0.25), 1.8, 0.28)
    pad = reverb(pad, 2.4, 0.35)
    stabs = reverb(stabs, 1.6, 0.3)
    mix = stereo(drums) * 0.95 + stereo(hats, 0.1) * 0.85 + stereo(bass) * 0.95 + pad + arp + lead + stabs + reverb(stereo(fx), 2.5, 0.3) * 0.9
    return master(mix, total_beats * BEAT)


# ---------------------------------------------------------------- the motion-graphics reel
# Bars of 4 beats: open 0–4, type 4–8, crafts 8–13, process 13–16, build 16,
# logo hit on bar 17 (beat 68), hold and fade to bar 21. D minor, playful.
MOTION = [(0, "open"), (16, "type"), (32, "crafts"), (52, "process"), (64, "build"), (68, "hit"), (76, "fade")]
MO_CHORDS = [["D3", "F3", "A3", "C4"], ["A#2", "D3", "F3", "A3"], ["F3", "A3", "C4", "E4"], ["C3", "E3", "G3", "D4"]]
MO_ROOTS = ["D1", "A#0", "F1", "C1"]
# The mallet motif, one bar of eighths (scale degrees of D minor pentatonic)
MOTIF = ["D5", "F5", "A5", "C6", "A5", "F5", "G5", "A5"]


def motion_song():
    total_beats = 90
    n = int(total_beats * BEAT * SR)
    drums, hats, bass, fx = np.zeros(n), np.zeros(n), np.zeros(n), np.zeros(n)
    pad, mallet, chords, lead = (np.zeros((n, 2)) for _ in range(4))
    K, CL, SN, HC, HO = b.kick(), b.clap(), snare(), b.hat(), b.hat(True)
    kicks = []
    at = sections_at(MOTION)

    for beat in range(total_beats):
        sec, lb = at(beat)
        t = beat * BEAT
        bar = beat // 4
        ci = bar % 4
        chord, root = MO_CHORDS[ci], MO_ROOTS[ci]
        bb = beat % 4  # beat in bar

        # ---- drums
        if sec == "type" or sec == "hit":  # half-time bounce
            if bb == 0:
                place(drums, K, t)
                kicks.append(beat)
            if bb == 2:
                place(drums, SN, t, 0.95)
                place(drums, CL, t, 0.55)
            if bb == 1:
                place(drums, K, t + BEAT / 2, 0.8)
                kicks.append(beat + 0.5)
            place(hats, HC, t, 0.35)
            place(hats, HC, t + BEAT / 2, 0.55)
        elif sec == "crafts":  # four on the floor
            place(drums, K, t)
            kicks.append(beat)
            if bb in (1, 3):
                place(drums, CL, t, 0.85)
            place(hats, HO, t + BEAT / 2, 0.6)
            for x in (1, 3):
                place(hats, HC, t + x * BEAT / 4, 0.28)
            if bb == 3:  # a little fill to mark every craft change
                for x in range(3):
                    place(drums, SN, t + BEAT / 4 + x * BEAT / 4, 0.25 + 0.1 * x)
        elif sec == "process":
            if bb in (1, 3):
                place(drums, CL, t, 0.4)
            place(hats, HC, t + BEAT / 2, 0.25)
        elif sec == "build":
            for x in range(4 if bb < 2 else 8):
                place(drums, SN, t + x * BEAT / (4 if bb < 2 else 8), 0.2 + 0.12 * lb)
        elif sec == "open" and beat >= 8:
            place(hats, HC, t + BEAT / 2, 0.12 + 0.02 * (beat - 8))

        # ---- bass
        if sec in ("type", "hit") and bb == 0:
            d = 4 * BEAT
            place(bass, sub(note(root) * 2, d, glide_from=note(root) * 3), t, 0.75)
        elif sec == "crafts":  # offbeat eighths, house style
            f = note(root) * 2
            d = BEAT / 2 * 0.85
            x = (saw(f, d) * 0.6 + np.sin(2 * np.pi * f * secs(d))) * env_adsr(int(d * SR), 0.004, 0.06, 0.6, 0.03)
            place(bass, lp(x, 700), t + BEAT / 2, 0.5)
        elif sec in ("process", "fade") and bb == 0:
            place(bass, sub(note(root) * 2, 4 * BEAT) * 0.5, t, 0.5)

        # ---- pad (soft) on every bar
        if bb == 0 and sec != "build":
            d = 4 * BEAT + 0.05 if sec != "fade" else (total_beats - beat) * BEAT
            v = np.zeros(int(d * SR))
            for nm in chord:
                for det in (-9, 0, 8):
                    v += saw(note(nm), d, det, phase=rng.uniform(0, 6.28))
            v *= env_adsr(len(v), 0.3, 0.4, 0.8, 0.5 if sec == "fade" else 0.2)
            cutoff = 450 + 70 * beat if sec == "open" else 1500
            v = lp(v, cutoff) * 0.09
            place(pad[:, 0], np.roll(v, int(0.011 * SR)), t)
            place(pad[:, 1], v, t)
        if sec == "build" and bb == 0:  # the build swells on one long chord
            d = 4 * BEAT
            v = b.sweep_lp(supersaw(["A2", "C#3", "E3", "A3"], d, 9000), 500, 7000)
            v *= np.linspace(0.2, 1, len(v)) ** 2
            place(chords[:, 0], v, t, 0.5)
            place(chords[:, 1], np.roll(v, 400), t, 0.5)

        # ---- gated supersaw chords (future-bass) on the drops
        if sec in ("type", "hit") and bb == 0:
            d = 4 * BEAT
            v = supersaw([x[:-1] + str(int(x[-1]) + 1) for x in chord], d, 5200)
            gate = np.zeros(len(v))
            pattern = [0, 0.75, 1.5, 2, 2.75, 3.5] if sec == "type" else [0, 1, 2, 3]
            for g in pattern:
                i = int(g * BEAT * SR)
                m = int(0.3 * SR)
                gate[i : i + m] = np.maximum(gate[i : i + m], np.exp(-np.arange(min(m, len(gate) - i)) / SR * 7))
            v *= gate
            place(chords[:, 0], v, t, 0.45)
            place(chords[:, 1], np.roll(v, 350), t, 0.45)

        # ---- the mallet motif (the reel's signature)
        if sec in ("open", "crafts", "process", "fade") or (sec == "type" and bar % 2 == 1):
            if not (sec == "open" and beat < 4):
                for e in range(2):
                    nm = MOTIF[(bb * 2 + e) % 8]
                    if ci == 1 and nm == "C6":
                        nm = "A#5"
                    g = 0.16 if sec != "fade" else 0.12 * max(0.2, 1 - (beat - 76) / 14)
                    x = marimba(note(nm), 0.6)
                    place(mallet[:, 0], x, t + e * BEAT / 2, g * (0.8 if e else 1))
                    place(mallet[:, 1], x, t + e * BEAT / 2 + 0.008, g * (1 if e else 0.8))
        if sec == "open" and beat in (0, 1, 2, 3):  # the dot bouncing in
            x = marimba(note("D5") * (1 + 0.5 * (beat % 2)), 0.5)
            place(mallet[:, 0], x, t, 0.22 - beat * 0.03)
            place(mallet[:, 1], x, t, 0.22 - beat * 0.03)

        # ---- a sung-style lead over the crafts' last bars and the hit
        if sec == "hit" and bb == 0:
            hook = [("A5", 0, 1), ("C6", 1, 0.5), ("D6", 1.5, 1.5), ("F6", 3, 1)] if bar % 2 == 1 else [("E6", 0, 1), ("D6", 1, 0.5), ("C6", 1.5, 0.5), ("A5", 2, 2)]
            for nm, o, ln in hook:
                x = lead_tone(note(nm) / 2, ln * BEAT)
                place(lead[:, 0], x, t + o * BEAT, 0.1)
                place(lead[:, 1], x, t + o * BEAT + 0.012, 0.1)

    for into, length in ((16, 8), (32, 2), (68, 4)):
        place(fx, b.riser(length * BEAT), (into - length) * BEAT, 0.42)
    for at_beat, g in ((16, 0.75), (32, 0.6), (52, 0.3), (68, 0.9)):
        place(fx, b.boom(), at_beat * BEAT, g)
        place(hats, b.crash(), at_beat * BEAT, 0.9 if g > 0.5 else 0.4)

    duck = pump(kicks, n, 0.6)
    pad *= duck[:, None]
    chords *= duck[:, None] ** 0.6
    bass *= duck**0.7
    mallet = reverb(delay(mallet, BEAT * 0.75, 0.32, 0.28), 1.6, 0.25)
    chords = reverb(chords, 1.4, 0.22)
    pad = reverb(pad, 2.6, 0.4)
    lead = reverb(delay(lead, BEAT * 0.75, 0.3, 0.25), 1.8, 0.3)
    mix = stereo(drums) * 0.95 + stereo(hats, -0.1) * 0.8 + stereo(bass) * 0.95 + pad + mallet + chords + lead + reverb(stereo(fx), 2.5, 0.3) * 0.9
    return master(mix, total_beats * BEAT, 3.0)


def motion_sfx():
    """Playful extras for the motion reel (the reel26 set covers the rest)."""
    out = {}
    t = secs(0.18)
    out["blip"] = stereo(np.sin(2 * np.pi * np.cumsum(700 + 1400 * (t / 0.18)) / SR) * np.exp(-t * 18) * 0.6, 0)
    t = secs(0.35)
    out["drop"] = stereo(np.sin(2 * np.pi * np.cumsum(900 * np.exp(-t * 7) + 180) / SR) * np.exp(-t * 9) * 0.6, 0)
    t = secs(0.5)
    thump = np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
    out["slam"] = stereo(np.tanh((thump + lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 30) * 0.6) * 2) * 0.8, 0)
    t = secs(0.04)
    out["click"] = stereo((np.sin(2 * np.pi * 3200 * t) + hp(rng.standard_normal(len(t)), 4000) * 0.5) * np.exp(-t * 160) * 0.5, 0)
    t = secs(0.6)
    out["boing"] = stereo(np.sin(2 * np.pi * np.cumsum(220 + 90 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)) / SR) * np.exp(-t * 6) * 0.55, 0)
    return out


# ---------------------------------------------------------------- output
def ffmpeg():
    plat = {"win32": "win32-x64-msvc", "darwin": "darwin-arm64", "linux": "linux-x64-gnu"}.get(sys.platform, "linux-x64-gnu")
    exe = "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg"
    return os.path.join(ROOT, "node_modules", "@remotion", f"compositor-{plat}", exe)


def save_mp3(st, path, rate="192k"):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    wav = path[:-4] + ".wav"
    b.write_wav(wav, st)
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", rate, path], check=True)
    os.remove(wav)
    print(f"{os.path.relpath(path, ROOT)}: {len(st) / SR:.1f}s, rms {20 * np.log10(np.sqrt(np.mean(st**2))):.1f} dBFS")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else ""
    if which == "showreel":
        save_mp3(showreel_song(), os.path.join(ROOT, "public", "showreel", "audio", "song.mp3"))
    elif which == "motion26":
        save_mp3(motion_song(), os.path.join(ROOT, "public", "motion26", "audio", "song.mp3"))
        for name, x in motion_sfx().items():
            save_mp3(x * (0.9 / np.max(np.abs(x))), os.path.join(ROOT, "public", "motion26", "audio", "sfx", f"{name}.mp3"), "160k")
    else:
        sys.exit("usage: python scripts/score.py showreel|motion26")
