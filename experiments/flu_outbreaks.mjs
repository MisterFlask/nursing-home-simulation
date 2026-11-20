// How large seasons get in the page's central influenza model: residents truly infected, no lamps.
// node experiments/flu_outbreaks.mjs [seasons]
import { anchoredConfig } from '../src/params.js';
import { buildWorld, runSeason } from '../src/engine.js';
const N = +(process.argv[2] || 600), c = anchoredConfig(undefined, 'flu'), v = [];
for (let s = 0; s < N; s++) v.push(runSeason(buildWorld(c, 1000 + s), { lamps: {} }).totals.residentInfected);
v.sort((a, b) => a - b); const med = (x) => x[Math.floor(x.length / 2)], big = v.filter((x) => x >= 11.2);
console.log(JSON.stringify({ seasons: N, mean: +(v.reduce((a, b) => a + b, 0) / N).toFixed(2), median: med(v), none: +(v.filter((x) => !x).length / N).toFixed(3), tenthOrMore: +(big.length / N).toFixed(3), medianAmongThose: +(med(big) / 112).toFixed(3) }));
