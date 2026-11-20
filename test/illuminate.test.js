// The lamp arithmetic is Illuminate's. These tests hold the JavaScript engine to answers computed directly in
// OSLUV's Illuminate (guv_calcs) for the model's own rooms: test/illuminate-check.json, from experiments/illuminate_check.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PARAMS, ILLUMINATE, ILLUMINATE_WALL, ILLUMINATE_ACROSS, anchoredConfig, paramRange } from '../src/params.js';
import { lampAchFor, lampCadrFor, wallLampAt, wallLampBase } from '../src/engine.js';
import { anchoredScenarios } from '../src/analysis.js';
const CHECK = JSON.parse(fs.readFileSync(new URL('./illuminate-check.json', import.meta.url), 'utf8'));

test('equivalent air changes match Illuminate for the model\'s rooms, lamp counts, aims and bedroom hours', () => {
  for (const r of CHECK.rooms) {
    const c = anchoredConfig();
    Object.assign(c.lamp, { susceptibility: CHECK.k, realWorldFactor: 1, pathFactor: 1, aimAcross: r.across ? 1 : 0, bedroomShare: 8 / r.hours });
    const room = { type: r.type, area: r.area, height: r.height, volume: r.area * r.height };
    const ach = lampAchFor(c, room, r.lamps);
    assert.ok(Math.abs(ach / r.each - 1) < 0.01, `${r.name}: engine ${ach.toFixed(2)} against Illuminate ${r.each}`);
  }
});

test('the lamp constant, its range and the lamp\'s output are Illuminate\'s', () => {
  const k = PARAMS.find((p) => p.path === 'lamp.susceptibility');
  for (const ph of ['covid', 'flu']) {
    const K = ILLUMINATE.k[ph], rg = paramRange(k, ph), ks = K.rows.map((x) => x.k).sort((a, b) => a - b), n = ks.length;
    assert.deepEqual([rg.low, rg.central, rg.high], [K.low, K.central, K.high]);
    assert.equal(K.low, ks[0]); assert.equal(K.high, ks[n - 1]);
    assert.ok(Math.abs(K.central - (n % 2 ? ks[(n - 1) / 2] : (ks[n / 2 - 1] + ks[n / 2]) / 2)) < 0.011, 'the median row');
    for (const row of K.rows) assert.ok(Math.abs(row.k - (row.k1 * (1 - row.resistant) + row.k2 * row.resistant)) < 0.006, 'k1(1 - f) + k2 f');
    const c = anchoredConfig(undefined, ph), sc = anchoredScenarios(c);
    assert.equal(c.lamp.susceptibility, K.central); assert.ok(Math.abs(sc.cautious.lamp.susceptibility - K.low) < 1e-9); assert.ok(Math.abs(sc.favourable.lamp.susceptibility - K.high) < 1e-9);
  }
  const c = anchoredConfig();
  assert.equal(c.lamp.outputMw, ILLUMINATE.lamp.outputMw); assert.equal(ILLUMINATE_WALL.lampMw, ILLUMINATE.lamp.outputMw); assert.equal(ILLUMINATE_ACROSS.lampMw, ILLUMINATE.lamp.outputMw);
  assert.equal(c.lamp.maxEach, undefined); assert.equal(c.lamp.maxEachBedroom, undefined);   // no caps of our own: the exposure check is Illuminate's, room by room
});

test('lamp density: read from the table up to four times the page\'s density, and nothing beyond it', () => {
  const c = anchoredConfig(), T = c.lamp.wall, dining = { type: 'dining', area: 100, height: 2.7, volume: 270 };
  assert.deepEqual(T.mults, [1, 2, 3, 4]); assert.equal(wallLampBase(T, 100), 4); assert.equal(wallLampBase(T, 14), 1);
  const i = T.areas.indexOf(100), j = T.heights.indexOf(2.7);
  for (const [m, mi] of [[1, 0], [2, 1], [4, 3]]) { const w = wallLampAt(T, 100, 2.7, m); assert.ok(Math.abs(w.path - T.path[mi][i][j]) < 1e-9); assert.ok(Math.abs(w.limit - T.limit[mi][i][j]) < 1e-9); assert.equal(w.share, Math.min(1, T.limit[mi][i][j])); }
  assert.ok(Math.abs(wallLampAt(T, 100, 2.7, 0.5).path - T.path[0][i][j]) < 1e-9, 'held below the page\'s density');
  assert.ok(lampAchFor(c, dining, 8) > lampAchFor(c, dining, 4) && lampAchFor(c, dining, 16) > lampAchFor(c, dining, 8));
  assert.equal(lampAchFor(c, dining, 40), lampAchFor(c, dining, 16));
  assert.ok(lampCadrFor(c, dining, 16) < lampCadrFor(c, dining, 4), 'each lamp delivers less when the room is crowded with them');
});

test('bedrooms: lamps are dimmed for the hours residents spend there, by Illuminate\'s own check scaled to those hours', () => {
  const c = anchoredConfig(), bed = { type: 'bedroom', area: 24, height: 2.4, volume: 57.6 }, lounge = { ...bed, type: 'lounge' };
  const w = wallLampAt(c.lamp.wall, 24, 2.4, 1);
  assert.ok(Math.abs(lampCadrFor(c, bed, 1) / lampCadrFor(c, lounge, 1) - c.lamp.bedroomShare) < 1e-9, 'the same room as a lounge gets the full 8-hour allowance');
  assert.ok(Math.abs(lampCadrFor(c, bed, 1) - 0.36 * c.lamp.susceptibility * c.lamp.outputMw * w.limit * c.lamp.bedroomShare * w.path) < 1e-9);
  const eight = anchoredConfig(); eight.lamp.bedroomShare = 1; assert.equal(lampCadrFor(eight, bed, 1), lampCadrFor(eight, lounge, 1));
  const off = anchoredConfig(); off.lamp.followMountingRule = 0; assert.ok(Math.abs(lampCadrFor(off, bed, 1) - 0.36 * off.lamp.susceptibility * off.lamp.outputMw * w.path) < 1e-9);
  const sc = anchoredScenarios(c); assert.ok(sc.cautious.lamp.bedroomShare < c.lamp.bedroomShare && sc.favourable.lamp.bedroomShare === 1);
});
