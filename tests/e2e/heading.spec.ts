// Tecton page heading (`Heading` and its parts) in a real browser: the title's buttons, the tabs,
// reflow at narrow widths, RTL and axe. Scenario: tests/e2e/harness/src/HeadingScenario.tsx. Visual
// parity with the Storybook "Organisms/Heading" stories is checked in storybook-parity.spec.ts.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page, query = '') => {
  await page.goto(`/?scenario=heading${query}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
};

const box = async (page: Page, selector: string) => {
  const rect = await page.locator(selector).first().boundingBox();
  if (!rect) throw new Error(`${selector} is not rendered`);
  return rect;
};

test.describe('Heading', () => {
  test('the title is a heading: the page title an h1, a section title an h2', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portfolio');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Wells');
    // `component="header"` renders the root as a <header>.
    await expect(page.getByTestId('page-heading')).toHaveJSProperty('tagName', 'HEADER');
  });

  test('the home button and the menu button; the menu switches the title', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page.getByTestId('event-log')).toHaveText('home');

    // The open menu is modal: it hides the rest of the page from assistive technology.
    const menuButton = page.getByRole('button', { name: 'Switch portfolio', includeHidden: true });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu', { name: 'Portfolios' })).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('menuitem', { name: 'North Sea' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('North Sea');
    await expect(page.getByRole('menu')).toBeHidden();
    // The menu gives focus back to the button that opened it.
    await expect(menuButton).toBeFocused();
  });

  test('Tab order follows the row; arrow keys move between tabs', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Home' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Switch portfolio' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Framing' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tab', { name: 'Framing' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByTestId('section')).toHaveText('Framing');
    // One tab stop for the tab list, then the actions.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Search' })).toBeFocused();
  });

  test('one row when it fits; it reflows without horizontal scrolling down to 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await open(page);
    const root = '[data-testid="page-heading"]';
    const tabs = `${root} .TectonHeading-tabs`;
    const actions = `${root} .TectonHeading-actions`;

    // Wide: title, tabs and actions share one row, the actions at its end (72px gutter).
    let [rootBox, tabsBox, actionsBox] = await Promise.all([
      box(page, root),
      box(page, tabs),
      box(page, actions),
    ]);
    expect(actionsBox.y + actionsBox.height / 2).toBeCloseTo(tabsBox.y + tabsBox.height / 2, 0);
    expect(rootBox.x + rootBox.width - (actionsBox.x + actionsBox.width)).toBeCloseTo(72, 0);

    // Narrower: the actions move to a line of their own, still at the end.
    await page.setViewportSize({ width: 1100, height: 800 });
    [rootBox, tabsBox, actionsBox] = await Promise.all([
      box(page, root),
      box(page, tabs),
      box(page, actions),
    ]);
    expect(actionsBox.y).toBeGreaterThanOrEqual(tabsBox.y + tabsBox.height);
    expect(rootBox.x + rootBox.width - (actionsBox.x + actionsBox.width)).toBeCloseTo(72, 0);

    // Down to 320px (WCAG 1.4.10 Reflow), nothing overflows the page: the tab group wraps its pills
    // onto more rows and the actions wrap.
    for (const width of [900, 600, 375, 320]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
    for (const name of ['Overview', 'Analytics']) {
      await expect(page.getByRole('tab', { name })).toBeInViewport();
    }
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeInViewport();
  });

  test('RTL: the row runs right to left, the actions at its left end', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await open(page, '&dir=rtl');
    const root = '[data-testid="page-heading"]';
    const [rootBox, titleBox, actionsBox] = await Promise.all([
      box(page, root),
      box(page, `${root} .TectonHeading-title`),
      box(page, `${root} .TectonHeading-actions`),
    ]);
    expect(rootBox.x + rootBox.width - (titleBox.x + titleBox.width)).toBeCloseTo(72, 0);
    expect(actionsBox.x - rootBox.x).toBeCloseTo(72, 0);
  });

  for (const mode of ['light', 'dark'] as const) {
    for (const dir of ['ltr', 'rtl'] as const) {
      test(`axe (${mode}, ${dir}): no serious or critical violations`, async ({ page }) => {
        await open(page, `&mode=${mode}&dir=${dir}`);
        const analyze = async () => {
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          return results.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`));
        };
        expect(await analyze()).toEqual([]);
        await page.getByRole('button', { name: 'Switch portfolio' }).click();
        await expect(page.getByRole('menu')).toBeVisible();
        // Wait for the menu's fade-in: half-transparent items would fail the contrast check.
        await expect(page.locator('.MuiMenu-paper')).toHaveCSS('opacity', '1');
        expect(await analyze()).toEqual([]);
      });
    }
  }
});
