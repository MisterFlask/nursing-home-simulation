// Close-ups of the Model tab's assumption panel and placement panel. node shots/m3.mjs [flu]
import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => /^Day /.test(document.querySelector('#timelab').textContent), null, { timeout: 120000 });
if (process.argv[2] === 'flu') { await p.click('#pathogen button:nth-child(2)'); await p.waitForTimeout(1500); }
for (const d of await p.locator('details.grp').all()) { const t = await d.locator('summary').textContent(); if (/Lamps|Responses/.test(t)) await d.locator('summary').click(); }
await p.waitForTimeout(300);
const tag = process.argv[2] === 'flu' ? '-flu' : '';
await p.locator('#primary').screenshot({ path: `shots/m-primary${tag}.png` });
await p.locator('details.grp', { hasText: 'Lamps' }).first().screenshot({ path: `shots/m-lamps${tag}.png` });
await p.locator('#placepanel').screenshot({ path: `shots/m-place${tag}.png` });
console.log(await p.locator('#primary').evaluate((e) => e.previousElementSibling ? e.previousElementSibling.textContent.slice(0, 700) : ''));
await b.close();
