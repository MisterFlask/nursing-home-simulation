// Care-home airborne transmission model: simulation engine.
//
// ES module, zero dependencies, no DOM, no Node-only APIs. Runs unchanged in a
// browser Web Worker and in Node 22. All randomness comes from seeded PRNG
// streams created in buildWorld(); runSeason() draws no random numbers at all,
// so two runs on the same world differ only because of the intervention
// (common random numbers).
//
// Units throughout: time in hours (one slot = 0.5 h, 48 slots per day, slot 0
// starts at 00:00), lengths in metres, volumes in m³, emission in quanta/h,
// concentration in quanta/m³, dose in quanta (effective, i.e. after the
// person's susceptibility and masks). A dose of 1 quantum infects with
// probability 1 − e^{−1} ≈ 63%.
//
// A world has two layers:
//   structure — rooms, people, roster, schedules, contacts, tables, visits.
//               Depends only on "structural" config (facility layout, people,
//               staffing, timetables, visit frequency) and the seed.
//   derived   — per-person traits (thresholds, emission, durations, immunity,
//               community-infection day), infectious visitors, room ACH.
//               Depends on everything else.
// buildWorld(config, seed, { reuse: previousWorld }) rebuilds only the derived
// layer when the structural config and seed are unchanged. Both paths run the
// same derive code, so results are bit-identical.
//
// Note for the web build: params.js, engine.js and analysis.js are concatenated
// into one scope, so top-level names must be unique across the three files.

export const SLOTS_PER_DAY = 48;
export const SLOT_HOURS = 0.5;

export const ROOM_TYPES = ['bedroom', 'lounge', 'station', 'dining', 'activity', 'therapy', 'breakroom', 'kitchen', 'office', 'lobby', 'outside'];
export const ROLES = ['resident', 'cna', 'nurse', 'therapist', 'dietary', 'housekeeping', 'activities', 'admin', 'rn', 'aideFloat'];
export const SHIFT_NAMES = ['day', 'evening', 'night'];
export const CONTACT_TYPES = ['care', 'table', 'break', 'therapy', 'visit', 'medpass', 'roommate'];
export const ROUTES = ['room', 'close', 'community'];
export const STATES = ['S', 'E', 'Ipre', 'Isym', 'Iasym', 'R'];

const RT = {}; ROOM_TYPES.forEach((t, i) => { RT[t] = i; });
const CT = {}; CONTACT_TYPES.forEach((t, i) => { CT[t] = i; });
// Contact types during which the staff member (party a) is briefly in the
// contact's room for tau hours: these double as sub-slot "visits" (§1.4).
const PRESENCE_TYPE = new Uint8Array(CONTACT_TYPES.length); PRESENCE_TYPE[CT.care] = 1; PRESENCE_TYPE[CT.medpass] = 1;
const ROLE_IDX = {}; ROLES.forEach((t, i) => { ROLE_IDX[t] = i; });
// Roles whose posts are tied to a wing (split across wings by the roster).
const WING_ROLES = { cna: true, nurse: true, housekeeping: true };
// Emission/breathing contexts.
const CTX_REST = 0, CTX_SOCIAL = 1, CTX_WORK = 2;
// Disease states.
const ST_S = 0, ST_E = 1, ST_IPRE = 2, ST_ISYM = 3, ST_IASYM = 4, ST_R = 5;
const NEVER = 0x3fffffff; // "slot index that never comes"

// PRNG stream identifiers. Each (seed, stream, index) triple gets its own
// independent generator, so e.g. person 17's traits never depend on how many
// draws anyone else used.
const STREAM_TRAITS = 1, STREAM_RESIDENT_SETUP = 2, STREAM_RESIDENT_DAYS = 3, STREAM_VISITS = 4,
  STREAM_FLOAT = 5, STREAM_TABLES = 6, STREAM_VISIT_OCC = 7, STREAM_ARRIVALS = 8, STREAM_SEVERITY = 9;

// Config subtrees / paths that do NOT affect the world structure. Everything
// else is structural (facility geometry, people, staffing, timetables, visits).
const NON_STRUCTURAL = ['pathogen', 'scenario', 'severity', 'emission', 'disease', 'immune', 'air', 'lamp', 'ventilation', 'breathing', 'control',
  'transmission.G', 'transmission.beta', 'transmission.nearFieldUV', 'transmission.closeShare',
  'facility.ach', 'importation.staffDailyHazard', 'importation.arrivalEveryDays', 'importation.visitorInfectiousProb', 'importation.visitCloseShare'];

// ===========================================================================
// PRNG: sfc32 seeded through a murmur-style hash of (seed, stream, index).
// ===========================================================================
function fmix32(h) {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16; return h >>> 0;
}
export function streamSeed(seed, stream, index) {
  let h = fmix32((seed >>> 0) ^ 0x9e3779b9);
  h = fmix32(h ^ Math.imul(stream + 1, 0x27d4eb2f));
  h = fmix32(h ^ Math.imul((index | 0) + 1, 0x165667b1));
  return h;
}
// Returns a function () => uniform in [0, 1). mulberry32: one 32-bit state,
// a few integer operations per draw (the schedule builder draws ~300k numbers
// per world, so speed matters); statistically adequate for this use.
export function makeRng(seed32) {
  let a = seed32 >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rngFor = (seed, stream, index) => makeRng(streamSeed(seed, stream, index));
// Standard normal via Box-Muller: always consumes exactly two uniforms.
function randNormal(rng) {
  const u1 = 1 - rng(), u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
// Gamma(shape k, scale θ) by Marsaglia-Tsang. Mean kθ.
function randGamma(rng, k, theta) {
  if (!(k > 0) || !(theta > 0)) return Math.max(0, k * theta) || 0;
  if (k < 1) return randGamma(rng, k + 1, theta) * Math.pow(1 - rng(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let z, v;
    do { z = randNormal(rng); v = 1 + c * z; } while (v <= 0);
    v = v * v * v;
    const u = 1 - rng();
    if (Math.log(u) < 0.5 * z * z + d - d * v + d * Math.log(v)) return d * v * theta;
  }
}
const gammaMeanShape = (rng, mean, shape) => randGamma(rng, shape, mean / shape);
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  return arr;
}

// ===========================================================================
// 1.1 Facility
// ===========================================================================
const pad2 = (n) => (n < 10 ? '0' : '') + n;

// Returns the flat room list. Room ids are a contract with the UI:
//   w{W}-bed-{NN} (W 0-based, NN 01-based: singles first, then doubles),
//   w{W}-lounge, w{W}-station, dining-{N} (N 1-based), activity, therapy,
//   breakroom, kitchen, office, lobby, outside.
// `ach` is the room type's base clean-air changes per hour; the engine
// multiplies it by config.ventilation.scale.
export function buildFacility(fac) {
  const rooms = [];
  const add = (id, type, wing, name, key, extra = {}) => {
    const g = key ? fac.rooms[key] : { area: 0, height: 0 };
    rooms.push({ id, type, wing, name, area: g.area, height: g.height, volume: g.area * g.height, ach: type === 'outside' ? 0 : fac.ach[type], ...extra });
  };
  const wingLetter = (w) => (w < 26 ? String.fromCharCode(65 + w) : 'W' + w);
  for (let w = 0; w < fac.wings; w++) {
    let n = 0;
    for (let i = 0; i < fac.singlesPerWing; i++) { n++; add(`w${w}-bed-${pad2(n)}`, 'bedroom', w, `Wing ${wingLetter(w)} room ${n}`, 'bedroomSingle', { beds: 1 }); }
    for (let i = 0; i < fac.doublesPerWing; i++) { n++; add(`w${w}-bed-${pad2(n)}`, 'bedroom', w, `Wing ${wingLetter(w)} room ${n} (shared)`, 'bedroomDouble', { beds: 2 }); }
    add(`w${w}-lounge`, 'lounge', w, `Wing ${wingLetter(w)} lounge`, 'lounge');
    add(`w${w}-station`, 'station', w, `Wing ${wingLetter(w)} nurses' station and corridor`, 'station');
  }
  for (let i = 1; i <= fac.diningRooms; i++) add(`dining-${i}`, 'dining', -1, `Dining room ${i}`, 'dining');
  add('activity', 'activity', -1, 'Activity room', 'activity');
  add('therapy', 'therapy', -1, 'Therapy room', 'therapy');
  add('breakroom', 'breakroom', -1, 'Staff break room', 'breakroom');
  add('kitchen', 'kitchen', -1, 'Kitchen', 'kitchen');
  add('office', 'office', -1, 'Office', 'office');
  add('lobby', 'lobby', -1, 'Lobby', 'lobby');
  add('outside', 'outside', -1, 'Outside the building', null);
  return rooms;
}

// ===========================================================================
// Column stores (slot-indexed records) packed into CSR by slot
// ===========================================================================
function makeColumns(spec, cap = 1024) {
  cap = Math.max(16, cap | 0);
  const st = { n: 0, cap, spec, g: new Int32Array(cap), cols: {} };
  for (const [name, Ctor] of spec) st.cols[name] = new Ctor(cap);
  return st;
}
function growColumns(st) {
  const cap = st.cap * 2;
  const g = new Int32Array(cap); g.set(st.g); st.g = g;
  for (const [name, Ctor] of st.spec) { const a = new Ctor(cap); a.set(st.cols[name]); st.cols[name] = a; }
  st.cap = cap;
}
// Stable counting sort by slot g.
function packCSR(T, st) {
  const n = st.n, gs = st.g;
  const start = new Int32Array(T + 1);
  for (let i = 0; i < n; i++) start[gs[i] + 1]++;
  for (let g = 0; g < T; g++) start[g + 1] += start[g];
  if (st.sorted) { // already in slot order: no permutation needed
    const out = { start, length: n };
    for (const [name] of st.spec) out[name] = st.cols[name].length === n ? st.cols[name] : st.cols[name].slice(0, n);
    return out;
  }
  const pos = start.slice(0, T);
  const perm = new Int32Array(n);
  for (let i = 0; i < n; i++) perm[pos[gs[i]]++] = i;
  const out = { start, length: n };
  for (const [name, Ctor] of st.spec) {
    const src = st.cols[name], dst = new Ctor(n);
    for (let k = 0; k < n; k++) dst[k] = src[perm[k]];
    out[name] = dst;
  }
  return out;
}
const VISIT_SPEC = [['person', Uint16Array], ['room', Uint16Array], ['frac', Float64Array]];
const CONTACT_SPEC = [['a', Uint16Array], ['b', Uint16Array], ['type', Uint8Array], ['tau', Float32Array], ['room', Uint16Array]]; // tau in hours (Float32: ~1e-7 relative rounding)
const VISITOR_SPEC = [['visitor', Int32Array], ['room', Uint16Array], ['resident', Int32Array], ['tau', Float64Array]];
function pushVisit(st, g, person, room, frac) {
  if (st.n === st.cap) growColumns(st);
  const k = st.n++, c = st.cols;
  st.g[k] = g; c.person[k] = person; c.room[k] = room; c.frac[k] = frac;
}
function pushContact(st, g, a, b, type, tau, room) {
  if (st.n === st.cap) growColumns(st);
  const k = st.n++, c = st.cols;
  st.g[k] = g; c.a[k] = a; c.b[k] = b; c.type[k] = type; c.tau[k] = tau; c.room[k] = room;
}
function pushVisitorEmit(st, g, visitor, room, resident, tau) {
  if (st.n === st.cap) growColumns(st);
  const k = st.n++, c = st.cols;
  st.g[k] = g; c.visitor[k] = visitor; c.room[k] = room; c.resident[k] = resident; c.tau[k] = tau;
}
// For tests / custom worlds: column stores from plain arrays of objects.
export function columnsFrom(kind, list) {
  if (kind === 'visits') { const st = makeColumns(VISIT_SPEC); for (const v of list) pushVisit(st, v.g, v.person, v.room, v.frac); return st; }
  if (kind === 'contacts') { const st = makeColumns(CONTACT_SPEC); for (const v of list) pushContact(st, v.g, v.a, v.b, CT[v.type], v.tau, v.room); return st; }
  if (kind === 'visitorEmit') { const st = makeColumns(VISITOR_SPEC); for (const v of list) pushVisitorEmit(st, v.g, v.visitor, v.room, v.resident, v.tau); return st; }
  throw new Error('unknown kind ' + kind);
}

// ===========================================================================
// 1.3 Per-person pre-drawn randomness (derived layer)
// ===========================================================================
// Every person draws the same sequence of uniforms from their own stream, in a
// fixed order, whatever their role. Changing the intervention cannot change
// any of these; changing config values changes the values but not which
// uniform each one is built from.
function drawTraits(config, seed, people) {
  const N = people.length;
  const dis = config.disease, imm = config.immune, em = config.emission;
  const ctl = config.control.staffExclusion;
  const tr = {
    threshold: new Float64Array(N), q: new Float64Array(N),
    latent: new Int32Array(N), presym: new Int32Array(N), infDur: new Int32Array(N),
    symptomatic: new Uint8Array(N), immune: new Uint8Array(N), s: new Float64Array(N),
    routeU: new Float64Array(N), communityDay: new Int32Array(N),
    staysHome: new Uint8Array(N), homeDelaySlots: new Int32Array(N),
  };
  const toSlots = (daysVal) => Math.max(1, Math.round(daysVal * SLOTS_PER_DAY));
  const lnGsd = Math.log(Math.max(1, em.gsd));
  const h = config.importation.staffDailyHazard;
  const logOneMinusH = h > 0 && h < 1 ? Math.log(1 - h) : 0;
  for (let p = 0; p < N; p++) {
    const rng = rngFor(seed, STREAM_TRAITS, p);
    const person = people[p];
    const group = person.role === 'resident' ? 'resident' : 'staff';
    tr.threshold[p] = -Math.log(1 - rng());                     // Exp(1): Sellke threshold
    // Lognormal emission at rest (quanta/h). With log10 SD 1.2 (GSD ≈ 16) a
    // 1-in-a-million draw is ~ 10^5.7 × median: large but finite, and only
    // ever multiplied, never exponentiated, so no overflow.
    tr.q[p] = em.median * Math.exp(lnGsd * randNormal(rng));
    tr.routeU[p] = rng();
    const uSym = rng(), uImm = rng(), uComm = rng(), uHome = rng(), uDelay = rng();
    tr.symptomatic[p] = uSym < dis.pSymptomatic[group] ? 1 : 0;
    const share = imm.share[person.role] != null ? imm.share[person.role] : imm.share[group];
    tr.immune[p] = uImm < share ? 1 : 0;
    const prot = group === 'staff' && imm.protectionStaff != null ? imm.protectionStaff : imm.protection;
    tr.s[p] = tr.immune[p] ? 1 - prot : 1;
    // Community infection day: geometric with daily hazard h (staff only).
    if (group === 'staff' && h > 0) {
      const d = h >= 1 ? 0 : Math.floor(Math.log(1 - uComm) / logOneMinusH);
      tr.communityDay[p] = Math.min(d, NEVER);
    } else tr.communityDay[p] = NEVER;
    tr.staysHome[p] = group === 'staff' && uHome < ctl.staysHomeShare ? 1 : 0;
    tr.homeDelaySlots[p] = Math.round(uDelay * ctl.delayDaysMax * SLOTS_PER_DAY);
    // Durations last (gamma uses a variable number of draws).
    tr.latent[p] = toSlots(gammaMeanShape(rng, dis.latent.mean, dis.latent.shape));
    tr.presym[p] = toSlots(gammaMeanShape(rng, dis.presymptomatic.mean, dis.presymptomatic.shape));
    tr.infDur[p] = toSlots(gammaMeanShape(rng, dis.infectious.mean, dis.infectious.shape));
  }
  // Fixed arrivals (importation.arrivalEveryDays > 0): instead of random
  // outside infections, one staff member, chosen at random and never the same
  // person twice, is infected outside work every so many days, on fixed days. Uses its own
  // random stream, so no other pre-drawn value changes.
  // Hospital admission: one pre-drawn number per person, from its own random stream, so the
  // same resident is or is not admitted in every arm in which they are infected.
  tr.hospU = new Float64Array(N);
  for (let p = 0; p < N; p++) tr.hospU[p] = rngFor(seed, STREAM_SEVERITY, p)();
  const every = Math.round(config.importation.arrivalEveryDays || 0);
  if (every > 0) {
    const staff = [];
    for (let p = 0; p < N; p++) { tr.communityDay[p] = NEVER; if (people[p].role !== 'resident') staff.push(p); }
    const rng = rngFor(seed, STREAM_ARRIVALS, 0);
    const first = Math.min(3, every - 1);   // first arrival on day 4, then on a fixed beat
    for (let d = first; d < config.days && staff.length; d += every) {
      const k = Math.floor(rng() * staff.length);
      tr.communityDay[staff[k]] = d; staff[k] = staff[staff.length - 1]; staff.pop();
    }
  }
  return tr;
}

// Structural config fingerprint: config with non-structural paths removed.
export function structuralKey(config) {
  const c = JSON.parse(JSON.stringify(config));
  for (const path of NON_STRUCTURAL) {
    const ks = path.split('.');
    let o = c;
    for (let i = 0; i < ks.length - 1 && o; i++) o = o[ks[i]];
    if (o) delete o[ks[ks.length - 1]];
  }
  return JSON.stringify(c);
}

// ===========================================================================
// World assembly: structure + derived layer
// ===========================================================================
// parts = { rooms, people, days, locSlot (index g*N+p), visits, contacts
//           (column stores from columnsFrom), visitorEmit (column store, for
//           tests), tables [{room, members[]}], visitors[], fallbackRoom[] }
// people[i] = { id, role, wing, homeRoomIndex, shift, extra }
export function assembleWorld(config, seed, parts) {
  const struct = finishStructure(config, parts);
  struct.achFromConfig = false;
  if (parts.visitorEmit) struct.fixedVisitorEmit = packCSR(struct.T, parts.visitorEmit);
  return deriveWorld(config, seed, struct, null);
}
function finishStructure(config, parts) {
  const { rooms, people, days } = parts;
  const N = people.length, T = days * SLOTS_PER_DAY, nRooms = rooms.length;
  const roomIndex = {}; rooms.forEach((r, i) => { roomIndex[r.id] = i; });
  if (roomIndex.outside == null) throw new Error('facility must contain an "outside" room');
  const isStaff = new Uint8Array(N), roleIdx = new Uint8Array(N), homeRoom = new Uint16Array(N), fallbackRoom = new Uint16Array(N), wingOf = new Int16Array(N);
  for (let p = 0; p < N; p++) {
    const pp = people[p];
    isStaff[p] = pp.role === 'resident' ? 0 : 1;
    roleIdx[p] = ROLE_IDX[pp.role] != null ? ROLE_IDX[pp.role] : 0;
    homeRoom[p] = pp.homeRoomIndex;
    fallbackRoom[p] = parts.fallbackRoom ? parts.fallbackRoom[p] : pp.homeRoomIndex;
    wingOf[p] = pp.wing == null ? -1 : pp.wing;
  }
  const roomType = new Uint8Array(nRooms);
  rooms.forEach((r, i) => { roomType[i] = RT[r.type]; });
  // Tables (static membership; contacts are derived at run time from presence).
  const tl = parts.tables || [];
  const tableStart = new Int32Array(tl.length + 1), tableRoom = new Int32Array(tl.length);
  let nm = 0; tl.forEach((t, i) => { tableStart[i] = nm; nm += t.members.length; tableRoom[i] = t.room; });
  tableStart[tl.length] = nm;
  const tableMembers = new Int32Array(nm);
  nm = 0; for (const t of tl) for (const m of t.members) tableMembers[nm++] = m;
  const mealSlot = new Uint8Array(SLOTS_PER_DAY), groupSlot = new Uint8Array(SLOTS_PER_DAY);
  for (const [a, b] of config.schedule.meals) for (let s = a; s < b; s++) { mealSlot[s] = 1; groupSlot[s] = 1; }
  for (const [a, b] of config.schedule.activities) for (let s = a; s < b; s++) groupSlot[s] = 1;
  const nWings = Math.max(1, ...rooms.map((r) => r.wing + 1));
  return {
    days, T, N, nRooms, rooms, roomIndex, outside: roomIndex.outside, roomType, nWings,
    peopleRaw: people, nResidents: people.filter((p) => p.role === 'resident').length,
    isStaff, roleIdx, homeRoom, fallbackRoom, wingOf,
    locSlot: parts.locSlot,
    visits: packCSR(T, parts.visits || makeColumns(VISIT_SPEC)),
    contacts: parts.contactsCSR || packCSR(T, parts.contacts || makeColumns(CONTACT_SPEC)),
    tables: { start: tableStart, members: tableMembers, room: tableRoom, length: tl.length },
    mealSlot, groupSlot,
    visitors: parts.visitors || [],
    roster: parts.roster || null, stats: parts.stats || {},
  };
}
// Derived layer: traits, infectious visitors, room ACH. Same code for fresh
// builds and reuse, so results are bit-identical.
function deriveWorld(config, seed, struct, key) {
  const { T, N } = struct;
  const rooms = struct.achFromConfig
    ? struct.rooms.map((r) => ({ ...r, ach: r.type === 'outside' ? 0 : config.facility.ach[r.type] }))
    : struct.rooms;
  const traits = drawTraits(config, seed, struct.peopleRaw);
  // Visitors: infectious flag and emission from the pre-drawn uniforms.
  const imp = config.importation, em = config.emission;
  const lnGsd = Math.log(Math.max(1, em.gsd));
  const visitors = struct.visitors;
  const visitorQ = new Float64Array(visitors.length);
  let visitorEmit;
  if (struct.fixedVisitorEmit) visitorEmit = struct.fixedVisitorEmit;
  else {
    const ve = makeColumns(VISITOR_SPEC, 64);
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      visitorQ[i] = em.median * Math.exp(lnGsd * v.z) * em.visitorRel; // quanta/h at rest
      if (!(v.uInf < imp.visitorInfectiousProb)) continue;
      for (let k = 0; k < v.slots; k++) {
        const withRes = v.withRes[k] === 1;
        pushVisitorEmit(ve, v.g0 + k, i, v.rooms[k], withRes ? v.resident : -1, withRes ? SLOT_HOURS * imp.visitCloseShare : 0);
      }
    }
    visitorEmit = packCSR(T, ve);
  }
  const world = {
    config, seed, days: struct.days, T, N, nRooms: struct.nRooms, rooms, roomIndex: struct.roomIndex, outside: struct.outside,
    roomType: struct.roomType, nWings: struct.nWings,
    people: struct.peopleRaw.map((p) => ({ id: p.id, role: p.role, wing: p.wing, homeRoom: rooms[p.homeRoomIndex].id, homeRoomIndex: p.homeRoomIndex, shift: p.shift || null, ...(p.extra || {}) })),
    nResidents: struct.nResidents,
    isStaff: struct.isStaff, roleIdx: struct.roleIdx, homeRoom: struct.homeRoom, fallbackRoom: struct.fallbackRoom, wingOf: struct.wingOf,
    locSlot: struct.locSlot, visits: struct.visits, contacts: struct.contacts, tables: struct.tables,
    mealSlot: struct.mealSlot, groupSlot: struct.groupSlot,
    visitorEmit, visitors, visitorQ, traits,
    roster: struct.roster, stats: struct.stats,
    // Planned main room of person p at (day, slot). Pass a result produced with
    // opts.record to get the room after that run's isolation / exclusion /
    // outbreak-mode changes.
    locationAt(person, day, slot, result) {
      const g = day * SLOTS_PER_DAY + slot;
      const base = this.locSlot[g * N + person];
      if (!result || !result.overrides) return base;
      return effectiveRoomFromOverrides(this, result.overrides, person, g, base);
    },
  };
  Object.defineProperty(world, '_struct', { value: struct, enumerable: false });
  Object.defineProperty(world, '_structKey', { value: key, enumerable: false });
  // world.loc[person][day*48 + slot]: person-major view, built on first access.
  let locCache = null;
  Object.defineProperty(world, 'loc', {
    enumerable: false,
    get() {
      if (!locCache) {
        const Ctor = world.locSlot.constructor;
        locCache = [];
        for (let p = 0; p < N; p++) { const a = new Ctor(T); for (let g = 0; g < T; g++) a[g] = world.locSlot[g * N + p]; locCache.push(a); }
      }
      return locCache;
    },
  });
  return world;
}

// ===========================================================================
// buildWorld
// ===========================================================================
// opts.reuse: a world built earlier. If it has the same seed and the same
// structural config, its structure is shared and only the derived layer is
// recomputed (≈ 1 ms instead of a full build).
export function buildWorld(config, seed, opts = {}) {
  const key = structuralKey(config);
  const prev = opts.reuse;
  if (prev && prev._struct && prev.seed === seed && prev._structKey === key) return deriveWorld(config, seed, prev._struct, key);
  const struct = buildStructure(config, seed);
  return deriveWorld(config, seed, struct, key);
}

// ===========================================================================
// 1.2 / 1.4 People, roster and schedules for the default facility layout
// ===========================================================================
function buildStructure(config, seed) {
  const fac = config.facility, sch = config.schedule, pc = config.people, sc = config.staff, imp = config.importation;
  const days = config.days;
  const T = days * SLOTS_PER_DAY, S48 = SLOTS_PER_DAY;
  const rooms = buildFacility(fac);
  const nRooms = rooms.length;
  const R = {}; rooms.forEach((r, i) => { R[r.id] = i; });
  const OUT = R.outside;
  const W = fac.wings;
  const stationOf = [], loungeOf = [];
  for (let w = 0; w < W; w++) { stationOf.push(R[`w${w}-station`]); loungeOf.push(R[`w${w}-lounge`]); }
  const diningIdx = []; for (let i = 1; i <= fac.diningRooms; i++) diningIdx.push(R[`dining-${i}`]);
  const diningOfWing = (w) => diningIdx[Math.min(fac.diningRooms - 1, Math.floor(w * fac.diningRooms / W))];
  const stats = { careEpisodesPlanned: 0, careEpisodesUnplaced: 0, breaksSkipped: 0, medpassMissed: 0, activityOverflow: 0 };

  // ---------------- residents ----------------
  const capacity = fac.singlesPerWing + 2 * fac.doublesPerWing;
  if (fac.residentsPerWing > capacity) throw new Error(`residentsPerWing (${fac.residentsPerWing}) exceeds beds per wing (${capacity})`);
  const people = [];
  const residents = [];
  const res = [];
  const mob = pc.mobility, mobSum = mob.communal + mob.limited + mob.roombound;
  const mobCut1 = mob.communal / mobSum, mobCut2 = (mob.communal + mob.limited) / mobSum;
  const limitedInLounge = pc.limitedMealRoom === 'lounge';
  for (let w = 0; w < W; w++) {
    // Bed order: every single, then the first bed of every double, then the
    // second beds. Below capacity this leaves some doubles half-empty, as in
    // real homes (rather than leaving whole double rooms empty).
    const beds = [];
    for (let i = 1; i <= fac.singlesPerWing; i++) beds.push(R[`w${w}-bed-${pad2(i)}`]);
    for (let pass = 0; pass < 2; pass++) for (let i = 1; i <= fac.doublesPerWing; i++) beds.push(R[`w${w}-bed-${pad2(fac.singlesPerWing + i)}`]);
    for (let k = 0; k < fac.residentsPerWing; k++) {
      const p = people.length;
      const rng = rngFor(seed, STREAM_RESIDENT_SETUP, p);
      const u = rng();
      const mobility = u < mobCut1 ? 'communal' : u < mobCut2 ? 'limited' : 'roombound';
      const therapy = mobility !== 'roombound' && rng() < pc.therapyShare;
      const therapySlots = rng() < pc.pTherapy60 ? 2 : 1;
      const mobCode = mobility === 'communal' ? 0 : mobility === 'limited' ? 1 : 2;
      const mealRoom = mobCode === 0 ? diningOfWing(w) : (mobCode === 1 && limitedInLounge ? loungeOf[w] : beds[k]);
      people.push({ id: p, role: 'resident', wing: w, homeRoomIndex: beds[k], shift: null, extra: { mobility } });
      residents.push(p);
      res[p] = { wing: w, bed: beds[k], mobility, mobCode, therapy, therapySlots, mealRoom, lounge: loungeOf[w], table: -1, therapyStart: -1, therapyPost: -1 };
    }
  }
  const nRes = residents.length;
  const byBed = {};
  for (const p of residents) (byBed[res[p].bed] = byBed[res[p].bed] || []).push(p);
  for (const p of residents) { const mates = byBed[res[p].bed].filter((x) => x !== p); res[p].roommate = mates.length ? mates[0] : -1; people[p].extra.roommate = res[p].roommate; }

  // Tables: residents eating in a dining room (or a lounge), per wing,
  // shuffled once and chunked into tables of tableSize.
  const tables = [];
  {
    const rng = rngFor(seed, STREAM_TABLES, 0);
    for (let w = 0; w < W; w++) {
      const groups = new Map();
      for (const p of residents) {
        const r = res[p];
        if (r.wing !== w || r.mealRoom === r.bed) continue;
        if (!groups.has(r.mealRoom)) groups.set(r.mealRoom, []);
        groups.get(r.mealRoom).push(p);
      }
      for (const [room, list0] of groups) {
        const list = shuffleInPlace(list0, rng);
        for (let i = 0; i < list.length; i += pc.tableSize) {
          const t = { room, wing: w, dining: rooms[room].type === 'dining', members: list.slice(i, i + pc.tableSize) };
          for (const m of t.members) { res[m].table = tables.length; people[m].extra.table = tables.length; }
          tables.push(t);
        }
      }
    }
  }

  // ---------------- staff pools and roster ----------------
  // A "group" is a set of identical posts (same role, shift and wing
  // coverage) with c posts and a pool of m members rotating through them so
  // that exactly c are on duty every (working) day.
  const groups = [];
  for (const role of Object.keys(sc.staffing)) {
    if (ROLE_IDX[role] == null) throw new Error(`unknown staff role ${role}`);
    for (let si = 0; si < 3; si++) {
      const n = sc.staffing[role][SHIFT_NAMES[si]] | 0;
      if (n <= 0) continue;
      const wkOnly = !!(sc.weekdaysOnly && sc.weekdaysOnly[role]);
      const coverages = [];
      if (WING_ROLES[role]) {
        if (n >= W) for (let w = 0; w < W; w++) coverages.push({ wings: [w], c: Math.floor(n / W) + (w < n % W ? 1 : 0) });
        else for (let k = 0; k < n; k++) { const ws = []; for (let w = 0; w < W; w++) if (w % n === k) ws.push(w); coverages.push({ wings: ws, c: 1 }); }
      } else coverages.push({ wings: [], c: n });
      for (const cov of coverages) {
        if (cov.c <= 0) continue;
        const m = wkOnly ? cov.c : Math.max(cov.c, Math.ceil(cov.c * 7 / sc.workDaysPerWeek));
        groups.push({ role, shift: SHIFT_NAMES[si], si, wings: cov.wings, c: cov.c, m, weekdaysOnly: wkOnly, members: [] });
      }
    }
  }
  const workplaceOf = (role, wing, postK) => {
    switch (role) {
      case 'cna': case 'nurse': case 'housekeeping': return stationOf[wing];
      case 'rn': case 'aideFloat': return stationOf[0];
      case 'therapist': return R.therapy;
      case 'dietary': return R.kitchen;
      case 'activities': return R.activity;
      case 'admin': return postK === 0 ? R.lobby : R.office;
      default: return R.office;
    }
  };
  const fallbackRoom = [];
  for (const p of residents) fallbackRoom[p] = res[p].bed;
  for (const gr of groups) {
    for (let i = 0; i < gr.m; i++) {
      const p = people.length;
      const wing = gr.wings.length ? gr.wings[0] : -1;
      const home = workplaceOf(gr.role, wing, i % gr.c);
      people.push({ id: p, role: gr.role, wing, homeRoomIndex: home, shift: gr.shift });
      fallbackRoom[p] = gr.role === 'dietary' ? R.kitchen : home; // where staff go when dining rooms close
      gr.members.push(p);
    }
  }
  const N = people.length;
  if (N > 65535) throw new Error('too many people');
  const isWeekday = (d) => ((((d + sch.startWeekday) % 7) + 7) % 7) < 5;

  // Roster for shift-days d = -1 .. days-1 (the night shift of day -1 covers
  // 00:00-07:00 of day 0). roster[d+1][si] = [{ person, role, wings, k }]
  const roster = [];
  for (let d = -1; d < days; d++) {
    const perShift = [[], [], []];
    for (const gr of groups) {
      if (gr.weekdaysOnly && !isWeekday(d)) continue;
      for (let k = 0; k < gr.c; k++) {
        const idx = ((((d * gr.c + k) % gr.m) + gr.m) % gr.m);
        perShift[gr.si].push({ person: gr.members[idx], role: gr.role, wings: gr.wings, k, groupIndex: groups.indexOf(gr) });
      }
    }
    // Floats: a CNA or nurse swaps posts with a same-role colleague on another wing.
    for (let si = 0; si < 3; si++) {
      const posts = perShift[si];
      const rng = rngFor(seed, STREAM_FLOAT, (d + 1) * 3 + si);
      for (let i = 0; i < posts.length; i++) {
        const u1 = rng(), u2 = rng();
        const a = posts[i];
        if (!(a.role === 'cna' || a.role === 'nurse') || !(u1 < sc.floatShare)) continue;
        const cands = [];
        for (let j = 0; j < posts.length; j++) if (j !== i && posts[j].role === a.role && posts[j].wings[0] !== a.wings[0]) cands.push(j);
        if (!cands.length) continue;
        const b = posts[cands[Math.floor(u2 * cands.length)]];
        const t = a.person; a.person = b.person; b.person = t;
      }
    }
    roster.push(perShift);
  }
  const rosterAt = (d) => roster[d + 1];

  // ---------------- schedules ----------------
  const cycleCfg = sch.cycleDays | 0;
  const cycle = cycleCfg > 0 && cycleCfg < days && cycleCfg % 7 === 0 ? cycleCfg : days;
  const LocArr = nRooms > 255 ? Uint16Array : Uint8Array;
  const locSlot = new LocArr(T * N);
  const visitors = [];
  const mealSlot = new Uint8Array(S48);
  for (const [a, b] of sch.meals) for (let s = a; s < b; s++) mealSlot[s] = 1;
  const mealStarts = sch.meals.map(([a]) => a);

  // Therapy timetable: same start slot every weekday, fitted into therapy
  // windows with at most nTherapists × therapyPerTherapist residents per slot.
  const therapists = groups.filter((g) => g.role === 'therapist' && g.si === 0).reduce((a, g) => a + g.c, 0);
  {
    const cap = therapists * pc.therapyPerTherapist;
    const load = new Int32Array(S48);
    const postLoad = []; for (let k = 0; k < therapists; k++) postLoad.push(new Int32Array(S48));
    const starts = [];
    for (const [a, b] of sch.therapyWindows) for (let s = a; s < b; s++) starts.push([s, b]);
    let cursor = 0;
    for (const p of residents) {
      const r = res[p];
      if (!r.therapy || cap <= 0) continue;
      for (let tries = 0; tries < starts.length; tries++) {
        const [s0, end] = starts[(cursor + tries) % starts.length];
        if (s0 + r.therapySlots > end) continue;
        let ok = true;
        for (let s = s0; s < s0 + r.therapySlots; s++) if (load[s] >= cap || mealSlot[s]) ok = false;
        if (!ok) continue;
        let post = -1;
        for (let k = 0; k < therapists && post < 0; k++) {
          let free = true;
          for (let s = s0; s < s0 + r.therapySlots; s++) if (postLoad[k][s] >= pc.therapyPerTherapist) free = false;
          if (free) post = k;
        }
        if (post < 0) continue;
        for (let s = s0; s < s0 + r.therapySlots; s++) { load[s]++; postLoad[post][s]++; }
        r.therapyStart = s0; r.therapyPost = post;
        cursor = (cursor + tries + 1) % starts.length;
        break;
      }
    }
  }
  const therapyLoad = []; for (let k = 0; k < therapists; k++) therapyLoad.push(new Int32Array(S48));
  for (const p of residents) { const r = res[p]; if (r.therapyStart >= 0) for (let s = r.therapyStart; s < r.therapyStart + r.therapySlots; s++) therapyLoad[r.therapyPost][s]++; }

  // ----- resident days (one cycle of cycleDays, then tiled) -----
  // Resident routines are drawn for one cycle (default 28 days, a multiple of
  // 7 so weekdays line up) and repeat every cycle; visitor infectiousness is
  // drawn per occurrence, so infectious visits do not repeat. cycleDays ≥ days
  // means no repetition.
  const C = cycle, Tc = C * S48;
  const kind = new Uint8Array(S48), room = new Int32Array(S48);
  const resRng = residents.map((p) => rngFor(seed, STREAM_RESIDENT_DAYS, p));
  const visRng = residents.map((p) => rngFor(seed, STREAM_VISITS, p));
  const visOccRng = residents.map((p) => rngFor(seed, STREAM_VISIT_OCC, p));
  const nAct = sch.activities.length;
  const actWin = new Int32Array(2 * nAct); sch.activities.forEach(([a, b], i) => { actWin[2 * i] = a; actWin[2 * i + 1] = b; });
  const actPrio = new Float64Array(N), actAttend = new Uint8Array(N * Math.max(1, nAct)), actRoomFor = new Int32Array(N * Math.max(1, nAct));
  const idleHours = []; for (let s = sch.morningCareEnd; s < sch.bed; s += 2) idleHours.push(s);
  const nIdle = idleHours.length;
  const idleDraw = new Float64Array(N * nIdle);
  const visitSlots = Math.max(1, Math.round(imp.visitMinutes / 30));
  const visLoungeCut = 1 - imp.visitLoungeShare - imp.visitLobbyShare, visLobbyCut = 1 - imp.visitLobbyShare;
  const tplKind = [], tplRoom = [];
  for (let i = 0; i < nRes; i++) {
    const r = res[residents[i]];
    const k = new Uint8Array(S48).fill(1), rm = new Int32Array(S48).fill(r.bed);
    if (r.mobCode !== 2) {
      for (let s = sch.morningCareEnd; s < sch.bed; s++) k[s] = 0;
      for (const [a, b] of sch.meals) for (let s = a; s < b; s++) { k[s] = 1; rm[s] = r.mealRoom; }
    }
    tplKind.push(k); tplRoom.push(rm);
  }
  const pAct = (mc, a) => (mc === 0 ? (a === 0 ? pc.pActivity : (pc.pActivityPM != null ? pc.pActivityPM : pc.pActivity)) : mc === 1 ? pc.pActivityLimited : 0);
  const pIdle = [pc.pLoungeIdle, pc.pLoungeIdleLimited != null ? pc.pLoungeIdleLimited : pc.pLoungeIdle, 0];
  const att = [];
  const dayBuf = new LocArr(S48 * N).fill(OUT);
  const bedMask = new Uint8Array(nRes * Tc);          // resident-major, cycle: 1 if in own bedroom (planned)
  const resIdx = new Int32Array(N).fill(-1); residents.forEach((p, i) => { resIdx[p] = i; });
  const visitPattern = []; // per cycle day: [{ p, start, rooms, withRes }]
  for (let cd = 0; cd < C; cd++) {
    const base = cd * S48;
    const weekday = isWeekday(cd);
    for (let i = 0; i < nRes; i++) {
      const p = residents[i], rng = resRng[i], mc = res[p].mobCode;
      actPrio[p] = rng();
      for (let a = 0; a < nAct; a++) actAttend[p * nAct + a] = rng() < pAct(mc, a) ? 1 : 0;
      // Free hours: four hours per uniform, 8 bits each (resolution 1/256).
      for (let h = 0; h < nIdle; h += 4) {
        const x = (rng() * 4294967296) >>> 0;
        for (let b = 0; b < 4 && h + b < nIdle; b++) idleDraw[p * nIdle + h + b] = (((x >>> (8 * b)) & 255) + 0.5) / 256;
      }
    }
    for (let a = 0; a < nAct; a++) {
      const s0 = actWin[2 * a], s1 = actWin[2 * a + 1];
      att.length = 0;
      for (let i = 0; i < nRes; i++) {
        const p = residents[i];
        actRoomFor[p * nAct + a] = -1;
        if (!actAttend[p * nAct + a]) continue;
        const r = res[p];
        if (weekday && r.therapyStart >= 0 && r.therapyStart < s1 && r.therapyStart + r.therapySlots > s0) continue;
        att.push(p);
      }
      att.sort((x, y) => actPrio[x] - actPrio[y]);
      for (let i = 0; i < att.length; i++) {
        const p = att[i];
        if (i < pc.activityCapacity) actRoomFor[p * nAct + a] = R.activity;
        else { actRoomFor[p * nAct + a] = res[p].lounge; stats.activityOverflow++; }
      }
    }
    const vpat = [];
    for (let i = 0; i < nRes; i++) {
      const p = residents[i], r = res[p];
      kind.set(tplKind[i]); room.set(tplRoom[i]);
      if (r.mobCode !== 2) {
        if (weekday && r.therapyStart >= 0) for (let s = r.therapyStart; s < r.therapyStart + r.therapySlots; s++) { kind[s] = 1; room[s] = R.therapy; }
        for (let a = 0; a < nAct; a++) {
          const rm = actRoomFor[p * nAct + a];
          if (rm < 0) continue;
          for (let s = actWin[2 * a]; s < actWin[2 * a + 1]; s++) if (kind[s] === 0) { kind[s] = 1; room[s] = rm; }
        }
      }
      // Visits: three uniforms per resident per cycle day, always.
      {
        const rng = visRng[i];
        const uVisit = rng(), uStart = rng(), uLoc = rng();
        if (uVisit < imp.visitsPerResidentPerDay) {
          const [v0, v1] = sch.visiting;
          const start = v0 + Math.floor(uStart * Math.max(1, v1 - v0 - visitSlots + 1));
          // Where the visit happens; bedbound residents are always visited in their room.
          const target = r.mobCode === 2 || uLoc < visLoungeCut ? r.bed : uLoc < visLobbyCut ? r.lounge : R.lobby;
          const vrooms = [], withRes = [];
          for (let s = start; s < Math.min(S48, start + visitSlots); s++) {
            // Together if the resident is free (or already there); otherwise the visitor waits in the lobby.
            const free = kind[s] === 0 || room[s] === target;
            if (free) { kind[s] = 1; room[s] = target; }
            vrooms.push(free ? target : R.lobby); withRes.push(free ? 1 : 0);
          }
          vpat.push({ p, i, start, rooms: vrooms, withRes });
        }
      }
      const pi = pIdle[r.mobCode];
      if (pi > 0) {
        for (let h = 0; h < nIdle; h++) {
          if (!(idleDraw[p * nIdle + h] < pi)) continue;
          const h0 = idleHours[h], h1 = Math.min(h0 + 2, sch.bed);
          for (let s = h0; s < h1; s++) if (kind[s] === 0) room[s] = r.lounge;
        }
      }
      const bm = i * Tc + base, bed = r.bed;
      for (let s = 0; s < S48; s++) { dayBuf[s * N + p] = room[s]; bedMask[bm + s] = room[s] === bed ? 1 : 0; }
    }
    locSlot.set(dayBuf, base * N); // residents of this day; staff columns are OUT and filled below
    visitPattern.push(vpat);
  }
  // Tile the cycle over the season (residents only; staff are written later).
  for (let d = C; d < days; d++) locSlot.copyWithin(d * S48 * N, (d % C) * S48 * N, (d % C + 1) * S48 * N);
  // Visitors for every actual day; infectiousness and emission drawn per occurrence.
  for (let d = 0; d < days; d++) {
    for (const v of visitPattern[d % C]) {
      const rng = visOccRng[v.i];
      const uInf = rng(), z = randNormal(rng);
      visitors.push({ day: d, slot: v.start, g0: d * S48 + v.start, slots: v.rooms.length, resident: v.p, rooms: v.rooms, withRes: v.withRes, uInf, z });
    }
  }
  const resLocC = (gc, p) => locSlot[(gc % Tc) * N + p]; // planned resident location at cycle slot

  // ----- staff: post-level timetable per cycle day and shift -----
  // A template holds, for each post (not person) of a shift: its main room per
  // slot and its contacts. Posts are identified by position in the roster list,
  // which is the same on every day with the same cycle day. Contact parties are
  // encoded: value ≥ 0 a person (resident), value < 0 post (−1 − index).
  const careFrac = Math.min(1, sc.careMinutes / 30), careCap = Math.max(1, Math.floor(30 / Math.max(1e-9, sc.careMinutes)));
  const careTau = sc.careMinutes / 60, assistTau = sc.mealAssistMinutes / 60;
  const medCap = Math.max(1, Math.floor(30 / Math.max(1e-9, sc.medpassMinutes)));
  void careFrac;
  const wingResidents = []; for (let w = 0; w < W; w++) wingResidents.push(residents.filter((p) => res[p].wing === w));
  const wingTables = []; for (let w = 0; w < W; w++) wingTables.push(tables.filter((t) => t.wing === w && t.dining));
  const hkCursor = new Map();
  let floatCursor = 0;
  const wingRoomList = []; for (let w = 0; w < W; w++) { const l = []; rooms.forEach((r, i) => { if (r.wing === w) l.push(i); }); wingRoomList.push(l); }
  const hkRoomCache = new Map();
  const hkRooms = (wings) => { const key = wings.join(','); if (!hkRoomCache.has(key)) { const l = []; for (const w of wings) l.push(...wingRoomList[w]); hkRoomCache.set(key, l); } return hkRoomCache.get(key); };
  const coverageResidents = new Map();
  const residentsOf = (wings) => { const key = wings.join(','); if (!coverageResidents.has(key)) { const l = []; for (const w of wings) l.push(...wingResidents[w]); coverageResidents.set(key, l); } return coverageResidents.get(key); };
  let Lmax = 1; for (const k of SHIFT_NAMES) Lmax = Math.max(Lmax, sch.shifts[k][1]);
  const busyPool = [], loadPool = [];
  const used = new Uint8Array(Lmax), inBed = new Uint8Array(Lmax), brLoad = new Int32Array(Lmax);
  const breakCands = SHIFT_NAMES.map((nm) => { const L = sch.shifts[nm][1]; const c = []; for (let rel = 2; rel <= L - 3; rel++) c.push(rel); const mid = (L - 1) / 2; c.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b); return c; });
  const who = [];
  const therapyResidents = residents.filter((p) => res[p].therapyStart >= 0);
  const roommatePairs = []; if (config.transmission.roommateHours > 0) for (const p of residents) { const m = res[p].roommate; if (m > p) roommatePairs.push([p, m]); }
  const templates = new Array(C * 3);
  const tc = { cap: 4096, rel: new Int32Array(4096), a: new Int32Array(4096), b: new Int32Array(4096), type: new Int32Array(4096), tau: new Float64Array(4096), room: new Int32Array(4096) }; // scratch
  for (let cd = 0; cd < C; cd++) {
    for (let si = 0; si < 3; si++) {
      const posts = rosterAt(cd)[si];
      const nP = posts.length;
      const [sStart, L] = sch.shifts[SHIFT_NAMES[si]];
      const g0c = cd * S48 + sStart; // cycle slot of the shift start (may run past Tc: wraps)
      let tcN = 0;
      const addC = (rel, a, b, type, tau, rm) => {
        if (tcN === tc.cap) { tc.cap *= 2; for (const k of ['rel', 'a', 'b', 'type', 'room']) { const x = new Int32Array(tc.cap); x.set(tc[k]); tc[k] = x; } const y = new Float64Array(tc.cap); y.set(tc.tau); tc.tau = y; }
        tc.rel[tcN] = rel; tc.a[tcN] = a; tc.b[tcN] = b; tc.type[tcN] = type; tc.tau[tcN] = tau; tc.room[tcN++] = rm;
      };
      const main = new Int32Array(Math.max(1, nP) * L).fill(-1);
      for (let i = 0; i < nP; i++) { if (!busyPool[i]) { busyPool[i] = new Uint8Array(Lmax); loadPool[i] = new Uint8Array(Lmax); } busyPool[i].fill(0); loadPool[i].fill(0); }
      const cnaWing = []; for (let w = 0; w < W; w++) cnaWing.push([]);
      for (let i = 0; i < nP; i++) if (posts[i].role === 'cna') for (const w of posts[i].wings) cnaWing[w].push(i);
      // 1. Fixed duties: handover, meal posts, therapy sessions, medicine rounds.
      for (let i = 0; i < nP; i++) {
        const x = posts[i], busy = busyPool[i], mo = i * L;
        const prim = x.wings.length ? x.wings[0] : -1;
        if (WING_ROLES[x.role]) { main[mo] = stationOf[prim]; busy[0] = 1; } // handover at the wing station
        if (x.role === 'cna') {
          const idxInWing = cnaWing[prim].indexOf(i);
          // Post 0 stays on the wing at meals (trays and feeding in rooms, or the lounge if limited residents eat there).
          const mealRoom = idxInWing === 0 ? (limitedInLounge ? loungeOf[prim] : -1) : diningOfWing(prim);
          if (mealRoom >= 0) for (let rel = 0; rel < L; rel++) if (mealSlot[(sStart + rel) % S48]) { main[mo + rel] = mealRoom; busy[rel] = 1; }
        }
        if (x.role === 'dietary' && x.k < fac.diningRooms) {
          for (let rel = 0; rel < L; rel++) if (mealSlot[(sStart + rel) % S48]) { main[mo + rel] = diningIdx[x.k]; busy[rel] = 1; }
        }
        if (x.role === 'therapist' && si === 0 && isWeekday(cd) && therapyLoad[x.k]) {
          for (let rel = 0; rel < L; rel++) if (therapyLoad[x.k][(sStart + rel) % S48] > 0) busy[rel] = 1;
          for (const p of therapyResidents) {
            const r = res[p];
            if (r.therapyPost !== x.k) continue;
            for (let s = r.therapyStart; s < r.therapyStart + r.therapySlots; s++) addC(s - sStart, -1 - i, p, CT.therapy, SLOT_HOURS / therapyLoad[x.k][s], R.therapy);
          }
        }
        if (x.role === 'nurse') {
          const list = residentsOf(x.wings);
          for (const ms of sch.medpass) {
            let rel = ms - sStart; if (rel < 0) rel += S48;
            if (rel >= L) continue;
            for (let n = 0; n < list.length; n++) {
              const rr = rel + Math.floor(n / medCap);
              if (rr >= L) { stats.medpassMissed++; continue; }
              busy[rr] = 1;
              const rp = list[n];
              addC(rr, -1 - i, rp, CT.medpass, sc.medpassMinutes / 60, resLocC(g0c + rr, rp));
            }
          }
        }
      }
      // Optional roommate contact, in whichever shift covers that slot of the day.
      if (roommatePairs.length) {
        const rel = ((sch.roommateSlot - sStart) % S48 + S48) % S48;
        if (rel < L) for (const [p, m] of roommatePairs) addC(rel, p, m, CT.roommate, config.transmission.roommateHours, res[p].bed);
      }
      // 2. Breaks: one slot each, least-loaded free candidate, never above capacity.
      const cands = breakCands[si];
      brLoad.fill(0);
      for (let i = 0; i < nP; i++) {
        const busy = busyPool[i];
        let best = -1;
        for (let c = 0; c < cands.length; c++) { const rel = cands[c]; if (!busy[rel] && brLoad[rel] < sc.breakroomCapacity && (best < 0 || brLoad[rel] < brLoad[best])) best = rel; }
        if (best < 0) { stats.breaksSkipped++; continue; }
        brLoad[best]++; busy[best] = 1; main[i * L + best] = R.breakroom;
      }
      for (let c = 0; c < cands.length; c++) {
        const rel = cands[c];
        if (brLoad[rel] < 2) continue;
        who.length = 0;
        for (let i = 0; i < nP; i++) if (main[i * L + rel] === R.breakroom) who.push(i);
        for (let t = 0; t < who.length; t += sc.breakTableSize) {
          const te = Math.min(who.length, t + sc.breakTableSize);
          for (let a = t; a < te; a++) for (let b = a + 1; b < te; b++) addC(rel, -1 - who[a], -1 - who[b], CT.break, SLOT_HOURS, R.breakroom);
        }
      }
      // 3. Meal assistance at dining tables (dining-post CNAs ↔ residents at their tables).
      if (sc.mealAssistMinutes > 0) {
        for (let w = 0; w < W; w++) {
          const helpers = cnaWing[w].slice(1).filter((i) => posts[i].wings[0] === w);
          if (!helpers.length) continue;
          const tl = wingTables[w];
          for (let ti = 0; ti < tl.length; ti++) {
            const hp = -1 - helpers[ti % helpers.length];
            for (const ms of mealStarts) {
              let rel = ms - sStart; if (rel < 0) rel += S48;
              if (rel >= L) continue;
              for (const m of tl[ti].members) addC(rel, hp, m, CT.table, assistTau, tl[ti].room);
            }
          }
        }
      }
      // 4. Personal care: each CNA's panel gets careEpisodesPerShift episodes
      // per resident, spread over the shift, in the resident's bedroom, when the
      // resident is there and the CNA is free; post 0 also helps bedbound
      // residents eat in their rooms.
      const E = sc.careEpisodesPerShift[SHIFT_NAMES[si]] | 0;
      for (let w = 0; w < W; w++) {
        const cp = cnaWing[w];
        if (!cp.length) continue;
        const wr = wingResidents[w];
        for (let ri = 0; ri < wr.length; ri++) {
          const rp = wr[ri], bed = res[rp].bed;
          const i = cp[ri % cp.length], ld = loadPool[i], bz = busyPool[i];
          used.fill(0, 0, L);
          let anyBed = false;
          const bm = resIdx[rp] * Tc;
          for (let rel = 0; rel < L; rel++) { inBed[rel] = bedMask[bm + (g0c + rel) % Tc]; if (inBed[rel]) anyBed = true; }
          if (res[rp].mobCode === 2 && sc.mealAssistMinutes > 0) {
            const helper = cp[0], hld = loadPool[helper];
            for (const ms of mealStarts) {
              let rel = ms - sStart; if (rel < 0) rel += S48;
              for (let r2 = rel; r2 < Math.min(L, rel + 2); r2++) {
                if (hld[r2] >= careCap || busyPool[helper][r2]) continue;
                hld[r2]++;
                if (inBed[r2]) addC(r2, -1 - helper, rp, CT.care, assistTau, bed);
                break;
              }
            }
          }
          for (let e = 0; e < E; e++) {
            stats.careEpisodesPlanned++;
            const target = Math.min(L - 1, Math.max(0, Math.floor((e + 0.5) * L / E) + ((ri % 3) - 1)));
            let placed = false;
            for (let n = 0; anyBed && n < 2 * L; n++) {
              const off = (n + 1) >> 1, rel = n & 1 ? target + off : target - off;
              if (rel < 0 || rel >= L || !inBed[rel] || bz[rel] || used[rel] || ld[rel] >= careCap) continue;
              ld[rel]++; used[rel] = 1; placed = true;
              addC(rel, -1 - i, rp, CT.care, careTau, bed);
              break;
            }
            if (!placed) stats.careEpisodesUnplaced++;
          }
        }
      }
      // 5. Main rooms for the rest of the shift; rotating roles.
      for (let i = 0; i < nP; i++) {
        const x = posts[i], busy = busyPool[i], mo = i * L;
        const prim = x.wings.length ? x.wings[0] : -1;
        const def = workplaceOf(x.role, prim, x.k);
        for (let rel = 0; rel < L; rel++) {
          if (main[mo + rel] >= 0) continue;
          if (x.role === 'housekeeping') {
            const key = x.groupIndex * 1000 + x.k;
            const list = hkRooms(x.wings);
            const c = hkCursor.get(key) || 0; hkCursor.set(key, c + 1);
            main[mo + rel] = list[c % list.length];
          } else if (x.role === 'rn') {
            main[mo + rel] = stationOf[(Math.floor(rel / 2) + x.k) % W]; // supervisor rounds: a different wing each hour
          } else if (x.role === 'aideFloat' && !busy[rel]) {
            // Restorative / bath aide: care rounds through all residents of the home.
            let firstWing = -1, k = 0;
            for (let tries = 0; tries < 2 * careCap && k < careCap; tries++) {
              const rp = residents[floatCursor++ % nRes];
              if (!bedMask[resIdx[rp] * Tc + (g0c + rel) % Tc]) continue;
              addC(rel, -1 - i, rp, CT.care, careTau, res[rp].bed);
              if (firstWing < 0) firstWing = res[rp].wing;
              k++;
            }
            main[mo + rel] = stationOf[firstWing >= 0 ? firstWing : 0];
          } else main[mo + rel] = def;
        }
      }
      // Order contacts by slot within the shift (stable counting sort).
      const n = tcN;
      const T2 = { nP, L, sStart, main, n, rel: new Int32Array(n), a: new Int32Array(n), b: new Int32Array(n), type: new Uint8Array(n), tau: new Float64Array(n), room: new Int32Array(n) };
      const cnt = new Int32Array(L + 1);
      for (let k = 0; k < n; k++) cnt[tc.rel[k] + 1]++;
      for (let r = 0; r < L; r++) cnt[r + 1] += cnt[r];
      for (let o = 0; o < n; o++) { const k = cnt[tc.rel[o]]++; T2.rel[k] = tc.rel[o]; T2.a[k] = tc.a[o]; T2.b[k] = tc.b[o]; T2.type[k] = tc.type[o]; T2.tau[k] = tc.tau[o]; T2.room[k] = tc.room[o]; }
      templates[cd * 3 + si] = T2;
    }
  }
  // ----- staff: actual days (roster persons on the cycle timetable) -----
  // Two passes: count contacts, then write them straight into exact-size
  // arrays. Shift-days are visited in time order and each template is sorted
  // by slot, so the contacts come out sorted by slot (checked).
  const shiftDays = [];
  let nC = 0;
  for (let d = -1; d < days; d++) {
    const cd = ((d % C) + C) % C;
    for (let si = 0; si < 3; si++) {
      const posts = rosterAt(d)[si];
      const tp = templates[cd * 3 + si];
      if (!posts.length || !tp || tp.nP !== posts.length) continue;
      const L = tp.L, g0 = d * S48 + tp.sStart;
      if (g0 + L <= 0 || g0 >= T) continue;
      const relLo = Math.max(0, -g0), relHi = Math.min(L, T - g0);
      for (let i = 0; i < posts.length; i++) {
        const person = posts[i].person, mo = i * L;
        for (let rel = relLo; rel < relHi; rel++) locSlot[(g0 + rel) * N + person] = tp.main[mo + rel];
      }
      let k0 = 0; while (k0 < tp.n && tp.rel[k0] < relLo) k0++;
      let k1 = k0; while (k1 < tp.n && tp.rel[k1] < relHi) k1++;
      shiftDays.push(posts, tp, g0, k0, k1);
      nC += k1 - k0;
    }
  }
  const cstart = new Int32Array(T + 1), ca = new Uint16Array(nC), cb = new Uint16Array(nC), ct = new Uint8Array(nC), ctau = new Float32Array(nC), croom = new Uint16Array(nC);
  let kk = 0, lastG = -1, sorted = true;
  for (let q = 0; q < shiftDays.length; q += 5) {
    const posts = shiftDays[q], tp = shiftDays[q + 1], g0 = shiftDays[q + 2], k0 = shiftDays[q + 3], k1 = shiftDays[q + 4];
    for (let k = k0; k < k1; k++, kk++) {
      const a = tp.a[k], b = tp.b[k], g = g0 + tp.rel[k];
      if (g < lastG) sorted = false;
      lastG = g;
      cstart[g + 1]++; ca[kk] = a < 0 ? posts[-1 - a].person : a; cb[kk] = b < 0 ? posts[-1 - b].person : b;
      ct[kk] = tp.type[k]; ctau[kk] = tp.tau[k]; croom[kk] = tp.room[k];
    }
  }
  if (!sorted) throw new Error('shift timetable overlaps: contacts not in slot order (check schedule.shifts)');
  for (let g = 0; g < T; g++) cstart[g + 1] += cstart[g];
  const contactsCSR = { start: cstart, length: nC, a: ca, b: cb, type: ct, tau: ctau, room: croom };

  const struct = finishStructure(config, {
    rooms, people, days, locSlot, contactsCSR, tables, visitors, fallbackRoom, stats,
    roster: makeRosterView(groups.map((g) => ({ role: g.role, shift: g.shift, wings: g.wings, c: g.c, m: g.m, weekdaysOnly: g.weekdaysOnly, members: g.members })),
      roster.map((perShift) => perShift.map((posts) => posts.map((x) => ({ person: x.person, role: x.role, wings: x.wings, k: x.k }))))),
  });
  struct.achFromConfig = true;
  return struct;
}

// Roster view kept on the world. Defined at module level so the world does not
// keep buildStructure's whole scope (templates, scratch buffers) alive.
function makeRosterView(groups, plain) {
  return { groups, onDuty: (d, shift) => plain[d + 1][SHIFT_NAMES.indexOf(shift)].map((x) => ({ ...x })) };
}

// ===========================================================================
// 3.1 Room air: exact solution of the well-mixed box over one slot
// ===========================================================================
// dC/dt = S/V − λC  (C quanta/m³, S quanta/h, V m³, λ 1/h), constant over Δ h.
// Steady state Css = S/(Vλ). Starting from C0:
//   C(t)  = Css + (C0 − Css)·e^{−λt}
//   Cend  = C(Δ)
//   Cbar  = (1/Δ)∫₀^Δ C dt = Css + (C0 − Css)·(1 − e^{−λΔ})/(λΔ)
export function roomAirStep(C0, S, V, lambda, dt) {
  const Css = S / (V * lambda);
  const e = Math.exp(-lambda * dt);
  const avgF = (1 - e) / (lambda * dt);
  return { Css, cbar: Css + (C0 - Css) * avgF, cend: Css + (C0 - Css) * e };
}

// Maker's mounting rule: share of full UV output allowed at a given ceiling
// height, linear between the table's heights and clamped at the ends.
// table = [[height m, fraction], ...] sorted by height.
export function lampOutputFraction(config, height) {
  const L = config.lamp;
  if (!(L.followMountingRule === undefined || L.followMountingRule === true || L.followMountingRule === 1)) return 1;
  const t = L.mountingTable || [[2.15, 0.2], [2.3, 0.4], [2.45, 0.7], [2.6, 1.0]];
  if (height <= t[0][0]) return t[0][1];
  if (height >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 1; i < t.length; i++) if (height <= t[i][0]) { const [h0, f0] = t[i - 1], [h1, f1] = t[i]; return f0 + (f1 - f0) * (height - h0) / (h1 - h0); }
  return 1;
}
// Clean-air delivery of one lamp in a room at perfect mixing (m³/h):
//   0.36 × susceptibility (cm²/mJ) × output (mW) × output fraction(ceiling) × path length (m)
// path length = ceiling height × pathFactor. (0.36 converts: m³/h from
// cm²/mJ × mW × m, via room-average fluence ≈ P·L/(10·V) µW/cm² and
// eACH = 3.6 × k × fluence.) Legacy configs without lamp.susceptibility use
// lamp.ecadr as a fixed per-lamp value.
// Wall-mounted lamps: every figure is read from a table made with OSLUV's Illuminate (config.lamp.wall, or
// config.lamp.across for lamps pointed straight across; see experiments/illuminate_table.py):
//   path   the light's average path through the room's air, metres per lamp
//   limit  the multiple of full output at which Illuminate's exposure check is met for 8 hours a day
// for 1 to 4 times the page's lamp density (table.m2PerLamp of floor per lamp, at least one lamp), floor areas and
// ceiling heights. Interpolated between densities, floor areas (on a log scale) and heights, and held at the
// table's edges beyond them. share = min(1, limit), the output the 8-hour check allows.
export function wallLampAt(table, area, height, mult = 1) {
  const at = (xs, x) => { if (xs.length < 2) return [0, 0]; let i = 1; while (i < xs.length - 1 && x > xs[i]) i++; return [i - 1, Math.max(0, Math.min(1, (x - xs[i - 1]) / (xs[i] - xs[i - 1])))]; };
  const [i, fa] = at(table.areas.map(Math.log), Math.log(Math.max(1e-6, area))), [j, fh] = at(table.heights, height);
  const flat = (T) => (T[i][j] * (1 - fh) + T[i][j + 1] * fh) * (1 - fa) + (T[i + 1][j] * (1 - fh) + T[i + 1][j + 1] * fh) * fa;
  if (!table.mults) { const share = flat(table.share); return { path: flat(table.path), limit: share, share }; }   // tables made before lamp density was added
  const [m, fm] = at(table.mults, mult), M = table.mults.length > 1 ? m + 1 : m;
  const mix = (T) => flat(T[m]) * (1 - fm) + flat(T[M]) * fm;
  const limit = mix(table.limit);
  return { path: mix(table.path), limit, share: Math.min(1, limit) };
}
// The page's lamp density for a room: how many lamps "one per table.m2PerLamp of floor, at least one" comes to.
export function wallLampBase(table, area) { return Math.max(1, Math.round(area / (table.m2PerLamp || 23.2258))); }
// Clean air one lamp delivers in a room that holds n of them, at perfect mixing (m³/h). This is Illuminate's
// equivalent air changes, eACH-UV = 3.6 × k × average fluence rate (guv_calcs.efficacy.eACH_UV), times the room's
// volume and divided by the lamps: with the average fluence rate written as output × path ÷ (10 × volume), in
// µW/cm² from mW and metres, it becomes 0.36 × k (cm²/mJ) × output (mW) × share of full output × path (m).
// Bedrooms: Illuminate's check assumes 8 hours a day in a room. config.lamp.bedroomShare is the share of that
// allowance bedroom lamps may use (8 ÷ the hours a day the limit is to be met over), so they are dimmed further.
export function lampCadrFor(config, room, n = 0) {
  const L = config.lamp;
  if (L.susceptibility == null) return L.ecadr;
  const h = room.height > 0 ? room.height : 2.4;
  if (L.mount === 'wall' && L.wall) {   // high on a wall
    const table = (L.aimAcross === 1 || L.aimAcross === true) && L.across ? L.across : L.wall;   // pointed straight across the room, or angled down
    const area = room.area > 0 ? room.area : room.volume / h;
    const w = wallLampAt(table, area, h, n > 0 ? n / wallLampBase(table, area) : 1);
    const follow = L.followMountingRule === undefined || L.followMountingRule === true || L.followMountingRule === 1;
    const allowance = room.type === 'bedroom' && L.bedroomShare != null ? Math.max(0, Math.min(1, L.bedroomShare)) : 1;
    const dim = follow ? Math.min(1, w.limit * allowance) : 1;
    return 0.36 * L.susceptibility * (L.outputMw != null ? L.outputMw : 100) * dim * w.path * (L.pathFactor != null ? L.pathFactor : 1);
  }
  return 0.36 * L.susceptibility * (L.outputMw != null ? L.outputMw : 100) * lampOutputFraction(config, h) * h * (L.pathFactor != null ? L.pathFactor : 1);
}
// Equivalent air changes per hour added by n lamps in a room (1/h): n × clean air per lamp ÷ volume × realWorldFactor.
// Wall lamps: lamps beyond the densest row of Illuminate's table (4 times the page's density) add nothing, because
// the table says nothing about them. realWorldFactor = mixing / shadowing efficiency.
// Configs that carry lamp.maxEach / lamp.maxEachBedroom (the ceiling-lamp model, before Illuminate's exposure check
// was used room by room) are capped there first.
export function lampAchFor(config, room, n) {
  if (!(n > 0) || !(room.volume > 0)) return 0;
  const L = config.lamp;
  let count = n;
  if (L.mount === 'wall' && L.wall && L.susceptibility != null) {
    const table = (L.aimAcross === 1 || L.aimAcross === true) && L.across ? L.across : L.wall;
    if (table.mults) count = Math.min(n, wallLampBase(table, room.area > 0 ? room.area : room.volume / (room.height > 0 ? room.height : 2.4)) * table.mults[table.mults.length - 1]);
  }
  const cap = room.type === 'bedroom' && L.maxEachBedroom != null ? L.maxEachBedroom : L.maxEach;
  const raw = count * lampCadrFor(config, room, count) / room.volume;
  return (cap != null ? Math.min(raw, cap) : raw) * L.realWorldFactor;
}

// Removal rate λ (1/h) of every room for an intervention, and the lamp eACH.
export function roomLambdas(world, intervention = {}) {
  const cfg = world.config;
  const lamps = intervention.lamps || {}, cleaners = intervention.cleaners || {};
  for (const id of Object.keys(lamps)) if (world.roomIndex[id] == null) throw new Error(`unknown room id in lamps: ${id}`);
  for (const id of Object.keys(cleaners)) if (world.roomIndex[id] == null) throw new Error(`unknown room id in cleaners: ${id}`);
  const n = world.nRooms;
  const lambda = new Float64Array(n), lampAch = new Float64Array(n), hasLamp = new Uint8Array(n);
  for (let r = 0; r < n; r++) {
    const room = world.rooms[r];
    if (room.type === 'outside' || !(room.volume > 0)) continue;
    const nl = lamps[room.id] || 0;
    if (nl > 0) { lampAch[r] = lampAchFor(cfg, room, nl); hasLamp[r] = 1; }
    const cleanAch = (cleaners[room.id] || 0) / room.volume;
    lambda[r] = room.ach * cfg.ventilation.scale + cfg.air.decay + cfg.air.deposition + lampAch[r] + cleanAch;
  }
  return { lambda, lampAch, hasLamp };
}

// Effective room after behavioural overrides, for playback (slow path).
function effectiveRoomFromOverrides(world, ov, p, g, base) {
  for (const w of ov.excluded) if (w.person === p && g >= w.from && g < w.to) return world.outside;
  if (!world.isStaff[p]) for (const w of ov.isolated) if (w.person === p && g >= w.from && g < w.to) return world.homeRoom[p];
  const sd = g % SLOTS_PER_DAY;
  let nActive = 0, mine = false;
  for (const w of ov.outbreak) if (g >= w.from && g < w.to) { nActive++; if (w.wing === world.wingOf[p]) mine = true; }
  const facilityWide = nActive >= ov.facilityWideWings;
  const t = world.roomType[base];
  if (!world.isStaff[p]) {
    if ((mine || facilityWide) && ov.groupSlot[sd] && (t === RT.dining || t === RT.activity || t === RT.lounge)) return world.homeRoom[p];
  } else if (t === RT.dining && (facilityWide || (mine && world.wingOf[p] >= 0))) return world.fallbackRoom[p];
  return base;
}

// ===========================================================================
// 5. runSeason
// ===========================================================================
// opts: { record: bool, introductions: [{ person, day = 0, slot = 0, stage: 'E' | 'I' }] }
export function runSeason(world, intervention = {}, opts = {}) {
  const cfg = world.config;
  const { N, T, nRooms, days, rooms, roomType, isStaff, homeRoom, fallbackRoom, wingOf, locSlot, traits } = world;
  const DT = SLOT_HOURS;
  const S48 = SLOTS_PER_DAY;
  const tx = cfg.transmission, dis = cfg.disease, ctl = cfg.control, obc = ctl.outbreakMode;
  const W = world.nWings;

  // ---- room removal rates (1/h) and one-slot decay factors ----
  const { lambda, hasLamp } = roomLambdas(world, intervention);
  const volume = new Float64Array(nRooms), eDec = new Float64Array(nRooms), avgF = new Float64Array(nRooms), airRoom = new Uint8Array(nRooms);
  const nearF = new Float64Array(nRooms);
  for (let r = 0; r < nRooms; r++) {
    volume[r] = rooms[r].volume;
    airRoom[r] = rooms[r].type !== 'outside' && volume[r] > 0 && lambda[r] > 0 ? 1 : 0;
    if (!airRoom[r]) continue;
    eDec[r] = Math.exp(-lambda[r] * DT);                 // fraction of C left after one slot
    avgF[r] = (1 - eDec[r]) / (lambda[r] * DT);           // slot-average weight of (C0 − Css)
    nearF[r] = hasLamp[r] ? 1 - tx.nearFieldUV : 1;      // near-field excess left after lamp
  }

  // ---- context tables: emission multiplier and breathing rate by (staff?, room type) ----
  const nT = ROOM_TYPES.length;
  const ctxOf = (staff, t) => (staff ? (t === RT.breakroom ? CTX_SOCIAL : CTX_WORK) : (t === RT.bedroom ? CTX_REST : CTX_SOCIAL));
  const actMul = [cfg.emission.activity.rest, cfg.emission.activity.social, cfg.emission.activity.work];
  const brRate = [cfg.breathing.rest, cfg.breathing.social, cfg.breathing.work]; // m³/h
  const emitRT = new Float64Array(2 * nT), breatheRT = new Float64Array(2 * nT);
  for (let st = 0; st < 2; st++) for (let t = 0; t < nT; t++) { const c = ctxOf(st, t); emitRT[st * nT + t] = actMul[c]; breatheRT[st * nT + t] = brRate[c]; }
  // Masks: staff while working (not in the break room); residents and visitors none.
  // Mask efficiencies scaled by the share of the time masks are actually worn.
  const comp = ctl.maskCompliance != null ? ctl.maskCompliance : 1;
  const maskOf = (name) => { const m = ctl.masks[name] || ctl.masks.none || { in: 0, out: 0 }; return { in: m.in * comp, out: m.out * comp }; };
  const baseMask = maskOf(ctl.staffMask || 'none');
  const obMaskCfg = maskOf(obc.outbreakMask || 'none');
  const obMask = { in: Math.max(baseMask.in, obMaskCfg.in), out: Math.max(baseMask.out, obMaskCfg.out) };
  let mIn = baseMask.in, mOut = baseMask.out; // current staff mask (stronger while any wing is in outbreak mode)
  const maskInOf = (p, t) => (isStaff[p] && t !== RT.breakroom ? mIn : 0);
  const maskOutOf = (p, t) => (isStaff[p] && t !== RT.breakroom ? mOut : 0);

  // ---- state ----
  const state = new Uint8Array(N);
  const tE = new Int32Array(N).fill(NEVER), tInf = new Int32Array(N).fill(NEVER), tSym = new Int32Array(N).fill(NEVER), tEnd = new Int32Array(N).fill(NEVER);
  const isoFrom = new Int32Array(N).fill(NEVER), isoTo = new Int32Array(N).fill(NEVER);
  const exFrom = new Int32Array(N).fill(NEVER), exTo = new Int32Array(N).fill(NEVER);
  const dose = new Float64Array(N);            // cumulative effective dose A_i (quanta)
  const emitBase = new Float64Array(N);        // q_j × profile, quanta/h at rest; 0 if not infectious now
  const active = [];                           // people in E or I states
  const C = new Float64Array(nRooms);          // concentration carried between slots (quanta/m³)
  const Sr = new Float64Array(nRooms), cbar = new Float64Array(nRooms), topSrc = new Int32Array(nRooms).fill(-1), topSrcVal = new Float64Array(nRooms), lastSrc = new Int32Array(nRooms).fill(-1);
  const visFrac = new Float64Array(N);         // Σ sub-slot visit fractions this slot
  let maxPres = 16; for (let g = 0; g < T; g++) maxPres = Math.max(maxPres, world.visits.start[g + 1] - world.visits.start[g] + world.contacts.start[g + 1] - world.contacts.start[g]);
  const presP = new Int32Array(maxPres), presR = new Int32Array(maxPres), presF = new Float64Array(maxPres);
  const stamp = new Int32Array(N).fill(-1), dRoom = new Float64Array(N), dClose = new Float64Array(N);
  const bestRoomR = new Int32Array(N), bestRoomD = new Float64Array(N), bestCloseSrc = new Int32Array(N), bestCloseD = new Float64Array(N), bestCloseR = new Int32Array(N);
  const touched = [];
  const special = new Uint8Array(N);
  const daily = { newResident: new Int16Array(days), newStaff: new Int16Array(days), infectiousResident: new Int16Array(days), infectiousStaff: new Int16Array(days), importations: new Int16Array(days) };
  const roomInf = new Int32Array(nRooms), roomInfRoom = new Int32Array(nRooms), roomInfClose = new Int32Array(nRooms);
  const roomDoseRoom = new Float64Array(nRooms), roomDoseClose = new Float64Array(nRooms), roomInfHours = new Float64Array(nRooms);
  const events = [];
  const totals = { residentInfected: 0, staffInfected: 0, residentSymptomatic: 0, staffSymptomatic: 0, residentHospitalized: 0, importations: 0, byRoute: { room: 0, close: 0, community: 0 }, outbreaks: 0, largestCluster: 0 };
  // Symptomatic onsets per wing per day (detection for outbreak mode).
  const onsetsWD = new Int32Array(W * (days + 1));
  const residentOnsetDay = new Int32Array(days + 1);
  const record = !!opts.record;
  const conc = record ? new Float32Array(T * nRooms) : null;
  const facilityWideWings = obc.facilityWideWings != null ? obc.facilityWideWings : 2;
  const ov = record ? { excluded: [], isolated: [], outbreak: [], groupSlot: world.groupSlot, facilityWideWings } : null;
  let nAir = 0;
  const C_FLOOR = 1e-12;                        // quanta/m³ below which C is set to 0 (skip test)
  // Outbreak mode per wing: active while obFrom[w] ≤ g < obUntil[w]; facility-wide
  // when facilityWideWings or more wings are active.
  const obFrom = new Int32Array(W).fill(NEVER), obUntil = new Int32Array(W).fill(-1), obEntry = new Int32Array(W).fill(-1);
  const obWing = new Uint8Array(W);             // wing in outbreak mode today (incl. facility-wide)
  let obAny = false, obAll = false;
  const groupSlot = world.groupSlot, mealSlot = world.mealSlot;
  const tbl = world.tables;
  const G = tx.G;
  const betaArr = CONTACT_TYPES.map((c) => tx.beta[c]);

  // Share of infected residents admitted to hospital. It is a fixed share: admission does not
  // depend on dose, and an admitted resident is not removed from the building.
  const pHosp = (cfg.severity && cfg.severity.pHospital) || 0;
  function infect(p, gInf, route, roomIdx, source, dayIdx, slotIdx) {
    state[p] = ST_E;
    if (isStaff[p] !== 1 && traits.hospU[p] < pHosp) totals.residentHospitalized++;
    tE[p] = gInf;
    tInf[p] = gInf + traits.latent[p];
    tSym[p] = tInf[p] + traits.presym[p];
    tEnd[p] = tSym[p] + traits.infDur[p];
    active.push(p);
    const staff = isStaff[p] === 1;
    if (staff) { totals.staffInfected++; daily.newStaff[dayIdx]++; } else { totals.residentInfected++; daily.newResident[dayIdx]++; }
    if (traits.symptomatic[p]) {
      if (staff) totals.staffSymptomatic++; else totals.residentSymptomatic++;
      const od = Math.floor(tSym[p] / S48);
      if (od >= 0 && od < days) {
        if (!staff) residentOnsetDay[od]++;
        if (wingOf[p] >= 0 && (!staff || obc.countStaff)) onsetsWD[wingOf[p] * (days + 1) + od]++;
      }
      if (!staff && ctl.residentIsolation.enabled) {
        isoFrom[p] = tSym[p] + Math.round(ctl.residentIsolation.isolationDelayDays * S48);
        isoTo[p] = isoFrom[p] + Math.round(ctl.residentIsolation.isolationDays * S48);
        if (ov) ov.isolated.push({ person: p, from: isoFrom[p], to: isoTo[p] });
      }
      if (staff && ctl.staffExclusion.enabled && traits.staysHome[p]) {
        exFrom[p] = tSym[p] + traits.homeDelaySlots[p];
        exTo[p] = exFrom[p] + Math.round(ctl.staffExclusion.exclusionDays * S48);
        if (ov) ov.excluded.push({ person: p, from: exFrom[p], to: exTo[p] });
      }
      // A window that starts later today must take effect today.
      if (isoFrom[p] < (dayIdx + 1) * S48 || exFrom[p] < (dayIdx + 1) * S48) special[p] = 1;
    }
    totals.byRoute[ROUTES[route]]++;
    const importation = route === 2 || (source >= N);
    if (importation) { totals.importations++; daily.importations[dayIdx]++; }
    roomInf[roomIdx]++;
    if (route === 0) roomInfRoom[roomIdx]++; else if (route === 1) roomInfClose[roomIdx]++;
    events.push({ day: dayIdx, slot: slotIdx, person: p, role: world.people[p].role, wing: world.people[p].wing, route: ROUTES[route], roomId: rooms[roomIdx].id, source });
  }
  function addRoomDose(i, r, dd, g) {
    if (!(dd > 0)) return;
    if (stamp[i] !== g) { stamp[i] = g; dRoom[i] = 0; dClose[i] = 0; bestRoomD[i] = 0; bestCloseD[i] = 0; bestRoomR[i] = r; bestCloseR[i] = r; bestCloseSrc[i] = -1; touched.push(i); }
    dose[i] += dd; dRoom[i] += dd; roomDoseRoom[r] += dd;
    if (dd > bestRoomD[i]) { bestRoomD[i] = dd; bestRoomR[i] = r; }
  }
  function addCloseDose(i, src, r, dd, g) {
    if (!(dd > 0)) return;
    if (stamp[i] !== g) { stamp[i] = g; dRoom[i] = 0; dClose[i] = 0; bestRoomD[i] = 0; bestCloseD[i] = 0; bestRoomR[i] = r; bestCloseR[i] = r; bestCloseSrc[i] = -1; touched.push(i); }
    dose[i] += dd; dClose[i] += dd; roomDoseClose[r] += dd;
    if (dd > bestCloseD[i]) { bestCloseD[i] = dd; bestCloseR[i] = r; bestCloseSrc[i] = src; }
  }

  const intro = (opts.introductions || []).map((x) => ({ person: x.person, g: (x.day || 0) * S48 + (x.slot || 0), stage: x.stage || 'E' })).sort((a, b) => a.g - b.g);
  let introIdx = 0;
  const comm = [];
  for (let p = 0; p < N; p++) if (traits.communityDay[p] < days) comm.push(p);
  comm.sort((a, b) => traits.communityDay[a] - traits.communityDay[b] || a - b);
  let commIdx = 0;

  const vE = world.visitorEmit, vis = world.visits, con = world.contacts;
  const outside = world.outside;

  // Effective main room of person p at slot g (behavioural overrides applied).
  const effRoom = (p, g, base, sd) => {
    if (g >= exFrom[p] && g < exTo[p]) return outside;
    if (!isStaff[p]) {
      if (g >= isoFrom[p] && g < isoTo[p]) return homeRoom[p];
      if (obAny && groupSlot[sd] && obWing[wingOf[p]]) { const t = roomType[base]; if (t === RT.dining || t === RT.activity || t === RT.lounge) return homeRoom[p]; }
    } else if (obAny && roomType[base] === RT.dining && (obAll || (wingOf[p] >= 0 && obWing[wingOf[p]]))) return fallbackRoom[p];
    return base;
  };

  for (let d = 0; d < days; d++) {
    // Outbreak mode for today.
    if (obc.enabled) {
      const g0 = d * S48;
      let nAct = 0;
      for (let w = 0; w < W; w++) { obWing[w] = g0 >= obFrom[w] && g0 < obUntil[w] ? 1 : 0; nAct += obWing[w]; }
      obAll = nAct >= facilityWideWings;
      if (obAll) obWing.fill(1);
      obAny = nAct > 0;
    }
    if (obAny) { mIn = obMask.in; mOut = obMask.out; } else { mIn = baseMask.in; mOut = baseMask.out; }
    // People whose room may differ from the plan today (excluded, isolated, or
    // on a wing in outbreak mode); everyone else skips the override checks.
    {
      const d0 = d * S48, d1 = d0 + S48;
      for (let p = 0; p < N; p++) {
        special[p] = (exFrom[p] < d1 && exTo[p] > d0) || (!isStaff[p] && isoFrom[p] < d1 && isoTo[p] > d0) ||
          (obAny && (isStaff[p] ? (obAll || (wingOf[p] >= 0 && obWing[wingOf[p]] === 1)) : obWing[wingOf[p]] === 1)) ? 1 : 0;
      }
    }
    while (commIdx < comm.length && traits.communityDay[comm[commIdx]] === d) {
      const p = comm[commIdx++];
      if (state[p] === ST_S) infect(p, d * S48, 2, outside, -1, d, 0);
    }
    for (let s = 0; s < S48; s++) {
      const g = d * S48 + s;
      while (introIdx < intro.length && intro[introIdx].g <= g) {
        const x = intro[introIdx++];
        if (state[x.person] !== ST_S) continue;
        infect(x.person, x.stage === 'I' ? g - traits.latent[x.person] : g, 2, outside, -1, d, s);
      }

      // ---- disease progression and current emission (quanta/h at rest) ----
      let nEmit = 0;
      for (let k = active.length - 1; k >= 0; k--) {
        const p = active[k];
        if (g >= tEnd[p]) { state[p] = ST_R; emitBase[p] = 0; active[k] = active[active.length - 1]; active.pop(); continue; }
        if (g < tInf[p]) { emitBase[p] = 0; continue; }
        let prof;
        if (g < tSym[p]) { state[p] = ST_IPRE; prof = 1; }
        else {
          state[p] = traits.symptomatic[p] ? ST_ISYM : ST_IASYM;
          // 1.0 for peakDays after onset, then linear to tailLevel at tEnd.
          const since = (g - tSym[p]) / S48, len = (tEnd[p] - tSym[p]) / S48;
          if (since < dis.peakDays || len <= dis.peakDays) prof = 1;
          else prof = 1 - (1 - dis.tailLevel) * (since - dis.peakDays) / (len - dis.peakDays);
        }
        if (!traits.symptomatic[p]) prof *= dis.asymRelInf;
        emitBase[p] = traits.q[p] * prof;
        nEmit++;
      }
      const v0 = vE.start[g], v1 = vE.start[g + 1];
      if (nEmit === 0 && nAir === 0 && v0 === v1) continue; // nothing infectious, no virus in the air
      const sd = s;
      const base = g * N;
      // Sub-slot presence this slot: explicit visits plus staff in a room for a
      // care or medicine-round contact (fraction τ / Δ of the slot).
      let nPres = 0;
      for (let k = vis.start[g]; k < vis.start[g + 1]; k++) { presP[nPres] = vis.person[k]; presR[nPres] = vis.room[k]; presF[nPres++] = vis.frac[k]; }
      for (let k = con.start[g]; k < con.start[g + 1]; k++) if (PRESENCE_TYPE[con.type[k]]) { presP[nPres] = con.a[k]; presR[nPres] = con.room[k]; presF[nPres++] = Math.min(1, con.tau[k] / DT); }
      for (let k = 0; k < nPres; k++) visFrac[presP[k]] += presF[k];

      // ---- 3.1 sources: S_r = Σ_j f_jr · E_j · (1 − maskOut_j)   [quanta/h] ----
      if (nEmit > 0) {
        for (let k = 0; k < active.length; k++) {
          const j = active[k];
          if (emitBase[j] === 0) continue;
          const r = special[j] ? effRoom(j, g, locSlot[base + j], sd) : locSlot[base + j];
          if (r === outside) continue;
          const f = 1 - visFrac[j];
          if (f > 0) {
            const t = roomType[r];
            const e = f * emitBase[j] * emitRT[isStaff[j] * nT + t] * (1 - maskOutOf(j, t));
            Sr[r] += e; roomInfHours[r] += f * DT;
            if (e > topSrcVal[r]) { topSrcVal[r] = e; topSrc[r] = j; }
          }
        }
        for (let k = 0; k < nPres; k++) {
          const j = presP[k];
          if (emitBase[j] === 0 || (g >= exFrom[j] && g < exTo[j])) continue;
          const r = presR[k], t = roomType[r];
          const e = presF[k] * emitBase[j] * emitRT[isStaff[j] * nT + t] * (1 - maskOutOf(j, t));
          Sr[r] += e; roomInfHours[r] += presF[k] * DT;
          if (e > topSrcVal[r]) { topSrcVal[r] = e; topSrc[r] = j; }
        }
      }
      for (let k = v0; k < v1; k++) {
        // Infectious visitor (q already includes visitorRel); visitors talk.
        const r = vE.room[k];
        const e = world.visitorQ[vE.visitor[k]] * actMul[CTX_SOCIAL];
        Sr[r] += e; roomInfHours[r] += DT;
        if (e > topSrcVal[r]) { topSrcVal[r] = e; topSrc[r] = N + vE.visitor[k]; }
      }

      // ---- 3.1 room update: Cbar (slot average) and Cend ----
      let anyAir = false;
      nAir = 0;
      for (let r = 0; r < nRooms; r++) {
        const c0 = C[r], sr = Sr[r];
        if (c0 === 0 && sr === 0) { cbar[r] = 0; continue; }
        if (!airRoom[r]) { C[r] = 0; Sr[r] = 0; cbar[r] = 0; continue; }
        const Css = sr / (volume[r] * lambda[r]);          // quanta/m³
        cbar[r] = Css + (c0 - Css) * avgF[r];               // slot-average concentration
        let ce = Css + (c0 - Css) * eDec[r];                // end-of-slot concentration
        if (ce < C_FLOOR) ce = 0;
        C[r] = ce;
        if (ce > 0) nAir++;
        if (sr > 0) lastSrc[r] = topSrc[r];
        anyAir = true;
        Sr[r] = 0; topSrcVal[r] = 0; topSrc[r] = -1;
      }
      if (record) for (let r = 0; r < nRooms; r++) conc[g * nRooms + r] = cbar[r];

      // ---- 3.1 room-air dose: dose_i += f_ir · p_i · s_i · (1 − maskIn_i) · Cbar_r · Δ ----
      if (anyAir) {
        for (let i = 0; i < N; i++) {
          if (state[i] !== ST_S) continue;
          const r = special[i] ? effRoom(i, g, locSlot[base + i], sd) : locSlot[base + i];
          const cb = cbar[r];
          if (cb === 0) continue;
          const f = 1 - visFrac[i];
          if (f <= 0) continue;
          const t = roomType[r];
          addRoomDose(i, r, f * breatheRT[isStaff[i] * nT + t] * traits.s[i] * (1 - maskInOf(i, t)) * cb * DT, g);
        }
        for (let k = 0; k < nPres; k++) {
          const i = presP[k];
          if (state[i] !== ST_S || (g >= exFrom[i] && g < exTo[i])) continue;
          const r = presR[k], cb = cbar[r];
          if (cb === 0) continue;
          const t = roomType[r];
          addRoomDose(i, r, presF[k] * breatheRT[isStaff[i] * nT + t] * traits.s[i] * (1 - maskInOf(i, t)) * cb * DT, g);
        }
      }

      // ---- 3.2 close range: dose_i += p_i·s_i·(1−maskIn_i)·(1−maskOut_j)·E_j·τ·G/β_c·(1−nearFieldUV) ----
      // (E_j quanta/h, τ h, β m³/h, p m³/h → quanta)
      if (G > 0) {
        if (nEmit > 0) {
          const c0 = con.start[g], c1 = con.start[g + 1];
          for (let k = c0; k < c1; k++) {
            const a = con.a[k], b = con.b[k];
            const ea = emitBase[a], eb = emitBase[b];
            if (ea === 0 && eb === 0) continue;
            const sa = state[a] === ST_S, sb = state[b] === ST_S;
            if (!((ea > 0 && sb) || (eb > 0 && sa))) continue;
            if (g >= exFrom[a] && g < exTo[a]) continue;
            if (g >= exFrom[b] && g < exTo[b]) continue;
            const type = con.type[k];
            if (type === CT.table || type === CT.therapy || type === CT.break) {
              if (!isStaff[a] && g >= isoFrom[a] && g < isoTo[a]) continue;
              if (!isStaff[b] && g >= isoFrom[b] && g < isoTo[b]) continue;
              if (type === CT.table && obAny && ((!isStaff[a] && obWing[wingOf[a]]) || (!isStaff[b] && obWing[wingOf[b]]))) continue; // group meals stopped
            }
            const r = con.room[k], t = roomType[r];
            const w = con.tau[k] * G / betaArr[type] * nearF[r];
            if (ea > 0 && sb) {
              const e = ea * emitRT[isStaff[a] * nT + t] * (1 - maskOutOf(a, t));
              addCloseDose(b, a, r, breatheRT[isStaff[b] * nT + t] * traits.s[b] * (1 - maskInOf(b, t)) * e * w, g);
            }
            if (eb > 0 && sa) {
              const e = eb * emitRT[isStaff[b] * nT + t] * (1 - maskOutOf(b, t));
              addCloseDose(a, b, r, breatheRT[isStaff[a] * nT + t] * traits.s[a] * (1 - maskInOf(a, t)) * e * w, g);
            }
          }
          // Tablemates at meals: everyone at the same table who is actually there.
          if (mealSlot[sd] && tbl.length) {
            const wT = SLOT_HOURS * G / betaArr[CT.table];
            for (let ti = 0; ti < tbl.length; ti++) {
              const m0 = tbl.start[ti], m1 = tbl.start[ti + 1], r = tbl.room[ti];
              for (let x = m0; x < m1; x++) {
                const j = tbl.members[x];
                if (emitBase[j] === 0 || (special[j] ? effRoom(j, g, locSlot[base + j], sd) : locSlot[base + j]) !== r) continue;
                const t = roomType[r];
                const e = emitBase[j] * emitRT[t] * wT * nearF[r]; // residents: emitRT row 0
                for (let y = m0; y < m1; y++) {
                  const i = tbl.members[y];
                  if (i === j || state[i] !== ST_S || (special[i] ? effRoom(i, g, locSlot[base + i], sd) : locSlot[base + i]) !== r) continue;
                  addCloseDose(i, j, r, breatheRT[t] * traits.s[i] * e, g);
                }
              }
            }
          }
        }
        for (let k = v0; k < v1; k++) {
          const i = vE.resident[k];
          if (i < 0 || state[i] !== ST_S || !(vE.tau[k] > 0)) continue;
          const r = vE.room[k], t = roomType[r];
          const e = world.visitorQ[vE.visitor[k]] * actMul[CTX_SOCIAL];
          addCloseDose(i, N + vE.visitor[k], r, breatheRT[t] * traits.s[i] * e * vE.tau[k] * G / betaArr[CT.visit] * nearF[r], g);
        }
      }

      // ---- 3.3 infection: A_i ≥ threshold_i → E at the end of the slot ----
      for (let k = 0; k < touched.length; k++) {
        const i = touched[k];
        if (state[i] !== ST_S || dose[i] < traits.threshold[i]) continue;
        const tot = dRoom[i] + dClose[i];
        const route = traits.routeU[i] < dRoom[i] / tot ? 0 : 1;
        let r, src;
        if (route === 0) { r = bestRoomR[i]; src = lastSrc[r]; }
        else { r = bestCloseR[i]; src = bestCloseSrc[i]; }
        infect(i, g + 1, route, r, src, d, s);
      }
      touched.length = 0;
      for (let k = 0; k < nPres; k++) visFrac[presP[k]] = 0;
    }

    // ---- end of day: daily prevalence, outbreak detection ----
    let ir = 0, is = 0;
    const gEnd = d * S48 + S48 - 1;
    for (let k = 0; k < active.length; k++) {
      const p = active[k];
      if (gEnd >= tInf[p] && gEnd < tEnd[p]) { if (isStaff[p]) is++; else ir++; }
    }
    daily.infectiousResident[d] = ir; daily.infectiousStaff[d] = is;
    if (obc.enabled) {
      // A wing is detected when ≥ trigger symptomatic onsets occurred there in
      // the last windowDays days. Measures start responseDelayDays later and
      // last until outbreakDays after the latest qualifying case.
      const win = Math.max(1, Math.round(obc.windowDays || 7));
      for (let w = 0; w < W; w++) {
        if (onsetsWD[w * (days + 1) + d] === 0) continue;
        let sum = 0;
        for (let k = Math.max(0, d - win + 1); k <= d; k++) sum += onsetsWD[w * (days + 1) + k];
        if (sum < obc.trigger) continue;
        const start = (d + 1 + Math.round(obc.responseDelayDays || 0)) * S48;
        const until = start + Math.round(obc.outbreakDays * S48);
        if (obUntil[w] < start) {
          // No episode active or pending that reaches the new start: a new activation.
          obFrom[w] = start; obUntil[w] = until; totals.outbreaks++;
          if (ov) { obEntry[w] = ov.outbreak.length; ov.outbreak.push({ wing: w, from: start, to: until }); }
        } else if (until > obUntil[w]) {
          // Extend the current episode: it ends outbreakDays after the latest case.
          obUntil[w] = until;
          if (ov && obEntry[w] >= 0) ov.outbreak[obEntry[w]].to = until;
        }
      }
    }
  }

  let win = 0;
  for (let d = 0; d < days; d++) {
    win += daily.newResident[d];
    if (d >= 14) win -= daily.newResident[d - 14];
    if (win > totals.largestCluster) totals.largestCluster = win;
  }
  const byRoom = {};
  for (let r = 0; r < nRooms; r++) {
    byRoom[rooms[r].id] = { infections: roomInf[r], infectionsRoom: roomInfRoom[r], infectionsClose: roomInfClose[r], doseRoom: roomDoseRoom[r], doseClose: roomDoseClose[r], infectiousHours: roomInfHours[r] };
  }
  const out = { seed: world.seed, daily, totals, byRoom, events };
  if (record) { out.frames = { conc, nRooms }; out.overrides = ov; }
  return out;
}

// ===========================================================================
// Inspection helpers (used by tests and the UI)
// ===========================================================================
// Presence (people, fractional) in each room at global slot g, on the plan (no
// behavioural overrides). Visitors included.
// Sub-slot visits at global slot g: explicit visits plus staff presence
// implied by care and medicine-round contacts. [{ person, room, frac }]
export function slotVisits(world, g) {
  const out = [], v = world.visits, c = world.contacts;
  for (let k = v.start[g]; k < v.start[g + 1]; k++) out.push({ person: v.person[k], room: v.room[k], frac: v.frac[k] });
  for (let k = c.start[g]; k < c.start[g + 1]; k++) if (PRESENCE_TYPE[c.type[k]]) out.push({ person: c.a[k], room: c.room[k], frac: Math.min(1, c.tau[k] / SLOT_HOURS) });
  return out;
}
export function roomPresence(world, g) {
  const occ = new Float64Array(world.nRooms);
  const N = world.N, base = g * N;
  const vf = new Float64Array(N);
  for (const x of slotVisits(world, g)) { vf[x.person] += x.frac; occ[x.room] += x.frac; }
  for (let p = 0; p < N; p++) occ[world.locSlot[base + p]] += 1 - vf[p];
  for (const vis of world.visitors) if (g >= vis.g0 && g < vis.g0 + vis.slots) occ[vis.rooms[g - vis.g0]] += 1;
  return occ;
}
