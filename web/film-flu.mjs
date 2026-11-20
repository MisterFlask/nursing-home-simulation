// The influenza figures for the film's last chapter: the two installations, over the same seeds, lamp
// placement and reporting draw as the page. Writes web/film.flu.json, which the build adds to the film's data.
//   node web/film-flu.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';

const dir = dirname(fileURLToPath(import.meta.url)), N_SEEDS = +(process.env.SEASONS || 200), SEED0 = 1000, M2_PER_LAMP = 23.2258;   // SEASONS=1000 checks the noise; the film uses 200, as the page does
const hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(undefined, 'flu'), sc = anchoredScenarios(base);
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];   // every room except the bedrooms
const place = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / M2_PER_LAMP))]));
const LAMPS = { common: place(COMMON), both: place([...COMMON, 'bedroom']) };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const ranges = { common: {}, both: {} };
for (const what of ['cautious', 'central', 'favourable']) {
  const cfg = sc[what], rho = sc.reportShare[what], out = { a: [], common: [], both: [] };
  for (let s = 0; s < N_SEEDS; s++) {
    const seed = SEED0 + s, world = buildWorld(cfg, seed);
    const run = (lamps) => runSeason(world, { lamps }).events.filter((e) => e.role === 'resident' && hash(seed * 100003 + e.person) < rho).length;
    out.a.push(run({})); out.common.push(run(LAMPS.common)); out.both.push(run(LAMPS.both));
  }
  for (const inst of ['common', 'both']) { const a = mean(out.a), b = mean(out[inst]); ranges[inst][what] = { a: +a.toFixed(2), b: +b.toFixed(2), cut: +((a - b) / a).toFixed(4) }; }
  console.log(what, 'share', cfg.transmission.closeShare, 'emission', +cfg.emission.median.toPrecision(3), 'k', cfg.lamp.susceptibility, '| without', mean(out.a).toFixed(2), 'common', mean(out.common).toFixed(2), 'both', mean(out.both).toFixed(2));
}
if (N_SEEDS === 200) writeFileSync(join(dir, 'film.flu.json'), JSON.stringify({ n: N_SEEDS, report: sc.reportShare, ranges }));
console.log(JSON.stringify(ranges));
