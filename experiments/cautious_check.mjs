// What the cautious case assumes, and what a more cautious one would give: the out-of-reach share above the
// fit's 0.55, with the low end of the lamp-side evidence. Reported resident infections, paired seasons.
//   node experiments/cautious_check.mjs <share> <low|central> <common|both> [seasons]
import { PARAMS, anchoredConfig, anchoredAt, paramRange, getPath, setPath, lampCadrAt } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { SCENARIO_LAMP_PATHS } from '../src/analysis.js';
const [share, end, where, nArg] = process.argv.slice(2), n = +(nArg || 300);
const hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const c = anchoredConfig(+share), rho = anchoredAt(+share).reportShare;
if (end !== 'central') for (const p of SCENARIO_LAMP_PATHS) { const meta = PARAMS.find((x) => x.path === p); if (meta && getPath(c, p) != null) setPath(c, p, paramRange(meta, 'covid')[end]); }
c.lamp.ecadr = lampCadrAt(c.lamp, 2.4);
const rooms = buildFacility(c.facility).filter((r) => r.type !== 'outside'), COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const lamps = Object.fromEntries(rooms.filter((r) => (where === 'both' ? [...COMMON, 'bedroom'] : COMMON).includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
let a = 0, b = 0, d2 = 0; const ds = [];
for (let s = 0; s < n; s++) {
  const seed = 1000 + s, w = buildWorld(c, seed), rep = (res) => res.events.filter((e) => e.role === 'resident' && hash(seed * 100003 + e.person) < rho).length;
  const x = rep(runSeason(w, { lamps: {} })), y = rep(runSeason(w, { lamps })); a += x; b += y; ds.push(x - y);
}
const md = (a - b) / n, sd = Math.sqrt(ds.reduce((t, v) => t + (v - md) ** 2, 0) / (n - 1)), ci = 1.96 * sd / Math.sqrt(n);
console.log(JSON.stringify({ share: +share, lampSide: end, where, lamps: Object.values(lamps).reduce((x, y) => x + y, 0), perLamp24: Math.round(c.lamp.ecadr), k: c.lamp.susceptibility, delivered: c.lamp.realWorldFactor, path: c.lamp.pathFactor, reported: +rho.toFixed(2),
  without: +(a / n).toFixed(1), with: +(b / n).toFixed(1), cut: +(100 * (a - b) / a).toFixed(1), ci: +(100 * ci / (a / n)).toFixed(1) }));
