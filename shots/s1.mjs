// The "how the numbers were chosen" explainer: opens from the film tab, from the first slider and from the results,
// has no page errors, and fits a phone. node shots/s1.mjs  -> shots/s-*.png
import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
for (const [name, vp, scheme] of [['desk', { width: 1280, height: 900 }, 'light'], ['phone', { width: 400, height: 800 }, 'dark']]) {
  const p = await b.newPage({ viewport: vp, colorScheme: scheme });
  p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
  await p.goto(PAGE); await p.waitForTimeout(1500);
  await p.click('#view-film .splitopen'); await p.waitForTimeout(300);
  console.log(name, 'open from film:', await p.evaluate(() => document.querySelector('#split').open), '| model rows:', await p.evaluate(() => document.querySelectorAll('#splitmodel tbody tr').length));
  console.log(name, 'simulator section:', (await p.textContent('#splitmodel')).slice(0, 1600));
  console.log(name, 'dialog wider than the screen:', await p.evaluate(() => document.querySelector('#split').scrollWidth > innerWidth), '| page scrolls sideways:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  await p.screenshot({ path: `shots/s-${name}-top.png` });
  await p.evaluate(() => { document.querySelector('#splitmodel').scrollIntoView(); }); await p.waitForTimeout(200);
  await p.screenshot({ path: `shots/s-${name}-model.png` });
  await p.click('#splitclose');
  await p.goto(PAGE + '#model'); await p.reload(); await p.waitForTimeout(2500);
  await p.click('#primary .splitopen'); console.log(name, 'open from slider:', await p.evaluate(() => document.querySelector('#split').open)); await p.click('#splitclose');
  await p.click('#results .splitopen'); console.log(name, 'open from results:', await p.evaluate(() => document.querySelector('#split').open)); await p.click('#splitclose');
  await p.locator('#primary .prow').first().screenshot({ path: `shots/s-${name}-slider.png` });
  console.log(name, 'first slider:', (await p.locator('#primary .prow').first().textContent()).slice(0, 300));
  await p.close();
}
await b.close();
