// Physics tests: well-mixed room air, decay, Wells-Riley dose-response through
// the Sellke thresholds, and the effect of a lamp on the removal rate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runSeason, roomAirStep, roomLambdas, SLOT_HOURS, lampOutputFraction, lampCadrFor, lampAchFor } from '../src/engine.js';
import { defaultConfig, mergeConfig } from '../src/params.js';
import { analyticConfig, oneRoomWorld } from './helpers.js';

const close = (a, b, rel, msg) => assert.ok(Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-300), `${msg}: ${a} vs ${b}`);

test('(a) slot-average formula matches fine-step numerical integration', () => {
  // dC/dt = S/V − λC, integrated with RK4 at 1e-5 h steps, averaged over the slot.
  const cases = [
    { C0: 0, S: 50, V: 100, lambda: 3 },
    { C0: 0.4, S: 0, V: 100, lambda: 3 },
    { C0: 0.2, S: 10, V: 36, lambda: 1.1 },
    { C0: 1.5, S: 200, V: 400, lambda: 25 },
  ];
  for (const c of cases) {
    const f = (C) => c.S / c.V - c.lambda * C;
    const h = 1e-5, n = Math.round(SLOT_HOURS / h);
    let C = c.C0, integral = 0;
    for (let i = 0; i < n; i++) {
      const k1 = f(C), k2 = f(C + h * k1 / 2), k3 = f(C + h * k2 / 2), k4 = f(C + h * k3);
      const Cn = C + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      integral += h * (C + Cn) / 2; // trapezoid on the RK4 path
      C = Cn;
    }
    const r = roomAirStep(c.C0, c.S, c.V, c.lambda, SLOT_HOURS);
    close(r.cbar, integral / SLOT_HOURS, 1e-7, `Cbar ${JSON.stringify(c)}`);
    close(r.cend, C, 1e-9, `Cend ${JSON.stringify(c)}`);
  }
});

test('(a) constant emitter: engine concentration reaches S/(V·λ)', () => {
  const cfg = analyticConfig();
  const w = oneRoomWorld(cfg, 1, { nSus: 1, emitterSlots: 48, susSlots: 0 });
  const res = runSeason(w, {}, { record: true, introductions: [{ person: 0, stage: 'I' }] });
  const lambda = w.rooms[0].ach * cfg.ventilation.scale + cfg.air.decay + cfg.air.deposition;
  const S = cfg.emission.median; // quanta/h: q × profile 1 × activity 1
  const Css = S / (w.rooms[0].volume * lambda);
  const conc = res.frames.conc, nR = res.frames.nRooms;
  // Engine's slot averages equal the closed form from C0 = 0, slot by slot.
  let C = 0;
  for (let g = 0; g < 48; g++) {
    const r = roomAirStep(C, S, w.rooms[0].volume, lambda, SLOT_HOURS);
    close(conc[g * nR], r.cbar, 1e-6, `slot ${g}`); // Float32 frames
    C = r.cend;
  }
  close(conc[47 * nR], Css, 1e-6, 'steady state after 24 h');
  console.log(`  λ = ${lambda}/h, Css = ${Css.toExponential(4)} quanta/m³, engine slot 47 = ${conc[47 * nR].toExponential(4)}`);
});

test('(b) concentration decays as e^{−λt} after the emitter leaves', () => {
  const cfg = analyticConfig();
  const w = oneRoomWorld(cfg, 1, { nSus: 1, emitterSlots: 12, susSlots: 0 });
  const res = runSeason(w, {}, { record: true, introductions: [{ person: 0, stage: 'I' }] });
  const lambda = w.rooms[0].ach + cfg.air.decay + cfg.air.deposition;
  const conc = res.frames.conc, nR = res.frames.nRooms;
  const r0 = conc[12 * nR];
  assert.ok(r0 > 0);
  for (let k = 1; k <= 16; k++) close(conc[(12 + k) * nR] / r0, Math.exp(-lambda * SLOT_HOURS * k), 1e-5, `decay after ${k} slots`);
});

// Expected infected fraction for N susceptibles sharing the room with one
// constant emitter from t = 0 (C0 = 0) for T hours:
//   dose = p · ∫₀ᵀ C dt = p · Css · (T − (1 − e^{−λT})/λ),  Css = q/(Vλ)
//   P(infected) = 1 − e^{−dose}
// For λT ≫ 1 this tends to the steady-state form 1 − exp(−p·q·T/(V·λ)).
function expectedFraction(p, q, V, lambda, T) {
  const Css = q / (V * lambda);
  return 1 - Math.exp(-p * Css * (T - (1 - Math.exp(-lambda * T)) / lambda));
}
// Runs seeds [seed0, seed0 + nSeeds). Besides the Monte Carlo fraction, checks
// exactly that each susceptible is infected iff their pre-drawn threshold is
// below the analytic dose (Sellke construction), so the engine's dose
// bookkeeping is verified person by person, not only on average.
function infectedFraction(cfg, intervention, seed0, nSeeds, nSus, slots, analyticDose) {
  let inf = 0, n = 0, checked = 0;
  for (let seed = seed0; seed < seed0 + nSeeds; seed++) {
    const w = oneRoomWorld(cfg, seed, { nSus, emitterSlots: slots, susSlots: slots });
    const res = runSeason(w, intervention, { introductions: [{ person: 0, stage: 'I' }] });
    const got = new Set();
    for (const e of res.events) if (e.route !== 'community') { assert.equal(e.route, 'room'); inf++; got.add(e.person); }
    for (let i = 1; i <= nSus; i++) {
      const th = w.traits.threshold[i];
      if (Math.abs(th - analyticDose) < 1e-9 * analyticDose) continue;
      assert.equal(got.has(i), th < analyticDose, `seed ${seed} person ${i}: threshold ${th}, dose ${analyticDose}`);
      checked++;
    }
    n += nSus;
  }
  assert.ok(checked > 0.99 * n);
  return { frac: inf / n, n };
}
const doseOf = (p, q, V, lambda, T) => -Math.log(1 - expectedFraction(p, q, V, lambda, T));

test('(c) one infector, N susceptibles, T hours: infected fraction = 1 − exp(−dose)', () => {
  const cfg = analyticConfig();
  const nSus = 20, slots = 8, T = slots * SLOT_HOURS, V = 100;
  const lambda = 2 + cfg.air.decay + cfg.air.deposition;
  const p = cfg.breathing.social, q = cfg.emission.median;
  const exp = expectedFraction(p, q, V, lambda, T);
  const { frac, n } = infectedFraction(cfg, {}, 1, 2000, nSus, slots, doseOf(p, q, V, lambda, T));
  const se = Math.sqrt(exp * (1 - exp) / n);
  console.log(`  expected ${exp.toFixed(4)} (steady-state form ${(1 - Math.exp(-p * q * T / (V * lambda))).toFixed(4)}), observed ${frac.toFixed(4)} ± ${se.toFixed(4)} (n=${n})`);
  assert.ok(Math.abs(frac - exp) < 4 * se, `observed ${frac} vs expected ${exp}`);
});

test('(c) steady-state form holds when the room starts at steady state (long exposure, λT ≫ 1)', () => {
  // Susceptibles present only for the last 4 h of a 12 h emission: C ≈ Css throughout.
  const cfg = analyticConfig();
  const nSus = 20, V = 100;
  const lambda = 2 + cfg.air.decay + cfg.air.deposition;
  const p = cfg.breathing.social, q = cfg.emission.median, T = 4;
  let inf = 0, n = 0;
  for (let seed = 3001; seed <= 5000; seed++) {
    const w = oneRoomWorld(cfg, seed, { nSus, emitterSlots: 24, susSlots: 0 });
    for (let g = 16; g < 24; g++) for (let i = 1; i <= nSus; i++) w.locSlot[g * w.N + i] = 0;
    const res = runSeason(w, {}, { introductions: [{ person: 0, stage: 'I' }] });
    inf += res.events.filter((e) => e.route !== 'community').length; n += nSus;
  }
  const exp = 1 - Math.exp(-p * q * T / (V * lambda));
  const se = Math.sqrt(exp * (1 - exp) / n), frac = inf / n;
  console.log(`  spec formula ${exp.toFixed(4)}, observed ${frac.toFixed(4)} ± ${se.toFixed(4)}`);
  assert.ok(Math.abs(frac - exp) < 4 * se);
});

test('(d) a lamp lowers the infected fraction to the value predicted with the increased λ', () => {
  const cfg = analyticConfig({ lamp: { susceptibility: null, ecadr: 300, realWorldFactor: 1, maxEach: 100 } });
  const nSus = 20, slots = 8, T = slots * SLOT_HOURS, V = 100;
  const w0 = oneRoomWorld(cfg, 1, {});
  const lamBase = roomLambdas(w0, {}).lambda[0];
  const lamLamp = roomLambdas(w0, { lamps: { room: 1 } }).lambda[0];
  assert.ok(Math.abs(lamLamp - lamBase - 300 / V) < 1e-12, 'one lamp adds ecadr·realWorldFactor/V');
  const p = cfg.breathing.social, q = cfg.emission.median;
  const expBase = expectedFraction(p, q, V, lamBase, T), expLamp = expectedFraction(p, q, V, lamLamp, T);
  const { frac, n } = infectedFraction(cfg, { lamps: { room: 1 } }, 5001, 2000, nSus, slots, doseOf(p, q, V, lamLamp, T));
  const se = Math.sqrt(expLamp * (1 - expLamp) / n);
  console.log(`  no lamp expected ${expBase.toFixed(4)}; with lamp expected ${expLamp.toFixed(4)}, observed ${frac.toFixed(4)} ± ${se.toFixed(4)}`);
  assert.ok(Math.abs(frac - expLamp) < 4 * se);
  // Lamp cap: maxEach limits the added air changes.
  const capped = analyticConfig({ lamp: { susceptibility: null, ecadr: 300, realWorldFactor: 1, maxEach: 1.5 } });
  const wc = oneRoomWorld(capped, 1, {});
  assert.ok(Math.abs(roomLambdas(wc, { lamps: { room: 4 } }).lambda[0] - lamBase - 1.5) < 1e-12);
});

test('lamp clean air follows the maker\'s mounting rule: 0.36 × k × mW × output share × height × path factor', () => {
  const c = defaultConfig('covid');
  const f = (h, over = {}) => lampOutputFraction(mergeConfig(c, { lamp: over }), h);
  for (const [h, want] of [[3.0, 1], [2.6, 1], [2.45, 0.7], [2.4, 0.6], [2.3, 0.4], [2.15, 0.2], [2.0, 0.2]]) assert.ok(Math.abs(f(h) - want) < 1e-12, `height ${h}`);
  assert.equal(f(2.3, { followMountingRule: 0 }), 1);
  const room = (height, type = 'lounge') => ({ type, height, volume: 100 });
  const k = c.lamp.susceptibility;
  const mW = c.lamp.outputMw;
  assert.ok(Math.abs(lampCadrFor(c, room(2.7)) - 0.36 * k * mW * 2.7) < 1e-9);
  assert.ok(Math.abs(lampCadrFor(c, room(2.4)) - 0.36 * k * mW * 0.6 * 2.4) < 1e-9);
  // Added air changes: n lamps × clean air / volume, times the real-world factor; capped only where a config sets a cap.
  const ach1 = lampAchFor(c, room(2.4), 1);
  assert.ok(Math.abs(ach1 - lampCadrFor(c, room(2.4)) / 100 * c.lamp.realWorldFactor) < 1e-12);
  const capped = mergeConfig(c, { lamp: { maxEach: 9, maxEachBedroom: 2 } });
  assert.ok(Math.abs(lampAchFor(capped, room(2.4), 99) - 9 * c.lamp.realWorldFactor) < 1e-12, 'shared-room cap, where set');
  assert.ok(Math.abs(lampAchFor(capped, room(2.4, 'bedroom'), 9) - 2 * c.lamp.realWorldFactor) < 1e-12, 'bedroom cap, where set');
  assert.equal(lampAchFor(c, room(2.4), 0), 0);
});

test('close-range dose follows p·s·E·τ·G/β (and is untouched by lamps unless nearFieldUV > 0)', () => {
  // Emitter and susceptibles never share room air (huge ACH), one 'care' contact per susceptible for 0.5 h.
  const beta = 100, G = 2;
  const base = analyticConfig({ transmission: { G, beta: { care: beta }, nearFieldUV: 0 }, emission: { median: 20 } });
  const nSus = 20;
  const run = (cfg, iv) => {
    let inf = 0, n = 0;
    for (let seed = 9001; seed <= 10000; seed++) {
      const contacts = []; for (let i = 1; i <= nSus; i++) contacts.push({ g: 2, a: 0, b: i, type: 'care', tau: 0.5, room: 0 });
      const w = oneRoomWorld(cfg, seed, { nSus, ach: 1e9, emitterSlots: 8, susSlots: 8, contacts });
      const res = runSeason(w, iv, { introductions: [{ person: 0, stage: 'I' }] });
      for (const e of res.events) if (e.route !== 'community') { assert.equal(e.route, 'close'); inf++; }
      n += nSus;
    }
    return inf / n;
  };
  const doseExp = 0.5 * 20 * 0.5 * G / beta; // p · E · τ · G / β
  const exp = 1 - Math.exp(-doseExp), se = Math.sqrt(exp * (1 - exp) / (1000 * nSus));
  const f0 = run(base, {}), fLamp = run(base, { lamps: { room: 3 } });
  console.log(`  close-range expected ${exp.toFixed(4)}, observed ${f0.toFixed(4)} ± ${se.toFixed(4)}; with lamps ${fLamp.toFixed(4)}`);
  assert.ok(Math.abs(f0 - exp) < 4 * se);
  assert.equal(f0, fLamp, 'lamps do not change close-range infections when nearFieldUV = 0');
  const nf = analyticConfig({ transmission: { G, beta: { care: beta }, nearFieldUV: 0.5 }, emission: { median: 20 } });
  const fNf = run(nf, { lamps: { room: 1 } });
  const expNf = 1 - Math.exp(-doseExp * 0.5);
  assert.ok(Math.abs(fNf - expNf) < 4 * Math.sqrt(expNf * (1 - expNf) / (1000 * nSus)), `nearFieldUV: ${fNf} vs ${expNf}`);
});
