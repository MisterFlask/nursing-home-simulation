// COVID-19 fitted the way influenza is: for a close-range intensity G, the virus output (quanta per hour at rest) at which
// the model infects a target share of residents in a season, and the out-of-reach share that results. This drops
// "published virus output held fixed" so that high out-of-reach shares do not need most infections to go unreported.
// node experiments/covid_fit_emission.mjs <G> <target true attack rate> [seasons]
import { base, evaluate } from './anchored.mjs';
const G = +process.argv[2], target = +process.argv[3], N = +(process.argv[4] || 200), every = +(process.argv[5] || 7);   // [days between arrivals]
const at = (e) => { const c = base({ social: 2, work: 5, prot: 0.5 }); c.emission.median = e; c.transmission.G = G; c.importation.arrivalEveryDays = every; return evaluate(c, N, 410000); };
let lo = Math.log(0.01), hi = Math.log(3), r = null;
for (let i = 0; i < 10; i++) { const mid = (lo + hi) / 2; r = at(Math.exp(mid)); if (r.AR > target) hi = mid; else lo = mid; if (Math.abs(r.AR - target) < 0.004) { lo = hi = mid; break; } }
const e = Math.exp((lo + hi) / 2);
console.log(JSON.stringify({ closeShare: +r.share.toFixed(4), G, emissionMedian: +e.toPrecision(3), trueAR: +r.AR.toFixed(4), staffAR: +r.staffAR.toFixed(4) }));
