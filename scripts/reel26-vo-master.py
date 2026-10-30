"""Levels the narration lines so the voice sits clearly above the music.

Raw edge-tts lines come out quiet (about -22 dBFS RMS) and vary line to
line. Each line gets a high-pass, gentle compression, a common loudness
(-12.5 dBFS RMS) and a soft peak limit, then is written back as MP3.
Run after scripts/reel26-voice.py (it calls this automatically).
"""
import glob
import os
import subprocess
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
VO = os.path.join(ROOT, "public", "reel", "audio", "vo")
TARGET_RMS_DB = -12.5
SR = 44100


def ffmpeg():
    plat = {"win32": "win32-x64-msvc", "darwin": "darwin-arm64", "linux": "linux-x64-gnu"}.get(sys.platform, "linux-x64-gnu")
    exe = "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg"
    return os.path.join(ROOT, "node_modules", "@remotion", f"compositor-{plat}", exe)


def decode(path):
    tmp = path + ".tmp.wav"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", tmp], check=True)
    with wave.open(tmp) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
    os.remove(tmp)
    return x


def encode(x, path):
    tmp = path + ".tmp.wav"
    data = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", tmp, "-c:a", "libmp3lame", "-b:a", "192k", path], check=True)
    os.remove(tmp)


def master(x):
    x = sosfilt(butter(2, 80, "high", fs=SR, output="sos"), x)
    # gentle compression: 3:1 above -24 dBFS on a 10 ms RMS envelope
    win = int(0.01 * SR)
    env = np.sqrt(np.convolve(x**2, np.ones(win) / win, mode="same") + 1e-12)
    env_db = 20 * np.log10(env)
    over = np.maximum(0, env_db - (-24))
    gain_db = -over * (1 - 1 / 3)
    # smooth the gain (attack/release)
    g = np.copy(gain_db)
    a_att, a_rel = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.08 * SR))
    for i in range(1, len(g)):
        coef = a_att if g[i] < g[i - 1] else a_rel
        g[i] = coef * g[i - 1] + (1 - coef) * g[i]
    x = x * 10 ** (g / 20)
    # common loudness, measured on the voiced parts only
    voiced = np.abs(x) > 0.01
    rms = np.sqrt(np.mean(x[voiced] ** 2)) if voiced.any() else 1e-6
    x = x * 10 ** ((TARGET_RMS_DB - 20 * np.log10(rms)) / 20)
    # soft limit peaks to about -1 dBFS
    return np.tanh(x / 0.89) * 0.89


if __name__ == "__main__":
    for path in sorted(glob.glob(os.path.join(VO, "*.mp3"))):
        x = master(decode(path))
        encode(x, path)
        v = x[np.abs(x) > 0.01]
        print(f"{os.path.basename(path)}: rms {20 * np.log10(np.sqrt(np.mean(v**2))):.1f} dBFS, peak {np.max(np.abs(x)):.2f}")
