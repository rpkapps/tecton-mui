#!/usr/bin/env node
// Browser sweep of the synced Material UI pages (run after a docs sync, against a built portal):
//   pnpm --filter @tecton-mui/docs build
//   pnpm --filter @tecton-mui/docs preview --port 4520 &
//   node tooling/docs-sync/verify-pages.mjs --url http://localhost:4520 [--slug button,...]
// Visits /components/<slug> for every synced slug in light and dark mode and fails on page errors,
// on demos that render nothing or hit their error boundary, and on missing demos.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const lock = JSON.parse(readFileSync(join(here, 'sync-lock.json'), 'utf8'));
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const base = (opt('--url') ?? 'http://localhost:4520').replace(/\/$/, '');
const only = opt('--slug')?.split(',');
const require = createRequire(join(here, '../../package.json'));
const { chromium } = require('playwright');

const slugs = Object.keys(lock.slugs).filter((s) => !only || only.includes(s));
const browser = await chromium.launch();
const failures = [];
let checked = 0;

for (const mode of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript((m) => {
    try {
      localStorage.setItem('tecton-theme-mode', m);
    } catch {
      // ignore
    }
  }, mode);
  for (const slug of slugs) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && /\[mui-docs\]/.test(m.text()))
        errors.push(`console: ${m.text()}`);
    });
    const url = `${base}/components/${slug}`;
    try {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForSelector('html[data-docs-ready] [data-mui-docs-attribution]', {
        timeout: 20000,
      });
      await page.waitForTimeout(400);
      const result = await page.evaluate(() => {
        const demos = [...document.querySelectorAll('[data-mui-demo]')];
        return {
          theme: document.documentElement.getAttribute('data-theme'),
          demos: demos.length,
          empty: demos
            .filter(
              (d) =>
                !d.textContent.trim() &&
                (!d.querySelector('*') || d.getBoundingClientRect().height < 1),
            )
            .map((d) => d.getAttribute('data-mui-demo')),
          failed: [...document.querySelectorAll('[data-mui-demo-error]')].map(
            (d) => `${d.getAttribute('data-mui-demo-error')}: ${d.textContent}`,
          ),
        };
      });
      if (result.theme !== mode) errors.push(`data-theme is ${result.theme}, expected ${mode}`);
      if (
        result.demos === 0 &&
        /<Demo /.test(
          readFileSync(
            join(here, `../../apps/docs/src/mui-docs/generated/pages/${slug}.tsx`),
            'utf8',
          ),
        )
      )
        errors.push('no demo rendered');
      result.empty.forEach((d) => errors.push(`empty demo: ${d}`));
      result.failed.forEach((d) => errors.push(`demo error: ${d}`));
      checked += result.demos;
    } catch (error) {
      errors.push(`load failed: ${error.message.split('\n')[0]}`);
    }
    if (errors.length) failures.push({ slug, mode, errors });
    console.log(
      `${errors.length ? 'FAIL' : 'ok  '} ${mode.padEnd(5)} ${slug}${errors.length ? `\n      ${errors.join('\n      ')}` : ''}`,
    );
    await page.close();
  }
  await context.close();
}
await browser.close();
console.log(
  `\n${slugs.length} slugs x 2 modes, ${checked} demo renders checked, ${failures.length} failing page(s).`,
);
process.exit(failures.length ? 1 : 0);
