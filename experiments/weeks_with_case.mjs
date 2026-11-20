// Share of weeks in which the home has at least one reported resident infection, at three arrival rates, each refitted
// to the same residents infected and a 40% out-of-reach share (values from experiments/arrivals_refit.mjs).
import { anchoredConfig } from '../src/params.js';
import { evaluate } from './anchored.mjs';
for (const [every, G, e] of [[4, 1.255, 0.3625], [7, 1.17, 0.52], [14, 1.193, 0.676], [28, 1.2, 0.9]]) {
  const c = anchoredConfig(); c.importation.arrivalEveryDays = every; c.transmission.G = G; c.emission.median = e;
  const r0 = evaluate(c, 200, 1000, 1), rho = Math.min(1, 0.187 / r0.AR), r = evaluate(c, 200, 1000, rho);
  console.log(JSON.stringify({ every, trueAR: +r0.AR.toFixed(3), reportedShare: +rho.toFixed(2), weeksWithReportedCase: +r.w1.toFixed(2), weeksWith2: +r.w2.toFixed(2), staffAR: +r0.staffAR.toFixed(2), arrivalsShareOfStaffInfections: +((Math.floor(119 / every) + 1) / (r0.staffAR * 131)).toFixed(2) }));
}
