// What the model gives for influenza when treated the way the COVID fit is: published emission, weekly arrivals.
// node experiments/flu_explore.mjs "<emission,G,arrivalDays,protection> ..." [seasons]
import { defaultConfig } from '../src/params.js';
import { evaluate } from './anchored.mjs';
const N = +(process.argv[3] || 150);
for (const spec of process.argv[2].split(' ')) {
  const [e, G, every, prot] = spec.split(',').map(Number);
  const c = defaultConfig('flu'); c.importation.arrivalEveryDays = every; c.importation.visitorInfectiousProb = 0;
  c.emission.median = e; c.emission.activity.social = 2; c.emission.activity.work = 5; c.immune.protection = c.immune.protectionStaff = prot; c.transmission.G = G;
  const t = Date.now(), r = evaluate(c, N, 510000);
  console.log(`emission ${e} G ${G} arrival/${every}d prot ${prot} | residents truly infected ${(100 * r.AR).toFixed(1)}% staff ${(100 * r.staffAR).toFixed(1)}% | out of reach ${(100 * r.share).toFixed(0)}% | weeks with >=1 resident case ${(100 * r.w1).toFixed(0)}% | ${((Date.now() - t) / 1000).toFixed(0)} s`);
}
