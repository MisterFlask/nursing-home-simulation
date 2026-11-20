// Move the arrival-rate slider and check the results follow. node shots/a2.mjs
import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
await p.goto(PAGE + '#model');
const done = () => p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 240000 });
await done(); console.log('default:', (await p.textContent('#sentence')).slice(0, 200), '|', await p.textContent('#arrivecap'));
const id = '#p-importation-arrivalEveryDays';
await p.evaluate((id) => { const r = document.querySelector(id); r.value = 1000; r.dispatchEvent(new Event('input', { bubbles: true })); }, id);
await p.waitForTimeout(1500); await done();
console.log('slider at its high end:', await p.locator(id).evaluate((r) => r.closest('.prow').querySelector('output').textContent), '|', (await p.textContent('#sentence')).slice(0, 200), '|', await p.textContent('#arrivecap'));
console.log((await p.textContent('#fitted')).slice(0, 420));
await p.locator('#primary').screenshot({ path: 'shots/a-primary.png' });
await b.close();
