// Writes the film's captions, as the built page shows them, to web/captions.json. Run after the build; the
// narration (web/narrate.py) is made from this file.
import { chromium, CHROME, PAGE } from '../shots/lib.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const b = await chromium.launch({ ...CHROME, args: ['--no-sandbox'] }), p = await b.newPage();
await p.goto(PAGE); await p.waitForFunction(() => window.__film && window.__film.ready(), null, { timeout: 60000 });
const caps = await p.evaluate(() => ({ dur: window.__film.dur, captions: window.__film.captions() }));
fs.writeFileSync(root + 'web/captions.json', JSON.stringify(caps, null, 1)); console.log(caps.captions.length, 'captions,', caps.captions.reduce((a, c) => a + c.text.split(/\s+/).length, 0), 'words, film', caps.dur, 's');
await b.close();
