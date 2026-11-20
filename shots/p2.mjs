// The film as a video player: big play button whenever it is not playing, click on the picture, keys, clock.
// node shots/p2.mjs -> shots/p2-*.png
import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
for (const [name, vp, scheme] of [['desk', { width: 1280, height: 1000 }, 'light'], ['phone', { width: 400, height: 800 }, 'dark']]) {
  const p = await b.newPage({ viewport: vp, colorScheme: scheme });
  p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
  await p.goto(PAGE); await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
  const st = async (label) => { const s = await p.evaluate(() => window.__film.state()); console.log(name, label.padEnd(30), `t ${s.t.toFixed(1)} playing ${s.playing} sound ${s.sound} | bar "${await p.textContent('#filmplay')}" | clock ${await p.textContent('#filmtime')} | big button shown ${await p.locator('#filmbig').isVisible()} | length label shown ${await p.locator('#filmlen').isVisible()}`); return s; };
  await st('at the start'); await p.locator('.film .bd').screenshot({ path: `shots/p2-${name}-start.png` });
  await p.click('#filmbig'); await p.waitForTimeout(3000); await st('big button, +3 s');
  await p.click('.filmstage', { position: { x: 40, y: 40 } }); await p.waitForTimeout(300); await st('click on the picture'); await p.locator('.film .bd').screenshot({ path: `shots/p2-${name}-paused.png` });
  await p.click('.filmstage', { position: { x: 40, y: 40 } }); await p.waitForTimeout(1500); await st('click again, +1.5 s');
  await p.focus('#filmplay'); await p.keyboard.press('k'); await p.waitForTimeout(200); await st('K');
  await p.keyboard.press('ArrowRight'); await st('right arrow'); await p.keyboard.press('m'); await st('M');
  await p.keyboard.press('k'); await p.waitForTimeout(1500); await st('K, muted, +1.5 s'); await p.keyboard.press('m');
  await p.click('#filmplay'); await p.evaluate(() => window.__film.render(128)); await p.waitForTimeout(200); await st('at the end');
  await p.click('#filmbig'); await p.waitForTimeout(1200); await st('play again, +1.2 s'); await p.click('#filmplay');
  console.log(name, 'page scrolls sideways:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  await p.close();
}
await b.close();
