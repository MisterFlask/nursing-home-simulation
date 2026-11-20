// Full-page screenshot of the Model and simulator tab after results arrive. node shots/m2.mjs [out.png] [width]
import { chromium, CHROME, PAGE } from './lib.mjs';
const out = process.argv[2] || 'shots/m-full.png', W = +(process.argv[3] || 1280);
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: W, height: 1000 }, deviceScaleFactor: 0.6 });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 240000 });
await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: true });
console.log((await p.textContent('#sentence')).slice(0, 400));
await b.close();
