# Study-design runs (COVID-19, fourth pass)

Produced on 2026-11-11 with the fourth-pass model in `src/params.js`:
- lamps follow the maker's mounting rule (output dimmed in rooms under 2.6 m);
- the "unreachable share" (face to face plus hands and surfaces) replaces
  the old close-range share, at 0.24 / 0.55 / 0.86;
- the COVID-19 calibration was refitted at those shares.

Every number here supersedes the third-pass results. The old central "12
lamps avert 5.4 residents (28%)" was both a high draw and a more generous
lamp. It is now **2.5 residents (12.5%)**.

Influenza results from the second pass are in `not-validated/`. They come
from a fit that is not validated and must not be published.

Commands (about 6–7 minutes per scenario for `study`, 4.5 for `sensitivity`, 2 for `check`):

    node src/cli.js study       --pathogen covid --scenario <cautious|central|favourable> --out results
    node src/cli.js sensitivity --pathogen covid --out results
    node src/cli.js check       --pathogen covid --out results
    node src/cli.js outcomes    --pathogen covid --scenario <central|favourable> --out results

Files:
- `covid-<scenario>.json` (everything), `-rank.csv`, `-placements.csv`, `-power.csv`;
- `covid-central-sensitivity.json/.csv` (room assumptions);
- `covid-calibration-check.json` (fresh-seed check);
- `covid-<scenario>-outcomes.json` (candidate trial outcomes).

`run.log` holds progress.

## What each cell does

- **Scenarios.** All three are fitted to the same no-lamp targets: season incidence 18.7%, median outbreak 21% and the share.

  | scenario | out of reach of room-air cleaning | lamp susceptibility | path length | real-world factor | per lamp, 2.4 m room / 2.7 m room (m³/h, all-in) | cap on lamp air changes, shared / bedroom |
  |---|---|---|---|---|---|---|
  | cautious | 86% | 2.6 | 0.83 × height | 0.5 | 56 / 105 | 12.7 / 1.6 |
  | central | 55% | 4.4 | 1.0 × height | 0.75 | 171 / 321 | 23.8 / 6.3 |
  | favourable | 24% | 12 | 1.25 × height | 1.0 | 778 / 1458 | 64.8 / 43.2 |

  - Per-lamp clean air = 0.36 × susceptibility × 100 mW × output share × ceiling height × path factor × real-world factor.
  - The output share comes from the maker's mounting rule: 60% at 2.4 m, 100% at 2.7 m.
  - The cautious row is the research low row (40 mW, 2.0 m, k 2.6, η 0.5, about 37 m³/h). That row's 40 mW is the 2.3 m dimming. Here dimming follows each room's height, so a 2.4 m room gets 60% output (56 m³/h); a 2.3 m room would get 36 m³/h.
- **Ranking.**
  1. 300 no-lamp seasons (seeds 1–300) give the room-air infections in each room.
  2. Lamps are allocated greedily by the first-order formula.
  3. Budgets of 4, 8, 12, 20 and 40 lamps are prefixes of that sequence.
  4. **Confirmation:** each budget is run against no lamps on **2,000 fresh paired seeds** (10001–12000).
- **Fixed placements.** One lamp per 100 m³ (at least one per room), on 2,000 paired seeds (20001–22000).
- **Trial power.** Placement = best 12-lamp allocation.
  - The pool: 2,000 simulated homes, each with its own ventilation (GSD 1.6), outside infection rate (GSD 2.0) and immunity (± 0.1).
  - Each home has 2 control and 2 lamp seasons, all independent. It also has one **paired** lamp season: the same world and random numbers as its first control season.
  - Parallel trials: permutation test. Crossover trials: sign-flip test. 400 trials per cell.
- **Homes for 80% power.**
  - The effect δ is the **paired** (common-random-numbers) mean difference over the 2,000 homes.
  - σ is the between-home SD of a one-season outcome, from the independent seasons.
  - Parallel per arm = 2 (1.96 + 0.84)² σ² / δ². Crossover total uses the SD of the difference between two independent seasons of one home.
  - The 95% interval comes from 400 bootstrap resamples of homes.
  - No size is given when the paired effect is not positive.
  - All sizes are far beyond the simulated cells (80 per arm), so they are normal-approximation **extrapolations**.
  - The unpaired figures (difference of independent means) are kept in the JSON as `unpaired` for reference.

## Read this before using the numbers

- Under the central assumptions, 12 well-placed lamps avert about 2.5 of
  about 20 resident infections per season (12%). The cautious setting gives
  about 1%, the favourable setting about 41%.
- Season-to-season variation between homes is enormous, because an
  introduction either fizzles or becomes a large outbreak. A trial with
  resident infections as the outcome would need about 2,100 homes per arm
  (central) or about 200 (favourable). Under the cautious setting it would
  need more than 100,000, which is not feasible.
- What the model leaves out:
  - Hands-and-surfaces spread is not simulated; it is counted inside the unreachable share.
  - Resident routines repeat every 28 days.
  - Lamp effects are calculated from physics, not measured in care homes.

## Headline tables

### covid / cautious  (baseline mean 20.3 residents infected [18.9, 21.7], attack rate 18.1%; routes {"room":9680,"close":66437,"community":4996}; 6.5 min)
| lamps | where (by room type) | residents averted, mean [95% CI] | relative | first-order prediction (all people) |
|---|---|---|---|---|
| 4 | breakroom 2, lounge 2 | -0.00 [-0.14, 0.14] | -0.0% | 0.37 |
| 8 | lounge 4, breakroom 2, dining 2 | 0.10 [-0.08, 0.29] | 0.5% | 0.57 |
| 12 | lounge 7, breakroom 3, dining 2 | 0.23 [0.03, 0.44] | 1.2% | 0.74 |
| 20 | lounge 11, dining 4, breakroom 3, office 2 | 0.36 [0.15, 0.58] | 1.8% | 0.99 |
| 40 | lounge 16, dining 11, breakroom 5, office 4, station 4 | 0.65 [0.39, 0.91] | 3.2% | 1.43 |
| placement | lamps | residents averted [95% CI] | relative | P(lamp season worse) |
|---|---|---|---|---|
| shared rooms | 15 | 0.20 [0.05, 0.35] | 1.0% | 0.03 |
| shared rooms + break room | 16 | 0.31 [0.12, 0.50] | 1.5% | 0.03 |
| every room | 105 | 0.62 [0.34, 0.90] | 3.0% | 0.05 |
- 80% power, resident infections per season: paired effect 0.33 [0.14, 0.51] (n pairs 2000), sigma 33.65, sigmaDiff 43.33; parallel 166710 per arm [66987, 611579], crossover 138265 total [54399, 509211]; unpaired delta -1.10 -> 14768/12248; pOutbreak 1.00
- 80% power, residents infected per detected outbreak: paired effect 0.56 [0.17, 0.96] (n pairs 1033), sigma 35.64, sigmaDiff 49.34; parallel 119443 per arm [41433, 952462], crossover 185729 total [67802, 1402963]; unpaired delta -0.62 -> 98416/2688113; pOutbreak 0.52
- power: p5=0.01  p10=0.07  p20=0.05  p40=0.06  p80=0.06  c5=0.00  c10=0.06  c20=0.04  c40=0.04  (pool control mean 22.2, lamps 22.6, lamps paired 21.7)
- alt power: p5=0.01  p10=0.03  p20=0.06  p40=0.05  p80=0.04  c5=0.00  c10=0.00  c20=0.03  c40=0.04

### covid / central  (baseline mean 19.8 residents infected [18.5, 21.1], attack rate 17.7%; routes {"room":34795,"close":42449,"community":5926}; 6.7 min)
| lamps | where (by room type) | residents averted, mean [95% CI] | relative | first-order prediction (all people) |
|---|---|---|---|---|
| 4 | lounge 2, breakroom 1, dining 1 | 1.18 [0.84, 1.52] | 6.0% | 2.35 |
| 8 | lounge 4, breakroom 2, dining 2 | 2.07 [1.64, 2.49] | 10.4% | 3.61 |
| 12 | dining 4, lounge 4, breakroom 2, station 1, office 1 | 2.48 [2.03, 2.93] | 12.5% | 4.43 |
| 20 | lounge 8, dining 6, station 3, breakroom 2, office 1 | 3.27 [2.78, 3.76] | 16.5% | 5.65 |
| 40 | lounge 11, dining 8, station 8, bedroom 6, breakroom 3, office 2, activity 1, kitchen 1 | 4.54 [3.97, 5.11] | 22.9% | 7.61 |
| placement | lamps | residents averted [95% CI] | relative | P(lamp season worse) |
|---|---|---|---|---|
| shared rooms | 15 | 2.26 [1.80, 2.72] | 11.8% | 0.04 |
| shared rooms + break room | 16 | 2.88 [2.39, 3.38] | 15.0% | 0.04 |
| every room | 105 | 5.32 [4.67, 5.98] | 27.7% | 0.04 |
- 80% power, resident infections per season: paired effect 2.71 [2.23, 3.20] (n pairs 2000), sigma 31.19, sigmaDiff 40.54; parallel 2077 per arm [1512, 2991], crossover 1755 total [1264, 2554]; unpaired delta 2.11 -> 3416/2885; pOutbreak 1.00
- 80% power, residents infected per detected outbreak: paired effect 3.77 [2.97, 4.57] (n pairs 1109), sigma 32.67, sigmaDiff 45.31; parallel 2116 per arm [1409, 3447], crossover 3137 total [2101, 5435]; unpaired delta 2.70 -> 4120/6650; pOutbreak 0.56
- power: p5=0.04  p10=0.04  p20=0.05  p40=0.05  p80=0.08  c5=0.00  c10=0.07  c20=0.05  c40=0.04  (pool control mean 21.9, lamps 19.8, lamps paired 19.3)
- alt power: p5=0.01  p10=0.05  p20=0.04  p40=0.04  p80=0.04  c5=0.00  c10=0.01  c20=0.06  c40=0.04

### covid / favourable  (baseline mean 21.5 residents infected [20.0, 23.0], attack rate 19.2%; routes {"room":66186,"close":21847,"community":4124}; 5.6 min)
| lamps | where (by room type) | residents averted, mean [95% CI] | relative | first-order prediction (all people) |
|---|---|---|---|---|
| 4 | dining 2, breakroom 1, lounge 1 | 4.57 [3.90, 5.25] | 21.3% | 6.72 |
| 8 | lounge 4, dining 2, breakroom 1, station 1 | 7.85 [7.03, 8.67] | 36.5% | 10.96 |
| 12 | lounge 4, station 4, dining 2, breakroom 1, office 1 | 8.77 [7.90, 9.63] | 40.8% | 13.27 |
| 20 | station 6, dining 4, lounge 4, breakroom 1, office 1, activity 1, kitchen 1, therapy 1, bedroom 1 | 10.20 [9.25, 11.15] | 47.4% | 15.94 |
| 40 | bedroom 18, station 8, dining 5, lounge 4, breakroom 1, office 1, activity 1, kitchen 1, therapy 1 | 12.63 [11.58, 13.68] | 58.7% | 20.23 |
| placement | lamps | residents averted [95% CI] | relative | P(lamp season worse) |
|---|---|---|---|---|
| shared rooms | 15 | 7.77 [6.97, 8.56] | 34.8% | 0.02 |
| shared rooms + break room | 16 | 9.36 [8.48, 10.24] | 41.9% | 0.01 |
| every room | 105 | 16.60 [15.39, 17.81] | 74.3% | 0.00 |
- 80% power, resident infections per season: paired effect 9.01 [8.10, 9.92] (n pairs 2000), sigma 31.97, sigmaDiff 42.12; parallel 198 per arm [167, 235], crossover 172 total [143, 201]; unpaired delta 8.24 -> 237/206; pOutbreak 1.00
- 80% power, residents infected per detected outbreak: paired effect 14.61 [13.07, 16.15] (n pairs 888), sigma 35.15, sigmaDiff 48.35; parallel 188 per arm [155, 235], crossover 310 total [254, 404]; unpaired delta 12.40 -> 261/502; pOutbreak 0.48
- power: p5=0.03  p10=0.05  p20=0.14  p40=0.17  p80=0.37  c5=0.00  c10=0.06  c20=0.12  c40=0.20  (pool control mean 24.1, lamps 15.3, lamps paired 14.8)
- alt power: p5=0.00  p10=0.06  p20=0.12  p40=0.18  p80=0.35  c5=0.00  c10=0.00  c20=0.03  c40=0.09


Power key: `pF` = parallel, F homes per arm, one season. `cF` = crossover,
F homes in total, two seasons. "alt power" uses residents infected per
detected outbreak as the outcome. "pOutbreak" is the share of home-seasons
with at least one detected outbreak (always 1 for the season count).

## Room-assumption sensitivity (central scenario, best 12 lamps re-ranked for each variant, 1,500 fresh paired seeds 30001–31500)

| variant | 12 lamps by room type | residents averted [95% CI] | relative |
|---|---|---|---|
| as set (lounge 25 m², lounge 3/h, break room 1/h) | dining 4, lounge 4, break room 2, station 1, office 1 | 2.33 [1.82, 2.84] | 12% |
| lounge 15 m² | lounge 7, dining 2, break room 2, station 1 | 3.71 [3.14, 4.29] | 17% |
| lounge 40 m² | dining 4, lounge 4, break room 2, station 1, office 1 | 1.91 [1.41, 2.42] | 10% |
| lounge ventilation 6/h | dining 4, lounge 4, break room 2, station 1, office 1 | 1.91 [1.41, 2.41] | 10% |
| break-room ventilation 4/h | lounge 5, dining 4, break room 1, station 1, office 1 | 2.02 [1.56, 2.49] | 10% |
| combined cautious (lounge 40 m², lounge 6/h, break room 4/h) | dining 6, station 3, break room 1, office 1, bedroom 1 | 1.12 [0.71, 1.52] | 6% |

The lounges and break room lead the ranking mainly because they are assumed
small and poorly ventilated. No survey of lounge sizes or of break-room
ventilation was found. With larger, better-ventilated lounges and break
rooms, the 12-lamp effect halves and the lamps move to the dining rooms and
corridors.

## Calibration check on fresh seeds (400 seasons per set, not used in the fit)

| scenario | seeds | season attack rate (target 18.7%) | share achieved | outbreak median [IQR] (target 21%) | staff attack rate during outbreaks (median) | staff attack rate, season | outbreaks per season |
|---|---|---|---|---|---|---|---|
| cautious | 50001–50400 | 18.3% | 0.89 | 20% [4–60%] | 21% | 15.8% | 0.56 |
| cautious | 70001–70400 | 21.8% | 0.88 | 17% [3–70%] | 13% | 18.2% | 0.62 |
| central | 50001–50400 | 17.8% | 0.57 | 15% [4–53%] | 12% | 16.8% | 0.60 |
| central | 70001–70400 | 19.6% | 0.55 | 20% [4–62%] | 18% | 18.9% | 0.62 |
| favourable | 50001–50400 | 19.4% | 0.26 | 26% [4–66%] | 20% | 18.4% | 0.55 |
| favourable | 70001–70400 | 20.7% | 0.24 | 31% [5–76%] | 24% | 20.1% | 0.52 |

- **Season attack rate: matched within noise.** One season's attack rate has an SD of about 0.28, so a 400-season mean has an SE of about 1.4 points. All six sets lie within 2.2 SE of 18.7%; pooled per scenario (800 seasons) they are within 1.3 SE.
- **Outbreak median: matched only loosely.** It ranges from 15% to 31%. It is the median of a two-humped distribution (most outbreaks stay tiny, some reach most residents), so it moves several points between seed sets. The favourable sets run high, at 26% and 31%.
- **Staff attack rate during outbreaks.** The median over outbreaks of staff infected as a share of all staff is 12–24% on fresh seeds (central 12% and 18%). The 21% in the third-pass notes was the value on the fitting seeds. The reported figure is 10.8% (Spain).

## Candidate trial outcomes (`outcomes` command; unpaired normal approximation, for comparing outcomes with each other)

| scenario | outcome | effect | parallel, per arm | crossover, total |
|---|---|---|---|---|
| central | resident infections per season | 9.6% | 3495 | 2955 |
| central | log(1 + resident infections per season) | 5.6% | 4193 | 3200 |
| central | season has an outbreak of 10+ residents | 8.9% | 3343 | 2835 |
| central | residents infected per detected outbreak | 6.6% | 5799 | 10594 |
| favourable | resident infections per season | 36.7% | 205 | 179 |
| favourable | log(1 + resident infections per season) | 19.7% | 392 | 317 |
| favourable | season has an outbreak of 10+ residents | 22.9% | 514 | 449 |
| favourable | residents infected per detected outbreak | 30.9% | 210 | 385 |

These use the unpaired difference of independent means, which is noisier than
the paired effect above. For example, the central count outcome gives 3,495
per arm here against 2,077 [1,512–2,991] from the paired effect. Use them only to
rank outcomes against each other. No outcome a study could measure removes the
take-off variance.
