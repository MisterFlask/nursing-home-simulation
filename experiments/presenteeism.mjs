// Presenteeism in the default winter: of the days infected staff are infectious, on what share are they excluded from work?
import { anchoredConfig } from '../src/params.js';
import { buildWorld, runSeason, SLOTS_PER_DAY } from '../src/engine.js';
const ph = process.argv[2] || 'covid', N = +(process.argv[3] || 100), cfg = anchoredConfig(undefined, ph);
let first = true, inf = 0, out = 0, pre = 0, n = 0, nSym = 0, nEx = 0;
for (let s = 0; s < N; s++) {
  const w = buildWorld(cfg, 1000 + s), r = runSeason(w, {}, { record: true });
  if (first) { console.log('event keys', Object.keys(r.events[0] || {}), 'excluded sample', JSON.stringify(r.overrides.excluded[0])); first = false; }
  const ex = new Map(); for (const e of r.overrides.excluded) ex.set(e.person, e);
  for (const e of r.events) {
    if (e.role === 'resident') continue; n++;
    const p = e.person, t = w.traits, g0 = e.day * SLOTS_PER_DAY + e.slot + (e.route === 'community' ? 0 : 1);
    const a = g0 + t.latent[p], sym = a + t.presym[p], b = Math.min(cfg.days * SLOTS_PER_DAY, sym + t.infDur[p]); if (b <= a) continue;
    inf += b - a; pre += Math.min(b, sym) - a; if (t.symptomatic[p]) nSym++;
    const x = ex.get(p); if (x) { nEx++; out += Math.max(0, Math.min(b, x.to) - Math.max(a, x.from)); }
  }
}
console.log(ph, 'infected staff', n, '| with symptoms', (100 * nSym / n).toFixed(0) + '%', '| ever excluded', (100 * nEx / n).toFixed(0) + '%', '| share of infectious time excluded', (100 * out / inf).toFixed(0) + '%', '| share of infectious time before symptoms', (100 * pre / inf).toFixed(0) + '%', '| mean infectious days', (inf / n / SLOTS_PER_DAY).toFixed(1));
