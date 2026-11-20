// Shared by the page-test scripts in this folder (and web/captions.mjs): the browser, how to launch it, and the page.
// Run the scripts from the repository root, after `node web/build.mjs`: e.g. `node shots/err.mjs`.
//   PLAYWRIGHT  path or package name of Playwright, if `playwright` is not installed here (npm i -D playwright)
//   CHROME      path of a Chrome or Chromium to use, in place of Playwright's own
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let mod;
try { mod = await import(process.env.PLAYWRIGHT || 'playwright'); } catch { mod = await import('/opt/npm-tools/node_modules/playwright/index.mjs'); }
export const chromium = mod.chromium || mod.default.chromium;
const exe = process.env.CHROME || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : null);
export const CHROME = exe ? { executablePath: exe } : {};
// The built page inside the same wrapper the published artifact has (written by web/build.mjs).
export const PAGE = pathToFileURL(path.join(ROOT, 'shots', 'page.html')).href;
