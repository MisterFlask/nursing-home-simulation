// Lamps angled down against lamps pointed straight across the room, for the page's installations.
// node experiments/aim.mjs [seasons]
import { anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';
const N = +(process.argv[2] || 200), hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const rooms = buildFacility(anchoredConfig().facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'lobby', 'kitchen', 'office'];
const place = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
const lamps = { common: place(COMMON), both: place([...COMMON, 'bedroom']) };
const count = (m) => Object.values(m).reduce((a, b) => a + b, 0);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const se = (a, b) => { const d = a.map((v, i) => v - b[i]), m = mean(d); return Math.sqrt(d.reduce((x, v) => x + (v - m) ** 2, 0) / (d.length - 1) / d.length); };
const cfg = (aim) => { const c = anchoredConfig(); c.lamp.aimAcross = aim; return anchoredScenarios(c); };
const down = cfg(0), across = cfg(1);
console.log('lamps: common', count(lamps.common), '| common and bedrooms', count(lamps.both));
for (const scen of ['cautious', 'central', 'favourable']) {
  const rho = down.reportShare[scen], out = { none: [], commonDown: [], commonAcross: [], bothDown: [], bothAcross: [] };
  for (let s = 0; s < N; s++) {
    const seed = 1000 + s, tally = (r) => r.events.filter((e) => e.role === 'resident' && hash(seed * 100003 + e.person) < rho).length;
    const wd = buildWorld(down[scen], seed), wa = buildWorld(across[scen], seed);
    out.none.push(tally(runSeason(wd, { lamps: {} })));
    out.commonDown.push(tally(runSeason(wd, { lamps: lamps.common }))); out.commonAcross.push(tally(runSeason(wa, { lamps: lamps.common })));
    out.bothDown.push(tally(runSeason(wd, { lamps: lamps.both }))); out.bothAcross.push(tally(runSeason(wa, { lamps: lamps.both })));
  }
  const m0 = mean(out.none), pc = (k) => (100 * (1 - mean(out[k]) / m0)).toFixed(1) + '%';
  console.log(scen.padEnd(10), 'none', m0.toFixed(2), '| common: down', pc('commonDown'), mean(out.commonDown).toFixed(2), 'across', pc('commonAcross'), mean(out.commonAcross).toFixed(2), '(across - down', (100 * (mean(out.commonDown) - mean(out.commonAcross)) / m0).toFixed(1), '±', (100 * se(out.commonDown, out.commonAcross) / m0).toFixed(1) + ')',
    '| both: down', pc('bothDown'), 'across', pc('bothAcross'), '(across - down', (100 * (mean(out.bothDown) - mean(out.bothAcross)) / m0).toFixed(1), '±', (100 * se(out.bothDown, out.bothAcross) / m0).toFixed(1) + ')');
}
