import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1320, height: 1000 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 700)));
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)); });
await p.goto(PAGE + '#model');
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
const done = async () => { await p.waitForTimeout(600); await p.waitForFunction(() => /seasons simulated/.test(document.querySelector('#runstat').textContent) && !/of 200/.test(document.querySelector('#runstat').textContent), null, { timeout: 300000 }); };
const replayed = () => p.waitForFunction(() => /^Day /.test(document.querySelector('#timelab').textContent), null, { timeout: 120000 });
const inst = async () => (await p.locator('#inst button').evaluateAll((bs) => bs.map((x) => (x.getAttribute('aria-pressed') === 'true' ? '[' : '') + x.textContent + (x.getAttribute('aria-pressed') === 'true' ? ']' : '')))).join(' | ');
const curve = async () => (await p.locator('#curve text.lab').allTextContents()).join(' / ') + ' | lines ' + await p.locator('#curve path.ln').count() + ' on=' + await p.locator('#curve path.ln.on').getAttribute('class');
const sent = async () => (await p.textContent('#sentence')).replace(/ The low end.*measured well\./, '').slice(0, 230);
await replayed(); await done();
console.log('load :', await inst(), '|', await p.textContent('#lampcount')); console.log('  curve:', await curve()); console.log('  ', await sent());
await p.locator('#stage, .stage').first().screenshot({ path: 'shots/t-top.png' });
for (const name of ['Common areas and bedrooms', 'Bedrooms only', 'Without lamps']) {
  await p.locator('#inst button', { hasText: name }).click(); await p.waitForTimeout(300); console.log(name, '→ curve:', await curve(), '| plan lamps', await p.locator('#plan .lamps > *').count(), '|', await p.textContent('#timelab'));
  await done(); console.log('  ', await sent());
}
let t0 = Date.now(); await p.locator('#inst button', { hasText: 'Common areas only' }).click(); await p.waitForFunction(() => /22% fewer/.test(document.querySelector('#sentence').textContent), null, { timeout: 60000 }); console.log('back to common areas: results in', Date.now() - t0, 'ms |', await p.textContent('#runstat'));
// granular placement
await p.locator('#placepanel').scrollIntoViewIfNeeded();
await p.locator('#plan2 .room[data-id="dining-1"]').click(); await p.waitForTimeout(200);
console.log('inspector:', (await p.textContent('#inspector')).replace(/\s+/g, ' ').slice(0, 160));
await p.locator('#inspector .stepper button[aria-label="More"]').click(); await p.waitForTimeout(1500); await replayed(); await done();
console.log('after +1 in dining 1:', await inst(), '|', await p.textContent('#placecount')); console.log('  curve:', await curve()); console.log('  ', await sent());
await p.locator('#placepanel').screenshot({ path: 'shots/t-place.png' });
await p.locator('#curve').scrollIntoViewIfNeeded(); await p.locator('#curve').screenshot({ path: 'shots/t-curve.png' });
await p.locator('#presets button', { hasText: 'Common areas and bedrooms' }).click(); await p.waitForTimeout(400); console.log('start from both:', await inst(), '|', await p.textContent('#placecount'));
await p.locator('#inst button', { hasText: 'Your placement' }).click(); await p.waitForTimeout(400); console.log('your placement again:', await inst(), '|', await p.textContent('#lampcount'), '| curve:', await curve());
await p.locator('#inst button', { hasText: 'Common areas only' }).click(); await p.waitForTimeout(300);
await p.click('#play'); await p.waitForTimeout(2500); console.log('playing:', await p.textContent('#play'), await p.textContent('#timelab'));
await p.setViewportSize({ width: 400, height: 800 }); await p.waitForTimeout(400); console.log('phone scrollW', await p.evaluate(() => document.documentElement.scrollWidth));
await b.close();
