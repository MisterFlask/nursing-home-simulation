// Refit on the principle: hold well-validated numbers fixed, let poorly known ones move within
// their plausible ranges. Fixed: virus output 0.52 quanta/h at rest with the published spread,
// infection arriving once a week, CDC-reported resident infections (18.7% a season).
// Free: close-range intensity, how much residents speak, how loud care work is, protection from
// past infection and vaccines (up to 0.5), and the share of infections that get reported.
import { defaultConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
export const set = (o, p, v) => { const k = p.split('.'); let a = o; for (let i = 0; i < k.length - 1; i++) a = a[k[i]]; a[k[k.length - 1]] = v; };
const h = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
export function base(dark) {
  const c = defaultConfig('covid'); c.importation.arrivalEveryDays = 7; c.importation.visitorInfectiousProb = 0;
  c.emission.median = 0.52; c.emission.activity.social = dark.social; c.emission.activity.work = dark.work; c.immune.protection = c.immune.protectionStaff = dark.prot;
  for (const [p, v] of dark.extra || []) set(c, p, v);
  return c;
}
export function evaluate(c, n, seed0, rho = 1, lamps = null) {
  let res = 0, staff = 0, close = 0, room = 0, w1 = 0, w2 = 0, weeks = 0, averted = 0; const nW = Math.floor(c.days / 7), D = [];
  for (let s = 0; s < n; s++) {
    const w = buildWorld(c, seed0 + s), r = runSeason(w, { lamps: {} }), wk = new Array(nW).fill(0);
    res += r.totals.residentInfected; staff += r.totals.staffInfected;
    for (const e of r.events) { if (e.route === 'close') close++; else if (e.route === 'room') room++; if (e.role === 'resident' && h(s * 100003 + e.person) < rho) { const k = Math.floor(e.day / 7); if (k < nW) wk[k]++; } }
    for (const t of wk) { weeks++; if (t >= 1) w1++; if (t >= 2) w2++; }
    if (lamps) D.push(r.totals.residentInfected - runSeason(w, { lamps }).totals.residentInfected);
  }
  const m = D.length ? D.reduce((a, b) => a + b, 0) / D.length : 0, sd = D.length ? Math.sqrt(D.reduce((a, b) => a + (b - m) ** 2, 0) / (D.length - 1)) : 0;
  return { AR: res / n / 112, staffAR: staff / n / 131, share: close / (close + room), w1: w1 / weeks, w2: w2 / weeks, eff: m, ci: 1.96 * sd / Math.sqrt(D.length || 1), mean: res / n };
}
if (process.argv[1].endsWith('anchored.mjs')) {
  for (const dark of [{ social: 2, work: 5, prot: 0.5 }, { social: 1, work: 5, prot: 0.5 }, { social: 2, work: 5, prot: 0.4 }, { social: 3, work: 7, prot: 0.5 }]) {
    const r = evaluate(base(dark), 200, 210000);
    console.log(JSON.stringify(dark), 'true residents', (100 * r.AR).toFixed(0) + '%', '=> share reported needed', (0.187 / r.AR).toFixed(2), '| staff true', (100 * r.staffAR).toFixed(0) + '%', '=> staff reported share', (0.108 / r.staffAR).toFixed(2), '| out of reach', r.share.toFixed(2));
  }
}
