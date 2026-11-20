// Table behind the page's anchored fit: for a close-range intensity G, the out-of-reach share,
// the share of residents and staff truly infected in a season. 400 seasons per row.
import { base, evaluate } from './anchored.mjs';
const G = +process.argv[2], c = base({ social: 2, work: 5, prot: 0.5 }); c.transmission.G = G;
const r = evaluate(c, 400, 410000);
console.log(JSON.stringify({ closeShare: +r.share.toFixed(4), G, trueAR: +r.AR.toFixed(4), staffAR: +r.staffAR.toFixed(4) }));
