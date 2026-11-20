// Screenshot of the Model and simulator tab, top of page. node shots/m1.mjs [out.png]
import { chromium, CHROME, PAGE } from './lib.mjs';
const out = process.argv[2] || 'shots/m-model.png';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1100 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => /^Day /.test(document.querySelector('#timelab').textContent), null, { timeout: 120000 });
await p.waitForTimeout(800);
await p.screenshot({ path: out });
console.log('film view visible', await p.locator('#view-film').isVisible(), '| explain buttons visible on model tab:', await p.locator('#view-model .explainopen').count(), '| header ledes:', await p.locator('header.top .lede').count());
console.log(await p.evaluate(() => [...document.querySelectorAll('#view-model button, #view-model a')].filter((e) => /explan|film|video|watch/i.test(e.textContent + e.id + e.className)).map((e) => e.outerHTML.slice(0, 160))));
await b.close();
