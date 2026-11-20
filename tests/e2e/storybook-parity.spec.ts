// Visual parity with the official Tecton Storybook (storybook-mui 0.10.1, Tecton 0.11.2).
//
// Each case renders a Storybook story from the public Tecton CDN and our reproduction of it
// (`/?scenario=sb:<story-id>`, see tests/e2e/harness/src/storybook) at the same viewport, mode and
// device scale, then compares the two screenshots pixel by pixel. The Storybook bundles MUI 9 /
// MUI X 9 with the same Tecton theme source, so differences are regressions in our theme layer
// (compat, adapter patches) or in our own components. Findings: tests/e2e/storybook-parity/REPORT.md.
//
// The suite needs the CDN. It is skipped when the CDN is unreachable, unless
// STORYBOOK_PARITY_REQUIRED=1 (set it in CI). Behind a proxy, run with NODE_USE_ENV_PROXY=1.
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const SB_BASE = 'https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/storybook-mui/0.10.1';
const TECTON_UMD =
  'https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-mui/0.11.2/index.umd.js';
const VIEWPORT = { width: 1280, height: 900 };
/** A pixel differs when one RGB channel differs by more than this (anti-aliasing noise is lower). */
const CHANNEL_THRESHOLD = 24;
/** Default share of differing pixels a story may have. */
const DEFAULT_TOLERANCE = 0.0005;

interface ParityCase {
  /** Storybook story id. */
  id: string;
  /** Our scenario to compare with it; defaults to the reproduction of the same story. */
  ours?: string;
  /** Share of differing pixels allowed (default DEFAULT_TOLERANCE). */
  tolerance?: number;
}

// Representative stories (atoms, molecules, organisms, pickers, tree view). Each one matched the
// Storybook exactly in both modes when the suite was written.
const CASES: ParityCase[] = [
  { id: 'atoms-avatar--sizes' },
  { id: 'atoms-badge--colors' },
  { id: 'atoms-breadcrumbs--icons' },
  { id: 'atoms-button--primary' },
  { id: 'atoms-button--outlined' },
  { id: 'atoms-button--activated' },
  { id: 'atoms-button--working' },
  { id: 'atoms-checkbox--labeled' },
  { id: 'atoms-chip--filled' },
  { id: 'atoms-chip--outlined' },
  { id: 'atoms-divider--labeled' },
  { id: 'atoms-fab--colors' },
  { id: 'atoms-icon--sizes' },
  { id: 'atoms-link--with-icon' },
  { id: 'atoms-progress--linear' },
  { id: 'atoms-radio-group--horizontal' },
  { id: 'atoms-rating--sizes' },
  { id: 'atoms-switch--labeled' },
  { id: 'molecules-accordion--standard' },
  { id: 'molecules-alert--filled' },
  { id: 'molecules-alert--outlined' },
  { id: 'molecules-autocomplete--single-closed' },
  { id: 'molecules-button-group--primary' },
  { id: 'molecules-card--outlined' },
  { id: 'molecules-list--states' },
  { id: 'molecules-menu--dense' },
  { id: 'molecules-select--examples' },
  { id: 'molecules-select--filled' },
  { id: 'molecules-select--open' },
  { id: 'molecules-select--outlined' },
  { id: 'molecules-select--playground' },
  { id: 'molecules-select--standard' },
  { id: 'molecules-select--states' },
  { id: 'molecules-slider--marks' },
  { id: 'molecules-tabs--medium' },
  { id: 'molecules-textfield--states' },
  { id: 'molecules-toggle-button--sizes' },
  { id: 'organisms-appbar--primary' },
  { id: 'organisms-heading--page' },
  { id: 'organisms-date--sizes' },
  { id: 'organisms-date--range' },
  { id: 'organisms-date--month-view' },
  { id: 'organisms-tree-view--standard' },
  { id: 'organisms-tree-view--multi-select' },
  // Our own advanced components against the closest Storybook story.
  // RichTreeView (items + custom item slot) renders the Standard / Multi select trees identically.
  { id: 'organisms-tree-view--standard', ours: 'extra-tree--rich-standard' },
  { id: 'organisms-tree-view--multi-select', ours: 'extra-tree--rich-multi-select' },
  // StaticDateRangePicker vs the "Range" story (a StaticDatePicker): same layout, header, grid,
  // selected endpoint and action bar; only the caption and toolbar texts (and the month switch
  // chevron, a view the range calendar does not offer) differ.
  { id: 'organisms-date--range', ours: 'extra-pickers--range-single-endpoint', tolerance: 0.006 },
];

const FREEZE_CSS =
  '*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;caret-color:transparent!important}';

let cdnReachable = true;
test.beforeAll(async ({ request }) => {
  // Node's fetch honors HTTP(S)_PROXY with NODE_USE_ENV_PROXY=1; Playwright's request does not.
  const probes = [
    async () => (await fetch(`${SB_BASE}/index.json`, { signal: AbortSignal.timeout(15_000) })).ok,
    async () => (await request.get(`${SB_BASE}/index.json`, { timeout: 15_000 })).ok(),
  ];
  cdnReachable = false;
  for (const probe of probes) {
    try {
      if (await probe()) {
        cdnReachable = true;
        return;
      }
    } catch {
      // try the next probe
    }
  }
});

async function fetchText(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

/**
 * Storybook runs each story's `play` function (clicks, typing, hovers) after rendering. Strip them
 * from the story bundles so both sides are compared in their initial render state.
 */
async function disablePlayFunctions(context: BrowserContext) {
  await context.route(/storybook-mui\/0\.10\.1\/assets\/.*\.stories-.*\.js$/, async (route) => {
    let body: string;
    try {
      body = await fetchText(route.request().url());
    } catch {
      body = await (await route.fetch()).text();
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: body.replace(/\bplay:async/g, '_play:async'),
    });
  });
}

async function settle(page: Page, readySelector: string) {
  await page.waitForSelector(readySelector, { timeout: 30_000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(() => document.fonts.ready);
  // Same as the Storybook preview's afterEach: nothing keeps focus or hover.
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) active.blur();
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
}

async function shoot(page: Page, url: string, readySelector: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  try {
    await page.waitForSelector(readySelector, { timeout: 30_000 });
  } catch {
    // A dev server that is re-optimizing dependencies can drop the first load; retry once.
    await page.reload({ waitUntil: 'networkidle' });
  }
  await settle(page, readySelector);
  return page.screenshot({ fullPage: true, animations: 'disabled' });
}

/** Pixel comparison in the browser (no image library needed). */
async function compare(page: Page, expected: Buffer, actual: Buffer) {
  return page.evaluate(
    async ([a, b, threshold]) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = `data:image/png;base64,${src}`;
        });
      const [ia, ib] = await Promise.all([load(a as string), load(b as string)]);
      const w = Math.max(ia.width, ib.width);
      const h = Math.max(ia.height, ib.height);
      const pixels = (img: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const da = pixels(ia);
      const db = pixels(ib);
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const octx = out.getContext('2d')!;
      const diffImage = octx.createImageData(w, h);
      let diff = 0;
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.max(
          Math.abs(da[i] - db[i]),
          Math.abs(da[i + 1] - db[i + 1]),
          Math.abs(da[i + 2] - db[i + 2]),
        );
        if (d > (threshold as number)) {
          diff += 1;
          diffImage.data.set([255, 0, 0, 255], i);
        } else {
          const g = 200 + (da[i] + da[i + 1] + da[i + 2]) / 15;
          diffImage.data.set([g, g, g, 255], i);
        }
      }
      octx.putImageData(diffImage, 0, 0);
      return {
        ratio: diff / (w * h),
        sameSize: ia.width === ib.width && ia.height === ib.height,
        size: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`,
        diffPng: out.toDataURL('image/png').split(',')[1],
      };
    },
    [expected.toString('base64'), actual.toString('base64'), CHANNEL_THRESHOLD] as const,
  );
}

for (const mode of ['light', 'dark'] as const) {
  test.describe(`Storybook parity (${mode})`, () => {
    for (const { id, ours: oursId = id, tolerance = DEFAULT_TOLERANCE } of CASES) {
      test(oursId === id ? id : `${id} vs ${oursId}`, async ({ browser, baseURL }, testInfo) => {
        test.skip(
          !cdnReachable && process.env.STORYBOOK_PARITY_REQUIRED !== '1',
          'Tecton Storybook CDN unreachable',
        );
        test.setTimeout(120_000);
        const context = await browser.newContext({
          viewport: VIEWPORT,
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        await context.addInitScript((m) => {
          try {
            localStorage.setItem('tecton-theme-mode', m);
          } catch {
            // storage unavailable: the default mode applies
          }
        }, mode);
        await disablePlayFunctions(context);
        const page = await context.newPage();
        try {
          const storybook = await shoot(
            page,
            `${SB_BASE}/iframe.html?id=${id}&viewMode=story&theme=${mode}&tectonVersion=0.11.2&tectonSrc=${encodeURIComponent(TECTON_UMD)}`,
            '#storybook-root > *',
          );
          const ours = await shoot(
            page,
            `${baseURL}/?scenario=sb:${oursId}&mode=${mode}`,
            '[data-testid="sb-root"] *',
          );
          const result = await compare(page, storybook, ours);
          if (result.ratio > tolerance || !result.sameSize) {
            await testInfo.attach('storybook.png', { body: storybook, contentType: 'image/png' });
            await testInfo.attach('ours.png', { body: ours, contentType: 'image/png' });
            await testInfo.attach('diff.png', {
              body: Buffer.from(result.diffPng, 'base64'),
              contentType: 'image/png',
            });
          }
          expect(result.sameSize, `page size ${result.size}`).toBe(true);
          expect(result.ratio, `differing pixels in ${id} (${mode})`).toBeLessThanOrEqual(
            tolerance,
          );
        } finally {
          await context.close();
        }
      });
    }
  });
}
