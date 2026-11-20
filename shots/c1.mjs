import { chromium, CHROME, PAGE } from './lib.mjs';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1500, height: 1100 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 900)));
await p.goto(PAGE);
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
for (const t of times) { await p.evaluate((t) => window.__film.render(t), t); await p.waitForTimeout(120); await p.locator('.filmstage').screenshot({ path: `shots/c-${String(t).replace('.', '_')}.png` }); }
// one contact sheet
await b.close();
