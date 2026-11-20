// Does the lamp effect depend on how often infection arrives? Central settings, lamps in the common areas, everything
// else as on the page (the fit is NOT redone, so true infections move with the arrival rate).
//   node experiments/arrivals.mjs [covid|flu] [seasons]
import { anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
const ph = process.argv[2] || 'covid', N = +(process.argv[3] || 200);
const base = anchoredConfig(undefined, ph), rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const lamps = Object.fromEntries(rooms.filter((r) => COMMON.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
for (const every of [3, 5, 7, 10, 14, 21, 30]) {
  const c = anchoredConfig(undefined, ph); c.importation.arrivalEveryDays = every;
  let a = 0, b = 0, big = 0, zero = 0; const ds = [];
  for (let s = 0; s < N; s++) { const w = buildWorld(c, 1000 + s), x = runSeason(w, { lamps: {} }).totals.residentInfected, y = runSeason(w, { lamps }).totals.residentInfected; a += x; b += y; ds.push(x - y); if (x >= 10) big++; if (x === 0) zero++; }
  const md = (a - b) / N, sd = Math.sqrt(ds.reduce((t, v) => t + (v - md) ** 2, 0) / (N - 1));
  console.log(JSON.stringify({ every, arrivals: Math.floor((c.days - 1) / every) + 1, residentsInfected: +(a / N).toFixed(1), withLamps: +(b / N).toFixed(1), cut: +(100 * (a - b) / a).toFixed(1), ci: +(100 * 1.96 * sd / Math.sqrt(N) / (a / N)).toFixed(1), perArrival: +(a / N / (Math.floor((c.days - 1) / every) + 1)).toFixed(2), seasonsWith10: +(big / N).toFixed(2), seasonsWithNone: +(zero / N).toFixed(2) }));
}
