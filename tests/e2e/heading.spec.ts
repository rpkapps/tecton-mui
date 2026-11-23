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

/** The heading's tab scroll arrows, start and end. */
const arrow = (page: Page, index: number) =>
  page.locator('[data-testid="page-heading"] .TectonHeading-scrollButton').nth(index);
const shownArrows = (page: Page) =>
  page.locator('[data-testid="page-heading"] .TectonHeading-scrollButton:not(.Mui-disabled)');

/** Whether a tab is wholly within the tab strip's view. */
const inStrip = (page: Page, name: string) =>
  page.getByRole('tab', { name }).evaluate((tab) => {
    const view = tab.closest('.MuiTabs-scroller')!.getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    return rect.left >= view.left - 1 && rect.right <= view.right + 1;
  });

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
    await page.setViewportSize({ width: 1600, height: 800 });
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

  test('one row: the actions collapse first, then the tabs scroll; the primary action stays', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await open(page);
    const overflow = page.getByRole('button', { name: 'More actions' });
    const create = page.getByRole('button', { name: 'Create Project' });
    // Everything fits: no overflow button, no scroll arrow.
    await expect(page.getByRole('tab')).toHaveCount(7);
    await expect(overflow).toHaveCount(0);
    await expect(shownArrows(page)).toHaveCount(0);
    expect(await inStrip(page, 'Analytics')).toBe(true);

    // The secondary actions go into the overflow button first, the search last of them; every tab
    // stays in view.
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(overflow).toBeVisible();
    await expect(page.getByText('Sort:')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(create).toBeVisible();
    await expect(shownArrows(page)).toHaveCount(0);

    // Then the tabs narrow and scroll, as the app bar's do: the end arrow shows.
    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(shownArrows(page)).toHaveCount(1);
    await expect(page.getByRole('tab')).toHaveCount(7);
    expect(await inStrip(page, 'Overview')).toBe(true);
    expect(await inStrip(page, 'Analytics')).toBe(false);
    await expect(create).toBeVisible();

    // Still one row: the parts share a center line, and nothing passes the gutters.
    const rows = await page.getByTestId('page-heading').evaluate((heading) => {
      const centers = Array.from(heading.children).map((child) => {
        const rect = child.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      const last = heading.lastElementChild!.getBoundingClientRect();
      return {
        spread: Math.max(...centers) - Math.min(...centers),
        endGap: heading.getBoundingClientRect().right - last.right,
      };
    });
    expect(rows.spread).toBeLessThan(1);
    expect(rows.endGap).toBeCloseTo(72, 0);
    await expect(page.getByTestId('page-heading')).not.toHaveClass(/TectonHeading-compact/);
  });

  test('the tab arrows page by whole tabs; a selected tab slides into view', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await open(page);
    const [start, end] = [arrow(page, 0), arrow(page, 1)];
    await expect(start).toHaveClass(/Mui-disabled/);
    await expect(end).not.toHaveClass(/Mui-disabled/);
    const group = page.locator('[data-testid="page-heading"] .TectonHeading-tabGroup');
    // At the start, the tabs fade out toward the end only.
    await expect(group).toHaveAttribute('data-fade', 'right');
    await expect(group.locator('.MuiTabs-scroller')).toHaveCSS('mask-image', /linear-gradient/);
    // A page: the tab cut off at the end comes to the start, clear of the start's fade; both arrows
    // show mid-strip, and both edges fade.
    await end.click();
    await expect(start).not.toHaveClass(/Mui-disabled/);
    await expect(group).toHaveAttribute('data-fade', 'both');
    await expect.poll(() => inStrip(page, 'Overview')).toBe(false);
    await expect.poll(() => inStrip(page, 'Builder')).toBe(true);
    const clearOfFade = await page.getByRole('tab', { name: 'Builder' }).evaluate((tab) => {
      const view = tab.closest('.MuiTabs-scroller')!.getBoundingClientRect();
      return tab.getBoundingClientRect().left - view.left;
    });
    expect(clearOfFade).toBeGreaterThanOrEqual(23);
    await start.click();
    await expect.poll(() => inStrip(page, 'Overview')).toBe(true);
    await expect(start).toHaveClass(/Mui-disabled/);
    await expect(group).toHaveAttribute('data-fade', 'right');

    // The keyboard reaches every tab; the selected one slides into view.
    await page.getByRole('tab', { name: 'Overview' }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Analytics' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('section')).toHaveText('Analytics');
    await expect.poll(() => inStrip(page, 'Analytics')).toBe(true);
    await expect(end).toHaveClass(/Mui-disabled/);
    await expect(start).not.toHaveClass(/Mui-disabled/);
  });

  test('the overflow tray holds the hidden actions as they are; the search opens in it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await open(page);
    const overflow = page.getByRole('button', { name: 'More actions', includeHidden: true });
    await overflow.click();
    await expect(overflow).toHaveAttribute('aria-expanded', 'true');
    const tray = page.getByRole('dialog', { name: 'More actions' });
    await expect(tray.getByText('Sort:')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tray).toBeHidden();
    await expect(overflow).toBeFocused();

    // The search opens in the tray, which stays open; its Escapes stay in the field.
    await overflow.click();
    await tray.getByRole('button', { name: 'Search' }).click();
    await expect(tray.getByRole('textbox', { name: 'Search' })).toBeFocused();
    await page.keyboard.type('north');
    await expect(page.getByTestId('projects')).toHaveText('North Sea Infill');
    await page.keyboard.press('Escape');
    await expect(tray.getByRole('textbox', { name: 'Search' })).toHaveValue('');
    await page.keyboard.press('Escape');
    await expect(tray.getByRole('button', { name: 'Search' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(tray).toBeHidden();
    await expect(overflow).toBeFocused();
  });

  test('the search opens into a field that filters; Escape clears, then closes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await open(page);
    const projects = page.getByTestId('projects').getByRole('listitem');
    await expect(projects).toHaveCount(4);
    const button = page.getByRole('button', { name: 'Search' });
    await button.click();
    const field = page.getByRole('search', { name: 'Search' }).getByRole('textbox');
    await expect(field).toBeFocused();
    await page.keyboard.type('gulf');
    await expect(projects).toHaveText(['Gulf Appraisal']);
    // The field keeps a search in progress when the focus leaves it.
    await page.getByRole('tab', { name: 'Team' }).click();
    await expect(field).toHaveValue('gulf');
    await field.focus();
    await page.keyboard.press('Escape');
    await expect(field).toHaveValue('');
    await expect(projects).toHaveCount(4);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('search')).toHaveCount(0);
    await expect(button).toBeFocused();
    // Empty, it closes when the focus leaves it.
    await button.click();
    await page.getByRole('tab', { name: 'Overview' }).click();
    await expect(page.getByRole('search')).toHaveCount(0);
  });

  test('an open search keeps its place: the other actions and tabs make room', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    await expect(page.getByRole('tab')).toHaveCount(7);
    await page.getByRole('button', { name: 'Search' }).click();
    const field = page.getByRole('search', { name: 'Search' }).getByRole('textbox');
    await expect(field).toBeFocused();
    await page.keyboard.type('sea');
    // The field takes room from the tabs, which scroll; the primary action stays, the row stays
    // one row.
    await expect(shownArrows(page)).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible();
    await expect(field).toBeFocused();
    await expect(field).toHaveValue('sea');
    await expect(page.getByTestId('page-heading')).not.toHaveClass(/TectonHeading-compact/);
    // Narrower still: the field stays put while everything else collapses.
    await page.setViewportSize({ width: 700, height: 800 });
    await expect(field).toBeVisible();
    await expect(field).toHaveValue('sea');
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflowX).toBeLessThanOrEqual(0);
  });

  test('compact: the tabs get a row of their own; nothing overflows down to 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await open(page);
    const heading = page.getByTestId('page-heading');
    await expect(heading).toHaveClass(/TectonHeading-compact/);
    const root = '[data-testid="page-heading"]';
    const [title, group, overflow] = await Promise.all([
      box(page, `${root} .TectonHeading-title`),
      box(page, `${root} .TectonHeading-tabGroup`),
      box(page, `${root} .TectonHeading-overflowButton`),
    ]);
    // A narrow heading has narrow gutters (space-200), whatever the window's width.
    const rootBox = await box(page, root);
    expect(title.x - rootBox.x).toBeCloseTo(16, 0);
    // Title and actions on the first row, the tabs below.
    expect(overflow.y + overflow.height / 2).toBeCloseTo(title.y + title.height / 2, 0);
    expect(group.y).toBeGreaterThanOrEqual(title.y + title.height);
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeInViewport();
    // The tab row scrolls: its end arrow shows, within the page.
    await expect(shownArrows(page)).toHaveCount(1);
    await expect(shownArrows(page)).toBeInViewport();

    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 800 });
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflowX, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }

    // Wide again: one row with everything.
    await page.setViewportSize({ width: 1600, height: 800 });
    await expect(heading).not.toHaveClass(/TectonHeading-compact/);
    await expect(page.getByRole('tab')).toHaveCount(7);
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
    // Collapsed, the overflow button comes first: on the right of the primary action.
    await page.setViewportSize({ width: 1280, height: 800 });
    const [overflow, create] = await Promise.all([
      box(page, `${root} .TectonHeading-overflowButton`),
      page.getByRole('button', { name: 'Create Project' }).boundingBox(),
    ]);
    expect(overflow.x).toBeGreaterThan(create!.x);
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
        // Wait for a popup's fade-in: half-transparent items would fail the contrast check.
        const shown = async (popup: string) => {
          await expect(page.locator(`.MuiPopover-paper:has(${popup})`)).toHaveCSS('opacity', '1');
        };
        expect(await analyze()).toEqual([]);
        await page.getByRole('button', { name: 'Switch portfolio' }).click();
        await shown('[role="menu"]');
        expect(await analyze()).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toBeHidden();

        // Collapsed: scrolling tabs and the overflow tray.
        await page.setViewportSize({ width: 1000, height: 800 });
        await expect(shownArrows(page)).toHaveCount(1);
        expect(await analyze()).toEqual([]);
        await page.getByRole('button', { name: 'More actions' }).click();
        await shown('.TectonHeading-overflowTray');
        expect(await analyze()).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();

        // An open search with text.
        await page.setViewportSize({ width: 1600, height: 800 });
        await page.getByRole('button', { name: 'Search' }).click();
        await page.keyboard.type('gulf');
        await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible();
        expect(await analyze()).toEqual([]);
      });
    }
  }
});
