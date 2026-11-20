import { defaultConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { scenarios } from '../src/analysis.js';
const c = defaultConfig('covid'); c.importation.arrivalEveryDays = 7; c.importation.visitorInfectiousProb = 0;
const sc = scenarios(c), rooms = buildFacility(c.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby'];
const place = (t) => Object.fromEntries(rooms.filter((r) => t.includes(r.type)).map((r) => [r.id, Math.max(1, Math.min(6, Math.round(r.volume / 100)))]));
const arms = { common: place(COMMON), bedrooms: place(['bedroom']), both: place([...COMMON, 'bedroom']) }, N = 600;
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length, sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
for (const [name, cfg] of [['central', c], ['cautious', sc.cautious], ['favourable', sc.favourable]]) {
  const A = [], D = { common: [], bedrooms: [], both: [] }; let arr = 0;
  for (let s = 0; s < N; s++) { const w = buildWorld(cfg, 660000 + s), a = runSeason(w, { lamps: {} }); A.push(a.totals.residentInfected); arr += a.events.filter((e) => e.route === 'community').length;
    for (const k in arms) D[k].push(a.totals.residentInfected - runSeason(w, { lamps: arms[k] }).totals.residentInfected); }
  console.log(name, 'visitorProb', cfg.importation.visitorInfectiousProb, 'arrivals', (arr / N).toFixed(1), 'baseline', mean(A).toFixed(1), 'sd', sd(A).toFixed(1), 'zero', (A.filter((v) => !v).length / N).toFixed(2),
    Object.keys(arms).map((k) => `${k} ${mean(D[k]).toFixed(1)} ±${(1.96 * sd(D[k]) / Math.sqrt(N)).toFixed(1)} (${(100 * mean(D[k]) / mean(A)).toFixed(0)}%)`).join(' | '));
}
