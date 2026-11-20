// Weeks with a reported resident case in the page's default model, for comparison with CDC's weekly figures.
import { anchoredConfig, anchoredAt } from '../src/params.js';
import { evaluate } from './anchored.mjs';
for (const share of [0.25, 0.4, 0.55]) { const c = anchoredConfig(share), rho = anchoredAt(share).reportShare, r = evaluate(c, 300, 1000, rho);
  console.log(JSON.stringify({ share, every: c.importation.arrivalEveryDays, trueAR: +r.AR.toFixed(3), reported: +rho.toFixed(2), weeksWithCase: +r.w1.toFixed(3), weeksWith2: +r.w2.toFixed(3), staffAR: +r.staffAR.toFixed(2) })); }
