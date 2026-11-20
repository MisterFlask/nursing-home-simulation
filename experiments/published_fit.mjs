// Fit with published values held fixed (emission 0.52 quanta/h at rest, staff infected outside
// work 0.1% a day, visitors 0.6% infectious, and every other cited value). Two things move:
//   G  - close-range intensity (no published value), to set the out-of-reach share;
//   t  - a single dial, 0..1, that moves four judgment-based settings together from their
//        defaults to the end of their stated ranges that gives less spread:
//        care-work emission multiplier 10 -> 5, protection from past infection/vaccines 0.3 -> 0.5,
//        infectious period 5.5 -> 3.5 days, late-infection tail 0.1 -> 0.
import { defaultConfig } from '../src/params.js';
import { evalCfg } from './published.mjs';
export function cfgAt(G, t) {
  const c = defaultConfig('covid'), L = (a, b) => a + (b - a) * t;
  c.emission.median = 0.52; c.importation.staffDailyHazard = 0.001; c.importation.visitorInfectiousProb = 0.006;
  c.transmission.G = G; c.emission.activity.work = L(10, 5); c.immune.protection = c.immune.protectionStaff = L(0.3, 0.5);
  c.disease.infectious.mean = L(5.5, 3.5); c.disease.tailLevel = L(0.1, 0);
  return c;
}
if (process.argv[1].endsWith('published_fit.mjs')) {
  const mode = process.argv[2];
  if (mode === 'probe') for (const [G, t] of [[2.9, 1], [1, 1], [0.3, 1], [10, 1], [2.9, 1.5], [1, 1.5]]) { const r = evalCfg(cfgAt(G, t), 150); console.log('G', G, 't', t, 'AR', r.AR.toFixed(3), 'share', r.share.toFixed(2), 'obMed', r.obMed.toFixed(2), 'staff', r.staffAR.toFixed(2)); }
}
