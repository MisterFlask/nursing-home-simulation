import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
// page.html is written by the build step
for (const mode of ['worker', 'no-worker']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  p.on('pageerror', (e) => console.log(mode, 'PAGEERR', String(e.stack || e).slice(0, 600))); p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/net::|Failed to load/.test(m.text())) console.log(mode, 'CONSOLE', m.text().slice(0, 300)); });
  if (mode === 'no-worker') await p.addInitScript(() => { window.Worker = function () { throw new DOMException("Failed to construct 'Worker'", 'SecurityError'); }; });
  await p.goto(PAGE);
  await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
  const vis = async () => `film ${await p.locator('#view-film').isVisible()} model ${await p.locator('#view-model').isVisible()} | selected: ${await p.locator('.tabs [aria-selected=true]').textContent()} | hash ${await p.evaluate(() => location.hash)}`;
  console.log(mode, 'on load:', await vis());
  if (mode === 'worker') await p.screenshot({ path: 'shots/v-film.png' });
  await p.click('#filmbig'); await p.waitForTimeout(3000); console.log(mode, 'film playing:', await p.textContent('#filmplay'), await p.inputValue('#filmseek'));
  await p.click('#tab-model'); await p.waitForTimeout(500); console.log(mode, 'after tab click:', await vis(), '| film button:', await p.evaluate(() => document.querySelector('#filmplay').textContent));
  console.log(mode, 'lamps in view:', await p.locator('#inst [aria-pressed=true]').textContent(), '| replay UI visible', await p.locator('#replayUI').isVisible(), '| place panel visible', await p.locator('#placepanel').isVisible());
  await p.waitForFunction(() => /^Day /.test(document.querySelector('#timelab').textContent), null, { timeout: 120000 }); console.log(mode, 'replay ready:', await p.textContent('#timelab'));
  await p.click('#play'); await p.waitForTimeout(4000); console.log(mode, 'replay after 4 s:', await p.textContent('#timelab'), await p.textContent('#play'));
  if (mode === 'worker') await p.screenshot({ path: 'shots/v-model.png' });
  await p.click('#tab-film'); await p.waitForTimeout(300); console.log(mode, 'back to film:', await vis(), '| replay button:', await p.evaluate(() => document.querySelector('#play').textContent));
  await p.click('#filmskip'); await p.waitForTimeout(300); console.log(mode, 'open the model:', await vis());
   console.log(mode, 'place lamps:', await p.textContent('#lampcount'));
  await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 150000 }); console.log(mode, (await p.textContent('#sentence')).slice(0, 110));
  await p.goto(PAGE + '#model'); await p.waitForTimeout(1500); console.log(mode, 'opened at #model:', await vis());
  if (mode === 'worker') { await p.setViewportSize({ width: 400, height: 800 }); await p.waitForTimeout(300); console.log('phone scrollW', await p.evaluate(() => document.documentElement.scrollWidth)); await p.click('#tab-film'); await p.screenshot({ path: 'shots/v-phone.png' }); }
  await p.close();
}
await b.close();
