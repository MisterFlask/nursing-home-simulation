// Parameter metadata and portability tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PARAMS, PATHOGENS, ANCHORS, anchoredConfig, defaultConfig, getPath, paramRange } from '../src/params.js';

const GROUPS = ['Transmission', 'Lamps', 'Building', 'People', 'Disease', 'Responses'];

test('every PARAMS entry is complete, points at a number in the config, and has a source or a judgment note', () => {
  const paths = new Set();
  for (const pathogen of Object.keys(PATHOGENS)) {
    const cfg = defaultConfig(pathogen);
    for (const p of PARAMS) {
      if (p.anchoredOnly) {   // an input of the anchored fits only: anchoredConfig sets it, defaultConfig leaves the engine's own default
        if (ANCHORS[pathogen]) assert.equal(getPath(anchoredConfig(undefined, pathogen), p.path), (p.byPathogen && p.byPathogen[pathogen] ? p.byPathogen[pathogen] : p).central, `${p.path} in the anchored ${pathogen} config`);
        continue;
      }
      assert.equal(typeof getPath(cfg, p.path), 'number', `${p.path} is a number in ${pathogen} config`);
      const r = p.byPathogen && p.byPathogen[pathogen] ? p.byPathogen[pathogen] : p;
      assert.equal(getPath(cfg, p.path), r.central, `${p.path} default equals central for ${pathogen}`);
      assert.ok(r.low <= r.central && r.central <= r.high, `${p.path} low <= central <= high`);
    }
  }
  for (const p of PARAMS) {
    assert.ok(!paths.has(p.path), `duplicate ${p.path}`); paths.add(p.path);
    for (const k of ['path', 'label', 'group', 'units', 'low', 'central', 'high', 'scale', 'source', 'note']) assert.ok(k in p, `${p.path} has ${k}`);
    assert.ok(GROUPS.includes(p.group), `${p.path} group`);
    assert.ok(p.scale === 'linear' || p.scale === 'log');
    if (p.scale === 'log') assert.ok(p.low > 0, `${p.path}: log scale needs low > 0`);
    assert.ok(typeof p.source.text === 'string' && p.source.text.length > 0, `${p.path} source text`);
    assert.equal(typeof p.source.url, 'string');
    // A citation has a journal/DOI URL or, where none was found, no URL at
    // all (secondary and aggregator links were dropped). Judgment and fitted
    // values never carry a URL and must be explained in the note.
    const own = (src) => src.text === 'Modelling judgment' || src.text === 'Fitted (see note)';
    if (own(p.source)) { assert.equal(p.source.url, '', `${p.path}: judgment has no URL`); assert.ok(p.note.length > 0, `${p.path}: judgment must be explained in the note`); }
    else assert.ok(p.source.url === '' || /^https?:\/\//.test(p.source.url), `${p.path}: URL form`);
    for (const k in p.byPathogen || {}) { const b = p.byPathogen[k]; if (b.source) assert.ok(own(b.source) ? b.source.url === '' : (b.source.url === '' || /^https?:/.test(b.source.url))); }
  }
  console.log(`  ${PARAMS.length} parameters`);
});

test('every number in the config is either a PARAMS entry or a documented structural value', () => {
  const cfg = defaultConfig('covid');
  const paths = new Set(PARAMS.map((p) => p.path));
  // lamp.outputMw: the maker's rated output (cited under lamp.followMountingRule);
  // lamp.ecadr: display-only clean air per lamp at 2.4 m (derived, not an input).
  const structural = [/^days$/, /^schedule\./, /^emission\.activity\.rest$/, /^control\.masks\.none\./, /^lamp\.outputMw$/, /^lamp\.ecadr$/];
  const missing = [];
  (function walk(o, pre) {
    for (const k of Object.keys(o)) {
      const v = o[k], path = pre ? pre + '.' + k : k;
      if (typeof v === 'number' && !paths.has(path) && !structural.some((re) => re.test(path))) missing.push(path);
      else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, path);
    }
  })(cfg, '');
  assert.deepEqual(missing, []);
});

test('no placeholder values remain; low ≤ central ≤ high everywhere', () => {
  const txt = JSON.stringify(PARAMS);
  assert.ok(!/PLACEHOLDER/.test(txt), 'PLACEHOLDER found in PARAMS');
  for (const p of PARAMS) {
    assert.ok(p.low <= p.central && p.central <= p.high, `${p.path}: ${p.low} ≤ ${p.central} ≤ ${p.high}`);
    for (const k in p.byPathogen || {}) { const b = p.byPathogen[k]; assert.ok(b.low <= b.central && b.central <= b.high, `${p.path} (${k})`); }
  }
});

test('defaultConfig uses the calibrated G and emission at the central unreachable share', async () => {
  const { calibrated } = await import('../src/params.js');
  for (const pth of ['covid', 'flu', 'rsv']) {
    const share = paramRange(PARAMS.find((p) => p.path === 'transmission.closeShare'), pth).central;
    const c = defaultConfig(pth), k = calibrated(pth, share);
    assert.equal(c.transmission.closeShare, share);
    assert.equal(c.transmission.G, k.G); assert.equal(c.emission.median, k.emissionMedian);
    if (k.staffDailyHazard != null) { assert.equal(c.importation.staffDailyHazard, k.staffDailyHazard); assert.equal(c.importation.visitorInfectiousProb, k.visitorInfectiousProb); }
    const lo = calibrated(pth, 0.24), hi = calibrated(pth, 0.86);
    assert.ok(lo.G <= k.G && k.G <= hi.G, 'more close-range share needs larger G');
  }
});

test('COVID calibration covers the scenario shares without extrapolation', async () => {
  const { CALIBRATION } = await import('../src/params.js');
  const rows = CALIBRATION.covid.map((r) => r.closeShare);
  const sh = paramRange(PARAMS.find((p) => p.path === 'transmission.closeShare'), 'covid');
  for (const v of [sh.low, sh.central, sh.high]) assert.ok(Math.min(...rows) <= v && v <= Math.max(...rows), `share ${v}`);
});

test('presets exist for covid, flu and rsv and differ', () => {
  assert.deepEqual(Object.keys(PATHOGENS).sort(), ['covid', 'flu', 'rsv']);
  assert.notEqual(defaultConfig('flu').disease.latent.mean, defaultConfig('covid').disease.latent.mean);
  assert.equal(defaultConfig('custom').disease.latent.mean, defaultConfig('covid').disease.latent.mean);
});

test('portability: no Math.random, DOM or Node APIs in the browser modules', () => {
  for (const f of ['params.js', 'engine.js', 'analysis.js']) {
    const src = readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
    assert.ok(!/Math\.random/.test(src), `${f}: Math.random`);
    assert.ok(!/\b(document|window|process|require|Buffer|__dirname)\b/.test(src), `${f}: DOM/Node API`);
    assert.ok(!/from\s+['"]node:/.test(src), `${f}: node import`);
  }
});

test('portability: the three modules concatenate into one scope without name clashes (web build)', () => {
  // Same stripping the page build does: drop import lines and export keywords.
  const names = [];
  const strip = (src) => src
    .replace(/^\s*import\s[^;]*;?\s*$/gm, '')
    .replace(/^(\s*)export\s+(async\s+function\*?|function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/gm, (m, ws, kind, name) => { names.push(name); return `${ws}${kind} ${name}`; });
  const bundle = ['params.js', 'engine.js', 'analysis.js'].map((f) => strip(readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8'))).join('\n');
  const Sim = new Function(bundle + `\nreturn { ${names.join(', ')} };`)();
  const cfg = Sim.defaultConfig('covid');
  cfg.days = 10;
  const w = Sim.buildWorld(cfg, 1);
  const r = Sim.runSeason(w, { lamps: { activity: 1 } });
  assert.equal(r.daily.newResident.length, 10);
  assert.ok(Sim.summarize([1, 2, 3]).mean === 2);
});
