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
| `web/app.html`, `web/app.js` | Page shell (with the owner's document on non-room-air spread, dialog `#split`) and the Model tab |
| `web/film.js` | The film, the "How is the chance of infection worked out?" explainer, and the simulator's section of the second explainer |
| `web/content.json` | Page text injected at build: slider labels, notes (`NOTES`), their one-or-two-sentence descriptions (`BRIEF`), limits, intro |
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
npm test                      # 52 unit tests, about a minute
node web/build.mjs            # dist/index.html, dist/publish/index.html, shots/page.html
node shots/err.mjs            # page loads without errors (needs Playwright, see shots/lib.mjs)
node shots/v1.mjs             # tabs, with and without a worker, phone width
node shots/a2.mjs             # arrival-rate slider drives the results
node shots/s1.mjs             # the "how the numbers were chosen" explainer opens and fits a phone
node shots/n5.mjs             # slider text is short; the full note opens in a dialog
node shots/p2.mjs             # the film's player: big play button, click on the picture, keys, clock
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

The page is also a GitHub Pages site. `.github/workflows/pages.yml` runs the unit tests, builds, and publishes
`dist/publish/` on every push to `main` (the repository must be public and its Pages source set to "GitHub Actions"; a session cannot re-run the workflow, only a push to `main` starts it). Nothing is
built by hand for it; merging to `main` is what publishes. The site is https://misterflask.github.io/nursing-home-simulation/.

After every push to `main`, tell the owner in these words, "PUSH TO MASTER OCCURRED", and give the site's address as
a link (the owner asked for this on 20 November 2026).

## Rules that are easy to break

- **Illuminate is the canonical source for lamp calculations.** The lamp constant and its range, the lamp's output,
  light path and exposure-limit dimming all come from OSLUV's Illuminate. Do not hand-edit the blocks in
  `src/params.js` between `// <illuminate-...>` markers, or `ANCHORED_FLU`'s table; rerun the generator.
- **Common random numbers.** Each winter is run without lamps and with each lamp set from the same world and seed.
  Anything that changes the timetable or a person's traits must go through `structuralKey` in `src/params.js`.
- **`web/content.json` keys need placeholders.** Every key must have a matching `/*__KEY__*/[]` (or `''`) in
  `web/app.js` or `web/film.js`, or the build stops.
- **Every film frame is a pure function of film time.** No state carried between frames; the narration is the clock.
- **Slider text stays short.** Under a slider goes one or two sentences saying what the setting is. A note longer than
  that needs a `BRIEF` entry in `web/content.json`; the full note then opens from "More about this setting"
  (`node shots/n5.mjs` reports the longest text under any slider).
- **Headings are short conventional labels** (Results, Sensitivity analysis, Limitations, Not modelled), not
  descriptions of the section. The plain-language rule below is for body text.
- **Page text is plain language**, in complete sentences, for a reader who is not a modeller. Citations name the
  source and what it says; they never describe how the text was found. Say plainly when a value is our judgment.
- **Claims.** The owner's stance: state true facts about what we believe and why, including the unflattering ones
  (limits section, ranges, what was not measured). Do not soften or inflate.
- **Design.** Dataviz colours: without lamps grey, common areas violet (`--lamp`), common areas plus bedrooms teal
  (`--lamp-b`), room air blue, face to face orange. Both themes must work; the page must work at 400 px wide.

## Where things stand (20 November 2026)

Headline, 200 winters, reported resident infections: lamps in the common areas 32% fewer (12% to 47%); common areas
and bedrooms 51% (15% to 78%). Defaults: non-room-air spread 30% (20% to 50%, from the owner's document, see below),
lamp constant 6.51 (2.62 to 15.85, from Illuminate), one infected staff member arriving every 5 days, bedroom lamps
dimmed for 20 hours a day, roommates face to face for 1.5 hours a day.

Non-room-air spread is what reaches a person up close or by hands and surfaces before far-UVC can act; the model
passes all of it face to face. The three cases and the by-setting table come from the owner's document "Room-air
spread and non-room-air spread: how the numbers were chosen" (https://claude.ai/artifact/J6LQJE4TpgcXPqo7qNByad),
held in `src/params.js` as `NON_ROOM_AIR` and reproduced on the page as the dialog `#split` in `web/app.html`. If the
document changes, change both, refit (`experiments/emission_row.mjs 0.52 <G> 1000 5` for each G in
`experiments/out_table_nonroomair.txt`, then `bash experiments/flu_table.sh 0.069 8 0.2 400 && python3
experiments/flu_install.py`), rerun `node experiments/settings.mjs covid 1000` and `flu 1000` into
`NON_ROOM_AIR.model`, and regenerate the film. The share is counted over infections passed to or from a resident.
Influenza has no figure of its own: it uses COVID-19's face-to-face strength in each case (16 / 25 / 46%).

Decisions waiting on the owner, with trial figures in `NOTES.md`:

1. Refit at the published virus output 0.55 (the model holds 0.52). At 30% non-room-air spread the model infects 17.0%
   of residents against 18.7% reported; at 0.55 it would infect 18.1%.
2. Whether to relax the three settings that were moved to hold infections down (talking 2 and 5, immunity 0.5), now
   that the model infects fewer residents than homes report at the central case.
3. Whether the arrival rate joins the range; today it is a slider only. Influenza's 8 days is unchecked.
4. Papers not read in full (Angel 2025, van Doremalen 2020, Sah 2021, McLean 1961, Kitagawa 2023, Weimer 2022), and the
   breath-sampling studies the document names as the way to narrow 20% to 50% (for example Coleman et al. 2022).
