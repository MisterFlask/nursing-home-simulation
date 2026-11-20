
// ---------- film ----------
// A scripted explanation at the top of the page. Every frame is a function of film time, so it
// can be scrubbed, replayed and captured. It shows the central case only: one real season (the
// one closest to the average of 200, chosen in web/film-data.mjs), simulated here by the same
// engine as the rest of the page, and the 200-season figures worked out at build time.
const FILM = /*__FILM__*/[][0];
// The two averages the film quotes, from the by-route counts (three decimals), so every scene rounds the same number.
if (FILM) { const q = FILM.routes.states.central, R = FILM.ranges.common.central; R.a = q.a.air + q.a.face; R.b = q.b.air + q.b.face; }
const NARR = /*__NARR__*/[][0] || null;   // the narration, one track per speed, with its timing; made by web/narrate.py. Absent, the film is silent
const FD = 128;                                   // seconds
const F = { t: 0, playing: false, D: null, raf: 0, last: 0, pos: new Map(), seatUse: {}, lastG: -1, lastTau: -1 };
const CHAPTERS = [[0, 'One room'], [13, 'Catching it'], [32, 'The lamps'], [45, 'One day'], [60, 'One winter'], [75, '200 winters'], [87, 'The estimate']];
// The scenes after the room were timed before the 'Catching it' chapter was added: they run on scene time,
// which stands still for that chapter.
const HOLD = [13, 32];
const fScene = (tt) => (tt < HOLD[0] ? tt : tt < HOLD[1] ? HOLD[0] : tt - (HOLD[1] - HOLD[0]));
const fEase = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const fRamp = (t, a, b) => fEase((t - a) / (b - a));
const fLerp = (a, b, f) => a + (b - a) * f;
const fNum = (v) => (Math.round(v * 10) / 10).toFixed(1);
const fPct = (v) => Math.round(v * 100) + '%';
const FX = (v) => 600 + 500 * v / 0.8;   // the final card's percentage scale

// A share of the breathed-out virus, as a count out of every 100,000 particles: whole numbers on one base, so they compare.
const fPer = (x) => Number((x * 1e5).toPrecision(2)).toLocaleString('en-US');
const oneIn = (p) => { if (!(p > 1e-12)) return '–'; const n = 1 / p, r = n >= 100 ? Number(n.toPrecision(2)) : n >= 10 ? Math.round(n) : Math.round(n * 2) / 2; return '1 in ' + r.toLocaleString('en-US'); };
function filmCaptions() {
  const m = F.m, R = FILM.ranges.common.central, c = F.ch, Q = FILM.routes.states, tot = (x) => x.air + x.face, less = (st) => 1 - tot(st.b) / tot(st.a);
  return [
    [0, 0, `One room in the model: a dining room at noon, with ${m.present} people sitting down to lunch.`],
    [4.5, 0, 'One of them is infectious. The model spreads the virus they breathe out evenly through the room\'s air, so everyone here breathes a little of it, wherever they sit. Most of it is cleared away first: by ventilation, by the virus dying off, and by settling.'],
    [9, 0, 'People at the same table are also face to face. The model treats that as breathing from a small pocket of air around the infectious person, and counts it separately between each pair.'],
    [13, 1, `Of every 100,000 virus particles this person breathes out over the hour, each resident in the room breathes in about ${fPer(c.shareAir(m.lam0))} through the shared air. Each tablemate breathes in about ${fPer(c.shareClose)} more, face to face. Shared air reaches many people a little; face to face reaches a few people a lot.`],
    [19.5, 1, `The more someone breathes in, the bigger their chance of infection. This person breathes out a typical amount of virus, so even after the full hour the chances are small: about ${oneIn(c.air(1, m.lam0, 1))} for each resident through the room's air, and about ${oneIn(c.close(1, 1))} more for each tablemate. Stay twice as long and the chance roughly doubles.`],
    [26, 1, `People differ. In the model, about one infectious person in ${Math.round(1 / c.highShare / 5) * 5} breathes out a hundred times as much virus; the same hour then gives each resident in the room about a ${oneIn(c.air(1, m.lam0, 100))} chance, and each tablemate about ${oneIn(c.close(1, 100))} more. What a person breathes in adds up all winter, across every room and contact. Immunity from past infection and vaccines is assumed to halve it.`],
    [32, 2, `Now the same lunch again, with far-UVC lamps on, mounted high on the walls. They inactivate virus in the room's air. In the model, ${m.nLamps} lamps clear this room's air as much as ${fNum(m.dAch)} extra air changes an hour, on top of ${fNum(m.lam0)}, so less is left to breathe. Each resident now breathes in about ${fPer(c.shareAir(m.lam0 + m.dAch))} of every 100,000 particles the infectious person breathes out, not ${fPer(c.shareAir(m.lam0))}, and their chance over the hour falls from ${oneIn(c.air(1, m.lam0, 1))} to ${oneIn(c.air(1, m.lam0 + m.dAch, 1))}.`],
    [39, 2, `Face to face, each tablemate still breathes in about ${fPer(c.shareClose)} of every 100,000: the model gives lamps no effect on that. Lamps act on the air a room shares, and on nothing else.`],
    [45, 3, `Lamps off again, and step back to the whole home: ${nRes} residents and their staff. The model tracks which room each person is in, every half hour.`],
    [52.5, 3, 'Virus builds up wherever an infectious person spends time, and clears after they leave. Who shares a room with whom, and for how long, decides where infection can spread.'],
    [60, 4, `Now a whole winter, run twice: once without lamps, and once with a lamp for every 250 square feet of the common areas, ${FILM.lamps.common} in all. Every ${Sim.ANCHORED.arrivalEveryDays} days one staff member arrives infected. Most arrivals go nowhere. A few start an outbreak.`],
    [68, 4, `It is the same winter both times: the same people and the same arrivals. In this one, ${F.season.a} residents had a reported infection without lamps and ${F.season.b} with them.`],
    [75, 5, `Winters differ too much for one to say much, so the model runs ${FILM.n}, each twice.`],
    [82, 5, `On average, ${fNum(R.a)} of ${nRes} residents have a reported infection without lamps and ${fNum(R.b)} with lamps in the common areas: ${fPct(R.cut)} fewer.`],
    [87, 6, `Where does that difference come from? Of those ${fNum(tot(Q.central.a))} infections, about ${fNum(Q.central.a.air)} reach residents through the air of a shared room, and about ${fNum(Q.central.a.face)} face to face. Lamps act only on the first kind, and cut it by about ${fPct(1 - Q.central.b.air / Q.central.a.air)}. The face-to-face kind falls a little as well, because fewer people are infectious.`],
    [95.5, 6, 'Two things in this picture have not been measured well. One is the split: the more that spreads face to face, the less lamps have to work on. The other is how strongly lamps act on virus in a real room, outside the lab.'],
    [105.6, 6, `Take the less helpful end of both, and the model has about ${fPct(less(Q.cautious))} fewer infections. Take the more helpful end of both, and it has about ${fPct(less(Q.favourable))} fewer.`],
    [111, 6, `So our best estimate for a nursing home like this one is about ${fPct(R.cut)} fewer reported infections among residents with Aerolamps in the common areas, and about ${fPct(FILM.ranges.both.central.cut)} fewer with lamps in the bedrooms as well. Bedrooms matter because, in the model, more than half of the infections residents catch through shared air are caught there.`],
    [120.5, 6, 'All of this comes from a model; no trial has measured it yet. You can change every assumption in the simulator.'],
  ];
}

// ---- where people stand (the film's own copy: its season and its seating by table) ----
function fPos(p, ri) {
  const key = p * 512 + ri; let v = F.pos.get(key); if (v !== undefined) return v;
  const D = F.D, id = D.roomIds[ri], b = F.layout[id], r = F.roomById[id];
  if (!b) { F.pos.set(key, null); return null; }
  const u = hash(key * 2), w = hash(key * 2 + 1), doorTop = r.type === 'bedroom' && F.layout._doors[id].y === b.y;
  if (r.type === 'bedroom' && D.home[p] === id && !D.staff[p]) {
    const beds = r.beds || 1, i = beds > 1 ? p % 2 : 0;
    v = { x: b.x + 9.5 + i * (b.w - 19), y: doorTop ? b.y + b.h - 17.5 : b.y + 17.5 };
  } else if (r.type === 'bedroom') v = { x: b.x + 6 + u * (b.w - 12), y: doorTop ? b.y + 10 + w * (b.h - 48) : b.y + 38 + w * (b.h - 48) };
  else {
    // Residents sit with the people the model seats them with; everyone else takes the next free place.
    const seats = F.seats[id] || [], ts = F.tableSeat[p];
    let k = ts && ts.room === ri ? ts.k : -1;
    if (k < 0) { k = (F.tableSeats[ri] || 0) + (F.seatUse[id] || 0); F.seatUse[id] = (F.seatUse[id] || 0) + 1; }
    if (k < seats.length) v = seats[k];
    else if (r.type === 'station') v = { x: b.x + 10 + u * (b.w - 20), y: b.y + 30 + w * (b.h - 38) };
    else if (r.type === 'dining') v = { x: b.x + 9 + u * (b.w - 18), y: b.y + b.h - 6 };   // standing room along the wall, clear of the tables
    else v = { x: b.x + 9 + u * (b.w - 18), y: b.y + 46 + w * Math.max(6, b.h - 55) };
  }
  F.pos.set(key, v); return v;
}
function fExit(ri, spot) {
  const d = F.layout._doors[F.D.roomIds[ri]]; if (!d) return null;
  if (d.corridor) return { pts: [], cx: spot.x, cy: d.line === 'T' ? CT : CB, line: d.line };
  return { pts: [{ x: d.x, y: d.y }], cx: d.cx, cy: d.cy, line: d.line };
}
function fWalk(p, from, to, cur) {
  const out = F.D.outside, spot = to === out ? null : fPos(p, to);
  const A = from === out ? outsideExit() : fExit(from, cur), B = to === out ? outsideExit() : fExit(to, spot);
  if (!A || !B) return spot ? [spot] : [];
  const pts = [...A.pts].reverse().concat(corridorRoute(A, B, p), B.pts);
  if (spot) pts.push(spot);
  return pts;
}
// Everyone's walks for the afternoon the film shows, so a position is a function of time.
function fTrajectories() {
  const D = F.D, N = D.N, L = D.a.loc; F.traj = [];
  for (let p = 0; p < N; p++) {
    let room = L[F.g0 * N + p], spot = room === D.outside ? null : fPos(p, room), free = F.g0; const segs = [], spot0 = spot;
    for (let g = F.g0 + 1; g <= F.g1; g++) {
      const r = L[g * N + p]; if (r === room) continue;
      const start = spot || { x: OUTPT.x, y: OUTPT.y }, pts = [start, ...fWalk(p, room, r, start)], cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      const t0 = Math.max(g + hash(p * 7919 + g) * 0.12, free), t1 = t0 + cum[cum.length - 1] / (WALK * (D.staff[p] ? 1 : 0.7));
      segs.push({ t0, t1, pts, cum, stay: r !== D.outside });
      room = r; spot = r === D.outside ? null : pts[pts.length - 1]; free = t1;
    }
    F.traj.push({ spot0, segs });
  }
}
function fAt(p, tau) {
  const T = F.traj[p]; let cur = T.spot0;
  for (const s of T.segs) {
    if (tau < s.t0) return cur;
    if (tau < s.t1) {
      const d = (tau - s.t0) / (s.t1 - s.t0) * s.cum[s.cum.length - 1]; let i = 1; while (i < s.cum.length - 1 && s.cum[i] < d) i++;
      const f = (d - s.cum[i - 1]) / Math.max(1e-6, s.cum[i] - s.cum[i - 1]);
      return { x: fLerp(s.pts[i - 1].x, s.pts[i].x, f), y: fLerp(s.pts[i - 1].y, s.pts[i].y, f) };
    }
    cur = s.stay ? s.pts[s.pts.length - 1] : null;
  }
  return cur;
}
// ---- camera ----
// Keyframes in film time: zoom k, the point of the plan to look at (f, or the infectious person when follow is
// set), and where on the stage that point sits (a). Between keys the camera eases, zooming geometrically.
function fCamKeys() {
  const b = F.m.b, R = [b.x + b.w / 2, b.y + b.h / 2], W = [600, 320], A = [424, 338], C = [600, 337], X = F.xy, T = F.tableC, L = F.lampC;
  return [
    { t: 0, k: 1, f: W, a: C }, { t: 0.9, k: 1.02, f: W, a: C },                    // the whole home
    { t: 3.5, k: 3.6, f: R, a: A }, { t: 4.5, k: 3.68, f: R, a: A },               // fly in to the dining room
    { t: 5.8, k: 7.4, f: X, a: A }, { t: 6.5, k: 7.6, f: X, a: A },                 // close on the infectious person
    { t: 9, k: 3.6, f: R, a: A },                                                   // pull back as the virus fills the room
    { t: 10.3, k: 6.2, f: T, a: A }, { t: 12.9, k: 6.45, f: T, a: A },              // their table: face to face
    { t: 14.5, k: 3.6, f: R, a: A }, { t: 23, k: 3.78, f: R, a: A }, { t: 32, k: 3.6, f: R, a: A },   // everyone in the room, drifting
    { t: 32.9, k: 7, f: L, a: A }, { t: 33.6, k: 7.25, f: L, a: A },                // a lamp comes on
    { t: 35.4, k: 3.6, f: R, a: A }, { t: 39, k: 3.68, f: R, a: A },                // the lunch again, with lamps
    { t: 40.3, k: 6.2, f: T, a: A }, { t: 45, k: 6.45, f: T, a: A },                // the table: unchanged
    { t: 48.4, k: 1, f: W, a: C }, { t: 52.3, k: 1.035, f: W, a: C },               // step back to the whole home
    { t: 54, k: 2.5, follow: true, a: C }, { t: 58, k: 2.6, follow: true, a: C },   // follow the infectious person through the afternoon
    { t: 59.7, k: 1, f: W, a: C }, { t: 60, k: 1, f: W, a: C },
  ];
}
function fFollow(tau) {   // where the infectious person is, averaged over a moment so the camera does not jerk at corners
  let x = 0, y = 0, n = 0;
  for (let i = 0; i < 9; i++) { const q = fAt(FILM.moment.person, tau - i * 0.025); if (q) { x += q.x; y += q.y; n++; } }
  return n ? [x / n, y / n] : [600, 320];
}
function fCam(tt, tau) {
  const K = F.camKeys; let i = 0; while (i < K.length - 2 && tt >= K[i + 1].t) i++;
  const a = K[i], c = K[i + 1], e = fEase((tt - a.t) / (c.t - a.t)), fa = a.follow ? fFollow(tau) : a.f, fc = c.follow ? fFollow(tau) : c.f;
  return { k: Math.exp(fLerp(Math.log(a.k), Math.log(c.k), e)), fx: fLerp(fa[0], fc[0], e), fy: fLerp(fa[1], fc[1], e), ax: fLerp(a.a[0], c.a[0], e), ay: fLerp(a.a[1], c.a[1], e) };
}
const fState = (arm, p, g) => (g < arm.tE[p] ? 'st-s' : g < arm.tI[p] ? 'st-e' : g < arm.tR[p] ? 'st-i' : 'st-r');

// ---- building the stage ----
function filmBuild() {
  const root = $('#film'); if (!root || !FILM) return;
  F.rooms = rooms.slice(); F.layout = layout; F.roomById = Object.fromEntries(F.rooms.map((r) => [r.id, r]));
  F.seats = {}; F.haze = {};
  const cam = svg('g', { id: 'fcam' }), L = F.layout;
  cam.append(svg('rect', { class: 'yard', x: 28, y: 256, width: 376, height: 108, rx: 4 }), svg('rect', { class: 'yard', x: 796, y: 256, width: 376, height: 108, rx: 4 }));
  for (const b of L._corr) cam.append(svg('rect', { class: 'corr', x: b.x, y: b.y, width: b.w, height: b.h }));
  for (const b of L._svc) cam.append(svg('rect', { class: 'svc', x: b.x, y: b.y, width: b.w, height: b.h }));
  for (const w of L._wings) cam.append(svg('text', { class: 'wing', x: w.x, y: w.y, 'text-anchor': w.anchor }, w.label));
  const hazeLayer = svg('g', {});
  for (const r of F.rooms) {
    const b = L[r.id]; if (!b) continue;
    const g = svg('g', { class: 'room' });
    g.append(svg('rect', { class: 'shell', x: b.x, y: b.y, width: b.w, height: b.h }));
    if (r.type !== 'bedroom') g.append(svg('text', { class: 'nm', x: b.x + 8, y: b.y + 20 }, SHORT[r.type] + (r.type === 'dining' ? ' ' + (F.rooms.filter((x) => x.type === 'dining').indexOf(r) + 1) : '')));
    const f = furnish(r, b); g.append(svg('g', { class: 'furniture' }, f.els)); F.seats[r.id] = f.seats;
    cam.append(g);
    F.haze[r.id] = svg('rect', { class: 'fhaze', x: b.x + 1, y: b.y + 1, width: b.w - 2, height: b.h - 2, opacity: 0 }); hazeLayer.append(F.haze[r.id]);
  }
  const gap = (x, y, vert) => cam.append(svg('line', { class: 'door', x1: vert ? x : x - 6, y1: vert ? y - 6 : y, x2: vert ? x : x + 6, y2: vert ? y + 6 : y }));
  for (const id in L._doors) { const d = L._doors[id]; if (!d.corridor) gap(d.x, d.y, d.line === 'S'); }
  for (const w of [416, 784]) for (const y of [CT, CB]) cam.append(svg('line', { class: 'door', x1: w, y1: y - 12, x2: w, y2: y + 12 }));
  for (const y of [158, 462]) cam.append(svg('line', { class: 'door', x1: 590, y1: y, x2: 610, y2: y }));
  gap(ENTRANCE.x, ENTRANCE.y, false);

  // The room the film opens in, its lamps, the virus in its air and the face-to-face links.
  const room = F.roomById[FILM.moment.room], b = L[room.id], c = Sim.anchoredConfig(), nLamps = suggestedCount(room);
  const lam0 = room.ach * c.ventilation.scale + c.air.decay + c.air.deposition, dAch = Sim.lampAchFor(c, room, nLamps);
  F.m = { room, b, nLamps, lam0, dAch, vent: room.ach * c.ventilation.scale, ratio: lam0 / (lam0 + dAch), present: 0 };
  F.wash = svg('rect', { class: 'fwash', x: b.x + 1, y: b.y + 1, width: b.w - 2, height: b.h - 2, opacity: 0 });
  F.parts = svg('g', { class: 'fparts' }); F.partEls = [];
  for (let i = 0; i < 170; i++) { const e = svg('circle', { r: 1.15, opacity: 0 }); F.parts.append(e); F.partEls.push(e); }
  F.demoLamps = svg('g', { opacity: 0 });
  // Lamps sit high on the walls, angled down into the room, as on the plan.
  F.lampSpots = wallSpots(b, nLamps);
  for (const q of F.lampSpots) F.demoLamps.append(lampMark(q.x, q.y, 1));
  F.links = svg('g', { class: 'flinks', opacity: 0 }); F.ring = svg('circle', { class: 'fring', r: 9, opacity: 0 });
  F.people = svg('g', {});
  cam.append(F.wash, hazeLayer, F.parts, F.demoLamps, F.links, F.ring, F.people);

  // Two small plans for the winter run twice.
  F.mini = svg('g', { opacity: 0 }); F.dots = { a: [], b: [] }; F.dotLayer = {}; F.pingLayer = {}; F.pings = { a: [], b: [] }; F.inf = { a: [], b: [] };
  const lit = presetLamps(COMMON);
  for (const [arm, x, title] of [['a', 16, 'WITHOUT LAMPS'], ['b', 608, `WITH ${FILM.lamps.common} LAMPS IN THE COMMON AREAS`]]) {
    const g = svg('g', { transform: `translate(${x},84) scale(.48)` });
    for (const bb of L._corr) g.append(svg('rect', { class: 'mcorr', x: bb.x, y: bb.y, width: bb.w, height: bb.h }));
    for (const r of F.rooms) { const bb = L[r.id]; if (bb) g.append(svg('rect', { class: 'mshell' + (arm === 'b' && lit[r.id] ? ' lit' : ''), x: bb.x, y: bb.y, width: bb.w, height: bb.h })); }
    F.dotLayer[arm] = svg('g', {}); F.pingLayer[arm] = svg('g', {}); g.append(F.dotLayer[arm], F.pingLayer[arm]);
    F.mini.append(svg('text', { class: 'ft fe', x: x + 4, y: 70 }, title), g);
  }
  F.chart = svg('g', {}); F.final = svg('g', { opacity: 0 }); F.split = svg('g', { opacity: 0 });
  F.hud = svg('g', {}); F.clock = svg('text', { class: 'ft fe', x: 24, y: 38 }, ''); F.clockBg = svg('rect', { class: 'fbg', x: 10, y: 14, width: 250, height: 36, rx: 6, opacity: .9 });
  root.append(svg('rect', { class: 'fbg', x: -10, y: -10, width: 1220, height: 695 }), cam, F.mini, F.chart, F.split, F.final, F.hud, F.clockBg, F.clock);
  F.cam = cam;

  // Readout beside the room, top to bottom in the order the film introduces it and the order of cause:
  // what clears the air, then what share of the breathed-out virus each other person breathes in, then the chance
  // that gives. Values that need the season are filled in by filmData.
  const H = F.hud, hx = 842, bw = 320, tot = lam0 + dAch, T = (cls, x, y, txt, extra) => svg('text', { class: 'ft ' + cls, x, y, ...(extra || {}) }, txt);
  const c1 = hx + 206, c2 = hx + 320, R = { 'text-anchor': 'end' };
  F.clear = svg('g', { opacity: 0 });
  F.gLamp = svg('rect', { class: 'flamp', x: hx + bw * lam0 / tot + 2, y: 72, width: 0, height: 12, rx: 3 });
  F.gLampT = T('fs flampt', hx, 124, `lamps +${fNum(dAch)}`, { opacity: 0 });
  F.clear.append(T('fe', hx, 58, 'AIR CLEARED, CHANGES PER HOUR'),
    svg('rect', { class: 'fvent', x: hx, y: 72, width: bw * F.m.vent / tot - 2, height: 12, rx: 3 }),
    svg('rect', { class: 'fdecay', x: hx + bw * F.m.vent / tot, y: 72, width: bw * (lam0 - F.m.vent) / tot, height: 12, rx: 3 }), F.gLamp,
    T('fs', hx, 106, `ventilation ${fNum(F.m.vent)} · die-off and settling ${fNum(lam0 - F.m.vent)}`), F.gLampT);
  // shares
  F.share = svg('g', { opacity: 0 });
  F.shAir = T('fmed fnum', c2, 230, '', R); F.shClose = T('fmed fnum', c2, 308, '', R);
  F.shSubA = T('fs', hx + 22, 246, ''); F.shSubC = T('fs', hx + 22, 324, ''); F.shWas = T('fs flampt', hx + 22, 264, '', { opacity: 0 });
  for (let i = 0; i < 4; i++) F.share.append(svg('circle', { class: 'fair', cx: hx + 3 + (i % 2) * 7, cy: 217 + (i >> 1) * 7, r: 2.4 }));
  F.share.append(T('fe', hx, 156, 'OF EVERY 100,000 VIRUS PARTICLES'), T('fe', hx, 174, 'THIS PERSON BREATHES OUT,'), T('fe', hx, 192, 'EACH OTHER PERSON BREATHES IN'),
    T('fl', hx + 22, 226, 'through shared air'), F.shAir, F.shSubA,
    svg('line', { class: 'fklink', x1: hx, x2: hx + 14, y1: 298, y2: 298 }), T('fl', hx + 22, 304, 'face to face'), F.shClose, F.shSubC, F.shWas);
  // chances so far: one row for the room's air, one for face to face; one column for this person, one for a high emitter
  F.chance = svg('g', { opacity: 0 }); F.chHigh = svg('g', { opacity: 0 });
  F.chHead = T('fe', hx, 376, '');
  F.chAir = T('fl fnum', c1, 426, '', R); F.chAirH = T('fl fnum', c2, 426, '', R); F.chClose = T('fl fnum', c1, 454, '', R); F.chCloseH = T('fl fnum', c2, 454, '', R);
  F.chEmit = T('fs', hx, 484, ''); F.chNote = T('fs', hx, 526, ''); F.chWas = T('fs flampt', hx, 550, '', { opacity: 0 });
  F.chHigh.append(T('fs', c2, 398, 'a high emitter', R), F.chAirH, F.chCloseH, F.chNote);
  F.chance.append(T('fe', hx, 358, 'CHANCE OF CATCHING IT'), F.chHead, T('fs', c1, 398, 'this person', R), T('fl', hx, 426, 'shared air'), F.chAir, T('fl', hx, 454, 'face to face'), F.chClose,
    F.chEmit, T('fs', hx, 502, '1 dose infects about 2 in 3 who take it in.'), F.chHigh, F.chWas, T('fs', hx, 576, 'chance = 1 − e^(−dose): the Wells-Riley rule'));
  F.key = [svg('g', { opacity: 0 }), svg('g', { opacity: 0 })];
  const kp = pawn('resident', 1); kp.setAttribute('class', kp.getAttribute('class') + ' st-i'); kp.setAttribute('transform', `translate(${hx + 12},618) scale(1.9)`);
  F.key[0].append(kp, T('fl', hx + 34, 624, 'infectious'));
  const kr = pawn('resident', 2); kr.setAttribute('class', kr.getAttribute('class') + ' st-r'); kr.setAttribute('transform', `translate(${hx + 176},618) scale(1.9)`);
  F.key[1].append(kr, T('fl', hx + 198, 624, 'recovered'));
  H.append(svg('rect', { class: 'fbg', x: 806, y: -10, width: 424, height: 695 }), svg('line', { class: 'fgrid', x1: 806, x2: 806, y1: 0, y2: 675 }), F.clear, F.share, F.chance, ...F.key);

  // Final card. Each range runs between the two ends of the unknowns, and its ends say which.
  F.rows = [];
  const row = (y, t0, name, sub, R) => {
    const cuts = [R.cautious.cut, R.central.cut, R.favourable.cut], lo = Math.min(...cuts), hi = Math.max(...cuts), g = svg('g', {});
    const end = (x, v, l1, l2) => svg('g', {}, [svg('text', { class: 'ft fl', x, y: y + 36, 'text-anchor': 'middle' }, fPct(v)), svg('text', { class: 'ft fs', x, y: y + 55, 'text-anchor': 'middle' }, l1), svg('text', { class: 'ft fs', x, y: y + 72, 'text-anchor': 'middle' }, l2)]);
    const o = { g, t0, lo, hi, mid: R.central.cut, big: svg('text', { class: 'ft fbig', x: 196, y: y + 18, 'text-anchor': 'end' }, ''),
      line: svg('line', { class: 'frange', x1: FX(lo), x2: FX(lo), y1: y, y2: y }), dot: svg('circle', { class: 'fmid', cx: FX(R.central.cut), cy: y, r: 0 }),
      ends: end(FX(lo), lo, 'more face to face,', 'lamps act weakly'), ends2: end(FX(hi), hi, 'more through room air,', 'lamps act strongly') };
    g.append(o.big, svg('text', { class: 'ft fh', x: 224, y: y - 2 }, name), svg('text', { class: 'ft fs', x: 224, y: y + 24 }, sub), o.line, o.dot, o.ends, o.ends2);
    F.rows.push(o); return g;
  };
  F.final.append(svg('text', { class: 'ft fe', x: 80, y: 84 }, 'OUR BEST ESTIMATE, FOR A NURSING HOME LIKE THIS ONE'),
    svg('text', { class: 'ft ftitle', x: 80, y: 130 }, 'Fewer reported infections among residents over a winter'));
  for (const v of [0, 0.2, 0.4, 0.6, 0.8]) F.final.append(svg('line', { class: 'fgrid', x1: FX(v), x2: FX(v), y1: 214, y2: 510 }), svg('text', { class: 'ft fs', x: FX(v), y: 204, 'text-anchor': 'middle' }, fPct(v)));
  F.final.append(row(280, 112.2, 'Lamps in the common areas', `${FILM.lamps.common} lamps, one per 250 square feet`, FILM.ranges.common),
    row(420, 114.1, 'Common areas and bedrooms', `${FILM.lamps.both} lamps`, FILM.ranges.both),
    svg('text', { class: 'ft fs', x: 80, y: 560 }, 'Large figure: our central assumptions. Bar: from the less helpful end of both unknowns to the more helpful end.'),
    svg('text', { class: 'ft fs', x: 80, y: 584 }, `A model result from ${FILM.n} simulated winters, each run with and without lamps. No trial has measured this.`),
    svg('text', { class: 'ft fs', x: 80, y: 608 }, 'Bedroom lamps are dimmed further, because residents spend about 20 hours a day there and exposure limits assume 8.'));
  splitBuild();

  // Controls.
  const ch = $('#filmchaps');
  CHAPTERS.forEach(([t0, name], i) => ch.append(el('button', { type: 'button', 'aria-pressed': 'false', onclick: () => filmSeek(t0) }, (i + 1) + ' · ' + name)));
  $('#filmplay').addEventListener('click', () => filmPlay(!F.playing));
  $('#filmbig').addEventListener('click', () => { F.sound = !!F.narr; soundUI(); filmPlay(true); });
  $('#filmquiet').addEventListener('click', () => { F.sound = false; soundUI(); filmPlay(true); });
  $('#filmsound').addEventListener('click', () => { F.sound = !F.sound; soundUI(); if (F.playing) filmPlay(true); });   // carries on from the same place, with or without the voice
  $('#filmrate').addEventListener('change', (e) => { F.trk = +e.target.value; soundUI(); if (F.playing && F.sound) filmPlay(true); });   // the same place in the film, on the track spoken at the new speed
  $('#filmseek').max = FD * 10; $('#filmseek').addEventListener('input', (e) => filmSeek(+e.target.value / 10));
  $('#filmskip').addEventListener('click', () => goView('model'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) filmPlay(false); });
  worker.postMessage({ type: 'film', config: Sim.anchoredConfig(), lamps: presetLamps(COMMON), seed: FILM.seed });
  window.__film = { render: (t) => filmSeek(t), state: () => ({ t: F.t, sound: F.sound, playing: F.playing, audio: F.narr ? sndTime() : null, ctx: F.snd.ctx ? F.snd.ctx.state : null, total: F.narr ? fTrack().total : null, rate: F.narr ? fTrack().rate : null }), dur: FD, ready: () => !!F.D, captions: () => F.caps.map((c) => ({ t: c[0], text: c[2] })) };
}

// The season arrives from the worker: seat people, work out the afternoon's walks and the curves.
function filmData(m) {
  F.D = m; const N = m.N, mo = FILM.moment;
  F.dayG = mo.day * 48; F.g0 = F.dayG + 23; F.g1 = F.dayG + 32; F.tau0 = F.dayG + 26;   // the room is shown through lunch (12:00 to 13:00); the day carries on from 13:00
  F.ri = m.roomIds.indexOf(mo.room);
  // Seats by table: the model's tables in a dining room take the drawn tables in order.
  F.tableSeat = {}; F.tableSeats = {}; const nth = {};
  for (let j = 0; j < m.tables.room.length; j++) {
    const ri = m.tables.room[j], r = F.roomById[m.roomIds[ri]]; if (!r || r.type !== 'dining') continue;
    const ord = (nth[ri] = (nth[ri] || 0) + 1) - 1;
    for (let k = m.tables.start[j]; k < m.tables.start[j + 1]; k++) F.tableSeat[m.tables.members[k]] = { room: ri, k: ord * 4 + (k - m.tables.start[j]) };
    F.tableSeats[ri] = (ord + 1) * 4;
  }
  fTrajectories();
  for (let p = 0; p < N; p++) { const e = pawn(KIND[m.roles[p]] || 'other', Math.floor(hash(p * 13 + 1) * 4)); e.dataset.k = e.getAttribute('class'); e.style.display = 'none'; F.people.append(e); }
  F.pawns = [...F.people.children];
  for (const arm of ['a', 'b']) for (let p = 0; p < N; p++) { const d = svg('circle', { class: 'md', r: 5 }); F.dotLayer[arm].append(d); F.dots[arm].push(d); }
  // Every infection in each run, with where the person was, so the small plans can flash as it happens.
  for (const arm of ['a', 'b']) {
    for (let p = 0; p < N; p++) { const g = m[arm].tE[p]; if (g >= 1e9 || g >= m.T) continue; const r = m[arm].loc[g * N + p], q = r === m.outside ? null : fPos(p, r); if (q) F.inf[arm].push({ day: g / 48, x: q.x, y: q.y }); }
    F.inf[arm].sort((u, v) => u.day - v.day);
    for (let i = 0; i < 28; i++) { const c = svg('circle', { class: 'fping', r: 0 }); c.style.display = 'none'; F.pingLayer[arm].append(c); F.pings[arm].push(c); }
  }
  const gNow = F.dayG + 25, X = mo.person;
  F.m.present = 0; for (let p = 0; p < N; p++) if (m.a.loc[gNow * N + p] === F.ri) F.m.present++;
  const px = fPos(X, F.ri);
  for (const q of mo.mates) { const pq = fPos(q, F.ri); F.links.append(svg('line', { x1: px.x, y1: px.y, x2: pq.x, y2: pq.y })); }
  F.ring.setAttribute('cx', px.x); F.ring.setAttribute('cy', px.y + 0.5);
  { const pts = [px, ...mo.mates.map((q) => fPos(q, F.ri))]; F.xy = [px.x, px.y]; F.tableC = [pts.reduce((a, q) => a + q.x, 0) / pts.length, pts.reduce((a, q) => a + q.y, 0) / pts.length]; F.lampC = [F.lampSpots[0].x + 22, F.lampSpots[0].y]; F.camKeys = fCamKeys(); }
  F.cRef = Math.max(1e-12, m.a.conc[gNow * m.nRooms + F.ri]);
  // The lunch, by the model's own rules, as functions of the hours since noon (h), the clearing rate (lam) and a
  // multiple of this person's emission (k). Virus in the air: S/lam x (1 - e^(-lam h)) doses. Room-air dose: breathing
  // rate x susceptibility x the concentration added up over time. Face to face: breathing rate x susceptibility x
  // emission x time together x G / beta. Chance = 1 - exp(-dose). At h = 1 these are what the engine computes for the meal.
  {
    const c = Sim.anchoredConfig(), V = F.m.room.volume, src = m.q[X] * c.emission.activity.social, sus = m.s[mo.mates[0]], br = c.breathing.social;
    const z = Math.log(100) / Math.log(c.emission.gsd), tz = 1 / (1 + 0.2316419 * z), tail = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * tz * (0.319381530 + tz * (-0.356563782 + tz * (1.781477937 + tz * (-1.821255978 + tz * 1.330274429))));
    const ch = F.ch = { src, highShare: tail,
      inAir: (h, lam) => src / lam * (1 - Math.exp(-lam * h)),
      // share of everything breathed out over an hour that one resident breathes in through the room's air, and face to face
      shareAir: (lam) => br / (lam * V) * (1 - (1 - Math.exp(-lam)) / lam), shareClose: br * c.transmission.G / c.transmission.beta.table,
      air: (h, lam, k) => 1 - Math.exp(-br * sus * src * k / (lam * V) * (h - (1 - Math.exp(-lam * h)) / lam)),
      close: (h, k) => 1 - Math.exp(-br * sus * src * k * h * c.transmission.G / c.transmission.beta.table) };
    ch.steady = ch.inAir(1e3, F.m.lam0);
    F.shClose.textContent = fPer(ch.shareClose); F.shWas.textContent = `without lamps: ${fPer(ch.shareAir(F.m.lam0))}`;
    F.chEmit.textContent = `Breathed out here: about ${src.toFixed(1)} doses an hour.`;
    F.chWas.textContent = `shared air without lamps: ${oneIn(ch.air(1, F.m.lam0, 1))} · ${oneIn(ch.air(1, F.m.lam0, 100))}`;
    const open = (p) => m.a.tE[p] > gNow, resHere = []; for (let p = 0; p < N; p++) if (m.a.loc[gNow * N + p] === F.ri && !m.staff[p] && open(p) && p !== X) resHere.push(p);
    const mates = mo.mates.filter(open);
    F.shSubA.textContent = `each of ${resHere.length} residents in the room`; F.shSubC.textContent = `each of ${mates.length} tablemates, as well`;
    F.chNote.textContent = `High emitter: 100 times as much, about 1 in ${Math.round(1 / tail / 5) * 5}.`;
    F.rings = svg('g', { opacity: 0 }); F.ringsC = svg('g', { opacity: 0 });
    for (const p of resHere) { const q = fPos(p, F.ri); F.rings.append(svg('circle', { class: 'fdose air', cx: q.x, cy: q.y + 0.5, r: 6.8 })); }
    for (const p of mates) { const q = fPos(p, F.ri); F.ringsC.append(svg('circle', { class: 'fdose close', cx: q.x, cy: q.y + 0.5, r: 8.2 })); }
    F.cam.insertBefore(F.rings, F.people); F.cam.insertBefore(F.ringsC, F.people);
  }
  // Reported infections among residents, day by day, in this season (the page's reporting draw).
  const cum = (arm) => { const c = new Array(m.T / 48).fill(0); for (let p = 0; p < N; p++) if (!m.staff[p] && arm.tE[p] < 1e9 && hash(m.seed * 100003 + p) < FILM.report.central) c[Math.floor(arm.tE[p] / 48)]++; let s = 0; return c.map((v) => (s += v)); };
  F.cumA = cum(m.a); F.cumB = cum(m.b); F.season = { a: F.cumA[F.cumA.length - 1], b: F.cumB[F.cumB.length - 1] };
  if (F.season.a !== FILM.season.a || F.season.b !== FILM.season.b) console.warn('film season differs from build', F.season, FILM.season);
  F.caps = filmCaptions(); explainBuild();
  // Narration, if the track was made from exactly these captions. Otherwise the film plays silently.
  F.narr = NARR && NARR.texts.length === F.caps.length && NARR.texts.every((t, i) => t === F.caps[i][2]) ? NARR : null;
  if (NARR && !F.narr) console.warn('The narration was recorded from different captions, so the film will play without sound. Run web/captions.mjs and web/narrate.py again.');
  if (F.narr) {
    F.sound = true; F.trk = Math.max(0, F.narr.tracks.findIndex((k) => k.rate === 1));
    const sel = $('#filmrate'); sel.textContent = '';
    F.narr.tracks.forEach((k, i) => sel.append(el('option', { value: i }, k.rate + '×'))); sel.value = F.trk;
    $('#filmquiet').hidden = false; $('#filmsound').hidden = false; $('#filmratelab').hidden = false;
  } else $('#filmbig').textContent = '▶  Play the explanation (about two minutes)';
  $('#filmplay').disabled = false; $('#filmbig').disabled = false; soundUI();
  filmRender(F.t);
}

// With narration on, the audio track is the clock: each caption's stretch of film time is spread over that
// caption's stretch of the track, so the voice and the picture cannot drift apart.
const fTrack = () => F.narr.tracks[F.trk];
function fToAudio(tt) { const S = fTrack().segs; let i = 0; while (i < S.length - 1 && tt >= S[i].t1) i++; const g = S[i]; return g.u0 + Math.max(0, Math.min(1, (tt - g.t0) / (g.t1 - g.t0))) * g.D; }
function fFromAudio(u) { const S = fTrack().segs; let i = 0; while (i < S.length - 1 && u >= S[i].u0 + S[i].D) i++; const g = S[i]; return g.t0 + Math.max(0, Math.min(1, (u - g.u0) / g.D)) * (g.t1 - g.t0); }
// The track is decoded from the bytes in the page and played through Web Audio. Nothing is loaded by address, so
// viewers that refuse media from data: or blob: addresses still play it.
F.snd = { ctx: null, bufs: [], node: null, at: 0, off: 0, on: false, loading: [], since: 0 };
function sndLoad(i) {   // called from a click, so the audio context may start; each speed's track is decoded the first time it is wanted
  const S = F.snd; if (S.loading[i]) return S.loading[i];
  return (S.loading[i] = new Promise((done, fail) => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { fail(new Error('This browser has no Web Audio')); return; }
    if (!S.ctx) S.ctx = new AC(); if (S.ctx.state === 'suspended') S.ctx.resume().catch(() => {});
    const src = F.narr.tracks[i].src, bin = atob(src.slice(src.indexOf(',') + 1)), bytes = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
    const pr = S.ctx.decodeAudioData(bytes.buffer, (b) => { S.bufs[i] = b; done(); }, fail); if (pr && pr.catch) pr.catch(fail);
  }));
}
function sndStop() { const S = F.snd; if (S.node) { try { S.node.stop(); } catch (e) { /* not started */ } S.node.disconnect(); S.node = null; } if (S.on) S.off = sndTime(); S.on = false; }
function sndStart(u) {
  const S = F.snd; sndStop(); if (S.ctx.state === 'suspended') S.ctx.resume().catch(() => {});
  const buf = S.bufs[F.trk], n = S.ctx.createBufferSource(); n.buffer = buf; n.connect(S.ctx.destination);
  S.off = Math.max(0, Math.min(buf.duration - 0.01, u)); S.at = S.ctx.currentTime; S.since = performance.now(); n.start(0, S.off); S.node = n; S.on = true;
}
function sndTime() { const S = F.snd; return S.on ? S.off + (S.ctx.currentTime - S.at) : S.off; }
function sndFail(why) {   // no sound here: say so, and carry on silently
  sndStop(); F.sound = false; soundUI();
  const n = $('#filmnote'); n.hidden = false; n.textContent = 'Sound could not be played in this viewer, so the film is playing without it.'; console.warn('Narration unavailable:', why);
  if (F.playing) filmPlay(true);
}
function soundUI() {
  const b = $('#filmsound'); b.textContent = F.sound ? 'Sound on' : 'Sound off'; b.setAttribute('aria-pressed', String(!!F.sound));
  $('#filmrate').disabled = !F.sound;
  if (F.narr) { const half = Math.round(fTrack().total / 30) / 2; $('#filmbig').textContent = `▶  Play with narration (${half % 1 ? (Math.floor(half) || '') + '½' : half} minutes)`; }
  $('#filmtext').setAttribute('aria-live', F.sound ? 'off' : 'polite');   // a screen reader should not talk over the narration
}
function filmSeek(tt) {
  F.t = Math.max(0, Math.min(FD, tt));
  if (F.snd.on) sndStart(fToAudio(F.t));
  filmRender(F.t);
}
function filmPlay(on) {
  F.playing = on && !!F.D; cancelAnimationFrame(F.raf);
  $('#filmposter').hidden = F.playing || F.t > 0;
  $('#filmplay').textContent = F.playing ? 'Pause' : F.t >= FD ? 'Play again' : 'Play';
  const S = F.snd, voiced = !!(F.narr && F.sound);
  if (!F.playing || !voiced) sndStop();
  if (!F.playing) return;
  if (F.t >= FD) F.t = 0;
  if (voiced) {
    const i = F.trk;
    if (S.bufs[i]) sndStart(fToAudio(F.t));
    else { sndStop(); sndLoad(i).then(() => { if (F.playing && F.sound && F.trk === i) sndStart(fToAudio(F.t)); }, sndFail); }   // first use of this track: decode it, then start together
  }
  F.last = performance.now();
  const step = (now) => {
    if (!F.playing) return;
    if (F.sound && F.narr) {
      if (S.on) {
        const u = sndTime(); F.t = u >= fTrack().total - 0.02 ? FD : fFromAudio(u);
        if (S.ctx.currentTime === S.at && now - S.since > 2500) { sndFail('the audio clock is not running'); return; }
      }
    } else F.t = Math.min(FD, F.t + Math.min(0.1, (now - F.last) / 1000));
    F.last = now; filmRender(F.t);
    if (F.t >= FD) { filmPlay(false); return; }
    F.raf = requestAnimationFrame(step);
  };
  F.raf = requestAnimationFrame(step);
}

// ---- one frame ----
function filmRender(tt) {
  if (!F.D) return;
  const t = fScene(tt);
  const D = F.D, N = D.N, m = F.m, b = m.b;
  // captions and controls
  let cap = F.caps[0]; for (const c of F.caps) if (tt >= c[0]) cap = c;
  if (F.capShown !== cap) { F.capShown = cap; $('#filmtext').textContent = cap[2]; $('#filmchap').textContent = (cap[1] + 1) + ' of ' + CHAPTERS.length + ' · ' + CHAPTERS[cap[1]][1]; [...$('#filmchaps').children].forEach((x, i) => x.setAttribute('aria-pressed', String(i === cap[1]))); }
  $('#filmseek').value = Math.round(tt * 10);
  if (!F.playing) { $('#filmposter').hidden = tt > 0; $('#filmplay').textContent = tt >= FD ? 'Play again' : 'Play'; }

  // camera: keyframed through the room chapters and the day, then down to the left of two small plans
  const tau = F.tau0 + Math.max(0, Math.min(1, (t - 27) / 13.5)) * 6, gT = Math.floor(tau);
  const cm = fCam(tt, tau), zm = fRamp(t, 41, 43), k = Math.exp(fLerp(Math.log(cm.k), Math.log(0.48), zm));
  const sx = fLerp(cm.ax, 16 + 0.48 * 600, zm), sy = fLerp(cm.ay, 84 + 0.48 * 320, zm);
  F.cam.setAttribute('transform', `translate(${(sx - k * cm.fx).toFixed(2)},${(sy - k * cm.fy).toFixed(2)}) scale(${k.toFixed(4)})`);
  const camOn = 1 - fRamp(t, 42.4, 43.2);
  F.cam.setAttribute('opacity', camOn); F.cam.style.display = camOn > 0 ? '' : 'none';

  // people on the main plan
  if (camOn > 0 && tau !== F.lastTau) {
    F.lastTau = tau;
    for (let p = 0; p < N; p++) {
      const e = F.pawns[p], pos = fAt(p, tau);
      if (!pos) { if (e.style.display !== 'none') e.style.display = 'none'; continue; }
      if (e.style.display === 'none') e.style.display = '';
      e.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ',' + pos.y.toFixed(1) + ') scale(.8)');
      const c = e.dataset.k + ' ' + fState(D.a, p, gT); if (e.getAttribute('class') !== c) e.setAttribute('class', c);
    }
  }
  { const X = FILM.moment.person, e = F.pawns[X], c = e.dataset.k + ' ' + (t < 4.5 ? 'st-s' : fState(D.a, X, gT)); if (e.getAttribute('class') !== c) e.setAttribute('class', c); }
  const dTL = Math.max(0, Math.min(1, (t - 43.5) / 11)) * (D.T / 48 - 0.001);

  // The opening room runs on a lunch clock: the hour once without lamps (to 12:30 in chapter 1, on to 13:00 in
  // chapter 2), then once more from noon with them. Everything shown comes from the model's room-air equation.
  const lampRun = tt >= 32, ch = F.ch, lam = lampRun ? m.lam0 + m.dAch : m.lam0;
  const third = 1 / 3, hrs = !lampRun ? (tt < 4.8 ? 0 : tt < 9 ? third * (tt - 4.8) / 4.2 : tt < 13 ? third : tt < 19.5 ? third * (1 + (tt - 13) / 6.5) : tt < 24.5 ? third * (2 + (tt - 19.5) / 5) : 1) : Math.max(0, Math.min(1, (tt - 33.6) / 4.4));
  const inAir = lampRun && tt < 33.6 ? ch.inAir(1, m.lam0) * (1 - fRamp(tt, 32, 33.4)) : ch.inAir(hrs, lam);   // doses in the room's air
  const level = inAir / ch.steady, inRoom = 1 - fRamp(tt, 45, 46.6);
  F.partEls.forEach((e, i) => {
    const op = Math.max(0, Math.min(1, level * F.partEls.length - i)) * 0.6 * inRoom;
    e.setAttribute('opacity', op.toFixed(2)); if (op <= 0) return;
    e.setAttribute('cx', (b.x + 4 + hash(i * 3 + 1) * (b.w - 8) + 4 * Math.sin(tt * (0.5 + hash(i * 3 + 2)) + i)).toFixed(1));
    e.setAttribute('cy', (b.y + 4 + hash(i * 3 + 3) * (b.h - 8) + 4 * Math.cos(tt * (0.4 + hash(i * 3 + 4)) + i * 2)).toFixed(1));
  });
  F.demoLamps.setAttribute('opacity', (fRamp(tt, 32.6, 33.1) * inRoom).toFixed(2));
  F.wash.setAttribute('opacity', ((fRamp(tt, 32.6, 33.3) + 0.9 * Math.max(0, 1 - Math.abs(tt - 33.15) / 0.45)) * inRoom).toFixed(2));   // a brief flare as they switch on
  F.links.setAttribute('opacity', (fRamp(tt, 9, 9.8) * (1 - fRamp(tt, 45, 47))).toFixed(2));
  F.links.style.strokeWidth = (tt >= 39 && tt < 45 ? 1.5 + 0.6 * Math.sin((tt - 39) * 5) : 1.5).toFixed(2);
  F.ring.setAttribute('opacity', (fRamp(tt, 4.5, 5) * (1 - fRamp(tt, 8, 9)) * (0.5 + 0.5 * Math.sin(tt * 6))).toFixed(2));
  F.ring.setAttribute('r', (9 + 3 * (0.5 + 0.5 * Math.sin(tt * 6))).toFixed(1));
  // haze in every room, from the season's recorded room air
  const f = tau % 1, g2 = gT, g1 = Math.max(0, gT - 1);   // recorded air is a half-hour average, so this lags a little and never runs ahead of the people
  for (let ri = 0; ri < D.nRooms; ri++) {
    const h = F.haze[D.roomIds[ri]]; if (!h) continue;
    let v = Math.min(1.15, fLerp(D.a.conc[g1 * D.nRooms + ri], D.a.conc[g2 * D.nRooms + ri], f) / F.cRef);
    if (ri === F.ri) v = fLerp(level, v, 1 - inRoom); else if (tt < 4.8) v = 0;
    h.setAttribute('opacity', (0.27 * v).toFixed(3));
  }
  // clock: the lunch clock in the room, the day's clock after it
  const day = Math.floor(tau / 48), sl = Math.floor(tau) % 48, mins = Math.floor((tau % 1) * 30 / 5) * 5 + (sl % 2) * 30, lm = Math.floor(hrs * 60 + 1e-6);
  const hm = tt < 45 ? `${12 + Math.floor(lm / 60)}:${String(lm % 60).padStart(2, '0')}` : `${String(sl >> 1).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  F.clockBg.style.display = t < 41 ? '' : 'none';
  F.clock.textContent = t < 41 ? `DAY ${day + 1} · ${WEEKDAY[day % 7].toUpperCase()} ${hm}` : t < 56 ? `DAY ${Math.floor(dTL) + 1} OF ${D.T / 48}` : t < 68 ? `${FILM.n} WINTERS, EACH RUN TWICE` : '';
  // readout
  const hudOn = fRamp(tt, 3.3, 4.2) * (1 - fRamp(tt, 45, 46));   // the readout slides in once the camera has reached the room
  F.hud.setAttribute('opacity', hudOn); F.hud.style.display = hudOn > 0 ? '' : 'none';
  const lw = fRamp(tt, 32.3, 33.3); F.gLamp.setAttribute('width', Math.max(0, 320 * m.dAch / (m.lam0 + m.dAch) * lw - 2).toFixed(1)); F.gLampT.setAttribute('opacity', lw);
  F.clear.setAttribute('opacity', fRamp(tt, 4.6, 5.4)); F.key[0].setAttribute('opacity', fRamp(tt, 4.5, 5)); F.key[1].setAttribute('opacity', fRamp(tt, 4.5, 5));
  // how much reaches each person, and the chance so far, for this person and for a high emitter
  const lit = tt >= 33.6;
  F.share.setAttribute('opacity', fRamp(tt, 13.3, 14.3)); F.shAir.textContent = fPer(ch.shareAir(lit ? m.lam0 + m.dAch : m.lam0)); F.shAir.classList.toggle('flampt', lit); F.shWas.setAttribute('opacity', lit ? 1 : 0);
  F.chance.setAttribute('opacity', fRamp(tt, 19.5, 20.5)); F.chHigh.setAttribute('opacity', fRamp(tt, 26, 27)); F.chWas.setAttribute('opacity', fRamp(tt, 37.6, 38.4));
  F.chHead.textContent = `AFTER ${lm} ${lm === 1 ? 'MINUTE' : 'MINUTES'} IN THE ROOM`;   // elapsed time, so the span is plain
  F.chAir.textContent = oneIn(ch.air(hrs, lam, 1)); F.chAirH.textContent = oneIn(ch.air(hrs, lam, 100)); F.chClose.textContent = oneIn(ch.close(hrs, 1)); F.chCloseH.textContent = oneIn(ch.close(hrs, 100));
  F.chAir.classList.toggle('flampt', lampRun); F.chAirH.classList.toggle('flampt', lampRun);
  const gone = 1 - fRamp(tt, 45, 46.5);
  F.rings.setAttribute('opacity', (fRamp(tt, 13.4, 14.4) * (lampRun ? 0.45 : 0.85) * (0.75 + 0.25 * Math.sin(tt * 3)) * gone).toFixed(2));
  F.ringsC.setAttribute('opacity', (fRamp(tt, 16, 17) * gone).toFixed(2));

  // the winter, twice
  const miniOn = fRamp(t, 42.2, 43.2) * (1 - fRamp(t, 56, 57.4));
  F.mini.setAttribute('opacity', miniOn); F.mini.style.display = miniOn > 0 ? '' : 'none';
  if (miniOn > 0) {
    const d = Math.floor(dTL), g = d * 48 + 14 + Math.floor((dTL % 1) * 28);
    if (g !== F.lastG) {
      F.lastG = g;
      for (const arm of ['a', 'b']) for (let p = 0; p < N; p++) {
        const e = F.dots[arm][p], r = D[arm].loc[g * N + p], pos = r === D.outside ? null : fPos(p, r);
        if (!pos) { if (e.style.display !== 'none') e.style.display = 'none'; continue; }
        if (e.style.display === 'none') e.style.display = '';
        e.setAttribute('cx', pos.x.toFixed(0)); e.setAttribute('cy', pos.y.toFixed(0));
        const c = 'md ' + fState(D[arm], p, g); if (e.getAttribute('class') !== c) e.setAttribute('class', c);
      }
    }
  }
  if (miniOn > 0) for (const arm of ['a', 'b']) {   // a ring spreads from each new infection, for about four days of the time-lapse
    let k = 0; const on = t >= 43.5;
    if (on) for (const ev of F.inf[arm]) { const age = (dTL - ev.day) / 4; if (age < 0) break; if (age >= 1 || k >= F.pings[arm].length) continue; const c = F.pings[arm][k++]; c.style.display = ''; c.setAttribute('cx', ev.x.toFixed(0)); c.setAttribute('cy', ev.y.toFixed(0)); c.setAttribute('r', (8 + 44 * age).toFixed(1)); c.setAttribute('opacity', (1 - age).toFixed(2)); }
    for (; k < F.pings[arm].length; k++) if (F.pings[arm][k].style.display !== 'none') F.pings[arm][k].style.display = 'none';
  }
  filmChart(t, dTL);
  splitRender(tt);
  F.final.setAttribute('opacity', fRamp(tt, 111, 112.2)); F.final.style.display = tt > 111 ? '' : 'none';
  F.rows.forEach((o) => {   // each row: the figure counts up, the range draws out from the less helpful end, then the central dot lands
    const t0 = o.t0, up = fRamp(tt, t0, t0 + 1.1), out = fRamp(tt, t0 + 0.5, t0 + 1.6), pop = fRamp(tt, t0 + 1.2, t0 + 1.6);
    o.g.setAttribute('opacity', fRamp(tt, t0 - 0.2, t0 + 0.3)); o.big.textContent = fPct(o.mid * up);
    o.line.setAttribute('x2', fLerp(FX(o.lo), FX(o.hi), out).toFixed(1)); o.dot.setAttribute('r', (11 * pop * (1 + 0.35 * Math.sin(pop * Math.PI))).toFixed(1));
    o.ends.setAttribute('opacity', fRamp(tt, t0 + 0.4, t0 + 0.8)); o.ends2.setAttribute('opacity', fRamp(tt, t0 + 1.3, t0 + 1.7));
  });
}

// The curve under the two plans, which then becomes the chart of 200 winters.
function filmChart(t, dTL) {
  const on = fRamp(t, 42.4, 43.4) * (1 - fRamp(t, 68, 69.4));
  F.chart.style.display = on > 0 ? '' : 'none'; if (on <= 0) return;
  const D = F.D, days = D.T / 48, e = fRamp(t, 56, 58), C = FILM.curves, R = FILM.ranges.common.central;
  const x0 = fLerp(70, 90, e), x1 = fLerp(930, 900, e), y0 = fLerp(432, 96, e), y1 = fLerp(622, 586, e);
  const maxS = Math.max(8, F.cumA[days - 1], F.cumB[days - 1]) * 1.18, maxM = Math.max(...C.a.map((c) => c[c.length - 1]), ...C.b.map((c) => c[c.length - 1])) * 1.04;
  const max = fLerp(maxS, maxM, e), X = (d) => x0 + (x1 - x0) * d / days, Y = (v) => y1 - (y1 - y0) * v / max;
  const step = max > 60 ? 20 : max > 25 ? 10 : 5; let s = '';
  for (let v = 0; v <= max; v += step) s += `<line class="fgrid" x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="ft fs" x="${x0 - 10}" y="${(Y(v) + 5).toFixed(1)}" text-anchor="end">${v}</text>`;
  for (const d of [0, 30, 60, 90]) s += `<text class="ft fs" x="${X(d).toFixed(1)}" y="${y1 + 24}">day ${d + 1}</text>`;
  s += `<text class="ft fs" x="${x0}" y="${y0 - 14}">residents with a reported infection so far</text>`;
  // weekly arrivals
  const arr = 1 - e;
  if (arr > 0) { for (let d = 3; d < days; d += 7) s += `<path class="farr${d <= dTL ? ' on' : ''}" opacity="${arr}" d="M${X(d).toFixed(1)},${y1 + 3} l5,8 h-10z"/>`; s += `<path class="farr on" opacity="${arr}" d="M${x1 - 232},${y0 - 24} l5,8 h-10z"/><text class="ft fs" opacity="${arr}" x="${x1 - 220}" y="${y0 - 14}">an infected staff member arrives</text>`; }
  if (t >= 43.5 && t < 56) s += `<line class="fplay" opacity="${arr}" x1="${X(dTL).toFixed(1)}" x2="${X(dTL).toFixed(1)}" y1="${y0}" y2="${y1}"/>`;
  // 200 winters
  const nShow = Math.floor(FILM.n * fRamp(t, 58, 63));
  if (nShow > 0) {
    const sp = (cs) => { let p = ''; for (let i = 0; i < nShow; i++) { p += `M${X(0).toFixed(1)},${Y(0).toFixed(1)}`; cs[i].forEach((v, w) => { p += `L${X(Math.min(days, (w + 1) * 7)).toFixed(1)},${Y(v).toFixed(1)}`; }); } return p; };
    s += `<path class="fsp a" d="${sp(C.a)}"/><path class="fsp b" d="${sp(C.b)}"/>`;
  }
  // this winter's two curves
  const upto = t < 43.5 ? 0 : Math.min(days - 1, Math.floor(dTL)), line = (c) => c.slice(0, upto + 1).map((v, d) => (d ? 'L' : 'M') + X(d + 1).toFixed(1) + ',' + Y(v).toFixed(1)).join('');
  const one = 1 - 0.75 * fRamp(t, 63, 64.5);
  s += `<path class="fln a" opacity="${one}" d="${line(F.cumA)}"/><path class="fln b" opacity="${one}" d="${line(F.cumB)}"/>`;
  const lab = (y, cls, txt, op) => `<text class="ft fl ${cls}" opacity="${op}" x="${x1 + 14}" y="${y.toFixed(1)}">${txt}</text>`;
  const spread = (ya, yb) => (Math.abs(ya - yb) < 24 ? [Math.min(ya, yb) - (24 - Math.abs(ya - yb)) / 2, Math.max(ya, yb) + (24 - Math.abs(ya - yb)) / 2] : [Math.min(ya, yb), Math.max(ya, yb)]);
  if (t >= 43.5 && t < 63.5) { const [hi, lo] = spread(Y(F.cumA[upto]), Y(F.cumB[upto])), op = 1 - fRamp(t, 62.5, 63.5); s += lab(F.cumA[upto] >= F.cumB[upto] ? hi + 5 : lo + 5, 'a', `Without lamps: ${F.cumA[upto]}`, op) + lab(F.cumA[upto] >= F.cumB[upto] ? lo + 5 : hi + 5, 'b', `With lamps: ${F.cumB[upto]}`, op); }
  // averages
  const av = fRamp(t, 63, 64.5);
  if (av > 0) {
    const meanC = (cs) => cs[0].map((_, w) => cs.reduce((a, c) => a + c[w], 0) / cs.length), ml = (c) => `M${X(0).toFixed(1)},${Y(0).toFixed(1)}` + c.map((v, w) => `L${X(Math.min(days, (w + 1) * 7)).toFixed(1)},${Y(v).toFixed(1)}`).join('');
    const [hi, lo] = spread(Y(R.a), Y(R.b));
    s += `<path class="fln a avg" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - av).toFixed(3)}" d="${ml(meanC(C.a))}"/><path class="fln b avg" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - av).toFixed(3)}" d="${ml(meanC(C.b))}"/>` + lab(hi + 5, 'a', `Average without lamps: ${fNum(R.a)}`, av) + lab(lo + 5, 'b', `Average with lamps: ${fNum(R.b)}`, av);
  }
  F.chart.innerHTML = s; F.chart.setAttribute('opacity', on);
}
// "What lamps can reach": residents' infections in an average winter as two bars back to back, through room air to
// the left and face to face to the right, without lamps above and with lamps below. Lamps shorten the left bar; the
// right one moves only because fewer people are infectious. Then the two unknowns behind the range each move in
// turn, and together: the split between the routes, and how strongly lamps act.
const SPLIT = { xc: 600, px: 36, h: 46, ya: 238, yb: 334, k0: 640, k1: 1000 };
// Each stop is a computed state of the model (web/film-routes.mjs); between stops the picture glides.
const SPLIT_KEYS = [[96.5, 'central'], [97.4, 'faceMore'], [98.6, 'faceMore'], [99.8, 'airMore'], [101, 'airMore'], [101.8, 'central'], [101.9, 'central'], [102.8, 'weak'], [103.6, 'weak'], [104.6, 'strong'], [105.2, 'strong'], [105.9, 'central'], [106, 'central'], [107, 'cautious'], [108.2, 'cautious'], [109.4, 'favourable']];
const SPLIT_KNOBS = { central: [0, 0], faceMore: [-1, 0], airMore: [1, 0], weak: [0, -1], strong: [0, 1], cautious: [-1, -1], favourable: [1, 1] };
function splitBuild() {
  const G = F.split, P = SPLIT, T = (cls, x, y, txt, extra) => svg('text', { class: 'ft ' + cls, x, y, ...(extra || {}) }, txt), sh = FILM.routes.shares;
  const S = F.sp = { a: {}, b: {} };
  G.append(T('fe', 80, 84, 'WHERE RESIDENTS\' INFECTIONS COME FROM, IN AN AVERAGE WINTER'), T('ftitle', 80, 130, 'Lamps act on one route and not the other'),
    svg('rect', { class: 'fsair', x: P.xc - 26, y: 165, width: 12, height: 12, rx: 2 }), T('fe', P.xc - 34, 176, 'THROUGH THE AIR OF A SHARED ROOM', { 'text-anchor': 'end' }), T('fs', P.xc - 14, 197, 'lamps act here', { 'text-anchor': 'end' }),
    svg('rect', { class: 'fsface', x: P.xc + 14, y: 165, width: 12, height: 12, rx: 2 }), T('fe', P.xc + 34, 176, 'FACE TO FACE'), T('fs', P.xc + 14, 197, 'no direct effect from lamps'));
  for (const [k, y] of [['a', P.ya], ['b', P.yb]]) {
    const o = S[k], g = o.g = svg('g', {});
    o.lab = T('fl', 168, y - 12, '');
    if (k === 'b') { o.gAir = svg('rect', { class: 'fghost', y, height: P.h, rx: 4 }); o.gFace = svg('rect', { class: 'fghost', y, height: P.h, rx: 4 }); o.dAir = T('fl fnum', 0, y + 30, '', { 'text-anchor': 'end' }); o.dFace = T('fs', 0, y + 29, ''); g.append(o.gAir, o.gFace, o.dAir, o.dFace); }
    o.air = svg('rect', { class: 'fsair', y, height: P.h, rx: 4 }); o.face = svg('rect', { class: 'fsface', y, height: P.h, rx: 4 });
    o.vAir = T('fsval', P.xc - 14, y + 30, '', { 'text-anchor': 'end' }); o.vFace = T('fsval', P.xc + 14, y + 30, '');
    g.append(o.lab, o.air, o.face, o.vAir, o.vFace); G.append(g);
  }
  S.read = T('fread', 1120, P.yb - 14, '', { 'text-anchor': 'end' }); G.append(S.read);
  // the two unknowns
  const K = S.knobs = svg('g', { opacity: 0 }), mid = (P.k0 + P.k1) / 2;
  K.append(T('fe', 168, 446, 'TWO THINGS NOT MEASURED WELL'), T('fs', P.k0, 446, 'lamps help less', { 'text-anchor': 'middle' }), T('fs', P.k1, 446, 'lamps help more', { 'text-anchor': 'middle' }));
  S.knob = [];
  [[488, 'How much spreads face to face', `more (${Math.round(sh.high * 100)}%)`, `less (${Math.round(sh.low * 100)}%)`], [548, 'How strongly lamps act in a real room', 'weakly', 'strongly']].forEach(([y, label, lo, hi]) => {
    const c = svg('circle', { class: 'fknob', cx: mid, cy: y - 5, r: 10 });
    K.append(T('fl', 168, y, label), svg('line', { class: 'ftrack', x1: P.k0, x2: P.k1, y1: y - 5, y2: y - 5 }), svg('line', { class: 'ftick', x1: mid, x2: mid, y1: y - 13, y2: y + 3 }), c,
      T('fs', P.k0, y + 20, lo, { 'text-anchor': 'middle' }), T('fs', P.k1, y + 20, hi, { 'text-anchor': 'middle' }));
    S.knob.push(c);
  });
  G.append(K, T('fs', 80, 620, `Reported infections among residents, averaged over ${FILM.routes.n} simulated winters, each run with and without lamps in the common areas.`));
}
function splitRender(tt) {
  const on = fRamp(tt, 87.6, 88.6) * (1 - fRamp(tt, 110.6, 111.4)), G = F.split;
  G.style.display = on > 0 ? '' : 'none'; if (on <= 0) return;
  G.setAttribute('opacity', on);
  const P = SPLIT, S = F.sp, Q = FILM.routes.states;
  // where the picture is between two computed states
  let i = 0; while (i < SPLIT_KEYS.length - 1 && tt >= SPLIT_KEYS[i + 1][0]) i++;
  const [t0, n0] = SPLIT_KEYS[i], [t1, n1] = SPLIT_KEYS[Math.min(i + 1, SPLIT_KEYS.length - 1)], f = t1 > t0 ? fRamp(tt, t0, t1) : 0;
  const mix = (get) => fLerp(get(Q[n0]), get(Q[n1]), f), k = [0, 1].map((j) => fLerp(SPLIT_KNOBS[n0][j], SPLIT_KNOBS[n1][j], f));
  const grow = fRamp(tt, 88.4, 89.6), shrink = fRamp(tt, 91.2, 92.8);
  const A = { air: mix((q) => q.a.air), face: mix((q) => q.a.face) }, B1 = { air: mix((q) => q.b.air), face: mix((q) => q.b.face) };
  const B = { air: fLerp(A.air, B1.air, shrink), face: fLerp(A.face, B1.face, shrink) };
  const bar = (o, v, g) => {
    o.air.setAttribute('x', (P.xc - 1 - v.air * P.px * g).toFixed(1)); o.air.setAttribute('width', Math.max(0, v.air * P.px * g).toFixed(1));
    o.face.setAttribute('x', P.xc + 1); o.face.setAttribute('width', Math.max(0, v.face * P.px * g).toFixed(1));
    o.vAir.textContent = fNum(v.air); o.vFace.textContent = fNum(v.face); o.vAir.setAttribute('opacity', fRamp(g, 0.7, 1)); o.vFace.setAttribute('opacity', fRamp(g, 0.7, 1));
  };
  bar(S.a, A, grow); bar(S.b, B, 1);
  S.a.lab.textContent = `Without lamps: ${fNum(A.air + A.face)} residents`;
  S.b.g.setAttribute('opacity', fRamp(tt, 90.2, 90.8));
  S.b.lab.textContent = `With lamps in the common areas: ${fNum(B.air + B.face)} residents`;
  // what the lamps took away: the outline of the bars above, and by how much each side fell
  const lost = fRamp(tt, 92.6, 93.2), gx = P.xc - 1 - A.air * P.px, fx = P.xc + 1 + A.face * P.px;
  S.b.gAir.setAttribute('x', gx.toFixed(1)); S.b.gAir.setAttribute('width', (A.air * P.px).toFixed(1)); S.b.gFace.setAttribute('x', P.xc + 1); S.b.gFace.setAttribute('width', (A.face * P.px).toFixed(1));
  S.b.dAir.setAttribute('x', (gx - 12).toFixed(1)); S.b.dAir.textContent = '−' + fPct(1 - B.air / A.air); S.b.dAir.setAttribute('opacity', lost);
  S.b.dFace.setAttribute('x', (fx + 12).toFixed(1)); S.b.dFace.textContent = '−' + fPct(1 - B.face / A.face); S.b.dFace.setAttribute('opacity', lost);
  S.read.textContent = fPct(1 - (B.air + B.face) / (A.air + A.face)) + ' fewer'; S.read.setAttribute('opacity', fRamp(tt, 91.2, 91.8));
  S.knobs.setAttribute('opacity', fRamp(tt, 95.5, 96.3));
  S.knob.forEach((c, j) => { c.setAttribute('cx', ((P.k0 + P.k1) / 2 + k[j] * (P.k1 - P.k0) / 2).toFixed(1)); c.classList.toggle('on', Math.abs(k[j]) > 0.02); });
}
filmBuild();

// ---------- the longer explanation of the chance of infection ----------
// Opened from a link under the film. The worked example is the film's own lunch, computed from the same values.
function explainBuild() {
  const m = F.m, ch = F.ch, D = F.D, c = Sim.anchoredConfig(), X = FILM.moment.person, V = m.room.volume, lam = m.lam0, lamL = m.lam0 + m.dAch;
  const sig = (x, n = 2) => Number(x.toPrecision(n)).toLocaleString('en-US', { maximumSignificantDigits: n }), br = c.breathing.social, sus = D.s[FILM.moment.mates[0]];
  const steady = ch.src / (lam * V), avg = 1 - (1 - Math.exp(-lam)) / lam, doseAir = br * sus * steady * avg, beta = c.transmission.beta.table, G = c.transmission.G, doseClose = br * sus * ch.src * G / beta;
  const KI = Sim.ILLUMINATE.k.covid, wall = Sim.wallLampAt(c.lamp.wall, m.room.area, m.room.height, m.nLamps / Sim.wallLampBase(c.lamp.wall, m.room.area)), perLamp = Sim.lampCadrFor(c, m.room, m.nLamps), doseRatio = (1 / lamL * (1 - (1 - Math.exp(-lamL)) / lamL)) / (1 / lam * avg);
  const h = (t) => el('h3', {}, t), P = (...k) => el('p', {}, ...k), calc = (t) => el('div', { class: 'calc' }, t);
  const rows = [
    ['Virus breathed out at rest, typical person', '0.52 doses an hour', 'Mikszewski et al. 2022, whose final paper gives 0.55', 'Uncertain by a factor of 3 to 10 either way'],
    ['How much people differ', `about 1 in ${Math.round(1 / ch.highShare / 5) * 5} breathes out 100 times the typical amount`, 'Mikszewski et al. 2022', 'Published'],
    ['Talking', `× ${c.emission.activity.social} for residents in shared rooms, × ${c.emission.activity.work} for staff at work`, 'Our judgment; the published figure for speaking is × 5', 'Judgment'],
    ['Air a seated resident breathes', `${br} cubic metres an hour`, 'Our judgment, between 0.29 and 0.5 (US EPA 2011)', 'Range 0.29 to 0.5'],
    ['Ventilation, dining room', `${fNum(m.vent)} room-volumes an hour`, 'Our judgment, below the design minimum of 4 (ASHRAE 170)', 'Range 1.5 to 6'],
    ['Virus dying off in the air', `${c.air.decay} an hour`, 'van Doremalen et al. 2020', 'Range 0.3 to 7'],
    ['Particles settling', `${c.air.deposition} an hour`, 'Buonanno et al. 2020', 'Range 0.1 to 1'],
    ['Existing immunity', `counts ${sig(sus)} of the dose`, 'Our judgment; past infection protected 36-45% against reinfection', 'Judgment'],
    ['Face-to-face dilution at a table', `${beta} cubic metres an hour`, 'Our judgment, informed by Bazant & Bush 2021', 'Range 17 to 1,130'],
    ['Face-to-face strength', sig(G, 3), 'Fitted, so that the chosen share of spread is face to face', 'Moves with that share'],
    ['How easily far-UVC inactivates the virus', String(c.lamp.susceptibility), `Illuminate (OSLUV): the median of the ${KI.rows.length} published measurements on human coronaviruses in its table`, `Range ${KI.low} to ${KI.high}, the lowest and highest of them`],
    ['Output of one lamp', `${c.lamp.outputMw} milliwatts`, 'Illuminate\'s file for the Aerolamp', 'Measured'],
    ['How far a wall-mounted lamp\'s light travels', `${sig(wall.path, 2)} metres in this room`, 'Illuminate, which also works out the dimming that exposure limits require', 'Our range: 0.83 to 1.25 times this'],
    ['Share of a lamp\'s clean air a real room delivers', String(c.lamp.realWorldFactor), 'Our judgment', 'Range 0.5 to 1'],
  ];
  const body = $('#explainbody'); body.textContent = '';
  body.append(
    P(`The film shows the result for one lunch: one infectious resident in a dining room of ${Math.round(V)} cubic metres, for an hour. This page gives the nuts and bolts: first what the simulation does on each tick of its clock, then the calculation for that lunch, step by step.`),
    h('One tick of the simulation'),
    P(`The simulation's clock moves in ticks of half an hour. A day is 48 ticks and a winter of ${c.days} days is ${(c.days * 48).toLocaleString('en-US')}. Nothing happens between ticks: within one, everyone stays where they are and each room's air is worked out exactly for the half hour.`),
    P('Before the first tick, the model builds the home and writes the whole winter\'s timetable: which room every resident and staff member is in on every tick, who sits at which table, and who cares for whom. It also gives each person their own fixed traits, drawn at random: how much virus they would breathe out if infected, whether they would have symptoms and for how long, and the dose at which they become infected (their threshold, section 5).'),
    P('Then, on every tick, it does these things in this order:'),
    el('ol', { class: 'ticks' },
      el('li', {}, el('b', {}, 'Arrivals. '), `If an infected staff member is due (one every ${c.importation.arrivalEveryDays} days, caught outside the home), they become infected now.`),
      el('li', {}, el('b', {}, 'Illness clocks. '), `Each infected person moves along their own course: infected but not yet infectious, infectious before symptoms, infectious with or without symptoms, recovered. This sets how much virus they breathe out on this tick: full strength at first, tapering later, and ${c.disease.asymRelInf} times as much for someone who never has symptoms.`),
      el('li', {}, el('b', {}, 'Where everyone is. '), 'The timetable says, unless a response overrides it: staff who are off sick are not in the building, residents in isolation stay in their own room, and on a wing under outbreak measures group meals and activities stop.'),
      el('li', {}, el('b', {}, 'Virus into each room. '), 'For every room, add up what the infectious people in it breathe out: each person\'s output, times the talking factor for who they are and where (section 2), less whatever a mask stops. Someone there for part of the tick, such as a carer on a ten-minute visit, counts for that part.'),
      el('li', {}, el('b', {}, 'Each room\'s air. '), 'The room starts the tick with what the last tick left. Over the half hour its level moves toward the point where clearing balances what is breathed out (section 3). The model keeps two numbers: the average over the tick, which people breathe, and the level at the end, which the next tick starts from. This is how virus lingers after an infectious person leaves.'),
      el('li', {}, el('b', {}, 'Dose from room air. '), 'Every person adds to their running total: the air they breathe, times the room\'s average level, times the time they were there, scaled by their susceptibility and any mask (section 4).'),
      el('li', {}, el('b', {}, 'Dose face to face. '), 'For every face-to-face contact on the timetable for this tick (tablemates at a meal, a carer and a resident, a medicine round, a therapy session, a visit, staff at a break table), each of the two adds a second dose from the other (section 6). Lamps and ventilation do not enter this one.'),
      el('li', {}, el('b', {}, 'Who is infected. '), 'Anyone whose running total has now passed their threshold becomes infected at the end of the tick, and their illness clock starts. The model records which way they caught it by drawing between room air and face to face in proportion to how much of their total came each way. Totals run from the start of the winter and never reset.')),
    P(`At the end of each day the model counts the people whose symptoms began. That drives the responses on later days: ${fPct(c.control.staffExclusion.staysHomeShare)} of staff with symptoms stay home for ${c.control.staffExclusion.exclusionDays} days, a resident with symptoms is isolated in their room after ${c.control.residentIsolation.isolationDelayDays} day${c.control.residentIsolation.isolationDelayDays === 1 ? '' : 's'}, and ${c.control.outbreakMode.trigger === 1 ? 'the first case with symptoms' : c.control.outbreakMode.trigger + ' cases with symptoms'} on a wing ${c.control.outbreakMode.trigger === 1 ? 'starts' : 'start'} outbreak measures there, which last until ${c.control.outbreakMode.outbreakDays} days after the latest case. While any wing is under them, working staff wear surgical masks.`),
    P('A winter is run once without lamps and once with each set of lamps, from the same timetable, traits and arrivals. Lamps change one thing, in step (e): how fast each room\'s air is cleared.'),
    P('The numbered sections below work through the film\'s lunch with its own numbers.'),
    h('1. The unit'),
    P('The model counts airborne virus in doses. One dose is the amount that infects 63% of the people who breathe it in; researchers call it a quantum. It is defined that way so that the chance of infection is 1 − e^(−dose): a tenth of a dose gives about a 10% chance, one dose 63%, three doses 95%.'),
    P('A dose is not a count of virus particles. It folds together how much virus a breath carries and how much it takes to infect someone, so it is estimated by working back from measured viral loads and from outbreaks. That makes it the least certain number in the model.'),
    h('2. How much virus goes into the air'),
    P(`Each infectious person breathes out doses at their own rate. The model uses 0.52 doses an hour for a typical person at rest, from the estimate for SARS-CoV-2 by Mikszewski and colleagues (their final paper gives 0.55). People differ: the model draws each person's rate at random, so that about 1 in ${Math.round(1 / ch.highShare / 5) * 5} breathes out 100 times the typical amount. Talking raises it. The resident in the film breathes out ${sig(D.q[X])} doses an hour at rest, and the model doubles that for a resident in a shared room:`),
    calc(`${sig(D.q[X])} × ${c.emission.activity.social} = ${sig(ch.src)} doses an hour`),
    h('3. How much is in the room\'s air'),
    P(`The model treats each room as one evenly mixed box of air. Virus is added at the rate above and cleared by three things, each counted in room-volumes of air an hour: ventilation (${fNum(m.vent)} in this room), the virus dying off (${c.air.decay}) and particles settling (${c.air.deposition}). Lamps add a fourth. The air starts with whatever was left from before and moves toward the level where clearing matches what is breathed out:`),
    calc('concentration = breathed out ÷ (clearing rate × room volume) × (1 − e^(−clearing rate × hours))'),
    calc(`steady level = ${sig(ch.src)} ÷ (${sig(lam, 3)} × ${Math.round(V)}) = ${sig(steady)} doses per cubic metre`),
    P(`That is one dose in every ${sig(1 / steady)} cubic metres of air. The model works this out for every room every half hour, and carries over what is left after people leave.`),
    h('4. How much a person breathes in'),
    P(`A person's dose is the air they breathe times the concentration, added up over the time they stay, then scaled by how susceptible they are. A resident sitting and talking breathes ${br} cubic metres an hour. Existing immunity is assumed to halve the dose that counts. Over the hour the air averages ${fPct(avg)} of its steady level, because it starts clean:`),
    calc(`${br} × ${sig(sus)} × ${sig(steady)} × ${sig(avg)} × 1 hour = ${sig(doseAir)} doses`),
    P(`Put as a share, which is how the film shows it: of every 100,000 parts of what the infectious person breathes out over the hour, each resident breathes in about ${fPer(ch.shareAir(lam))}, before immunity is counted.`),
    h('5. From dose to chance'),
    calc(`chance = 1 − e^(−${sig(doseAir)}) = ${oneIn(ch.air(1, lam, 1))}`),
    P('For small doses the chance is almost the same number as the dose, so twice the time or twice the virus means about twice the chance. In practice the model gives each person a threshold at the start of the winter, drawn at random, and infects them when their total dose from every room and contact passes it. That is the same rule. It also means the runs with and without lamps use the same thresholds, so the difference between them is the lamps and not luck.'),
    h('6. Face to face'),
    P(`People in a face-to-face contact (tablemates, a carer and a resident, roommates) take in an extra dose, as if breathing from a small pocket of air around the other person. Dilution is how fast that pocket is flushed: ${beta} cubic metres an hour at a dining table, ${c.transmission.beta.care} during personal care. Strength is the one number fitted to data, and it sets how much of all spread is face to face.`),
    calc('dose = air breathed × susceptibility × the other person\'s output × hours together × strength ÷ dilution'),
    calc(`${br} × ${sig(sus)} × ${sig(ch.src)} × 1 × ${sig(G, 3)} ÷ ${beta} = ${sig(doseClose)} doses, a chance of ${oneIn(ch.close(1, 1))}`),
    P(`As a share, that is about ${fPer(ch.shareClose)} parts in every 100,000. Lamps do not change this dose.`),
    h('7. What the lamps change'),
    P(`Only the clearing rate in section 3. The lamp arithmetic is Illuminate's, the lamp-planning tool from OSLUV. Illuminate works out the average far-UVC level in a room's air, and the air cleaning that follows from it: 3.6 × how easily far-UVC inactivates the virus × that level, in room-volumes an hour. For one lamp this comes to 0.36 × the constant × the lamp's output × the average distance its light travels through the room's air. The constant is the median of the published measurements in Illuminate's table; the output is from its lamp file; and for lamps mounted high on the walls and angled down, Illuminate gives the light's path (${sig(wall.path, 2)} metres in this room) and any dimming needed to stay within exposure limits (${wall.share >= 0.999 ? 'none here' : 'to ' + fPct(wall.share) + ' here'}). The model then counts ${fPct(c.lamp.realWorldFactor)} of the result, for uneven mixing and shadows:`),
    calc(`0.36 × ${c.lamp.susceptibility} × ${c.lamp.outputMw} mW × ${sig(wall.path, 2)} m${wall.share >= 0.999 ? '' : ' × ' + sig(wall.share)} = ${Math.round(perLamp)} cubic metres of clean air an hour per lamp`),
    calc(`${m.nLamps} lamps × ${Math.round(perLamp)} × ${c.lamp.realWorldFactor} ÷ ${Math.round(V)} = ${sig(m.dAch, 3)} room-volumes an hour, on top of ${sig(lam, 3)}`),
    P(`The steady level falls to ${fPct(m.ratio)} of what it was. Over the hour the dose falls to ${fPct(doseRatio)}, a chance of ${oneIn(ch.air(1, lamL, 1))}.`),
    h('Where the numbers come from'),
    el('div', { class: 'tablewrap' }, el('table', {}, el('thead', {}, el('tr', {}, ...['Input', 'Value', 'Source', 'How sure'].map((t) => el('th', {}, t)))), el('tbody', {}, ...rows.map((r) => el('tr', {}, ...r.map((t) => el('td', {}, t))))))),
    P('All of these are sliders in the simulator, except the fitted strength, which follows the slider for the share of spread out of the lamps\' reach.'),
    h('What this leaves out'),
    P('The room\'s air is treated as evenly mixed, so where someone sits makes no difference and a lamp cleans the whole room equally. Lamps are given no effect on the face-to-face dose. Spread by hands and surfaces is not simulated.'));
}
function explainOpen() {
  filmPlay(false); setPlaying(false);
  const d = $('#explain'); if (d.open) return;
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  d.scrollTop = 0;
}
for (const b of document.querySelectorAll('.explainopen')) b.addEventListener('click', explainOpen);
$('#explainclose').addEventListener('click', () => $('#explain').close());
$('#explain').addEventListener('click', (e) => { if (e.target === $('#explain')) $('#explain').close(); });   // a click on the backdrop closes it

// ---------- the two views: the explanation (default) and the model ----------
// The view follows the address (#model), so a link can open on the model.
function showView(v) {
  $('.wrap').dataset.view = v;
  for (const k of ['film', 'model']) { $('#view-' + k).hidden = k !== v; const t = $('#tab-' + k); t.setAttribute('aria-selected', String(k === v)); t.tabIndex = k === v ? 0 : -1; }
  if (v === 'film') setPlaying(false); else filmPlay(false);
}
function goView(v) {
  showView(v); window.scrollTo(0, 0);
  try { if ((location.hash === '#model') !== (v === 'model')) location.hash = v === 'model' ? 'model' : 'explanation'; } catch (e) { /* the address cannot be changed here; the view still switches */ }
}
for (const k of ['film', 'model']) {
  $('#tab-' + k).addEventListener('click', () => goView(k));
  $('#tab-' + k).addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const o = k === 'film' ? 'model' : 'film'; goView(o); $('#tab-' + o).focus(); } });
}
window.addEventListener('hashchange', () => showView(location.hash === '#model' ? 'model' : 'film'));
showView(location.hash === '#model' ? 'model' : 'film');
