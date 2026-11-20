import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
for (const [w, h] of [[1280, 800], [1440, 950], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
  await p.goto(PAGE);
  await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
  await p.evaluate(() => window.__film.render(36)); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const f = document.querySelector('#film').getBoundingClientRect(), c = document.querySelector('.filmctl').getBoundingClientRect(); return { stage: [Math.round(f.width), Math.round(f.height)], controlsBottom: Math.round(c.bottom), doc: document.documentElement.scrollHeight }; });
  console.log(w, h, JSON.stringify(r));
  await p.screenshot({ path: `shots/v2-${w}.png` });
  await p.close();
}
await b.close();
