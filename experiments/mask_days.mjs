// Share of the season's days on which staff are masked (outbreak measures in force in at least one wing), page defaults, no lamps.
import { anchoredConfig } from '../src/params.js';
import { buildWorld, runSeason, SLOTS_PER_DAY } from '../src/engine.js';
const ph = process.argv[2] || 'covid', N = +(process.argv[3] || 100), cfg = anchoredConfig(undefined, ph), T = cfg.days * SLOTS_PER_DAY;
let on = 0, ep = 0, none = 0;
for (let s = 0; s < N; s++) {
  const r = runSeason(buildWorld(cfg, 1000 + s), {}, { overlay: true, replay: true, record: true });
  const o = (r.overrides || {}).outbreak; if (!o) { console.log('no outbreak overlay in result; keys:', Object.keys(r)); process.exit(1); }
  const flag = new Uint8Array(T); for (const e of o) for (let g = Math.max(0, e.from); g < Math.min(T, e.to); g++) flag[g] = 1;
  const k = flag.reduce((a, b) => a + b, 0); on += k / T; ep += o.length; if (!k) none++;
}
console.log(ph, 'seasons', N, '| share of the season with staff masked', (100 * on / N).toFixed(0) + '%', '| outbreak periods a season', (ep / N).toFixed(1), '| seasons with none', none);
