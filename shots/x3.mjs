// The explainer dialog, top part, desktop and phone. node shots/x3.mjs
import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
for (const [W, H, tag] of [[1280, 1500, 'wide'], [400, 800, 'phone']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
  await p.goto(PAGE);
  await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
  await p.click('.explainopen'); await p.waitForTimeout(500);
  await p.screenshot({ path: `shots/x-explain-${tag}.png` });
  if (tag === 'wide') { await p.evaluate(() => { const d = document.querySelector('#explain'); d.scrollTop = d.scrollHeight; }); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/x-explain-end.png' }); }
  console.log(tag, 'dialog scrollWidth', await p.evaluate(() => document.querySelector('#explain').scrollWidth), 'client', await p.evaluate(() => document.querySelector('#explain').clientWidth));
  await p.close();
}
await b.close();
