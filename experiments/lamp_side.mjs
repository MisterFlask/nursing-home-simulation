// Which of the lamp-side inputs moves the result: each one alone at its low and high end, the rest central.
// Common areas, central split. node experiments/lamp_side.mjs [seasons]
import { anchoredConfig, mergeConfig, PARAMS, paramRange } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios, SCENARIO_LAMP_PATHS } from '../src/analysis.js';
const N = +(process.argv[2] || 200), hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(), rho = anchoredScenarios(base).reportShare.central;
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const lamps = Object.fromEntries(rooms.filter((r) => COMMON.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
const setPath = (o, p, v) => { const k = p.split('.'); let x = o; for (let i = 0; i < k.length - 1; i++) x = x[k[i]]; x[k[k.length - 1]] = v; };
const cases = [['central', []]];
for (const p of ['lamp.susceptibility', 'lamp.realWorldFactor', 'lamp.pathFactor']) { const r = paramRange(PARAMS.find((x) => x.path === p), 'covid'); cases.push([`${p} ${r.low}`, [[p, r.low]]], [`${p} ${r.high}`, [[p, r.high]]]); }
for (const end of ['low', 'high']) cases.push([`caps ${end}`, ['lamp.maxEach', 'lamp.maxEachBedroom'].map((p) => [p, paramRange(PARAMS.find((x) => x.path === p), 'covid')[end]])]);
for (const end of ['low', 'high']) cases.push([`all five ${end}`, SCENARIO_LAMP_PATHS.map((p) => [p, paramRange(PARAMS.find((x) => x.path === p), 'covid')[end]])]);
const run = (cfg, l) => { let t = 0; for (let s = 0; s < N; s++) { const seed = 1000 + s, w = buildWorld(cfg, seed); for (const e of runSeason(w, { lamps: l }).events) if (e.role === 'resident' && hash(seed * 100003 + e.person) < rho) t++; } return t / N; };
const none = run(base, {});
for (const [name, sets] of cases) { const c = mergeConfig(base, {}); for (const [p, v] of sets) setPath(c, p, v); const b = run(c, lamps); console.log(name.padEnd(30), 'with lamps', b.toFixed(2), '|', (100 * (1 - b / none)).toFixed(1) + '% fewer'); }
