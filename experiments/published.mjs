// What does the model do when emission and importation are set to published estimates,
// and which judgment-based settings could reconcile it with reported infection rates?
import { defaultConfig } from '../src/params.js';
import { buildWorld, runSeason } from '../src/engine.js';
import { segmentOutbreaks } from '../src/analysis.js';
const N = +process.argv[2] || 200;
const set = (o, p, v) => { const k = p.split('.'); let a = o; for (let i = 0; i < k.length - 1; i++) a = a[k[i]]; a[k[k.length - 1]] = v; };
const q = (a, f) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(f * s.length))] : NaN; };
export function evalCfg(c, n = N, seed0 = 550000) {
  let res = 0, staff = 0, close = 0, room = 0, nRes = 112, nStaff = 131; const ob = [], dur = [];
  for (let s = 0; s < n; s++) { const w = buildWorld(c, seed0 + s), r = runSeason(w, { lamps: {} }); res += r.totals.residentInfected; staff += r.totals.staffInfected;
    for (const e of r.events) { if (e.route === 'close') close++; else if (e.route === 'room') room++; }
    for (const o of segmentOutbreaks(w, r, { include: 'all' })) { ob.push(o.residentAR); dur.push(o.durationDays); } }
  return { AR: res / n / nRes, staffAR: staff / n / nStaff, share: close / (close + room), obMed: q(ob, 0.5), obDur: q(dur, 0.5) };
}
const pub = () => { const c = defaultConfig('covid'); set(c, 'emission.median', 0.52); set(c, 'importation.staffDailyHazard', 0.001); set(c, 'importation.visitorInfectiousProb', 0.006); return c; };
const show = (name, c) => { const r = evalCfg(c); console.log(name.padEnd(58), 'residents', (100 * r.AR).toFixed(0) + '%', 'staff', (100 * r.staffAR).toFixed(0) + '%', 'out-of-reach share', r.share.toFixed(2), 'outbreak median', (100 * r.obMed).toFixed(0) + '%', 'dur', r.obDur.toFixed(0)); return r; };
if (process.argv[1].endsWith('published.mjs')) {
  show('current fitted model', defaultConfig('covid'));
  show('published emission 0.52 + published arrivals 0.1%/day', pub());
  const v = (name, edits) => { const c = pub(); for (const [p, x] of edits) set(c, p, x); show('  + ' + name, c); };
  v('close-range intensity 1 (was 2.9)', [['transmission.G', 1]]);
  v('care-work emission x5 not x10', [['emission.activity.work', 5]]);
  v('immunity protection 0.5 (was 0.3)', [['immune.protection', 0.5], ['immune.protectionStaff', 0.5]]);
  v('fast loss of infectivity in air (7/h)', [['air.decay', 7]]);
  v('shorter infectious period 3.5 d, no tail', [['disease.infectious.mean', 3.5], ['disease.tailLevel', 0], ['disease.peakDays', 0]]);
  v('ventilation at design values (x2)', [['ventilation.scale', 2]]);
  v('staff always masked (surgical)', [['control.staffMask', 'surgical']]);
  v('all of the above except masks', [['transmission.G', 1], ['emission.activity.work', 5], ['immune.protection', 0.5], ['immune.protectionStaff', 0.5], ['air.decay', 7], ['disease.infectious.mean', 3.5], ['disease.tailLevel', 0], ['disease.peakDays', 0], ['ventilation.scale', 2]]);
}
