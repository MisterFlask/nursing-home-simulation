import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
for (const mode of ['worker', 'no-worker']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1100 } });
  p.on('pageerror', (e) => console.log(mode, 'PAGEERR', String(e.stack || e).slice(0, 600))); p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/net::|Failed to load/.test(m.text())) console.log(mode, 'CONSOLE', m.text().slice(0, 300)); });
  if (mode === 'no-worker') await p.addInitScript(() => { window.Worker = function () { throw new DOMException("Failed to construct 'Worker'", 'SecurityError'); }; });
  await p.goto(PAGE);
  const t0 = Date.now(); await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 }); console.log(mode, 'film ready after', Date.now() - t0, 'ms');
  // play the film for 10 s while the main run is under way
  await p.evaluate(() => { window.__n = 0; const f = () => { window.__n++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await p.click('#filmbig'); await p.waitForTimeout(10000);
  console.log(mode, 'film after 10 s: seek', await p.inputValue('#filmseek'), 'frames', await p.evaluate(() => window.__n), '| run:', await p.textContent('#runstat'));
  await p.click('#filmplay');
  await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 150000 });
  console.log(mode, 'run done after', Date.now() - t0, 'ms |', (await p.textContent('#sentence')).slice(0, 150));
  console.log(mode, (await p.locator('#tiles .tile').allTextContents()).join(' | '));
  await p.click('#mode button[data-mode=replay]'); await p.waitForTimeout(6000); console.log(mode, 'replay:', await p.textContent('#timelab'));
  await p.close();
}
await b.close();
