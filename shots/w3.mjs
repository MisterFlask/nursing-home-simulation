import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 600)));
await p.goto(PAGE + '#model');
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
await p.click('#mode button[data-mode=place]'); await p.waitForTimeout(300);
console.log('presets:', (await p.locator('#presets button').allTextContents()).join(' | '), '|', await p.textContent('#lampcount'));
const done = () => p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent), null, { timeout: 300000 });
await done(); console.log('DOWN  :', (await p.textContent('#sentence')).slice(0, 400));
const box = await p.locator('#plan').boundingBox();
await p.screenshot({ path: 'shots/w-plan2.png', clip: { x: box.x + box.width * 0.24, y: box.y, width: box.width * 0.52, height: box.height } });
// the aim setting
const row = await p.evaluate(() => { const inp = [...document.querySelectorAll('input[type=range]')].find((i) => /aimAcross/.test(i.id + ' ' + (i.name || '') + ' ' + (i.dataset.path || ''))); if (!inp) return null; const r = inp.closest('.param, .prow, .row, li, div'); return { id: inp.id, text: (r.parentElement.textContent || '').replace(/\s+/g, ' ').slice(0, 500) }; });
console.log('row:', JSON.stringify(row));
if (row) {
  await p.evaluate((id) => { const i = document.getElementById(id); const d = i.closest('details'); if (d) d.open = true; i.value = 1; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }, row.id);
  await p.waitForTimeout(1500); await done(); console.log('ACROSS:', (await p.textContent('#sentence')).slice(0, 400));
}
await b.close();
