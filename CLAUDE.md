# Nursing Home Simulation

An agent-based model of airborne COVID-19 (and influenza) in a 112-resident nursing home, with and without far-UVC
lamps, built for Aerolamp. It ships as one self-contained HTML page: an "Explanation" tab (a narrated film drawn in
code) and a "Model and simulator" tab (run the model in the browser, move lamps, change every assumption).

Published artifact: https://claude.ai/artifact/5vaQcyk4uZJ3grQehrumGg (public). `NOTES.md` is the dated log of every
decision and experiment; read its last few sections before changing anything. `SPEC.md` is the original brief.

## Layout

| Path | What it is |
|---|---|
| `src/engine.js` | The model: building, timetable, room air, doses, infection, responses, lamp arithmetic |
| `src/params.js` | Every input with range, source and note; the fitted tables; generated Illuminate blocks |
| `src/analysis.js` | Cautious / central / favourable scenarios, lamp allocation |
| `web/app.html`, `web/app.js` | Page shell and the Model tab |
| `web/film.js` | The film and the "How is the chance of infection worked out?" explainer |
| `web/content.json` | Page text injected at build: slider labels, notes, limits, intro |
| `web/film*.json`, `web/captions.json`, `web/narration.json` | Generated film data, captions and audio (committed) |
| `web/build.mjs` | Builds `dist/index.html`, `dist/publish/index.html` and `shots/page.html` |
| `test/` | Unit tests, including agreement with Illuminate (`illuminate-check.json`) |
| `experiments/` | One-off analyses and the generators for fitted tables; outputs are `out_*` |
| `research/` | Literature notes with what was and was not read in full |
| `shots/` | Headless-browser page tests and screenshot scripts (`lib.mjs` holds the shared setup) |
| `results/`, `stable/`, `mock/` | Earlier fit, earlier builds, early mock-ups; kept for reference, not used by the build |

## Commands

Run everything from the repository root. Node 22 or later.

```
npm test                      # 51 unit tests, about a minute
node web/build.mjs            # dist/index.html, dist/publish/index.html, shots/page.html
node shots/err.mjs            # page loads without errors (needs Playwright, see shots/lib.mjs)
node shots/v1.mjs             # tabs, with and without a worker, phone width
node shots/a2.mjs             # arrival-rate slider drives the results
node shots/f1.mjs 20 64 118   # film frames at those seconds -> shots/f-<t>.png
```

After a change that moves the model's numbers, regenerate in this order:

```
for s in cautious central favourable; do node web/film-data.mjs $s & done; wait
node web/film-data.mjs merge && node web/film-routes.mjs
node web/build.mjs && node web/captions.mjs      # captions.json holds the numbers the film speaks
python3 web/narrate.py af_heart                  # about 25 minutes; only if captions.json changed
node web/build.mjs && npm test
```

`narrate.py` needs `kokoro-onnx`, `soundfile`, and the Kokoro model files (`kokoro.onnx`, `voices.bin`, about 350 MB,
not in the repository) in the folder named by `KOKORO_DIR`. Without them, change no caption text and the committed
`web/narration.json` stays valid.

The Illuminate generators need Python with `guv-calcs` 0.10.0:

```
python3 experiments/illuminate_constants.py [path/to/guv-calcs/src] --install   # lamp constants and citations
python3 experiments/illuminate_table.py wall --install                          # about 4 minutes each
python3 experiments/illuminate_table.py across --install
python3 experiments/illuminate_check.py                                         # test/illuminate-check.json
node experiments/headline.mjs covid 200                                         # the page's headline figures
```

## Publishing

The file to publish is `dist/publish/index.html`, to the existing artifact (slug
`27df8ff9-4516-49c0-b423-e439aff886ad`, title "Nursing Home Simulation", shared publicly). Read the artifact's
current version first and pass it as the base version. Only publish when the owner asks.

## Rules that are easy to break

- **Illuminate is the canonical source for lamp calculations.** The lamp constant and its range, the lamp's output,
  light path and exposure-limit dimming all come from OSLUV's Illuminate. Do not hand-edit the blocks in
  `src/params.js` between `// <illuminate-...>` markers, or `ANCHORED_FLU`'s table; rerun the generator.
- **Common random numbers.** Each winter is run without lamps and with each lamp set from the same world and seed.
  Anything that changes the timetable or a person's traits must go through `structuralKey` in `src/params.js`.
- **`web/content.json` keys need placeholders.** Every key must have a matching `/*__KEY__*/[]` (or `''`) in
  `web/app.js` or `web/film.js`, or the build stops.
- **Every film frame is a pure function of film time.** No state carried between frames; the narration is the clock.
- **Page text is plain language**, in complete sentences, for a reader who is not a modeller. Citations name the
  source and what it says; they never describe how the text was found. Say plainly when a value is our judgment.
- **Claims.** The owner's stance: state true facts about what we believe and why, including the unflattering ones
  (limits section, ranges, what was not measured). Do not soften or inflate.
- **Design.** Dataviz colours: without lamps grey, common areas violet (`--lamp`), common areas plus bedrooms teal
  (`--lamp-b`), room air blue, face to face orange. Both themes must work; the page must work at 400 px wide.

## Where things stand (20 November 2026)

Headline, 200 winters, reported resident infections: lamps in the common areas 22% fewer (10% to 41%); common areas
and bedrooms 34% (12% to 70%). Defaults: out-of-reach share 40% (25% to 55%), lamp constant 6.51 (2.62 to 15.85, from
Illuminate), one infected staff member arriving every 5 days, bedroom lamps dimmed for 20 hours a day.

Decisions waiting on the owner, with trial figures in `NOTES.md`:

1. Refit at the published virus output 0.55 (the model holds 0.52). Moves results by noise only.
2. The owner's proposed out-of-reach shares (COVID-19 35 / 55 / 75%, influenza 40 / 70 / 85%). Needs COVID-19 fitted
   the way influenza is (`experiments/covid_fit_emission.mjs`). Central common-area figure would fall to about 16%.
3. Whether the arrival rate joins the range; today it is a slider only. Influenza's 8 days is unchecked.
4. Papers not read in full (Angel 2025, van Doremalen 2020, Sah 2021, McLean 1961, Kitagawa 2023, Weimer 2022).
