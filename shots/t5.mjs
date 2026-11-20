import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1480, height: 1000 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 800))); p.on('console', (m) => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) console.log('CONSOLE', m.text().slice(0, 300)); });
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
await p.goto(PAGE); await p.waitForTimeout(2000);
console.log('primary:', (await p.locator('#primary .prow .l').allTextContents()).join(' | '));
console.log((await p.locator('#primary .prow').first().textContent()).slice(0, 900));
await p.click('#mode button[data-mode=replay]'); await p.waitForTimeout(9000); console.log(await p.textContent('#timelab'), '|', await p.textContent('#outsidecount'));
await p.click('#play'); await p.waitForTimeout(2500); console.log(await p.textContent('#timelab'));
await p.click('#mode button[data-mode=place]');
// move the share slider to its top and to its bottom
for (const v of [1000, 0]) { await p.locator('#p-transmission-closeShare').evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, v); await p.waitForTimeout(45000); console.log(await p.textContent('#runstat'), '|', (await p.textContent('#sentence')).slice(0, 260)); console.log((await p.locator('#tiles .tile').allTextContents()).join(' | ')); console.log((await p.textContent('#fitted')).slice(280)); }
await p.setViewportSize({ width: 400, height: 800 }); await p.waitForTimeout(400); console.log('phone scrollW', await p.evaluate(() => document.documentElement.scrollWidth));
await p.locator('#results').screenshot({ path: 'shots/res-phone.png' });
await b.close();
