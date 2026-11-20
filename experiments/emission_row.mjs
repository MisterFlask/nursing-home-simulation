// One row of the COVID-19 fit table at a chosen virus output: node experiments/emission_row.mjs <emission q/h> <G> [seasons]
// Same rule as experiments/anchored_table.mjs, which holds 0.52.
import { base, evaluate } from './anchored.mjs';
const E = +process.argv[2], G = +process.argv[3], N = +(process.argv[4] || 400), every = +(process.argv[5] || 7), c = base({ social: 2, work: 5, prot: 0.5 }); c.emission.median = E; c.transmission.G = G; c.importation.arrivalEveryDays = every;   // [days between arrivals]
const t = Date.now(), r = evaluate(c, N, 410000);
console.log(JSON.stringify({ emission: E, closeShare: +r.share.toFixed(4), shareAll: +r.shareAll.toFixed(4), G, trueAR: +r.AR.toFixed(4), staffAR: +r.staffAR.toFixed(4), seconds: Math.round((Date.now() - t) / 1000) }));
