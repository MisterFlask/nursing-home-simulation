// Where do the caps on lamp air cleaning bind? Per room type at the page's density, for each scenario.
// node experiments/caps_check.mjs [covid|flu]
import { anchoredConfig } from '../src/params.js';
import { buildFacility, lampCadrFor, wallLampAt } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';
const ph = process.argv[2] || 'covid';
const base = anchoredConfig(undefined, ph), sc = anchoredScenarios(base);
for (const name of ['cautious', 'central', 'favourable']) {
  const cfg = sc[name].config || sc[name];
  const L = cfg.lamp; console.log(`\n${ph} ${name}: k ${L.susceptibility}  delivered ${L.realWorldFactor}  path x${L.pathFactor}  cap ${L.maxEach} / bedroom ${L.maxEachBedroom}  output ${L.outputMw}`);
  const rooms = buildFacility(cfg.facility).filter((r) => r.type !== 'outside');
  const seen = {};
  for (const r of rooms) {
    const key = `${r.type} ${r.area.toFixed(0)}m2 h${r.height}`; if (seen[key]) { seen[key].count++; continue; }
    const n = Math.max(1, Math.round(r.area / 23.2258)), raw = n * lampCadrFor(cfg, r) / r.volume, cap = r.type === 'bedroom' ? L.maxEachBedroom : L.maxEach;
    const w = wallLampAt(L.wall, r.area, r.height);
    seen[key] = { count: 1, n, raw, cap, fl: raw / (3.6 * L.susceptibility), share: w.share, path: w.path };
  }
  for (const [k, v] of Object.entries(seen)) console.log(`  ${k.padEnd(26)} x${String(v.count).padStart(2)}  lamps ${v.n}  share ${v.share.toFixed(2)} path ${v.path.toFixed(1)}  fluence ${v.fl.toFixed(2)} uW/cm2  ach ${v.raw.toFixed(1)}  cap ${v.cap}  ${v.raw > v.cap ? 'CAPPED' : ''}`);
}
