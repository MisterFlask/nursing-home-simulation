// Analysis layer: paired comparisons, summaries, assumption scenarios, lamp
// placement ranking and cluster-trial power.
//
// Same portability rules as engine.js: ES module, no dependencies, no DOM, no
// Node-only APIs. Long-running functions take an onProgress(done, total)
// callback and accept a seed / trial range, so callers (e.g. a Web Worker) can
// run them in chunks and merge the pieces with the merge* helpers.
//
// Note for the web build: params.js, engine.js and analysis.js are concatenated
// into one scope, so top-level names must be unique across the three files and
// imports must not be renamed.

import { buildWorld, runSeason, roomLambdas, lampAchFor, makeRng, streamSeed, SLOTS_PER_DAY } from './engine.js';
import { PARAMS, getPath, setPath, mergeConfig, paramRange, calibrated, lampCadrAt, ANCHORED, ANCHORS, anchoredAt } from './params.js';

const STREAM_TRIAL = 101;

// ---------------------------------------------------------------------------
// Seeds: a number n means seeds 1..n; {start, count} a range; or an array.
// ---------------------------------------------------------------------------
export function seedList(seeds, defaultStart = 1) {
  if (Array.isArray(seeds)) return seeds.slice();
  if (seeds && typeof seeds === 'object') { const out = []; for (let i = 0; i < seeds.count; i++) out.push(seeds.start + i); return out; }
  const n = seeds == null ? 100 : seeds | 0;
  const out = []; for (let i = 0; i < n; i++) out.push(defaultStart + i);
  return out;
}

// ---------------------------------------------------------------------------
// summarize(values) → mean, sd, median, quantiles (5, 25, 75, 95), P(zero)
// Quantiles use linear interpolation between order statistics (R type 7).
// ---------------------------------------------------------------------------
export function quantileSorted(sorted, q) {
  if (!sorted.length) return NaN;
  const h = (sorted.length - 1) * q, lo = Math.floor(h), hi = Math.ceil(h);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
}
export function summarize(values) {
  const v = Array.from(values).filter((x) => Number.isFinite(x));
  const n = v.length;
  if (!n) return { n: 0, mean: NaN, sd: NaN, se: NaN, median: NaN, q05: NaN, q25: NaN, q75: NaN, q95: NaN, min: NaN, max: NaN, pZero: NaN };
  const s = v.slice().sort((a, b) => a - b);
  let sum = 0; for (const x of v) sum += x;
  const mean = sum / n;
  let ss = 0; for (const x of v) ss += (x - mean) * (x - mean);
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : 0;
  return {
    n, mean, sd, se: sd / Math.sqrt(n),
    median: quantileSorted(s, 0.5), q05: quantileSorted(s, 0.05), q25: quantileSorted(s, 0.25),
    q75: quantileSorted(s, 0.75), q95: quantileSorted(s, 0.95), min: s[0], max: s[n - 1],
    pZero: v.filter((x) => x === 0).length / n,
  };
}

// ---------------------------------------------------------------------------
// compare(config, arms, { seeds, onProgress, runOpts })
// Every arm runs on the same world for each seed (common random numbers).
// arms: [{ name, intervention }] or { name: intervention }. The first arm is
// the reference for paired differences.
// ---------------------------------------------------------------------------
function normArms(arms) {
  if (Array.isArray(arms)) return arms.map((a, i) => ({ name: a.name || `arm${i}`, intervention: a.intervention || a }));
  return Object.keys(arms).map((name) => ({ name, intervention: arms[name] }));
}
export function compare(config, arms, opts = {}) {
  const A = normArms(arms);
  const seeds = seedList(opts.seeds);
  const out = {
    seeds,
    arms: A.map((a) => ({ name: a.name, intervention: a.intervention, totals: [], residentInfected: [], staffInfected: [], byRoom: {} })),
  };
  let done = 0;
  for (const seed of seeds) {
    const world = buildWorld(config, seed);
    A.forEach((a, k) => {
      const r = runSeason(world, a.intervention, opts.runOpts || {});
      const o = out.arms[k];
      o.totals.push(r.totals);
      o.residentInfected.push(r.totals.residentInfected);
      o.staffInfected.push(r.totals.staffInfected);
      for (const id in r.byRoom) {
        const b = r.byRoom[id], acc = o.byRoom[id] || (o.byRoom[id] = { infections: 0, infectionsRoom: 0, infectionsClose: 0, doseRoom: 0, doseClose: 0, infectiousHours: 0 });
        acc.infections += b.infections; acc.infectionsRoom += b.infectionsRoom; acc.infectionsClose += b.infectionsClose;
        acc.doseRoom += b.doseRoom; acc.doseClose += b.doseClose; acc.infectiousHours += b.infectiousHours;
      }
    });
    done++;
    if (opts.onProgress) opts.onProgress(done, seeds.length);
  }
  return finishCompare(out);
}
// byRoom in the result holds sums; finishCompare adds per-seed means, paired
// differences and summaries.
function finishCompare(out) {
  const n = out.seeds.length;
  for (const a of out.arms) {
    a.byRoomMean = {};
    for (const id in a.byRoom) { const b = a.byRoom[id]; a.byRoomMean[id] = {}; for (const k in b) a.byRoomMean[id][k] = n ? b[k] / n : 0; }
    a.summary = { residentInfected: summarize(a.residentInfected), staffInfected: summarize(a.staffInfected) };
    a.routes = { room: 0, close: 0, community: 0 };
    for (const t of a.totals) for (const k in a.routes) a.routes[k] += t.byRoute[k];
  }
  const ref = out.arms[0];
  // Paired difference per seed: averted = reference − arm (positive = fewer infections).
  out.paired = out.arms.slice(1).map((a) => {
    const resAv = a.residentInfected.map((v, i) => ref.residentInfected[i] - v);
    const stAv = a.staffInfected.map((v, i) => ref.staffInfected[i] - v);
    const totAv = resAv.map((v, i) => v + stAv[i]);
    const refMean = ref.summary.residentInfected.mean, armMean = a.summary.residentInfected.mean;
    return {
      name: a.name, vs: ref.name,
      residentAverted: resAv, staffAverted: stAv, totalAverted: totAv,
      summary: { residentAverted: summarize(resAv), staffAverted: summarize(stAv), totalAverted: summarize(totAv) },
      relativeReduction: refMean > 0 ? 1 - armMean / refMean : NaN,
      pWorse: resAv.filter((x) => x < 0).length / Math.max(1, resAv.length),
    };
  });
  return out;
}
// Merge two compare() results computed on disjoint seed ranges.
export function mergeCompare(a, b) {
  const out = { seeds: a.seeds.concat(b.seeds), arms: a.arms.map((x, k) => {
    const y = b.arms[k];
    const byRoom = {};
    for (const src of [x.byRoom, y.byRoom]) for (const id in src) {
      const acc = byRoom[id] || (byRoom[id] = {});
      for (const f in src[id]) acc[f] = (acc[f] || 0) + src[id][f];
    }
    return { name: x.name, intervention: x.intervention, totals: x.totals.concat(y.totals), residentInfected: x.residentInfected.concat(y.residentInfected), staffInfected: x.staffInfected.concat(y.staffInfected), byRoom };
  }) };
  return finishCompare(out);
}

// ---------------------------------------------------------------------------
// scenarios(config): assumption sets that matter for the lamp, all with
// (approximately) the same no-lamp attack rate.
//   cautious   : unreachable share at its high end (0.86); lamp susceptibility,
//                path factor, real-world factor and caps at their low ends
//   central    : the config as given
//   favourable : unreachable share at its low end (0.24); lamp values at high
// The share is changed through the calibration table: G, emission.median and
// the outside-infection rates move together so the no-lamp attack rate stays
// on target. If the user has moved any of these away from the calibrated
// values at the config's own share, the same ratio is carried into the other
// scenarios; lamp values are scaled by low/central or high/central of their
// researched range, so a user edit to the lamp carries through too.
// The cautious lamp is the far_uvc.md low row (k 2.6, path 2.0 m, η 0.5) with
// the output set by the maker's mounting rule for each room's height:
// 0.36 × 2.6 × 100 mW × 0.6 × 2.0 m × 0.5 ≈ 56 m³/h in a 2.4 m room, ≈ 36
// m³/h in a 2.3 m room (the research row's 40 mW, ≈ 37 m³/h).
// ---------------------------------------------------------------------------
export const SCENARIO_DEFS = {
  cautious: { closeShare: 'high', lamp: 'low' },
  favourable: { closeShare: 'low', lamp: 'high' },
};
// Lamp quantities moved together by the scenarios (each scaled by low/central
// or high/central of its researched range).
export const SCENARIO_LAMP_PATHS = ['lamp.susceptibility', 'lamp.realWorldFactor', 'lamp.pathFactor', 'lamp.bedroomShare'];
export function scenarios(config) {
  const pathogen = config.pathogen || 'covid';
  const shareMeta = paramRange(PARAMS.find((p) => p.path === 'transmission.closeShare'), pathogen);
  // User-edit ratios are measured against the calibrated values at the
  // config's own share, so moving the share slider alone is not an edit.
  const cur = config.transmission.closeShare != null ? config.transmission.closeShare : shareMeta.central;
  const base = calibrated(pathogen, cur);
  const rG = base.G > 0 ? config.transmission.G / base.G : 1;
  const rE = base.emissionMedian > 0 ? config.emission.median / base.emissionMedian : 1;
  const make = (name) => {
    const def = SCENARIO_DEFS[name];
    const c = mergeConfig(config, {});
    const share = shareMeta[def.closeShare];
    const cal = calibrated(pathogen, share);
    c.transmission.G = cal.G * rG;
    c.emission.median = cal.emissionMedian * rE;
    c.transmission.closeShare = share;
    for (const [k, path] of [['staffDailyHazard', 'importation.staffDailyHazard'], ['visitorInfectiousProb', 'importation.visitorInfectiousProb']]) {
      if (cal[k] == null || base[k] == null) continue;
      setPath(c, path, cal[k] * (getPath(config, path) / base[k]));
    }
    for (const path of SCENARIO_LAMP_PATHS) {
      const meta = PARAMS.find((p) => p.path === path);
      if (!meta || getPath(config, path) == null) continue;
      const rg = paramRange(meta, pathogen);
      setPath(c, path, rg.central > 0 ? getPath(config, path) * rg[def.lamp] / rg.central : rg[def.lamp]);
    }
    if (c.lamp.susceptibility != null) c.lamp.ecadr = lampCadrAt(c.lamp, 2.4);
    c.scenario = name;
    return c;
  };
  return { cautious: make('cautious'), central: mergeConfig(config, { scenario: 'central' }), favourable: make('favourable') };
}

// Scenarios for the anchored fit. Cautious: the largest out-of-reach share the
// fit allows, with the low end of the lamp-side evidence. Favourable: the
// smallest share, with the high end. Central: the config as given. reportShare
// gives, for each, the share of resident infections taken to be reported.
export function anchoredScenarios(config) {
  const pathogen = ANCHORS[config.pathogen] ? config.pathogen : 'covid', A = ANCHORS[pathogen];
  const cur = config.transmission.closeShare != null ? config.transmission.closeShare : A.shares.central;
  // Ratios to the fitted values at the config's own share, so a slider the user has moved carries over to each scenario.
  const here = anchoredAt(cur, pathogen), rG = here.G > 0 ? config.transmission.G / here.G : 1, rE = here.emissionMedian > 0 ? config.emission.median / here.emissionMedian : 1;
  const make = (name, share, end) => {
    const c = mergeConfig(config, {}), at = anchoredAt(share, pathogen);
    c.transmission.closeShare = share; c.transmission.G = at.G * rG; c.emission.median = at.emissionMedian * rE;
    for (const path of SCENARIO_LAMP_PATHS) {
      const meta = PARAMS.find((p) => p.path === path);
      if (!meta || getPath(config, path) == null) continue;
      const rg = paramRange(meta, pathogen);
      setPath(c, path, rg.central > 0 ? getPath(config, path) * rg[end] / rg.central : rg[end]);
    }
    if (c.lamp.susceptibility != null) c.lamp.ecadr = lampCadrAt(c.lamp, 2.4);
    c.scenario = name;
    return c;
  };
  return { cautious: make('cautious', A.shares.high, 'low'), central: mergeConfig(config, { scenario: 'central' }), favourable: make('favourable', A.shares.low, 'high'),
    reportShare: { cautious: anchoredAt(A.shares.high, pathogen).reportShare, central: here.reportShare, favourable: anchoredAt(A.shares.low, pathogen).reportShare } };
}

// ---------------------------------------------------------------------------
// rankRooms(config, { seeds, lampsAvailable, onProgress, confirm, confirmSeeds })
// 1. Baseline runs (no lamps): mean room-air infections acquired in each room.
// 2. First-order infections averted by the n-th lamp in room r:
//      inf_r × ( λ_r/(λ_r + A(n−1)) − λ_r/(λ_r + A(n)) ),
//    A(n) = air changes added by n lamps (engine.lampAchFor: capped, then ×
//    realWorldFactor). With no cap this is the spec's
//    inf_r × (λ/(λ+(n−1)Δ) − λ/(λ+nΔ)). It assumes room-air
//    infections in r scale with the steady-state concentration ∝ 1/λ_r and
//    ignores onward chains (the confirmation step captures those). Like
//    byRoom, it counts residents and staff together; compare it with the
//    simulated totalAverted, not residentAverted.
// 3. Greedy allocation of the budget.
// 4. Paired simulation of the greedy allocation at the full budget and at
//    half and a quarter of it, on fresh seeds (to avoid selection bias).
// ---------------------------------------------------------------------------
export function baselineRoomStats(config, opts = {}) {
  const seeds = seedList(opts.seeds);
  const acc = { n: 0, residentInfected: 0, rooms: {} };
  let done = 0;
  for (const seed of seeds) {
    const world = buildWorld(config, seed);
    const r = runSeason(world, {}, opts.runOpts || {});
    acc.n++; acc.residentInfected += r.totals.residentInfected;
    for (const id in r.byRoom) {
      const b = r.byRoom[id], a = acc.rooms[id] || (acc.rooms[id] = { infections: 0, infectionsRoom: 0, infectionsClose: 0, doseRoom: 0, doseClose: 0 });
      a.infections += b.infections; a.infectionsRoom += b.infectionsRoom; a.infectionsClose += b.infectionsClose; a.doseRoom += b.doseRoom; a.doseClose += b.doseClose;
    }
    done++;
    if (opts.onProgress) opts.onProgress(done, seeds.length);
  }
  return acc;
}
export function mergeBaselineRoomStats(a, b) {
  const out = { n: a.n + b.n, residentInfected: a.residentInfected + b.residentInfected, rooms: {} };
  for (const src of [a.rooms, b.rooms]) for (const id in src) { const o = out.rooms[id] || (out.rooms[id] = {}); for (const f in src[id]) o[f] = (o[f] || 0) + src[id][f]; }
  return out;
}
export function allocateLamps(config, stats, lampsAvailable) {
  const world = buildWorld(mergeConfig(config, { days: 1 }), 1); // rooms and λ only
  const { lambda } = roomLambdas(world, {});
  const rooms = world.rooms.map((room, r) => {
    const s = stats.rooms[room.id] || { infections: 0, infectionsRoom: 0, infectionsClose: 0 };
    const n = Math.max(1, stats.n);
    return { roomId: room.id, type: room.type, wing: room.wing, volume: room.volume, height: room.height, room, lambda: lambda[r], deltaPerLamp: lampAchFor(config, room, 1),
      infectionsRoom: s.infectionsRoom / n, infectionsClose: s.infectionsClose / n, infections: s.infections / n, lamps: 0 };
  }).filter((x) => x.type !== 'outside' && x.volume > 0);
  const A = (x, n) => lampAchFor(config, x.room, n); // added air changes from n lamps (same function as the engine)
  const gain = (x) => { const n = x.lamps + 1; return x.infectionsRoom * (x.lambda / (x.lambda + A(x, n - 1)) - x.lambda / (x.lambda + A(x, n))); };
  for (const x of rooms) x.firstLampAverted = gain(x);
  const steps = [];
  let cum = 0;
  for (let k = 0; k < lampsAvailable; k++) {
    let best = null, bg = 0;
    for (const x of rooms) { const gx = gain(x); if (gx > bg) { bg = gx; best = x; } }
    if (!best) break;
    best.lamps++; cum += bg;
    steps.push({ n: k + 1, roomId: best.roomId, gain: bg, cumulative: cum });
  }
  const allocation = {};
  for (const x of rooms) if (x.lamps > 0) allocation[x.roomId] = x.lamps;
  rooms.sort((a, b) => b.infectionsRoom - a.infectionsRoom);
  for (const x of rooms) delete x.room;
  return { rooms, steps, allocation, predictedAverted: cum };
}
const allocationFromSteps = (steps, n) => { const a = {}; for (const s of steps.slice(0, n)) a[s.roomId] = (a[s.roomId] || 0) + 1; return a; };
export function rankRooms(config, opts = {}) {
  const lampsAvailable = opts.lampsAvailable == null ? 12 : opts.lampsAvailable;
  const seeds = seedList(opts.seeds);
  const confirm = opts.confirm !== false;
  const total = seeds.length + (confirm ? seedList(opts.confirmSeeds || seeds.length).length : 0);
  const stats = baselineRoomStats(config, { seeds, runOpts: opts.runOpts, onProgress: opts.onProgress && ((d) => opts.onProgress(d, total)) });
  const res = allocateLamps(config, stats, lampsAvailable);
  res.baselineMeanResidentInfected = stats.residentInfected / Math.max(1, stats.n);
  res.seeds = seeds.length;
  if (confirm && res.steps.length) {
    // Fresh seeds, after the ranking seeds.
    const maxSeed = Math.max(...seeds);
    const cs = Array.isArray(opts.confirmSeeds) ? opts.confirmSeeds : seedList(opts.confirmSeeds || seeds.length, maxSeed + 1);
    const budgets = [...new Set([res.steps.length, Math.ceil(res.steps.length / 2), Math.ceil(res.steps.length / 4)])].filter((b) => b > 0);
    const arms = [{ name: 'none', intervention: {} }].concat(budgets.map((b) => ({ name: `greedy-${b}`, intervention: { lamps: allocationFromSteps(res.steps, b) } })));
    const cmp = compare(config, arms, { seeds: cs, runOpts: opts.runOpts, onProgress: opts.onProgress && ((d) => opts.onProgress(seeds.length + d, total)) });
    res.confirm = {
      seeds: cs.length,
      none: cmp.arms[0].summary.residentInfected,
      allocations: cmp.paired.map((p, i) => ({
        name: p.name, lamps: budgets[i], allocation: arms[i + 1].intervention.lamps,
        predictedAverted: res.steps[budgets[i] - 1].cumulative,
        residentAverted: p.summary.residentAverted, staffAverted: p.summary.staffAverted, totalAverted: p.summary.totalAverted, relativeReduction: p.relativeReduction,
      })),
    };
  }
  return res;
}

// ---------------------------------------------------------------------------
// simulateTrial(config, design, { trials, trialStart, onProgress, permutations, alpha, seed })
// design = { facilitiesPerArm, seasons, placement, crossover, facilityVariation }
//   placement: intervention for the lamp arm ({ lamps: {...} } or a plain lamps map)
//   facilityVariation: { ventilationGsd, importationGsd, immunitySd } — each
//     facility draws its own ventilation scale and importation hazards
//     (lognormal around the config value) and immune shares (normal, clamped).
// Parallel: 2F facilities, F with lamps; outcome = mean resident infections per
//   facility-season; permutation test on the difference in arm means.
// Crossover: 2F facilities, each observed for `seasons` seasons in each
//   condition (separate seasons, so no shared randomness); outcome per facility
//   = control mean − lamp mean; sign-flip permutation test.
// No common random numbers between arms here: a real trial cannot have them.
// ---------------------------------------------------------------------------
function facilityConfig(config, fv, rng) {
  const ln = (gsd) => Math.log(Math.max(1, gsd || 1));
  const z1 = normal01(rng), z2 = normal01(rng), z3 = normal01(rng);
  const c = mergeConfig(config, {});
  c.ventilation.scale = config.ventilation.scale * Math.exp(ln(fv.ventilationGsd) * z1);
  const imp = Math.exp(ln(fv.importationGsd) * z2);
  c.importation.staffDailyHazard = Math.min(1, config.importation.staffDailyHazard * imp);
  c.importation.visitorInfectiousProb = Math.min(1, config.importation.visitorInfectiousProb * imp);
  // Immunity: shift the protection of residents and staff by sd × z (clamped).
  const sd = fv.immunitySd || 0;
  const cl = (x) => Math.min(0.95, Math.max(0, x));
  c.immune.protection = cl(config.immune.protection + sd * z3);
  if (config.immune.protectionStaff != null) c.immune.protectionStaff = cl(config.immune.protectionStaff + sd * z3);
  return c;
}
function normal01(rng) { const u1 = 1 - rng(), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
function permutationP(stat, valsA, valsB, nPerm, rng) {
  // Two-sided p-value for difference in means (A − B), label permutation.
  const all = valsA.concat(valsB), nA = valsA.length, n = all.length;
  let total = 0; for (const v of all) total += v;
  let extreme = 0;
  const idx = all.map((_, i) => i);
  for (let k = 0; k < nPerm; k++) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    let sA = 0; for (let i = 0; i < nA; i++) sA += all[idx[i]];
    const st = sA / nA - (total - sA) / (n - nA);
    if (Math.abs(st) >= Math.abs(stat) - 1e-12) extreme++;
  }
  return (extreme + 1) / (nPerm + 1);
}
function signFlipP(diffs, nPerm, rng) {
  const n = diffs.length; let obs = 0; for (const d of diffs) obs += d; obs /= n;
  let extreme = 0;
  for (let k = 0; k < nPerm; k++) {
    let s = 0; for (const d of diffs) s += rng() < 0.5 ? -d : d;
    if (Math.abs(s / n) >= Math.abs(obs) - 1e-12) extreme++;
  }
  return (extreme + 1) / (nPerm + 1);
}
export function simulateTrial(config, design, opts = {}) {
  const F = design.facilitiesPerArm | 0, seasons = Math.max(1, design.seasons | 0 || 1);
  const fv = design.facilityVariation || {};
  const placement = design.placement && design.placement.lamps ? design.placement : { lamps: design.placement || {} };
  const trials = opts.trials == null ? 100 : opts.trials;
  const t0 = opts.trialStart || 0;
  const nPerm = opts.permutations || 999, alpha = opts.alpha || 0.05;
  const baseSeed = opts.seed == null ? 12345 : opts.seed;
  const out = { design, alpha, permutations: nPerm, trialStart: t0, trials: [], };
  for (let t = t0; t < t0 + trials; t++) {
    const rng = makeRng(streamSeed(baseSeed, STREAM_TRIAL, t));
    const facilities = [];
    for (let f = 0; f < 2 * F; f++) facilities.push(facilityConfig(config, fv, rng));
    const season = (cfg, iv) => {
      const seed = Math.floor(rng() * 4294967296) >>> 0;
      return runSeason(buildWorld(cfg, seed), iv).totals.residentInfected;
    };
    let estimate, p, meanControl, meanTreated;
    if (!design.crossover) {
      const ctrl = [], trt = [];
      facilities.forEach((cfg, f) => {
        let s = 0; for (let k = 0; k < seasons; k++) s += season(cfg, f < F ? placement : {});
        (f < F ? trt : ctrl).push(s / seasons);
      });
      meanControl = ctrl.reduce((a, b) => a + b, 0) / F; meanTreated = trt.reduce((a, b) => a + b, 0) / F;
      estimate = meanControl - meanTreated;
      p = permutationP(estimate, ctrl, trt, nPerm, rng);
    } else {
      const diffs = []; let sc = 0, st = 0;
      for (const cfg of facilities) {
        let c = 0, l = 0;
        for (let k = 0; k < seasons; k++) { c += season(cfg, {}); l += season(cfg, placement); }
        diffs.push((c - l) / seasons); sc += c / seasons; st += l / seasons;
      }
      meanControl = sc / facilities.length; meanTreated = st / facilities.length;
      estimate = meanControl - meanTreated;
      p = signFlipP(diffs, nPerm, rng);
    }
    out.trials.push({ trial: t, estimate, relative: meanControl > 0 ? estimate / meanControl : NaN, p, meanControl, meanTreated });
    if (opts.onProgress) opts.onProgress(t - t0 + 1, trials);
  }
  return finishTrial(out);
}
function finishTrial(out) {
  const tr = out.trials.filter((x) => Number.isFinite(x.estimate) || x.p === 1);
  out.n = tr.length;
  out.power = tr.filter((x) => x.p < out.alpha).length / Math.max(1, tr.length);
  out.effect = summarize(tr.map((x) => x.estimate));
  out.relativeEffect = summarize(tr.map((x) => x.relative));
  out.meanControl = tr.reduce((a, x) => a + x.meanControl, 0) / Math.max(1, tr.length);
  out.meanTreated = tr.reduce((a, x) => a + x.meanTreated, 0) / Math.max(1, tr.length);
  return out;
}
// Pool-based power (much cheaper for large designs): simulate poolSize
// facilities once, each with its own facility variation and two independent
// seasons per condition (control and lamps; different seeds, no shared
// randomness), then build trials by resampling facilities from the pool with
// replacement. Each trial: parallel = 2F facilities, F per arm, one season
// each (seasons > 1: mean of that many seasons per facility); crossover =
// 2F facilities each contributing a control season and a lamp season.
export function facilityPool(config, design, opts = {}) {
  const fv = design.facilityVariation || {};
  const placement = design.placement && design.placement.lamps ? design.placement : { lamps: design.placement || {} };
  const M = opts.poolSize || 1000, S = Math.max(1, opts.seasonsPerFacility || 2);
  const baseSeed = opts.seed == null ? 777 : opts.seed;
  const ctrl = [], lamp = [], ctrlOB = [], lampOB = [];
  // opts.paired: also run the lamps on the same seed (same world, same
  // random numbers) as each home's first control season, giving a
  // common-random-numbers estimate of the lamp effect for that home.
  const pairLamp = [], pairLampOB = [];
  let lastWorld = null;
  // Per season also the resident outbreak sizes (surveillance-style outbreaks).
  const season = (cfg, seed, iv, obList, reuse) => { const w = buildWorld(cfg, seed, { reuse }); lastWorld = w; const r = runSeason(w, iv); obList.push(segmentOutbreaks(w, r, { include: 'all' }).map((o) => o.residents)); return r.totals.residentInfected; };
  for (let f = 0; f < M; f++) {
    const rng = makeRng(streamSeed(baseSeed, STREAM_TRIAL + 1, f));
    const cfg = facilityConfig(config, fv, rng);
    const c = [], l = [], co = [], lo = [];
    let firstSeed = null, firstWorld = null;
    for (let k = 0; k < S; k++) {
      const sc = Math.floor(rng() * 4294967296) >>> 0;
      c.push(season(cfg, sc, {}, co));
      if (k === 0) { firstSeed = sc; firstWorld = lastWorld; }
      l.push(season(cfg, Math.floor(rng() * 4294967296) >>> 0, placement, lo));
    }
    ctrl.push(c); lamp.push(l); ctrlOB.push(co); lampOB.push(lo);
    if (opts.paired) { const po = []; pairLamp.push(season(cfg, firstSeed, placement, po, firstWorld)); pairLampOB.push(po[0]); }
    if (opts.onProgress) opts.onProgress(f + 1, M);
  }
  const out = { size: M, seasonsPerFacility: S, ctrl, lamp, ctrlOB, lampOB };
  if (opts.paired) { out.pairLamp = pairLamp; out.pairLampOB = pairLampOB; }
  return out;
}
export function powerFromPool(pool, design, opts = {}) {
  const F = design.facilitiesPerArm | 0, seasons = Math.max(1, design.seasons | 0 || 1);
  const trials = opts.trials || 400, nPerm = opts.permutations || 999, alpha = opts.alpha || 0.05;
  const rng = makeRng(streamSeed(opts.seed == null ? 4242 : opts.seed, STREAM_TRIAL + 2, (design.facilities || F) * 10 + (design.crossover ? 1 : 0)));
  const pick = () => Math.floor(rng() * pool.size);
  // Outcome per facility over the given seasons of one condition:
  //   'infections'   : mean resident infections per season (default)
  //   'outbreakSize' : mean residents infected per detected outbreak (NaN if no outbreak)
  const alt = opts.outcome === 'outbreakSize';
  const val = (arr, obs, f, n) => {
    if (!alt) { let x = 0; for (let k = 0; k < n; k++) x += arr[f][k % pool.seasonsPerFacility]; return x / n; }
    let x = 0, c = 0; for (let k = 0; k < n; k++) for (const v of obs[f][k % pool.seasonsPerFacility]) { x += v; c++; }
    return c ? x / c : NaN;
  };
  const out = { design: { ...design, placement: undefined }, alpha, permutations: nPerm, trialStart: 0, trials: [], poolSize: pool.size };
  for (let t = 0; t < trials; t++) {
    let estimate, p, meanControl, meanTreated;
    if (!design.crossover) {
      // Each facility contributes `seasons` seasons of one condition.
      const ctrl = [], trt = [];
      for (let f = 0; f < F; f++) {
        const vc = val(pool.ctrl, pool.ctrlOB, pick(), seasons), vt = val(pool.lamp, pool.lampOB, pick(), seasons);
        if (Number.isFinite(vc)) ctrl.push(vc);
        if (Number.isFinite(vt)) trt.push(vt);
      }
      if (ctrl.length < 2 || trt.length < 2) { out.trials.push({ trial: t, estimate: NaN, relative: NaN, p: 1, meanControl: NaN, meanTreated: NaN, n: ctrl.length + trt.length }); continue; }
      meanControl = ctrl.reduce((x, y) => x + y, 0) / ctrl.length; meanTreated = trt.reduce((x, y) => x + y, 0) / trt.length;
      estimate = meanControl - meanTreated;
      p = permutationP(estimate, ctrl, trt, nPerm, rng);
    } else {
      // 2F facilities; over `seasons` seasons each spends half in each condition.
      const diffs = []; let sc = 0, st = 0;
      const per = Math.max(1, Math.floor(seasons / 2));
      const nFac = design.facilities || 2 * F; // crossover: total facilities, each in both conditions
      let used = 0;
      for (let f = 0; f < nFac; f++) {
        const a = pick();
        const c = val(pool.ctrl, pool.ctrlOB, a, per), l = val(pool.lamp, pool.lampOB, a, per);
        if (!Number.isFinite(c) || !Number.isFinite(l)) continue; // needs an outbreak in both periods
        diffs.push(c - l); sc += c; st += l; used++;
      }
      if (used < 2) { out.trials.push({ trial: t, estimate: NaN, relative: NaN, p: 1, meanControl: NaN, meanTreated: NaN, n: used }); continue; }
      meanControl = sc / used; meanTreated = st / used;
      estimate = meanControl - meanTreated;
      p = signFlipP(diffs, nPerm, rng);
    }
    out.trials.push({ trial: t, estimate, relative: meanControl > 0 ? estimate / meanControl : NaN, p, meanControl, meanTreated });
  }
  return finishTrial(out);
}
export function mergeTrial(a, b) {
  return finishTrial({ design: a.design, alpha: a.alpha, permutations: a.permutations, trialStart: Math.min(a.trialStart, b.trialStart), trials: a.trials.concat(b.trials) });
}

// Convenience: seasons-per-day helper for consumers that only import analysis.
export const ANALYSIS_SLOTS_PER_DAY = SLOTS_PER_DAY;

// ---------------------------------------------------------------------------
// Calibration (see NOTES.md)
// ---------------------------------------------------------------------------
// Targets for the no-lamp baseline, from research/transmission.md §9.
//   covid: NHSN surveillance incidence 109.3 infections per 10,000
//          resident-weeks (Franklin et al. 2024, MMWR 73:339), i.e. a mean
//          season attack rate of 0.010930 × (days / 7) over all resident
//          infections. Least biased observable available: facility-wide
//          surveillance, not conditioned on an outbreak being reported.
//   flu:   median resident attack rate in reported outbreaks 0.33 (Lansbury
//          et al. 2017, 49 outbreaks). No surveillance incidence for
//          nursing-home residents was found, so the model is compared on the
//          same footing: single introductions that become a "reported
//          outbreak" (≥ 2 symptomatic resident cases within 72 h, the CDC
//          influenza definition), attack rate counted as symptomatic resident
//          cases (how outbreak reports count cases), median over outbreaks.
//   rsv:   as flu, median 0.24 (Osei-Yeboah et al. 2024, 7 studies).
export const CALIBRATION_TARGETS = {
  covid: { kind: 'season', value: 0.010930, perWeek: true, source: 'Franklin et al. 2024, MMWR 73:339 (NHSN, Oct 2023-Feb 2024): 109.3 per 10,000 resident-weeks' },
  flu: { kind: 'outbreak', value: 0.33, source: 'Lansbury, Brown & Nguyen-Van-Tam 2017, Influenza Other Respir Viruses: median resident attack rate 33% (4-94%), 49 outbreaks' },
  rsv: { kind: 'outbreak', value: 0.24, source: 'Osei-Yeboah et al. 2024, Influenza Other Respir Viruses 18:e70008: median resident attack rate 24% (6.7-47.6%)' },
};
const OUTBREAK_MIN_CASES = 2, OUTBREAK_WINDOW_SLOTS = 3 * SLOTS_PER_DAY;

// Season runs (normal importation): mean attack rates and close-range share.
// Outbreak runs (one staff introduction on day 5, no other importation):
// share that become reported outbreaks, median attack rates among those,
// duration, close-range share. worldCache: Map seed → world (structure reuse).
export function calibrationMetrics(config, opts = {}) {
  const cache = opts.worldCache || new Map();
  const getWorld = (cfg, seed) => { const w = buildWorld(cfg, seed, { reuse: cache.get(seed) }); cache.set(seed, w); return w; };
  const out = {};
  const nRes = config.facility.wings * config.facility.residentsPerWing;
  if (opts.seasonSeeds) {
    let res = 0, sym = 0, staff = 0, nStaff = 0, close = 0, room = 0, n = 0, imports = 0;
    const obs = [];
    for (const seed of seedList(opts.seasonSeeds)) {
      const w = getWorld(config, seed);
      const r = runSeason(w, {});
      res += r.totals.residentInfected; sym += r.totals.residentSymptomatic; staff += r.totals.staffInfected; nStaff += w.N - w.nResidents;
      imports += r.totals.importations;
      for (const o of segmentOutbreaks(w, r, { include: 'all' })) obs.push({ ar: o.residentAR, dur: o.durationDays, staffAR: o.staff / (w.N - w.nResidents) });
      close += r.totals.byRoute.close; room += r.totals.byRoute.room; n++;
    }
    out.season = { n, attackRate: res / (n * nRes), symptomaticAttackRate: sym / (n * nRes), staffAttackRate: staff / nStaff, closeShare: close / Math.max(1, close + room),
      incidencePer10kResidentWeeks: 1e4 * res / (n * nRes * config.days / 7) };
    if (obs.length || imports) {
      const sA = summarize(obs.map((o) => o.ar)), sD = summarize(obs.map((o) => o.dur)), sS = summarize(obs.map((o) => o.staffAR));
      Object.assign(out.season, { outbreaksPerSeason: obs.length / n, introductionsPerSeason: imports / n, outbreaksPerIntroduction: obs.length / Math.max(1, imports),
        outbreakMedianAR: sA.median, outbreakQ25AR: sA.q25, outbreakQ75AR: sA.q75, outbreakMedianDurationDays: sD.median, outbreakMeanDurationDays: sD.mean,
        outbreakShareOver42Days: obs.filter((o) => o.dur > 42).length / Math.max(1, obs.length), outbreakMedianStaffAR: sS.median });
    }
  }
  if (opts.outbreakSeeds) {
    const cfg1 = mergeConfig(config, { importation: { staffDailyHazard: 0, visitorInfectiousProb: 0 } });
    const ars = [], arsAll = [], durations = [], staffARs = [];
    let close = 0, room = 0, n = 0;
    for (const seed of seedList(opts.outbreakSeeds, 100001)) {
      const w = getWorld(cfg1, seed);
      const staffIdx = [];
      for (let p = 0; p < w.N; p++) if (w.isStaff[p]) staffIdx.push(p);
      const index = staffIdx[(Math.imul(seed, 2654435761) >>> 0) % staffIdx.length];
      const r = runSeason(w, {}, { introductions: [{ person: index, day: 5 }] });
      n++;
      close += r.totals.byRoute.close; room += r.totals.byRoute.room;
      // Symptom onset slots of infected residents.
      const onsets = [];
      let first = Infinity, last = -Infinity;
      for (const e of r.events) {
        if (w.isStaff[e.person]) continue;
        const g = e.day * SLOTS_PER_DAY + e.slot + 1;
        first = Math.min(first, g); last = Math.max(last, g);
        if (w.traits.symptomatic[e.person]) onsets.push(g + w.traits.latent[e.person] + w.traits.presym[e.person]);
      }
      onsets.sort((a, b) => a - b);
      let reported = false;
      for (let i = 0; i + OUTBREAK_MIN_CASES - 1 < onsets.length; i++) if (onsets[i + OUTBREAK_MIN_CASES - 1] - onsets[i] <= OUTBREAK_WINDOW_SLOTS) { reported = true; break; }
      if (!reported) continue;
      ars.push(r.totals.residentSymptomatic / nRes); arsAll.push(r.totals.residentInfected / nRes);
      staffARs.push((r.totals.staffInfected - 1) / (w.N - w.nResidents));
      durations.push((last - first) / SLOTS_PER_DAY);
    }
    const sAR = summarize(ars), sAll = summarize(arsAll);
    out.outbreak = { n, outbreaks: ars.length, pOutbreak: ars.length / Math.max(1, n),
      medianAR: sAR.median, q25AR: sAR.q25, q75AR: sAR.q75, medianARAll: sAll.median, meanARAll: sAll.mean,
      medianStaffAR: summarize(staffARs).median, medianDurationDays: summarize(durations).median, meanDurationDays: summarize(durations).mean,
      closeShare: close / Math.max(1, close + room) };
  }
  return out;
}

// Observable used for the fit: { value, share } for a config.
function fitObservable(pathogen, config, opts) {
  const tgt = CALIBRATION_TARGETS[pathogen];
  if (tgt.kind === 'season') {
    const m = calibrationMetrics(config, { seasonSeeds: opts.seasonSeeds, worldCache: opts.worldCache });
    return { value: m.season.attackRate, share: m.season.closeShare, metrics: m };
  }
  const m = calibrationMetrics(config, { outbreakSeeds: opts.outbreakSeeds, worldCache: opts.worldCache });
  return { value: m.outbreak.medianAR, share: m.outbreak.closeShare, metrics: m };
}
export function calibrationTargetValue(pathogen, config) {
  const t = CALIBRATION_TARGETS[pathogen];
  return t.perWeek ? t.value * config.days / 7 : t.value;
}

// Find (G, emission.median) for each close-range share. Alternates:
// (1) emission so the attack-rate observable hits the target at the current G
//     (bisection on log emission; the observable rises with emission),
// (2) G so the close-range share hits s at that emission (bisection on log G).
// Common random numbers (the same seeds every evaluation) keep the
// observables smooth in the parameters.
export function calibrate(pathogen, opts = {}) {
  const shares = opts.shares || [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const base = opts.config || (opts.baseConfig ? opts.baseConfig : null);
  if (!base) throw new Error('calibrate: opts.config (the default config for the pathogen) is required');
  const target = calibrationTargetValue(pathogen, base);
  const fitOpts = { seasonSeeds: opts.seasonSeeds || 200, outbreakSeeds: opts.outbreakSeeds || 400, worldCache: opts.worldCache || new Map() };
  const log = opts.log || (() => {});
  let evals = 0;
  const evalAt = (G, e) => {
    const c = mergeConfig(base, { transmission: { G }, emission: { median: e } });
    evals++;
    return fitObservable(pathogen, c, fitOpts);
  };
  const tolV = opts.tolValue || 0.03, tolS = opts.tolShare || 0.01;
  // Bisection in log space for a monotone increasing function f(x) toward y.
  const solveLog = (f, y, x0, relTol, maxIt = 14) => {
    let lo = x0, hi = x0, flo = f(lo), fhi = flo;
    let k = 0;
    if (flo.v < y) { while (fhi.v < y && k++ < 12) { lo = hi; flo = fhi; hi *= 2.5; fhi = f(hi); } }
    else { while (flo.v > y && k++ < 12) { hi = lo; fhi = flo; lo /= 2.5; flo = f(lo); } }
    let best = Math.abs(flo.v - y) < Math.abs(fhi.v - y) ? { x: lo, r: flo } : { x: hi, r: fhi };
    for (let it = 0; it < maxIt; it++) {
      if (Math.abs(best.r.v - y) <= relTol * Math.max(Math.abs(y), 1e-9)) break;
      const mid = Math.sqrt(lo * hi), fm = f(mid);
      if (Math.abs(fm.v - y) < Math.abs(best.r.v - y)) best = { x: mid, r: fm };
      if (fm.v < y) lo = mid; else hi = mid;
      if (hi / lo < 1.002) break;
    }
    return best;
  };
  const rows = [];
  let G = opts.G0 || 1, e = opts.e0 || base.emission.median;
  for (const s of shares) {
    let last = null;
    for (let round = 0; round < (opts.rounds || 4); round++) {
      const be = solveLog((x) => { const o = evalAt(G, x); return { v: o.value, o }; }, target, e, tolV);
      e = be.x; last = be.r.o;
      log(`  ${pathogen} share ${s}: round ${round} G=${G.toPrecision(4)} e=${e.toPrecision(4)} value=${last.value.toFixed(4)} share=${last.share.toFixed(3)}`);
      if (Math.abs(last.share - s) <= tolS) break;
      const bg = solveLog((x) => { const o = evalAt(x, e); return { v: o.share, o }; }, s, G, tolS / Math.max(s, 0.05), 10);
      G = bg.x; last = bg.r.o;
      if (Math.abs(last.share - s) <= tolS && Math.abs(last.value - target) <= tolV * target) break;
    }
    if (opts.skipFinal) { rows.push({ closeShare: s, G: +G.toPrecision(5), emissionMedian: +e.toPrecision(5), achieved: { fitted: last.value, closeShare: last.share } }); continue; }
    // Final check with full metrics (season and outbreak) at the solution.
    const c = mergeConfig(base, { transmission: { G }, emission: { median: e } });
    // (Only the fitted kind's worlds are cached, to bound memory.)
    const isSeason = CALIBRATION_TARGETS[pathogen].kind === 'season';
    const m = Object.assign(
      calibrationMetrics(c, { seasonSeeds: fitOpts.seasonSeeds, worldCache: isSeason ? fitOpts.worldCache : undefined }),
      calibrationMetrics(c, { outbreakSeeds: fitOpts.outbreakSeeds, worldCache: isSeason ? undefined : fitOpts.worldCache }));
    const achieved = { target, fitted: last.value, closeShare: last.share };
    if (m.season) Object.assign(achieved, { seasonAttackRate: m.season.attackRate, seasonSymptomaticAttackRate: m.season.symptomaticAttackRate, seasonStaffAttackRate: m.season.staffAttackRate, incidencePer10kResidentWeeks: m.season.incidencePer10kResidentWeeks, seasonCloseShare: m.season.closeShare });
    if (m.outbreak) Object.assign(achieved, { pOutbreak: m.outbreak.pOutbreak, outbreaks: m.outbreak.outbreaks, outbreakMedianAR: m.outbreak.medianAR, outbreakIQR: [m.outbreak.q25AR, m.outbreak.q75AR], outbreakMedianARAll: m.outbreak.medianARAll, outbreakMedianStaffAR: m.outbreak.medianStaffAR, outbreakMedianDurationDays: m.outbreak.medianDurationDays, outbreakCloseShare: m.outbreak.closeShare });
    for (const k in achieved) if (typeof achieved[k] === 'number') achieved[k] = +achieved[k].toPrecision(4);
    rows.push({ closeShare: s, G: +G.toPrecision(5), emissionMedian: +e.toPrecision(5), achieved });
    log(`${pathogen} share ${s}: G=${G.toPrecision(4)} emission=${e.toPrecision(4)} ${JSON.stringify(achieved)} (${evals} evaluations so far)`);
    if (opts.onProgress) opts.onProgress(rows.length, shares.length);
  }
  return { pathogen, target, targetSource: CALIBRATION_TARGETS[pathogen].source, seasonSeeds: fitOpts.seasonSeeds, outbreakSeeds: fitOpts.outbreakSeeds, evaluations: evals, rows };
}

// ---------------------------------------------------------------------------
// Facility outbreaks as surveillance sees them (used for calibration targets
// and the alternative trial outcome). Within one season run, case dates are
// grouped into outbreaks: a new outbreak starts when a case comes more than
// gapDays after the previous one (COVID guidance declares an outbreak over 14
// days after the last case). Case date = symptom onset, or for an
// asymptomatic infection the equivalent time (when screening would find it).
// opts.include: 'residents' (default) groups by resident cases only; 'all'
// also lets staff cases open and extend outbreaks.
// An outbreak counts if it has ≥ minResidentCases resident cases.
// Returns [{ start, end (slots), durationDays, residents, staff, residentAR }].
// ---------------------------------------------------------------------------
export function segmentOutbreaks(world, result, opts = {}) {
  const gap = (opts.gapDays == null ? 14 : opts.gapDays) * SLOTS_PER_DAY;
  const minRes = opts.minResidentCases == null ? 2 : opts.minResidentCases;
  const includeStaff = opts.include === 'all';
  const tr = world.traits, cases = [];
  for (const e of result.events) {
    const p = e.person, g = e.day * SLOTS_PER_DAY + e.slot + 1;
    cases.push({ t: g + tr.latent[p] + tr.presym[p], staff: world.isStaff[p] === 1 });
  }
  cases.sort((a, b) => a.t - b.t);
  const out = [];
  let cur = null;
  const close = () => { if (cur && cur.residents >= minRes) out.push(cur); cur = null; };
  for (const c of cases) {
    if (c.staff && !includeStaff) { if (cur && c.t <= cur.end + gap) cur.staff++; continue; }
    if (!cur || c.t > cur.end + gap) { close(); cur = { start: c.t, end: c.t, residents: 0, staff: 0 }; }
    cur.end = c.t;
    if (c.staff) cur.staff++; else cur.residents++;
  }
  close();
  for (const o of out) { o.durationDays = (o.end - o.start) / SLOTS_PER_DAY; o.residentAR = o.residents / world.nResidents; }
  return out;
}

// ---------------------------------------------------------------------------
// COVID calibration with three free quantities (third pass).
// For each close-range share s: staff community hazard h (visitor
// infectiousness scaled with it, same ratio as the defaults), emission median
// and close-range intensity G are chosen so that the no-lamp baseline gives
//   season incidence = target, close-range share = s, and median facility
//   outbreak attack rate = outbreakTarget (surveillance-style outbreaks:
//   segmentOutbreaks with staff cases included, 14-day gap, ≥ 2 resident cases).
// Outer loop: bisection on log h (outbreak size falls as h rises, because
// incidence is held fixed). Inner loop: calibrate() for (G, emission).
// h is searched in [hMin, hMax]; the researched range is reported against.
// ---------------------------------------------------------------------------
export function calibrateCovid3(opts = {}) {
  const base0 = opts.config;
  const ratio = base0.importation.visitorInfectiousProb / base0.importation.staffDailyHazard;
  const At = opts.outbreakTarget == null ? 0.21 : opts.outbreakTarget;
  const hMin = opts.hMin || 0.00005, hMax = opts.hMax || 0.003;
  const seeds = opts.seasonSeeds || 200, log = opts.log || (() => {});
  const shares = opts.shares || [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const rows = [];
  let G = opts.G0 || 2, e = opts.e0 || 0.3, h = opts.h0 || 0.0002;
  const cache = new Map();
  const withH = (hh) => mergeConfig(base0, { importation: { staffDailyHazard: hh, visitorInfectiousProb: ratio * hh } });
  for (const s of shares) {
    const fitAt = (hh) => {
      const r = calibrate('covid', { config: withH(hh), shares: [s], seasonSeeds: seeds, G0: G, e0: e, rounds: 4, worldCache: cache, skipFinal: true });
      const x = r.rows[0];
      G = x.G; e = x.emissionMedian;
      const m = calibrationMetrics(mergeConfig(withH(hh), { transmission: { G }, emission: { median: e } }), { seasonSeeds: seeds, worldCache: cache }).season;
      log(`  share ${s}: h=${hh.toPrecision(3)} G=${G.toPrecision(4)} e=${e.toPrecision(4)} AR=${m.attackRate.toFixed(3)} share=${m.closeShare.toFixed(3)} outbreakAR=${(m.outbreakMedianAR || 0).toFixed(3)}`);
      return { h: hh, G, e, m };
    };
    // Bracket in log h: A decreases with h.
    let lo = null, hi = null, best = null;
    let cur = fitAt(h);
    const better = (c) => { if (!best || Math.abs(c.m.outbreakMedianAR - At) < Math.abs(best.m.outbreakMedianAR - At)) best = c; };
    better(cur);
    if (cur.m.outbreakMedianAR > At) lo = cur; else hi = cur; // lo: A too high (h too small)
    for (let k = 0; k < 4 && !(lo && hi); k++) {
      const nh = lo ? Math.min(hMax, lo.h * 2) : Math.max(hMin, hi.h / 2);
      if ((lo && lo.h >= hMax) || (hi && hi.h <= hMin)) break;
      cur = fitAt(nh); better(cur);
      if (cur.m.outbreakMedianAR > At) lo = cur; else hi = cur;
    }
    for (let k = 0; k < (opts.outerIters || 5) && lo && hi; k++) {
      if (Math.abs(best.m.outbreakMedianAR - At) <= (opts.tolOutbreak || 0.02)) break;
      cur = fitAt(Math.sqrt(lo.h * hi.h)); better(cur);
      if (cur.m.outbreakMedianAR > At) lo = cur; else hi = cur;
      if (hi.h / lo.h < 1.05) break;
    }
    h = best.h; G = best.G; e = best.e;
    const a = best.m, r4 = (x) => (typeof x === 'number' ? +x.toPrecision(4) : x);
    const achieved = {};
    for (const k of ['attackRate', 'closeShare', 'outbreakMedianAR', 'outbreakQ25AR', 'outbreakQ75AR', 'outbreaksPerSeason', 'introductionsPerSeason', 'outbreaksPerIntroduction', 'outbreakMedianDurationDays', 'outbreakMeanDurationDays', 'outbreakShareOver42Days', 'outbreakMedianStaffAR', 'staffAttackRate', 'incidencePer10kResidentWeeks']) achieved[k] = r4(a[k]);
    rows.push({ closeShare: s, G: r4(best.G), emissionMedian: r4(best.e), staffDailyHazard: r4(best.h), visitorInfectiousProb: r4(ratio * best.h), achieved });
    log(`covid3 share ${s}: ${JSON.stringify(rows[rows.length - 1])}`);
  }
  return { pathogen: 'covid', targets: { attackRate: calibrationTargetValue('covid', base0), outbreakMedianAR: At }, seasonSeeds: seeds, rows };
}

// Facilities (per arm for parallel, total for crossover) needed for a given
// power, by the normal approximation from a facility pool:
//   parallel  n per arm = 2 (z_{α/2} + z_power)² σ² / δ²
//   crossover n total   =   (z_{α/2} + z_power)² σ_d² / δ²
// σ: SD of the facility outcome (control and lamp pooled); σ_d: SD of the
// within-facility difference between a control and a lamp season; δ: mean
// difference. For 'outbreakSize' the result is divided by the share of
// facilities (or facility pairs) with the needed outbreaks.
export function facilitiesForPower(pool, opts = {}) {
  const za = 1.959964, zb = { 0.8: 0.841621, 0.9: 1.281552 }[opts.power || 0.8] || 0.841621;
  const alt = opts.outcome === 'outbreakSize';
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / (a.length - 1)); };
  const vals = (arr, obs, k) => arr.map((_, f) => {
    if (!alt) return arr[f][k];
    const o = obs[f][k]; return o.length ? o.reduce((x, y) => x + y, 0) / o.length : NaN;
  });
  const c = vals(pool.ctrl, pool.ctrlOB, 0), l = vals(pool.lamp, pool.lampOB, 0);
  const cf = c.filter(Number.isFinite), lf = l.filter(Number.isFinite);
  const delta = mean(cf) - mean(lf);
  const sigma = Math.sqrt((sd(cf) ** 2 + sd(lf) ** 2) / 2);
  const pAny = (cf.length + lf.length) / (c.length + l.length);
  const d = []; for (let f = 0; f < c.length; f++) if (Number.isFinite(c[f]) && Number.isFinite(l[f])) d.push(c[f] - l[f]);
  const pBoth = d.length / c.length;
  const nPar = 2 * (za + zb) ** 2 * sigma * sigma / (delta * delta) / (alt ? pAny : 1);
  const nCross = (za + zb) ** 2 * sd(d) ** 2 / (mean(d) ** 2) / (alt ? pBoth : 1);
  const res = { delta, sigma, sigmaDiff: sd(d), meanDiff: mean(d), pFacilityWithOutbreak: pAny, pBothSeasonsWithOutbreak: pBoth,
    parallelPerArm: Math.ceil(nPar), crossoverTotal: Math.ceil(nCross) };
  if (!pool.pairLamp) return res;
  // Paired (common-random-numbers) effect: each home's first control season
  // against the same season with lamps. Its SE is far smaller than the
  // unpaired difference of means, so it is used as δ; σ (between-home SD of
  // a one-season outcome) and σ_d (SD of the difference between two
  // independent seasons of one home) still come from the independent seasons.
  // A bootstrap over homes gives a 95% interval on each sample size. No size
  // is given when the paired effect is not positive.
  const pairOf = (f) => {
    if (!alt) return pool.ctrl[f][0] - pool.pairLamp[f];
    const a = pool.ctrlOB[f][0], b = pool.pairLampOB[f];
    return a.length && b.length ? a.reduce((x, y) => x + y, 0) / a.length - b.reduce((x, y) => x + y, 0) / b.length : NaN;
  };
  const sizes = (idx) => {
    const pd = [], cc = [], ll = [], dd = [];
    for (const f of idx) {
      const v = pairOf(f); if (Number.isFinite(v)) pd.push(v);
      if (Number.isFinite(c[f])) cc.push(c[f]);
      if (Number.isFinite(l[f])) ll.push(l[f]);
      if (Number.isFinite(c[f]) && Number.isFinite(l[f])) dd.push(c[f] - l[f]);
    }
    const dl = mean(pd), sg = Math.sqrt((sd(cc) ** 2 + sd(ll) ** 2) / 2);
    const pA = (cc.length + ll.length) / (2 * idx.length), pB = dd.length / idx.length;
    return { delta: dl, deltaSE: sd(pd) / Math.sqrt(pd.length), sigma: sg, sigmaDiff: sd(dd), nPairs: pd.length,
      parallel: dl > 0 ? 2 * (za + zb) ** 2 * sg * sg / (dl * dl) / (alt ? pA : 1) : Infinity,
      crossover: dl > 0 ? (za + zb) ** 2 * sd(dd) ** 2 / (dl * dl) / (alt ? pB : 1) : Infinity };
  };
  const all = Array.from({ length: c.length }, (_, i) => i);
  const pt = sizes(all);
  const rng = makeRng(streamSeed(opts.seed == null ? 991 : opts.seed, STREAM_TRIAL + 3, alt ? 1 : 0));
  const B = opts.bootstrap || 400, bp = [], bc = [];
  for (let b = 0; b < B; b++) {
    const idx = all.map(() => Math.floor(rng() * all.length));
    const x = sizes(idx); bp.push(x.parallel); bc.push(x.crossover);
  }
  bp.sort((x, y) => x - y); bc.sort((x, y) => x - y);
  const q = (a, p) => a[Math.max(0, Math.min(a.length - 1, Math.ceil(p * a.length) - 1))]; // nearest rank (copes with Infinity)
  const ok = pt.delta > 0;
  const ci = (a) => [Math.ceil(q(a, 0.025)), Number.isFinite(q(a, 0.975)) ? Math.ceil(q(a, 0.975)) : null];
  res.paired = {
    delta: pt.delta, deltaSE: pt.deltaSE, deltaCI95: [pt.delta - 1.96 * pt.deltaSE, pt.delta + 1.96 * pt.deltaSE], nPairs: pt.nPairs,
    sigma: pt.sigma, sigmaDiff: pt.sigmaDiff, bootstrap: B,
    refused: ok ? null : 'the paired lamp effect is not positive, so no sample size can be given',
    parallelPerArm: ok ? Math.ceil(pt.parallel) : null, parallelPerArmCI95: ok ? ci(bp) : null,
    crossoverTotal: ok ? Math.ceil(pt.crossover) : null, crossoverTotalCI95: ok ? ci(bc) : null,
  };
  return res;
}
