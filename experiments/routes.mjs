// Where residents' infections come from (room air or face to face), with and without lamps, and what drives the
// range: the out-of-reach share alone, the lamp-side assumptions alone, and both together.
// node experiments/routes.mjs [seasons]
import { anchoredConfig, anchoredAt, mergeConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';
const N = +(process.argv[2] || 200), hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(), sc = anchoredScenarios(base);
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const place = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
const LAMPS = { none: {}, common: place(COMMON), both: place([...COMMON, 'bedroom']) };
// lamp-side ends at the central share, and share ends with central lamps
const lampOnly = (end) => { const c = mergeConfig(sc[end], {}); c.transmission.closeShare = base.transmission.closeShare; c.transmission.G = base.transmission.G; return c; };
const cases = {
  central: [sc.central, sc.reportShare.central], cautious: [sc.cautious, sc.reportShare.cautious], favourable: [sc.favourable, sc.reportShare.favourable],
  'share 0.55, central lamps': [anchoredConfig(0.55), anchoredAt(0.55).reportShare], 'share 0.25, central lamps': [anchoredConfig(0.25), anchoredAt(0.25).reportShare],
  'share 0.40, weak lamps': [lampOnly('cautious'), sc.reportShare.central], 'share 0.40, strong lamps': [lampOnly('favourable'), sc.reportShare.central],
};
for (const [name, [cfg, rho]] of Object.entries(cases)) {
  const sum = {}; for (const k in LAMPS) sum[k] = { room: 0, close: 0 };
  for (let s = 0; s < N; s++) { const seed = 1000 + s, world = buildWorld(cfg, seed);
    for (const k in LAMPS) for (const e of runSeason(world, { lamps: LAMPS[k] }).events) if (e.role === 'resident' && hash(seed * 100003 + e.person) < rho) sum[k][e.route === 'room' ? 'room' : 'close']++; }
  const f = (k) => { const a = sum[k].room / N, b = sum[k].close / N; return `air ${a.toFixed(2)} + face ${b.toFixed(2)} = ${(a + b).toFixed(2)}`; }, tot = (k) => sum[k].room + sum[k].close;
  console.log(name.padEnd(26), '| none:', f('none'), `(face ${(100 * sum.none.close / tot('none')).toFixed(0)}%)`, '| common:', f('common'), `(-${(100 * (1 - tot('common') / tot('none'))).toFixed(1)}%; air -${(100 * (1 - sum.common.room / sum.none.room)).toFixed(0)}%, face -${(100 * (1 - sum.common.close / sum.none.close)).toFixed(0)}%)`, '| both:', f('both'), `(-${(100 * (1 - tot('both') / tot('none'))).toFixed(1)}%; air -${(100 * (1 - sum.both.room / sum.none.room)).toFixed(0)}%, face -${(100 * (1 - sum.both.close / sum.none.close)).toFixed(0)}%)`);
}
