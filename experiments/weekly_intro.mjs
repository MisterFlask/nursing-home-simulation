// Experiment: replace random importation with a fixed schedule
// (one staff member arrives newly infected every `every` days).
import { defaultConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { segmentOutbreaks } from '../src/analysis.js';
const N = +process.argv[2] || 600;
const base = defaultConfig('covid');
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby'];
const lamps = Object.fromEntries(rooms.filter((r) => COMMON.includes(r.type)).map((r) => [r.id, Math.max(1, Math.min(6, Math.round(r.volume / 100)))]));
const h = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const q = (a, f) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(f * s.length))]; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };

function run(label, { every = 0, emissionScale = 1, offset = 3 }, n = N, quiet = false) {
  const c = defaultConfig('covid');
  c.emission.median *= emissionScale;
  if (every) { c.importation.staffDailyHazard = 0; c.importation.visitorInfectiousProb = 0; }
  const A = [], B = [], D = [], month = [], obAR = [], obDur = []; let close = 0, room = 0, nRes = 112;
  for (let s = 0; s < n; s++) {
    const w = buildWorld(c, 770000 + s), staff = w.people.map((p, i) => (p.role !== 'resident' ? i : -1)).filter((i) => i >= 0);
    nRes = w.people.length - staff.length;
    const intro = []; if (every) for (let d = offset, k = 0; d < c.days; d += every, k++) intro.push({ person: staff[Math.floor(h(s * 1000 + k) * staff.length)], day: d });
    const a = runSeason(w, { lamps: {} }, { introductions: intro }), b = runSeason(w, { lamps }, { introductions: intro });
    A.push(a.totals.residentInfected); B.push(b.totals.residentInfected); D.push(a.totals.residentInfected - b.totals.residentInfected);
    for (let m = 0; m < 4; m++) { let t = 0; for (let d = m * 30; d < m * 30 + 30; d++) t += a.daily.newResident[d]; month.push(t); }
    for (const e of a.events) { if (e.route === 'close') close++; else if (e.route === 'room') room++; }
    for (const o of segmentOutbreaks(w, a, { include: 'all' })) { obAR.push(o.residentAR); obDur.push(o.durationDays); }
  }
  const eff = mean(D), se = sd(D) / Math.sqrt(n), pooled = Math.sqrt((sd(A) ** 2 + sd(B) ** 2) / 2);
  const out = { label, attack: mean(A) / nRes, meanA: mean(A), sdA: sd(A), cv: sd(A) / mean(A), zero: A.filter((v) => v === 0).length / n, p10: q(A, 0.1), med: q(A, 0.5), p90: q(A, 0.9),
    monthMean: mean(month), monthSd: sd(month), obPerSeason: obAR.length / n, obMedAR: obAR.length ? q(obAR, 0.5) : NaN, obMedDur: obDur.length ? q(obDur, 0.5) : NaN, closeShare: close / (close + room),
    eff, lo: eff - 1.96 * se, hi: eff + 1.96 * se, rel: eff / mean(A), homes: eff > 0 ? Math.ceil(2 * (1.96 + 0.8416) ** 2 * pooled ** 2 / eff ** 2) : Infinity };
  if (!quiet) console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? +v.toPrecision(3) : v)));
  return out;
}
run('random arrivals (current model)', {});
run('fixed, every 40 days (same number of arrivals as now)', { every: 40, offset: 13 });
run('fixed, every 7 days, emission unchanged', { every: 7 });
// Refit emission so the weekly-arrival model reproduces the reported 18.7% season attack rate.
let lo = 0.05, hi = 1, sc = 0.3;
for (let i = 0; i < 9; i++) { sc = Math.sqrt(lo * hi); const r = run('', { every: 7, emissionScale: sc }, 250, true); if (r.attack > 0.187) hi = sc; else lo = sc; }
console.log('refit emission scale', sc.toFixed(3), 'emission', (base.emission.median * sc).toFixed(4));
run('fixed, every 7 days, emission refitted to 18.7%', { every: 7, emissionScale: sc });
