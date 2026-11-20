// Non-room-air spread by setting, as the model gives it: of the infections caught in each setting, the share caught
// face to face, in winters without lamps. The settings are those of the owner's document (src/params.js NON_ROOM_AIR):
//   care       hands-on care in a bedroom: in a bedroom, between a resident and a staff member or visitor
//   roommates  roommates sharing a bedroom: in a bedroom, resident to resident
//   dining     dining or activity room
//   home       every infection passed to or from a resident (the fit's definition of non-room-air spread)
//   all        every infection inside the home, staff to staff included
// node experiments/settings.mjs [covid|flu] [seasons] [path=value ...]     prints the block for NON_ROOM_AIR.model
import { ANCHORS, anchoredConfig, anchoredAt } from '../src/params.js';
import { buildFacility, buildWorld, runSeason } from '../src/engine.js';
import { set } from './anchored.mjs';
const a = process.argv.slice(2), ph = a[0] || 'covid', N = +(a[1] || 1000), extra = a.slice(2).map((s) => s.split('='));
const KEYS = ['care', 'roommates', 'dining', 'home', 'all'], out = Object.fromEntries(KEYS.map((k) => [k, []])), info = [];
for (const kase of ['low', 'central', 'high']) {
  const c = anchoredConfig(ANCHORS[ph].shares[kase], ph); for (const [p, v] of extra) set(c, p, +v);
  const type = Object.fromEntries(buildFacility(c.facility).map((r) => [r.id, r.type])), S = Object.fromEntries(KEYS.map((k) => [k, [0, 0]]));
  let res = 0;
  for (let s = 0; s < N; s++) {
    const w = buildWorld(c, 410000 + s), r = runSeason(w, { lamps: {} }); res += r.totals.residentInfected;
    for (const e of r.events) {
      if (e.route !== 'room' && e.route !== 'close') continue;
      const i = e.route === 'close' ? 1 : 0, t = type[e.roomId], src = e.source >= 0 && e.source < w.people.length ? w.people[e.source].role : 'visitor', resident = e.role === 'resident' || src === 'resident';
      S.all[i]++; if (resident) S.home[i]++;
      if (t === 'bedroom' && resident) S[e.role === 'resident' && src === 'resident' ? 'roommates' : 'care'][i]++;
      else if (t === 'dining' || t === 'activity') S.dining[i]++;
    }
  }
  for (const k of KEYS) out[k].push(+(S[k][1] / (S[k][0] + S[k][1])).toFixed(3));
  info.push(`${kase}: share ${c.transmission.closeShare} G ${c.transmission.G.toPrecision(3)} emission ${c.emission.median.toPrecision(3)} residents infected ${(100 * res / N / 112).toFixed(1)}% | per season: ` + KEYS.map((k) => `${k} ${((S[k][0] + S[k][1]) / N).toFixed(1)}`).join(', '));
}
console.error(info.join('\n'));
console.log(`${ph}: { ` + KEYS.map((k) => `${k}: [${out[k].join(', ')}]`).join(', ') + ' },');
