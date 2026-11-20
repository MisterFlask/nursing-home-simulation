#!/usr/bin/env node
// Batch runner (Node only).
//
//   node src/cli.js compare  --config cfg.json --lamps placement.json --seeds 500
//   node src/cli.js rank     --config cfg.json --lamps-available 12 --seeds 500
//   node src/cli.js trial    --config cfg.json --design design.json --trials 1000
//   node src/cli.js sweep    --config cfg.json --lamps placement.json --param transmission.G --values 0,0.5,1,2,4
//   node src/cli.js baseline --config cfg.json --seeds 300        (extra: baseline diagnostics)
//
// Common options:
//   --config FILE    partial config (JSON) merged over defaultConfig(pathogen); may contain "pathogen"
//   --pathogen NAME  covid | flu | rsv (overrides the config file)
//   --set path=value[,path=value]  inline overrides, e.g. --set transmission.G=2
//   --scenario NAME  cautious | central | favourable (analysis.scenarios applied to the config)
//   --lamps X        JSON file ({"lamps": {...}, "cleaners": {...}} or a plain {roomId: n} map),
//                    or inline "dining-1=2,activity=2", or "type:dining=2,type:breakroom=1"
//   --seeds N        number of seeds (1..N), or A-B for a range
//   --out DIR        write <command>.json and <command>.csv there (default: out/)
//   --quiet          no progress output
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { defaultConfig, mergeConfig, setPath, getPath } from './params.js';
import { buildFacility } from './engine.js';
import { compare, summarize, rankRooms, simulateTrial, seedList, scenarios, calibrate, calibrateCovid3, calibrationMetrics, CALIBRATION_TARGETS, calibrationTargetValue, baselineRoomStats, allocateLamps, facilityPool, powerFromPool, facilitiesForPower } from './analysis.js';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) out[k] = argv[++i]; else out[k] = true;
    } else out._.push(a);
  }
  return out;
}
const readJSON = (f) => JSON.parse(readFileSync(f, 'utf8'));

function loadConfig(args) {
  let user = args.config ? readJSON(args.config) : {};
  if (user.config && typeof user.config === 'object') user = { ...user.config, pathogen: user.pathogen || user.config.pathogen }; // accept the web page's "copy settings" JSON
  const pathogen = args.pathogen || user.pathogen || 'covid';
  const cfg = mergeConfig(defaultConfig(pathogen), user);
  cfg.pathogen = pathogen;
  if (args.set) for (const kv of String(args.set).split(',')) { const [k, v] = kv.split('='); setPath(cfg, k.trim(), JSON.parse(v)); }
  if (args.scenario && args.scenario !== true) {
    const sc = scenarios(cfg)[args.scenario];
    if (!sc) throw new Error(`unknown scenario ${args.scenario} (cautious | central | favourable)`);
    console.error(`scenario ${args.scenario}: ${['transmission.closeShare', 'transmission.G', 'emission.median', 'lamp.susceptibility', 'lamp.pathFactor', 'lamp.realWorldFactor', 'lamp.ecadr'].map((p) => `${p}=${+(getPath(sc, p) || 0).toPrecision(3)}`).join(', ')}`);
    return sc;
  }
  return cfg;
}
function loadLamps(spec, cfg) {
  if (!spec || spec === true) return {};
  if (existsSync(spec)) {
    const j = readJSON(spec);
    if (j.lamps || j.cleaners) return { lamps: j.lamps || {}, cleaners: j.cleaners || {} };
    return { lamps: j };
  }
  const rooms = buildFacility(cfg.facility);
  const lamps = {};
  for (const kv of spec.split(',')) {
    const [k, v] = kv.split('=');
    const n = Number(v);
    if (k.startsWith('type:')) { for (const r of rooms) if (r.type === k.slice(5)) lamps[r.id] = n; }
    else lamps[k.trim()] = n;
  }
  return { lamps };
}
function parseSeeds(s, def) {
  if (s == null || s === true) return seedList(def);
  const m = String(s).match(/^(\d+)-(\d+)$/);
  if (m) return seedList({ start: +m[1], count: +m[2] - +m[1] + 1 });
  return seedList(+s);
}
function progress(args, label) {
  if (args.quiet) return undefined;
  let last = 0;
  return (done, total) => {
    const now = Date.now();
    if (done === total || now - last > 1000) { last = now; process.stderr.write(`\r${label}: ${done}/${total}   `); if (done === total) process.stderr.write('\n'); }
  };
}
function writeOut(args, name, json, csvRows) {
  const dir = args.out && args.out !== true ? args.out : 'out';
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(json, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v), 2));
  const csv = csvRows.map((r) => r.map((x) => (typeof x === 'string' && /[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x)).join(',')).join('\n') + '\n';
  writeFileSync(join(dir, `${name}.csv`), csv);
  console.error(`wrote ${join(dir, name + '.json')} and ${join(dir, name + '.csv')}`);
}
const f2 = (x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : x);
const sumLine = (s) => `mean ${f2(s.mean)}  median ${f2(s.median)}  [5% ${f2(s.q05)}, 25% ${f2(s.q25)}, 75% ${f2(s.q75)}, 95% ${f2(s.q95)}]  P(0) ${f2(s.pZero)}`;

// ---------------------------------------------------------------------------
function cmdCompare(args) {
  const cfg = loadConfig(args);
  const iv = loadLamps(args.lamps, cfg);
  const seeds = parseSeeds(args.seeds, 100);
  const t0 = Date.now();
  const r = compare(cfg, [{ name: 'none', intervention: {} }, { name: 'lamps', intervention: iv }], { seeds, onProgress: progress(args, 'compare') });
  const [a, b] = r.arms, p = r.paired[0];
  console.log(`seeds ${seeds.length}, ${((Date.now() - t0) / seeds.length).toFixed(0)} ms per seed (both arms)`);
  console.log(`lamps: ${JSON.stringify(iv.lamps || {})}`);
  console.log(`residents infected, no lamps : ${sumLine(a.summary.residentInfected)}`);
  console.log(`residents infected, lamps    : ${sumLine(b.summary.residentInfected)}`);
  console.log(`residents averted (paired)   : ${sumLine(p.summary.residentAverted)}`);
  console.log(`staff averted (paired)       : ${sumLine(p.summary.staffAverted)}`);
  console.log(`all averted (paired)         : ${sumLine(p.summary.totalAverted)}`);
  console.log(`relative reduction in mean resident infections: ${f2(100 * p.relativeReduction)}%   P(lamp arm worse in a season): ${f2(p.pWorse)}`);
  const rows = [['seed', 'res_none', 'res_lamps', 'staff_none', 'staff_lamps', 'res_averted', 'staff_averted']];
  r.seeds.forEach((s, i) => rows.push([s, a.residentInfected[i], b.residentInfected[i], a.staffInfected[i], b.staffInfected[i], p.residentAverted[i], p.staffAverted[i]]));
  writeOut(args, 'compare', { config: cfg, intervention: iv, seeds: r.seeds, arms: r.arms.map((x) => ({ name: x.name, summary: x.summary, routes: x.routes, byRoomMean: x.byRoomMean })), paired: r.paired }, rows);
}

function cmdRank(args) {
  const cfg = loadConfig(args);
  const n = +(args['lamps-available'] || 12);
  const seeds = parseSeeds(args.seeds, 100);
  const r = rankRooms(cfg, { seeds, lampsAvailable: n, confirm: !args['no-confirm'], confirmSeeds: args['confirm-seeds'] ? +args['confirm-seeds'] : seeds.length, onProgress: progress(args, 'rank') });
  console.log(`baseline mean residents infected: ${f2(r.baselineMeanResidentInfected)} (${r.seeds} seeds)`);
  console.log('top rooms by room-air infections acquired there (mean per season):');
  for (const x of r.rooms.slice(0, 10)) console.log(`  ${x.roomId.padEnd(14)} room-air ${f2(x.infectionsRoom)}  close ${f2(x.infectionsClose)}  λ ${f2(x.lambda)}/h  +${f2(x.deltaPerLamp)}/h per lamp  first lamp averts ${f2(x.firstLampAverted)}`);
  console.log(`greedy allocation of ${n} lamps: ${JSON.stringify(r.allocation)}  (first-order prediction: ${f2(r.predictedAverted)} averted per season)`);
  if (r.confirm) for (const c of r.confirm.allocations) {
    console.log(`  confirm ${c.name} (${r.confirm.seeds} fresh seeds): predicted ${f2(c.predictedAverted)} infections averted (residents + staff); simulated ${f2(c.totalAverted.mean)} ± ${f2(c.totalAverted.se)}`);
    console.log(`      residents averted ${sumLine(c.residentAverted)}; relative reduction in residents ${f2(100 * c.relativeReduction)}%`);
  }
  const rows = [['room', 'type', 'infections_room', 'infections_close', 'lambda', 'delta_per_lamp', 'first_lamp_averted', 'lamps_allocated']];
  for (const x of r.rooms) rows.push([x.roomId, x.type, x.infectionsRoom, x.infectionsClose, x.lambda, x.deltaPerLamp, x.firstLampAverted, x.lamps]);
  writeOut(args, 'rank', { config: cfg, ...r }, rows);
}

function cmdTrial(args) {
  const cfg = loadConfig(args);
  let design = args.design ? readJSON(args.design) : {};
  design = { facilitiesPerArm: 10, seasons: 1, crossover: false, facilityVariation: { ventilationGsd: 1.5, importationGsd: 1.5, immunitySd: 0.1 }, ...design };
  if (!design.placement) design.placement = loadLamps(args.lamps || 'type:dining=2,type:activity=2,type:breakroom=1', cfg);
  const trials = +(args.trials || 100);
  const t0 = Date.now();
  const r = simulateTrial(cfg, design, { trials, onProgress: progress(args, 'trial'), permutations: +(args.permutations || 999) });
  console.log(`design: ${JSON.stringify({ ...design, placement: undefined })}`);
  console.log(`placement: ${JSON.stringify(design.placement.lamps || design.placement)}`);
  console.log(`${trials} trials, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`power at alpha ${r.alpha}: ${f2(r.power)}`);
  console.log(`mean resident infections per facility-season: control ${f2(r.meanControl)}, lamps ${f2(r.meanTreated)}`);
  console.log(`estimated effect (control − lamps): ${sumLine(r.effect)}`);
  const rows = [['trial', 'estimate', 'relative', 'p', 'mean_control', 'mean_treated']];
  for (const t of r.trials) rows.push([t.trial, t.estimate, t.relative, t.p, t.meanControl, t.meanTreated]);
  writeOut(args, 'trial', { config: cfg, ...r }, rows);
}

function cmdSweep(args) {
  const base = loadConfig(args);
  const path = args.param;
  if (!path || path === true) throw new Error('--param is required');
  const values = String(args.values || '').split(',').map(Number);
  const seeds = parseSeeds(args.seeds, 100);
  const rows = [['param', 'value', 'res_none_mean', 'res_none_median', 'res_lamps_mean', 'res_lamps_median', 'averted_mean', 'averted_se', 'relative_reduction', 'share_room', 'share_close', 'share_community']];
  const out = [];
  for (const v of values) {
    const cfg = mergeConfig(base, {}); setPath(cfg, path, v);
    const iv = loadLamps(args.lamps, cfg);
    const r = compare(cfg, [{ name: 'none', intervention: {} }, { name: 'lamps', intervention: iv }], { seeds, onProgress: progress(args, `${path}=${v}`) });
    const [a, b] = r.arms, p = r.paired[0];
    const rt = a.routes, tot = rt.room + rt.close + rt.community || 1;
    console.log(`${path}=${v}: residents none ${f2(a.summary.residentInfected.mean)} (median ${f2(a.summary.residentInfected.median)}), lamps ${f2(b.summary.residentInfected.mean)}; averted ${f2(p.summary.residentAverted.mean)} ± ${f2(p.summary.residentAverted.se)} (${f2(100 * p.relativeReduction)}%); routes room/close/community ${f2(rt.room / tot)}/${f2(rt.close / tot)}/${f2(rt.community / tot)}`);
    rows.push([path, v, a.summary.residentInfected.mean, a.summary.residentInfected.median, b.summary.residentInfected.mean, b.summary.residentInfected.median, p.summary.residentAverted.mean, p.summary.residentAverted.se, p.relativeReduction, rt.room / tot, rt.close / tot, rt.community / tot]);
    out.push({ value: v, none: a.summary, lamps: b.summary, paired: p.summary, relativeReduction: p.relativeReduction, routes: rt });
  }
  writeOut(args, 'sweep', { param: path, values, seeds: seeds.length, results: out }, rows);
}

// Baseline diagnostics: season distribution, routes, top rooms, and the fate
// of single introductions (one infected staff member, no other importation).
function cmdBaseline(args) {
  const cfg = loadConfig(args);
  const seeds = parseSeeds(args.seeds, 300);
  const nRes = cfg.facility.wings * cfg.facility.residentsPerWing;
  const r = compare(cfg, [{ name: 'none', intervention: {} }], { seeds, onProgress: progress(args, 'baseline') });
  const a = r.arms[0];
  const ar = a.residentInfected.map((x) => x / nRes);
  const sAR = summarize(ar), sStaff = summarize(a.staffInfected);
  const rt = a.routes, tot = rt.room + rt.close + rt.community || 1;
  console.log(`seeds ${seeds.length}; residents ${nRes}`);
  console.log(`resident attack rate: ${sumLine(sAR)}`);
  console.log(`staff infected: ${sumLine(sStaff)}`);
  const imp = summarize(a.totals.map((t) => t.importations)), ob = summarize(a.totals.map((t) => t.outbreaks)), lc = summarize(a.totals.map((t) => t.largestCluster));
  console.log(`importations per season: mean ${f2(imp.mean)}; outbreak-mode triggers per season: mean ${f2(ob.mean)}; largest 14-day resident cluster: median ${f2(lc.median)}, 95% ${f2(lc.q95)}`);
  console.log(`infections by route: room ${f2(100 * rt.room / tot)}%, close ${f2(100 * rt.close / tot)}%, community ${f2(100 * rt.community / tot)}%`);
  const rooms = Object.entries(a.byRoomMean).filter(([id]) => id !== 'outside').sort((x, y) => y[1].infections - x[1].infections);
  console.log('top rooms by infections acquired there (mean per season; room-air / close):');
  for (const [id, b] of rooms.slice(0, 10)) console.log(`  ${id.padEnd(14)} ${f2(b.infections)}  (${f2(b.infectionsRoom)} / ${f2(b.infectionsClose)})`);
  const byType = {};
  for (const [id, b] of rooms) { const t = id.replace(/^w\d+-/, '').replace(/-\d+$/, '').replace(/^bed$/, 'bedroom'); const o = byType[t] || (byType[t] = { infections: 0, room: 0, close: 0 }); o.infections += b.infections; o.room += b.infectionsRoom; o.close += b.infectionsClose; }
  console.log('by room type (mean per season; total / room-air / close):');
  for (const [t, b] of Object.entries(byType).sort((x, y) => y[1].infections - x[1].infections)) console.log(`  ${t.padEnd(10)} ${f2(b.infections)} / ${f2(b.room)} / ${f2(b.close)}`);

  // Single introductions.
  const nIntro = +(args.intros || Math.min(300, seeds.length));
  const cfg1 = mergeConfig(cfg, { importation: { staffDailyHazard: 0, visitorInfectiousProb: 0 } });
  const sizes = [];
  const { buildWorld, runSeason } = engineFns;
  for (let i = 0; i < nIntro; i++) {
    const w = buildWorld(cfg1, 100000 + i);
    const staff = w.people.filter((p) => p.role !== 'resident');
    const idx = staff[Math.floor(((i * 2654435761) >>> 0) / 4294967296 * staff.length)].id; // spread over staff deterministically
    const res = runSeason(w, {}, { introductions: [{ person: idx, day: 5 }] });
    sizes.push(res.totals.residentInfected);
  }
  const sz = summarize(sizes);
  const frac = (f) => f2(sizes.filter(f).length / sizes.length);
  console.log(`single staff introduction (${nIntro} runs): residents infected ${sumLine(sz)}`);
  console.log(`  share with 0 residents infected ${frac((x) => x === 0)}, 1-4 ${frac((x) => x >= 1 && x < 5)}, 5-19 ${frac((x) => x >= 5 && x < 20)}, 20+ ${frac((x) => x >= 20)}`);
  const rows = [['seed', 'resident_infected', 'staff_infected', 'importations', 'room', 'close', 'community', 'outbreaks', 'largest_cluster']];
  a.totals.forEach((t, i) => rows.push([r.seeds[i], t.residentInfected, t.staffInfected, t.importations, t.byRoute.room, t.byRoute.close, t.byRoute.community, t.outbreaks, t.largestCluster]));
  writeOut(args, 'baseline', { config: cfg, attackRate: sAR, staff: sStaff, routes: rt, byRoomMean: a.byRoomMean, singleIntroduction: { sizes, summary: sz } }, rows);
}

import * as engineFns from './engine.js';

// Calibration: fit (G, emission.median) per close-range share for each pathogen.
//   node src/cli.js calibrate [--pathogen covid] [--season-seeds 200] [--outbreak-seeds 300] [--write]
// --write replaces the CALIBRATION block in src/params.js (all pathogens in the output file are merged).
function cmdCalibrate(args) {
  if (args.covid3) {
    // Third-pass COVID fit: emission, G and staff community hazard.
    const shares = args.shares ? String(args.shares).split(',').map(Number) : undefined;
    const r = calibrateCovid3({ config: mergeConfig(defaultConfig('covid'), args.config ? readJSON(args.config) : {}), shares, seasonSeeds: +(args['season-seeds'] || 200),
      G0: args.G0 ? +args.G0 : undefined, e0: args.e0 ? +args.e0 : undefined, h0: args.h0 ? +args.h0 : undefined, log: (m) => console.error(m) });
    const dir = args.out && args.out !== true ? args.out : 'out';
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'covid3.json'), JSON.stringify(r, null, 2));
    return;
  }
  const pathogens = args.pathogen && args.pathogen !== true ? String(args.pathogen).split(',') : ['covid', 'flu', 'rsv'];
  const dir = args.out && args.out !== true ? args.out : 'out';
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'calibration.json');
  const all = existsSync(file) ? readJSON(file) : {};
  if (args['from-logs']) {
    // Rebuild the table from calibration logs (e.g. a run resumed with --shares / --G0 / --e0).
    for (const f of String(args['from-logs']).split(',')) {
      for (const line of readFileSync(f, 'utf8').split('\n')) {
        const m = line.match(/^(covid|flu|rsv) share ([0-9.]+): G=([0-9.e+-]+) emission=([0-9.e+-]+) (\{.*\}) \(/);
        if (!m) continue;
        const [, p, sh, G, e, ach] = m;
        const cfg = defaultConfig(p);
        const r = all[p] || (all[p] = { pathogen: p, target: calibrationTargetValue(p, cfg), targetSource: CALIBRATION_TARGETS[p].source, seasonSeeds: +(args['season-seeds'] || 200), outbreakSeeds: +(args['outbreak-seeds'] || 300), rows: [], date: new Date().toISOString().slice(0, 10) });
        r.rows = r.rows.filter((x) => x.closeShare !== +sh);
        r.rows.push({ closeShare: +sh, G: +(+G).toPrecision(5), emissionMedian: +(+e).toPrecision(5), achieved: JSON.parse(ach) });
        r.rows.sort((a, b) => a.closeShare - b.closeShare);
      }
    }
    writeFileSync(file, JSON.stringify(all, null, 2));
    for (const p of Object.keys(all)) console.log(`${p}: ${all[p].rows.length} rows`);
    if (args.write) writeCalibration(all);
    return;
  }
  for (const p of pathogens) {
    const cfg = mergeConfig(defaultConfig(p), args.config ? readJSON(args.config) : {});
    const t0 = Date.now();
    const shares = args.shares ? String(args.shares).split(',').map(Number) : undefined;
    const r = calibrate(p, { config: cfg, shares, G0: args.G0 ? +args.G0 : undefined, e0: args.e0 ? +args.e0 : undefined, seasonSeeds: +(args['season-seeds'] || 200), outbreakSeeds: +(args['outbreak-seeds'] || 300), log: (m) => console.error(m) });
    r.date = new Date().toISOString().slice(0, 10);
    r.minutes = +((Date.now() - t0) / 60000).toFixed(1);
    all[p] = r;
    writeFileSync(file, JSON.stringify(all, null, 2));
    console.log(`${p}: target ${r.target} (${r.targetSource}); ${r.evaluations} evaluations, ${r.minutes} min`);
    for (const row of r.rows) console.log(`  share ${row.closeShare}: G ${row.G}, emission ${row.emissionMedian} q/h; achieved ${JSON.stringify(row.achieved)}`);
  }
  if (args.write) writeCalibration(all);
}
function writeCalibration(all) {
  const path = fileURLToPath(new URL('./params.js', import.meta.url));
  const src = readFileSync(path, 'utf8');
  const lines = ['// CALIBRATION-BEGIN'];
  for (const p of Object.keys(all)) lines.push(`// ${p}: ${all[p].date}, ${all[p].seasonSeeds} season seeds, ${all[p].outbreakSeeds} outbreak seeds; target ${all[p].target} (${all[p].targetSource})`);
  const table = {};
  for (const p of Object.keys(all)) table[p] = all[p].rows;
  lines.push('export const CALIBRATION = ' + JSON.stringify(table, null, 1).replace(/\n\s*/g, ' ').replace(/\} \{/g, '},\n  {').replace(/\] \}/g, ']\n}') + ';');
  lines.push('// CALIBRATION-END');
  const out = src.replace(/\/\/ CALIBRATION-BEGIN[\s\S]*?\/\/ CALIBRATION-END/, lines.join('\n'));
  writeFileSync(path, out);
  console.error('wrote CALIBRATION into ' + path);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
// Study-design runs for one pathogen and scenario (results/README.md):
//   node src/cli.js study --pathogen covid --scenario central --out results
function cmdStudy(args) {
  const pathogen = args.pathogen || 'covid', scName = args.scenario || 'central';
  const cfg = scenarios(defaultConfig(pathogen))[scName];
  const dir = args.out && args.out !== true ? args.out : 'results';
  mkdirSync(dir, { recursive: true });
  const tag = `${pathogen}-${scName}`;
  const nRank = +(args['rank-seeds'] || 300), nConfirm = +(args['confirm-seeds'] || 2000), nPlace = +(args['placement-seeds'] || 2000);
  const poolSize = +(args.pool || 2000), nTrials = +(args.trials || 400);
  const budgets = [4, 8, 12, 20, 40];
  const t0 = Date.now();
  const log = (m) => console.error(`[${tag} ${((Date.now() - t0) / 1000).toFixed(0)}s] ${m}`);
  const ci = (s) => [s.mean - 1.96 * s.se, s.mean + 1.96 * s.se];
  const out = { pathogen, scenario: scName, config: cfg, seeds: { rank: [1, nRank], confirm: [10001, 10000 + nConfirm], placements: [20001, 20000 + nPlace] } };
  // 1. Rank rooms and confirm greedy allocations.
  const stats = baselineRoomStats(cfg, { seeds: { start: 1, count: nRank } });
  const al = allocateLamps(cfg, stats, Math.max(...budgets));
  const alloc = (b) => { const a = {}; for (const st of al.steps.slice(0, b)) a[st.roomId] = (a[st.roomId] || 0) + 1; return a; };
  log('ranking done');
  const arms = [{ name: 'none', intervention: {} }].concat(budgets.map((b) => ({ name: `greedy-${b}`, intervention: { lamps: alloc(b) } })));
  const cmp = compare(cfg, arms, { seeds: { start: 10001, count: nConfirm } });
  log('confirmation done');
  out.baseline = { residentInfected: cmp.arms[0].summary.residentInfected, routes: cmp.arms[0].routes, attackRate: cmp.arms[0].summary.residentInfected.mean / (cfg.facility.wings * cfg.facility.residentsPerWing) };
  out.topRooms = al.rooms.slice(0, 15).map((x) => ({ roomId: x.roomId, type: x.type, infectionsRoom: x.infectionsRoom, infectionsClose: x.infectionsClose, lambda: x.lambda, firstLampAverted: x.firstLampAverted }));
  out.rank = budgets.map((b, i) => {
    const p = cmp.paired[i];
    return { lamps: b, allocation: alloc(b), predictedAverted: al.steps[Math.min(b, al.steps.length) - 1].cumulative,
      residentAverted: p.summary.residentAverted, residentAvertedCI95: ci(p.summary.residentAverted), totalAverted: p.summary.totalAverted, totalAvertedCI95: ci(p.summary.totalAverted),
      relativeReduction: p.relativeReduction, pWorse: p.pWorse };
  });
  // 2. Fixed placements, one lamp per 100 m³ (at least one).
  const rooms = buildFacility(cfg.facility).filter((r) => r.type !== 'outside');
  const sized = (types) => { const l = {}; for (const r of rooms) if (!types || types.includes(r.type)) l[r.id] = Math.max(1, Math.round(r.volume / 100)); return l; };
  const shared = ['dining', 'activity', 'lounge', 'therapy'];
  const placements = [
    { name: 'shared rooms', lamps: sized(shared) },
    { name: 'shared rooms + break room', lamps: sized([...shared, 'breakroom']) },
    { name: 'every room', lamps: sized(null) },
  ];
  const cmp2 = compare(cfg, [{ name: 'none', intervention: {} }].concat(placements.map((x) => ({ name: x.name, intervention: { lamps: x.lamps } }))), { seeds: { start: 20001, count: nPlace } });
  log('placements done');
  out.placements = placements.map((x, i) => {
    const p = cmp2.paired[i];
    return { name: x.name, lampCount: Object.values(x.lamps).reduce((a, b) => a + b, 0), lamps: x.lamps, residentAverted: p.summary.residentAverted, residentAvertedCI95: ci(p.summary.residentAverted),
      totalAverted: p.summary.totalAverted, relativeReduction: p.relativeReduction, pWorse: p.pWorse, residentInfectedWithLamps: cmp2.arms[i + 1].summary.residentInfected };
  });
  out.placementBaseline = cmp2.arms[0].summary.residentInfected;
  // 3. Trial power with the best 12-lamp placement.
  const fv = { ventilationGsd: 1.6, importationGsd: 2.0, immunitySd: 0.1 };
  const best12 = alloc(12);
  const pool = facilityPool(cfg, { placement: { lamps: best12 }, facilityVariation: fv }, { poolSize, seasonsPerFacility: 2, paired: true, onProgress: (d, t) => { if (d % 400 === 0) log(`pool ${d}/${t}`); } });
  out.trial = { placement: best12, facilityVariation: fv, poolSize, trialsPerCell: nTrials, poolMeans: { control: summarize(pool.ctrl.flat()), lamps: summarize(pool.lamp.flat()), lampsPaired: summarize(pool.pairLamp) }, cells: [] };
  for (const F of [5, 10, 20, 40, 80]) {
    const r = powerFromPool(pool, { facilitiesPerArm: F, seasons: 1 }, { trials: nTrials });
    out.trial.cells.push({ design: 'parallel', facilitiesPerArm: F, totalFacilities: 2 * F, seasons: 1, power: r.power, effect: r.effect, relativeEffect: r.relativeEffect, meanControl: r.meanControl, meanTreated: r.meanTreated });
  }
  for (const F of [5, 10, 20, 40]) {
    const r = powerFromPool(pool, { facilities: F, seasons: 2, crossover: true }, { trials: nTrials });
    out.trial.cells.push({ design: 'crossover', facilities: F, totalFacilities: F, seasons: 2, power: r.power, effect: r.effect, relativeEffect: r.relativeEffect, meanControl: r.meanControl, meanTreated: r.meanTreated });
  }
  // Alternative outcome: residents infected per detected outbreak.
  out.trial.altOutcome = { outcome: 'residents infected per detected outbreak (outbreak = first case until 14 days without a case; homes test all residents during an outbreak)', cells: [] };
  for (const F of [5, 10, 20, 40, 80]) {
    const r = powerFromPool(pool, { facilitiesPerArm: F, seasons: 1 }, { trials: nTrials, outcome: 'outbreakSize' });
    out.trial.altOutcome.cells.push({ design: 'parallel', facilitiesPerArm: F, seasons: 1, power: r.power, effect: r.effect, meanControl: r.meanControl, meanTreated: r.meanTreated });
  }
  for (const F of [5, 10, 20, 40]) {
    const r = powerFromPool(pool, { facilities: F, seasons: 2, crossover: true }, { trials: nTrials, outcome: 'outbreakSize' });
    out.trial.altOutcome.cells.push({ design: 'crossover', facilities: F, seasons: 2, power: r.power, effect: r.effect, meanControl: r.meanControl, meanTreated: r.meanTreated });
  }
  // Facilities for 80% power (normal approximation from the pool).
  out.trial.n80 = { infections: facilitiesForPower(pool), outbreakSize: facilitiesForPower(pool, { outcome: 'outbreakSize' }) };
  for (const k of ['infections', 'outbreakSize']) {
    const x = out.trial.n80[k];
    // Headline sizes use the paired (common-random-numbers) effect; the
    // unpaired values (difference of independent means) are kept for reference.
    x.unpaired = { delta: x.delta, parallelPerArm: x.parallelPerArm, crossoverTotal: x.crossoverTotal };
    x.parallelPerArm = x.paired.parallelPerArm; x.crossoverTotal = x.paired.crossoverTotal;
    x.parallelExtrapolated = x.parallelPerArm == null || x.parallelPerArm > 80; x.crossoverExtrapolated = x.crossoverTotal == null || x.crossoverTotal > 40;
  }
  log('trials done');
  out.minutes = +((Date.now() - t0) / 60000).toFixed(1);
  writeFileSync(join(dir, `${tag}.json`), JSON.stringify(out, null, 1));
  const f3 = (x) => (Number.isFinite(x) ? +x.toFixed(3) : x);
  const csv = (rows) => rows.map((r) => r.map((x) => (typeof x === 'string' && /[",]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x)).join(',')).join('\n') + '\n';
  writeFileSync(join(dir, `${tag}-rank.csv`), csv([['lamps', 'rooms', 'predicted_averted_all', 'resident_averted_mean', 'ci95_low', 'ci95_high', 'all_averted_mean', 'relative_reduction', 'p_worse']]
    .concat(out.rank.map((r) => [r.lamps, Object.entries(r.allocation).map(([k, v]) => `${k}:${v}`).join(' '), f3(r.predictedAverted), f3(r.residentAverted.mean), f3(r.residentAvertedCI95[0]), f3(r.residentAvertedCI95[1]), f3(r.totalAverted.mean), f3(r.relativeReduction), f3(r.pWorse)]))));
  writeFileSync(join(dir, `${tag}-placements.csv`), csv([['placement', 'lamps', 'resident_averted_mean', 'ci95_low', 'ci95_high', 'relative_reduction', 'p_worse']]
    .concat(out.placements.map((r) => [r.name, r.lampCount, f3(r.residentAverted.mean), f3(r.residentAvertedCI95[0]), f3(r.residentAvertedCI95[1]), f3(r.relativeReduction), f3(r.pWorse)]))));
  writeFileSync(join(dir, `${tag}-power.csv`), csv([['outcome', 'design', 'facilities_per_arm_or_total', 'seasons', 'power', 'effect_mean', 'mean_control', 'mean_lamps']]
    .concat(out.trial.cells.map((c) => ['resident infections per season', c.design, c.facilitiesPerArm || c.facilities, c.seasons, f3(c.power), f3(c.effect.mean), f3(c.meanControl), f3(c.meanTreated)]))
    .concat(out.trial.altOutcome.cells.map((c) => ['residents infected per outbreak', c.design, c.facilitiesPerArm || c.facilities, c.seasons, f3(c.power), f3(c.effect.mean), f3(c.meanControl), f3(c.meanTreated)]))
    .concat(['infections', 'outbreakSize'].map((k) => { const x = out.trial.n80[k].paired; return [k === 'infections' ? 'resident infections per season' : 'residents infected per outbreak', 'n for 80% power (normal approx., paired effect)',
      x.refused ? `not given: ${x.refused}` : `parallel ${x.parallelPerArm} per arm (95% CI ${x.parallelPerArmCI95[0]}-${x.parallelPerArmCI95[1] ?? 'unbounded'}); crossover ${x.crossoverTotal} total (95% CI ${x.crossoverTotalCI95[0]}-${x.crossoverTotalCI95[1] ?? 'unbounded'})`, '', '', f3(x.delta), '', '']; }))));
  console.log(`${tag}: baseline mean ${f3(out.baseline.residentInfected.mean)} residents; ${out.minutes} min`);
}

// Candidate trial outcomes compared on the same facility pool as `study`
// (normal-approximation sample sizes plus resampled power for the best one).
//   node src/cli.js outcomes --pathogen covid --scenario central --out results
function cmdOutcomes(args) {
  const pathogen = args.pathogen || 'covid', scName = args.scenario || 'central';
  const dir = args.out && args.out !== true ? args.out : 'results';
  const prev = JSON.parse(readFileSync(join(dir, `${pathogen}-${scName}.json`), 'utf8'));
  const cfg = scenarios(defaultConfig(pathogen))[scName];
  const pool = facilityPool(cfg, { placement: { lamps: prev.trial.placement }, facilityVariation: prev.trial.facilityVariation }, { poolSize: prev.trial.poolSize, seasonsPerFacility: 2 });
  const big = +(args.big || 10);
  const outcomes = {
    'resident infections per season': (n, ob) => n,
    'log(1 + resident infections per season)': (n, ob) => Math.log1p(n),
    [`season has an outbreak of ${big}+ residents (yes/no)`]: (n, ob) => (ob.some((x) => x >= big) ? 1 : 0),
    'residents infected per detected outbreak': (n, ob) => (ob.length ? ob.reduce((a, b) => a + b, 0) / ob.length : NaN),
  };
  const za = 1.959964, zb = 0.841621;
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
  const rows = [];
  for (const [name, fn] of Object.entries(outcomes)) {
    const c = [], l = [], d = [];
    for (let f = 0; f < pool.size; f++) for (let k = 0; k < pool.seasonsPerFacility; k++) {
      const vc = fn(pool.ctrl[f][k], pool.ctrlOB[f][k]), vl = fn(pool.lamp[f][k], pool.lampOB[f][k]);
      if (Number.isFinite(vc)) c.push(vc); if (Number.isFinite(vl)) l.push(vl);
      if (Number.isFinite(vc) && Number.isFinite(vl)) d.push(vc - vl);
    }
    const delta = mean(c) - mean(l), sigma = Math.sqrt((sd(c) ** 2 + sd(l) ** 2) / 2);
    const avail = (c.length + l.length) / (2 * pool.size * pool.seasonsPerFacility);
    const nPar = Math.ceil(2 * (za + zb) ** 2 * sigma ** 2 / delta ** 2 / avail);
    const nX = Math.ceil((za + zb) ** 2 * sd(d) ** 2 / mean(d) ** 2 / (d.length / (pool.size * pool.seasonsPerFacility)));
    // Resampled power, parallel design, Welch-type z test on facility values (fast check of the approximation).
    const rngS = makeRngLocal(99);
    const power = {};
    for (const F of [20, 40, 80, 160]) {
      let rej = 0;
      for (let t = 0; t < 400; t++) {
        const a = [], b = [];
        for (let i = 0; i < F; i++) { const x = c[Math.floor(rngS() * c.length)], y = l[Math.floor(rngS() * l.length)]; a.push(x); b.push(y); }
        const se = Math.sqrt(sd(a) ** 2 / F + sd(b) ** 2 / F);
        if (se > 0 && Math.abs((mean(a) - mean(b)) / se) > za) rej++;
      }
      power[F] = rej / 400;
    }
    rows.push({ outcome: name, meanControl: mean(c), meanLamps: mean(l), effect: delta, relativeEffect: delta / mean(c), sd: sigma, shareOfSeasonsWithValue: avail, parallelPerArmFor80: nPar, crossoverTotalFor80: nX, simulatedParallelPower: power });
    console.log(`${name}: control ${mean(c).toFixed(3)}, lamps ${mean(l).toFixed(3)} (${(100 * delta / mean(c)).toFixed(1)}%), SD ${sigma.toFixed(3)} -> 80% power: parallel ${nPar} per arm, crossover ${nX} total; simulated parallel power ${JSON.stringify(power)}`);
  }
  writeFileSync(join(dir, `${pathogen}-${scName}-outcomes.json`), JSON.stringify({ pathogen, scenario: scName, placement: prev.trial.placement, poolSize: pool.size, rows }, null, 1));
}
function makeRngLocal(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Room-assumption sensitivity of the best 12-lamp placement (central scenario
// unless --scenario): each variant is re-ranked and its 12-lamp greedy
// allocation confirmed on fresh paired seeds.
//   node src/cli.js sensitivity [--pathogen covid] [--confirm-seeds 1500] --out results
function cmdSensitivity(args) {
  const pathogen = args.pathogen || 'covid', scName = args.scenario || 'central';
  const base = defaultConfig(pathogen);
  const nRank = +(args['rank-seeds'] || 300), nConfirm = +(args['confirm-seeds'] || 1500), budget = +(args.lamps || 12);
  const variants = [
    { name: 'as set (lounge 25 m², lounge 3/h, break room 1/h)', over: {} },
    { name: 'lounge 15 m²', over: { facility: { rooms: { lounge: { area: 15 } } } } },
    { name: 'lounge 40 m²', over: { facility: { rooms: { lounge: { area: 40 } } } } },
    { name: 'lounge ventilation 6/h', over: { facility: { ach: { lounge: 6 } } } },
    { name: 'break-room ventilation 4/h', over: { facility: { ach: { breakroom: 4 } } } },
    { name: 'combined cautious (lounge 40 m², lounge 6/h, break room 4/h)', over: { facility: { rooms: { lounge: { area: 40 } }, ach: { lounge: 6, breakroom: 4 } } } },
  ];
  const rows = [];
  const t0 = Date.now();
  for (const v of variants) {
    const cfg = scenarios(mergeConfig(base, v.over))[scName];
    const stats = baselineRoomStats(cfg, { seeds: { start: 1, count: nRank } });
    const al = allocateLamps(cfg, stats, budget);
    const alloc = {}; for (const st of al.steps.slice(0, budget)) alloc[st.roomId] = (alloc[st.roomId] || 0) + 1;
    const cmp = compare(cfg, [{ name: 'none', intervention: {} }, { name: 'best', intervention: { lamps: alloc } }], { seeds: { start: 30001, count: nConfirm } });
    const p = cmp.paired[0], s = p.summary.residentAverted;
    const byType = {}; for (const [id, n] of Object.entries(alloc)) { const t = id.replace(/-\d+$/, '').replace(/^w\d+-/, '').replace(/^bed.*/, 'bedroom'); byType[t] = (byType[t] || 0) + n; }
    rows.push({ variant: v.name, allocation: alloc, byType, baseline: cmp.arms[0].summary.residentInfected.mean, residentAverted: s.mean, ci95: [s.mean - 1.96 * s.se, s.mean + 1.96 * s.se], relativeReduction: p.relativeReduction });
    console.error(`[sensitivity ${((Date.now() - t0) / 1000).toFixed(0)}s] ${v.name}: ${s.mean.toFixed(2)} averted`);
  }
  const dir = args.out && args.out !== true ? args.out : 'results';
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${pathogen}-${scName}-sensitivity.json`), JSON.stringify({ pathogen, scenario: scName, lamps: budget, rankSeeds: [1, nRank], confirmSeeds: [30001, 30000 + nConfirm], rows }, null, 1));
  const f = (x) => +x.toFixed(2);
  writeFileSync(join(dir, `${pathogen}-${scName}-sensitivity.csv`), ['variant,lamps_by_room,resident_averted_mean,ci95_low,ci95_high,relative_reduction,baseline_resident_infections']
    .concat(rows.map((r) => [`"${r.variant}"`, Object.entries(r.allocation).map(([k, v]) => `${k}:${v}`).join(' '), f(r.residentAverted), f(r.ci95[0]), f(r.ci95[1]), f(r.relativeReduction), f(r.baseline)].join(','))).join('\n') + '\n');
  for (const r of rows) console.log(`${r.variant}: ${f(r.residentAverted)} [${f(r.ci95[0])}, ${f(r.ci95[1])}] (${(100 * r.relativeReduction).toFixed(0)}%) ${JSON.stringify(r.byType)}`);
}

// Calibration check on independent seed sets (not used in the fit).
//   node src/cli.js check [--pathogen covid] [--seeds 400] [--starts 50001,70001] --out results
function cmdCheck(args) {
  const pathogen = args.pathogen || 'covid';
  const n = +(args.seeds || 400), starts = String(args.starts || '50001,70001').split(',').map(Number);
  const sc = scenarios(defaultConfig(pathogen));
  const rows = [];
  for (const name of ['cautious', 'central', 'favourable']) for (const start of starts) {
    const m = calibrationMetrics(sc[name], { seasonSeeds: { start, count: n } }).season;
    rows.push({ scenario: name, seeds: [start, start + n - 1], ...m });
    console.log(`${name} seeds ${start}+${n}: AR ${m.attackRate.toFixed(4)} share ${m.closeShare.toFixed(3)} outbreak median AR ${m.outbreakMedianAR.toFixed(3)} (IQR ${m.outbreakQ25AR.toFixed(3)}-${m.outbreakQ75AR.toFixed(3)}) staff AR in outbreaks (median) ${m.outbreakMedianStaffAR.toFixed(3)} staff season AR ${m.staffAttackRate.toFixed(3)} outbreaks/season ${m.outbreaksPerSeason.toFixed(2)}`);
  }
  const dir = args.out && args.out !== true ? args.out : 'results';
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${pathogen}-calibration-check.json`), JSON.stringify({ pathogen, targets: { attackRate: calibrationTargetValue(pathogen, sc.central), outbreakMedianAR: 0.21 }, rows }, null, 1));
}

const cmds = { sensitivity: cmdSensitivity, check: cmdCheck, outcomes: cmdOutcomes, study: cmdStudy, compare: cmdCompare, rank: cmdRank, trial: cmdTrial, sweep: cmdSweep, baseline: cmdBaseline, calibrate: cmdCalibrate };
if (!cmds[cmd]) {
  console.error('usage: node src/cli.js <compare|rank|trial|sweep|baseline> [options]  (see header of src/cli.js)');
  process.exit(1);
}
cmds[cmd](args);
