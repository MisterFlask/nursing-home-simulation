#!/usr/bin/env python3
"""Narration for the film: one spoken clip per caption, joined into a single track.

  node web/build.mjs && node web/captions.mjs      # the captions as the page shows them
  python3 web/narrate.py [voice]                    # writes web/narration.json; then build again

One track is made for each speed setting in SPEEDS, each spoken at that speed by the voice itself, so that faster
does not mean higher-pitched. The voice's speed setting is not linear (it jumps between 1.32 and 1.34), so the
page labels each track with its measured speed relative to the 1x track. Tracks already in narration.json for the
same captions and voice are kept, so adding a speed only records that one.

Each caption owns a stretch of film time. In the track it gets max(its spoken length plus short pauses, that
stretch), so the picture is never rushed and the voice never overlaps the next caption. The page plays the track
and takes the film's time from it (web/film.js). The voice is Kokoro (model licence Apache 2.0, per the
kokoro-onnx project); the model and voices are expected in ../tts, see MODEL and VOICES below.
To use a different recording, put caption i's audio at 24 kHz in web/voice/<speed>/i.wav for each entry of SPEEDS
(for example web/voice/1.1/0.wav) and run with voice "files".
"""
import base64, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
TTS = os.environ.get('KOKORO_DIR', os.path.join(ROOT, '../../tts'))   # folder holding kokoro.onnx and voices.bin
MODEL, VOICES = os.path.join(TTS, 'kokoro.onnx'), os.path.join(TTS, 'voices.bin')
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'af_heart'
BASE = 1.1                              # the voice's speed setting that the page calls 1x (about 175 words a minute)
SPEEDS = [0.935, 1.1, 1.32, 1.375]      # the settings recorded; measured, they come out near 0.9x, 1x, 1.15x and 1.4x
LEAD, TAIL, SR = 0.25, 0.5, 24000

def speakable(t):
    """The caption as it should be said: only spellings change, never the words."""
    t = t.replace('far-UVC', 'far U V C').replace('Aerolamps', 'Aero lamps')
    return t

def trim(x, thr=0.004):
    idx = np.where(np.abs(x) > thr)[0]
    return x[idx[0]:idx[-1] + 1] if len(idx) else x

caps = json.load(open(os.path.join(ROOT, 'captions.json')))
C, FD = caps['captions'], caps['dur']
k = None
if VOICE != 'files':
    from kokoro_onnx import Kokoro
    k = Kokoro(MODEL, VOICES)
words, texts = sum(len(c['text'].split()) for c in C), [c['text'] for c in C]
old = {}
try:
    prev = json.load(open(os.path.join(ROOT, 'narration.json')))
    if prev.get('voice') == VOICE and prev.get('texts') == texts: old = {t['speed']: t for t in prev['tracks']}
except Exception:
    pass
tracks = []
for speed in SPEEDS:
    if speed in old:
        tracks.append(old[speed]); print(f'speed {speed:g}: kept', flush=True); continue
    clips = []
    for i, c in enumerate(C):
        if k is None:
            x, sr = sf.read(os.path.join(ROOT, 'voice', f'{speed:g}', f'{i}.wav'), dtype='float32', always_2d=True); assert sr == SR, f'{i}.wav must be {SR} Hz'
            x = x.mean(axis=1)
        else:
            x, sr = k.create(speakable(c['text']), voice=VOICE, speed=speed, lang='en-us'); assert sr == SR
        clips.append(trim(np.asarray(x, dtype='float32')))
    segs, parts, u = [], [], 0.0
    for i, c in enumerate(C):
        t0, t1 = c['t'], (C[i + 1]['t'] if i + 1 < len(C) else FD)
        d = len(clips[i]) / SR; D = max(LEAD + d + TAIL, (t1 - t0) / max(1, speed / BASE))   # never shorter than the silent film allows at this speed
        n = int(round(D * SR)); seg = np.zeros(n, dtype='float32'); a = int(LEAD * SR); seg[a:a + len(clips[i])] = clips[i][:n - a]
        parts.append(seg); segs.append({'t0': t0, 't1': t1, 'u0': round(u, 3), 'D': round(n / SR, 3), 'speech': round(d, 2)}); u += n / SR
    wav, mp3 = '/tmp/narration.wav', '/tmp/narration.mp3'
    sf.write(wav, np.concatenate(parts), SR)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '40k', mp3], check=True)
    tracks.append({'speed': speed, 'total': round(u, 2), 'segs': segs, 'src': 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3, 'rb').read()).decode()})
    print(f'speed {speed:g}: recorded', flush=True)
spoken = lambda t: sum(g['speech'] for g in t['segs'])
base = spoken(next(t for t in tracks if t['speed'] == BASE))
for t in tracks:
    t['rate'] = 1 if t['speed'] == BASE else round(base / spoken(t) / 0.05) * 0.05; t['rate'] = round(t['rate'], 2)
    print(f"{t['rate']:g}x (setting {t['speed']:g}): {t['total']:.0f}s ({t['total'] / 60:.1f} min) for a {FD}s film; {words / spoken(t) * 60:.0f} words a minute", flush=True)
json.dump({'voice': VOICE, 'base': BASE, 'tracks': tracks, 'texts': texts}, open(os.path.join(ROOT, 'narration.json'), 'w'))
