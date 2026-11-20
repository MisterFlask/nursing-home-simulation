// Coupling tests: determinism, common random numbers, route switches.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, mergeConfig } from '../src/params.js';
import { buildWorld, runSeason } from '../src/engine.js';
import { hashOf, typedToPlain } from './helpers.js';

const cfg = defaultConfig('covid');
const lampsEverywhere = (world, n = 2) => { const l = {}; for (const r of world.rooms) if (r.type !== 'outside') l[r.id] = n; return { lamps: l }; };

test('(e) same seed and intervention give bit-identical results', () => {
  for (const seed of [3, 17]) {
    const iv = { lamps: { 'dining-1': 2, activity: 2, breakroom: 1 } };
    const a = runSeason(buildWorld(cfg, seed), iv);
    const w = buildWorld(cfg, seed);
    const b = runSeason(w, iv);
    const c = runSeason(w, iv); // same world, run twice
    const ja = JSON.stringify(a, typedToPlain), jb = JSON.stringify(b, typedToPlain), jc = JSON.stringify(c, typedToPlain);
    assert.equal(ja, jb, 'fresh world, same seed');
    assert.equal(jb, jc, 'same world, second run');
    // Recording frames does not change the result.
    const d = runSeason(w, iv, { record: true });
    delete d.frames; delete d.overrides;
    assert.equal(JSON.stringify(d, typedToPlain), jb);
  }
});

test('(f) runs do not touch the world: pre-drawn traits and schedules identical between arms', () => {
  const w = buildWorld(cfg, 5);
  const before = hashOf({ traits: w.traits, loc: w.locSlot, contacts: w.contacts, visits: w.visits, visitors: w.visitors, visitorEmit: w.visitorEmit });
  runSeason(w, {});
  const mid = hashOf({ traits: w.traits, loc: w.locSlot, contacts: w.contacts, visits: w.visits, visitors: w.visitors, visitorEmit: w.visitorEmit });
  runSeason(w, lampsEverywhere(w));
  const after = hashOf({ traits: w.traits, loc: w.locSlot, contacts: w.contacts, visits: w.visits, visitors: w.visitors, visitorEmit: w.visitorEmit });
  assert.equal(before, mid); assert.equal(mid, after);
  // Traits do not depend on the intervention or on schedule parameters:
  // changing activity attendance leaves every person's traits unchanged.
  const w2 = buildWorld(mergeConfig(cfg, { people: { pActivity: 0.9, pLoungeIdle: 0.05 } }), 5);
  assert.equal(hashOf(w2.traits), hashOf(w.traits));
});

test('(f) common random numbers: with lamps everywhere nobody is infected earlier (guaranteed setting)', () => {
  // Guaranteed setting: one introduced infectious staff member, no community
  // or visitor importation, close range off, and a latent period longer than
  // the season so the index case is the only person who is ever infectious.
  // Then each person's exposure is the index case's room air only, which is
  // pointwise lower with a larger λ, so the cumulative dose is lower at every
  // time and the threshold is crossed later or never.
  // (With onward chains this is NOT guaranteed: a secondary case infected
  // later emits later, which can expose someone else at a worse moment. See
  // the informational test below and NOTES.md.)
  const c = mergeConfig(cfg, {
    importation: { staffDailyHazard: 0, visitorInfectiousProb: 0 },
    transmission: { G: 0 },
    disease: { latent: { mean: 1000, shape: 1000 } },
    emission: { median: 10 },
  });
  let pairs = 0, laterOrSame = 0, avertedTotal = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const w = buildWorld(c, seed);
    const staff = w.people.filter((p) => p.role !== 'resident');
    const index = staff[seed % staff.length].id;
    const intro = { introductions: [{ person: index, day: 2, stage: 'I' }] };
    const a = runSeason(w, {}, intro), b = runSeason(w, lampsEverywhere(w), intro);
    const ta = new Map(), tb = new Map();
    for (const e of a.events) ta.set(e.person, e.day * 48 + e.slot);
    for (const e of b.events) tb.set(e.person, e.day * 48 + e.slot);
    for (const [p, t] of tb) {
      assert.ok(ta.has(p), `seed ${seed}: person ${p} infected with lamps but not without`);
      assert.ok(t >= ta.get(p), `seed ${seed}: person ${p} infected earlier with lamps (${t} < ${ta.get(p)})`);
      pairs++; if (t >= ta.get(p)) laterOrSame++;
    }
    avertedTotal += ta.size - tb.size;
  }
  console.log(`  ${pairs} people infected in both arms, all at the same time or later with lamps; ${avertedTotal} infections averted in total`);
  assert.ok(pairs > 20, 'test setting produces infections');
});

test('(f) informational: in the full model with onward chains, how often is someone infected earlier with lamps?', () => {
  let earlier = 0, both = 0, onlyLamp = 0, seasonsWorse = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const w = buildWorld(cfg, seed);
    const a = runSeason(w, {}), b = runSeason(w, lampsEverywhere(w));
    const ta = new Map(); for (const e of a.events) ta.set(e.person, e.day * 48 + e.slot);
    for (const e of b.events) { const t = e.day * 48 + e.slot; if (!ta.has(e.person)) onlyLamp++; else { both++; if (t < ta.get(e.person)) earlier++; } }
    if (b.totals.residentInfected > a.totals.residentInfected) seasonsWorse++;
  }
  console.log(`  40 seasons: ${both} people infected in both arms, ${earlier} of them earlier with lamps; ${onlyLamp} infected only with lamps; ${seasonsWorse} seasons with more resident infections with lamps`);
});

test('(g) G = 0 gives zero close-range infections and zero close-range dose', () => {
  const c = mergeConfig(cfg, { transmission: { G: 0 } });
  let infections = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const r = runSeason(buildWorld(c, seed), {});
    assert.equal(r.totals.byRoute.close, 0);
    for (const id in r.byRoom) { assert.equal(r.byRoom[id].doseClose, 0); assert.equal(r.byRoom[id].infectionsClose, 0); }
    infections += r.totals.residentInfected + r.totals.staffInfected;
  }
  assert.ok(infections > 0);
});

test('(g) with room air effectively off (huge ventilation) all infections are close-range or community', () => {
  const c = mergeConfig(cfg, { ventilation: { scale: 1e9 }, transmission: { G: 2 } });
  let close = 0, community = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const r = runSeason(buildWorld(c, seed), {});
    assert.equal(r.totals.byRoute.room, 0);
    close += r.totals.byRoute.close; community += r.totals.byRoute.community;
    for (const e of r.events) assert.ok(e.route === 'close' || e.route === 'community');
  }
  console.log(`  20 seasons: ${close} close-range, ${community} community infections, 0 room-air`);
  assert.ok(close > 0, 'some close-range infections occur');
});

test('route attribution and byRoom tallies are consistent with events', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const r = runSeason(buildWorld(cfg, seed), {});
    const byRoute = { room: 0, close: 0, community: 0 }, byRoom = {};
    for (const e of r.events) { byRoute[e.route]++; byRoom[e.roomId] = (byRoom[e.roomId] || 0) + 1; if (e.route === 'community') assert.equal(e.roomId, 'outside'); }
    assert.deepEqual(byRoute, r.totals.byRoute);
    for (const id in r.byRoom) {
      assert.equal(r.byRoom[id].infections, byRoom[id] || 0);
      assert.equal(r.byRoom[id].infections, r.byRoom[id].infectionsRoom + r.byRoom[id].infectionsClose + (id === 'outside' ? r.totals.byRoute.community : 0));
    }
    assert.equal(r.events.length, r.totals.residentInfected + r.totals.staffInfected);
    let nr = 0, ns = 0; for (let d = 0; d < r.daily.newResident.length; d++) { nr += r.daily.newResident[d]; ns += r.daily.newStaff[d]; }
    assert.equal(nr, r.totals.residentInfected); assert.equal(ns, r.totals.staffInfected);
  }
});
