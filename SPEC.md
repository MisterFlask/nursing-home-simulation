# Care-home airborne transmission model — specification

Purpose: an agent-based model of respiratory infection spreading through a
nursing home of about 200 people, run with and without far-UVC lamps in chosen
rooms. Two consumers share one engine:

1. A public web page where anyone can place lamps, change assumptions and run it.
2. A batch runner used to plan a real study: where to put a limited number of
   lamps, and how big a trial must be to detect an effect.

The model reports infections only. It makes no statement about illness
severity, hospitalisation or death.

## 0. Ground rules for the code

- `src/engine.js`: ES module, zero dependencies, no DOM, no Node-only APIs.
  Must run unchanged in a browser Web Worker and in Node 22.
- All randomness comes from a seeded PRNG (e.g. mulberry32/sfc32) owned by the
  world. `Math.random` is never called.
- Every tunable number lives in the config object. No magic numbers in engine
  logic. Parameter metadata (label, units, low/central/high, source) lives in
  `src/params.js`, not in the engine.
- Time step ("slot") = 30 minutes, 48 slots per day. Slot 0 starts at 00:00.
- Units: hours, metres, m³, quanta. Rates are per hour.

## 1. World

`buildWorld(config, seed)` creates everything that does not depend on the
intervention, including every random draw. Two runs on the same world with
different lamp placements are therefore the *same facility in the same season
with the same people* — differences are caused by the intervention alone
(common random numbers).

### 1.1 Rooms

`buildFacility(config.facility)` returns a flat room list. Each room:

```
{ id, type, wing (0..n-1 or -1 for central), name,
  area (m²), height (m), volume (m³), ach (clean-air changes per hour) }
```

Room types and ids (ids are a contract with the UI):

| type        | id pattern           | count (default)                 |
|-------------|----------------------|---------------------------------|
| bedroom     | `w{W}-bed-{NN}`      | per wing: singles + doubles     |
| lounge      | `w{W}-lounge`        | 1 per wing (day room)           |
| station     | `w{W}-station`       | 1 per wing (nurses' station + corridor) |
| dining      | `dining-{N}`         | config.facility.diningRooms     |
| activity    | `activity`           | 1                               |
| therapy     | `therapy`            | 1                               |
| breakroom   | `breakroom`          | 1                               |
| kitchen     | `kitchen`            | 1                               |
| office      | `office`             | 1 (admin, shared)               |
| lobby       | `lobby`              | 1                               |
| outside     | `outside`            | pseudo-room; no transmission    |

`ach` is *effective clean-air* changes per hour: outdoor air plus filtered
recirculated air. Air exchange between rooms is not modelled (stated omission).
Per-type ACH defaults come from config; a global multiplier
`config.ventilation.scale` scales all of them (UI slider).

### 1.2 People

Residents: `wings × residentsPerWing`. Each has a home bedroom, roommate (if
double), a mobility class drawn from config shares:

- `communal`: eats in a dining room, attends activities.
- `limited`: eats in the wing lounge, attends activities with low probability.
- `roombound`: never leaves the bedroom.

Communal residents get a fixed dining room and a fixed table (config
`tableSize`, default 4). Limited residents get a fixed lounge table.

Staff roles: `cna`, `nurse`, `therapist`, `dietary`, `housekeeping`,
`activities`, `admin`. Each staff member has a shift (`day` 07–15, `evening`
15–23, `night` 23–07), a home wing where relevant, a weekly work pattern such
that the configured number per role per shift is on duty every day, and (CNAs)
a panel of assigned residents in the home wing. `floatShare` = probability
that on a given working day a CNA/nurse covers a different wing.

Visitors are transient: they are never tracked as susceptible; they only emit.

### 1.3 Per-person pre-drawn randomness (the coupling)

Drawn once in `buildWorld` for every person:

- `threshold` ~ Exp(1): infection occurs when cumulative effective dose ≥ threshold (Sellke construction).
- `q`: personal emission scale, lognormal (config median and GSD) — overdispersion.
- natural-history durations (latent, presymptomatic, infectious), symptomatic flag.
- `immune` flag and susceptibility multiplier `s`.
- `routeU` ~ U(0,1) for route attribution.
- staff: `communityDay` — the day they would be infected outside work (geometric with daily hazard; may exceed the season = never).
- staff: `staysHomeWhenSick` flag and delay.

Per-day schedule randomness (activity attendance, float assignments, visitors
and whether each visitor is infectious) is also drawn in `buildWorld`.

### 1.4 Schedules

`world.loc[person][day*48 + slot]` → room index (typed array). Built from
config timetables:

Residents (defaults are placeholders until research lands; all in config):
- 22:00–07:00 bedroom. 07:00–08:00 bedroom (morning care).
- Meals 08:00–09:00, 12:00–13:00, 17:30–18:30 in dining room (communal),
  lounge (limited), bedroom (roombound, or anyone isolated).
- Activities 10:00–11:30 and 14:00–15:30: communal attend each session with
  probability `pActivity`; limited with `pActivityLimited`. Location: activity
  room, overflow to wing lounge if capacity exceeded.
- Therapy: `therapyShare` of residents get one 30- or 60-minute session on
  weekdays in the therapy room, with a therapist (close contact).
- Otherwise: bedroom or wing lounge with probability `pLoungeIdle`.

Staff:
- CNA: on wing. Each slot they give care to `k` residents from their panel
  (see contacts); remainder of the slot at the wing station. Present at meals
  in dining room/lounge assisting.
- Nurse: wing station; medication rounds at configured slots = brief contact
  with each resident on the wing.
- Therapist: therapy room. Dietary: kitchen, dining rooms at meals.
  Housekeeping: rotates through wing rooms (brief presence, no close contact).
  Activities staff: activity room. Admin: office.
- Every staff member takes one 30-minute break in the break room, staggered so
  that at most `breakroomCapacity` overlap, and attends a handover slot at the
  wing station at shift start.
- Off-shift: `outside`.

Sub-slot presence: a person can be split across rooms within a slot. Represent
with a per-slot list of extra `(person, room, fraction)` visits for care
episodes; `loc` holds the main room and its fraction is `1 − Σ visit fractions`.

## 2. Disease course

States: `S → E → Ipre → (Isym | Iasym) → R`. No reinfection within a season.

- Latent, presymptomatic and infectious durations: gamma, per pathogen.
- `pSymptomatic` per role group (resident/staff).
- Infectiousness over time: `E_j(t) = q_j × profile(state) × activity(room type, role)`.
  `profile`: 1.0 in Ipre and first `peakDays` of I, then linear decay to
  `tailLevel` at end; asymptomatic multiplied by `asymRelInf`.
- `activity`: multiplier on emission by context (resting, talking, working).
- Immunity: with probability `immune.share[role]` a person has susceptibility
  `1 − immune.protection`; else 1.

Three presets (`covid`, `flu`, `rsv`) plus custom.

## 3. Transmission

### 3.1 Room air (far field)

Each room carries a concentration `C_r` (quanta/m³) between slots. For a slot
of length Δ hours:

```
S_r  = Σ_j  f_jr · E_j · (1 − maskOut_j)          (quanta/h, infectious people present)
λ_r  = ach_r·ventScale + decay + deposition + Σ_devices cadr_d / V_r     (1/h)
Css  = S_r / (V_r · λ_r)
Cbar = Css + (C0 − Css)·(1 − e^{−λΔ}) / (λΔ)       (slot-average)
Cend = Css + (C0 − Css)·e^{−λΔ}
dose_i += f_ir · p_i · s_i · (1 − maskIn_i) · Cbar · Δ
```

`p_i` = breathing rate (m³/h) by role/context. Concentration persists after
the infector leaves (matters for dining rooms between seatings).

### 3.2 Close range (near field)

Two-zone model (Nicas): within arm's length of an infector the concentration
exceeds the room average by `E_j / β`, where β (m³/h) is the airflow between
the near zone and the rest of the room. This excess does not depend on room
air cleaning, so lamps and ventilation do not reduce it.

For each close contact (i, j) of type c lasting τ hours in a slot:

```
dose_i += p_i · s_i · (1 − maskIn_i) · (1 − maskOut_j) · E_j · τ · G / β_c · (1 − nearFieldUV)
```

- `β_c`: per contact type (`care`, `table`, `break`, `therapy`, `visit`,
  `medpass`, `roommate`), from config.
- `G`: global close-range intensity multiplier — **the most influential
  assumption; exposed as the headline slider.** G = 0 turns the route off.
- `nearFieldUV`: fraction of the near-field excess removed by a lamp in that
  room; default 0 (conservative for the lamp). Config only.

Contact generators:
- `care`: CNA ↔ resident, `careEpisodesPerShift[shift]` episodes of
  `careMinutes` each, spread across the shift, in the resident's bedroom.
- `medpass`: nurse ↔ each wing resident, `medpassMinutes`, at medpass slots.
- `table`: tablemates at each meal for the meal's duration; CNA assisting.
- `therapy`: therapist ↔ resident for the session.
- `break`: staff sharing a break slot (pairs up to table size).
- `visit`: visitor → resident (emission only from visitor).
- `roommate`: optional, default weight 0 (roommates share room air already).

### 3.3 Infection and attribution

Cumulative dose `A_i`. When `A_i ≥ threshold_i`, i becomes E at the end of the
slot. Route label for the infection = `room` or `close` sampled pro rata to
that slot's two dose components using `routeU_i`; record room, slot, and the
largest-contributing source person. Staff reaching `communityDay` while still
S become E with route `community`.

### 3.4 Devices

`intervention = { lamps: { roomId: n }, cleaners: { roomId: cadr_m3h } }`.

A far-UVC lamp is modelled as an equivalent clean-air delivery rate:
`cadr_lamp = config.lamp.ecadr × config.lamp.realWorldFactor` (m³/h), so its
equivalent air changes are `n · cadr_lamp / V_r`, capped at
`config.lamp.maxEach` per room. Portable filters use the same term with their
CADR, which lets the page compare lamps against ordinary air cleaners.

## 4. Behavioural responses (`config.control`)

- `staffExclusion`: symptomatic staff with `staysHomeWhenSick` are `outside`
  from onset + delay for `exclusionDays`.
- `residentIsolation`: symptomatic residents stay in their bedroom (meals
  there) from onset + `isolationDelayDays` for `isolationDays`. Care continues.
- `outbreakMode`: triggered when ≥ `trigger` resident symptomatic onsets occur
  within 7 days; for `outbreakDays` communal dining and activities stop and
  staff wear `outbreakMask`. Toggleable.
- `staffMask`: baseline mask for staff: `none | surgical | n95`, with in/out
  efficiencies from config.

## 5. Outputs

`runSeason(world, intervention, opts)` →

```
{
  seed,
  daily: {                       // Int16Array(days) each
    newResident, newStaff, infectiousResident, infectiousStaff, importations
  },
  totals: {
    residentInfected, staffInfected, residentSymptomatic, staffSymptomatic,
    importations,                // community + visitor-seeded
    byRoute: { room, close, community },
    outbreaks,                   // count of outbreak-mode triggers
    largestCluster,              // peak resident infections in any 14-day window
  },
  byRoom: { [roomId]: { infections, doseRoom, doseClose, infectiousHours } },
  events: [ { day, slot, person, role, wing, route, roomId, source } ],
  frames?: { conc: Float32Array(days*48*nRooms) }   // only if opts.record
}
```

`world` exposes what the UI needs for playback without re-simulating:
`world.rooms`, `world.people[] {id, role, wing, homeRoom, shift}`,
`world.locationAt(person, day, slot)`.

Performance target: default config, 120 days, one arm: under 15 ms on a
laptop. Skip work when no one is infectious and no room has virus in the air.

## 6. Analysis layer (`src/analysis.js`, same portability rules)

- `compare(config, arms, { seeds, onProgress })` — runs every arm on the same
  worlds. Returns per-arm arrays of totals plus paired differences.
- `summarize(values)` — mean, median, quantiles (5, 25, 75, 95), P(zero).
- `scenarios(config)` — returns named assumption sets (`cautious`, `central`,
  `favourable` for the lamp) built from the low/central/high values in
  `params.js` for: close-range intensity G, lamp ecadr × realWorldFactor,
  emission median, ventilation scale.
- `rankRooms(config, { seeds, lampsAvailable })` — baseline runs → for each
  room the mean room-air infections acquired there and the first-order
  infections averted by the n-th lamp:
  `inf_r × (λ_r/(λ_r + (n−1)·Δ) − λ_r/(λ_r + n·Δ))`; greedy allocation of the
  budget; then full paired simulation of the top allocations to confirm.
- `simulateTrial(config, design, { trials })` — cluster trial: `design =
  { facilitiesPerArm, seasons, placement, crossover, facilityVariation }`.
  Each facility is a world with its own ventilation scale, importation hazard
  and immunity drawn from `facilityVariation`. Outcome: resident infections
  per facility-season. Test: permutation test on the difference in means
  (paired sign-flip for crossover). Returns power at α = 0.05, the
  distribution of estimated effect, and mean infections per arm.

## 7. Batch runner (`src/cli.js`, Node)

```
node src/cli.js compare  --config cfg.json --lamps placement.json --seeds 500
node src/cli.js rank     --config cfg.json --lamps-available 12 --seeds 500
node src/cli.js trial    --config cfg.json --design design.json --trials 1000
node src/cli.js sweep    --config cfg.json --lamps placement.json --param transmission.G --values 0,0.5,1,2,4
```

Outputs JSON and a CSV per command to `--out`.

## 8. Stated omissions (shown on the page)

Surface and hand transmission; air moving between rooms through corridors and
ducts; resident admissions and discharges; resident outings; severity of
illness; reinfection; ozone and indoor chemistry from the lamps; behaviour
change because lamps are present.
