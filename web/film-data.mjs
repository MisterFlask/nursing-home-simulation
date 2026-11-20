// Data behind the film at the top of the page: the many-seasons numbers for the two
// installations it discusses, and the one season and one lunch it shows. Run once per
// scenario, then with "merge":
//   for s in cautious central favourable; do node web/film-data.mjs $s & done; wait
//   node web/film-data.mjs merge
// Same seeds, reporting draw and lamp placement as the page, so the numbers agree with it.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { anchoredConfig } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';

const dir = dirname(fileURLToPath(import.meta.url)), N_SEEDS = 200, SEED0 = 1000, M2_PER_LAMP = 23.2258;
const hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
const base = anchoredConfig(), sc = anchoredScenarios(base);
const rooms = buildFacility(base.facility).filter((r) => r.type !== 'outside');
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];   // every room except the bedrooms
const place = (types) => Object.fromEntries(rooms.filter((r) => types.includes(r.type)).map((r) => [r.id, Math.max(1, Math.round(r.area / M2_PER_LAMP))]));
const LAMPS = { common: place(COMMON), both: place([...COMMON, 'bedroom']) };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const reported = (res, seed, rho) => res.events.filter((e) => e.role === 'resident' && hash(seed * 100003 + e.person) < rho);

const what = process.argv[2];
if (what !== 'merge') {
  const cfg = sc[what], rho = sc.reportShare[what], nW = Math.ceil(cfg.days / 7);
  const out = { a: [], common: [], both: [], curveA: [], curveC: [] };
  for (let s = 0; s < N_SEEDS; s++) {
    const seed = SEED0 + s, world = buildWorld(cfg, seed);
    const run = (lamps) => reported(runSeason(world, { lamps }), seed, rho);
    const weekly = (ev) => { const w = new Array(nW).fill(0); for (const e of ev) w[Math.min(nW - 1, Math.floor(e.day / 7))]++; let c = 0; return w.map((v) => (c += v)); };
    const a = run({}), c = run(LAMPS.common), b = run(LAMPS.both);
    out.a.push(a.length); out.common.push(c.length); out.both.push(b.length);
    if (what === 'central') { out.curveA.push(weekly(a)); out.curveC.push(weekly(c)); }
  }
  writeFileSync(join(dir, `film.part.${what}.json`), JSON.stringify(out));
  console.log(what, 'without', mean(out.a).toFixed(2), 'common', mean(out.common).toFixed(2), 'both', mean(out.both).toFixed(2));
} else {
  const part = Object.fromEntries(['cautious', 'central', 'favourable'].map((k) => [k, JSON.parse(readFileSync(join(dir, `film.part.${k}.json`), 'utf8'))]));
  const ranges = {};
  for (const inst of ['common', 'both']) {
    ranges[inst] = {};
    for (const k in part) { const a = mean(part[k].a), b = mean(part[k][inst]); ranges[inst][k] = { a: +a.toFixed(2), b: +b.toFixed(2), cut: +((a - b) / a).toFixed(4) }; }
  }
  // The season shown: the one closest to the average season, without and with lamps in the
  // common areas, that also has a lunch with exactly one infectious resident at a table,
  // who breathes out close to the typical amount of virus.
  const C = part.central, ma = mean(C.a), mc = mean(C.common);
  const order = C.a.map((_, s) => s).sort((x, y) => (Math.abs(C.a[x] - ma) + Math.abs(C.common[x] - mc)) - (Math.abs(C.a[y] - ma) + Math.abs(C.common[y] - mc)));
  let pick = null;
  for (const s of order) {
    const seed = SEED0 + s, world = buildWorld(base, seed), r = runSeason(world, { lamps: {} }, { record: true }), N = world.N, tr = world.traits;
    const tI = new Float64Array(N).fill(1e9), tR = new Float64Array(N).fill(1e9);
    for (const e of r.events) { const g = e.day * 48 + e.slot; tI[e.person] = g + tr.latent[e.person]; tR[e.person] = tI[e.person] + tr.presym[e.person] + tr.infDur[e.person]; }
    search: for (let d = 0; d < base.days; d++) {
      const slot = 24, g = d * 48 + slot;
      for (let ri = 0; ri < world.nRooms; ri++) {
        if (world.rooms[ri].type !== 'dining') continue;
        const here = []; for (let p = 0; p < N; p++) if (world.locationAt(p, d, slot, r) === ri) here.push(p);
        const inf = here.filter((p) => g >= tI[p] && g < tR[p] - 2);
        if (inf.length !== 1 || world.isStaff[inf[0]]) continue;
        { const q = tr.q[inf[0]] / base.emission.median; if (q < 0.6 || q > 1.6) continue; }   // the film calls this person typical, so they must be
        const t = world.people[inf[0]].table, mates = here.filter((p) => p !== inf[0] && world.people[p].table === t && t != null);
        if (mates.length < 2) continue;
        pick = { s, seed, moment: { day: d, slot, room: world.rooms[ri].id, person: inf[0], mates } }; break search;
      }
    }
    if (pick) break;
  }
  const film = { n: N_SEEDS, seed: pick.seed, moment: pick.moment, season: { a: C.a[pick.s], b: C.common[pick.s] }, report: sc.reportShare,
    lamps: { common: Object.values(LAMPS.common).reduce((x, y) => x + y, 0), both: Object.values(LAMPS.both).reduce((x, y) => x + y, 0) }, ranges,
    curves: { a: C.curveA, b: C.curveC } };
  writeFileSync(join(dir, 'film.json'), JSON.stringify(film));
  console.log(JSON.stringify({ ...film, curves: undefined }, null, 1));
}
