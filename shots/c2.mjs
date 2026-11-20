import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 600)));
await p.goto(PAGE);
await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
await p.waitForTimeout(40000);   // let the main run finish
await p.evaluate(() => { window.__n = 0; const f = () => { window.__n++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
for (const [from, secs] of [[0, 12], [31, 6], [44, 16], [86, 9]]) {
  await p.evaluate((t) => window.__film.render(t), from); const n0 = await p.evaluate(() => window.__n);
  await p.click('#filmplay'); await p.waitForTimeout(secs * 1000); await p.click('#filmplay');
  console.log(`from ${from}s for ${secs}s: reached ${(+(await p.inputValue('#filmseek')) / 10).toFixed(1)}s, ${Math.round(((await p.evaluate(() => window.__n)) - n0) / secs)} frames/s`);
}
await b.close();
