// For the film's "what lamps can reach" scene: how residents' reported infections split between room air and face
// to face, without lamps and with lamps in the common areas, at the central assumptions and at each end of the two
// unknowns (the split between routes, and how strongly lamps act), alone and together. Same seeds, lamp placement
// and reporting draw as the page. Writes web/film.routes.json, which the build adds to the film's data.
//   node web/film-routes.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { anchoredConfig, anchoredAt, mergeConfig, ANCHORED } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';

const dir = dirname(fileURLToPath(import.meta.url)), N = 200, SEED0 = 1000, M2_PER_LAMP = 23.2258;
const hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(), sc = anchoredScenarios(base), S = ANCHORED.shares;
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];   // every room except the bedrooms
const lamps = Object.fromEntries(rooms.filter((r) => COMMON.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / M2_PER_LAMP))]));
// One unknown at a time: the lamp-side ends at the central split, and the split's ends with central lamps.
const lampOnly = (end) => { const c = mergeConfig(sc[end], {}); c.transmission.closeShare = base.transmission.closeShare; c.transmission.G = base.transmission.G; return c; };
const states = {
  central: [sc.central, sc.reportShare.central], cautious: [sc.cautious, sc.reportShare.cautious], favourable: [sc.favourable, sc.reportShare.favourable],
  faceMore: [anchoredConfig(S.high), anchoredAt(S.high).reportShare], airMore: [anchoredConfig(S.low), anchoredAt(S.low).reportShare],
  weak: [lampOnly('cautious'), sc.reportShare.central], strong: [lampOnly('favourable'), sc.reportShare.central],
};
const out = { n: N, shares: S, states: {} };
for (const [name, [cfg, rho]] of Object.entries(states)) {
  const sum = { a: { air: 0, face: 0 }, b: { air: 0, face: 0 } };
  for (let s = 0; s < N; s++) {
    const seed = SEED0 + s, world = buildWorld(cfg, seed);
    for (const [k, l] of [['a', {}], ['b', lamps]]) for (const e of runSeason(world, { lamps: l }).events) if (e.role === 'resident' && hash(seed * 100003 + e.person) < rho) sum[k][e.route === 'room' ? 'air' : 'face']++;
  }
  const r = (v) => +(v / N).toFixed(3), st = { a: { air: r(sum.a.air), face: r(sum.a.face) }, b: { air: r(sum.b.air), face: r(sum.b.face) } };
  out.states[name] = st;
  const ta = st.a.air + st.a.face, tb = st.b.air + st.b.face;
  console.log(name.padEnd(11), 'without', ta.toFixed(2), `(air ${st.a.air}, face ${st.a.face})`, 'with', tb.toFixed(2), `(air ${st.b.air}, face ${st.b.face})`, (100 * (1 - tb / ta)).toFixed(1) + '% fewer');
}
writeFileSync(join(dir, 'film.routes.json'), JSON.stringify(out));
