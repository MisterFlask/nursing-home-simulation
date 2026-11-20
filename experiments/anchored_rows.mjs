import { PARAMS } from '../src/params.js';
import { buildFacility } from '../src/engine.js';
import { SCENARIO_LAMP_PATHS } from '../src/analysis.js';
import { base, evaluate, set } from './anchored.mjs';
const DARK = { social: 2, work: 5, prot: 0.5 };
const rooms = buildFacility(base(DARK).facility).filter((r) => r.type !== 'outside'), COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby'];
const lamps = Object.fromEntries(rooms.filter((r) => COMMON.includes(r.type)).map((r) => [r.id, Math.max(1, Math.min(6, Math.round(r.volume / 100)))]));
const P = (x) => (100 * x).toFixed(0) + '%';
function row(share, lampEnd, extra, label) {
  const mk = (G) => { const c = base({ ...DARK, extra }); c.transmission.G = G; if (lampEnd) for (const p of SCENARIO_LAMP_PATHS) set(c, p, PARAMS.find((x) => x.path === p)[lampEnd]); return c; };
  let G = 2.9;
  if (share != null) { let lo = 0.02, hi = 400; for (let i = 0; i < 9; i++) { G = Math.sqrt(lo * hi); if (evaluate(mk(G), 120, 210000).share > share) hi = G; else lo = G; } }
  const t = evaluate(mk(G), 300, 410000), rho = Math.min(1, 0.187 / t.AR), r = evaluate(mk(G), 500, 310000, rho, lamps);
  console.log((label || 'share ' + share).padEnd(34), 'G', G.toFixed(2).padStart(6), '| out of reach', r.share.toFixed(2), '| residents true', P(r.AR), 'reported share', rho.toFixed(2), '| staff true', P(r.staffAR), 'reported share', (0.108 / r.staffAR).toFixed(2), '| weeks 1+', P(r.w1), '2+', P(r.w2), '| lamps:', (r.eff * rho).toFixed(2), '±', (r.ci * rho).toFixed(2), 'reported infections fewer', `(${P(r.eff / r.mean)})`, 'of', (r.mean * rho).toFixed(1));
}
const part = process.argv[2];
if (part === 'a') { row(0.1); row(0.24); row(0.4); row(0.24, 'high', [], 'FAVOURABLE 0.24, lamps high'); }
if (part === 'b') { row(0.55); row(0.7); row(0.86); row(0.86, 'low', [], 'CAUTIOUS 0.86, lamps low'); }
if (part === 'c') { row(null, null, [], 'central G 2.9 as is'); row(null, null, [['staff.careMinutes', 5], ['staff.medpassMinutes', 1.5]], 'half the hands-on care time'); }
