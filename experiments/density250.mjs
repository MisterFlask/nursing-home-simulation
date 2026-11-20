// Share 0.55 (G 2.67 from anchored_rows b), lamps at one per 250 sq ft (23.2258 m2) of floor.
import { PARAMS } from '../src/params.js';
import { buildFacility } from '../src/engine.js';
import { SCENARIO_LAMP_PATHS } from '../src/analysis.js';
import { base, evaluate, set } from './anchored.mjs';
const DARK = { social: 2, work: 5, prot: 0.5 };
const rooms = buildFacility(base(DARK).facility).filter((r) => r.type !== 'outside'), COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby'];
const place = (types, f) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, f(r)]));
const n250 = (r) => Math.max(1, Math.round(r.area / 23.2258)), n100 = (r) => Math.max(1, Math.min(6, Math.round(r.volume / 100)));
const mk = (end) => { const c = base(DARK); c.transmission.G = 2.67; if (end) for (const p of SCENARIO_LAMP_PATHS) set(c, p, PARAMS.find((x) => x.path === p)[end]); return c; };
const [end, where] = process.argv.slice(2);
const lamps = where === 'old' ? place(COMMON, n100) : place(where === 'both' ? [...COMMON, 'bedroom'] : COMMON, n250);
const c = mk(end === 'central' ? null : end);
const t = evaluate(c, 300, 410000), rho = Math.min(1, 0.187 / t.AR), r = evaluate(c, 500, 310000, rho, lamps);
console.log(end, where, Object.values(lamps).reduce((a, b) => a + b, 0), 'lamps | share', r.share.toFixed(2), 'true AR', (100 * r.AR).toFixed(0) + '%', 'rho', rho.toFixed(2), '| reported fewer', (r.eff * rho).toFixed(2), '±', (r.ci * rho).toFixed(2), 'of', (r.mean * rho).toFixed(1), `(${(100 * r.eff / r.mean).toFixed(1)}% ± ${(100 * r.ci / r.mean).toFixed(1)})`);
