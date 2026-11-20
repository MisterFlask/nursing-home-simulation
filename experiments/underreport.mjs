// If only 1 in u infections is reported (residents and staff alike), do published values fit?
// True infections are simulated; each is then "reported" with probability 1/u, and the reported
// figures are compared with what nursing homes report. Virus output is re-scaled so that
// REPORTED resident infections match 18.7%.
import { defaultConfig } from '../src/params.js';
import { buildWorld, runSeason } from '../src/engine.js';
const set = (o, p, v) => { const k = p.split('.'); let a = o; for (let i = 0; i < k.length - 1; i++) a = a[k[i]]; a[k[k.length - 1]] = v; };
const h = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
function evaluate(c, u, n, seed0) {
  let res = 0, resTrue = 0, staff = 0, staffTrue = 0, w1 = 0, w2 = 0, weeks = 0; const nW = Math.floor(c.days / 7);
  for (let s = 0; s < n; s++) {
    const w = buildWorld(c, seed0 + s), r = runSeason(w, { lamps: {} }), wk = new Array(nW).fill(0);
    for (const e of r.events) { const rep = h(s * 100003 + e.person) < 1 / u, st = e.role !== 'resident';
      if (st) { staffTrue++; if (rep) staff++; } else { resTrue++; if (rep) { res++; const k = Math.floor(e.day / 7); if (k < nW) wk[k]++; } } }
    for (const t of wk) { weeks++; if (t >= 1) w1++; if (t >= 2) w2++; }
  }
  return { rep: res / n / 112, tru: resTrue / n / 112, staffRep: staff / n / 131, staffTrue: staffTrue / n / 131, w1: w1 / weeks, w2: w2 / weeks };
}
function run(name, u, edits) {
  const make = (em) => { const c = defaultConfig('covid'); c.importation.arrivalEveryDays = 7; c.importation.visitorInfectiousProb = 0; for (const [p, v] of edits) set(c, p, v); c.emission.median = em; return c; };
  let lo = 0.02, hi = 4, em; for (let i = 0; i < 7; i++) { em = Math.sqrt(lo * hi); if (evaluate(make(em), u, 150, 210000).rep > 0.187) hi = em; else lo = em; }
  const r = evaluate(make(em), u, 400, 310000), P = (x) => (100 * x).toFixed(0) + '%';
  console.log(name.padEnd(40), 'u', u, '| output', em.toFixed(2), '| residents reported', P(r.rep), 'true', P(r.tru), '| staff reported', P(r.staffRep), 'true', P(r.staffTrue), '| weeks 1+', P(r.w1), '2+', P(r.w2));
}
console.log('REPORTED / PUBLISHED'.padEnd(40), '    | output 0.52 | residents reported 19%          | staff reported 11%          | weeks 1+ 15-26% 2+ 9-17%');
const quiet = [['emission.activity.social', 1], ['emission.activity.work', 5]];
for (const u of [1, 1.5, 2, 2.5, 3]) run('speech and care work as now', u, []);
for (const u of [1.5, 2, 2.5]) run('quieter residents and care work', u, quiet);
