"""Original soundtracks for the original showreel and the motion-graphics reel.

Synthesised here from the building blocks in reel26-audio.py (no samples),
so the music is ours to use anywhere. Both are 120 BPM, so one beat is 15
video frames at 30 fps and every cut in the videos lands on a beat.

    python scripts/score.py showreel   # public/showreel/audio/song.mp3
    python scripts/score.py motion26   # public/motion26/audio/song.mp3 + sfx/*.mp3
    python scripts/score.py motion26-sfx   # just the sfx

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
# Cuts (beats): boot 0, kinetic 6, services 12, saas 25, work 40, shapes 51,
# team 61, outro 70; the video ends at beat 78. E minor, synthwave.
SHOWREEL = [(0, "boot"), (6, "kinetic"), (12, "services"), (25, "saas"), (40, "work"), (51, "shapes"), (61, "team"), (70, "outro"), (78, "tail")]
SR_CHORDS = [["E3", "G3", "B3"], ["C3", "E3", "G3"], ["G3", "B3", "D4"], ["D3", "F#3", "A3"]]
SR_ROOTS = ["E1", "C1", "G1", "D1"]


def showreel_song():
    total_beats = 84
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

        # kinetic: a big stab on each of the five words
        if sec == "kinetic" and lb < 5:
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
    for into, length in ((6, 4), (12, 2), (40, 4), (61, 2), (70, 3)):
        place(fx, b.riser(length * BEAT), (into - length) * BEAT, 0.45)
    for at_beat, g in ((6, 0.75), (12, 0.5), (25, 0.35), (40, 0.7), (51, 0.45), (61, 0.6), (70, 0.85)):
        place(fx, b.boom(), at_beat * BEAT, g)
        place(hats, b.crash(), at_beat * BEAT, 0.9 if g > 0.5 else 0.5)
    for x in range(8):  # clap roll into the team
        place(drums, CL, (59 + x / 4) * BEAT, 0.2 + x * 0.07)

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
# Bars of 4 beats: open 0–3, type 3–7, crafts 7–12, process 12–15, build 15,
# logo hit on bar 16 (beat 64), hold and fade to bar 20. D minor, playful.
MOTION = [(0, "open"), (12, "type"), (28, "crafts"), (48, "process"), (60, "build"), (64, "hit"), (72, "fade")]
MO_CHORDS = [["D3", "F3", "A3", "C4"], ["A#2", "D3", "F3", "A3"], ["F3", "A3", "C4", "E4"], ["C3", "E3", "G3", "D4"]]
MO_ROOTS = ["D1", "A#0", "F1", "C1"]
# The mallet motif, one bar of eighths (scale degrees of D minor pentatonic)
MOTIF = ["D5", "F5", "A5", "C6", "A5", "F5", "G5", "A5"]


def motion_song():
    total_beats = 86
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
        elif sec == "open" and beat >= 4:
            place(hats, HC, t + BEAT / 2, 0.12 + 0.02 * (beat - 4))

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
                    g = 0.16 if sec != "fade" else 0.12 * max(0.2, 1 - (beat - 72) / 14)
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

    for into, length in ((12, 6), (28, 2), (64, 4)):
        place(fx, b.riser(length * BEAT), (into - length) * BEAT, 0.42)
    for at_beat, g in ((12, 0.75), (28, 0.6), (48, 0.3), (64, 0.9)):
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
    """The motion reel's own sound kit, tuned to the song (D minor pentatonic)
    so the pops and dings play little melodies on top of it."""
    out = {}

    def fade(x, ms=4):
        n = int(ms / 1000 * SR)
        x = x.copy()
        x[-n:] *= np.linspace(1, 0, n)
        return x

    def sweep_pan(mono, a, c):
        p = np.linspace(a, c, len(mono))
        return np.stack([mono * np.cos((p + 1) * np.pi / 4), mono * np.sin((p + 1) * np.pi / 4)], axis=1)

    def noise_sweep(dur, f0, f1, q=0.35):
        """Band-passed noise whose centre glides f0 -> f1 (a swoosh)."""
        n = int(dur * SR)
        x = rng.standard_normal(n + 2048)
        y = np.zeros(n)
        blk = 256
        for i in range(0, n, blk):
            fc = f0 * (f1 / f0) ** (i / n)
            seg = bp(x[i : i + 2048 + blk], fc * (1 - q), fc * (1 + q))
            m = len(y[i : i + blk])
            y[i : i + m] = seg[2048 : 2048 + m]
        return y / (np.max(np.abs(y)) + 1e-9)

    def pop(f, dur=0.32):
        """Tonal pop: a quick upward chirp into the note, plus a glassy octave."""
        t = secs(dur)
        ff = f * (0.55 + 0.45 * (1 - np.exp(-t * 140)))
        ph = 2 * np.pi * np.cumsum(ff) / SR
        x = np.sin(ph) + 0.25 * np.sin(2 * ph) * np.exp(-t * 30)
        click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 400) * 0.3
        return fade((x * np.exp(-t * 14) + click) * env_adsr(len(t), 0.001, 0.02, 1, 0.02))

    def bell(f, dur=1.4):
        t = secs(dur)
        x = np.sin(2 * np.pi * f * t + 1.8 * np.exp(-t * 4) * np.sin(2 * np.pi * 3.5 * f * t))
        x += 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)
        return fade(x * np.exp(-t * 3.2) * env_adsr(len(t), 0.002, 0.05, 1, 0.05))

    def square(f, dur):
        t = secs(dur)
        f = np.broadcast_to(f, t.shape)
        return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))

    for nm in ("D5", "F5", "G5", "A5", "C6", "D6", "F6", "G6", "A6"):
        out[f"pop-{nm}"] = stereo(pop(note(nm)) * 0.7, 0)
    for nm in ("A5", "D6", "F6", "A6", "D7"):
        out[f"bell-{nm}"] = reverb(stereo(bell(note(nm)) * 0.5, 0), 1.6, 0.3)

    # word stamps: a thump with a pitched body, rising D -> F -> A
    for nm in ("D3", "F3", "A3"):
        t = secs(0.55)
        thump = np.sin(2 * np.pi * np.cumsum(55 + 160 * np.exp(-t * 32)) / SR) * np.exp(-t * 8)
        body = (saw(note(nm), 0.55) * 0.5 + np.sin(2 * np.pi * note(nm) * 2 * t)) * np.exp(-t * 7)
        crack = lp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 35)
        x = np.tanh((thump * 1.2 + lp(body, 2400) * 0.45 + crack * 0.5) * 1.8) * 0.8
        out[f"stamp-{nm}"] = reverb(stereo(fade(x), 0), 0.9, 0.18)

    # swooshes that pan across, a short whip, a wipe that swells into a pop
    n = int(0.45 * SR)
    hump = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    out["swoosh"] = sweep_pan(noise_sweep(0.45, 500, 5000) * hump * 0.7, -0.7, 0.7)
    out["swoosh-back"] = sweep_pan(noise_sweep(0.45, 4500, 600) * hump * 0.7, 0.7, -0.7)
    n = int(0.14 * SR)
    out["whip"] = stereo(fade(noise_sweep(0.14, 1500, 9000, 0.5) * np.linspace(0, 1, n) ** 1.5), 0)
    n = int(0.27 * SR)
    sw = noise_sweep(0.27, 300, 3500) * np.linspace(0, 1, n) ** 2.5 * 0.6
    out["wipe"] = sweep_pan(np.concatenate([sw, pop(note("D6"), 0.25) * 0.6]), -0.3, 0.3)

    # zips and a falling whistle
    t = secs(0.16)
    out["zip-up"] = stereo(fade(np.sin(2 * np.pi * np.cumsum(400 * 8 ** (t / 0.16)) / SR) * np.sin(np.pi * t / 0.16) * 0.6), 0)
    t = secs(0.5)
    out["fall"] = stereo(fade(np.sin(2 * np.pi * np.cumsum(1900 * 0.3 ** (t / 0.5)) / SR) * np.linspace(0.2, 1, len(t)) * 0.4), 0)

    # rubbery landings: soft low thud + squish, three pitches
    for k, f0 in enumerate((180, 220, 260)):
        t = secs(0.3)
        x = np.sin(2 * np.pi * np.cumsum(f0 * 0.45 + f0 * np.exp(-t * 25)) / SR) * np.exp(-t * 16)
        squish = bp(rng.standard_normal(len(t)), 600, 2200) * np.exp(-t * 45) * 0.35
        out[f"thud-{k}"] = stereo(fade(np.tanh((x + squish) * 1.6) * 0.8), 0)

    # a pen drawing a shape: jittery scratch
    t = secs(0.45)
    jit = 1 + 0.5 * np.sin(2 * np.pi * 23 * t) * np.sin(2 * np.pi * 7 * t)
    out["draw"] = stereo(fade(bp(rng.standard_normal(len(t)), 2500, 7000) * jit * np.sin(np.pi * t / 0.45) * 0.35), 0)

    # bubble: a water-drop pop
    t = secs(0.12)
    out["bubble"] = stereo(fade(np.sin(2 * np.pi * np.cumsum(350 * 5 ** np.minimum(t / 0.06, 1.3)) / SR) * np.exp(-t * 35) * 0.7), 0)

    # snap: pieces locking together
    t = secs(0.15)
    x = bp(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 70) + np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 60) * 0.4
    out["snap"] = reverb(stereo(fade(x * 0.8), 0), 0.6, 0.2)

    # sparkle: a cascade of tiny bells up the scale, spread wide
    sp = np.zeros((int(1.3 * SR), 2))
    for i, nm in enumerate(("A6", "C7", "D7", "F7", "G7", "A7", "C8", "D8")):
        g = bell(note(nm), 0.5) * (0.35 - i * 0.025)
        place(sp, stereo(g, -0.8 + 1.6 * (i % 2)), 0.035 * i + rng.uniform(0, 0.012))
    out["sparkle"] = reverb(sp, 1.8, 0.35)

    # wiggle: a wobbling tone for the dancing letters
    t = secs(0.6)
    out["wiggle"] = stereo(fade(np.sin(2 * np.pi * np.cumsum(note("A5") * (1 + 0.06 * np.sin(2 * np.pi * 11 * t))) / SR) * np.sin(np.pi * t / 0.6) * 0.45), 0)

    # aperture: a rising whirr with a ratchet
    t = secs(0.9)
    gate = 0.6 + 0.4 * (np.sin(2 * np.pi * (14 + 20 * t) * t) > 0)
    out["whirr"] = stereo(fade(noise_sweep(0.9, 400, 2500, 0.25) * gate * np.linspace(0.2, 1, len(t)) * 0.7), 0)

    # chiptune: the hero's jump and the coin
    t = secs(0.14)
    out["chip-jump"] = stereo(fade(lp(square(note("D5") * 2 ** (t / 0.14), 0.14), 6000) * np.exp(-t * 8) * 0.28), 0)
    coin = np.concatenate([square(note("A6"), 0.06), square(note("D7"), 0.22) * np.exp(-secs(0.22) * 9)])
    out["chip-coin"] = stereo(fade(lp(coin, 7000) * 0.25), 0)

    # toggle: click down, click up
    t = secs(0.03)
    ck = (np.sin(2 * np.pi * 2600 * t) + hp(rng.standard_normal(len(t)), 4000) * 0.6) * np.exp(-t * 200)
    tog = np.zeros(int(0.2 * SR))
    place(tog, ck, 0, 0.7)
    place(tog, ck, 0.08, 1.0)
    out["toggle"] = stereo(tog * 0.6, 0)

    # a keyboard key
    t = secs(0.05)
    out["key"] = stereo(fade((hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 160) + np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 120) * 0.4) * 0.6), 0)

    # rocket: a launch that climbs and flies off to the side
    t = secs(1.1)
    ro = noise_sweep(1.1, 300, 6000, 0.4) * np.sin(np.pi * t / 1.1) ** 0.7 * 0.7 + np.sin(2 * np.pi * np.cumsum(200 * 10 ** (t / 1.1)) / SR) * 0.15 * np.exp(-t * 2)
    out["rocket"] = sweep_pan(fade(ro), 0, 0.8)

    # suck: a reversed swell that pulls into the logo hit
    t = secs(1.2)
    sw = noise_sweep(1.2, 200, 4000, 0.5) * (t / 1.2) ** 3 * 0.6 + np.sin(2 * np.pi * np.cumsum(60 + 140 * (t / 1.2) ** 2) / SR) * (t / 1.2) ** 2 * 0.5
    out["suck"] = stereo(fade(sw, 2), 0)
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
    elif which == "motion26-sfx":  # the sound kit only; leaves the song alone
        for name, x in motion_sfx().items():
            save_mp3(x * (0.9 / np.max(np.abs(x))), os.path.join(ROOT, "public", "motion26", "audio", "sfx", f"{name}.mp3"), "160k")
    elif which == "motion26":
        save_mp3(motion_song(), os.path.join(ROOT, "public", "motion26", "audio", "song.mp3"))
        for name, x in motion_sfx().items():
            save_mp3(x * (0.9 / np.max(np.abs(x))), os.path.join(ROOT, "public", "motion26", "audio", "sfx", f"{name}.mp3"), "160k")
    else:
        sys.exit("usage: python scripts/score.py showreel|motion26|motion26-sfx")
