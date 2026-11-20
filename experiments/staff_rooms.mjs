// What lamps in the two staff-only rooms left out of "common areas" (kitchen, office) add.
// node experiments/staff_rooms.mjs [seasons]
import { anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';
const N = +(process.argv[2] || 200), hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(), sc = anchoredScenarios(base), rho = sc.reportShare.central;
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby'];
const place = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
const arms = { none: {}, common: place(COMMON), plus: place([...COMMON, 'kitchen', 'office']), only: place(['kitchen', 'office']) };
const tot = {}, staff = {}, where = {}, whereStaff = {}; let nEv = 0, nStaffEv = 0;
for (const k in arms) { tot[k] = 0; staff[k] = 0; }
for (let s = 0; s < N; s++) {
  const seed = 1000 + s, world = buildWorld(sc.central, seed);
  for (const k in arms) {
    const r = runSeason(world, { lamps: arms[k] });
    tot[k] += r.events.filter((e) => e.role === 'resident' && hash(seed * 100003 + e.person) < rho).length;
    staff[k] += r.events.filter((e) => e.role !== 'resident' && e.source !== 'outside' && e.route !== 'import').length;
    if (k === 'none') for (const e of r.events) { const t = (e.roomId || '?').replace(/-.*$/, '') + ' / ' + e.route; if (e.role === 'resident') { where[t] = (where[t] || 0) + 1; nEv++; } else { whereStaff[t] = (whereStaff[t] || 0) + 1; nStaffEv++; } }
  }
}
const lamps = (m) => Object.values(m).reduce((a, b) => a + b, 0);
for (const k in arms) console.log(k.padEnd(7), 'lamps', String(lamps(arms[k])).padStart(3), '| reported resident infections', (tot[k] / N).toFixed(2), k === 'none' ? '' : '(' + (100 * (1 - tot[k] / tot.none)).toFixed(1) + '% fewer)', '| staff infections', (staff[k] / N).toFixed(2), k === 'none' ? '' : '(' + (100 * (1 - staff[k] / staff.none)).toFixed(1) + '% fewer)');
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + (100 * v / n).toFixed(1) + '%').join(', ');
console.log('resident infections by room/route, no lamps:', top(where, nEv));
console.log('staff infections by room/route, no lamps:', top(whereStaff, nStaffEv));
