import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1280, height: 1100 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 900))); p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/net::|Failed to load/.test(m.text())) console.log('CONSOLE', m.text().slice(0, 300)); });
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
await p.goto(PAGE);
await p.addStyleTag({ content: '#filmposter{display:none!important}' });   // frames without the player's play button over them
const t0 = Date.now(); await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 }); console.log('film ready after', Date.now() - t0, 'ms');
for (const t of times) { await p.evaluate((t) => window.__film.render(t), t); await p.waitForTimeout(150); await p.locator('.film').screenshot({ path: `shots/f-${String(t).replace('.', '_')}.png` }); console.log(t, '|', await p.textContent('#filmchap'), '|', (await p.textContent('#filmtext')).slice(0, 200)); }
await b.close();
