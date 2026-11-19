"""Seabottles — "Lanza tu primera botella": gancho juguetón de 24 s en loop.
120 BPM, 12 compases (1 acorde por compás), re mayor que arranca en su relativo menor.
Bm G Em A | D D+ G Gm(silencio en el último pulso) | D D+ G A  -> vuelve a Bm.
Sorpresa: acorde aumentado D+ con la quinta que sube (A -> A#), y Gm prestado antes de abrir.
Instrumentos: ukelele, pianito de juguete, xilofón, melodía silbada doblada, coro "la la", bajo suave, palmas.
"""
import numpy as np, subprocess, sys

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
NBARS = 10
DUR = NBARS * BAR
N = int(DUR * SR)
rng = np.random.default_rng(7)

NOTES = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def hz(n):
    name, octv = n[:-1], int(n[-1])
    return 440 * 2 ** ((NOTES[name] + 12 * (octv + 1) - 69) / 12)

# tracks (stereo: L, R)
mix = np.zeros((2, N + SR * 3))

def place(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    L = np.sqrt(0.5 * (1 - pan)); R = np.sqrt(0.5 * (1 + pan))
    end = min(i + len(sig), mix.shape[1])
    mix[0, i:end] += sig[:end - i] * gain * L
    mix[1, i:end] += sig[:end - i] * gain * R

def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    hold = max(0, int(sus_len * SR) - a - d)
    e = np.concatenate([np.linspace(0, 1, a, endpoint=False), np.linspace(1, s, d, endpoint=False), np.full(hold, s), np.linspace(s, 0, r)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))

# ---------------- instruments ----------------
def pluck(f, dur, bright=0.5):           # Karplus-Strong (ukelele)
    n = int((dur + 0.6) * SR); per = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, per); out = np.zeros(n)
    for i in range(n):
        v = buf[i % per]; out[i] = v
        buf[i % per] = (1 - bright * 0.5) * 0.5 * (v + buf[(i + 1) % per]) * 0.996 + bright * 0.5 * v * 0.996 * 0
    return out * 0.6

def ks_fast(f, dur, damp=0.996):
    n = int((dur + 0.5) * SR); per = max(2, int(round(SR / f)))
    buf = rng.uniform(-1, 1, per)
    reps = n // per + 2
    out = np.empty(reps * per)
    for k in range(reps):
        out[k * per:(k + 1) * per] = buf
        buf = damp * 0.5 * (buf + np.roll(buf, -1))
    return out[:n] * 0.5

def toy_piano(f, dur):
    n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    parts = [(1, 1.0), (2.76, 0.35), (5.4, 0.18), (8.93, 0.08), (2.0, 0.25)]
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * (3 + m * 1.5)) for m, a in parts)
    s *= np.minimum(1, t / 0.002)
    return s * 0.5

def xylo(f, dur=0.4):
    n = int((dur + 0.6) * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.4 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22) + 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    return s * np.minimum(1, t / 0.001) * 0.55

def whistle(f, dur, detune=0.0):
    n = int((dur + 0.15) * SR); t = np.arange(n) / SR
    ff = f * 2 ** (detune / 1200)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.25)
    glide = 1 - 0.02 * np.exp(-t * 30)                      # little scoop into the note
    ph = 2 * np.cumsum(np.pi * ff * vib * glide / SR)
    s = np.sin(ph) + 0.06 * np.sin(2 * ph)
    breath = rng.normal(0, 1, n); breath = np.convolve(breath, np.ones(8) / 8, 'same') * 0.025
    e = env_adsr(n, 0.03, 0.08, 0.8, 0.12, dur)
    return (s + breath) * e * 0.42

def choir(f, dur, detune=0.0):          # "la la": soft saw through two vowel formants
    n = int((dur + 0.3) * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-7, 0, 7):
        ff = f * 2 ** ((d + detune) / 1200)
        ph = (ff * t + 0.003 * np.sin(2 * np.pi * 5 * t)) % 1
        out += 2 * ph - 1
    # crude formant filtering with two resonators (vowel "a": ~800 Hz, ~1200 Hz)
    from scipy.signal import lfilter
    y = np.zeros(n)
    for fc, bw, g in ((800, 120, 1.0), (1200, 150, 0.6), (2500, 200, 0.2)):
        r = np.exp(-np.pi * bw / SR); th = 2 * np.pi * fc / SR
        y += g * lfilter([1 - r], [1, -2 * r * np.cos(th), r * r], out)
    # "l" consonant: little dip at the start of each syllable
    e = env_adsr(n, 0.06, 0.1, 0.85, 0.25, dur)
    return y * e * 0.09

def bass(f, dur):
    n = int((dur + 0.2) * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return s * env_adsr(n, 0.01, 0.15, 0.6, 0.12, dur) * 0.55

def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    s = rng.normal(0, 1, n)
    e = np.zeros(n)
    for k, off in enumerate((0, 0.011, 0.022)):
        i = int(off * SR); e[i:] += np.exp(-(t[:n - i]) * (60 if k < 2 else 25))
    from scipy.signal import butter, lfilter
    b, a = butter(2, [900 / (SR / 2), 3500 / (SR / 2)], 'band')
    return lfilter(b, a, s * e) * 0.5

def shaker():
    n = int(0.08 * SR); t = np.arange(n) / SR
    from scipy.signal import butter, lfilter
    b, a = butter(2, 6000 / (SR / 2), 'high')
    return lfilter(b, a, rng.normal(0, 1, n)) * np.exp(-t * 60) * 0.25

def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 50 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9

def gliss(t0, notes, step=0.045, gain=0.5):
    for k, nt in enumerate(notes):
        place(xylo(hz(nt), 0.3), t0 + k * step, pan=-0.4 + 0.8 * k / max(1, len(notes) - 1), gain=gain)

# ---------------- harmony ----------------
CH = {
    'Bm': ['B3', 'D4', 'F#4'], 'G': ['G3', 'B3', 'D4'], 'Em': ['E3', 'G3', 'B3'], 'A': ['A3', 'C#4', 'E4'],
    'D': ['D4', 'F#4', 'A4'], 'D+': ['D4', 'F#4', 'A#4'], 'Gm': ['G3', 'Bb3', 'D4'],
}
ROOT = {'Bm': 'B1', 'G': 'G1', 'Em': 'E2', 'A': 'A1', 'D': 'D2', 'D+': 'D2', 'Gm': 'G1'}
PROG = ['D', 'D+', 'G', 'A', 'Bm', 'G', 'D', 'D+', 'G', 'A']
NIGHT = (4, 5)
FULL = 6
SILENCE = (99.0, 99.5)   # sin silencio: se escuchaba como un corte          # the drop before the payoff (bar 8, last beat)
PAYOFF = 12.0

# melody: (bar, beat, length in beats, note)
MEL = [
    # verse in minor: a 3-note motif, answered
    (0, 0, .5, 'F#5'), (0, .5, .5, 'D5'), (0, 1, 1, 'B4'), (0, 2.5, .5, 'C#5'), (0, 3, 1, 'D5'),
    (1, 0, .5, 'B4'), (1, .5, .5, 'D5'), (1, 1, 1, 'G5'), (1, 2.5, .5, 'F#5'), (1, 3, 1, 'D5'),
    (2, 0, .5, 'G4'), (2, .5, .5, 'B4'), (2, 1, 1, 'E5'), (2, 2.5, .5, 'D5'), (2, 3, 1, 'B4'),
    (3, 0, .5, 'C#5'), (3, .5, .5, 'E5'), (3, 1, 1.5, 'A5'), (3, 3, .5, 'G5'), (3, 3.5, .5, 'E5'),
]
CHORUS = [
    (0, 0, 1, 'F#5'), (0, 1, .5, 'A4'), (0, 1.5, .5, 'D5'), (0, 2, 1.5, 'A5'), (0, 3.5, .5, 'F#5'),
    (1, 0, 1, 'F#5'), (1, 1, .5, 'A#4'), (1, 1.5, .5, 'D5'), (1, 2, 1.5, 'A#5'), (1, 3.5, .5, 'B5'),
    (2, 0, 1, 'B5'), (2, 1, .5, 'G5'), (2, 1.5, .5, 'D5'), (2, 2, 1, 'E5'), (2, 3, 1, 'D5'),
]
VERSE = list(MEL)
MEL = [(b, bt, ln, nt) for b, bt, ln, nt in CHORUS]                                                   # 1-3: estribillo desde el segundo 0
MEL += [(3, 0, 1, 'E5'), (3, 1, .5, 'C#5'), (3, 1.5, .5, 'E5'), (3, 2, 1, 'A5'), (3, 3, 1, 'G5')]      # 4: A
MEL += [(b + 4, bt, ln, nt) for b, bt, ln, nt in VERSE if b in (0, 1)]                               # 5-6: la noche (Bm, G)
MEL += [(b + 6, bt, ln, nt) for b, bt, ln, nt in CHORUS]                                             # 7-9: estribillo con coro
MEL += [(9, 0, 1, 'E5'), (9, 1, .5, 'C#5'), (9, 1.5, .5, 'E5'), (9, 2, 1, 'A5'), (9, 3, 1, 'G5')]      # 10: A -> vuelve al inicio
THIRD_BELOW = {'F#5': 'D5', 'A4': 'F#4', 'D5': 'A4', 'A5': 'F#5', 'A#4': 'F#4', 'A#5': 'F#5', 'B5': 'G5', 'G5': 'D5', 'E5': 'C#5', 'C#5': 'A4'}

def t_of(bar, beat): return bar * BAR + beat * BEAT

# ---------------- arrangement ----------------
for bar, ch in enumerate(PROG):
    t0 = bar * BAR
    notes = CH[ch]
    # ukulele strum: down on 1, up-down on the "and"s (sparser in the verse)
    pattern = [0, 1.5, 2, 3] if (bar < 4 or bar in NIGHT) else [0, 1, 1.5, 2.5, 3, 3.5]
    for p in pattern:
        t = t0 + p * BEAT
        if SILENCE[0] - 1e-6 <= t < SILENCE[1]: continue
        down = (p % 1 == 0)
        order = notes if down else notes[::-1]
        for k, nt in enumerate(order):
            place(ks_fast(hz(nt), 0.5, 0.993), t + k * 0.012, pan=-0.3, gain=0.32 if down else 0.22)
    # bass on 1 and 3
    for p in (0, 2):
        t = t0 + p * BEAT
        if SILENCE[0] - 1e-6 <= t < SILENCE[1]: continue
        place(bass(hz(ROOT[ch]) * 2, BEAT * 1.6), t, gain=0.55)
    # toy piano "tic-tac" on the off-beats from the chorus
    if bar >= 4 and bar not in NIGHT:
        for p in (0.5, 1.5, 2.5, 3.5):
            t = t0 + p * BEAT
            if SILENCE[0] - 1e-6 <= t < SILENCE[1] + 1e-6: continue
            for nt in notes[1:]:
                place(toy_piano(hz(nt) * 2, 0.2), t, pan=0.35, gain=0.16)
    # xylophone ostinato (8ths, root-fifth-octave) in the last chorus
    if bar >= FULL:
        root = hz(notes[0]) * 2
        seq = [1, 1.5, 2, 1.5]
        for k in range(8):
            place(xylo(root * seq[k % 4]), t0 + k * BEAT / 2, pan=0.5, gain=0.18)
    # claps on 2 and 4, shaker on the 8ths, from the chorus
    if bar >= 4 and bar not in NIGHT:
        for p in (1, 3):
            t = t0 + p * BEAT
            if SILENCE[0] - 1e-6 <= t < SILENCE[1]: continue
            place(clap(), t, pan=0.1, gain=0.35)
        for k in range(8):
            t = t0 + k * BEAT / 2
            if SILENCE[0] - 1e-6 <= t < SILENCE[1]: continue
            place(shaker(), t, pan=-0.5, gain=0.35 if k % 2 else 0.2)

# melody: whistle doubled (detuned), second voice a third below in the chorus, choir "la la" in the last chorus
for bar, bt, ln, nt in MEL:
    t = t_of(bar, bt); d = ln * BEAT * 0.92
    place(whistle(hz(nt), d, -6), t, pan=-0.15, gain=0.55)
    place(whistle(hz(nt), d, +7), t + 0.008, pan=0.15, gain=0.45)
    if bar >= 4 and bar not in NIGHT and nt in THIRD_BELOW:
        place(whistle(hz(THIRD_BELOW[nt]), d, 4), t, pan=0.3, gain=0.22)
    if bar >= FULL:
        place(choir(hz(nt) / 2, d, 0), t, pan=-0.2, gain=0.9)
        if nt in THIRD_BELOW: place(choir(hz(THIRD_BELOW[nt]) / 2, d, 5), t, pan=0.25, gain=0.6)

for bar in NIGHT:
    for k, nt in enumerate(['B5', 'F#5', 'D6', 'F#5'] if bar == NIGHT[0] else ['G5', 'E5', 'B5', 'E5']):
        place(toy_piano(hz(nt), 0.3), bar * BAR + k * BEAT + BEAT / 2, pan=0.4, gain=0.12)
# opening hit on frame 0 (the gancho starts on the first sound) and the payoff
place(toy_piano(hz('F#5'), 0.3), 0, gain=0.25)
gliss(11.58, ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'], step=0.05, gain=0.35)   # the run up into the drop
place(kick(), PAYOFF, gain=0.8)
for nt in ['D4', 'F#4', 'A4', 'D5']:
    place(toy_piano(hz(nt) * 2, 0.4), PAYOFF, gain=0.2)
    place(choir(hz(nt), 1.6, 3), PAYOFF, gain=0.5)

# ---------------- hard stop for the silence, reverb, loop wrap ----------------
dry = mix.copy()
a, b = int(SILENCE[0] * SR), int(SILENCE[1] * SR)
fade = int(0.03 * SR)
g = np.ones(mix.shape[1])
if b <= mix.shape[1]: g[a:a + fade] = np.linspace(1, 0.04, fade); g[a + fade:b] = 0.04
dry *= g
# reverb: convolution with decaying noise (stereo-decorrelated)
ir_len = int(1.6 * SR); tt = np.arange(ir_len) / SR
from scipy.signal import fftconvolve
wet = np.zeros_like(dry)
for c in range(2):
    ir = rng.normal(0, 1, ir_len) * np.exp(-tt * 3.2); ir[:int(0.012 * SR)] = 0; ir /= np.sqrt(np.sum(ir ** 2))
    wet[c] = fftconvolve(dry[c], ir)[:dry.shape[1]]
wet *= g * 0.5 + 0.5 * (g > 0.5)     # the room also drops in the silence
out = dry + 0.22 * wet
# fold the tail past the loop point back over the start
tail = out[:, N:]
out = out[:, :N].copy(); out[:, :tail.shape[1]] += tail[:, :N]
# master: gentle compression-ish normalisation
out /= np.max(np.abs(out)) / 0.89
peak = np.max(np.abs(out))
print(f'duration {N / SR:.2f}s  peak {peak:.3f}  bpm {BPM}')
import wave
pcm = (np.clip(out.T, -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
