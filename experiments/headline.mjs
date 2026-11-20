// The page's headline figures: reported resident infections in an average season without lamps, with lamps in the
// common areas, with lamps in the bedrooms as well, and bedrooms only, for the cautious, central and favourable cases.
// Same seasons and reporting rule as the page (seeds 1000..., one lamp per 250 sq ft).
//   node experiments/headline.mjs [covid|flu] [seasons] [--emission=0.55 --table=experiments/out_emission055.txt] [--arms=common,both,bedrooms]
// --table swaps in another COVID-19 fit table (rows of {closeShare, G, trueAR, staffAR} as JSON lines), to compare fits.
import fs from 'node:fs';
import { ANCHORED, anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';
const args = process.argv.slice(2), opt = (k) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : null; };
const pos = args.filter((x) => !x.startsWith('--')), ph = pos[0] || 'covid', N = +(pos[1] || 200);
if (opt('table')) { ANCHORED.table = fs.readFileSync(opt('table'), 'utf8').trim().split('\n').map((l) => JSON.parse(l)); if (opt('emission')) ANCHORED.emissionMedian = +opt('emission'); }
import { ANCHORS } from '../src/params.js';
if (opt('shares')) { const [low, central, high] = opt('shares').split(',').map(Number); Object.assign(ANCHORS[ph].shares, { low, central, high, max: Math.max(ANCHORS[ph].shares.max, high) }); }   // --shares=low,central,high: other out-of-reach shares for the three cases
const hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(undefined, ph), sc = anchoredScenarios(base);
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside'), COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const set = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / 23.2258))]));
const ARMS = { common: set(COMMON), both: set([...COMMON, 'bedroom']), bedrooms: set(['bedroom']) }, arms = (opt('arms') || 'common,both,bedrooms').split(',');
const out = { pathogen: ph, seasons: N, emission: base.emission.median, k: base.lamp.susceptibility, lamps: Object.fromEntries(arms.map((a) => [a, Object.values(ARMS[a]).reduce((x, y) => x + y, 0)])) };
for (const name of ['cautious', 'central', 'favourable']) {
  const cfg = sc[name], rho = sc.reportShare[name], tot = { none: 0 }, all = { none: 0 }; for (const a of arms) { tot[a] = 0; all[a] = 0; }
  for (let s = 0; s < N; s++) {
    const seed = 1000 + s, w = buildWorld(cfg, seed), rep = (res) => { let t = 0, u = 0; for (const e of res.events) if (e.role === 'resident') { u++; if (hash(seed * 100003 + e.person) < rho) t++; } return [t, u]; };
    const add = (k, r) => { const [t, u] = rep(r); tot[k] += t; all[k] += u; };
    add('none', runSeason(w, { lamps: {} })); for (const a of arms) add(a, runSeason(w, { lamps: ARMS[a] }));
  }
  out[name] = { share: cfg.transmission.closeShare, reported: +rho.toFixed(3), k: cfg.lamp.susceptibility, none: +(tot.none / N).toFixed(2), allNone: +(all.none / N).toFixed(2) };
  for (const a of arms) { out[name][a] = +(tot[a] / N).toFixed(2); out[name][a + 'Cut'] = +(100 * (1 - tot[a] / tot.none)).toFixed(1); }
  console.error(name, JSON.stringify(out[name]));
}
console.log(JSON.stringify(out));
