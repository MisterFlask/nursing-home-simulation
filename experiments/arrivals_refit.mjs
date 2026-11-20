// The lamp effect at other arrival rates, with the model refitted so that residents infected in a season and the
// out-of-reach share (40%) stay the same: node experiments/arrivals_refit.mjs <days between arrivals> <G> <emission> [seasons]
// G and emission come from experiments/covid_fit_emission.mjs <G> 0.217 200 <days>, interpolated to a 40% share.
import { anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
const [every, G, e] = process.argv.slice(2, 5).map(Number), N = +(process.argv[5] || 200);
const c = anchoredConfig(); c.importation.arrivalEveryDays = every; c.transmission.G = G; c.emission.median = e;
const rooms = buildFacility(c.facility).filter((r) => r.type !== 'outside'), COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const set = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
const arms = { common: set(COMMON), both: set([...COMMON, 'bedroom']) }, tot = { none: 0, common: 0, both: 0 }; let close = 0, room = 0; const ds = [];
for (let s = 0; s < N; s++) { const w = buildWorld(c, 1000 + s), r0 = runSeason(w, { lamps: {} }); tot.none += r0.totals.residentInfected; close += r0.totals.byRoute.close; room += r0.totals.byRoute.room;
  for (const k of ['common', 'both']) { const y = runSeason(w, { lamps: arms[k] }).totals.residentInfected; tot[k] += y; if (k === 'common') ds.push(r0.totals.residentInfected - y); } }
const md = ds.reduce((a, b) => a + b, 0) / N, sd = Math.sqrt(ds.reduce((t, v) => t + (v - md) ** 2, 0) / (N - 1));
console.log(JSON.stringify({ every, G, emission: e, share: +(close / (close + room)).toFixed(3), residentsInfected: +(tot.none / N).toFixed(1), commonCut: +(100 * (1 - tot.common / tot.none)).toFixed(1), ci: +(100 * 1.96 * sd / Math.sqrt(N) / (tot.none / N)).toFixed(1), bothCut: +(100 * (1 - tot.both / tot.none)).toFixed(1) }));
