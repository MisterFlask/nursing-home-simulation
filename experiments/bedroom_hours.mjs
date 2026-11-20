// Hours a day a resident spends in a bedroom in the model (the page's default building), over four weeks.
import { anchoredConfig } from '../src/params.js';
import { buildWorld, SLOTS_PER_DAY, SLOT_HOURS } from '../src/engine.js';
const cfg = anchoredConfig(), w = buildWorld(cfg, 1000), N = w.N, days = 28;
const isRes = (p) => (w.role ? w.role[p] === 0 : w.people[p].role === 'resident');
const hrs = [];
for (let p = 0; p < N; p++) {
  if (!isRes(p)) continue; let s = 0;
  for (let g = 0; g < days * SLOTS_PER_DAY; g++) if (w.rooms[w.locSlot[g * N + p]].type === 'bedroom') s++;
  hrs.push(s * SLOT_HOURS / days);
}
hrs.sort((a, b) => a - b);
console.log('residents', hrs.length, 'hours a day in a bedroom: mean', (hrs.reduce((a, b) => a + b, 0) / hrs.length).toFixed(1), 'min', hrs[0].toFixed(1), 'median', hrs[hrs.length >> 1].toFixed(1), 'max', hrs[hrs.length - 1].toFixed(1));
