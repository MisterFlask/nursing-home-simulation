import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 600)));
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
await p.goto(PAGE + '#model');
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });

const done = async () => { await p.waitForTimeout(1500); await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent) && !/of 200/.test(document.querySelector('#runstat').textContent), null, { timeout: 300000 }); };
await done(); console.log((await p.textContent('#sentence')).slice(0, 520));
console.log('cap:', await p.textContent('#dumbcap'));
const blk = p.locator('#reach').locator('xpath=..'); await blk.scrollIntoViewIfNeeded(); await blk.screenshot({ path: 'shots/r-reach.png' });
const blk2 = p.locator('#dumb').locator('xpath=..'); await blk2.screenshot({ path: 'shots/r-dumb.png' });
if (process.argv[2] === 'flu') { await p.locator('#pathogen button', { hasText: 'Influenza' }).click(); await done(); console.log('FLU:', (await p.textContent('#sentence')).slice(0, 200)); console.log('cap:', await p.textContent('#dumbcap')); await blk.screenshot({ path: 'shots/r-reach-flu.png' }); }
await p.setViewportSize({ width: 400, height: 800 }); await p.waitForTimeout(300); console.log('phone scrollW', await p.evaluate(() => document.documentElement.scrollWidth));
await b.close();
