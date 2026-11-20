import test from 'node:test';
import assert from 'node:assert/strict';
import { ANCHORED, NON_ROOM_AIR, anchoredAt, anchoredConfig } from '../src/params.js';
import { anchoredScenarios } from '../src/analysis.js';

test('anchored fit: published emission, an arrival every 5 days, G rises with non-room-air spread', () => {
  const c = anchoredConfig();
  assert.equal(c.emission.median, 0.52);
  assert.equal(c.importation.arrivalEveryDays, 5); assert.equal(c.importation.arrivalEveryDays, ANCHORED.arrivalEveryDays);
  assert.equal(c.transmission.closeShare, ANCHORED.shares.central);
  let last = 0;
  for (const s of [0.12, 0.2, 0.3, 0.5, 0.7]) { const at = anchoredAt(s); assert.ok(at.G > last); last = at.G; assert.ok(at.reportShare > 0 && at.reportShare <= 1); }
  // at 20% and 30% the model infects no more residents than homes report, so every infection counts as reported
  assert.ok(anchoredAt(0.2).reportShare === 1 && anchoredAt(0.3).reportShare === 1);
  assert.ok(Math.abs(anchoredAt(0.5).reportShare - 0.74) < 0.03);
});

test('non-room-air spread: the three cases are the document\'s, and the model\'s settings sit near its table', () => {
  assert.deepEqual([ANCHORED.shares.low, ANCHORED.shares.central, ANCHORED.shares.high], [0.2, 0.3, 0.5]);
  assert.deepEqual(NON_ROOM_AIR.cases, { low: 0.2, central: 0.3, high: 0.5 });
  assert.deepEqual(NON_ROOM_AIR.bySetting, { care: [0.3, 0.4, 0.6], roommates: [0.03, 0.04, 0.09], dining: [0.2, 0.25, 0.45] });
  const M = NON_ROOM_AIR.model.covid, want = [0.2, 0.3, 0.5];
  for (let i = 0; i < 3; i++) {
    assert.ok(Math.abs(M.home[i] - want[i]) < 0.02, 'home-wide share at case ' + i);   // the fit's own target, on other seeds
    for (const k of ['care', 'roommates', 'dining']) assert.ok(Math.abs(M[k][i] - NON_ROOM_AIR.bySetting[k][i]) < 0.06, k + ' at case ' + i);
    assert.ok(M.all[i] < M.home[i]);   // staff-to-staff spread is mostly through room air
  }
});

test('anchored scenarios: cautious and favourable sit at the ends of the share range and of lamp strength', () => {
  const c = anchoredConfig(), sc = anchoredScenarios(c);
  assert.equal(sc.cautious.transmission.closeShare, ANCHORED.shares.high);
  assert.equal(sc.favourable.transmission.closeShare, ANCHORED.shares.low);
  assert.ok(sc.cautious.lamp.susceptibility < c.lamp.susceptibility && c.lamp.susceptibility < sc.favourable.lamp.susceptibility);
  assert.equal(sc.cautious.lamp.outputMw, sc.favourable.lamp.outputMw);
  assert.ok(sc.reportShare.cautious < sc.reportShare.central && sc.reportShare.central <= sc.reportShare.favourable);
});

test('wall-mounted lamps take their light path and dimming from the Illuminate table', async () => {
  const { lampCadrFor, lampAchFor, wallLampAt, buildFacility } = await import('../src/engine.js');
  const c = anchoredConfig(), T = c.lamp.wall, rooms = buildFacility(c.facility);
  assert.equal(c.lamp.mount, 'wall');
  // exact at a grid point, held at the edges, and between neighbours otherwise
  const i = T.areas.indexOf(100), j = T.heights.indexOf(2.7), P = T.path[0];   // the table's first sheet: the page's lamp density
  assert.ok(Math.abs(wallLampAt(T, 100, 2.7).path - P[i][j]) < 1e-9);
  assert.ok(Math.abs(wallLampAt(T, 1e4, 9).path - P[T.areas.length - 1][T.heights.length - 1]) < 1e-9);
  const mid = wallLampAt(T, 120, 2.7).path; assert.ok(mid >= Math.min(P[i][j], P[i + 1][j]) - 1e-9 && mid <= Math.max(P[i][j], P[i + 1][j]) + 1e-9);
  const dining = rooms.find((r) => r.type === 'dining'), w = wallLampAt(T, dining.area, dining.height);
  assert.equal(w.share, 1);   // full output is allowed under a 2.7 m ceiling
  assert.ok(Math.abs(lampCadrFor(c, dining) - 0.36 * c.lamp.susceptibility * c.lamp.outputMw * w.path) < 1e-9);
  assert.ok(Math.abs(lampAchFor(c, dining, 4) - 4 * lampCadrFor(c, dining, 4) / dining.volume * c.lamp.realWorldFactor) < 1e-12);
  const bed = rooms.find((r) => r.type === 'bedroom'); assert.ok(wallLampAt(T, bed.area, bed.height).share < 0.6);   // dimmed under 2.4 m
  const off = anchoredConfig(); off.lamp.followMountingRule = 0; assert.ok(lampCadrFor(off, bed) > lampCadrFor(c, bed));
});

test('lamps pointed across the room use their own Illuminate table', async () => {
  const { lampCadrFor, wallLampAt, buildFacility } = await import('../src/engine.js');
  const down = anchoredConfig(), across = anchoredConfig(); across.lamp.aimAcross = 1;
  assert.equal(down.lamp.aimAcross, 0);
  const rooms = buildFacility(down.facility), dining = rooms.find((r) => r.type === 'dining'), lounge = rooms.find((r) => r.type === 'lounge');
  const w = wallLampAt(across.lamp.across, dining.area, dining.height);
  assert.ok(Math.abs(lampCadrFor(across, dining) - 0.36 * across.lamp.susceptibility * across.lamp.outputMw * w.share * w.path) < 1e-9);
  assert.ok(lampCadrFor(across, dining) < lampCadrFor(down, dining));   // a shorter light path under a high ceiling
  assert.ok(lampCadrFor(across, lounge) > lampCadrFor(down, lounge));   // less dimming under a low one
});

test('influenza has its own fit: reported infections held, virus output and face-to-face strength fitted', async () => {
  const { ANCHORS } = await import('../src/params.js');
  const A = ANCHORS.flu, c = anchoredConfig(undefined, 'flu');
  assert.equal(c.pathogen, 'flu'); assert.equal(c.transmission.closeShare, A.shares.central);
  assert.equal(c.importation.arrivalEveryDays, A.arrivalEveryDays); assert.equal(c.lamp.mount, 'wall'); assert.equal(c.lamp.susceptibility, 10.4);
  let lastG = 0, lastE = Infinity;
  for (const s of [A.shares.low, A.shares.central, A.shares.high]) {
    const at = anchoredAt(s, 'flu');
    assert.ok(at.G > lastG && at.emissionMedian < lastE); lastG = at.G; lastE = at.emissionMedian;   // more spread face to face means less virus in the air for the same attack rate
    assert.ok(Math.abs(at.trueAR - A.reportedAR * A.underReport) < 0.006); assert.ok(Math.abs(at.reportShare - 1 / A.underReport) < 0.04);
    assert.ok(at.emissionMedian > A.publishedEmission);
  }
  // no figure of its own: each case uses COVID-19's face-to-face strength (the share is rounded to 1%, so nearly)
  for (const k of ['low', 'central', 'high']) { const g = anchoredAt(A.shares[k], 'flu').G, gc = anchoredAt(ANCHORED.shares[k]).G; assert.ok(Math.abs(g / gc - 1) < 0.08, k); }
  const sc = anchoredScenarios(c);
  assert.equal(sc.cautious.transmission.closeShare, A.shares.high); assert.equal(sc.favourable.transmission.closeShare, A.shares.low);
  assert.ok(sc.cautious.emission.median < c.emission.median && c.emission.median < sc.favourable.emission.median);
  assert.ok(Math.abs(sc.cautious.lamp.susceptibility - 1.8) < 1e-9); assert.ok(Math.abs(sc.favourable.lamp.susceptibility - 18.99) < 1e-9);
  // COVID-19 is untouched by the scenarios' emission handling
  const k = anchoredConfig(), sk = anchoredScenarios(k); assert.equal(sk.cautious.emission.median, 0.52); assert.equal(sk.favourable.emission.median, 0.52);
});
