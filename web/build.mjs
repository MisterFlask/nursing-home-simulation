// Builds dist/index.html: one self-contained file with the engine inlined.
// The same engine source runs on the page (for the plan and sliders) and in a
// Web Worker (for the simulation runs).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const names = new Set();
function strip(src) {
  return src
    .replace(/^\s*import\s[^;]*;?\s*$/gm, '')
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, (m) => {
      for (const n of m.replace(/^\s*export\s*\{|\};?\s*$/g, '').split(',')) { const t = n.trim().split(/\s+as\s+/).pop(); if (t) names.add(t); }
      return '';
    })
    .replace(/^(\s*)export\s+(async\s+function\*?|function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/gm, (m, ws, kind, name) => { names.add(name); return `${ws}${kind} ${name}`; });
}
const bundle = ['src/params.js', 'src/engine.js', 'src/analysis.js'].map((f) => `// ---- ${f} ----\n` + strip(read(f))).join('\n');
// SIM_FROM=<file>: use a frozen engine bundle instead of src/ (while src/ is being edited).
const sim = process.env.SIM_FROM ? read(process.env.SIM_FROM) : bundle + `\nreturn { ${[...names].join(', ')} };`;

const content = JSON.parse(read('web/content.json'));
content.FILM = [{ ...JSON.parse(read('web/film.json')), routes: JSON.parse(read('web/film.routes.json')) }];   // made by web/film-data.mjs and web/film-routes.mjs
content.NARR = [existsSync(join(root, 'web/narration.json')) ? JSON.parse(read('web/narration.json')) : null];   // made by web/narrate.py
let app = read('web/app.js') + read('web/film.js');
for (const key of Object.keys(content)) {
  const re = new RegExp(`/\\*__${key}__\\*/(\\[\\]|''|[\\d.]+)`);
  if (!re.test(app)) throw new Error('placeholder not found: ' + key);
  app = app.replace(re, () => JSON.stringify(content[key]));
}
if (/\/\*__[A-Z0-9_]+__\*\//.test(app)) throw new Error('unfilled placeholder in app.js');

let html = read('web/app.html');
html = html.replace('/*__SIM_SOURCE__*/', () => sim).replace('/*__APP_SOURCE__*/', () => app);
if (/<\/script>/i.test(sim) || /<\/script>/i.test(app)) throw new Error('source contains a closing script tag');
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/index.html'), html);
// The published artifact is this page inside a fixed outer wrapper (web/publish-head.html: doctype, viewport and the
// host's small reset). dist/publish/index.html is the file to publish; shots/page.html is the same thing for the page tests.
const whole = read('web/publish-head.html') + html + '\n</body></html>';
mkdirSync(join(root, 'dist/publish'), { recursive: true }); mkdirSync(join(root, 'shots'), { recursive: true });
writeFileSync(join(root, 'dist/publish/index.html'), whole); writeFileSync(join(root, 'shots/page.html'), whole);
console.log(`dist/index.html  ${(html.length / 1024).toFixed(0)} KB  exports: ${[...names].join(', ')}`);
