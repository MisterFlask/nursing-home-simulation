import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1320, height: 1000 }, deviceScaleFactor: 1.5 });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 500)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
const done = async () => { await p.waitForTimeout(700); await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent) && !/of 200/.test(document.querySelector('#runstat').textContent), null, { timeout: 400000 }); };
let t0 = Date.now(); await done(); console.log('first run', Math.round((Date.now() - t0) / 1000), 's');
console.log(await p.textContent('#sentence'));
console.log((await p.locator('#tiles tr').allTextContents()).join('\n'));
console.log('hist rows:', (await p.locator('#hist text.lab').allTextContents()).join(' | '), '| reach rows:', (await p.locator('#reach text.lab').allTextContents()).slice(2).join(' | '));
console.log('range:', (await p.locator('#dumb text.val').allTextContents()).join(' ; '), '| legend:', (await p.locator('#dumbleg span').allTextContents()).join(', '));
await p.locator('#results').screenshot({ path: 'shots/t-results.png' });
if (process.argv[2]) {
  t0 = Date.now(); await p.locator('#inst button', { hasText: 'Common areas and bedrooms' }).click(); await p.waitForTimeout(400); console.log('to both:', Date.now() - t0, 'ms |', await p.textContent('#runstat'), '| on col:', await p.locator('#tiles thead th.on').textContent());
  await p.locator('#inst button', { hasText: 'Bedrooms only' }).click(); t0 = Date.now(); await done(); console.log('bedrooms only run', Math.round((Date.now() - t0) / 1000), 's'); console.log(await p.textContent('#sentence'));
  console.log('hist rows:', (await p.locator('#hist text.lab').allTextContents()).join(' | '), '| range:', (await p.locator('#dumb text.val').allTextContents()).join(' ; '));
  await p.locator('#results').screenshot({ path: 'shots/t-results4.png' });
  await p.locator('#inst button', { hasText: 'Without lamps' }).click(); await p.waitForTimeout(500); console.log('without lamps:', await p.textContent('#runstat'), '|', (await p.textContent('#sentence')).slice(0, 90));
}
await p.setViewportSize({ width: 400, height: 800 }); await p.waitForTimeout(300); console.log('phone scrollW', await p.evaluate(() => document.documentElement.scrollWidth));
await b.close();
