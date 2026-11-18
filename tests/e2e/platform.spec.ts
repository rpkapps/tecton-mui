import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import exceptions from './a11y-exceptions.json' with { type: 'json' };
import tectonDefects from './a11y-tecton-defects.json' with { type: 'json' };

interface A11yException {
  rule: string;
  scenario: string;
  owner: string;
  rationale: string;
  approvedBy: string;
  followUp: string;
}
const approved = exceptions.exceptions as A11yException[];
interface TectonDefect {
  rule: string;
  selector: string;
  modes: string[];
  tokens: string;
}
const knownTecton = tectonDefects.defects as TectonDefect[];

test.describe('SSR and hydration', () => {
  test('server-rendered page hydrates without mismatches and keeps the stored dark mode', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('tecton-theme-mode', 'dark'));
    const consoleErrors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    // The server page records data-theme right after the inline mode script, before any module runs.
    await page.goto('/ssr');
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { __themeBeforeHydration: string | null }).__themeBeforeHydration,
      ),
    ).toBe('dark');
    expect(
      await page.evaluate(
        () => (window as unknown as { __hydrationErrors: string[] }).__hydrationErrors,
      ),
    ).toEqual([]);
    expect(consoleErrors.filter((e) => /hydrat/i.test(e))).toEqual([]);
    // Tokens were server-rendered with the runtime marker, so the runtime did not inject a second copy.
    expect(await page.locator('style[data-tecton="tokens"]').count()).toBe(1);
    const button = page.getByRole('button', { name: 'Clicked 0' });
    await button.click();
    await expect(page.getByRole('button', { name: 'Clicked 1' })).toBeVisible();
    // NumberField (Base UI) server-renders its formatted value and steps after hydration.
    const depth = page.getByLabel('Depth');
    await expect(depth).toHaveValue('1,200');
    await page.getByRole('button', { name: 'Increase' }).click();
    await expect(depth).toHaveValue('1,201');
    // The client-only Community Data Grid mounts after hydration.
    await expect(page.locator('.MuiDataGrid-root')).toBeVisible();
  });
});

test.describe('shared light/dark mode across independent React roots', () => {
  test('toggling in the shell updates the hosted MFE root; portals work across roots', async ({
    page,
  }) => {
    await page.goto('/?scenario=multi-root');
    const shell = page.getByTestId('panel-shell');
    const mfe = page.getByTestId('panel-mfe');
    await expect(mfe).toHaveAttribute('data-theme-mode', 'light');
    await shell.getByRole('button', { name: 'Toggle mode' }).click();
    await expect(mfe).toHaveAttribute('data-theme-mode', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('tecton-theme-mode'))).toBe('dark');
    await mfe.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Portal item' })).toBeVisible();
    await page.keyboard.press('Escape');
    // One CssBaseline (shell) only.
    const baselineRules = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('style[data-emotion]')).filter((s) =>
          /-webkit-text-size-adjust/.test(s.textContent ?? ''),
        ).length,
    );
    expect(baselineRules).toBe(1);
  });

  test('mode changes in another tab propagate through storage events', async ({ context }) => {
    const a = await context.newPage();
    const b = await context.newPage();
    await a.goto('/?scenario=multi-root');
    await b.goto('/?scenario=multi-root');
    await a.getByRole('button', { name: 'Toggle mode' }).click();
    await expect(b.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(b.getByTestId('panel-mfe')).toHaveAttribute('data-theme-mode', 'dark');
  });
});

test.describe('RTL', () => {
  test('flips layout, keeps pinned columns sticky on the leading edge', async ({ page }) => {
    await page.goto('/?scenario=grid:grouping&dir=rtl');
    const root = page.getByTestId('grid-grouping').locator('.MuiDataGrid-root');
    await expect(root).toBeVisible();
    const box = await root.boundingBox();
    // The left-pinned ("start") section renders at the right edge in RTL. The grouping column
    // joins the start section ahead of the pinned `name` column.
    const start = await root.locator('.MuiDataGrid-columnHeader--pinnedLeft').first().boundingBox();
    expect(start!.x + start!.width).toBeGreaterThan(box!.x + box!.width - 5);
    const name = await root.locator('.MuiDataGrid-columnHeader[data-field="name"]').boundingBox();
    expect(Math.abs(name!.x + name!.width - start!.x)).toBeLessThan(2);
    const direction = await page.evaluate(
      () => getComputedStyle(document.querySelector('.MuiDataGrid-root')!).direction,
    );
    expect(direction).toBe('rtl');
  });

  for (const scenario of ['showcase', 'pickers', 'grid:all', 'tree']) {
    test(`${scenario} renders in rtl without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(String(error)));
      await page.goto(`/?scenario=${scenario}&dir=rtl`);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
      await expect(page.locator('[dir="rtl"]').first()).toBeVisible();
    });
  }
});

const scenarios = ['showcase', 'grid:all', 'pickers', 'tree'];
for (const mode of ['light', 'dark'] as const) {
  for (const scenario of scenarios) {
    test(`axe: ${scenario} (${mode})`, async ({ page }) => {
      await page.goto(`/?scenario=${scenario}&mode=${mode}`);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking: string[] = [];
      const tecton: string[] = [];
      for (const v of results.violations) {
        if (v.impact !== 'serious' && v.impact !== 'critical') continue;
        if (
          approved.some((e) => e.rule === v.id && (e.scenario === '*' || e.scenario === scenario))
        )
          continue;
        for (const node of v.nodes) {
          const defect = knownTecton.find(
            (d) =>
              d.rule === v.id &&
              d.modes.includes(mode) &&
              (node.html.includes(d.selector) || node.target.join(' ').includes(d.selector)),
          );
          const label = `${v.id}: ${node.target.join(' ')} ${node.any[0]?.message ?? ''}`.slice(
            0,
            300,
          );
          if (defect) tecton.push(`${label} [${defect.tokens}]`);
          else blocking.push(label);
        }
      }
      // Tecton-originated defects are reported (unapproved, not compliant) but tracked separately
      // from implementation defects, as required by SPEC §11.3.
      for (const entry of [...new Set(tecton)]) {
        test
          .info()
          .annotations.push({ type: 'tecton-token defect (unapproved)', description: entry });
      }
      expect(blocking).toEqual([]);
    });
  }
}

test.describe('visual regression', () => {
  for (const mode of ['light', 'dark'] as const) {
    test(`showcase ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 1400, height: 1200 });
      await page.goto(`/?scenario=showcase&mode=${mode}`);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`showcase-${mode}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});
