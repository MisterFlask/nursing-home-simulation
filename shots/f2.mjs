import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>';
fs.writeFileSync('shots/page.html', html);
const p = await b.newPage({ viewport: { width: 1280, height: 1100 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 900))); p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/net::|Failed to load/.test(m.text())) console.log('CONSOLE', m.text().slice(0, 300)); });
await p.goto(PAGE);
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
await p.waitForTimeout(45000);   // let the main run finish so it does not compete
await p.evaluate(() => { window.__n = 0; const f = () => { window.__n++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
await p.click('#filmbig'); const n0 = await p.evaluate(() => window.__n);
await p.waitForTimeout(12000); console.log('after 12 s: seek', await p.inputValue('#filmseek'), 'frames', (await p.evaluate(() => window.__n)) - n0, await p.textContent('#filmplay'), 'big hidden', await p.locator('#filmbig').isHidden());
await p.evaluate(() => window.__film.render(29)); await p.waitForTimeout(8000); console.log('scene 3 after 8 s: seek', await p.inputValue('#filmseek'));
await p.evaluate(() => window.__film.render(84)); await p.waitForTimeout(3500); console.log('end:', await p.inputValue('#filmseek'), await p.textContent('#filmplay'));
await p.click('#filmplay'); await p.waitForTimeout(1500); console.log('again:', await p.inputValue('#filmseek'), await p.textContent('#filmplay')); await p.click('#filmplay');
console.log('main run:', await p.textContent('#runstat'), '|', (await p.textContent('#sentence')).slice(0, 90));
// dark
await p.emulateMedia({ colorScheme: 'dark' });
for (const t of [23, 54, 80]) { await p.evaluate((t) => window.__film.render(t), t); await p.waitForTimeout(200); await p.locator('.film').screenshot({ path: `shots/fd-${t}.png` }); }
await p.emulateMedia({ colorScheme: 'light' });
await p.setViewportSize({ width: 400, height: 900 }); await p.waitForTimeout(400);
console.log('phone scrollW', await p.evaluate(() => document.documentElement.scrollWidth));
for (const t of [11, 80]) { await p.evaluate((t) => window.__film.render(t), t); await p.waitForTimeout(200); await p.locator('.film').screenshot({ path: `shots/fp-${t}.png` }); }
await b.close();
