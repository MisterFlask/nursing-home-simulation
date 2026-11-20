import { chromium, CHROME, PAGE } from './lib.mjs';
import fs from 'node:fs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1480, height: 1000 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 800)));
fs.writeFileSync('shots/page.html', '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync('dist/index.html', 'utf8') + '</body></html>');
await p.goto(PAGE); await p.waitForTimeout(3000);
console.log('presets:', await p.locator('#presets button').allTextContents());
console.log(await p.textContent('#lampcount'));
console.log((await p.locator('#groups .grow').allTextContents()).join(' | '));
for (const i of [1,2,3]) { await p.locator('#presets button').nth(i).click(); await p.waitForTimeout(300); console.log(await p.textContent('#lampcount'), await p.locator('#presets button[aria-pressed=true]').textContent()); }
await p.locator('#presets button').nth(1).click(); await p.waitForTimeout(300);
await p.locator('#plan').screenshot({ path: 'shots/lamps250.png' }).catch(async e => { console.log('noplan', String(e).slice(0,100)); await p.screenshot({ path: 'shots/lamps250.png' }); });
await p.waitForTimeout(40000); console.log(await p.textContent("#runstat"), "|", await p.textContent("#sentence")); console.log(await p.locator("#tiles .tile").allTextContents()); console.log(await p.textContent("#fitted")); await p.locator("#results").screenshot({path:"shots/res.png"}); console.log((await p.locator("#table tr").allTextContents()).join("\n"));
await b.close();
