import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { evalCfg } from './published.mjs';
import { cfgAt } from './published_fit.mjs';
const f = (r) => `AR ${(100 * r.AR).toFixed(1)}% share ${r.share.toFixed(2)} outbreak median ${(100 * r.obMed).toFixed(0)}% staff ${(100 * r.staffAR).toFixed(0)}%`;
// 1. Published emission and arrivals, judgment levers at the ends of their ranges: which G gives the reported rate?
let lo = 0.2, hi = 1.2, G = 0.5; for (let i = 0; i < 5; i++) { G = Math.sqrt(lo * hi); const r = evalCfg(cfgAt(G, 1), 200); if (r.AR > 0.187) hi = G; else lo = G; }
const c = cfgAt(G, 1); console.log('fit: G', G.toFixed(2), f(evalCfg(c, 400, 440000)));
// lamp effect there, common areas
const rooms = buildFacility(c.facility).filter((r) => r.type !== 'outside'), COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby'];
const lamps = Object.fromEntries(rooms.filter((r) => COMMON.includes(r.type)).map((r) => [r.id, Math.max(1, Math.min(6, Math.round(r.volume / 100)))]));
const D = [], A = []; for (let s = 0; s < 500; s++) { const w = buildWorld(c, 330000 + s), a = runSeason(w, { lamps: {} }).totals.residentInfected; A.push(a); D.push(a - runSeason(w, { lamps }).totals.residentInfected); }
const m = (x) => x.reduce((p, q) => p + q, 0) / x.length, sd = Math.sqrt(D.reduce((p, q) => p + (q - m(D)) ** 2, 0) / (D.length - 1));
console.log('common-area lamps: baseline', m(A).toFixed(1), 'averted', m(D).toFixed(2), '±', (1.96 * sd / Math.sqrt(D.length)).toFixed(2), `(${(100 * m(D) / m(A)).toFixed(0)}%)`, 'zero seasons', (A.filter((v) => !v).length / A.length).toFixed(2), 'median', [...A].sort((x, y) => x - y)[250]);
// 2. No judgment levers moved at all: lowest reachable rate (close range switched off)
console.log('t=0, G=0   :', f(evalCfg(cfgAt(0, 0), 200)));
// 3. Fast loss of infectivity in air (upper published end) as the reconciling lever
for (const [g, t] of [[1, 1], [2, 1], [1, 0.5]]) { const k = cfgAt(g, t); k.air.decay = 7; console.log(`decay 7/h, G ${g}, t ${t}:`, f(evalCfg(k, 200))); }
