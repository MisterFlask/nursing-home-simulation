// Analysis-layer tests: summaries, paired comparison, chunking, scenarios,
// lamp ranking and trial simulation (small sizes; these check plumbing).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, mergeConfig, PARAMS, paramRange, calibrated } from '../src/params.js';
import { buildWorld, runSeason, lampAchFor } from '../src/engine.js';
import { compare, mergeCompare, summarize, scenarios, rankRooms, simulateTrial, mergeTrial, baselineRoomStats, mergeBaselineRoomStats, allocateLamps, seedList, calibrationTargetValue, calibrationMetrics } from '../src/analysis.js';

const cfg = defaultConfig('covid');
const short = mergeConfig(cfg, { days: 40 });
const iv = { lamps: { 'dining-1': 2, 'dining-2': 2, activity: 2, breakroom: 1 } };

test('summarize: quantiles, mean, P(zero)', () => {
  const s = summarize([0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(s.n, 11); assert.equal(s.median, 4); assert.equal(s.min, 0); assert.equal(s.max, 9);
  assert.ok(Math.abs(s.mean - 45 / 11) < 1e-12);
  assert.ok(Math.abs(s.pZero - 2 / 11) < 1e-12);
  assert.equal(s.q25, 1.5); assert.equal(s.q75, 6.5);
  assert.ok(Math.abs(s.q05 - 0) < 1e-12); assert.ok(Math.abs(s.q95 - 8.5) < 1e-12);
});

test('compare: paired arms on the same worlds; chunked runs merge to the same answer', () => {
  const arms = [{ name: 'none', intervention: {} }, { name: 'lamps', intervention: iv }];
  const all = compare(short, arms, { seeds: 6 });
  const a = compare(short, arms, { seeds: { start: 1, count: 3 } });
  const b = compare(short, arms, { seeds: { start: 4, count: 3 } });
  const m = mergeCompare(a, b);
  assert.deepEqual(m.arms[1].residentInfected, all.arms[1].residentInfected);
  assert.deepEqual(m.paired[0].residentAverted, all.paired[0].residentAverted);
  assert.equal(all.paired[0].residentAverted.length, 6);
  all.paired[0].residentAverted.forEach((d, i) => assert.equal(d, all.arms[0].residentInfected[i] - all.arms[1].residentInfected[i]));
  let calls = 0; compare(short, arms, { seeds: 2, onProgress: (d, t) => { calls++; assert.equal(t, 2); } });
  assert.equal(calls, 2);
  // Object form of arms.
  const o = compare(short, { none: {}, lamps: iv }, { seeds: 2 });
  assert.equal(o.arms[1].name, 'lamps');
});

// A config moved to another close-range share using the calibrated values there.
const atShare = (c, sh) => {
  const k = calibrated('covid', sh);
  return mergeConfig(c, { transmission: { closeShare: sh, G: k.G }, emission: { median: k.emissionMedian }, importation: { staffDailyHazard: k.staffDailyHazard, visitorInfectiousProb: k.visitorInfectiousProb } });
};

test('scenarios: unreachable share high / low via calibration, lamp low / high, user edits carried proportionally', () => {
  const sc = scenarios(cfg);
  const meta = (p) => paramRange(PARAMS.find((x) => x.path === p), 'covid');
  const sh = meta('transmission.closeShare');
  const kHi = calibrated('covid', sh.high), kLo = calibrated('covid', sh.low);
  assert.equal(sc.cautious.transmission.closeShare, sh.high);
  assert.equal(sc.favourable.transmission.closeShare, sh.low);
  assert.ok(Math.abs(sc.cautious.transmission.G - kHi.G) < 1e-9 * kHi.G);
  assert.ok(Math.abs(sc.cautious.emission.median - kHi.emissionMedian) < 1e-9 * kHi.emissionMedian);
  assert.ok(Math.abs(sc.favourable.transmission.G - kLo.G) < 1e-9 * kLo.G);
  for (const p of ['susceptibility', 'realWorldFactor', 'pathFactor', 'bedroomShare']) {
    assert.ok(Math.abs(sc.cautious.lamp[p] - meta('lamp.' + p).low) < 1e-9, p);
    assert.ok(Math.abs(sc.favourable.lamp[p] - meta('lamp.' + p).high) < 1e-9, p);
  }
  assert.deepEqual(sc.central.transmission, cfg.transmission);
  // Everything else identical.
  for (const k of ['facility', 'disease', 'immune', 'people', 'staff', 'air', 'breathing', 'control']) assert.deepEqual(sc.cautious[k], cfg[k], k);
  assert.ok(Math.abs(sc.cautious.importation.staffDailyHazard - kHi.staffDailyHazard) < 1e-12);
  assert.equal(sc.cautious.importation.visitsPerResidentPerDay, cfg.importation.visitsPerResidentPerDay);
  const user = mergeConfig(cfg, { transmission: { G: 2 * cfg.transmission.G } });
  assert.ok(Math.abs(scenarios(user).cautious.transmission.G - 2 * kHi.G) < 1e-9 * kHi.G);
  // Moving only the share slider (with its calibrated values) is not a user
  // edit: every scenario lands on the calibrated values at its own share.
  for (const s of [0.2, 0.8]) {
    const sc2 = scenarios(atShare(cfg, s));
    for (const [name, share] of [['cautious', sh.high], ['favourable', sh.low]]) {
      const k = calibrated('covid', share);
      assert.ok(Math.abs(sc2[name].transmission.G / k.G - 1) < 1e-9, `${name} G from share ${s}`);
      assert.ok(Math.abs(sc2[name].emission.median / k.emissionMedian - 1) < 1e-9, `${name} emission from share ${s}`);
      assert.ok(Math.abs(sc2[name].importation.staffDailyHazard / k.staffDailyHazard - 1) < 1e-9, `${name} importation from share ${s}`);
    }
  }
});

function scenarioBaselinesAgree(base, nSeeds, label) {
  // Independent seeds from the calibration's; paired across scenarios (same
  // worlds' structure), so the comparison uses per-seed differences. Allowed
  // gap: 3 SE plus the calibration's own tolerance (3% of target, twice).
  const sc = scenarios(base);
  const seeds = seedList({ start: 5001, count: nSeeds });
  const ar = { cautious: [], central: [], favourable: [] };
  for (const seed of seeds) {
    let prev = null;
    for (const k of Object.keys(ar)) { const w = buildWorld(sc[k], seed, { reuse: prev }); prev = w; ar[k].push(runSeason(w, {}).totals.residentInfected / w.nResidents); }
  }
  const m = {}; for (const k in ar) m[k] = ar[k].reduce((a, b) => a + b, 0) / seeds.length;
  const target = calibrationTargetValue('covid', cfg);
  for (const k of ['cautious', 'favourable']) {
    const d = ar[k].map((v, i) => v - ar.central[i]);
    const s = summarize(d);
    console.log(`  [${label}] ${k}: mean attack rate ${m[k].toFixed(4)} vs central ${m.central.toFixed(4)} (diff ${s.mean.toFixed(4)} ± ${s.se.toFixed(4)}; target ${target.toFixed(4)})`);
    assert.ok(Math.abs(s.mean) <= 3 * s.se + 0.06 * target, `${label}: ${k} baseline differs from central`);
  }
}

test('scenario baselines (no lamps) have the same mean attack rate within Monte Carlo error', () => {
  scenarioBaselinesAgree(cfg, 150, 'default share');
});

test('scenario baselines still agree when the share is set to 0.2 or 0.8 with its calibrated values', () => {
  scenarioBaselinesAgree(atShare(cfg, 0.2), 80, 'share 0.2');
  scenarioBaselinesAgree(atShare(cfg, 0.8), 80, 'share 0.8');
});

test('rankRooms: greedy allocation uses the budget, first-order formula, confirmation runs', () => {
  // More importation than default so a 40-day, 4-seed run has infections to rank.
  const busy = mergeConfig(short, { importation: { staffDailyHazard: 0.002, visitorInfectiousProb: 0.012 } });
  const r = rankRooms(busy, { seeds: 4, lampsAvailable: 6, confirmSeeds: 3 });
  const used = Object.values(r.allocation).reduce((a, b) => a + b, 0);
  assert.ok(used <= 6);
  assert.equal(r.steps.length, used);
  for (let k = 1; k < r.steps.length; k++) assert.ok(r.steps[k].gain <= r.steps[k - 1].gain + 1e-12, 'greedy gains are non-increasing');
  assert.ok(r.confirm.allocations.length >= 1);
  // Formula check on a synthetic baseline: one room, known infections.
  const stats = { n: 1, residentInfected: 0, rooms: { 'dining-1': { infectionsRoom: 10, infectionsClose: 0, infections: 10 } } };
  const al = allocateLamps(cfg, stats, 3);
  const room = al.rooms.find((x) => x.roomId === 'dining-1');
  const L = room.lambda, rm = { type: 'dining', volume: room.volume, height: room.height };
  const A = (n) => lampAchFor(cfg, rm, n);
  const expect1 = 10 * (1 - L / (L + A(1))), expect2 = 10 * (L / (L + A(1)) - L / (L + A(2)));
  assert.ok(Math.abs(al.steps[0].gain - expect1) < 1e-12);
  assert.ok(Math.abs(al.steps[1].gain - expect2) < 1e-12);
  assert.deepEqual(al.allocation, { 'dining-1': 3 });
  // Chunked baseline merges.
  const s1 = baselineRoomStats(short, { seeds: { start: 1, count: 2 } }), s2 = baselineRoomStats(short, { seeds: { start: 3, count: 2 } });
  const s = baselineRoomStats(short, { seeds: 4 });
  const m = mergeBaselineRoomStats(s1, s2);
  assert.equal(m.n, s.n); assert.equal(m.residentInfected, s.residentInfected);
  for (const id in s.rooms) for (const f in s.rooms[id]) assert.ok(Math.abs(m.rooms[id][f] - s.rooms[id][f]) <= 1e-12 * Math.max(1, Math.abs(s.rooms[id][f])), `${id}.${f}`);
  // UI call shape.
  const ui = rankRooms(short, { seeds: 2, lampsAvailable: 3, confirm: false });
  assert.ok(ui.allocation && !ui.confirm);
});

test('simulateTrial: parallel and crossover designs run; chunks merge; deterministic', () => {
  const tiny = mergeConfig(cfg, { days: 20 });
  const design = { facilitiesPerArm: 2, seasons: 1, placement: iv, facilityVariation: { ventilationGsd: 1.5, importationGsd: 1.5, immunitySd: 0.1 } };
  const r = simulateTrial(tiny, design, { trials: 2, permutations: 99 });
  assert.equal(r.trials.length, 2);
  assert.ok(r.power >= 0 && r.power <= 1);
  for (const t of r.trials) assert.ok(t.p > 0 && t.p <= 1);
  const a = simulateTrial(tiny, design, { trials: 1, trialStart: 0, permutations: 99 });
  const b = simulateTrial(tiny, design, { trials: 1, trialStart: 1, permutations: 99 });
  assert.deepEqual(mergeTrial(a, b).trials, r.trials);
  const x = simulateTrial(tiny, { ...design, crossover: true }, { trials: 1, permutations: 99 });
  assert.equal(x.trials.length, 1);
});

test('buildWorld reuse: non-structural changes reuse the structure and give bit-identical results to a fresh build', () => {
  const plain = (r) => JSON.stringify(r, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v));
  const a = buildWorld(short, 7);
  const edits = [
    { transmission: { G: short.transmission.G * 1.7 }, emission: { median: short.emission.median * 0.6 } },
    { importation: { visitorInfectiousProb: 0.05, staffDailyHazard: 0.004 }, facility: { ach: { bedroom: 3 } }, disease: { latent: { mean: 2.5 } }, lamp: { susceptibility: 8, followMountingRule: 0 } },
    { control: { outbreakMode: { enabled: false } }, immune: { protection: 0.5 }, ventilation: { scale: 1.6 } },
  ];
  for (const e of edits) {
    const c2 = mergeConfig(short, e);
    const reused = buildWorld(c2, 7, { reuse: a }), fresh = buildWorld(c2, 7);
    assert.equal(reused.locSlot, a.locSlot, 'structure shared');
    for (const iv of [{}, { lamps: { 'dining-1': 2, 'w0-bed-03': 1 } }]) assert.equal(plain(runSeason(reused, iv)), plain(runSeason(fresh, iv)));
  }
  // Structural change or different seed → full rebuild.
  assert.notEqual(buildWorld(mergeConfig(short, { people: { pLoungeIdle: 0.5 } }), 7, { reuse: a }).locSlot, a.locSlot);
  assert.notEqual(buildWorld(short, 8, { reuse: a }).locSlot, a.locSlot);
});

test('calibrationMetrics: outbreak runs and season runs produce sane numbers', () => {
  const m = calibrationMetrics(short, { seasonSeeds: 3, outbreakSeeds: { start: 100001, count: 10 } });
  assert.ok(m.season.attackRate >= 0 && m.season.attackRate <= 1);
  assert.ok(m.outbreak.n === 10 && m.outbreak.pOutbreak >= 0 && m.outbreak.pOutbreak <= 1);
});
