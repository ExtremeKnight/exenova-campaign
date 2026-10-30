"""Builds the original soundtrack and sound effects for the 2026 showreel.

Everything is synthesised here (no samples), so the audio is ours to use
anywhere. 120 BPM, A minor: one bar = 2 s = 60 video frames at 30 fps, so
cuts in src/reel26 land on beats.

    python scripts/reel26-audio.py      # writes public/reel/audio/*.wav

The WAVs are converted to MP3 by scripts/reel26-encode.mjs.
"""
import os

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM  # 0.5 s
BAR = 4 * BEAT  # 2 s
BARS = 30  # 60 s
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "reel", "audio")
rng = np.random.default_rng(26)


def secs(n):
    return np.arange(int(n * SR)) / SR


def note(name):
    """'A2' -> Hz."""
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    n, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (octave - 4)) / 12)


# ---------------------------------------------------------------- building blocks
def lp(x, hz, order=2):
    return sosfilt(butter(order, min(hz, SR / 2.2), "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2.2)], "band", fs=SR, output="sos"), x)


def sweep_lp(x, start_hz, end_hz, block=512):
    """Low-pass whose cutoff glides exponentially from start to end."""
    out = np.zeros_like(x)
    zi = None
    n = len(x)
    for i in range(0, n, block):
        f = start_hz * (end_hz / start_hz) ** (i / max(1, n - 1))
        b, a = butter(2, min(f, SR / 2.2), "low", fs=SR)
        if zi is None:
            zi = np.zeros(max(len(a), len(b)) - 1)
        out[i : i + block], zi = lfilter(b, a, x[i : i + block], zi=zi)
    return out


def saw(freq, dur, detune_cents=0.0, phase=0.0):
    """Band-limited sawtooth (additive), freq in Hz."""
    t = secs(dur)
    f = freq * 2 ** (detune_cents / 1200)
    out = np.zeros_like(t)
    k = 1
    while k * f < SR / 2.5 and k <= 60:
        out += np.sin(2 * np.pi * k * f * t + phase * k) / k
        k += 1
    return out * (2 / np.pi)


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, sustain_time=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n) if sustain_time is None else int(sustain_time * SR)
    e = np.concatenate(
        [np.linspace(0, 1, a_n, endpoint=False), np.linspace(1, s, d_n, endpoint=False), np.full(s_n, s), np.linspace(s, 0, r_n)]
    )
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def place(track, sig, at_s, gain=1.0):
    i = int(round(at_s * SR))
    if i >= len(track):
        return
    j = min(len(track), i + len(sig))
    track[i:j] += sig[: j - i] * gain


def stereo(mono, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([mono * l, mono * r], axis=1)


def delay(st, time_s, fb=0.35, mix=0.3, pingpong=True):
    d = int(time_s * SR)
    out = st.copy()
    tap = st.copy()
    for k in range(1, 6):
        tap = np.roll(tap, d, axis=0)
        tap[:d] = 0
        tap = tap * fb
        if pingpong and k % 2 == 1:
            out += tap[:, ::-1] * mix
        else:
            out += tap * mix
    return out


def reverb(st, decay=1.6, mix=0.25):
    """Cheap stereo reverb: convolve with decaying filtered noise."""
    n = int(decay * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(st)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.5 / decay)
        ir = lp(ir, 6000)
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt(np.sum(ir**2))
        wet = np.fft.irfft(np.fft.rfft(st[:, ch], len(st) + n) * np.fft.rfft(ir, len(st) + n))[: len(st)]
        out[:, ch] = wet
    return st + out * mix


# ---------------------------------------------------------------- drums
def kick():
    t = secs(0.45)
    f = 46 + 120 * np.exp(-t * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 400) * 0.5
    return np.tanh((body + click) * 1.6) * 0.9


def clap():
    t = secs(0.3)
    noise = bp(rng.standard_normal(len(t)), 900, 6000)
    e = np.zeros_like(t)
    for k, off in enumerate([0, 0.011, 0.022]):
        e += np.where(t >= off, np.exp(-(t - off) * (180 if k < 2 else 22)), 0)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30) * 0.3
    return (noise * e * 0.6 + tone) * 0.8


def hat(open_=False):
    t = secs(0.32 if open_ else 0.06)
    x = hp(rng.standard_normal(len(t)), 7500, 4)
    return x * np.exp(-t * (11 if open_ else 70)) * (0.32 if open_ else 0.26)


def crash():
    t = secs(2.2)
    x = hp(rng.standard_normal(len(t)), 4500, 2)
    return x * np.exp(-t * 2.2) * 0.32


def boom():
    t = secs(1.6)
    f = 30 + 70 * np.exp(-t * 9)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    hit = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 18) * 0.5
    return np.tanh((body + hit) * 1.8) * 0.85


def riser(dur):
    t = secs(dur)
    x = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    block = 1024
    for i in range(0, len(t), block):
        p = i / len(t)
        lo = 300 + 5000 * p**2
        out[i : i + block] = bp(x[i : i + block + 64], lo, lo * 2.2)[:block][: len(out[i : i + block])]
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * (t / dur) ** 2) / SR) * 0.15
    return (out * 0.5 + tone) * (t / dur) ** 1.6


# ---------------------------------------------------------------- the song
CHORDS = [  # one bar each, A minor: Am - F - C - G
    ["A3", "C4", "E4"],
    ["F3", "A3", "C4"],
    ["C4", "E4", "G4"],
    ["G3", "B3", "D4"],
]
ROOTS = ["A1", "F1", "C2", "G1"]


def song():
    n = int((BARS * BAR + 3) * SR)
    drums = np.zeros(n)
    hats = np.zeros(n)
    bass = np.zeros(n)
    pad = np.zeros((n, 2))
    arp = np.zeros((n, 2))
    lead = np.zeros((n, 2))
    fx = np.zeros(n)

    K, CL, HC, HO = kick(), clap(), hat(), hat(True)
    kick_times = []

    def section(bar):
        if bar < 4:
            return "intro"
        if bar < 12:
            return "dropA"
        if bar < 18:
            return "services"
        if bar < 22:
            return "break"
        if bar < 26:
            return "team"
        if bar < 28:
            return "outro"
        return "tail"

    for bar in range(BARS):
        s = section(bar)
        t0 = bar * BAR
        chord = CHORDS[bar % 4]
        root = ROOTS[bar % 4]

        # -- drums
        if s in ("dropA", "services", "team", "outro"):
            for b in range(4):
                place(drums, K, t0 + b * BEAT)
                kick_times.append(t0 + b * BEAT)
            for b in (1, 3):
                place(drums, CL, t0 + b * BEAT, 0.9)
            for e in range(8):
                place(hats, HO if e % 2 == 1 and s == "team" else HC, t0 + e * BEAT / 2 + (BEAT / 2 if e % 2 == 0 else 0) * 0, 0.9 if e % 2 else 0.55)
            if s in ("services", "team"):
                for x in range(16):
                    if x % 2:
                        place(hats, HC, t0 + x * BEAT / 4, 0.35)
            # a clap roll into the next section
            if bar in (11, 17, 25):
                for x in range(8):
                    place(drums, CL, t0 + 3 * BEAT + x * BEAT / 8, 0.25 + x * 0.08)
        elif s == "break":
            # the breather: a soft kick on the one, a light clap, sparse hats
            place(drums, K, t0, 0.5)
            kick_times.append(t0)
            place(drums, CL, t0 + 2 * BEAT, 0.4)
            for e in range(4):
                place(hats, HC, t0 + e * BEAT + BEAT / 2, 0.25)
        elif s == "intro" and bar >= 2:
            for e in range(8):
                place(hats, HC, t0 + e * BEAT / 2, 0.15 + 0.05 * (bar - 2) + (0.1 if e % 2 else 0))

        # -- bass: offbeat eighths in drops, long notes in the break
        if s in ("dropA", "services", "team", "outro"):
            for e in range(8):
                f = note(root) * (2 if e in (3, 7) else 1)
                d = BEAT / 2 * 0.9
                x = (saw(f, d) * 0.7 + np.sin(2 * np.pi * f * secs(d)) * 0.6) * env_adsr(int(d * SR), 0.004, 0.08, 0.6, 0.04)
                place(bass, lp(x, 900), t0 + e * BEAT / 2, 0.55)
        elif s in ("break", "tail") or (s == "intro" and bar >= 2):
            d = BAR * 0.98
            f = note(root)
            x = (np.sin(2 * np.pi * f * secs(d)) + saw(f, d) * 0.3) * env_adsr(int(d * SR), 0.05, 0.3, 0.8, 0.4)
            place(bass, lp(x, 500), t0, {"break": 0.3, "tail": 0.4}.get(s, 0.5))

        # -- pad: detuned saw stack, one chord per bar
        d = BAR * 1.02
        voices = np.zeros(int(d * SR))
        for nm in chord:
            f = note(nm)
            for det in (-11, 0, 9):
                voices += saw(f, d, det, phase=rng.uniform(0, 6.28))
        voices *= env_adsr(len(voices), 0.25 if s in ("intro", "break", "tail") else 0.06, 0.4, 0.75, 0.3)
        cutoff = {"intro": 500 + 600 * bar, "break": 1400, "tail": 1600}.get(s, 2600)
        voices = lp(voices, cutoff) * (0.11 if s not in ("intro", "break", "tail") else 0.14)
        L = np.roll(voices, int(0.009 * SR))
        place(pad[:, 0], L, t0)
        place(pad[:, 1], voices, t0)

        # -- arp: 16th plucks over the chord tones
        if s in ("dropA", "services", "team", "outro", "break") or (s == "intro" and bar >= 1):
            tones = [note(x) * 2 for x in chord] + [note(chord[0]) * 4]
            pattern = [0, 1, 2, 3, 2, 1, 0, 2] if s != "services" else [0, 2, 3, 1, 3, 2, 0, 3]
            step = BEAT / 4 if s in ("dropA", "services", "team", "outro") else BEAT / 2
            count = int(BAR / step)
            for x in range(count):
                f = tones[pattern[x % len(pattern)]]
                dd = step * 0.95
                pl = saw(f, dd) * np.exp(-secs(dd) * 26)
                pl = lp(pl, 3500)
                place(arp[:, 0], pl, t0 + x * step, 0.11)
                place(arp[:, 1], pl, t0 + x * step, 0.11)

        # -- lead motif in the team and outro sections (hook)
        if s in ("team", "outro"):
            motif = [("E5", 0, 1), ("D5", 1, 0.5), ("C5", 1.5, 0.5), ("A4", 2, 1.5), ("G4", 3.5, 0.5)]
            if bar % 2 == 1:
                motif = [("C5", 0, 1), ("B4", 1, 0.5), ("A4", 1.5, 0.5), ("E5", 2, 2)]
            for nm, at, length in motif:
                dd = length * BEAT
                f = note(nm)
                vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * secs(dd))
                ph = 2 * np.pi * np.cumsum(f * vib) / SR
                tone = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * env_adsr(int(dd * SR), 0.02, 0.1, 0.8, 0.12)
                place(lead[:, 0], tone, t0 + at * BEAT, 0.12)
                place(lead[:, 1], tone, t0 + at * BEAT + 0.012, 0.12)

    # -- risers into the drops, impacts on the downbeats
    for bar_into in (4, 12, 22, 26):
        place(fx, riser(BAR * (2 if bar_into in (4, 22) else 1)), bar_into * BAR - BAR * (2 if bar_into in (4, 22) else 1), 0.5)
    for bar_at in (4, 12, 22, 28):
        place(fx, boom(), bar_at * BAR, 0.7)
        place(hats, crash(), bar_at * BAR, 1.0)

    # -- sidechain pump from the kick
    duck = np.ones(n)
    for kt in kick_times:
        i = int(kt * SR)
        m = int(0.22 * SR)
        seg = 1 - 0.55 * np.exp(-np.arange(m) / SR * 18)
        duck[i : i + m] = np.minimum(duck[i : i + m], seg[: len(duck[i : i + m])])
    pad *= duck[:, None]
    arp *= duck[:, None] ** 0.5
    bass *= duck**0.8

    arp = delay(arp, BEAT * 0.75, fb=0.35, mix=0.35)
    lead = delay(lead, BEAT * 0.75, fb=0.3, mix=0.25)
    pad = reverb(pad, 2.2, 0.35)
    lead = reverb(lead, 1.8, 0.25)
    arp = reverb(arp, 1.4, 0.2)

    mix = (
        stereo(drums, 0) * 0.95
        + stereo(hats, 0.12) * 0.9
        + stereo(bass, 0) * 0.95
        + pad
        + arp
        + lead
        + reverb(stereo(fx, 0), 2.5, 0.3) * 0.9
    )
    # gentle master: high-pass, soft clip, normalise, fade out the tail
    for ch in range(2):
        mix[:, ch] = hp(mix[:, ch], 28)
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    mix *= 0.89 / np.max(np.abs(mix))
    end = int((BARS * BAR + 3) * SR)
    fade = int(2.5 * SR)
    mix[end - fade : end] *= np.linspace(1, 0, fade)[:, None]
    return mix[:end]


# ---------------------------------------------------------------- sound effects
def sfx():
    out = {}
    t = secs(0.7)
    x = rng.standard_normal(len(t))
    e = np.sin(np.pi * np.clip(t / 0.7, 0, 1)) ** 2
    w = np.zeros_like(t)
    for i in range(0, len(t), 512):
        p = i / len(t)
        lo = 400 + 3200 * np.sin(np.pi * p)
        w[i : i + 512] = bp(x[i : i + 512 + 32], lo, lo * 1.8)[:512][: len(w[i : i + 512])]
    pan = np.linspace(-0.8, 0.8, len(t))
    out["whoosh"] = np.stack([w * e * np.cos((pan + 1) * np.pi / 4), w * e * np.sin((pan + 1) * np.pi / 4)], 1) * 0.9

    t = secs(0.35)
    sw = bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-((t - 0.12) ** 2) / 0.002)
    out["swipe"] = stereo(sw * 0.8, 0.3)

    out["impact"] = stereo(boom() * 0.9, 0)
    out["riser"] = stereo(riser(2.0) * 0.8, 0)

    t = secs(0.25)
    g = np.sign(np.sin(2 * np.pi * 70 * t)) * (rng.random(len(t)) > 0.4) * hp(rng.standard_normal(len(t)), 1500)
    g *= (np.floor(t * 60) % 2) * np.exp(-t * 8)
    out["glitch"] = stereo(lp(g, 9000) * 0.35, -0.2)

    t = secs(0.05)
    tick = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120)
    out["tick"] = stereo(tick * 0.45, 0)

    t = secs(0.22)
    sh = hp(rng.standard_normal(len(t)), 2000) * (np.exp(-t * 60) + np.where(t > 0.09, np.exp(-(t - 0.09) * 50), 0))
    out["shutter"] = stereo(sh * 0.5, 0.1)

    t = secs(1.8)
    sparkle = np.zeros_like(t)
    for k, f in enumerate([note("E6"), note("A6"), note("C7"), note("E7")]):
        start = k * 0.07
        tt = np.clip(t - start, 0, None)
        sparkle += np.where(t >= start, np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3.2), 0)
    out["shimmer"] = reverb(stereo(sparkle * 0.18, 0), 1.6, 0.4)

    t = secs(0.12)
    pop = np.sin(2 * np.pi * (500 + 900 * np.exp(-t * 40)) * t) * np.exp(-t * 35)
    out["pop"] = stereo(pop * 0.5, 0)
    return out


def write_wav(path, st):
    st = np.clip(st, -1, 1)
    data = (st * 32767).astype("<i2")
    with open(path, "wb") as f:
        n = len(data) * 4
        f.write(b"RIFF" + (36 + n).to_bytes(4, "little") + b"WAVEfmt ")
        f.write((16).to_bytes(4, "little") + (1).to_bytes(2, "little") + (2).to_bytes(2, "little"))
        f.write(SR.to_bytes(4, "little") + (SR * 4).to_bytes(4, "little") + (4).to_bytes(2, "little") + (16).to_bytes(2, "little"))
        f.write(b"data" + n.to_bytes(4, "little") + data.tobytes())


if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "sfx"), exist_ok=True)
    s = song()
    write_wav(os.path.join(OUT, "song.wav"), s)
    rms = np.sqrt(np.mean(s**2))
    print(f"song: {len(s) / SR:.1f}s, peak {np.max(np.abs(s)):.2f}, rms {20 * np.log10(rms):.1f} dBFS")
    for name, x in sfx().items():
        x = x * (0.9 / max(1e-6, np.max(np.abs(x))))
        write_wav(os.path.join(OUT, "sfx", f"{name}.wav"), x)
        print(f"sfx/{name}: {len(x) / SR:.2f}s")
