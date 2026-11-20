import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
for (const mode of ['no AudioContext', 'decode fails', 'clock never runs']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
  p.on('pageerror', (e) => console.log(mode, 'PAGEERR', String(e.stack || e).slice(0, 400)));
  await p.addInitScript((mode) => {
    if (mode === 'no AudioContext') { delete window.AudioContext; delete window.webkitAudioContext; window.AudioContext = undefined; }
    if (mode === 'decode fails') { const AC = window.AudioContext; AC.prototype.decodeAudioData = function (buf, ok, bad) { setTimeout(() => bad(new Error('blocked')), 50); }; }
    if (mode === 'clock never runs') { const AC = window.AudioContext; Object.defineProperty(AC.prototype, 'currentTime', { get() { return 0; } }); }
  }, mode);
  await p.goto(PAGE);
  await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
  await p.click('#filmbig'); await p.waitForTimeout(6500);
  const s = await p.evaluate(() => window.__film.state());
  console.log(mode.padEnd(18), `film ${s.t.toFixed(1)}s sound ${s.sound} playing ${s.playing} | ${await p.textContent('#filmsound')} | note: ${await p.locator('#filmnote').isVisible() ? await p.textContent('#filmnote') : '(hidden)'}`);
  await p.close();
}
await b.close();
