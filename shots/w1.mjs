import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 600)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
await p.click('#mode button[data-mode=place]'); await p.waitForTimeout(300);
console.log('presets:', await p.locator('#presets button').allTextContents());
const btns = p.locator('#presets button'); const n = await btns.count();
for (let i = 0; i < n; i++) { const t = await btns.nth(i).textContent(); if (/bedroom/i.test(t)) { await btns.nth(i).click(); break; } }
await p.waitForTimeout(400); console.log(await p.textContent('#lampcount'));
await p.locator('#plan').screenshot({ path: 'shots/w-plan.png' });
await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 200000 });
console.log(await p.textContent('#sentence'));
console.log(await p.textContent('#runstat'));
// the Lamps group of settings
const lampRows = await p.evaluate(() => [...document.querySelectorAll('.param, .prow, [data-path]')].filter((e) => /^lamp\./.test(e.dataset.path || '')).map((e) => e.textContent.replace(/\s+/g, ' ').slice(0, 260)));
console.log(lampRows.join('\n'));
await b.close();
