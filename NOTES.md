# Narration (18 Nov 2026)

The film can be played with a spoken narration. web/captions.mjs writes the captions as the built page shows them;
web/narrate.py speaks each one (Kokoro, voice af_heart, speed 1.1; model and voices in ../tts, fetched from the
kokoro-onnx GitHub releases) and joins the clips into one MP3, stored with its timing in web/narration.json and
inlined by the build. With sound on, the audio is the film's clock: each caption's stretch of film time is spread
over its stretch of the track (web/film.js fToAudio / fFromAudio), so narrated the film runs about 4 minutes
against 1 minute 45 silent. The sound is decoded in the page and played through Web Audio, not a media element,
so viewers that block media addresses still play it; if it cannot play, the page says so and carries on silently.
There is one track per narration speed (0.9x, 1x, 1.2x, 1.4x as measured), each spoken at that speed by the voice. If the captions change, the page notices the mismatch and plays silently until
captions.mjs and narrate.py are run again. To use another recording, put caption i in web/voice/i.wav (24 kHz) and
run `python3 web/narrate.py files`. Also on this day: a longer explanation of the infection calculation opens from
a link under the film (web/film.js explainBuild).

# Film camera (18 Nov 2026)

The film's camera is keyframed (web/film.js fCamKeys): whole home, fly in to the dining room, close on the
infectious person, pull back as the room fills, their table, a lamp coming on, the table again, back out to the
whole home, then following the infectious person through the afternoon. The winter chapter marks each new infection
with a ring on both small plans; the closing card builds row by row.

# Two views (18 Nov 2026)

The page has two tabs: Explanation (the film, shown by default) and Model and simulator (everything else). The
address follows the tab (#model opens on the model). The model opens in "Replay one season" mode. Text on the page
was audited for repetition on the same day: slider notes say a thing once, and a judgment value's note no longer
repeats what its source line says (web/app.js noteFor).

# Film at the top of the page (17 Nov 2026)

web/film.js draws a scripted explanation (about 105 s) into its own SVG: one dining room at lunch, how a dose
becomes an infection there (room air and face to face, for this person and for a 100-times emitter), the lamps, one
afternoon, one winter run twice, 200 winters, then the range for two installations (common areas; common areas and
bedrooms). Every frame is a function of film time (`window.__film.render(t)`), so it can be scrubbed and captured.
The season it shows is simulated in the page's worker (message type `film`) from the default anchored config; the
200-winter figures, the season's seed and the lunch it opens on come from web/film.json, made by web/film-data.mjs
(run it for cautious, central and favourable, then `merge`; about three minutes). Rebuild film.json whenever the
model, the lamp presets or the reporting rule change, or the film's numbers will disagree with the page. The film
always shows the default settings, whatever the sliders say.

# Page moved to the anchored fit (17 Nov 2026)

The page no longer uses the pass-4 calibration below. It runs `anchoredConfig(share)` (src/params.js, ANCHORED):
published emission 0.52 quanta/h, one infected staff member arriving every 7 days, speech multipliers 2 (social)
and 5 (work), immune protection 0.5, and G interpolated from a table of out-of-reach share against G
(experiments/anchored_table.mjs, 400 seasons a row). Resident counts on the page are *reported* infections: each
infected resident is reported with chance min(1, 18.7% / true attack rate at that share), by a fixed draw per person
and season. Hospital admissions are 5.3% of reported infections. Scenarios (`anchoredScenarios`): cautious = share
0.55 + low lamp-side values, central = sliders as set (default share 0.40), favourable = share 0.25 + high lamp-side
values. Lamp presets place one lamp per 250 sq ft of floor. The engine defaults, `calibrated()`, `scenarios()` and
the results/ folder are unchanged and still describe the earlier fit. experiments/density250.mjs holds the
share-0.55 runs at the new lamp density.

# Implementation notes

Engine for the care-home airborne transmission model specified in `SPEC.md`.
Measured on this machine (Node 22.23, Intel Xeon 2.1 GHz, 2 cores) unless marked
**not verified**. Second pass (2026-11-11): researched parameters, calibration,
redesigned scenarios, faster world building, study-design runs (`results/`).

## Files

| file | what |
|---|---|
| `src/params.js` | `PARAMS` (152 entries: 13 cited, 4 "Fitted (see note)", 135 "Modelling judgment"), `PATHOGENS`, `defaultConfig(pathogen)`, `CALIBRATION`, `calibrated(pathogen, closeShare)`, `getPath`, `setPath`, `mergeConfig`, `paramRange` |
| `src/engine.js` | `buildFacility`, `buildWorld(config, seed, { reuse })`, `runSeason`, plus `assembleWorld`, `roomAirStep`, `roomLambdas`, `lampAchFor`, `roomPresence`, `slotVisits`, `structuralKey`, PRNG helpers |
| `src/analysis.js` | `compare`, `summarize`, `scenarios`, `rankRooms`, `simulateTrial`, `calibrate`, `calibrationMetrics`, `facilityPool`, `powerFromPool`, chunking helpers |
| `src/cli.js` | `compare`, `rank`, `trial`, `sweep` (spec §7), plus `baseline`, `calibrate`, `study`, `outcomes`, `sensitivity`, `check` |
| `test/*.test.js` | `npm test` |
| `results/` | study-design runs, see `results/README.md` |

`params.js`, `engine.js`, `analysis.js`: no dependencies, no DOM/Node APIs, unique
top-level names (the web build concatenates them; a test does the same).

## Fourth pass (2026-11-11): mounting rule, unreachable share, refit — read this first

This section supersedes the third pass (below) wherever they differ. The
current numbers are in `results/README.md`.

### Lamp output follows the maker's mounting rule
- Clean air per lamp (m³/h) = 0.36 × susceptibility k × 100 mW × output share(ceiling height) × ceiling height × `pathFactor`. The engine computes it per room (`lampCadrFor`).
- Output share comes from `lamp.mountingTable` [[2.15, 0.2], [2.3, 0.4], [2.45, 0.7], [2.6, 1.0]], interpolated and clamped at the ends.
  - It applies when `lamp.followMountingRule` = 1 (default). With 0 the share is 1.
  - 2.4 m rooms get 60%; 2.7 m rooms get 100%.
- Added air changes = min(n × clean air / V, cap) × `realWorldFactor`. The bedroom cap is `maxEachBedroom`. `lampAchFor(config, room, n)` keeps its signature.
- Values:
  - k: 2.6 / **4.4** / 12 (Angel 2025 at 40% RH for the centre).
  - `pathFactor`: 0.83 / 1 / 1.25 (2.0–3.0 m path in a 2.4 m room).
  - `realWorldFactor`: 0.5 / **0.75** / 1.
  - Caps are recomputed with k = 4.4: shared rooms 12.7 / 23.8 / 64.8 air changes; bedrooms 1.6 / 6.3 / 43.2.
- If `lamp.susceptibility` is null, the engine falls back to a fixed `lamp.ecadr` (used by the analytic physics test). `defaultConfig` also sets `lamp.ecadr` as a display-only value at 2.4 m. It is no longer a PARAMS entry.

Per-lamp clean air at defaults (before → after the real-world factor; added air changes for one lamp in that room):

| room | height | output share | cautious | central | favourable |
|---|---|---|---|---|---|
| single bedroom (34 m³) | 2.4 | 0.6 | 112 → 56 (0.80, capped) | 228 → 171 (4.72, capped) | 778 (23.1) |
| double bedroom (58 m³) | 2.4 | 0.6 | 112 → 56 (0.80, capped) | 228 → 171 (2.97) | 778 (13.5) |
| wing lounge (60 m³) | 2.4 | 0.6 | 112 → 56 (0.93) | 228 → 171 (2.85) | 778 (13.0) |
| corridor/station (322 m³) | 2.4 | 0.6 | 112 → 56 (0.17) | 228 → 171 (0.53) | 778 (2.4) |
| break room (48 m³) | 2.4 | 0.6 | 112 → 56 (1.17) | 228 → 171 (3.56) | 778 (16.2) |
| office (144 m³) | 2.4 | 0.6 | 112 → 56 (0.39) | 228 → 171 (1.19) | 778 (5.4) |
| dining (270 m³) | 2.7 | 1.0 | 210 → 105 (0.39) | 428 → 321 (1.19) | 1458 (5.4) |
| activity (216 m³) | 2.7 | 1.0 | 210 → 105 (0.49) | 428 → 321 (1.49) | 1458 (6.8) |
| therapy (297 m³) | 2.7 | 1.0 | 210 → 105 (0.35) | 428 → 321 (1.08) | 1458 (4.9) |
| kitchen (189 m³) | 2.7 | 1.0 | 210 → 105 (0.55) | 428 → 321 (1.70) | 1458 (7.7) |
| lobby (210 m³) | 3.0 | 1.0 | 233 → 117 (0.55) | 475 → 356 (1.70) | 1620 (7.7) |

**The cautious lamp, re-derived.** far_uvc.md's low row is P = 40 mW, L = 2.0 m, k = 2.6, η = 0.5, giving 0.36 × 2.6 × 40 × 2.0 × 0.5 = 37.4 m³/h.
- Its 40 mW is already the maker's dimming for a 2.3 m ceiling. So 37 m³/h is the value *after* the ceiling rule, not before it. Before dimming the same row gives 0.36 × 2.6 × 100 × 2.0 × 0.5 = 94 m³/h.
- The cautious scenario uses the row's k, η and L (pathFactor 0.83, so L = 2.0 m at 2.4 m) and lets the mounting rule set the output for each room.
- That gives 36 m³/h at 2.3 m (the research row), 56 at 2.4 m (60% output allowed) and 105 at 2.7 m.

### Unreachable share (`transmission.closeShare`, same path, new meaning)
- It is now "the share of spread inside the home that room-air cleaning cannot reach: face to face, plus hands and surfaces".
- Values 0.24 / **0.55** / 0.86 combine the transmission review's face-to-face share of airborne spread (a) with its non-air share (n) as a(1 − n) + n:
  - 0.2 with 5%;
  - 0.5 with 10%;
  - 0.8 with 30%.
- Hands-and-surfaces spread is **not simulated mechanically**. In the model it all travels by the face-to-face route, which lamps do not reduce, and the calibration fits the model's face-to-face share to this value.
- The scenarios use 0.86 (cautious) and 0.24 (favourable).

### Scenario bug fixed
- `scenarios()` now measures user edits against `calibrated(pathogen, config.transmission.closeShare)` (G, emission and both outside-infection values). Before, it used share 0.5, so a config moved to another share with its calibrated values was treated as an edit and its ratio carried into the other scenarios.
- Lamp quantities scaled by the scenarios: `susceptibility`, `realWorldFactor`, `pathFactor`, `maxEach`, `maxEachBedroom` (`SCENARIO_LAMP_PATHS`).
- Tests:
  - deterministic: shares 0.2 and 0.8 land every scenario on the calibrated values at its own share;
  - simulated: no-lamp baselines agree at the default share, at 0.2 and at 0.8.

### Ventilation high ends restored
High ends: bedroom 4, lounge 6, dining 6, activity 6, station 4, therapy 6, break room 4. The centres (measured-based) are unchanged.

### Sources (sweep of all 152 entries)
- 61 source labels changed, 4 URLs dropped, 3 entries added (`lamp.susceptibility`, `lamp.pathFactor`, `lamp.followMountingRule`), 1 removed (`lamp.ecadr`).
- Values the research marks INFERRED are now "Modelling judgment" (or "Fitted (see note)" for G, emission, both outside-infection values), with the study named as context ("informed by …"):
  - closeShare (Azimi);
  - all seven near-zone dilution values (Bazant);
  - real-world factor (Welch 2026, "consistent with" but cannot confirm);
  - lamp caps (Peng);
  - near-field UV (Hiwar);
  - latent (Wu), presymptomatic (Manica), infectious (Jang);
  - immune protection (Forecasting Team);
  - masks (Brooks, Coffey: endpoints measured, centres judged);
  - working breathing rate (EPA);
  - all room-size, staffing, mobility and visit values (FGI, Brass, Cohen, ASHRAE, NJ statute, PBJ, LTCCC, Reed, Morgan-Brown, Siette, Weimer, Qian, Zhu, Massachusetts rules, CLA).
- Franklin 2024 and Rodríguez Campelo 2023 are named only as calibration targets.
- URLs:
  - aggregator and secondary URLs were dropped for van Doremalen, Sah and Buitrago-Garcia (the remaining citations with no URL);
  - Angel now links its ES&T DOI.
- Notes say where only an abstract or secondary account was read: Angel 2025, Kitagawa 2023 and Lu 2025 (via Blueprint), Sah, Buitrago-Garcia, Manica, Jang and van Doremalen.
- The G note discloses the cautious-setting problem. At share 0.86 the fitted G (28) is equivalent to a personal-care dilution value of about 1.5, five times below that parameter's own low end (8). At the centre (G 2.9) the equivalent is about 14, inside the range.
- The params test now allows a citation without a URL; judgment and fitted entries must have a note and no URL.

### COVID refit (`calibrate --covid3`, shares 0.1, 0.24, 0.4, 0.55, 0.7, 0.86; 200 seasons per evaluation)

| share | G | emission (q/h) | hazard /day | visitor P | season AR | share achieved | outbreak median AR [IQR] | staff AR during outbreaks (median) |
|---|---|---|---|---|---|---|---|---|
| 0.1 | 0.148 | 0.588 | 0.000191 | 0.00114 | 0.190 | 0.102 | 0.20 | 0.18 |
| **0.24** | **0.520** | **0.571** | **0.000147** | **0.00088** | 0.183 | 0.244 | 0.21 | 0.22 |
| 0.4 | 1.30 | 0.417 | 0.000147 | 0.00088 | 0.187 | 0.401 | 0.19 | 0.15 |
| **0.55** | **2.90** | **0.219** | **0.000208** | **0.00125** | 0.182 | 0.544 | 0.17 [0.04–0.51] | 0.17 |
| 0.7 | 7.95 | 0.146 | 0.000141 | 0.00085 | 0.189 | 0.708 | 0.22 | 0.22 |
| **0.86** | **28.0** | **0.045** | **0.000175** | **0.00105** | 0.191 | 0.865 | 0.22 [0.04–0.69] | 0.22 |

- The three scenario shares are fitted rows, so no scenario interpolates or extrapolates. A test checks this.
- A 0.9 row was started and abandoned: it is outside the range used.
- The 0.55 row's outbreak median (0.17) misses 0.21 by more than the 0.02 tolerance. Across nearby hazards the median jumped between 0.10 and 0.26, so the best of six tries was kept.
- Emission is inside the literature range (≥ 0.36) only for shares ≤ 0.4.
- Hazard is 0.014–0.021% per day, at or a little below the researched low (0.02%).

**Fresh-seed check** (`check`; seeds 50001–50400 and 70001–70400, neither used in the fit):
- Season attack rate is **matched within noise** in all three scenarios: 17.8–21.8% against 18.7%, each within 2.2 SE for 400 seasons.
- The outbreak median is matched only loosely: 15–31% (favourable runs high, 26% and 31%).
- **Staff attack rate during outbreaks** on fresh seeds is 12–24% (central 12% and 18%). The third pass's 21% was the value on the fitting seeds. Either way it is above the reported 10.8%.
- Details are in results/README.md.

### Study rerun (COVID; results/README.md)
- **Confirmation** uses 2,000 fresh paired seeds per cell.
- **Best 12 lamps, residents averted per season** (baseline about 20):
  - cautious 0.23 [0.03, 0.44] (1.2%);
  - **central 2.48 [2.03, 2.93] (12.5%)**;
  - favourable 8.77 [7.90, 9.63] (41%).
  - The old central "5.4 (28%)" is superseded. It came from a more generous lamp (no dimming, real-world factor 1) and was a high draw.
- **Every room (105 lamps):** 0.62 [0.34, 0.90] (3%) / 5.32 [4.67, 5.98] (28%) / 16.6 [15.4, 17.8] (74%).
- **Homes for 80% power**, from the paired effect plus the pool's between-home SD (bootstrap 95% CI); all are extrapolations.
  - Resident infections per season:
    - cautious: 166,710 per arm [66,987–611,579] (effect 0.33 [0.14, 0.51]);
    - central: **2,077 per arm [1,512–2,991]** (effect 2.71 [2.23, 3.20]), crossover 1,755 total [1,264–2,554];
    - favourable: 198 per arm [167–235], crossover 172 [143–201].
  - Residents infected per detected outbreak: central 2,116 per arm [1,409–3,447]; favourable 188 [155–235].
  - No size is given when the paired effect is ≤ 0.
- **Room-assumption sensitivity** (central, 12 lamps, re-ranked):
  - as set: 2.33 [1.82, 2.84];
  - lounge 15 m²: 3.71; lounge 40 m²: 1.91;
  - lounge 6/h: 1.91; break room 4/h: 2.02;
  - combined cautious: **1.12 [0.71, 1.52] (6%)**. With all three cautious, the lamps move from lounges to dining rooms and corridors.
- Superseded statements below include "about 25–30% fewer resident infections", "central 5.4", "1,160 per arm" and "staff AR 21% during outbreaks". They are kept only as history.

### API changes in this pass
- **Engine:** `lampOutputFraction(config, height)` and `lampCadrFor(config, room)` added; `lampAchFor(config, room, n)` uses them, signature unchanged.
- **Params:**
  - added `lampCadrAt(lamp, height)`;
  - added PARAMS `lamp.susceptibility`, `lamp.pathFactor`, `lamp.followMountingRule`, and config `lamp.outputMw`, `lamp.mountingTable`;
  - **removed PARAMS `lamp.ecadr`**: the page's lamp slider should move to `lamp.susceptibility` / `lamp.realWorldFactor` / `lamp.followMountingRule`;
  - `defaultConfig` uses `calibrated(p, 0.55)`;
  - new source label "Fitted (see note)".
- **Analysis:**
  - added `SCENARIO_LAMP_PATHS`; `SCENARIO_DEFS` now names range ends ('high' / 'low') instead of numbers;
  - `facilityPool(..., { paired: true })` adds `pairLamp` / `pairLampOB`;
  - `facilitiesForPower` returns `paired` (δ, CI, sizes with bootstrap CIs, or `refused`) when the pool is paired;
  - `allocateLamps` rooms carry `height`.
- **CLI:**
  - added `sensitivity` and `check`;
  - `study` defaults: confirm 2,000, placements 2,000, pool 2,000 (paired);
  - `power.csv` n80 row reports the paired sizes with CIs.

## Third pass (2026-11-11): COVID-19 refit (superseded by the fourth pass above where they differ)

**Influenza and RSV are NOT VALIDATED.** Their presets remain, but their fit
(second pass, below) is not defensible. Their CALIBRATION rows are commented
as such, and their results moved to `results/not-validated/`. Everything
below about COVID-19 supersedes the second-pass COVID numbers further down.

### Why the second-pass COVID outbreaks were small and short

Diagnostics on 150 seasons at the second-pass fit (emission 0.124, G 2.1,
outside infection 0.1% per staff member per day):

| check | finding |
|---|---|
| (a) metric | The second-pass outbreak metric seeded one introduction with no other importation and measured first to last resident infection. Surveillance outbreaks are counted differently: first case to last case in the home, residents and staff, with later introductions merging in, and declared over after 14 days without a case. **With the comparable metric the median duration is 38 days (IQR 25–60), not 7.** Duration was mostly a metric artefact. Median outbreak attack rate on the comparable metric: 9.8% (was 9–11%), still short of 21%. Staff attack rate *during outbreaks* is 6%; the 24% quoted before was the whole-season rate over the whole staff pool. |
| (b) response | The response is strong. With outbreak measures switched off, season attack rate goes 0.19 → 0.41 and median outbreak 0.10 → 0.26. With all responses off (also isolation and staff exclusion) it is 0.63 / 0.59. Detection timing (onset plus 1 day, roughly 4–5 days after the first in-home infection) matches the research (about 5 days). **One contradiction with the evidence:** masks were worn 100% of the time, while the transmission review recommends a compliance fraction of 0.5–0.9. I added `control.maskCompliance` = 0.7. On the old fit that alone moves season attack rate 0.186 → 0.213 and median outbreak 0.098 → 0.116. No other response default was changed. |
| (c) introductions | About 15 introductions per season (13.6 staff community infections, 1.7 via visitors). That is consistent with the research's own arithmetic (about one every 9 days), but the model is very sensitive to it. Holding incidence fixed, fewer introductions with higher transmissibility gives larger outbreaks: at the bottom of the researched hazard (0.0002 per day) the median outbreak is 16%, at 0.0001 it is 70% (bimodal). |
| (d) other | Outbreak take-off is bimodal: most introductions fizzle, a minority infect most residents. The median outbreak size is therefore very sensitive to the parameters. |

### Refit

Three free quantities: emission median, face-to-face intensity G, and the staff
community hazard h (visitor infectiousness = 6 × h, the default ratio).

Three targets:
- season incidence 0.187 (NHSN, Franklin et al. 2024);
- median outbreak resident attack rate 0.21 (Rodríguez Campelo et al. 2023), on the surveillance-style metric (`segmentOutbreaks`, staff cases included, 14-day gap, ≥2 resident cases);
- close-range share s.

Method (`calibrateCovid3`):
- outer bisection on h;
- inner fit of (G, emission) for incidence and share;
- 200 seasons per evaluation, with mask compliance 0.7.

Command: `node src/cli.js calibrate --covid3 [--shares ...]`. It writes JSON; the
CALIBRATION block was assembled from two parallel runs.

| share | G | emission (q/h) | hazard /day | visitor P(infectious) | season AR | share achieved | outbreak median AR [IQR] | outbreaks /season | introductions /season | outbreaks per introduction | outbreak duration median (mean; share > 42 d) | staff AR during outbreaks | staff AR, season |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.1 | 0.152 | 0.560 | 0.000183 | 0.0011 | 0.185 | 0.103 | 0.21 [0.04–0.57] | 0.61 | 3.2 | 0.19 | 22 (22; 8%) | 0.18 | 0.18 |
| 0.2 | 0.379 | 0.500 | 0.000183 | 0.0011 | 0.190 | 0.194 | 0.22 [0.04–0.61] | 0.60 | 3.1 | 0.19 | 22 (23; 8%) | 0.19 | 0.19 |
| 0.3 | 0.754 | 0.439 | 0.000168 | 0.0010 | 0.183 | 0.294 | 0.23 [0.04–0.59] | 0.57 | 2.9 | 0.20 | 23 (24; 11%) | 0.20 | 0.17 |
| 0.4 | 1.34 | 0.330 | 0.000183 | 0.0011 | 0.184 | 0.399 | 0.18 [0.03–0.54] | 0.62 | 3.1 | 0.20 | 22 (23; 7%) | 0.17 | 0.18 |
| **0.5** | **2.11** | **0.290** | **0.000176** | **0.00105** | 0.186 | 0.491 | 0.21 [0.04–0.63] | 0.55 | 3.0 | 0.18 | 23 (25; 17%) | 0.21 | 0.17 |
| 0.6 | 4.00 | 0.238 | 0.000141 | 0.00085 | 0.191 | 0.607 | 0.22 [0.04–0.75] | 0.52 | 2.5 | 0.21 | 25 (25; 14%) | 0.23 | 0.17 |
| 0.7 | 7.95 | 0.146 | 0.000141 | 0.00085 | 0.188 | 0.709 | 0.21 [0.04–0.71] | 0.52 | 2.4 | 0.21 | 25 (25; 13%) | 0.21 | 0.17 |
| 0.8 | 14.1 | 0.087 | 0.000141 | 0.00085 | 0.185 | 0.796 | 0.18 [0.04–0.73] | 0.52 | 2.4 | 0.22 | 25 (26; 15%) | 0.19 | 0.16 |
| 0.9 | 44.3 | 0.029 | 0.000176 | 0.00105 | 0.188 | 0.899 | 0.20 [0.03–0.68] | 0.57 | 2.9 | 0.20 | 24 (25; 16%) | 0.17 | 0.16 |

**Fitted versus unfitted targets (central row):**

| target | literature | model | fitted? |
|---|---|---|---|
| season resident incidence | 18.7% (NHSN) | 18.6% | yes |
| close-range share | 0.5 (judgment, 0.2–0.8) | 0.49 | yes |
| median outbreak resident AR | 21% | 21% | yes |
| outbreak AR IQR | 5–49% | 4–63% | no: upper quartile too high (bimodal take-off) |
| outbreak duration | mean 57 d (Krutikov 2023); 84% > 42 d (Wilson 2023) | median 23 d, mean 25 d; 17% > 42 d | no: still too short |
| staff AR | 10.8% cumulative in outbreaks (Spain) | 21% during outbreaks (median, on the fitting seeds; superseded: fresh seeds give a lower figure, see the fourth pass); 17% over the season | no: too high |
| introductions that become outbreaks | not found in the literature | 18% | — |
| residents in first 28 days, median | 10 at census 79 (Wilson 2023) | not computed | — |

**Constraints that bind:**
- *Staff community hazard:* the fit wants 0.00014–0.00018 per day at every share, 10–30% below the researched low (0.0002). Forcing h = 0.0002 gives a median outbreak of 16% instead of 21% (probe on 120 seeds).
- *Emission:* it is inside the literature range (≥ 0.36) only for close-range share ≤ 0.3 (0.44–0.56, near the 0.52 median). At the default share 0.5 it is 0.29.

The trade-off: higher close-range share needs lower emission. Literature-like
emission is compatible with these targets only if most in-home spread is
through shared air.

I kept the fitted values, which sit slightly outside the ranges, rather than
clamp them: the outbreak-size target is the one the lamp question depends on.
The public slider ranges are widened to include them.

**Still wrong:** duration and staff attack rate. Likely causes:
- no admissions and discharges;
- the outbreak-measure end rule, measures ending 14 days after the last case,
  which reopens dining while low-level spread continues;
- the staff mixing structure.

These are the next things to examine.

### API additions in this pass
- `calibrated(pathogen, share)` now returns, for COVID, `{ G, emissionMedian, staffDailyHazard, visitorInfectiousProb }`. Flu and RSV still return only `{ G, emissionMedian }`. **Wire `staffDailyHazard` and `visitorInfectiousProb` into the page** when the close-range share slider moves (`scenarios()` already does).
- `control.maskCompliance` (config and parameter; default 0.7).
- `segmentOutbreaks(world, result, { include, gapDays, minResidentCases })`: surveillance-style outbreaks.
- `calibrateCovid3(...)`.
- `facilitiesForPower(pool, { outcome, power })`.
- `facilityPool` now also returns `ctrlOB` / `lampOB` (outbreak sizes per season).
- `powerFromPool(..., { outcome: 'outbreakSize' })`.
- CLI: `calibrate --covid3`, `outcomes`.
- `calibrationMetrics(...).season` has extra outbreak fields.

### Public notes
Every parameter label, unit and note was rewritten for a public reader. They
are plain sentences with no internal names, and say what the number means,
where it comes from and how sure we are. Judgments start "Set by judgment". `source` holds the best
single citation with URL. A scan for internal identifiers finds none. Notes
average about 100 characters (longest about 430).

### COVID study results (refitted model; details in results/README.md)
- **Best rooms:** lounges and the break room first, then corridors/stations and dining rooms; bedrooms only at 20–40 lamps.
- **Best 12 lamps, residents averted per season** (baseline about 18–20):
  - cautious 0.8 [0.2, 1.4] (4%);
  - central 5.4 [3.8, 7.0] (28%);
  - favourable 9.1 [7.2, 10.9] (48%).
- **Every room:** 1.7 / 9.2 / 15.0.
- **Power** (parallel, 80 homes per arm, one season): 0.06 / 0.12 / 0.41.
- **Homes for 80% power** (normal approximation, extrapolated): parallel per arm about 13,700 / 1,160 / 180; crossover total about 11,700 / 1,040 / 160.
- **Alternative outcomes:** residents infected per detected outbreak, log count, and "season had an outbreak of 10 or more residents" all need similar or larger numbers (central 1,300–1,900 per arm). Outbreak take-off is bimodal, and no outcome a study could measure removes that variance.

## API changes in the second pass (all additions; spec'd names and shapes kept)

- `buildWorld(config, seed, { reuse: previousWorld })`: if the seed and the
  *structural* config are unchanged, the previous world's schedules and contacts
  are shared and only the derived layer is rebuilt (traits, infectious visitors,
  room ACH): ≈0.5 ms instead of a full build. Structural = everything except
  `emission`, `disease`, `immune`, `air`, `lamp`, `ventilation`, `breathing`,
  `control`, `transmission.{G,beta,nearFieldUV,closeShare}`, `facility.ach`,
  `importation.{staffDailyHazard,visitorInfectiousProb,visitCloseShare}`
  (`structuralKey()` in engine.js). Fresh and reused worlds go through the same
  derive code; a test checks runs are bit-identical.
- New roles `rn` (RN supervisor/unit managers; hourly rounds of the wing
  stations) and `aideFloat` (restorative/bath aide; care rounds across all
  wings). `ROLES` lists them.
- `lamp.maxEachBedroom` (separate exposure cap for 24-h-occupied bedrooms) and
  `lampAchFor(config, room, n)`. **Semantics change:** added air changes are now
  `min(n·ecadr/V, cap) × realWorldFactor` (cap applied before the mixing factor,
  because the cap limits UV fluence, not its effect). The web page's
  `lampEach()` computes `min(n·ecadr·rwf/V, maxEach)` and ignores the bedroom cap;
  it should call `Sim.lampAchFor(config, room, n)` instead.
- `transmission.closeShare` (config + PARAMS entry). Not read by the engine; use
  `calibrated(pathogen, closeShare)` → `{ G, emissionMedian }`.
- `people.limitedMealRoom` ('bedroom' default), `people.pActivityPM`,
  `people.pLoungeIdleLimited`, `importation.visitLoungeShare/visitLobbyShare`,
  `immune.protectionStaff`, `control.outbreakMode.{windowDays, responseDelayDays,
  facilityWideWings, countStaff}`, `schedule.cycleDays`.
- `world.visits` now only holds explicit visits (custom worlds); staff sub-slot
  presence is implied by care and medicine-round contacts (fraction τ/Δ of the
  slot). `slotVisits(world, g)` returns both. `world.tables` holds table
  membership; tablemate contacts are derived at run time from who is actually
  at the table.
- `byPathogen[p].source` / `.note` on PARAMS entries where the source differs by pathogen.
- Outbreak overrides recorded with `opts.record` now carry `wing`.

## What changed in the default facility (research/facility.md)

| | first pass | now |
|---|---|---|
| residents | 120 (4 × 30) | **112** (4 wings × 28; 128 beds at 87.5%) |
| bedrooms per wing | 10 single + 10 double | **4 single + 14 double**; beds filled singles → first bed of each double → second beds, giving 16 singles, 40 full and 16 half-empty doubles |
| room sizes | guesses | single 14 m², double 24 m², corridor+station 134 m², lounge 25 m², dining 100 m² ×2, activity 80, therapy gym 110, break room 20, lobby 70, office 60; 2.4 m ceilings in rooms/corridors, 2.7–3.0 m in large rooms |
| ventilation (clean ACH) | design-ish | measured-based: bedrooms 1.5 (0.5–2), corridors 2 (1–4), lounge/dining/activity 3 (1.5–4), therapy 4 (2–6), **break room 1** (0.5–4), lobby/office 2; high end = ASHRAE 170 design minimum where one exists |
| staff on duty | 31/17/7 | **50/23/12 = 85 weekday, 71 weekend**: CNA 14/11/8, float aide 1, LPN 5/4/3, RN 3/2/1, therapists 5, dietary 5/4, housekeeping 6/1, activities 2/1, office/admin 9 (weekdays) |
| distinct staff employed | 81 | 131 (pools so every post is filled every day at ~4.3 days/week each) |
| resident classes | 55/30/15, limited eat in lounge | **60/30/10**; room-oriented residents **eat in their own room** and rarely leave; bedbound get feeding help in the room |
| day | 2 activity sessions, 1 p | 10:00 (40%) and 15:00 (25%) sessions; bed at 20:00; lounge free hours 0.35 so mobile residents spend ≈17 h/day in their room |
| visits | 0.2/day, 60 min, bedroom | 0.25/day, 75 min, 14:00–19:00, 60% room / 30% lounge / 10% lobby |
| care | 3/2/1 × 10 min | 2/2/1 × 10 min (≈50 min/day; research 45, 30–80); medicine rounds 3 min; meal help 5 min |
| outbreak response | facility-wide, ≥3 resident onsets in 7 days | **per wing**: first case (COVID) or 2 cases in 72 h (flu/RSV, CDC), resident or staff; measures from the next day + 1, until 14 days (COVID) / 7 days (flu, RSV) after the latest case; facility-wide when ≥2 wings are affected; staff mask while any wing is in outbreak mode |
| responses | | staff exclusion 7 d COVID (CDC), 5 d flu/RSV; isolation 10 d COVID, 7 d flu (CDC) |

Note that the research roster's rows add up to 85 weekday staff, while its
subtotal says 83. I used the rows.

## Judgment calls mapping research to parameters

Every PARAMS entry says this in its `note`. The main ones:

1. **Emission activity multipliers.** Social (talking) ×5 is the Mikszewski
   speaking/resting ratio. Staff work ×10 is judgment: between "speaking" (×5)
   and "light activity, loud speaking" (×85). The researched
   emission spread is used as is: log10 SD 1.2 (GSD 15.8) for COVID, 0.84 (GSD
   6.9) for flu/RSV. The engine handles it fine: q is only ever multiplied; a
   1-in-a-million draw is ~10⁵·⁷ × median; runs are no slower.
2. **Immunity as leaky protection.** The research recommends leaky protection
   and gives "effectively immune" fractions. I set share = 1 and protection =
   that fraction: COVID 0.30, flu 0.25, RSV 0.15 for residents and 0.10 for
   staff (`immune.protectionStaff`).
3. **Close-range β** (research: no direct source). Jet-dilution reading:
   β_eff = Q_b·S/f, with Q_b = 0.5 m³/h and S(1 m) ≈ 17.
   - f = 0.2 for care, therapy, visits and medicine rounds → 42 m³/h.
   - f = 0.1 for tables and break tables → 85 m³/h.
   - Range 8 (f 0.5, S 8) to 1,130 (isotropic two-zone model).

   Only the ratios matter at default, because G is fitted.
4. **Lamp physics** (far_uvc.md; superseded by the fourth-pass mounting-rule formula at the top). `ecadr` = 0.36 × k × P × L, with P = 100 mW
   (Aerolamp/Ushio B1) and L = 2.4 m (≈ ceiling height). k is the virus's UV
   susceptibility in air (cm²/mJ):

   | | k low / central / high | ecadr (m³/h) | cap on lamp-added air changes, shared rooms (central) | bedrooms (central) |
   |---|---|---|---|---|
   | COVID | 2.6 / 5 / 12 | 225 / 432 / 1,037 | 27/h | 7.2/h |
   | Influenza | 1.8 / 5 / 20 | 156 / 432 / 1,728 | 27/h | 7.2/h |
   | RSV (no 222 nm measurement; proxy) | 1.5 / 4 / 15 | 130 / 346 / 1,296 | 21.6/h | 5.8/h |

   - `realWorldFactor` η is the mixing/shadowing efficiency: 0.5 / 1 / 1. The
     one occupied-room measurement (dental clinic) fits η ≈ 1.
   - `maxEach` = 3.6 × k × E_max. Shared rooms use E_max = 1.5 µW/cm², the most a
     room can hold under the ACGIH 8-hour eye limit.
   - `maxEachBedroom` uses E_max = 0.4 µW/cm², because a 24-hour occupant gets a
     third of the 8-hour dose.

   **Caveats on the lamp numbers:**
   - At a 2.4 m ceiling the maker says to dim the lamp to 40–70%. That would
     scale ecadr down by the same factor; I did not apply it.
   - Room-sized chamber studies report 10–30× more effect than this physics
     predicts (Eadie 2022, Hiwar 2025, Buonanno 2024 mouse room). That excess is
     unexplained, and I did not use it.
5. **Natural history.** Gamma shapes come from the research's SDs:
   - COVID: latent 2 d (SD 1), presymptomatic 1.5 d, 5.5 d after onset.
   - Flu: 1 / 0.5 / 4.5 d.
   - RSV: 3 / 1 / 5 d.

   The profile is flat for 1 day after onset, then falls linearly to 0.1.
   Symptomatic share is 1 − the asymptomatic share (Sah 2021 for COVID).
6. **Importation.** Community infection is 0.1%/day for all pathogens (the
   research gives one number). Visitor prevalence is 0.6% (0.1% incidence × 5–7
   days infectious).
7. **Kitchen geometry and ventilation:** not researched; judgment.
8. **Not implemented from the research:**
   - agency staff;
   - the 5% of staff who also work at another home (2× hazard);
   - stopping float assignments during outbreaks;
   - testing cadence;
   - admissions and discharges;
   - the omitted contact/fomite share (see weaknesses).

## Calibration (second pass; COVID superseded by the third pass above; flu and RSV NOT VALIDATED)

**What is fitted.** For each pathogen and each close-range share s in
{0.1, …, 0.9}, the pair (`transmission.G`, `emission.median`) at which the
no-lamp baseline reproduces both s and that pathogen's attack-rate target.
Every other parameter stays at its default.

- **Close-range share** = close / (close + room) among infections acquired
  inside the building.
- **Method** (`analysis.calibrate`):
  1. Bisection on log emission to hit the attack-rate target at the current G.
  2. Bisection on log G to hit the share at that emission.
  3. Alternate until both are within tolerance: share ±0.01, attack rate ±3%.
- The same seeds are used in every evaluation (common random numbers):
  - season targets: 200 seeds (1–200);
  - outbreak targets: 300 single-introduction runs (seeds 100001–100300).
- The table is stored as `CALIBRATION` in `params.js`, with seed counts and date
  in a comment. `calibrated(pathogen, s)` interpolates log-linearly.
  `defaultConfig(p)` uses s = 0.5.
- Regenerate with `node src/cli.js calibrate --write`. This run was resumed
  after two processes were killed, then assembled with
  `calibrate --from-logs <logs> --write`.
- Run time: about 2 hours on 2 cores. Each share point takes 20–100
  evaluations.

**Targets used and why** (`CALIBRATION_TARGETS` in analysis.js):

- **COVID: surveillance incidence.** 109.3 infections per 10,000 resident-weeks
  in US nursing homes, October 2023 to February 2024 (Franklin et al. 2024,
  MMWR, NHSN). Over the 120-day season this is a mean of 18.7% of residents
  infected (all infections). It is the least biased observable: it covers every
  facility, not only those with a reported outbreak.
  - It probably undercounts asymptomatic infections, so the model's target is,
    if anything, low.
- **Flu: median resident attack rate in reported outbreaks**, 33% (Lansbury et
  al. 2017, 49 outbreaks). No surveillance incidence for nursing-home residents
  exists in the research.
  - The model is compared on the same footing. Seed one infected staff member
    with no other importation. Call it a reported outbreak when ≥ 2 symptomatic
    residents start symptoms within 72 h (the CDC flu outbreak definition).
    Count symptomatic resident cases, as outbreak reports do, and take the
    median over outbreaks.
- **RSV: median resident attack rate in reported outbreaks**, 24% (Osei-Yeboah
  et al. 2024), fitted the same way as flu.
  - The research also gives an annual incidence proportion of 0.5–14%. I did not
    fit to it because the range is 28-fold wide. **In hindsight it is the less
    biased target** (see below).

**Calibration tables** (G is dimensionless; emission is quanta/h at rest):

COVID (target: season attack rate 0.187)

| share | G | emission | season AR | share achieved | staff AR (of 131 employed) | P(intro → outbreak) | outbreak median AR, all [IQR] | outbreak duration, d |
|---|---|---|---|---|---|---|---|---|
| 0.1 | 0.16 | 0.277 | 0.187 | 0.094 | 0.26 | 0.11 | 0.11 [0.03–0.28] | 10 |
| 0.2 | 0.40 | 0.247 | 0.193 | 0.196 | 0.26 | 0.12 | 0.10 [0.03–0.30] | 7 |
| 0.3 | 0.795 | 0.196 | 0.192 | 0.305 | 0.25 | 0.11 | 0.09 | 9 |
| 0.4 | 1.33 | 0.156 | 0.187 | 0.399 | 0.24 | 0.11 | 0.10 | 7 |
| **0.5** | **2.11** | **0.124** | 0.184 | 0.494 | 0.24 | 0.10 | 0.11 [0.04–0.27] | 7 |
| 0.6 | 3.73 | 0.088 | 0.182 | 0.603 | 0.23 | 0.11 | 0.12 | 7 |
| 0.7 | 5.90 | 0.066 | 0.183 | 0.692 | 0.23 | 0.12 | 0.10 | 7 |
| 0.8 | 11.7 | 0.040 | 0.187 | 0.795 | 0.23 | 0.13 | 0.08 [0.04–0.21] | 7 |
| 0.9 | 29.4 | 0.019 | 0.192 | 0.897 | 0.23 | 0.13 | 0.09 | 8 |

Influenza (target: median symptomatic outbreak AR 0.33)

| share | G | emission | outbreak median AR, symptomatic [IQR] | all infections | P(intro → outbreak) | season AR | season staff AR | outbreak duration, d |
|---|---|---|---|---|---|---|---|---|
| 0.1 | 0.16 | 2.23 | 0.34 [0.06–0.52] | 0.42 | 0.29 | 0.59 | 0.54 | 12 |
| 0.2 | 0.42 | 2.04 | 0.34 | 0.43 | 0.31 | 0.63 | 0.58 | 13 |
| **0.5** | **2.36** | **1.01** | 0.33 [0.07–0.51] | 0.39 | 0.29 | 0.57 | 0.52 | 15 |
| 0.8 | 11.7 | 0.36 | 0.35 [0.11–0.49] | 0.42 | 0.30 | 0.57 | 0.51 | 17 |
| 0.9 | 29.3 | 0.16 | 0.34 | 0.41 | 0.28 | 0.55 | 0.48 | 16 |

(Rows 0.3, 0.4, 0.6 and 0.7 are in `params.js`.)

RSV (target: median symptomatic outbreak AR 0.24)

| share | G | emission | outbreak median AR, symptomatic [IQR] | P(intro → outbreak) | season AR | outbreak duration, d |
|---|---|---|---|---|---|---|
| 0.1 | 0.18 | 0.90 | 0.25 [0.08–0.35] | 0.19 | 0.37 | 20 |
| **0.5** | **2.11** | **0.49** | 0.24 [0.07–0.44] | 0.25 | 0.41 | 26 |
| 0.8 | 11.1 | 0.20 | 0.25 [0.09–0.44] | 0.27 | 0.49 | 26 |
| 0.9 | 24.7 | 0.090 | 0.24 | 0.25 | 0.44 | 26 |

**How the calibrated model does on the targets it was not fitted to** (share 0.5):

| pathogen | observable | literature | model |
|---|---|---|---|
| COVID | median outbreak resident AR | 21% (IQR 5–49%), Rodríguez Campelo 2023 | 11% (all infections; IQR 4–27%) — **too low** |
| COVID | cumulative resident AR in outbreaks | 25% | not computed separately; the outbreak mean is similar to the median |
| COVID | staff AR | 10.8% (outbreak-based) | 24% of all 131 employed staff over a season, mostly community-acquired (0.1%/day × 120 days ≈ 11% alone) — **too high**; the staff hazard applies to the whole pool, including people off duty |
| COVID | outbreak duration | mean 57 days (Krutikov 2023); 84% over 42 days (Wilson 2023) | median 7 days from first to last resident infection — **far too short**; definitions differ (real outbreaks are declared over 14–28 days after the last case, and include staff re-introductions), but the gap is large |
| COVID | first case is staff | 73% (Wilson 2023) | by construction 100% in the outbreak runs; in season runs all importation is via staff and visitors |
| flu | staff AR in outbreaks | 23% (3–58%) | median 30% of employed staff in single-introduction outbreaks — **somewhat high** |
| flu | season incidence | none for residents; unvaccinated HCWs 18.7% per season (Kuster 2011) | **57% of residents per season — implausibly high** |
| RSV | annual incidence proportion | 0.5–14% (Osei-Yeboah 2024) | **41% — far too high** |
| RSV | outbreak duration | 13–21 days (mean 17) | median 26 days — somewhat long |

**Targets that could not be met with emission inside its researched range**
(I'm reporting these, not hiding them):

- **COVID:** reached only with emission **below** the literature range at every
  share. Fitted 0.019–0.28 q/h; the literature is 0.36–1.56, median 0.52.
  - At 0.52 q/h the uncalibrated baseline infected ~50% of residents per season.
  - The model's contact structure, plus 0.1%/day importation through 131
    staff, transmits more than real homes do. Plausible reasons: no testing or
    cohorting beyond the outbreak switch; the staff pool hazard; Omicron-era
    immunity possibly higher than the research's 30% leaky protection.
- **Influenza:** reached only with emission about **30× above** the literature
  (median 0.035, range 0.012–0.105). Fitted 0.16–2.2 q/h depending on share.
  - With literature emission, aerosol spread alone produces almost no outbreaks.
  - This matches the research's point that 20–50% of flu transmission is
    contact or droplet, which the model does not have. The calibration loads
    that into the air routes.
- **RSV:** the same, about 3–25× above the flu-equivalent range.
- **Consequence for flu and RSV:** the fits match reported outbreak sizes but
  give season attack rates of 40–60%. Reported outbreaks over-represent large
  ones, so fitting their median makes the model too transmissible over a whole
  season.
  - **Recommendation:** for RSV, refit to the annual incidence proportion (e.g.
    7%, the middle of 0.5–14%).
  - For flu, use a seasonal resident incidence if one can be found, or fit to
    the outbreak-size distribution together with an outbreak-occurrence rate.
  - I did not do either: both are target choices for you. The machinery takes
    any target (`CALIBRATION_TARGETS`).

**Monte Carlo precision.** The fit uses 200 season seeds. On an independent set
of 150 seeds the central COVID baseline came out at 15.5% versus the 18.7%
target. On the study's 400 confirmation seeds it was 16.5%. Season attack rates
are very heavy-tailed (emission GSD 15.8), so ±10–15% between seed sets is
expected. More seeds would tighten the fit at proportional cost.

## Scenarios (second/third pass; superseded by the fourth pass at the top)

`scenarios(config)` returns `{ cautious, central, favourable }`. They differ only
in what matters for the lamp:

| | close-range share | G, emission.median | lamp ecadr, realWorldFactor |
|---|---|---|---|
| cautious | 0.8 | `calibrated(p, 0.8)` | low |
| central | config as given | | |
| favourable | 0.2 | `calibrated(p, 0.2)` | high |

- If the user has moved G or emission.median away from the calibrated value at
  share 0.5, the same ratio is applied in the other two scenarios. Lamp values
  are scaled by low/central or high/central, so lamp edits carry through too.
- The three no-lamp baselines are calibrated to the same attack-rate target. A
  test checks that their mean attack rates agree within Monte Carlo error plus
  the calibration tolerance.

## Speed

Measured on an idle machine: 200 seeds after 20 warm-up seeds, default COVID
config, 120 days. The "two arms" are no lamps plus 12 lamps in shared rooms.

| | median | mean | p90 |
|---|---|---|---|
| **one seed, fresh: world + two arms** | **35 ms** | 38 ms | 46 ms |
| buildWorld alone | 13 ms | 16 ms | 18 ms |
| runSeason, one arm | 10.6 ms | 11 ms | 15 ms |
| **one seed, reused world** (non-structural slider change) + two arms | **20–24 ms** | 22–26 ms | 29–37 ms |
| derived layer only (reuse) | 0.5 ms | | |

- **The ~30 ms per fresh seed target is missed by about 15%.** It is met on the
  reuse path.
- buildWorld went from 62 ms to 13 ms median. The changes, in order of effect:
  1. Resident routines and the post-level staff timetable are built for one
     28-day cycle. The season is then emitted from them using the actual roster
     and float swaps per day.
  2. Contacts are emitted already in slot order into exact-size arrays (no sort,
     no growth).
  3. Tablemate contacts are derived at run time instead of stored.
  4. Staff sub-slot visits come from care and medicine-round contacts instead of
     a separate store.
  5. Faster PRNG (mulberry32).
  6. The roster closure no longer pins the builder's scratch memory (a leak of
     about 6 MB per world).
- runSeason now costs about 10.6 ms per arm, against 8 ms in the first pass. The
  causes are more people (243 vs 201), a busier calibrated baseline, and the
  per-slot presence list.
- Early builds (the first ~20) are 2–5× slower while the JIT warms up. The
  web worker will see this at the start of each run.
- A world retains about 4.5 MB of typed arrays, so caching many worlds per seed
  in a browser costs about that much each.

## Study-design runs (second pass; superseded, see the fourth pass and results/README.md)

See `results/README.md` for exactly what was run. Headline results (residents averted per 120-day season, 112 residents; 95% CI):

- **Where the best lamps go** (ranking, all scenarios):
  - With 4–12 lamps: the four wing lounges and the staff break room first (small
    rooms with poor ventilation: lounge 60 m³ at 3 ACH, break room 48 m³ at
    1 ACH), then dining rooms, corridors/stations and the office.
  - Bedrooms only enter at 20–40 lamps.
- **Effect sizes, COVID:**

  | | 12 lamps (best) | shared rooms + break room, 16 lamps | every room, 105 lamps |
  |---|---|---|---|
  | cautious | 0.4 [0.1, 0.6] (2%) | 0.8 [0.4, 1.2] (4%) | 1.3 (7%) |
  | central | 2.2 [1.7, 2.7] (12%) | 3.5 [2.9, 4.2] (19%) | 7.0 (37%) |
  | favourable | 6.8 [5.9, 7.7] (33%) | 8.4 [7.3, 9.5] (39%) | 13.9 (65%) |

  Baselines: 18.5–20.6 residents infected per season.
- **Effect sizes, flu** (baseline about 61–66 residents; see the caveat above):
  - 12 lamps: 1.7 / 9.7 / 26.8 averted (cautious / central / favourable).
  - Every room: 3.6 / 20.1 / 46.9 averted.
- **Power at α = 0.05, best 12-lamp placement:**

  | | parallel, facilities per arm: 5 | 10 | 20 | 40 | 80 | crossover, facilities: 5 | 10 | 20 | 40 |
  |---|---|---|---|---|---|---|---|---|---|
  | COVID cautious | 0.05 | 0.04 | 0.05 | 0.03 | 0.05 | 0 | 0.05 | 0.03 | 0.06 |
  | COVID central | 0.07 | 0.06 | 0.07 | 0.10 | 0.13 | 0 | 0.04 | 0.06 | 0.10 |
  | COVID favourable | 0.06 | 0.13 | 0.21 | 0.37 | 0.66 | 0 | 0.13 | 0.23 | 0.46 |
  | flu cautious | 0.05 | 0.05 | 0.04 | 0.06 | 0.05 | 0 | 0.07 | 0.04 | 0.06 |
  | flu central | 0.08 | 0.10 | 0.17 | 0.28 | 0.49 | 0 | 0.14 | 0.17 | 0.41 |
  | flu favourable | 0.26 | 0.47 | 0.73 | 0.96 | 1.00 | 0 | 0.57 | 0.87 | 1.00 |

  Facility-to-facility spread is huge: the SD of resident infections per
  facility-season is about 21 against a mean of 20 for COVID. So under central
  assumptions, a trial with resident infections as the outcome is
  underpowered even at 80 facilities per arm.
- **First-order ranking predictions** overstate the simulated benefit by about
  2–3×. The two figures are not like for like: the prediction counts residents
  and staff together, while the table shows residents only. Even allowing for
  that, depletion and onward chains reduce the benefit.

## Tests

`npm test`: 39 tests, all pass (~20 s). New in this pass:

- no `PLACEHOLDER` remains; low ≤ central ≤ high everywhere (including per
  pathogen);
- every source is either a citation with a URL or "Modelling judgment" with a
  note;
- `defaultConfig` uses the calibrated values;
- buildWorld reuse is bit-identical to a fresh build for three kinds of
  non-structural edit, and structural edits rebuild;
- scenario baselines agree within Monte Carlo error. Test output: cautious
  0.159 vs central 0.155 (diff 0.005 ± 0.006); favourable 0.171 (diff 0.016 ±
  0.007), allowed 3 SE + 6% of target;
- the default layout is 112 residents, 16 singles, 40 full and 16 half-empty
  doubles, 85 weekday and 71 weekend staff;
- the 28-day routine cycle repeats.

## Known weaknesses

- **The fitted emission is outside the literature for every pathogen** (see
  Calibration). The model's air routes absorb everything else that spreads
  infection in real homes: contact/fomite transmission, large droplets, and
  admissions. As a result, lamp benefits are plausibly overstated by roughly the
  non-air share (research: 10% COVID, 20% flu, 40% RSV). A `nonAirShare`
  route that lamps cannot touch would be the honest fix.
- **Outbreak-conditional targets (flu, RSV) are biased upward.** Published
  outbreaks are the detected and reported ones. Matching their median
  therefore makes the model too transmissible over a whole season (flu season
  attack rate far above any surveillance figure).
- **Resident routines repeat every 28 days** (`schedule.cycleDays`; 0 or ≥ days
  turns this off). Staff rosters, floats and visitor infectiousness do not
  repeat. This was needed for speed.
- **CRN monotonicity** is not guaranteed with onward chains (see the
  first-pass test). Paired comparisons remain valid.
- **First-order lamp ranking** ignores depletion and chains. The confirmation
  runs show by how much.
- **Unit-level outbreak response** counts staff cases toward their home wing.
  Cases among central staff (no wing) do not trigger it.
- **Visits continue** during outbreaks, which matches federal policy.
  Excluded staff are not replaced.
- **Air exchange between rooms is not modelled.** The research notes that
  open-door bedroom ventilation is mostly exchange with the corridor.

## Not verified

- **Browser Web Worker:** not run in a real browser. Checked only indirectly:
  no DOM/Node APIs, and the three files run as one concatenated scope.
- **The web page with the new API:** not tested. The page's `lampEach()`
  differs from `lampAchFor()` (see API changes).
- **Calibration outside its seeds:** only the COVID central point was checked
  on independent seeds.
- **Flu and RSV scenario baselines:** agreement was not tested; only COVID is
  covered by the test.
- **Trial power:** comes from resampling a 1,000-facility pool, not from
  independent simulation of every facility in every trial. The pool method was
  not cross-checked against brute force at large F. The machinery's null
  rejection rate was checked earlier (0.02).
- **RSV:** no study-design runs (not requested).
- **Run-to-run timing variation:** the 2-core VM is shared, so timings varied
  by ±15% between repeats.

## 2026-11-18: lamps mounted high on the walls, figures from Illuminate

The user: "Generally aerolamps are mounted on high walls and angled downward." The page's model (`anchoredConfig`)
now sets `lamp.mount = 'wall'` and `lamp.wall = ILLUMINATE_WALL`.

- `experiments/illuminate_table.py --install` builds the table with OSLUV's Illuminate (`guv_calcs` 0.10.0): Aerolamps
  in "edge" placement (10 cm below the ceiling, aimed at the foot of the opposite wall), one per 250 sq ft, over floor
  areas 9-200 m2 and ceilings 2.15-3.5 m. For each it stores the light's average path per lamp
  (fluence x volume / (0.1 x total mW)) and the share of output Illuminate's exposure check allows.
- `lampCadrFor` (engine.js): for a wall mount, clean air per lamp = 0.36 x k x output mW x share x path x pathFactor,
  with path and share interpolated from the table (`wallLampAt`; log scale in area, held at the edges). The 0.75
  "delivered" factor and the caps are unchanged. `defaultConfig` keeps the ceiling formula, so the older tests and
  experiments still mean what they did.
- Effect per room at one lamp per 250 sq ft (extra air changes an hour, as used): single bedroom 4.7, lounge 3.8,
  corridor 7.0, dining 10.8, activity 9.8, therapy 12.3. The dining room was 4.8 with the ceiling formula.
- Results, 200 seasons, reported infections among residents: common areas (48 lamps) 18% central, 9.1% to 46%;
  common areas and bedrooms (120 lamps) 39% central, 14% to 73%. Before: 15% (5.9-40) and 32% (11-67).
- Plan and film draw lamps on the walls (`wallSpots`). Film lunch: the pick now requires the infectious resident to
  breathe out 0.6 to 1.6 times the typical amount, because the caption calls them typical (same lunch as before:
  seed 1063, day 95, dining 2).
- Approximations: the table is for rooms of aspect 1.3 at that lamp density; corridors and other lamp counts read
  from the same table. The model's output slider is 100 mW where Illuminate's lamp file has 98.2.

## 2026-11-18 (later): kitchen and office join the common areas; lamp aim becomes a setting

The user: "please make this change, yes, and rerun the common areas assuming aerolamps pointed across the room".

- "Common areas" is now every room except the bedrooms (kitchen and office added): 54 lamps, and 126 with bedrooms.
  `COMMON` in web/app.js, web/film-data.mjs and experiments/cautious_check.mjs. Older experiments keep the old list.
- Lamp aim: `experiments/illuminate_table.py across --install` adds `ILLUMINATE_ACROSS` (Illuminate's "horizontal"
  placement: same wall position, aimed level at the opposite wall). `lamp.aimAcross` (0 = angled down, the default
  and Illuminate's default for the Aerolamp; 1 = straight across) picks the table in `lampCadrFor`.
  Across: the light path is 15-30% shorter, but the exposure check allows about 90% output under 2.4 m ceilings
  where angled-down lamps get about half. Net per room (extra air changes an hour, down / across): lounge 3.8 / 5.3,
  corridor 7.0 / 9.7, break room 4.6 / 6.1, office 6.4 / 9.4, dining 10.8 / 9.3, activity 9.8 / 7.8,
  therapy 12.3 / 10.5, kitchen 10.9 / 8.3, lobby 10.3 / 7.4.
- Page, 200 seasons, reported infections among residents: common areas 22% central (10% to 46%); with bedrooms 41%
  (15% to 73%). With lamps pointed across: common areas 25% (11% to 46%); with bedrooms 43% (15% to 74%).
- `experiments/aim.mjs 600` (paired, seeds 1000-1599), across minus down, in points: common areas cautious
  0.7 +/- 0.6, central 1.8 +/- 0.9, favourable 0.8 +/- 0.3; with bedrooms 1.3 +/- 0.6, 2.6 +/- 0.7, 1.4 +/- 0.4.
  The 600-season central figures are 23.3% (down) and 25.1% (across), so the page's 200 seasons carry about
  2 points of noise.
- Two-state settings (lamp aim, dimming under low ceilings) are now a pair of buttons, not a 0-1 slider
  (`choiceRow`, `LABELS` choices in web/content.json).

## 2026-11-18 (evening): influenza

The user: "Add a section where now we zoom out from just covid-19 to influenza". Read as a new film chapter, with
influenza also selectable in the simulator so the film's figures can be reproduced and changed.

Research: `research/influenza_anchor.md` (delegated; every number tagged verified or inferred). What the fit uses:
- Reported influenza among residents: 2.3% in the peak 17 weeks of 2025-26, computed from CDC's NHSN dataset
  (tscn-ryh9); reporting became mandatory in January 2025, so this is the first complete season. 2024-25 scaled: ~4%.
- One reported case in five hospitalised (both seasons).
- Staff: 13.7 infections per 100 a season (Kuster 2011 weighted by 40% vaccination) -> one arrival every 8 days.
- Natural history (Chan et al. 2025, US households): latent 0.9 d, presymptomatic 0.7 d, about 2 d of transmission
  after symptoms. The engine's infectiousness falls after day 1, so its "days infectious after symptoms" is set to 3.
- Staff with symptoms 0.5 (Kuster: 40% unvaccinated, 74% vaccinated). Protection 0.2. k = 5 (1.8 to 20), unchanged.
- Out-of-reach share: 0.60 central, 0.35 to 0.85 (the research's judgment; wider and higher than COVID-19's).

The fit (`ANCHORED_FLU`, `experiments/flu_fit.mjs`, `flu_table.sh`, `flu_install.py`):
- With the published emission (0.035 quanta/h at rest, Mikszewski) the model infects 0.7% of residents a season,
  under a third of what homes report. So emission cannot be held as COVID-19's is. Instead: reported 2.3% held,
  one infection in three assumed reported (true 6.9%), and emission and G fitted together at each share.
- Rows (400 seasons each): share 0.35 -> emission 0.49, G 1.3; 0.60 -> 0.27, 3.8; 0.85 -> 0.082, 17; 0.92 -> 0.038, 39.
  So the published emission is consistent with reported influenza only if about 92% of spread is out of reach.
- Central model, 600 seasons: mean 8.1 residents truly infected, median 5, 11% of seasons none, 28% of seasons a
  tenth of residents or more (median 14% among those; published outbreak reports: 33%, biased to large ones).
- Not modelled: oseltamivir prophylaxis in outbreaks (competes with lamps for the same infections).

Results, 200 seasons (page seeds), reported infections among residents: common areas 18% (2.7% to 41%); with
bedrooms 27% (4.7% to 62%); 2.4 of 112 residents a winter without lamps. 1000 seasons: 18% (2.7-38), 27% (3.9-58).

Code: `anchoredAt/anchoredConfig(share, pathogen)`, `ANCHORS`, `anchoredScenarios` by config.pathogen (scales
emission for influenza). Page: Infection picker on the model tab; per-infection notes (`NOTES_FLU`), mismatch list,
intro and fitted text; emission is hidden for influenza because it is fitted. Film: chapter 7 (96-131 s),
`web/film-flu.mjs` -> `web/film.flu.json`; the final card closes up, shows a table of what changes, then
influenza's rows. FD 131.

## 2026-11-19: the range named by cause; the routes picture; influenza out of the film

The user approved "name the ends of the range by cause" and a split bar of the two routes, then asked for influenza
to come out of the video but stay as a choice in the model.

Check before building (experiments/routes.mjs, 200 seasons, common areas, reported resident infections):
- Central: 19.7 without lamps = 11.2 through room air + 8.5 face to face; with lamps 7.8 + 7.7 = 15.4 (22% fewer).
  Room-air infections fall 31%; face-to-face infections fall 10% too, only because fewer people are infectious.
- The split alone (central lamps): 18% (55% out of reach) to 31% (25%).
- Lamp strength alone (central split): 13% (weak end) to 37% (strong end).
- Both: 10% to 46%.
So the range is two unknowns, and lamp strength moves the result more than the split. I had told the user it was
"really one question" (the split); that was wrong, and the labels name both.

Film: chapter 7 is now "The estimate" (87-128 s). New scene `splitBuild/splitRender`: the two routes as back-to-back
bars, without lamps above and with lamps below, then two knobs (the split; lamp strength) that move one at a time
and then together, each stop a computed model state (`web/film-routes.mjs` -> `web/film.routes.json`). The final
card follows at 111 s with range ends labelled "more face to face, lamps act weakly" / "more through room air,
lamps act strongly". The influenza chapter, its table and rows are gone; `web/film-flu.mjs` is kept but unused.

Model tab: new block "What the lamps can reach" (`drawReach`, from `repRoute` in the worker tally); the range block
is "The range, and what sets its ends" with the ends named the same way; its caption is built per infection
(`dumbCap`), which also fixes yesterday's leak of COVID-19's 55%/25% text into influenza. Influenza stays in the
Infection picker.

## 2026-11-19 (later): one choice of lamps at the top; placement moved down; three lines on the season's chart

The user: replace the "Without lamps | With lamps" switch with a choice of without lamps, common areas only,
bedrooms only, or both; move lamp placement lower, with the other granular controls; show three lines on the
comparison graph (without lamps, common areas, common areas + bedrooms).

- `state.inst` is the set of lamps in view: 'none', 'common', 'bedrooms', 'both', or 'custom'. `state.lamps` is that
  set room by room; `state.custom` keeps the user's own arrangement while they look at the standard ones.
  `setInst`, `drawInst` (#inst, in the plan panel's header), `instLamps`. The Place/Replay modes and the arm switch
  are gone: the top plan always shows the season, with the lamps of the set in view.
- Everything follows the choice: the plan, the season shown, and the results panel. Finished results are cached by
  settings and lamps (`runCache`), so returning to a set already run is immediate; the worker has a 'cancel' message.
- The replay is run once per set of lamps (`arms` in the worker's 'replay' message), so switching is immediate. It is
  re-run 0.5 s after any change that makes it stale (`staleReplay`), and keeps its place in time when the season is
  the same one.
- Season chart (#curve): without lamps (grey), common areas (violet), common areas + bedrooms (teal, --lamp-b;
  checked with the dataviz validator against violet in both themes). Bedrooms only or the user's placement, when in
  view, adds a dashed fourth line. The line in view is thicker; labels sit at the line ends.
- New panel "Place lamps room by room" above the assumptions: a plain second plan (#plan2, `drawPlacePlan`), the
  room inspector, lamps per room type, "start from", and the best-rooms search. Changing any room makes
  "Your placement", which then appears as a fifth choice at the top.

## 2026-11-19 (afternoon): results compare three cases; citations cleaned of reading notes

Results panel. The user: the histogram and the routes picture "should also be no lamps, common areas, common areas
+ bedrooms". The whole panel now compares those three (`armKeys`, worker `arms`), with Bedrooms only or the user's
placement as a fourth while it is the set in view: sentence, comparison table (replaces the four tiles), histogram
rows, routes rows, range dots, and the table. Results are cached by settings and the extra set, so switching among
the three standard sets never re-runs. A first run takes about 26 s (was about 15 s).

Citations. The user objected to notes that said how a source had been read ("read only in a secondary summary").
Two research passes plus my own fetches; files: research/readable_sources_A.md, readable_sources_B.md.
- Read in full today: Mikszewski 2022 published version (PMC8378671): SARS-CoV-2 resting 0.55 q/h (0.0058-52), not
  0.52; speaking 2.7; influenza 0.035 / 0.17; log10 SDs 1.2 and 0.84 from the viral-load SDs; no statement about
  the share from the top tenth (that is derived: 93%). Blueprint for Far-UVC table 3.3 (p. 39) and chapter 3
  references: Kitagawa 2023 is a YouTube conference presentation (k 2.6 +/- 0.2, converted from base 10, RH not
  given); Lu, Shi, Li & Lai 2025 (J Hazard Mater 484:136666) is HCoV-OC43 14.26 +/- 0.64; the 12.4 is Welch 2022.
  The page had credited the high end (12) to Lu; it is Welch. Manica, Jang, Takahashi, Buitrago-Garcia, Ma 2021,
  Chan, Tellier, and the CLA report (median occupancy 84.8% in 2025).
- Not read in full: Angel 2025 (full-text fetch refused by the safety classifier; abstract only), van Doremalen
  2020 (same), Sah 2021, Tsang 2023, McLean 1961, Boucau 2022, Weimer 2022 (found through a news site).
- The model still uses emission 0.52. A refit at 0.55 is owed, best done together with any change to k once Angel
  has been read.
- research/transmission.md credits Manica's generation time, incubation and serial interval to Xu 2023 (not on the
  page; not corrected).

## 2026-11-19 (midday): Illuminate is the source for every lamp calculation

The owner asked that OSLUV's Illuminate be the canonical source wherever it can be. What changed:

- **The lamp constant k** (`lamp.susceptibility`) is no longer picked from papers by us. `experiments/illuminate_constants.py
  [guv-calcs/src] --install` reads Illuminate's table of published inactivation constants (guv_calcs 0.10.0,
  `data/UVC Inactivation Constants.csv`), takes the rows for the species in aerosol at 222 nm, combines each row's
  two rates with Illuminate's own `eACH_UV` (k1(1 − f) + k2 f), and takes the lowest, median and highest. That is the rule
  of `efficacy.each_uv_range` in Illuminate's current source (written after 0.10.0, used by its ASHRAE 241 check); the
  script asserts agreement with it when given a checkout. Result, pasted into `src/params.js` as `ILLUMINATE`:
  COVID-19 ("Human coronavirus", 7 rows) 2.62 / 6.51 / 15.85, was 2.6 / 4.4 / 12; influenza ("Influenza virus", 2 rows)
  1.8 / 10.4 / 18.99, was 1.8 / 5 / 20. The rows and their citations travel with the constant and are printed in the
  slider's note. Things to know: only the lowest coronavirus row is SARS-CoV-2 itself (Kitagawa's 2023 conference
  presentation); the median row is HCoV-OC43 at 30-40% humidity (Romay 2025); the highest is OSLUV's own unpublished
  reanalysis of Welch 2022 (the published row is 12.37), which the owner is content to use. Angel 2025 (4.4 at 40%
  humidity, 6.8 at 65%, SARS-CoV-2) is not in the table; the note mentions it and the model no longer rests on it.
  The influenza "median" is the midpoint of two measurements eleven-fold apart.
- **Lamp output** is Illuminate's figure for the Aerolamp file, 98.2 mW (`BASE.lamp.outputMw`), not a round 100.
- **Tables** (`experiments/illuminate_table.py`, `ILLUMINATE_WALL`, `ILLUMINATE_ACROSS`) gained a lamp-density axis
  (1, 2, 3, 4 times one lamp per 250 sq ft) and hold `limit` in place of `share`: the multiple of full output at which
  Illuminate's exposure check is exactly met for 8 hours (found by running the check at 800 hours and multiplying by
  100; asserted equal to the 8-hour answer where that asks for dimming). The floor-area grid now has 20 points and
  includes the default building's own room sizes, so those are read without interpolation. `wallLampAt(table, area,
  height, mult)` interpolates over density as well; `wallLampBase(table, area)` gives the page's lamp count for a room.
- **The caps are gone.** `lamp.maxEach` and `lamp.maxEachBedroom` came from a published range of room-average
  fluence (Peng 2023) and our judgment. Illuminate's check does that job room by room and lamp count by lamp count
  (`experiments/illuminate_density.py`: a compliant room averages 0.3-1.0 µW/cm² at the page's density and 1.0-2.9 at
  four times it, so a flat 1.5 was not Illuminate's answer). `lampAchFor` still honours either cap if a config sets
  one (the ceiling-lamp tests do). Lamps beyond four times the page's density add nothing, and the page will not place
  them.
- **Bedrooms** have a new input, `lamp.bedroomShare` [0.33, 0.4, 1]: the share of Illuminate's 8-hour allowance that
  bedroom lamps may use. Illuminate's check assumes 8 hours a day in a room; residents spend 19.6 hours a day in a
  bedroom in the model (`experiments/bedroom_hours.mjs`), so the default is 8/20. Low end: 24 hours. High end: the
  8-hour check unchanged. The old bedroom cap was meant to do this ("the 8-hour limit spread over 24 hours") but, once
  the wall tables came in, it only just bound: bedrooms were getting about the 8-hour level. So bedroom lamps are now
  about half as strong per unit of k as before. Not handled: a resident's daily dose adds up across bedroom and common
  rooms; the check is still room by room, at its worst-case point.
- **A test holds the engine to Illuminate**: `experiments/illuminate_check.py` computes equivalent air changes
  directly in Illuminate for 15 of the model's rooms (lamp counts up to 4 times the usual, both aims, bedrooms at 20
  hours, lamps actually dimmed and the room recalculated) into `test/illuminate-check.json`; `test/illuminate.test.js`
  requires the engine to agree within 1% (it agrees within 0.2%).
- Headline, 200 seasons, reported resident infections: common areas 27% (9% to 48%), was 22% (10% to 46%); common
  areas and bedrooms 41% (12% to 74%), was 41% (15% to 73%); bedrooms only 15% (5% to 40%), was 18% (6% to 39%).
  Averages 19.7 → 14.4 → 11.7. `experiments/headline.mjs` reproduces these.
- **Emission 0.55 not adopted yet.** `experiments/emission_row.mjs` reran the nine fit rows at the published 0.55
  (experiments/out_emission055.txt). True resident infections at the central share rise from 22.9 to 24.9 a season and
  the reported share falls from 0.86 to 0.79; headline percentages move by 0 to 3 points (common 27 → 27, both 41 → 43,
  cautious common 9 → 8, favourable common 48 → 45). The owner asked how much it changes before deciding.
- Also on the page: the ventilation slider shows air changes for bedrooms and dining rooms; the mask slider says when
  masks are worn (only during outbreak measures: 69% of days in a default COVID-19 winter, 8% for influenza,
  `experiments/mask_days.mjs`); the influenza note for people without symptoms cites Tsang 2023 directly (0.57, 95%
  interval 0.11 to 1.54, read in full); the bedroom sentence names its source (NHS Scotland Assure report, section
  8.3.2) and says what it does and does not say.

## 2026-11-19 (afternoon): the owner's proposed out-of-reach shares, tried but not installed

The owner's doc proposes COVID-19 35 / 55 / 75% and influenza 40 / 70 / 85% (optimistic / central / cautious). Nothing
on the page was changed. What the experiments show (200 seasons, `experiments/headline.mjs --shares=...`):
- Under the current COVID-19 fit (virus output held at 0.52) the 75% case is not usable: the table had to be extended
  (G 9 and 12, `experiments/out_table_extended.txt`) and the model then infects 86 of 112 residents a winter with 24%
  reported; lamps do almost nothing (0.6%) because nearly everyone is infected anyway.
- `experiments/covid_fit_emission.mjs` fits COVID-19 the way influenza is fitted: true resident infections held at
  21.7% a season (86% reported, today's central), virus output and G fitted per share
  (`experiments/out_covid_fit_emission_sorted.txt`). Output needed: 0.55 at a 36% share, 0.34 at 55%, 0.15 at 75%.
  With the current shares this fit reproduces today's page (common 29% (9-47), both 41% (14-75)), so the method
  itself moves little. With the doc's shares: common 21% (7% to 40%), both 35% (8% to 68%).
- Influenza with the doc's shares: common 18% (2.5% to 37%), both 26% (3% to 56%); today 24% and 32%.
- Presenteeism (`experiments/presenteeism.mjs`): 65% of infected staff get symptoms, 70% of those stay home after up to
  a day, for 7 days; 46% of infected staff are ever excluded and 31% of staff infectious time is spent excluded.

## 2026-11-19 (later): how often infection arrives moves the lamp effect

Asked whether to vary introductions per season. Not installed; two experiments, COVID-19, central settings:
- `experiments/arrivals.mjs` (fit left alone, so infections move too): common-area cut 23 / 21 / 27 / 41 / 45 / 42 / 46%
  for one arrival every 3 / 5 / 7 / 10 / 14 / 21 / 30 days; infections per arrival rise from 0.9 to 2.5.
- `experiments/arrivals_refit.mjs` (virus output and G refitted with `covid_fit_emission.mjs <G> 0.217 200 <days>` so
  residents infected and the 40% share stay put): every 4 days (output 0.36) common 23% (±5), both 36%; every 7 days
  (0.52) 27% (±5), 40%; every 14 days (0.68) 35% (±8), 47%. Fewer, larger outbreaks mean lamps do more: a chain that is
  stopped stays stopped, where with frequent arrivals the next one reaches the same residents.
- The weekly beat was a convenience. The community range in the staff-hazard note (0.02% to 0.3% of staff a day)
  is one arrival every 2.5 to 38 days. NHSN facility-week counts (share of weeks with a case) could pin it; the fit
  code already computes that share (`evaluate().w1`).

## 2026-11-19 (2 pm): the arrival rate is a slider, and its default is every 5 days

- `importation.arrivalEveryDays` is now a model input (`anchoredOnly: true`: `anchoredConfig` sets it, `defaultConfig`
  and the engine's random-arrival default are left alone), range 3 to 14 days, in the page's first group of sliders.
  Influenza keeps 8 days. Moving the slider does not re-fit anything.
- COVID-19 default moved from 7 to 5 days, the owner having asked for the most likely value. Why 5: it puts 18% of
  staff infected outside work over the winter; and it gives a reported resident infection in 23% of weeks and two or
  more in 15% (`experiments/weeks_now.mjs`), inside CDC's 14.9-26.1% and 8.6-16.6% of homes per week for winter 2023-24
  (MMWR 73(15), Franklin et al. 2024). That check is loose (4 to 14 days all pass, `experiments/weeks_with_case.mjs`),
  so 5 is a judgment.
- `ANCHORED.table` refitted at 5 days (`experiments/emission_row.mjs 0.52 <G> 400 5`, experiments/out_table_every5.txt).
  At the central share the model now infects 26% of residents (was 22%) and 70% are taken as reported (was 86%); all
  infections are reported below a share of 0.23 (was 0.33). Staff infected: 34% to 48% across the range (was 26-40%).
- Headline, 200 seasons: common areas 22% (10% to 41%), was 27% (9% to 48%); common areas and bedrooms 34% (12% to
  70%), was 41% (12% to 74%); bedrooms only 15% (3% to 37%). Averages 19.1 → 14.9 → 12.6. Staff are masked on 76% of
  days (was 69%).
- The film's season changed with the arrivals: seed 1042, lunch on day 111 in dining room 2 (24 people, 2 tablemates).
- The range on the page still combines only two unknowns (the split and lamp strength). The arrival rate is a third
  of similar size and is not in it.

## 2026-11-19 (3 pm): what is installed and what is not, on the 5-day model

Installed: Illuminate's constants, output and tables; bedroom dimming for 20 hours; arrivals every 5 days (slider).
Not installed, each tried on today's model (200 seasons, common areas / common areas and bedrooms, cautious-central-optimistic):
- Page as it stands: 10 / 22 / 41% and 12 / 34 / 70%.
- Published virus output 0.55 (`out_emission055_every5.txt`): 8 / 23 / 41% and 11 / 36 / 70%.
- The owner's shares 35 / 55 / 75% with COVID-19 fitted the influenza way at 5 days, residents infected held at 26.9%
  (`out_covid_fit_emission_every5.txt`; output needed 0.55 at a 36% share, 0.35 at 55%, 0.155 at 75%): 1 / 16 / 34% and
  4 / 27 / 61%. The same fit with today's shares gives 7 / 22 / 41% and 10 / 35 / 71%, so the fit method is not what moves it.
- Influenza with the owner's shares 40 / 70 / 85%: 2.5 / 18 / 37% and 3 / 26 / 56% (today 2.5 / 24 / 41% and 3 / 32 / 62%).

## 2026-11-20: under version control

- The project is a git repository. Machine-specific paths are gone: page-test scripts take the browser and the page
  from `shots/lib.mjs` (env `PLAYWRIGHT`, `CHROME`), `web/narrate.py` takes the Kokoro model folder from `KOKORO_DIR`.
- `web/build.mjs` now also writes `dist/publish/index.html` (the file to publish) and `shots/page.html` (the same,
  for page tests), from the fixed outer wrapper in `web/publish-head.html`. Checked: the build reproduces the
  published page byte for byte.
- `CLAUDE.md` is the orientation for a new session; `web/parts/` (old backups) and screenshots are not tracked.

## 2026-11-20 (later): non-room-air spread from the owner's document, 20 / 30 / 50%

The owner's document "Room-air spread and non-room-air spread: how the numbers were chosen" (Claude Docs,
https://claude.ai/artifact/J6LQJE4TpgcXPqo7qNByad) replaces the earlier proposal (35 / 55 / 75%). Installed:

- **The three cases.** Non-room-air spread for COVID-19 is 20% (best for lamps), 30% (central) and 50% (cautious);
  was 25 / 40 / 55%. The document's figures are in `src/params.js` as `NON_ROOM_AIR` (cases and its by-setting table).
- **What the share is counted over.** The fit tables' `closeShare` is now the share caught face to face among
  infections passed to or from a resident (care, roommates, dining and other shared rooms), which is what the
  document's three settings cover. Until today it counted every infection in the home; staff-to-staff spread (stations,
  break room, office: about a third of all infections) is almost all room air in the model and pulled the figure down.
  Each COVID-19 row keeps the old figure as `shareAll`: 14 / 22 / 40% at the three cases. `experiments/anchored.mjs`
  `evaluate()` returns both.
- **By setting.** The document says a model that can take a value per setting should use its table (care 30/40/60,
  roommates 3/4/9, dining or activity 20/25/45). The model has one face-to-face strength G, not one per setting. With G
  fitted to the home-wide case, `experiments/settings.mjs` (1,000 seasons) gives care 27 / 39 / 61, roommates
  2.5 / 4.4 / 10.6, dining or activity 15 / 24 / 45. That is within 5 points everywhere, so no per-setting strengths
  were added. The model's values are stored in `NON_ROOM_AIR.model` and shown beside the document's in the explainer.
- **Roommates.** `transmission.roommateHours` default 0 → 1.5 (range 0 to 3), so roommates have the small face-to-face
  share the document gives them. At 1 hour the central figure was 2.7%; at 1.5 it is 4.4%.
- **COVID-19 table** refitted (`experiments/emission_row.mjs 0.52 <G> 1000 5`, `experiments/out_table_nonroomair.txt`),
  now 1,000 seasons a row because 400 left the residents-infected column uncertain by over a point. G 0.23 / 0.42 / 1.12.
  The model infects 14.8% / 17.0% / 25.3% of residents, against 18.7% reported to CDC: at 20% and 30% it infects fewer
  than homes report and every infection counts as reported; at 50% about a quarter go unreported (at the old cautious 55%, about half did).
  The model matches CDC exactly at a share of about 0.36.
- **Influenza** has no figure of its own, as the document says. Each case uses COVID-19's G; the virus breathed out
  is fitted to 6.9% of residents as before (`experiments/flu_table.sh 0.069 8 0.2 400`, rows now at G 0.1 to 10), and
  `ANCHORED_FLU.shares` is read off the table at COVID-19's G: 16 / 25 / 46% (was 35 / 60 / 85%). Fitted virus output
  at the central case is 0.69 quanta an hour, 20 times the published 0.035 (was 0.27, 8 times).
- **Headline, 200 seasons, reported resident infections.** COVID-19: common areas 32% fewer (12% to 47%), was 22% (10%
  to 41%); common areas and bedrooms 51% (15% to 78%), was 34% (12% to 70%); bedrooms only 22% (3% to 45%). Averages
  19.2 → 13.0 → 9.4. Influenza: common areas 48% (17% to 60%), was 24%; with bedrooms 68% (18% to 86%), was 32%.
- **Checks redone.** Weeks with a reported resident infection 21%, two or more 13% (CDC 15-26% and 9-17%); staff
  infected 31% to 38%; staff masked on 76% of days (COVID-19) and 8% (influenza); influenza: a quarter of seasons reach
  a tenth of residents, median 16% among those (`experiments/flu_outbreaks.mjs`). With the values studies suggest for
  talking and immunity (5, 10, 0.3) the model infects 51% of residents at the central G, so the intro's claim stands.
- **The page.** The document is reproduced as a second explainer (dialog `#split` in `web/app.html`), opened from the
  film tab, from the first slider and from "What the lamps can reach". Its section "How the simulator uses these
  numbers" is ours and is filled from `NON_ROOM_AIR` (`splitModel` in `web/film.js`). Page text says "non-room-air
  spread" where it said "out of the lamps' reach"; the model's mechanism is still called face to face. Film data,
  captions and narration regenerated (Kokoro af_heart). The film's season is now seed-picked afresh: lunch with 45 people.
- **Not done, for the owner.** (1) At the published virus output 0.55 the model infects 15.9% / 18.1% / 26.7% at the
  three cases, so the central case would sit at CDC's 18.7% where 0.52 leaves it 1.7 points short. That decision is
  now worth more than noise. (2) The three settings moved to hold infections down when the share was 40% (talking 2 and
  5, immunity 0.5) now overshoot at 30%; they were left alone. (3) The document's calculation itself is not in this
  repository, so its tables are reproduced, not recomputed.

## 2026-11-20 (evening): page changes at the owner's request, and GitHub Pages

- **GitHub Pages.** The page is published at https://misterflask.github.io/nursing-home-simulation/ by
  `.github/workflows/pages.yml` on every push to `main` (unit tests, build, deploy `dist/publish/`). The repository
  must be public and its Pages source set to "GitHub Actions": while it was briefly private the deploy failed with
  "Not Found". This session cannot re-run a workflow; only a push to `main` starts one.
- **Slider text.** Under each slider there are now one or two sentences saying what the setting is. The 27 settings
  with longer notes got a short description (`BRIEF` in `web/content.json`); the full note, range and source open in a
  dialog from "More about this setting" (`noteOpen` in `web/app.js`, dialog `#note`). `shots/n5.mjs` checks it.
- **Intro above the film** reworded by the owner. Two of its claims were discussed and kept as the owner wrote them:
  "replicable" for the laboratory studies (the lamp constants on the page span six-fold), and "no study has attempted
  to answer what the appropriate arrangement of lamps is" (Kristensen et al. 2026 compared two arrangements,
  inconclusively).
- **Headings** are now conventional labels: Introduction, Results, Infections by route, Sensitivity analysis,
  Baseline: where infection spreads, Transmission routes, Room-air infections by room type, Lamp placement, Presets,
  Model assumptions, Limitations, Interpretation, Known discrepancies, Not modelled, Infection risk calculation,
  Implementation in the simulator. The earlier ones described their sections in a clause because the plain-language
  rule had been applied to headings too. The headings inside the owner's document are unchanged.
- **The film is a standard video player.** A large play button sits over the picture whenever it is not playing; a
  click on the picture plays or pauses; the bar under the picture has play/pause, a clock, the scrubber, a sound button
  and the narration speed; K or space, the arrows and M work from the keyboard. The clock runs in narration time
  (4:33) with sound on and film time (2:08) with it off. No fullscreen: the captions sit below the picture.
  `shots/p2.mjs` checks it; `shots/f1.mjs` hides the play button when it takes frames.


## 2026-11-20 (night): a trial of two pictures in place of text, and lamp totals on the film's last card

- **Summary as dots** (`drawDots` in `web/app.js`). One dot for each of the 112 residents, a row without lamps and a
  row for each set of lamps: filled dots are reported infections in an average winter, rings are residents infected
  without lamps and not with them. Three buttons switch between the cautious, central and favourable cases. It sits
  above the film (from `FILM.ranges`, the build's 200 winters) and at the top of Results (live, from the current
  settings). Counts are means rounded to whole people, and the caption says so.
- **Interactive example** (`toyBuild`, `toyDraw` in `web/film.js`; panel `#toypanel` under the film). The film's lunch,
  from the same functions the film quotes (`F.ch`): select who is infectious, set the number of lamps, switch between
  a high and a typical emitter. It shows the air cleaning as equivalent air changes, each person's chance through room
  air and face to face, and the average infections from the lunch split by route. Lamps and seats have no positions
  that matter, because the model's room air is evenly mixed; the note under the picture says so.
- **Film, last card.** Each row now gives its lamp total in larger type (54 in total; 126 in total, 54 in the common
  areas and 72 in the bedrooms). The totals were there before in small grey type. No caption changed, so the narration
  is still valid; the totals are shown, not spoken.
- Not published and not on `main`. The owner has not yet said whether either picture stays.
- **Hover on the plan** (`personTip` in `web/app.js`). A resident's tip now says which of the three types they are
  (mobile, room-oriented, bedbound) and whether they share a bedroom. Once a person is infected in the run being
  shown, it adds what the model drew for them: when, how, from whom and where they caught it, the days they are
  infectious, whether and when symptoms start, how much virus they breathe out against the typical amount, and
  whether immunity cut their dose. The replay message from the worker carries `mobility`, `roommate`, `traits` and,
  per run, `how`.
