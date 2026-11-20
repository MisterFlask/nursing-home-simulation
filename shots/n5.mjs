// Slider notes: a short description under each slider, and the full note in a dialog. node shots/n5.mjs -> shots/n5-*.png
import { chromium, CHROME, PAGE } from './lib.mjs';
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] });
for (const [name, vp, scheme] of [['desk', { width: 1280, height: 1000 }, 'dark'], ['phone', { width: 400, height: 800 }, 'light']]) {
  const p = await b.newPage({ viewport: vp, colorScheme: scheme });
  p.on('pageerror', (e) => console.log('PAGEERR', String(e.stack || e).slice(0, 400)));
  await p.goto(PAGE + '#model'); await p.waitForTimeout(2500);
  const stats = () => p.evaluate(() => { const n = [...document.querySelectorAll('.prow')].map((r) => [...r.querySelectorAll('.n')].filter((x) => !x.querySelector('button')).map((x) => x.textContent).join(' ')); const s = (t) => (t.match(/[.!?](\s|$)/g) || []).length; return { rows: n.length, links: document.querySelectorAll('.noteopen').length, longest: Math.max(...n.map((t) => t.length)), mostSentences: Math.max(...n.map(s)) }; });
  console.log(name, 'covid', JSON.stringify(await stats()));
  await p.locator('#primary').screenshot({ path: `shots/n5-${name}-primary.png` });
  await p.click('#primary .noteopen'); await p.waitForTimeout(200);
  console.log(name, 'note dialog:', await p.textContent('#notetitle'), '|', (await p.textContent('#notebody')).slice(0, 160), '| wider than screen:', await p.evaluate(() => document.querySelector('#note').scrollWidth > innerWidth));
  await p.screenshot({ path: `shots/n5-${name}-dialog.png` });
  await p.click('#note .splitopen'); await p.waitForTimeout(200);
  console.log(name, 'on to the explainer: note open', await p.evaluate(() => document.querySelector('#note').open), 'split open', await p.evaluate(() => document.querySelector('#split').open));
  await p.click('#splitclose');
  await p.getByRole('button', { name: 'Influenza' }).first().click(); await p.waitForTimeout(1500);
  console.log(name, 'flu', JSON.stringify(await stats()));
  await p.locator('.noteopen[data-path="lamp.susceptibility"]').click(); console.log(name, 'flu lamp constant:', (await p.textContent('#notebody')).slice(120, 330)); await p.click('#noteclose');
  await p.close();
}
await b.close();
