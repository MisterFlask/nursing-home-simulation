// Schedule tests: staffing per role per shift, presence fractions, occupancy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, mergeConfig } from '../src/params.js';
import { buildWorld, buildFacility, roomPresence, slotVisits, SLOTS_PER_DAY } from '../src/engine.js';

const cfg = defaultConfig('covid');
const world = buildWorld(cfg, 11);
const S48 = SLOTS_PER_DAY;

test('facility: room ids, counts and volumes follow the spec', () => {
  const rooms = buildFacility(cfg.facility);
  const f = cfg.facility;
  const count = (t) => rooms.filter((r) => r.type === t).length;
  assert.equal(count('bedroom'), f.wings * (f.singlesPerWing + f.doublesPerWing));
  assert.equal(count('lounge'), f.wings); assert.equal(count('station'), f.wings);
  assert.equal(count('dining'), f.diningRooms);
  for (const t of ['activity', 'therapy', 'breakroom', 'kitchen', 'office', 'lobby', 'outside']) assert.equal(count(t), 1, t);
  for (const r of rooms) {
    if (r.type === 'bedroom') assert.match(r.id, /^w\d+-bed-\d\d$/);
    if (r.type === 'lounge') assert.match(r.id, /^w\d+-lounge$/);
    if (r.type === 'station') assert.match(r.id, /^w\d+-station$/);
    if (r.type === 'dining') assert.match(r.id, /^dining-\d+$/);
    if (r.type !== 'outside') { assert.ok(r.volume > 0); assert.ok(Math.abs(r.volume - r.area * r.height) < 1e-9); assert.ok(r.ach > 0); }
    assert.ok(r.wing === -1 || (r.wing >= 0 && r.wing < f.wings));
  }
  assert.equal(new Set(rooms.map((r) => r.id)).size, rooms.length, 'ids unique');
  assert.equal(world.nResidents, f.wings * f.residentsPerWing);
  console.log(`  ${rooms.length} rooms; ${world.N} people (${world.nResidents} residents, ${world.N - world.nResidents} staff)`);
});

test('(h) staffing per role per shift matches config every day (roster and actual locations)', () => {
  const st = cfg.staff.staffing;
  const isWeekday = (d) => ((d + cfg.schedule.startWeekday) % 7) < 5;
  // A slot in the middle of each shift (00:00-07:00 belongs to the previous day's night shift).
  const probe = { day: 22, evening: 38, night: 2 };
  for (let d = 0; d < world.days; d++) {
    for (const shift of ['day', 'evening', 'night']) {
      const sd = shift === 'night' ? d - 1 : d; // shift start day
      const want = {};
      for (const role in st) want[role] = (cfg.staff.weekdaysOnly[role] && !isWeekday(sd)) ? 0 : (st[role][shift] | 0);
      // Roster.
      const on = world.roster.onDuty(sd, shift);
      const got = {}; for (const role in st) got[role] = 0;
      for (const x of on) got[x.role]++;
      assert.deepEqual(got, want, `roster day ${sd} ${shift}`);
      assert.equal(new Set(on.map((x) => x.person)).size, on.length, 'nobody holds two posts');
      // Actual locations at the probe slot: staff not outside.
      const g = d * S48 + probe[shift];
      const inside = {}; for (const role in st) inside[role] = 0;
      for (let p = 0; p < world.N; p++) {
        if (!world.isStaff[p]) continue;
        if (world.locSlot[g * world.N + p] !== world.outside) inside[world.people[p].role]++;
      }
      assert.deepEqual(inside, want, `on site day ${d} ${shift}`);
    }
  }
});

test('(h) each staff member works about workDaysPerWeek days a week and only their own shift', () => {
  const daysWorked = new Array(world.N).fill(0);
  for (let d = 0; d < world.days; d++) for (const shift of ['day', 'evening', 'night']) for (const x of world.roster.onDuty(d, shift)) {
    daysWorked[x.person]++;
    assert.equal(world.people[x.person].shift, shift);
  }
  const perWeek = daysWorked.filter((_, p) => world.isStaff[p]).map((n) => n * 7 / world.days);
  const mean = perWeek.reduce((a, b) => a + b, 0) / perWeek.length;
  console.log(`  days worked per week: mean ${mean.toFixed(2)}, min ${Math.min(...perWeek).toFixed(2)}, max ${Math.max(...perWeek).toFixed(2)}`);
  assert.ok(Math.max(...perWeek) <= cfg.staff.workDaysPerWeek + 0.2);
  assert.ok(Math.min(...perWeek) >= 3);
});

test('(h) nobody is in two places at once: presence fractions sum to 1 per person per slot', () => {
  const N = world.N;
  const vf = new Float64Array(N);
  let maxVisit = 0, slotsWithVisits = 0;
  for (let g = 0; g < world.T; g++) {
    const vs = slotVisits(world, g);
    for (const x of vs) {
      vf[x.person] += x.frac;
      assert.ok(x.frac > 0 && x.frac <= 1);
      assert.ok(world.isStaff[x.person], 'only staff make sub-slot visits');
      assert.notEqual(world.locSlot[g * N + x.person], world.outside, 'visits only while on site');
      assert.notEqual(x.room, world.outside);
    }
    for (const x of vs) {
      if (vf[x.person] === 0) continue;
      assert.ok(1 - vf[x.person] >= -1e-6, `person ${x.person} slot ${g}: visit fractions ${vf[x.person]} exceed the slot`);
      if (vf[x.person] > maxVisit) maxVisit = vf[x.person];
      slotsWithVisits++;
      vf[x.person] = 0;
    }
  }
  // Residents are always somewhere inside the building.
  for (let g = 0; g < world.T; g += 7) for (let p = 0; p < N; p++) if (!world.isStaff[p]) assert.notEqual(world.locSlot[g * N + p], world.outside);
  console.log(`  ${slotsWithVisits} person-slots with care/medicine visits; largest visit share of a slot ${maxVisit.toFixed(3)}`);
});

test('(h) room occupancy is plausible (peak occupancy by room type, first 28 days)', () => {
  const peak = {}, mean = {}, cnt = {};
  const types = world.rooms.map((r) => r.type);
  for (let g = 0; g < 28 * S48; g++) {
    const occ = roomPresence(world, g);
    for (let r = 0; r < world.nRooms; r++) {
      const t = types[r];
      peak[t] = Math.max(peak[t] || 0, occ[r]);
      if (g % S48 >= 16 && g % S48 < 44) { mean[t] = (mean[t] || 0) + occ[r]; cnt[t] = (cnt[t] || 0) + 1; }
    }
  }
  const rows = Object.keys(peak).filter((t) => t !== 'outside').map((t) => `  ${t.padEnd(10)} peak ${peak[t].toFixed(1).padStart(5)}   mean 08-22h ${(mean[t] / cnt[t]).toFixed(2).padStart(6)}`);
  console.log('  occupancy (people incl. staff and visitors, fractional for brief visits):\n' + rows.join('\n'));
  assert.ok(peak.bedroom <= 2 + 4, 'bedroom: residents + a few staff/visitors');
  assert.ok(peak.breakroom <= cfg.staff.breakroomCapacity + 1e-9, 'break room never above capacity');
  assert.ok(peak.activity <= cfg.people.activityCapacity + 10);
  assert.ok(peak.dining >= 15 && peak.dining <= 80);
  assert.ok(peak.lounge <= 40);
  assert.ok(peak.therapy <= 20);
  assert.ok(peak.station >= 1);
});

test('mobility classes: bedbound residents never leave the bedroom; communal eat in a dining room; others in their room', () => {
  const N = world.N;
  for (let p = 0; p < N; p++) {
    if (world.isStaff[p]) continue;
    const mob = world.people[p].mobility, home = world.homeRoom[p];
    for (let d = 0; d < 7; d++) {
      const lunch = world.locSlot[(d * S48 + 24) * N + p];
      if (mob === 'roombound') for (let s = 0; s < S48; s++) assert.equal(world.locSlot[(d * S48 + s) * N + p], home);
      if (mob === 'communal') assert.equal(world.rooms[lunch].type, 'dining');
      if (mob === 'limited') assert.equal(lunch, home, 'room-oriented residents eat in their room');
      for (let s = 0; s < cfg.schedule.morningCareEnd; s++) assert.equal(world.locSlot[(d * S48 + s) * N + p], home, 'night in bedroom');
    }
  }
});

test('residentsPerWing below capacity leaves beds empty; above capacity throws', () => {
  const w = buildWorld(mergeConfig(cfg, { facility: { residentsPerWing: 20 }, days: 7 }), 1);
  assert.equal(w.nResidents, 80);
  assert.throws(() => buildWorld(mergeConfig(cfg, { facility: { residentsPerWing: 33 }, days: 7 }), 1));
});

test('world.loc (person-major view) and locationAt agree with the engine schedule; overrides apply', async () => {
  const { runSeason } = await import('../src/engine.js');
  for (const p of [0, 50, 119, 120, 150, world.N - 1]) for (const g of [0, 17, 500, 3000, world.T - 1]) {
    const d = Math.floor(g / S48), s = g % S48;
    assert.equal(world.loc[p][g], world.locSlot[g * world.N + p]);
    assert.equal(world.locationAt(p, d, s), world.loc[p][g]);
  }
  // Find a season with a resident isolation window and check playback puts them in their bedroom at lunch.
  for (let seed = 1; seed <= 20; seed++) {
    const w = buildWorld(cfg, seed);
    const r = runSeason(w, {}, { record: true });
    const iso = r.overrides.isolated.find((x) => x.to - x.from >= S48 && w.people[x.person].mobility === 'communal');
    if (!iso) continue;
    const g = Math.ceil(iso.from / S48) * S48 + 24; // lunch the next day
    if (g >= iso.to || g >= w.T) continue;
    assert.equal(w.locationAt(iso.person, Math.floor(g / S48), 24, r), w.homeRoom[iso.person]);
    assert.notEqual(w.locationAt(iso.person, Math.floor(g / S48), 24), w.homeRoom[iso.person], 'planned location is the meal room');
    return;
  }
  assert.fail('no isolation window found in 20 seasons');
});

test('default facility matches the researched layout: 112 residents in 4 wings, singles + half-empty doubles', () => {
  assert.equal(world.nResidents, 112);
  const perRoom = {};
  for (const p of world.people) if (p.role === 'resident') perRoom[p.homeRoom] = (perRoom[p.homeRoom] || 0) + 1;
  const beds = world.rooms.filter((r) => r.type === 'bedroom');
  const singles = beds.filter((r) => r.beds === 1).length, doubles = beds.filter((r) => r.beds === 2);
  assert.equal(singles, 16); assert.equal(doubles.length, 56);
  assert.equal(doubles.filter((r) => perRoom[r.id] === 2).length, 40);
  assert.equal(doubles.filter((r) => perRoom[r.id] === 1).length, 16);
  // Weekday staff on duty: the research roster rows sum to 85 (its subtotal says 83), weekend 71.
  const count = (d) => ['day', 'evening', 'night'].reduce((a, sh) => a + world.roster.onDuty(d, sh).length, 0);
  console.log(`  weekday staff on duty: ${count(0)}, weekend: ${count(5)}; distinct staff employed: ${world.N - world.nResidents}`);
  assert.equal(count(0), 85); assert.equal(count(5), 71);
});

test('routine cycle: resident schedules repeat every cycleDays; staff follow the actual roster', () => {
  const C = cfg.schedule.cycleDays, N = world.N;
  for (let p = 0; p < N; p += 7) {
    if (world.isStaff[p]) continue;
    for (const g of [100, 700, 1300]) assert.equal(world.locSlot[g * N + p], world.locSlot[(g + C * S48) * N + p]);
  }
  // A cycle as long as the season gives a valid world too.
  const w = buildWorld(mergeConfig(cfg, { schedule: { cycleDays: 0 }, days: 21 }), 3);
  assert.equal(w.days, 21);
});
