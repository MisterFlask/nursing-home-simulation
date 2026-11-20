'use strict';
const Sim = simBundle();

// ---------- small helpers ----------
const $ = (q, r = document) => r.querySelector(q);
const SVGNS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs, ...kids) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs || {}) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    if (attrs[k] == null) continue;
    if (k === 'class') e.className = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function setPath(o, p, v) { const ks = p.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) a = a[ks[i]]; a[ks[ks.length - 1]] = v; }
const clone = (o) => JSON.parse(JSON.stringify(o));
function median(a) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
function fmt(v) {
  if (!isFinite(v)) return '–';
  const a = Math.abs(v);
  if (a === 0) return '0';
  if (a >= 100) return Math.round(v).toLocaleString();
  if (a >= 10) return (Math.round(v * 10) / 10).toString();
  if (a >= 1) return (Math.round(v * 100) / 100).toString();
  return Number(v.toPrecision(2)).toString();
}
const fmtInt = (v) => (Math.round(v * 10) / 10 % 1 ? (Math.round(v * 10) / 10).toString() : Math.round(v).toString());
const fmt1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const pct = (v) => Math.round(v * 100) + '%';

const tip = $('#tip');
function showTip(ev, text) {
  tip.textContent = text; tip.hidden = false;
  const r = tip.getBoundingClientRect();
  let x = ev.clientX + 12, y = ev.clientY + 14;
  if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - 12;
  if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - 12;
  tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
}
const hideTip = () => { tip.hidden = true; };
function hover(node, text) {
  node.addEventListener('pointermove', (e) => showTip(e, typeof text === 'function' ? text() : text));
  node.addEventListener('pointerleave', hideTip);
}

// ---------- state ----------
const SHOWN_PATHOGENS = ['covid', 'flu'];
const PATHOGEN_LABEL = { covid: 'COVID-19', flu: 'Influenza', rsv: 'RSV' };
const PRIMARY = /*__PRIMARY__*/[];
// What the two ends of the range are, for the infection in view.
function dumbCap() {
  const sh = shares(), covid = state.pathogen === 'covid';
  return `The two ends combine the two things that have not been measured well. At one, non-room-air spread, which lamps cannot act on, is ${pct(sh.high)} of spread to and from residents, and lamps act at the low end of the evidence: how easily far-UVC inactivates the virus, and how much of that a real room delivers. At the other, it is ${pct(sh.low)} and lamps act at the high end. Central is the current settings. The lamp's output is the figure in Illuminate's lamp file in all three.` +
    (covid ? ' Each case is held to the CDC rate of reported infections' + (Sim.anchoredAt(sh.low, 'covid').reportShare >= 1 ? ', except the last, which starts lower because at that setting the model infects fewer residents than homes report.' : ', so all three start from about the same number.') : '');
}
const HIDE = ['facility.wings', 'transmission.G', 'importation.staffDailyHazard', 'importation.visitorInfectiousProb'];
const HIDE_FOR = { flu: ['emission.median'] };   // fitted for influenza, like the face-to-face strength, so not a slider
const hidden = (path) => HIDE.includes(path) || (HIDE_FOR[state.pathogen] || []).includes(path);
const NOTES = Object.fromEntries(/*__NOTES__*/[]);
const NOTES_FLU = Object.fromEntries(/*__NOTES_FLU__*/[]);   // the same, where influenza needs its own wording
const LABELS = Object.fromEntries((/*__LABELS__*/[]).map(([path, label, units, choices]) => [path, { label, units, choices }]));   // the page's wording where the lamp model differs from the engine's default
// The note under a slider. A judgment value already says so on its source line, so the note keeps only the reasoning.
function noteFor(p) {
  const by = state.pathogen !== 'covid' && p.byPathogen && p.byPathogen[state.pathogen];
  const t = (state.pathogen === 'flu' && NOTES_FLU[p.path]) || (by && by.note) || NOTES[p.path] || p.note || '';
  if (!(sourceFor(p) && sourceFor(p).text === 'Modelling judgment')) return t;
  const r = t.replace(/^Set by judgment\b[.,;:]?\s*/, '');
  return r ? r[0].toUpperCase() + r.slice(1) : '';
}
// Where a value comes from: the infection's own source where it has one.
function sourceFor(p) {
  if (state.pathogen === 'covid' && p.path === 'emission.median') return Sim.PARAMS.find((x) => x.path === 'emission.gsd').source;   // the published figure, not the earlier fit's
  const by = state.pathogen !== 'covid' && p.byPathogen && p.byPathogen[state.pathogen];
  return (by && by.source) || p.source;
}
const GROUP_ORDER = ['Transmission', 'Lamps', 'Building', 'People', 'Disease', 'Responses'];
const TYPE_LABEL = {
  dining: 'Dining rooms', activity: 'Activity room', lounge: 'Wing lounges', therapy: 'Therapy room',
  breakroom: 'Staff break room', station: "Nurses' stations and corridors", bedroom: 'Bedrooms',
  kitchen: 'Kitchen', office: 'Office', lobby: 'Lobby',
};
const TYPE_ORDER = ['dining', 'activity', 'lounge', 'therapy', 'breakroom', 'station', 'bedroom', 'kitchen', 'office', 'lobby'];

// inst: which set of lamps is in view ('none', 'common', 'bedrooms', 'both', or 'custom' once the user has changed a room);
// lamps: that set, room by room; custom: the user's own arrangement, kept while they look at the standard ones.
const state = { pathogen: 'covid', overrides: {}, lamps: {}, inst: 'common', custom: null, selected: null, seed: 7, g: 14, playing: false, view: 'people', speed: 'x1', firstReplay: true };
let rooms = [], roomById = {}, layout = {}, nRes = 120, nStaff = 80, days = 120;

// The page runs the anchored fit (src/params.js ANCHORED): published virus output, one infected
// staff member arriving every few days (a slider), and close-range intensity fitted to the chosen non-room-air spread.
const shares = () => Sim.ANCHORS[state.pathogen].shares;
const shareNow = () => (state.overrides['transmission.closeShare'] != null ? state.overrides['transmission.closeShare'] : shares().central);
function config() {
  const c = Sim.anchoredConfig(shareNow(), state.pathogen);
  for (const p in state.overrides) setPath(c, p, state.overrides[p]);
  return c;
}
function paramBounds(p) {
  const by = p.byPathogen && p.byPathogen[state.pathogen];
  const d = getPath(Sim.anchoredConfig(undefined, state.pathogen), p.path);
  let lo = by ? by.low : p.low, hi = by ? by.high : p.high;
  if (p.path === 'transmission.closeShare') { lo = shares().min; hi = shares().max; }
  if (p.path === 'emission.median') { lo = 0.05; hi = 5; }   // the published figure, with the factor of ten it is uncertain by
  if (!(lo < hi)) { lo = d / 2; hi = d * 2 || 1; }
  return { lo: Math.min(lo, d), hi: Math.max(hi, d), def: d };
}
function lampCadr(c) { return c.lamp.ecadr * c.lamp.realWorldFactor; }
function lampEach(c, room, n) { return Sim.lampAchFor(c, room, n); }
// One lamp per 250 square feet of floor (23.2 m²), at least one, in every room a preset covers.
function suggestedCount(room) { return Math.max(1, Math.round(room.area / /*__LAMP_M2__*/23.2)); }
// Most lamps a room can hold on the page: four times that, which is as far as the table from Illuminate goes.
const maxLamps = (room) => 4 * suggestedCount(room);
const totalLamps = () => Object.values(state.lamps).reduce((a, b) => a + b, 0);

// ---------- furniture ----------
// Plain top-down furniture for each kind of room. Returns the shapes to draw and
// the places where people sit or stand, so characters end up at tables and desks.
function furnish(r, b) {
  const els = [], seats = [];
  const box = (x, y, w, h, rx = 2, cls = 'furn') => els.push(svg('rect', { class: cls, x, y, width: w, height: h, rx }));
  const disc = (cx, cy, rad, cls = 'furn') => els.push(svg('circle', { class: cls, cx, cy, r: rad }));
  const chair = (x, y) => { box(x - 3, y - 3, 6, 6, 1.5, 'furn chair'); seats.push({ x, y }); };
  const roundTable = (cx, cy) => { for (const [dx, dy] of [[-11, 0], [11, 0], [0, -11], [0, 11]]) chair(cx + dx, cy + dy); disc(cx, cy, 7); };
  const x0 = b.x, y0 = b.y, w = b.w, h = b.h, top = y0 + 44;
  if (r.type === 'dining') {
    const cols = Math.max(1, Math.floor(w / 43)), rows = Math.max(1, Math.floor((y0 + h - top) / 36));
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) roundTable(x0 + (i + 0.5) * (w / cols), top + 16 + j * ((y0 + h - top - 8) / rows));
  } else if (r.type === 'activity') {
    for (const ty of [top + 22, top + 70]) { for (let i = 0; i < 8; i++) { chair(x0 + 26 + i * 17, ty - 11); chair(x0 + 26 + i * 17, ty + 11); } box(x0 + 16, ty - 6, w - 32, 12, 3); }
  } else if (r.type === 'lounge') {
    box(x0 + 5, top, 9, 34, 3); for (let i = 0; i < 3; i++) seats.push({ x: x0 + 15, y: top + 6 + i * 11 });
    for (const yy of [top + 4, top + 20]) { box(x0 + w - 15, yy, 10, 10, 3); seats.push({ x: x0 + w - 17, y: yy + 5 }); }
    roundTable(x0 + w / 2 - 2, top + 20);
    els.push(svg('line', { class: 'furn-l', x1: x0 + 30, y1: y0 + h - 4, x2: x0 + 60, y2: y0 + h - 4 }));
  } else if (r.type === 'therapy') {
    box(x0 + 12, top + 4, 44, 22, 3); box(x0 + 12, top + 34, 44, 22, 3);
    for (const yy of [top + 10, top + 22]) els.push(svg('line', { class: 'furn-l', x1: x0 + 80, y1: yy, x2: x0 + 150, y2: yy }));
    disc(x0 + 100, top + 62, 9); disc(x0 + 136, top + 62, 9); box(x0 + 12, top + 70, 30, 12, 3);
    for (const [sx, sy] of [[34, 15], [34, 45], [96, 16], [134, 16], [100, 62], [136, 62], [27, 76], [66, 50], [66, 20], [118, 40]]) seats.push({ x: x0 + sx, y: top + sy });
  } else if (r.type === 'breakroom') {
    box(x0 + 6, y0 + h - 14, 70, 9, 2); box(x0 + 80, y0 + h - 16, 12, 12, 2);
    roundTable(x0 + w - 60, top + 20); for (const [sx, sy] of [[40, 22], [58, 22]]) seats.push({ x: x0 + sx, y: top + sy });
  } else if (r.type === 'kitchen') {
    box(x0 + 6, y0 + h - 14, w - 60, 9, 2); box(x0 + 40, top + 6, 90, 14, 2);
    box(x0 + w - 44, top + 2, 20, 20, 2); for (const [dx, dy] of [[-39, 7], [-29, 7], [-39, 17], [-29, 17]]) disc(x0 + w + dx, top + dy, 3, 'furn-l');
    for (const [sx, sy] of [[50, 28], [85, 28], [120, 28], [60, -2], [110, -2], [150, 14]]) seats.push({ x: x0 + sx, y: top + sy });
  } else if (r.type === 'office') {
    for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) { const dx = x0 + 12 + i * 34, dy = top + 2 + j * 22; box(dx, dy, 24, 8, 2); chair(dx + 12, dy + 13); }
  } else if (r.type === 'lobby') {
    els.push(svg('path', { class: 'furn', d: `M${x0 + w - 62},${top + 4} h44 v26 h-10 v-16 h-34 z` })); seats.push({ x: x0 + w - 36, y: top + 24 });
    box(x0 + 8, top + 2, 36, 9, 3); box(x0 + 8, top + 26, 36, 9, 3); disc(x0 + 26, top + 18, 4);
    for (let i = 0; i < 3; i++) { seats.push({ x: x0 + 14 + i * 12, y: top + 9 }); seats.push({ x: x0 + 14 + i * 12, y: top + 28 }); }
  } else if (r.type === 'station') {
    const mid = x0 + w * 0.74; els.push(svg('path', { class: 'furn', d: `M${mid - 24},${y0 + 3} h48 v7 h-48 z` }));
    for (let i = 0; i < 4; i++) seats.push({ x: mid - 18 + i * 12, y: y0 + 14 });
  } else if (r.type === 'bedroom') {
    const d = layout._doors[r.id], doorTop = d && d.y === b.y, beds = r.beds || r.capacity || 1;
    for (let i = 0; i < beds; i++) {
      const bx = x0 + 5 + i * (w - 19), by = doorTop ? y0 + h - 27 : y0 + 8;
      box(bx, by, 9, 19, 1.5); box(bx + 1.5, doorTop ? by + 14 : by + 1.5, 6, 3.5, 1, 'furn pillow');
    }
    if (beds === 1) box(x0 + w - 12, doorTop ? y0 + h - 14 : y0 + 6, 7, 7, 1.5);
    box(x0 + w / 2 - 3.5, doorTop ? y0 + h - 44 : y0 + 36, 7, 7, 2, 'furn chair');
  }
  return { els, seats };
}
// ---------- characters and lamps ----------
const KIND = { resident: 'resident', cna: 'aide', aideFloat: 'aide', nurse: 'nurse', rn: 'nurse' };
function pawn(kind, skin) {
  const g = svg('g', { class: 'pawn k-' + kind });
  g.append(svg('circle', { class: 'halo', r: 7.2, cy: 0.6 }),
    svg('path', { class: 'body', d: 'M-4.6,1.2 q0,-3.4 4.6,-3.4 q4.6,0 4.6,3.4 v2.2 q0,2.6 -4.6,2.6 q-4.6,0 -4.6,-2.6z' }),
    svg('circle', { class: 'head sk' + skin, cy: -2.6, r: 3.3 }),
    svg('path', { class: 'hair', d: 'M-3.3,-2.9 a3.3,3.3 0 0 1 6.6,0 q-3.3,-1.7 -6.6,0z' }));
  return g;
}
function lampMark(cx, cy, s) {
  const g = svg('g', { transform: `translate(${cx},${cy}) scale(${s})` });
  g.append(svg('circle', { r: 15, fill: 'url(#lampglow)' }), svg('circle', { class: 'lampcase', r: 4.2 }), svg('circle', { class: 'lamplens', r: 2.6 }), svg('circle', { class: 'lampcore', r: 1 }));
  return g;
}

// ---------- floor plan ----------
// The plan is drawn like a building, not a diagram: every room has a door onto
// a corridor, and people walk room -> door -> corridor -> door -> room.
// Corridor centre lines: T (y = 131) and B (y = 489) run the full width, and the
// spine S (x = 600) joins them through the middle of the building.
const CT = 131, CB = 489, SX = 600, ENTRANCE = { x: 508, y: 604 }, OUTPT = { x: 508, y: 634 };
function layoutPlan() {
  const L = {};
  const wings = [...new Set(rooms.filter((r) => r.wing >= 0).map((r) => r.wing))].sort((a, b) => a - b);
  const ROW = 88, COR = 54;
  const pos = [[16, 16, false], [16, 374, false], [784, 16, true], [784, 374, true]];
  L._svc = []; L._wings = []; L._doors = {}; L._corr = [];
  const door = (id, x, y, line) => { L._doors[id] = { x, y, cx: line === 'S' ? SX : x, cy: line === 'T' ? CT : line === 'B' ? CB : y, line }; };
  wings.slice(0, 4).forEach((w, i) => {
    const [wx, wy, mir] = pos[i], line = wy < 300 ? 'T' : 'B';
    const beds = rooms.filter((r) => r.wing === w && r.type === 'bedroom');
    const perRow = Math.ceil(beds.length / 2);
    const bw = 310 / perRow, bx0 = mir ? wx + 90 : wx, lx = mir ? wx : wx + 310;
    beds.forEach((r, k) => {
      const row = k < perRow ? 0 : 1, col = row ? k - perRow : k;
      const b = (L[r.id] = { x: bx0 + col * bw, y: wy + (row ? ROW + COR : 0), w: bw, h: ROW });
      door(r.id, b.x + b.w / 2, row ? b.y : b.y + b.h, line);
    });
    const lounge = rooms.find((r) => r.wing === w && r.type === 'lounge');
    const station = rooms.find((r) => r.wing === w && r.type === 'station');
    if (lounge) { L[lounge.id] = { x: lx, y: wy, w: 90, h: ROW }; door(lounge.id, lx + 45, wy + ROW, line); }
    if (station) { L[station.id] = { x: wx, y: wy + ROW, w: 400, h: COR }; L._doors[station.id] = { line, corridor: true }; }
    L._svc.push({ x: lx, y: wy + ROW + COR, w: 90, h: ROW });
    L._wings.push({ x: mir ? wx + 400 : wx, y: wy - 5, label: 'WING ' + 'ABCD'[i], anchor: mir ? 'end' : 'start' });
  });
  const one = (t) => rooms.find((r) => r.type === t);
  const put = (t, b, dx, dy, line) => { const r = one(t); if (r) { L[r.id] = b; door(r.id, dx, dy, line); } };
  put('kitchen', { x: 416, y: 16, w: 184, h: 88 }, 508, 104, 'T');
  put('breakroom', { x: 600, y: 16, w: 184, h: 88 }, 692, 104, 'T');
  put('activity', { x: 612, y: 158, w: 172, h: 152 }, 698, 158, 'T');
  put('therapy', { x: 612, y: 310, w: 172, h: 152 }, 698, 462, 'B');
  put('lobby', { x: 416, y: 516, w: 184, h: 88 }, 508, 516, 'B');
  put('office', { x: 600, y: 516, w: 184, h: 88 }, 692, 516, 'B');
  const dining = rooms.filter((r) => r.type === 'dining'), dh = 304 / dining.length;
  dining.forEach((r, i) => {
    const b = (L[r.id] = { x: 416, y: 158 + i * dh, w: 172, h: dh });
    if (i === 0) door(r.id, 502, 158, 'T'); else if (i === dining.length - 1) door(r.id, 502, 462, 'B'); else door(r.id, 588, b.y + dh / 2, 'S');
  });
  // Corridor floor inside the core (not model rooms; people only pass through).
  L._corr = [{ x: 416, y: 104, w: 368, h: 54 }, { x: 416, y: 462, w: 368, h: 54 }, { x: 588, y: 158, w: 24, h: 304 }];
  return L;
}
const SHORT = { dining: 'DINING', activity: 'ACTIVITY ROOM', lounge: 'LOUNGE', therapy: 'THERAPY', breakroom: 'STAFF BREAK', station: "NURSES' STATION AND CORRIDOR", kitchen: 'KITCHEN', office: 'OFFICE', lobby: 'LOBBY' };

function drawPlan() {
  const p = $('#plan'); p.textContent = '';
  p.append(svg('defs', {}, svg('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, svg('line', { x1: 0, y1: 0, x2: 0, y2: 6 })),
    svg('radialGradient', { id: 'lampglow' }, svg('stop', { class: 'lg0', offset: 0 }), svg('stop', { class: 'lg1', offset: 1 }))));
  layout._seats = {};
  p.append(svg('rect', { class: 'yard', x: 28, y: 256, width: 376, height: 108, rx: 4 }), svg('rect', { class: 'yard', x: 796, y: 256, width: 376, height: 108, rx: 4 }));
  p.append(svg('text', { class: 'wing', x: 216, y: 314, 'text-anchor': 'middle' }, 'COURTYARD'), svg('text', { class: 'wing', x: 984, y: 314, 'text-anchor': 'middle' }, 'COURTYARD'));
  for (const b of layout._corr) p.append(svg('rect', { class: 'corr', x: b.x, y: b.y, width: b.w, height: b.h }));
  for (const b of layout._svc) p.append(svg('rect', { class: 'svc', x: b.x, y: b.y, width: b.w, height: b.h }));
  for (const w of layout._wings) p.append(svg('text', { class: 'wing', x: w.x, y: w.y, 'text-anchor': w.anchor }, w.label));
  for (const r of rooms) {
    const b = layout[r.id]; if (!b) continue;
    const g = svg('g', { class: 'room', 'data-id': r.id });
    g.append(svg('rect', { class: 'shell', x: b.x, y: b.y, width: b.w, height: b.h }));
    if (r.type !== 'bedroom') {
      g.append(svg('text', { class: 'nm', x: b.x + 8, y: b.y + 20 }, SHORT[r.type] + (r.type === 'dining' ? ' ' + (rooms.filter((x) => x.type === 'dining').indexOf(r) + 1) : '')));
      g.append(svg('text', { class: 'vol', x: b.x + 8, y: b.y + 36 }, Math.round(r.volume) + ' m³'));
    }
    const f = furnish(r, b); g.append(svg('g', { class: 'furniture' }, f.els)); layout._seats[r.id] = f.seats;
    g.append(svg('g', { class: 'lamps' }), svg('g', { class: 'evs' }));
    hover(g, () => roomTip(r));
    p.append(g);
  }
  // Door openings, drawn over the walls.
  const gap = (x, y, vert) => p.append(svg('line', { class: 'door', x1: vert ? x : x - 6, y1: vert ? y - 6 : y, x2: vert ? x : x + 6, y2: vert ? y + 6 : y }));
  for (const id in layout._doors) { const d = layout._doors[id]; if (!d.corridor) gap(d.x, d.y, d.line === 'S'); }
  for (const w of [416, 784]) for (const y of [CT, CB]) p.append(svg('line', { class: 'door', x1: w, y1: y - 12, x2: w, y2: y + 12 }));
  for (const y of [158, 462]) p.append(svg('line', { class: 'door', x1: 590, y1: y, x2: 610, y2: y }));
  gap(ENTRANCE.x, ENTRANCE.y, false);
  p.append(svg('text', { class: 'wing', x: ENTRANCE.x, y: ENTRANCE.y + 18, 'text-anchor': 'middle' }, 'ENTRANCE'));
  p.append(svg('g', { id: 'people' }));
  buildPeople();
  drawPlacePlan();
}
// The plan for placing lamps: the same rooms without furniture or people. Select a room to change its lamps.
function drawPlacePlan() {
  const p = $('#plan2'); p.textContent = '';
  p.append(svg('rect', { class: 'yard', x: 28, y: 256, width: 376, height: 108, rx: 4 }), svg('rect', { class: 'yard', x: 796, y: 256, width: 376, height: 108, rx: 4 }));
  for (const b of layout._corr) p.append(svg('rect', { class: 'corr', x: b.x, y: b.y, width: b.w, height: b.h }));
  for (const b of layout._svc) p.append(svg('rect', { class: 'svc', x: b.x, y: b.y, width: b.w, height: b.h }));
  for (const w of layout._wings) p.append(svg('text', { class: 'wing', x: w.x, y: w.y, 'text-anchor': w.anchor }, w.label));
  for (const r of rooms) {
    const b = layout[r.id]; if (!b) continue;
    const g = svg('g', { class: 'room', 'data-id': r.id, tabindex: 0, role: 'button' });
    g.append(svg('rect', { class: 'shell', x: b.x, y: b.y, width: b.w, height: b.h }));
    if (r.type !== 'bedroom') g.append(svg('text', { class: 'nm', x: b.x + 8, y: b.y + 20 }, SHORT[r.type] + (r.type === 'dining' ? ' ' + (rooms.filter((x) => x.type === 'dining').indexOf(r) + 1) : '')));
    g.append(svg('g', { class: 'lamps' }));
    g.addEventListener('click', () => selectRoom(r.id));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRoom(r.id); } });
    hover(g, () => roomTip(r));
    p.append(g);
  }
  const gap = (x, y, vert) => p.append(svg('line', { class: 'door', x1: vert ? x : x - 6, y1: vert ? y - 6 : y, x2: vert ? x : x + 6, y2: vert ? y + 6 : y }));
  for (const id in layout._doors) { const d = layout._doors[id]; if (!d.corridor) gap(d.x, d.y, d.line === 'S'); }
}
function roomTip(r) {
  const n = state.lamps[r.id] || 0;
  return r.name + ' · ' + Math.round(r.volume) + ' m³' + (n ? ' · ' + n + (n > 1 ? ' lamps' : ' lamp') : '');
}
// Where wall-mounted lamps are drawn in a room. A long room has them along its lower wall, past the room's name;
// other rooms share them between the two side walls, below the name. A single lamp goes in the far top corner.
function wallSpots(b, n) {
  const out = [];
  if (b.w >= 1.6 * b.h) {
    const x0 = b.x + Math.min(70, b.w * 0.3), x1 = b.x + b.w - 14, y = b.y + b.h - 10;
    for (let i = 0; i < n; i++) out.push({ x: n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1), y });
    return out;
  }
  if (n === 1) return [{ x: b.x + b.w - 11, y: b.y + 13 }];
  const left = Math.ceil(n / 2), y0 = b.y + Math.min(46, b.h * 0.4), y1 = b.y + b.h - 10;
  for (let i = 0; i < n; i++) { const onLeft = i % 2 === 0, k = i >> 1, m = onLeft ? left : n - left; out.push({ x: onLeft ? b.x + 9 : b.x + b.w - 9, y: m === 1 ? (y0 + y1) / 2 : y0 + (y1 - y0) * k / (m - 1) }); }
  return out;
}
function paintLamps() {
  for (const g of document.querySelectorAll('#plan .room, #plan2 .room')) {
    const id = g.dataset.id, n = state.lamps[id] || 0, b = layout[id], r = roomById[id], placing = !!g.closest('#plan2');
    g.classList.toggle('lit', n > 0);
    if (placing) { g.classList.toggle('sel', state.selected === id); g.setAttribute('aria-label', r.name + ', ' + n + (n === 1 ? ' lamp' : ' lamps')); }
    const lg = g.querySelector('.lamps'); lg.textContent = '';
    if (!n) continue;
    const dTop = r.type === 'bedroom' && layout._doors[id] && layout._doors[id].y === b.y;
    const cx = b.x + b.w / 2, cy = dTop ? b.y + 22 : b.y + b.h - 22;
    if (r.type === 'bedroom') {
      lg.append(lampMark(cx, cy, 0.75));
      if (n > 1) lg.append(svg('text', { class: 'lampn', x: cx, y: cy - 9, 'text-anchor': 'middle' }, '×' + n));
    } else for (const q of wallSpots(b, n)) lg.append(lampMark(q.x, q.y, 1));   // lamps sit high on the walls, angled down into the room
  }
  const t = totalLamps(), count = t === 0 ? 'No lamps' : t + (t === 1 ? ' lamp' : ' lamps');
  $('#lampcount').textContent = count; $('#placecount').textContent = (state.inst === 'custom' ? 'Your placement: ' : INST_NAME[state.inst] + ': ') + count.toLowerCase();
}
function selectRoom(id) { state.selected = id; paintLamps(); drawInspector(); }
function setLamps(id, n) {
  n = Math.max(0, Math.min(maxLamps(roomById[id] || { area: 0 }), n));
  if (n) state.lamps[id] = n; else delete state.lamps[id];
  afterPlacement();
}
// After a room's lamps change: the arrangement is a standard choice if it matches one, otherwise the user's own.
function afterPlacement() {
  const hit = currentPreset();
  if (hit) state.inst = hit; else { state.custom = { ...state.lamps }; state.inst = 'custom'; }
  paintLamps(); drawInst(); drawInspector(); drawGroups(); drawPresets(); scheduleRun(); staleReplay();
}
// Put one of the sets of lamps in view: a standard choice, or the user's own arrangement.
function setInst(key) {
  if (key === 'custom' && !state.custom) return;
  state.inst = key; state.lamps = { ...instLamps(key) };
  paintLamps(); drawInst(); drawInspector(); drawGroups(); drawPresets(); scheduleRun();
  if (replayData && replayData.arms[key] && !replayStale) { snapPeople(state.g); drawReplay(); } else staleReplay();
}

function stepper(value, onChange, label) {
  const out = el('output', {}, value);
  return el('span', { class: 'stepper', role: 'group', 'aria-label': label },
    el('button', { type: 'button', 'aria-label': 'Fewer', onclick: () => onChange(-1) }, '−'), out,
    el('button', { type: 'button', 'aria-label': 'More', onclick: () => onChange(1) }, '+'));
}
function drawInspector() {
  const box = $('#inspector'); box.textContent = '';
  const r = roomById[state.selected];
  if (!r) { box.append(el('span', { class: 'small muted' }, 'Select a room on this plan to see its size and ventilation, and to add or remove lamps there.')); return; }
  const c = config(), n = state.lamps[r.id] || 0, base = r.ach * c.ventilation.scale;
  const item = (k, v) => el('div', {}, el('dt', {}, k), el('dd', {}, v));
  box.append(
    el('div', { class: 'block', style: 'gap:6px' }, el('h3', {}, r.name),
      el('dl', {}, item('floor', fmt(r.area) + ' m²'), item('volume', Math.round(r.volume) + ' m³'), item('ventilation', fmt(base) + ' air changes/h'),
        item('with lamps', n ? fmt(base + lampEach(c, r, n)) + ' equivalent' : 'no lamps'))),
    stepper(n, (d) => setLamps(r.id, n + d), 'Lamps in ' + r.name),
    n >= maxLamps(r) ? el('span', { class: 'small muted' }, `${maxLamps(r)} is the most this room takes here: four times one lamp per 250 square feet, as far as the table from Illuminate goes.`) : '');
}
function drawGroups() {
  const box = $('#groups'); box.textContent = '';
  for (const t of TYPE_ORDER) {
    const rs = rooms.filter((r) => r.type === t); if (!rs.length) continue;
    const ns = rs.map((r) => state.lamps[r.id] || 0), same = ns.every((n) => n === ns[0]);
    box.append(el('div', { class: 'grow' },
      el('span', { class: 'nm' }, TYPE_LABEL[t], el('small', {}, (rs.length > 1 ? rs.length + ' rooms · ' : '') + Math.round(mean(rs.map((r) => r.volume))) + ' m³' + (rs.length > 1 ? ' each' : ''))),
      stepper(same ? ns[0] : 'mix', (d) => { const base = same ? ns[0] : Math.min(...ns); rs.forEach((r) => { const n = Math.max(0, Math.min(maxLamps(r), base + d)); if (n) state.lamps[r.id] = n; else delete state.lamps[r.id]; }); afterPlacement(); }, 'Lamps per room in ' + TYPE_LABEL[t])));
  }
}
// Every room except the bedrooms.
const COMMON = ['dining', 'activity', 'lounge', 'therapy', 'station', 'lobby', 'kitchen', 'office', 'breakroom'];
const PRESETS = [
  ['none', 'Without lamps', []],
  ['common', 'Common areas only', COMMON],
  ['bedrooms', 'Bedrooms only', ['bedroom']],
  ['both', 'Common areas and bedrooms', [...COMMON, 'bedroom']],
];
const INST_NAME = { none: 'Without lamps', common: 'Common areas only', bedrooms: 'Bedrooms only', both: 'Common areas and bedrooms', custom: 'Your placement' };
const presetLamps = (types) => { const o = {}; for (const r of rooms) if (types.includes(r.type)) o[r.id] = suggestedCount(r); return o; };
const instLamps = (key) => (key === 'custom' ? state.custom || {} : presetLamps(PRESETS.find(([k]) => k === key)[2]));
const countLamps = (m) => Object.values(m).reduce((a, b) => a + b, 0);
// Which standard choice, if any, matches the lamps as placed.
function currentPreset() {
  const cur = JSON.stringify(Object.entries(state.lamps).sort());
  const hit = PRESETS.find(([, , types]) => JSON.stringify(Object.entries(presetLamps(types)).sort()) === cur);
  return hit ? hit[0] : null;
}
// The choice above the plan: the four standard sets of lamps, and the user's own once they have made one.
function drawInst() {
  const box = $('#inst'); box.textContent = '';
  for (const key of [...PRESETS.map(([k]) => k), ...(state.custom ? ['custom'] : [])]) {
    const n = countLamps(instLamps(key));
    box.append(el('button', { type: 'button', 'data-inst': key, 'aria-pressed': String(key === state.inst), onclick: () => setInst(key) }, INST_NAME[key], key === 'none' ? null : el('small', {}, n + (n === 1 ? ' lamp' : ' lamps'))));
  }
}
function drawPresets() {
  const box = $('#presets'); box.textContent = '';
  for (const [key] of PRESETS) box.append(el('button', { type: 'button', 'aria-pressed': String(key === state.inst), onclick: () => setInst(key) }, { none: 'No lamps', common: 'Common areas', bedrooms: 'Bedrooms', both: 'Both' }[key]));
}

// ---------- worker ----------
// Runs in a Web Worker, or on the page itself where workers are refused (see makeWorker).
// post sends a message back; tick yields between batches of `chunk` seasons.
function workerMain(post, tick, chunk) {
  let current = 0;
  const hash = (i) => { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
  // rep = resident infections that get reported: each infected resident is reported with chance
  // ph.report, decided by a fixed draw per person and season so both arms agree. Hospital
  // admissions are counted among reported infections only.
  const tally = (t, res, world, seed, ph, rooms) => {
    t.res.push(res.totals.residentInfected); t.staff.push(res.totals.staffInfected);
    let rep = 0, hosp = 0; const hu = world.traits.hospU, pH = ph.config.severity.pHospital;
    for (const e of res.events) {
      if (e.role === 'resident' && hash(seed * 100003 + e.person) < ph.report) { rep++; if (hu[e.person] < pH) hosp++; t.repRoute[e.route === 'room' ? 'air' : 'face']++; }
      if (e.route === 'community') t.route.community++;
      else if (e.route === 'room') { t.route.room++; if (rooms) rooms[e.roomId] = (rooms[e.roomId] || 0) + 1; }
      else t.route.close++;
    }
    t.rep.push(rep); t.hosp.push(hosp);
  };
  // One world per seed, shared by every scenario and both arms: the scenarios
  // differ only in non-structural values, so the schedules are reused.
  async function run(m) {
    const id = (current = m.jobId);
    const blank = () => ({ res: [], rep: [], staff: [], hosp: [], route: { room: 0, close: 0, community: 0 }, repRoute: { air: 0, face: 0 } });   // repRoute: reported resident infections by how they were caught
    // a: without lamps; arms: one tally per set of lamps being compared
    const accs = m.phases.map(() => ({ a: blank(), arms: Object.fromEntries(Object.keys(m.arms).map((k) => [k, blank()])), rooms: {}, n: 0 }));
    for (let s = 0; s < m.nSeeds; s++) {
      let world = null;
      m.phases.forEach((ph, i) => {
        if (s % ph.every) return;
        world = Sim.buildWorld(ph.config, m.seed0 + s, world ? { reuse: world } : undefined);
        tally(accs[i].a, Sim.runSeason(world, { lamps: {} }), world, m.seed0 + s, ph, accs[i].rooms);
        for (const k in m.arms) tally(accs[i].arms[k], Sim.runSeason(world, { lamps: m.arms[k] }), world, m.seed0 + s, ph);
        accs[i].n++;
      });
      if ((s + 1) % chunk === 0 || s === m.nSeeds - 1) {
        post({ type: 'progress', jobId: id, n: s + 1, of: m.nSeeds, phases: m.phases.map((ph, i) => ({ name: ph.name, acc: accs[i] })) });
        await tick(); if (current !== id) return;
      }
    }
    post({ type: 'done', jobId: id });
  }
  function replayArm(world, lamps, T, withAir) {
    const N = world.people.length, r = Sim.runSeason(world, { lamps }, { record: true });
    const loc = new Uint8Array(N * T);
    for (let g = 0; g < T; g++) {
      const d = (g / 48) | 0, sl = g % 48, base = g * N;
      for (let p = 0; p < N; p++) loc[base + p] = world.locationAt(p, d, sl, r);
      // Staff on care or medicine rounds: show them in the room they are visiting,
      // unless this run has them off sick.
      for (const v of Sim.slotVisits(world, g)) if (v.person < N && loc[base + v.person] !== world.outside) loc[base + v.person] = v.room;
    }
    const NEVER = 1e9, tE = new Int32Array(N).fill(NEVER), tI = new Int32Array(N).fill(NEVER), tR = new Int32Array(N).fill(NEVER), tr = world.traits;
    for (const e of r.events) {
      if (e.person == null || e.person >= N) continue;
      const g = e.day * 48 + e.slot;
      tE[e.person] = g; tI[e.person] = g + tr.latent[e.person]; tR[e.person] = tI[e.person] + tr.presym[e.person] + tr.infDur[e.person];
    }
    return { events: r.events.map((e) => ({ g: e.day * 48 + e.slot, route: e.route, roomId: e.roomId })), newResident: Array.from(r.daily.newResident), loc, tE, tI, tR, conc: withAir ? r.frames.conc : null };
  }
  return async (ev) => {
    const m = ev.data;
    try {
      if (m.type === 'run') await run(m);
      else if (m.type === 'cancel') current = -1;   // the page already has these results; stop the run in hand
      else if (m.type === 'replay') {
        // The first season shown is one with an outbreak (most have none); later ones are taken as they come.
        let seed = m.seed, world = Sim.buildWorld(m.config, seed);
        for (let k = 0; m.minResident && k < 25 && Sim.runSeason(world, { lamps: {} }).totals.residentInfected < m.minResident; k++) world = Sim.buildWorld(m.config, ++seed);
        const T = m.config.days * 48;
        post({ type: 'replay', seed, N: world.people.length, T, roomIds: world.rooms.map((r) => r.id),
          staff: world.people.map((p) => p.role !== 'resident'), home: world.people.map((p) => p.homeRoom), roles: world.people.map((p) => p.role), wings: world.people.map((p) => p.wing), outside: world.outside,
          arms: Object.fromEntries(Object.entries(m.arms).map(([k, lamps]) => [k, replayArm(world, lamps, T)])) });
      } else if (m.type === 'film') {
        // The film's season: as a replay, plus the air in every room and who sits at which table.
        const world = Sim.buildWorld(m.config, m.seed), T = m.config.days * 48, tb = world.tables;
        post({ type: 'film', seed: m.seed, N: world.people.length, T, nRooms: world.nRooms, roomIds: world.rooms.map((r) => r.id),
          staff: world.people.map((p) => p.role !== 'resident'), home: world.people.map((p) => p.homeRoom), roles: world.people.map((p) => p.role), outside: world.outside,
          tables: { room: Array.from(tb.room), start: Array.from(tb.start), members: Array.from(tb.members) },
          q: Array.from(world.traits.q), s: Array.from(world.traits.s),
          a: replayArm(world, {}, T, true), b: replayArm(world, m.lamps, T, true) });
      } else if (m.type === 'suggest') {
        const out = Sim.rankRooms(m.config, { seeds: m.seeds, lampsAvailable: m.n, confirm: false });
        post({ type: 'suggest', allocation: out.allocation });
      }
    } catch (err) { post({ type: 'error', message: String((err && err.stack) || err) }); }
  };
}
function makeWorker() {
  try {
    const src = 'const Sim=(' + simBundle.toString() + ')();onmessage=(' + workerMain.toString() + ')((m)=>postMessage(m),()=>new Promise((r)=>setTimeout(r,0)),4);';
    return new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  } catch (err) {
    // Some viewers (file previews, locked-down frames) refuse workers. Run the model on the page
    // instead: the same code and the same results, in small batches so the page stays usable,
    // and paused while the film is playing so the film stays smooth.
    const w = { onmessage: null, inline: true };
    const wait = () => new Promise((r) => { const go = () => (typeof F !== 'undefined' && F.playing ? setTimeout(go, 200) : r()); setTimeout(go, 0); });
    const handle = workerMain((m) => setTimeout(() => w.onmessage && w.onmessage({ data: m }), 0), wait, 1);
    w.postMessage = (m) => setTimeout(() => handle({ data: typeof structuredClone === 'function' ? structuredClone(m) : JSON.parse(JSON.stringify(m)) }), 0);
    return w;
  }
}
const worker = makeWorker();

let jobId = 0, results = {}, runTimer = null, replayStale = true, replayData = null;
const N_SEEDS = 200;
function scheduleRun() { clearTimeout(runTimer); runTimer = setTimeout(startRun, 250); }
// Finished results are kept by settings and lamps, so going back to a set of lamps already run is immediate.
// The results always compare no lamps with the two standard sets: the common areas, and the common areas with the
// bedrooms. Bedrooms only, or the user's own placement, joins them while it is the set in view.
const extraArm = () => (['bedrooms', 'custom'].includes(state.inst) ? state.inst : null);
const armKeys = () => ['common', 'both', ...(extraArm() ? [extraArm()] : [])];
const ARM_NAME = { none: 'Without lamps', common: 'Common areas', both: 'Common areas + bedrooms', bedrooms: 'Bedrooms only', custom: 'Your placement' };
const runCache = new Map(), runKey = () => JSON.stringify([state.pathogen, state.overrides, extraArm(), extraArm() ? Object.entries(state.lamps).sort() : null]);
function startRun() {
  const c = config(), sc = Sim.anchoredScenarios(c), key = runKey();
  jobId++;
  if (runCache.has(key)) {
    results = { ...runCache.get(key), jobId }; worker.postMessage({ type: 'cancel' });
    $('#bar').style.width = '100%'; $('#runstat').textContent = N_SEEDS + ' seasons simulated'; drawFitted(c); drawResults(); return;
  }
  results = { jobId, key };
  worker.postMessage({ type: 'run', jobId, seed0: 1000, nSeeds: N_SEEDS, arms: Object.fromEntries(armKeys().map((k) => [k, instLamps(k)])), phases: [
    { name: 'central', config: c, every: 1, report: sc.reportShare.central },
    { name: 'cautious', config: sc.cautious, every: 1, report: sc.reportShare.cautious },
    { name: 'favourable', config: sc.favourable, every: 1, report: sc.reportShare.favourable },
  ] });
  $('#bar').style.width = '0%'; $('#runstat').textContent = 'Starting…';
  results.report = sc.reportShare; drawFitted(c);
}
function drawFitted(c) {
  const cap = $('#arrivecap'); if (cap) cap.textContent = `One infected staff member arrives every ${c.importation.arrivalEveryDays} days, on the same days in every season.`;
  const box = $('#fitted'); if (!box) return;
  if (state.pathogen === 'flu') {
    const at = Sim.anchoredAt(shareNow(), 'flu'), A = Sim.ANCHORS.flu;
    box.textContent = 'Held fixed: the share of residents with a reported influenza infection in a season (' + fmt1(A.reportedAR * 100) + '%, CDC, winter 2025-26) and one infected staff member arriving every ' + A.arrivalEveryDays + ' days. Assumed: one infection in ' + fmt(A.underReport) + ' is reported, so the model should infect about ' + fmt1(A.reportedAR * A.underReport * 100) + '% of residents. Fitted: the virus an infected person breathes out at rest (now ' + fmt(c.emission.median) + ' quanta per hour; the published estimate, ' + A.publishedEmission + ', gives the model under a third of the influenza homes report) and the strength of face-to-face spread (a multiplier, now ' + fmt(c.transmission.G) + '), so that non-room-air spread is ' + pct(shareNow()) + '. The resident counts above are the model\'s infections multiplied by the share reported.';
    return;
  }
  const at = Sim.anchoredAt(shareNow()), A = Sim.ANCHORED;
  const moved = c.importation.arrivalEveryDays !== A.arrivalEveryDays;
  box.textContent = 'Held fixed: the virus an infected person breathes out at rest (' + fmt(A.emissionMedian) + ' quanta per hour) and the share of residents with a reported infection in a season (' + fmt1(A.reportedAR * 100) + '%, CDC). Set by us: one infected staff member arriving every ' + A.arrivalEveryDays + ' days' + (moved ? ' (you have set ' + c.importation.arrivalEveryDays + '; the fit is not redone)' : '') + '. Fitted: the strength of face-to-face spread (a multiplier, now ' + fmt(c.transmission.G) + '), so that non-room-air spread is ' + pct(shareNow()) + '. With arrivals every ' + A.arrivalEveryDays + ' days the model then infects about ' + pct(at.trueAR) + ' of residents in a season, '
    + (at.reportShare < 1 ? 'which matches the CDC figure only if about ' + pct(at.reportShare) + ' of resident infections are reported. The resident counts above are the model\'s infections multiplied by that share.' : 'which is ' + (at.trueAR < A.reportedAR - 0.01 ? 'short of' : 'in line with') + ' the CDC figure, so every infection is counted as reported.');
}
worker.onmessage = (ev) => {
  const m = ev.data;
  if (m.type === 'error') { $('#runstat').textContent = 'The model stopped with an error.'; console.error(m.message); return; }
  if (m.type === 'film') { filmData(m); return; }
  if (m.type === 'replay') {
    const same = replayData && replayData.seed === m.seed && replayData.T === m.T && !state.firstReplay;   // the same season again, after a change: stay at the same moment
    replayData = m; replayStale = false; state.seed = m.seed; state.firstReplay = false; buildPeople();
    const first = m.arms.none.events.find((e) => e.route !== 'community');
    if (same) { snapPeople(state.g); drawReplay(); } else { setPlaying(false); setTime(first ? Math.floor(first.g / 48) * 48 + 14 : 14); }
    return;
  }
  if (m.type === 'suggest') {
    state.lamps = m.allocation || {}; $('#suggest').disabled = false; $('#suggestmsg').textContent = 'Placed in the rooms where they most reduce infections in the model.';
    afterPlacement(); return;
  }
  if (m.jobId !== jobId) return;
  if (m.type === 'progress') {
    for (const ph of m.phases) results[ph.name] = ph.acc;
    $('#bar').style.width = (100 * m.n / m.of) + '%';
    $('#runstat').textContent = m.n + ' of ' + m.of + ' seasons';
    drawResults();
  } else if (m.type === 'done') {
    $('#runstat').textContent = N_SEEDS + ' seasons simulated';
    runCache.set(results.key, results); if (runCache.size > 16) runCache.delete(runCache.keys().next().value);
  }
};

// ---------- results ----------
const BIG = 10;
const shareBig = (a) => (a.length ? a.filter((v) => v >= BIG).length / a.length : 0);
const cut = (R, k) => { const ma = mean(R.a.rep), mb = mean(R.arms[k].rep); return ma > 0 ? (ma - mb) / ma : 0; };
const pct1 = (v) => (Math.abs(v) < 0.095 ? (Math.round(v * 1000) / 10).toString() : Math.round(v * 100).toString()) + '%';
const lampsIn = (k) => { const n = countLamps(instLamps(k)); return n + (n === 1 ? ' lamp' : ' lamps'); };
function drawResults() {
  const R = results.central; if (!R) return;
  const keys = armKeys().filter((k) => R.arms[k]), ma = mean(R.a.rep), n = R.a.rep.length;
  const full = SCEN.every(([k]) => results[k] && results[k].n >= 20);
  // The sentence: each set of lamps with its range and its figure at the current settings.
  const s = $('#sentence'); s.textContent = '';
  const lead = { common: 'With lamps in the common areas', both: 'With lamps in the bedrooms as well', bedrooms: 'With lamps in the bedrooms only', custom: 'With your placement' };
  keys.forEach((k, i) => {
    const c = cut(R, k), cs = full ? SCEN.map(([sc]) => cut(results[sc], k)) : null;
    s.append(lead[k] + ' (' + lampsIn(k) + ')' + (i ? ': ' : ', the model has '));
    if (cs) s.append(el('b', {}, pct1(Math.min(...cs))), ' to ', el('b', {}, pct1(Math.max(...cs))), i ? ', and ' : ' fewer reported infections among residents, and ');
    s.append(el('b', {}, pct1(c)), (i || cs ? '' : ' fewer reported infections among residents') + ' at the current settings' + (i ? '. ' : ' (' + fmt1(ma) + ' of ' + nRes + ' residents without lamps, ' + fmt1(mean(R.arms[k].rep)) + ' with). '));
  });
  s.append(full ? 'The low end of each range is where more of the spread is face to face and lamps act weakly in a real room; the high end is where more is through room air and lamps act strongly. Neither has been measured well. ' : 'Still simulating the two ends of each range… ', 'Averaged over ' + n + ' simulated seasons.');

  // The comparison: one column per set of lamps.
  const box = $('#tiles'); box.textContent = '';
  const cols = ['none', ...keys], arm = (k) => (k === 'none' ? R.a : R.arms[k]);
  const head = el('tr', {}, el('th', {}), ...cols.map((k) => el('th', { class: k === state.inst ? 'on' : null }, el('i', { class: 'sw k-' + k }), ARM_NAME[k])));
  const line = (name, f, sub) => el('tr', {}, el('th', {}, name), ...cols.map((k) => el('td', { class: k === state.inst ? 'on' : null }, f(arm(k)), sub && k !== 'none' ? el('small', {}, sub(k)) : null)));
  box.append(el('table', { class: 'cmp' }, el('thead', {}, head), el('tbody', {},
    line('Reported resident infections, average season', (A) => fmt1(mean(A.rep)), (k) => pct1(cut(R, k)) + ' fewer'),
    line('Residents admitted to hospital, average season', (A) => fmt(mean(A.hosp))),
    line('All resident infections, reported or not', (A) => fmt1(mean(A.res))),
    line('Seasons with ' + BIG + ' or more reported resident infections', (A) => pct(shareBig(A.rep))))));
  drawHist(R, keys); drawReach(R, keys); drawDumbbell(keys); drawRoutes(R); drawRank(R); drawTable(keys);
  $('#dumbcap').textContent = dumbCap();
}
// How the seasons are spread: one row of bars for no lamps and for each set of lamps.
function drawHist(R, keys) {
  const g = $('#hist'); g.textContent = '';
  const W = 520, x0 = 4, x1 = W - 4, bw = nRes > 60 ? 5 : 2, nb = Math.ceil((nRes + 1) / bw);
  const bins = (arr) => { const h = new Array(nb).fill(0); for (const v of arr) h[Math.min(nb - 1, Math.floor(v / bw))]++; return h.map((c) => c / Math.max(1, arr.length)); };
  const rows = [['none', R.a.rep], ...keys.map((k) => [k, R.arms[k].rep])].map(([k, arr]) => ({ k, arr, h: bins(arr) }));
  const ymax = Math.max(0.05, ...rows.flatMap((r) => r.h)), X = (v) => x0 + (x1 - x0) * v / (nb * bw), rowH = 52, gap = 78;
  rows.forEach((r, i) => {
    const top = i * gap, base = top + rowH + 18, name = ARM_NAME[r.k];
    g.append(svg('text', { class: 'lab' + (r.k === state.inst ? ' on' : ''), x: x1, y: top + 11, 'text-anchor': 'end' }, name));
    g.append(svg('line', { class: 'axis', x1: x0, x2: x1, y1: base, y2: base }));
    r.h.forEach((v, j) => {
      if (!v) return; const hh = Math.max(1.5, rowH * v / ymax), x = X(j * bw) + 1, w = X((j + 1) * bw) - X(j * bw) - 2;
      const b = svg('path', { class: 'bar k-' + r.k, d: `M${x},${base} v${-(hh - 2)} q0,-2 2,-2 h${w - 4} q2,0 2,2 v${hh - 2} z` });
      hover(b, `${name}: ${pct(v)} of seasons had ${j * bw}–${Math.min(nRes, (j + 1) * bw - 1)} reported resident infections`); g.append(b);
    });
    const m = mean(r.arr), mx = X(m + 0.5);
    g.append(svg('line', { class: 'med', x1: mx, x2: mx, y1: top + 4, y2: base }));
    g.append(svg('text', { class: 'val', x: mx + 5, y: top + 11 }, 'average ' + fmt1(m)));
  });
  const ay = (rows.length - 1) * gap + rowH + 18, step = nRes > 60 ? 20 : 10;
  for (let v = 0; v <= nRes; v += step) g.append(svg('text', { x: X(v), y: ay + 15, 'text-anchor': v === 0 ? 'start' : 'middle' }, v));
  g.append(svg('text', { x: x1, y: ay + 30, 'text-anchor': 'end' }, 'reported resident infections in the season'));
  g.setAttribute('viewBox', `0 0 ${W} ${ay + 36}`);
}
// The two ends of the range are named for what sets them: the split between the routes, and how strongly lamps act.
const SCEN = [['cautious', 'More face to face, lamps act weakly'], ['central', 'Central assumptions'], ['favourable', 'More through room air, lamps act strongly']];
function drawDumbbell(keys) {
  const g = $('#dumb'); g.textContent = '';
  const W = 520, lx = 8, x1 = W - 168, rows = SCEN.map(([k, name]) => ({ k, name, R: results[k] })), cols = ['none', ...keys];
  const avg = (R, k) => mean((k === 'none' ? R.a : R.arms[k]).rep);
  const max = Math.max(10, ...rows.filter((r) => r.R && r.R.n).map((r) => avg(r.R, 'none'))) * 1.12;
  const X = (v) => lx + (x1 - lx) * v / max;
  const ticks = max > 60 ? 20 : max > 25 ? 10 : 5;
  for (let v = 0; v <= max; v += ticks) { g.append(svg('line', { class: 'grid', x1: X(v), x2: X(v), y1: 6, y2: 150 }), svg('text', { x: X(v), y: 165, 'text-anchor': 'middle' }, v)); }
  g.append(svg('text', { x: x1, y: 182, 'text-anchor': 'end' }, 'average reported resident infections per season'));
  rows.forEach((r, i) => {
    const y = 34 + i * 48;
    g.append(svg('text', { class: 'lab', x: 0, y: y - 14 }, r.name));
    if (!r.R || !r.R.n) { g.append(svg('text', { x: lx + 6, y: y + 4 }, 'simulating…')); return; }
    const vs = cols.map((k) => avg(r.R, k));
    g.append(svg('line', { class: 'link', x1: X(Math.min(...vs)), x2: X(Math.max(...vs)), y1: y, y2: y }));
    cols.forEach((k, j) => { const d = svg('circle', { class: 'kdot k-' + k, cx: X(vs[j]), cy: y, r: k === state.inst ? 6.5 : 5.5 }); hover(d, `${r.name}. ${ARM_NAME[k]}: average ${fmt1(vs[j])} reported resident infections` + (k === 'none' ? '' : `, ${pct1(cut(r.R, k))} fewer`) + ` (${r.R.n} seasons)`); g.append(d); });
    g.append(svg('text', { class: 'val', x: W, y: y + 4, 'text-anchor': 'end' }, keys.map((k) => pct1(cut(r.R, k))).join(' / ') + ' fewer'));
  });
  const leg = $('#dumbleg'); leg.textContent = '';
  for (const k of cols) leg.append(el('span', {}, el('i', { class: 'sw k-' + k }), ARM_NAME[k]));
}
// What lamps can reach: reported resident infections by how they were caught, back to back, for no lamps and each set of lamps.
function drawReach(R, keys) {
  const g = $('#reach'); g.textContent = '';
  const n = R.n || 1, of = (A) => ({ air: A.repRoute.air / n, face: A.repRoute.face / n }), A = of(R.a), rows = keys.map((k) => [k, of(R.arms[k])]);
  const W = 520, xc = 250, half = 178, px = half / Math.max(1, A.air, A.face, ...rows.flatMap(([, v]) => [v.air, v.face])), h = 24, gap = 52;
  const T = (cls, x, y, txt, anchor) => svg('text', { class: cls || null, x, y, 'text-anchor': anchor || 'start' }, txt);
  g.append(svg('rect', { class: 'r-air', x: xc - 16, y: 4, width: 9, height: 9, rx: 2 }), T('lab', xc - 21, 12, 'Through the air of a shared room', 'end'), T('', xc - 8, 26, 'lamps act here', 'end'),
    svg('rect', { class: 'r-face', x: xc + 8, y: 4, width: 9, height: 9, rx: 2 }), T('lab', xc + 22, 12, state.pathogen === 'flu' ? 'Face to face, hands, surfaces' : 'Face to face'), T('', xc + 8, 26, 'no direct effect from lamps'));
  const d = (a, b) => (a > 0 ? (b <= a ? '−' : '+') + pct1(Math.abs(1 - b / a)) : '');
  const row = (y, k, v, ghost) => {
    const name = ARM_NAME[k];
    g.append(T('lab' + (k === state.inst ? ' on' : ''), xc - half, y - 6, `${name}: ${fmt1(v.air + v.face)} residents`));
    if (ghost) for (const [x, w] of [[xc - 1 - ghost.air * px, ghost.air * px], [xc + 1, ghost.face * px]]) g.append(svg('rect', { class: 'r-ghost', x, y, width: w, height: h, rx: 3 }));
    const ra = svg('rect', { class: 'r-air', x: xc - 1 - v.air * px, y, width: v.air * px, height: h, rx: 3 }), rf = svg('rect', { class: 'r-face', x: xc + 1, y, width: v.face * px, height: h, rx: 3 });
    hover(ra, `${name}: ${fmt1(v.air)} reported resident infections a season were caught through the air of a shared room`); hover(rf, `${name}: ${fmt1(v.face)} were caught face to face`);
    g.append(ra, rf);
    if (v.air * px > 34) g.append(T('r-val', xc - 8, y + 17, fmt1(v.air), 'end')); if (v.face * px > 34) g.append(T('r-val', xc + 8, y + 17, fmt1(v.face)));
    if (ghost) g.append(T('val', xc - 5 - ghost.air * px, y + 17, d(ghost.air, v.air), 'end'), T('val', xc + 5 + ghost.face * px, y + 17, d(ghost.face, v.face)));
  };
  row(50, 'none', A);
  rows.forEach(([k, v], i) => row(50 + (i + 1) * gap, k, v, A));
  g.setAttribute('viewBox', `0 0 ${W} ${50 + rows.length * gap + h + 8}`);
}
function drawRoutes(R) {
  const r = R.a.route, tot = r.close + r.room + r.community || 1, box = $('#routes'); box.textContent = '';
  for (const [k, cls, name] of [['close', 's-close', 'at close range'], ['room', 's-room', 'through shared room air'], ['community', 's-out', 'outside the building']]) {
    const sh = r[k] / tot; if (sh <= 0) continue;
    const s = el('span', { class: cls, style: `flex:${Math.max(sh, 0.004)} 1 0` }, sh >= 0.09 ? pct(sh) : '');
    hover(s, `${pct(sh)} of infections without lamps were caught ${name}`); box.append(s);
  }
}
function drawRank(R) {
  const box = $('#rank'); box.textContent = '';
  const n = R.a.res.length || 1, byType = {};
  for (const id in R.rooms) { const t = roomById[id] ? roomById[id].type : 'other'; byType[t] = (byType[t] || 0) + R.rooms[id] / n; }
  const rows = Object.entries(byType).sort((x, y) => y[1] - x[1]).slice(0, 7), max = rows.length ? rows[0][1] : 1;
  if (!rows.length) { box.append(el('span', { class: 'small muted' }, 'No shared-air infections in these runs.')); return; }
  for (const [t, v] of rows) {
    const cnt = rooms.filter((r) => r.type === t).length;
    const tr = el('div', { class: 'track' }, el('i', { style: `width:${100 * v / max}%` }));
    hover(tr, `${TYPE_LABEL[t] || t}: ${fmt(v)} shared-air infections per season` + (cnt > 1 ? `, or ${fmt(v / cnt)} per room` : ''));
    box.append(el('span', {}, TYPE_LABEL[t] || t), tr, el('span', { class: 'v' }, fmt(v)));
  }
}
function drawTable(keys) {
  const t = $('#table'); t.textContent = '';
  const cols = ['none', ...keys];
  t.append(el('tr', {}, el('th', {}, 'Assumptions'), el('th', {}, 'Measure'), ...cols.map((k) => el('th', {}, ARM_NAME[k]))));
  for (const [sc, name] of SCEN) {
    const R = results[sc]; if (!R) continue;
    const add = (m, f) => t.append(el('tr', {}, el('td', {}, name), el('td', {}, m), ...cols.map((k) => el('td', {}, f(k === 'none' ? R.a : R.arms[k])))));
    add('Reported resident infections, mean', (A) => fmt(mean(A.rep)));
    add('Reported resident infections, median', (A) => fmtInt(median(A.rep)));
    add('Residents admitted to hospital, mean', (A) => fmt(mean(A.hosp)));
    add('All resident infections, mean', (A) => fmt(mean(A.res)));
    add('Share of resident infections taken to be reported', () => pct(results.report[sc]));
    add('All staff infections, mean', (A) => fmt(mean(A.staff)));
    add(`Seasons with ${BIG}+ reported resident infections`, (A) => pct(shareBig(A.rep)));
    add('Seasons simulated', () => R.n);
  }
}

// ---------- replay ----------
// The season on the plan is run once for every set of lamps on offer, so switching between them is immediate.
function requestReplay() {
  clearTimeout(replayTimer); $('#timelab').textContent = 'Simulating this season…';
  const arms = Object.fromEntries(PRESETS.map(([k]) => [k, instLamps(k)])); if (state.custom) arms.custom = state.custom;
  worker.postMessage({ type: 'replay', config: config(), arms, seed: state.seed, minResident: state.firstReplay ? 12 : 0 });
}
let replayTimer = null;
function staleReplay() { replayStale = true; clearTimeout(replayTimer); replayTimer = setTimeout(requestReplay, 500); }
const armNow = () => replayData.arms[state.inst] || replayData.arms.none;
function hash(i) { let x = Math.imul(i + 1, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; }
const isBed = (id) => roomById[id] && roomById[id].type === 'bedroom';
const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let peopleEls = [], posCache = new Map(), seatUse = {};
const ROLE_LABEL = { resident: 'Resident', cna: 'Care aide', aideFloat: 'Care aide, covering all wings', nurse: 'Nurse', lpn: 'Nurse', rn: 'Nurse', therapist: 'Therapist', dietary: 'Kitchen and dining staff', housekeeping: 'Housekeeper', activities: 'Activities staff', admin: 'Office staff' };

// A person's own spot inside a room: residents on their own bed at home,
// everyone else at a fixed place of their own, clear of the room label.
function personPos(p, roomIdx) {
  const key = p * 512 + roomIdx; let v = posCache.get(key); if (v !== undefined) return v;
  const id = replayData.roomIds[roomIdx], b = layout[id], r = roomById[id];
  if (!b) { posCache.set(key, null); return null; }
  const u = hash(key * 2), w = hash(key * 2 + 1), doorTop = r.type === 'bedroom' && layout._doors[id].y === b.y;
  if (r.type === 'bedroom' && replayData.home[p] === id && !replayData.staff[p]) {
    const beds = r.beds || 1, i = beds > 1 ? p % 2 : 0;
    v = { x: b.x + 9.5 + i * (b.w - 19), y: doorTop ? b.y + b.h - 17.5 : b.y + 17.5 };
  } else if (r.type === 'bedroom') v = { x: b.x + 6 + u * (b.w - 12), y: doorTop ? b.y + 10 + w * (b.h - 48) : b.y + 38 + w * (b.h - 48) };
  else {
    // Take the next free seat or work spot in the room; once they are all taken, stand somewhere.
    const seats = layout._seats[id] || [], k = (seatUse[id] = (seatUse[id] || 0) + 1) - 1;
    if (k < seats.length) v = seats[k];
    else if (r.type === 'station') v = { x: b.x + 10 + u * (b.w - 20), y: b.y + 30 + w * (b.h - 38) };
    else v = { x: b.x + 9 + u * (b.w - 18), y: b.y + 46 + w * Math.max(6, b.h - 55) };
  }
  posCache.set(key, v); return v;
}

// ---- walking ----
// Where a room meets the corridor network: its door, and the point on a
// corridor centre line just outside it. Staff at a nurses' station are already
// in the corridor, so they step straight onto the centre line.
function exitOf(roomIdx, spot) {
  const id = replayData.roomIds[roomIdx], d = layout._doors[id];
  if (!d) return null;
  if (d.corridor) return { pts: [], cx: spot.x, cy: d.line === 'T' ? CT : CB, line: d.line };
  return { pts: [{ x: d.x, y: d.y }], cx: d.cx, cy: d.cy, line: d.line };
}
// Leaving the building: lobby door, then the entrance, then out of sight.
function outsideExit() {
  const lob = rooms.find((r) => r.type === 'lobby'), d = lob && layout._doors[lob.id], dx = d ? d.x : ENTRANCE.x;
  return { pts: [{ x: dx, y: 516 }, { x: ENTRANCE.x, y: ENTRANCE.y }, { x: OUTPT.x, y: OUTPT.y }], cx: dx, cy: CB, line: 'B' };
}
// People keep to a lane of their own, so a crowd spreads across the corridor instead of walking in single file.
function corridorRoute(a, b, p) {
  const o = (hash(p * 31 + 5) - 0.5) * 30, os = (hash(p * 31 + 6) - 0.5) * 14;
  const on = (e) => (e.line === 'S' ? { x: e.cx + os, y: e.cy } : { x: e.cx, y: e.cy + o });
  const A = on(a), B = on(b);
  if (a.line === b.line) return [A, B];
  const junction = { T: { x: SX + os, y: CT + o }, B: { x: SX + os, y: CB + o } }, mid = [];
  if (a.line !== 'S') mid.push(junction[a.line]);
  if (b.line !== 'S') mid.push(junction[b.line]);
  return [A, ...mid, B];
}
// Each end lists its points from the corridor inward (door, then anything beyond it).
// A walk is: out through the first end, along the corridors, in through the second, to the person's spot.
function walkPath(p, from, to, cur) {
  const out = replayData.outside, spot = to === out ? null : personPos(p, to);
  const A = from === out ? outsideExit() : exitOf(from, cur), B = to === out ? outsideExit() : exitOf(to, spot);
  if (!A || !B) return spot ? [spot] : [];
  const pts = [...A.pts].reverse().concat(corridorRoute(A, B, p), B.pts);
  if (spot) pts.push(spot);
  return pts;
}
const WALK = 1200;                 // plan units per half-hour slot: slower than life, so walks can be followed
const walkers = { x: null, y: null, room: null, queued: null, depart: null, path: [], seg: null, vis: null, slot: -1 };
function buildPeople() {
  const layer = $('#people'); layer.textContent = ''; peopleEls = []; posCache = new Map(); seatUse = {};
  if (!replayData) return;
  const N = replayData.N;
  for (let p = 0; p < N; p++) {
    const e = pawn(KIND[replayData.roles[p]] || 'other', Math.floor(hash(p * 13 + 1) * 4)); e.dataset.k = e.getAttribute('class');
    e.style.display = 'none'; layer.append(e); peopleEls.push(e);
    hover(e, () => personTip(p));
  }
  Object.assign(walkers, { x: new Float32Array(N), y: new Float32Array(N), room: new Int16Array(N), queued: new Int16Array(N).fill(-1), depart: new Float32Array(N), path: new Array(N).fill(null), seg: new Int16Array(N), vis: new Uint8Array(N), slot: -1 });
}
function personState(p, g) { const D = armNow(); return g < D.tE[p] ? 'st-s' : g < D.tI[p] ? 'st-e' : g < D.tR[p] ? 'st-i' : 'st-r'; }
function personTip(p) {
  const role = ROLE_LABEL[replayData.roles[p]] || 'Staff', w = replayData.wings[p];
  const st = { 'st-s': 'not infected', 'st-e': 'infected, not yet infectious', 'st-i': 'infectious', 'st-r': 'recovered' }[personState(p, state.g)];
  return role + (w >= 0 ? ' · Wing ' + 'ABCD'[w] : '') + ' · ' + st;
}
// Put everyone at their place for slot g, with no walking (used when jumping in time).
function snapPeople(g) {
  if (!replayData) return;
  const D = armNow(), N = replayData.N, W = walkers, base = Math.min(replayData.T - 1, g) * N;
  for (let p = 0; p < N; p++) {
    const r = D.loc[base + p], pos = personPos(p, r);
    W.room[p] = r; W.queued[p] = -1; W.path[p] = null; W.vis[p] = pos ? 1 : 0;
    if (pos) { W.x[p] = pos.x; W.y[p] = pos.y; }
  }
  W.slot = g;
}
// New half hour: anyone whose room changed sets off after a short personal delay.
function retarget(g) {
  const D = armNow(), N = replayData.N, W = walkers, base = Math.min(replayData.T - 1, g) * N;
  for (let p = 0; p < N; p++) {
    const r = D.loc[base + p];
    if (r !== W.room[p] || W.queued[p] >= 0) { if (r === W.room[p]) W.queued[p] = -1; else { W.queued[p] = r; W.depart[p] = g + hash(p * 7919 + g) * 0.12; } }
  }
  W.slot = g;
}
function stepPeople(t, dSlots) {
  const N = replayData.N, W = walkers, out = replayData.outside;
  for (let p = 0; p < N; p++) {
    if (!W.path[p] && W.queued[p] >= 0 && t >= W.depart[p]) {
      const from = W.room[p], to = W.queued[p];
      if (from === out) { W.x[p] = OUTPT.x; W.y[p] = OUTPT.y; W.vis[p] = 1; }
      W.path[p] = walkPath(p, from, to, { x: W.x[p], y: W.y[p] }); W.seg[p] = 0; W.room[p] = to; W.queued[p] = -1;
    }
    const path = W.path[p]; if (!path) continue;
    let left = WALK * dSlots * (replayData.staff[p] ? 1 : 0.7);
    while (left > 0 && W.seg[p] < path.length) {
      const q = path[W.seg[p]], dx = q.x - W.x[p], dy = q.y - W.y[p], d = Math.hypot(dx, dy);
      if (d <= left) { W.x[p] = q.x; W.y[p] = q.y; left -= d; W.seg[p]++; } else { W.x[p] += dx / d * left; W.y[p] += dy / d * left; left = 0; }
    }
    if (W.seg[p] >= path.length) { W.path[p] = null; if (W.room[p] === out) W.vis[p] = 0; }
  }
}
function renderPeople() {
  const layer = $('#people'), show = state.view === 'people' && replayData;
  layer.style.display = show ? '' : 'none'; if (!show) return;
  const N = replayData.N, W = walkers, g = state.g;
  for (let p = 0; p < N; p++) {
    const e = peopleEls[p];
    if (!W.vis[p]) { if (e.style.display !== 'none') e.style.display = 'none'; continue; }
    if (e.style.display === 'none') e.style.display = '';
    e.setAttribute('transform', 'translate(' + W.x[p].toFixed(1) + ',' + W.y[p].toFixed(1) + ') scale(.8)');
    const c = e.dataset.k + ' ' + personState(p, g);
    if (e.getAttribute('class') !== c) e.setAttribute('class', c);
  }
}
function drawReplay() {
  for (const g of document.querySelectorAll('#plan .evs')) g.textContent = '';
  paintLamps(); renderPeople();
  if (!replayData) return;
  const D = armNow(), gNow = state.g, day = Math.min(days - 1, Math.floor(gNow / 48)); let outside = 0, inside = 0;
  D.events.forEach((e, i) => {
    if (e.g > gNow) return;
    if (e.route === 'community') { outside++; return; }
    inside++;
    if (state.view !== 'events') return;
    const b = layout[e.roomId]; if (!b) return;
    const g = document.querySelector(`#plan .room[data-id="${e.roomId}"] .evs`); if (!g) return;
    const pad = 6, top = isBed(e.roomId) ? 32 : (b.h > 60 ? 42 : pad), x = b.x + pad + hash(i * 2) * (b.w - 2 * pad), y = b.y + top + hash(i * 2 + 1) * Math.max(4, b.h - top - pad);
    g.append(e.route === 'close' ? svg('rect', { class: 'ev-close', x: x - 3.2, y: y - 3.2, width: 6.4, height: 6.4, rx: 1 }) : svg('circle', { class: 'ev-room', cx: x, cy: y, r: 3.6 }));
  });
  $('#outsidecount').textContent = inside + ' infected in the building so far, ' + outside + ' staff infected outside it';
  const sl = gNow % 48, wd = WEEKDAY[(day + (config().schedule.startWeekday || 0)) % 7];
  $('#timelab').textContent = `Day ${day + 1} of ${days} · ${wd} ${String(sl >> 1).padStart(2, '0')}:${sl % 2 ? '30' : '00'}`;
  const g = $('#curve'); g.textContent = '';
  const { W, H, x0, x1 } = CURVE, y0 = 12, y1 = H - 26;
  // Always: without lamps, the common areas, and the common areas with bedrooms. Another choice in view gets a line of its own.
  const keys = ['none', 'common', 'both', ...(['bedrooms', 'custom'].includes(state.inst) ? [state.inst] : [])].filter((k) => replayData.arms[k]);
  const cum = (arr) => { let s = 0; return arr.map((v) => (s += v)); }, C = Object.fromEntries(keys.map((k) => [k, cum(replayData.arms[k].newResident)]));
  const max = Math.max(5, ...keys.map((k) => C[k][C[k].length - 1]));
  const X = (d) => x0 + (x1 - x0) * d / (days - 1 || 1), Y = (v) => y1 - (y1 - y0) * v / max;
  const step = max > 60 ? 20 : max > 20 ? 10 : max > 8 ? 5 : 1;
  for (let v = 0; v <= max; v += step) g.append(svg('line', { class: 'grid', x1: x0, x2: x1, y1: Y(v), y2: Y(v) }), svg('text', { x: x0 - 6, y: Y(v) + 4, 'text-anchor': 'end' }, v));
  for (let d = 0; d < days; d += 30) g.append(svg('text', { x: X(d), y: H - 8, 'text-anchor': d ? 'middle' : 'start' }, 'day ' + (d + 1)));
  const path = (c) => c.map((v, d) => (d ? 'L' : 'M') + X(d).toFixed(1) + ',' + Y(v).toFixed(1)).join('');
  for (const k of [...keys.filter((k) => k !== state.inst), ...keys.filter((k) => k === state.inst)]) g.append(svg('path', { class: `ln k-${k}${k === state.inst ? ' on' : ''}`, d: path(C[k]) }));
  // labels at the line ends, kept from overlapping
  const ends = keys.map((k) => ({ k, v: C[k][C[k].length - 1], y: Y(C[k][C[k].length - 1]) })).sort((a, b) => a.y - b.y);
  for (let pass = 0; pass < 4; pass++) for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) { const mid = (ends[i].y + ends[i - 1].y) / 2; ends[i - 1].y = mid - 7.5; ends[i].y = mid + 7.5; }
  const shift = Math.min(0, y1 - 2 - Math.max(...ends.map((e) => e.y))) + Math.max(0, y0 + 4 - Math.min(...ends.map((e) => e.y))); for (const e of ends) e.y += shift;
  for (const e of ends) g.append(svg('line', { class: `ln k-${e.k}`, x1: x1 + 8, x2: x1 + 22, y1: e.y, y2: e.y }), svg('text', { class: 'lab' + (e.k === state.inst ? ' on' : ''), x: x1 + 28, y: e.y + 4 }, `${CURVE_NAME[e.k]}: ${e.v}`));
  g.append(svg('line', { class: 'cross', x1: X(day), x2: X(day), y1: y0, y2: y1 }));
  for (const k of keys) g.append(svg('circle', { class: `kdot k-${k}`, cx: X(day), cy: Y(C[k][day]), r: k === state.inst ? 5 : 4 }));
}
const CURVE = { W: 640, H: 190, x0: 30, x1: 640 - 212 }, CURVE_NAME = { none: 'Without lamps', common: 'Common areas', both: 'Common areas + bedrooms', bedrooms: 'Bedrooms only', custom: 'Your placement' };
// Jump to a moment: everyone is placed where the schedule has them.
function setTime(g) { state.g = Math.max(0, Math.min(days * 48 - 1, Math.floor(g))); clock.t = state.g; $('#time').value = state.g; snapPeople(state.g); drawReplay(); }
$('#curve').addEventListener('pointerdown', (e) => {
  if (!replayData) return; const r = e.currentTarget.getBoundingClientRect();
  const f = ((e.clientX - r.left) / r.width * CURVE.W - CURVE.x0) / (CURVE.x1 - CURVE.x0);
  setPlaying(false); setTime(Math.round(f * (days - 1)) * 48 + 24);
});
// Playback clock, in half-hour slots. Speeds are simulated minutes per second of watching.
const SPEED = { x1: 2, x3: 6, x10: 20, season: 8000 };
const clock = { t: 14, last: 0, raf: 0 };
function frame(now) {
  if (!state.playing || !replayData) return;
  const dt = Math.min(0.1, (now - clock.last) / 1000); clock.last = now;
  const sl = Math.floor(clock.t) % 48, night = sl >= 44 || sl < 13;
  const season = state.speed === 'season';
  let rate = SPEED[state.speed] / 30;                               // slots per second
  if (!season && night && $('#skipnight').checked) rate = Math.max(rate, 3);
  const d = rate * dt, end = days * 48 - 1;
  clock.t = Math.min(end, clock.t + d);
  const g = Math.floor(clock.t);
  if (season) { state.g = g; snapPeople(g); drawReplay(); $('#time').value = g; }
  else {
    if (g !== walkers.slot) { state.g = g; retarget(g); $('#time').value = g; drawReplay(); }
    stepPeople(clock.t, d); renderPeople();
  }
  if (clock.t >= end) { setPlaying(false); return; }
  clock.raf = requestAnimationFrame(frame);
}
function setPlaying(on) {
  state.playing = on && !!replayData; $('#play').textContent = state.playing ? 'Pause' : 'Play'; cancelAnimationFrame(clock.raf);
  if (!state.playing) return;
  if (clock.t >= days * 48 - 1) setTime(0);
  clock.last = performance.now(); clock.raf = requestAnimationFrame(frame);
}
function setView(v) {
  state.view = v;
  for (const b of document.querySelectorAll('#view button')) b.setAttribute('aria-pressed', String(b.dataset.view === v));
  $('#legPeople').hidden = v !== 'people'; $('#legEvents').hidden = v !== 'events';
  drawReplay();
}

// ---------- assumptions ----------
// The ventilation slider scales every room together, so it is shown as what two kinds of room then get.
function ventText(scale) {
  const ach = config().facility.ach;
  return `bedrooms ${fmt(ach.bedroom * scale)} · dining rooms ${fmt(ach.dining * scale)}`;
}
function sliderRow(p) {
  const { lo, hi, def } = paramBounds(p), log = p.scale === 'log' && lo > 0, id = 'p-' + p.path.replace(/\W/g, '-');
  const cur = state.overrides[p.path] != null ? state.overrides[p.path] : def;
  const toPos = (v) => (log ? Math.log(v / lo) / Math.log(hi / lo) : (v - lo) / (hi - lo)) * 1000;
  const toVal = (s) => { const f = s / 1000; const v = log ? lo * Math.pow(hi / lo, f) : lo + (hi - lo) * f; return p.integer ? Math.round(v) : Number(v.toPrecision(3)); };
  const lab = LABELS[p.path] || p;
  if (lab.choices) return choiceRow(p, lab, id, def);
  const show = (v) => (p.path === 'ventilation.scale' ? ventText(v) : fmt(v) + (lab.units ? ' ' + lab.units : ''));
  const out = el('output', { for: id }, show(cur));
  const range = el('input', { type: 'range', id, min: 0, max: 1000, step: 1, value: Math.round(toPos(Math.max(lo, Math.min(hi, cur)))) });
  const src = sourceFor(p);
  const row = el('div', { class: 'prow' + (state.overrides[p.path] != null ? ' changed' : '') });
  const set = (v, isDefault) => {
    if (isDefault) delete state.overrides[p.path]; else state.overrides[p.path] = v;
    out.textContent = show(v); row.classList.toggle('changed', !isDefault);
    if (p.path.startsWith('facility.') && !p.path.startsWith('facility.ach.')) structureChanged(); else if (p.path.startsWith('facility.ach.')) { rebuildFacility(); }
    drawInspector(); scheduleRun(); staleReplay();
  };
  range.addEventListener('input', () => set(toVal(+range.value), false));
  const reset = el('button', { type: 'button', onclick: () => { range.value = Math.round(toPos(def)); set(def, true); } }, 'reset');
  row.append(...[
    el('div', { class: 'l' }, el('label', { for: id }, lab.label), out), range,
    el('div', { class: 'm' }, el('span', {}, p.path === 'ventilation.scale' ? `range ${fmt(lo)}–${fmt(hi)} times the default` : `range ${fmt(lo)}–${fmt(hi)} · default ${fmt(def)}`), reset),
    noteFor(p) ? el('div', { class: 'n' }, noteFor(p)) : null,
    p.path === 'transmission.closeShare' ? el('div', { class: 'n' }, el('button', { type: 'button', class: 'linkbtn splitopen' }, 'How were these numbers chosen?')) : null,
    src && src.text ? el('div', { class: 'src' }, 'Source: ', src.url ? el('a', { href: src.url, target: '_blank', rel: 'noopener' }, src.text) : src.text) : null].filter(Boolean));
  return row;
}
// A setting with two named states (stored as 0 or 1) gets a pair of buttons, not a slider.
function choiceRow(p, lab, id, def) {
  const row = el('div', { class: 'prow' }), seg = el('div', { class: 'seg', role: 'group', id, 'aria-labelledby': id + '-l' });
  const paint = () => {
    const cur = state.overrides[p.path] != null ? state.overrides[p.path] : def;
    [...seg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === cur)));
    row.classList.toggle('changed', state.overrides[p.path] != null);
  };
  const set = (i) => { if (i === def) delete state.overrides[p.path]; else state.overrides[p.path] = i; paint(); drawInspector(); scheduleRun(); staleReplay(); };
  lab.choices.forEach((word, i) => seg.append(el('button', { type: 'button', onclick: () => set(i) }, word)));
  row.append(...[
    el('div', { class: 'l' }, el('span', { class: 'lbl', id: id + '-l' }, lab.label)), seg,
    el('div', { class: 'm' }, el('span', {}, 'default: ' + lab.choices[def].toLowerCase()), el('button', { type: 'button', onclick: () => set(def) }, 'reset')),
    noteFor(p) ? el('div', { class: 'n' }, noteFor(p)) : null,
    sourceFor(p) && sourceFor(p).text ? el('div', { class: 'src' }, 'Source: ', sourceFor(p).url ? el('a', { href: sourceFor(p).url, target: '_blank', rel: 'noopener' }, sourceFor(p).text) : sourceFor(p).text) : null].filter(Boolean));
  paint();
  return row;
}
function drawParams() {
  const usable = Sim.PARAMS.filter((p) => !hidden(p.path) && typeof getPath(Sim.anchoredConfig(undefined, state.pathogen), p.path) === 'number');
  const prim = $('#primary'); prim.textContent = '';
  for (const path of PRIMARY) { const p = usable.find((x) => x.path === path); if (p) prim.append(sliderRow(p)); }
  const box = $('#groupsP'); box.textContent = '';
  const groups = [...new Set([...GROUP_ORDER, ...usable.map((p) => p.group)])];
  for (const gname of groups) {
    const ps = usable.filter((p) => p.group === gname && !PRIMARY.includes(p.path)); if (!ps.length) continue;
    box.append(el('details', { class: 'grp' }, el('summary', {}, gname, el('span', {}, ps.length + ' assumptions')), el('div', { class: 'plist' }, ps.map(sliderRow))));
  }
}

// ---------- wiring ----------
let structTimer = null;
function structureChanged() {
  clearTimeout(structTimer);
  structTimer = setTimeout(() => {
    rebuildFacility(); drawPlan();
    // A standard choice stays one when room sizes change: recount at one lamp per 250 sq ft. The user's own keeps its rooms.
    if (state.custom) for (const id of Object.keys(state.custom)) if (!roomById[id]) delete state.custom[id];
    state.lamps = { ...instLamps(state.inst) };
    if (!roomById[state.selected]) state.selected = null;
    paintLamps(); drawInst(); drawInspector(); drawGroups(); drawPresets(); staleReplay();
  }, 200);
}
function rebuildFacility() {
  const c = config();
  rooms = Sim.buildFacility(c.facility).filter((r) => r.type !== 'outside');
  roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));
  layout = layoutPlan();
  const w = Sim.buildWorld(c, 1);
  nRes = w.people.filter((p) => p.role === 'resident').length; nStaff = w.people.length - nRes; days = c.days;
  $('#time').max = days * 48 - 1;
}
// Text that differs between the infections: what the fit rests on, and where the model and reality part.
const MISMATCH = { covid: /*__MISMATCH__*/[], flu: /*__MISMATCH_FLU__*/[] }, INTRO = { covid: /*__INTRO__*/[][0], flu: /*__INTRO_FLU__*/[][0] };
function drawPathogenText() {
  const m = $('#mismatch'); m.textContent = ''; for (const t of MISMATCH[state.pathogen]) m.append(el('li', {}, t));
  $('#assumeintro').textContent = INTRO[state.pathogen]; $('#ledepath').textContent = state.pathogen === 'flu' ? 'influenza' : PATHOGEN_LABEL[state.pathogen];
}
function init() {
  const pb = $('#pathogen');
  for (const k of Object.keys(Sim.PATHOGENS).filter((k) => SHOWN_PATHOGENS.includes(k))) pb.append(el('button', { type: 'button', 'data-p': k, 'aria-pressed': String(k === state.pathogen), onclick: () => {
    state.pathogen = k; for (const q of Sim.PARAMS) if (q.byPathogen) delete state.overrides[q.path];
    delete state.overrides['transmission.closeShare']; delete state.overrides['emission.median'];   // each infection has its own fit
    for (const b of pb.children) b.setAttribute('aria-pressed', String(b.dataset.p === k));
    drawParams(); drawInspector(); drawPathogenText(); scheduleRun(); staleReplay();
  } }, PATHOGEN_LABEL[k] || k));
  $('#pathfield').hidden = pb.children.length < 2;
  rebuildFacility(); drawPlan(); drawPresets(); drawParams();
  state.lamps = instLamps(state.inst);
  paintLamps(); drawInst(); drawInspector(); drawGroups(); drawPresets();
  const leg = $('#legPeople'); leg.textContent = '';
  const item = (kind, st, label) => { const sv = svg('svg', { width: 22, height: 22, viewBox: '-9 -9 18 18' }), pw = pawn(kind, 1); pw.setAttribute('class', pw.getAttribute('class') + ' ' + st); sv.append(pw); leg.append(el('span', {}, sv, label)); };
  item('resident', 'st-s', 'Resident'); item('aide', 'st-s', 'Care aide'); item('nurse', 'st-s', 'Nurse'); item('other', 'st-s', 'Other staff');
  item('resident', 'st-e', 'Infected, not yet infectious'); item('resident', 'st-i', 'Infectious'); item('resident', 'st-r', 'Recovered');
  $('#play').addEventListener('click', () => setPlaying(!state.playing));
  $('#time').addEventListener('input', (e) => { setPlaying(false); setTime(+e.target.value); });
  for (const b of document.querySelectorAll('#view button')) b.addEventListener('click', () => setView(b.dataset.view));
  for (const b of document.querySelectorAll('#speed button')) b.addEventListener('click', () => { state.speed = b.dataset.speed; for (const x of document.querySelectorAll('#speed button')) x.setAttribute('aria-pressed', String(x === b)); if (state.playing) setPlaying(true); });
  $('#another').addEventListener('click', () => { state.seed++; setPlaying(false); requestReplay(); });
  $('#suggest').addEventListener('click', () => {
    const n = Math.max(1, Math.min(120, Math.round(+$('#budget').value || 12)));
    $('#suggest').disabled = true; $('#suggestmsg').textContent = 'Running seasons to find them…';
    worker.postMessage({ type: 'suggest', config: config(), n, seeds: 150 });
  });
  $('#resetall').addEventListener('click', () => { state.overrides = {}; structureChanged(); drawParams(); drawInspector(); scheduleRun(); staleReplay(); });
  $('#copy').addEventListener('click', async () => {
    const text = JSON.stringify({ pathogen: state.pathogen, lamps: state.lamps, config: config() }, null, 2), b = $('#copy');
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch (e) { b.textContent = 'Copy not available here'; }
    setTimeout(() => { b.textContent = 'Copy settings as JSON'; }, 1800);
  });
  const om = $('#omissions');
  for (const t of /*__OMISSIONS__*/[]) om.append(el('li', {}, t));
  drawPathogenText();
  startRun();
  requestReplay();   // the model opens on a season to watch
}
init();
