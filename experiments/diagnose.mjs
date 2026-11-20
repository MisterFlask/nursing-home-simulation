// Why is the model hard to fit? Test candidate structural causes one at a time.
// For each variant: infection arrives weekly (close to the published rate), virus output is
// re-scaled so the season infection rate matches the reported 18.7%, and we then look at the
// things that were NOT fitted, including two extra checks from the same CDC report:
// the share of weeks in which a home has at least one, and at least two, resident infections.
import { defaultConfig } from '../src/params.js';
import { buildWorld, runSeason } from '../src/engine.js';
import { segmentOutbreaks } from '../src/analysis.js';
const set = (o, p, v) => { const k = p.split('.'); let a = o; for (let i = 0; i < k.length - 1; i++) a = a[k[i]]; a[k[k.length - 1]] = v; };
const q = (a, f) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(f * s.length))] : NaN; };
function evaluate(c, n, seed0) {
  let res = 0, staff = 0, w1 = 0, w2 = 0, weeks = 0, close = 0, room = 0; const ob = [], dur = [], nRes = 112, nStaff = 131;
  for (let s = 0; s < n; s++) {
    const w = buildWorld(c, seed0 + s), r = runSeason(w, { lamps: {} }); res += r.totals.residentInfected; staff += r.totals.staffInfected;
    for (let k = 0; k + 7 <= c.days; k += 7) { let t = 0; for (let d = k; d < k + 7; d++) t += r.daily.newResident[d]; weeks++; if (t >= 1) w1++; if (t >= 2) w2++; }
    for (const e of r.events) { if (e.route === 'close') close++; else if (e.route === 'room') room++; }
    for (const o of segmentOutbreaks(w, r, { include: 'all' })) { ob.push(o.residentAR); dur.push(o.durationDays); }
  }
  return { AR: res / n / nRes, staffAR: staff / n / nStaff, w1: w1 / weeks, w2: w2 / weeks, share: close / (close + room), obMed: q(ob, 0.5), ob25: q(ob, 0.25), ob75: q(ob, 0.75), durMed: q(dur, 0.5), dur42: dur.filter((d) => d > 42).length / Math.max(1, dur.length) };
}
function variant(name, edits, { weekly = true } = {}) {
  const make = (em) => { const c = defaultConfig('covid'); if (weekly) { c.importation.arrivalEveryDays = 7; c.importation.visitorInfectiousProb = 0; } for (const [p, v] of edits) set(c, p, v); if (em) c.emission.median = em; return c; };
  let em = null;
  if (weekly) { let lo = 0.01, hi = 2; for (let i = 0; i < 7; i++) { em = Math.sqrt(lo * hi); if (evaluate(make(em), 150, 210000).AR > 0.187) hi = em; else lo = em; } }
  const r = evaluate(make(em), 400, 310000), P = (x) => (100 * x).toFixed(0) + '%';
  console.log(name.padEnd(46), 'output', (em || defaultConfig('covid').emission.median).toFixed(3).padStart(6), '| residents', P(r.AR), '| weeks with 1+', P(r.w1), '2+', P(r.w2), '| outbreak', P(r.obMed), `(${P(r.ob25)}-${P(r.ob75)})`, '| days', r.durMed.toFixed(0), 'over 42d', P(r.dur42), '| staff', P(r.staffAR), '| out of reach', r.share.toFixed(2));
}
console.log('REPORTED'.padEnd(46), 'output  0.520 | residents 19% | weeks with 1+ 15-26% 2+ 9-17% | outbreak 21% (5%-49%) | days ~57 over 42d 84% | staff 11%');
variant('current page fit (about 3 random arrivals)', [], { weekly: false });
variant('weekly arrivals, output refitted', []);
variant('+ less extreme spread in output (GSD 5)', [['emission.gsd', 5]]);
variant('+ immunity all-or-nothing (40% protected 75%)', [['immune.share.resident', 0.4], ['immune.share.staff', 0.4], ['immune.protection', 0.75], ['immune.protectionStaff', 0.75]]);
variant('+ slower, leakier outbreak response', [['control.outbreakMode.responseDelayDays', 4], ['control.outbreakMode.trigger', 2], ['control.maskCompliance', 0.5], ['control.residentIsolation.isolationDelayDays', 2]]);
variant('+ half of sick staff keep working', [['control.staffExclusion.staysHomeShare', 0.5]]);
variant('+ no outbreak response at all', [['control.outbreakMode.enabled', false]]);
variant('+ GSD 5 and all-or-nothing immunity', [['emission.gsd', 5], ['immune.share.resident', 0.4], ['immune.share.staff', 0.4], ['immune.protection', 0.75], ['immune.protectionStaff', 0.75]]);
