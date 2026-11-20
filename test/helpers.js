// Test helpers: hand-built tiny worlds that go through the same assembleWorld
// (trait draws) and runSeason code as the full facility.
import { defaultConfig, mergeConfig } from '../src/params.js';
import { assembleWorld, columnsFrom, SLOTS_PER_DAY } from '../src/engine.js';

// Config for analytic tests: constant emission (GSD 1), no activity
// multipliers, no immunity, no importation, disease so slow that nobody
// infected during the test ever becomes infectious, emitter stays at peak.
export function analyticConfig(over = {}) {
  return mergeConfig(defaultConfig('covid'), mergeConfig({
    emission: { median: 50, gsd: 1, activity: { rest: 1, social: 1, work: 1 } },
    breathing: { rest: 0.5, social: 0.5, work: 0.5 },
    immune: { share: { resident: 0, staff: 0 }, protection: 0 },
    importation: { staffDailyHazard: 0, visitorInfectiousProb: 0, visitsPerResidentPerDay: 0 },
    disease: {
      latent: { mean: 1000, shape: 1000 }, presymptomatic: { mean: 1000, shape: 1000 }, infectious: { mean: 1000, shape: 1000 },
      pSymptomatic: { resident: 0, staff: 0 }, asymRelInf: 1,
    },
    air: { decay: 0.6, deposition: 0.4 },
    transmission: { G: 0 },
    control: { residentIsolation: { enabled: false }, staffExclusion: { enabled: false }, outbreakMode: { enabled: false } },
  }, over));
}

// One room (type 'lounge', so residents are in the 'social' context) plus outside.
// Person 0 is the emitter, present for emitterSlots slots from slot 0;
// persons 1..nSus are susceptibles present for susSlots slots from slot 0.
export function oneRoomWorld(cfg, seed, { nSus = 20, V = 100, area = 40, ach = 2, days = 2, emitterSlots = 8, susSlots = 8, contacts = [] } = {}) {
  const height = V / area;
  const rooms = [
    { id: 'room', type: 'lounge', wing: -1, name: 'Test room', area, height, volume: V, ach },
    { id: 'outside', type: 'outside', wing: -1, name: 'Outside', area: 0, height: 0, volume: 0, ach: 0 },
  ];
  const N = nSus + 1, T = days * SLOTS_PER_DAY;
  const people = [];
  for (let p = 0; p < N; p++) people.push({ id: p, role: 'resident', wing: -1, homeRoomIndex: 0, shift: null });
  const locSlot = new Uint8Array(T * N).fill(1);
  for (let g = 0; g < T; g++) {
    if (g < emitterSlots) locSlot[g * N + 0] = 0;
    if (g < susSlots) for (let p = 1; p < N; p++) locSlot[g * N + p] = 0;
  }
  return assembleWorld(cfg, seed, {
    rooms, people, days, locSlot,
    contacts: columnsFrom('contacts', contacts),
  });
}

export const typedToPlain = (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v);
export function hashOf(obj) {
  // FNV-1a over a JSON rendering (typed arrays as plain arrays).
  const s = JSON.stringify(obj, typedToPlain);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16) + ':' + s.length;
}
