// One row of the influenza fit: for a close-range intensity G, the virus output (quanta per hour at rest, median)
// at which the model infects the target share of residents in a season, and the out-of-reach share that results.
// node experiments/flu_fit.mjs <G> <target true attack rate> <days between staff arrivals> <protection> [seasons] [key=value ...]
import { defaultConfig } from '../src/params.js';
import { evaluate, set } from './anchored.mjs';
const [G, target, every, prot] = process.argv.slice(2, 6).map(Number), N = +(process.argv[6] || 400), extra = process.argv.slice(7).map((s) => s.split('='));
export function fluBase(e, G, every, prot, extra = []) {
  const c = defaultConfig('flu'); c.importation.arrivalEveryDays = every; c.importation.visitorInfectiousProb = 0;
  c.emission.median = e; c.emission.activity.social = 2; c.emission.activity.work = 5; c.immune.protection = c.immune.protectionStaff = prot; c.transmission.G = G;
  for (const [p, v] of extra) set(c, p, +v);
  return c;
}
if (process.argv[1].endsWith('flu_fit.mjs')) {
  const at = (e) => evaluate(fluBase(e, G, every, prot, extra), N, 610000);
  let lo = Math.log(0.01), hi = Math.log(30), r = null;
  for (let i = 0; i < 13; i++) { const mid = (lo + hi) / 2; r = at(Math.exp(mid)); if (r.AR > target) hi = mid; else lo = mid; if (Math.abs(r.AR - target) < 0.0012) { lo = hi = mid; break; } }
  const e = Math.exp((lo + hi) / 2); r = at(e);
  console.log(JSON.stringify({ closeShare: +r.share.toFixed(4), G, emissionMedian: +e.toPrecision(3), trueAR: +r.AR.toFixed(4), staffAR: +r.staffAR.toFixed(4), weeksWithCase: +r.w1.toFixed(3) }));
}
