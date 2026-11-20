import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 600)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });

await p.locator('#inst button', { hasText: process.argv[2] || 'Common areas and bedrooms' }).click(); await p.waitForTimeout(400);
console.log(await p.textContent('#lampcount'));
const box = await p.locator('#plan').boundingBox();
await p.screenshot({ path: 'shots/w-plan2.png', clip: { x: box.x + box.width * 0.24, y: box.y, width: box.width * 0.52, height: box.height } });
await p.screenshot({ path: 'shots/w-plan3.png', clip: { x: box.x, y: box.y, width: box.width * 0.4, height: box.height * 0.55 } });
if (process.argv[3]) { await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 200000 }); console.log(await p.textContent('#sentence')); }
await b.close();
