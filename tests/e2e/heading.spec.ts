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

  test('one row: the actions collapse first, then the tabs; the primary action stays', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await open(page);
    const overflow = page.getByRole('button', { name: 'More actions' });
    const more = page.getByRole('tab', { name: 'More' });
    const create = page.getByRole('button', { name: 'Create Project' });
    // Everything fits.
    await expect(page.getByRole('tab')).toHaveCount(7);
    await expect(overflow).toHaveCount(0);
    await expect(more).toHaveCount(0);

    // The actions fold into the overflow menu first, the select before the search; every tab stays.
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(overflow).toBeVisible();
    await expect(page.getByText('Sort:')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(create).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(7);

    // Then the last tabs go into the More tab, at the end of the tab list.
    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(more).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Analytics' })).toHaveCount(0);
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

  test('the More tab lists the hidden tabs; a pick selects it, and the More tab with it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await open(page);
    // The open menu is modal: it hides the rest of the page from assistive technology.
    const more = page.getByRole('tab', { name: 'More', includeHidden: true });
    await expect(more).toHaveAttribute('aria-haspopup', 'menu');
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('menu');
    await menu.getByRole('menuitem', { name: 'Analytics' }).click();
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(page.getByTestId('section')).toHaveText('Analytics');
    // The open tab is in the More menu: the More tab is selected, and keeps the focus.
    await expect(more).toHaveAttribute('aria-selected', 'true');
    await expect(more).toBeFocused();
    await more.click();
    await expect(page.getByRole('menuitem', { name: 'Analytics' })).toHaveClass(/Mui-selected/);
    // Escape closes the menu and gives the focus back to the More tab.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(more).toBeFocused();
  });

  test('the overflow menu lists the folded actions; the search opens back in the row', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await open(page);
    const overflow = page.getByRole('button', { name: 'More actions', includeHidden: true });
    await expect(overflow).toHaveAttribute('aria-haspopup', 'menu');
    await overflow.click();
    await expect(overflow).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('menu', { name: 'More actions' });
    await expect(menu.getByRole('menuitem')).toHaveText(['Search']);
    await expect(menu.getByRole('menuitemradio')).toHaveText(['Recent', 'Name']);
    await expect(menu.getByRole('menuitemradio', { name: 'Recent' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // A pick closes the menu; the select's value follows.
    await menu.getByRole('menuitemradio', { name: 'Name' }).click();
    await expect(menu).toBeHidden();
    await expect(overflow).toBeFocused();
    await overflow.click();
    await expect(menu.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    // The search comes back to the row, open; closed again, it folds and ⋮ has the focus.
    await menu.getByRole('menuitem', { name: 'Search' }).click();
    const field = page.getByRole('search', { name: 'Search' }).getByRole('textbox');
    await expect(field).toBeFocused();
    await page.keyboard.type('north');
    await expect(page.getByTestId('projects')).toHaveText('North Sea Infill');
    await page.keyboard.press('Escape');
    await expect(field).toHaveValue('');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('search')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Search' })).toHaveCount(0);
    await expect(overflow).toBeFocused();
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`the search field grows out of its button toward the start of the row (${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1600, height: 800 });
      await open(page, `&dir=${dir}`);
      const button = (await page.getByRole('button', { name: 'Search' }).boundingBox())!;
      // Every frame of the opening: the field's box, from the click on.
      await page.evaluate(() => {
        const frames: { left: number; right: number; width: number }[] = [];
        (window as unknown as { frames_: typeof frames }).frames_ = frames;
        document.addEventListener(
          'click',
          () => {
            const start = performance.now();
            const sample = (time: number) => {
              const field = document.querySelector('.TectonHeading-searchField');
              if (field) {
                const { left, right, width } = field.getBoundingClientRect();
                frames.push({ left, right, width });
              }
              if (time - start < 400) requestAnimationFrame(sample);
            };
            requestAnimationFrame(sample);
          },
          { once: true, capture: true },
        );
      });
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.locator('.TectonHeading-searchField')).not.toHaveAttribute(
        'data-overflow-growing',
      );
      const frames = await page.evaluate(
        () =>
          (window as unknown as { frames_: { left: number; right: number; width: number }[] })
            .frames_,
      );
      // It starts at the button's width and widens frame by frame to its own (240px)...
      expect(frames[0]!.width).toBeLessThan(60);
      expect(frames.at(-1)!.width).toBeCloseTo(240, 0);
      expect(frames.filter((f) => f.width > 60 && f.width < 230).length).toBeGreaterThan(2);
      frames.slice(1).forEach((f, i) => expect(f.width).toBeGreaterThanOrEqual(frames[i]!.width));
      // ...from the button's end edge, which stays put: toward the left in LTR, the right in RTL.
      for (const f of frames) {
        if (dir === 'ltr') expect(f.right).toBeCloseTo(button.x + button.width, 0);
        else expect(f.left).toBeCloseTo(button.x, 0);
      }
    });
  }

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
    // The field takes the room of some tabs; the primary action stays, the row stays one row.
    await expect(page.getByRole('tab', { name: 'More' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible();
    await expect(field).toBeFocused();
    await expect(field).toHaveValue('sea');
    await expect(page.getByTestId('page-heading')).not.toHaveClass(/TectonHeading-compact/);
    // Narrower still: the field stays put while everything else collapses (once the heading has
    // laid itself out again after the resize).
    await page.setViewportSize({ width: 700, height: 800 });
    await expect(field).toBeVisible();
    await expect(field).toHaveValue('sea');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
      .toBeLessThanOrEqual(0);
  });

  test('an open search keeps its gap before the tabs; the title shortens instead', async ({
    page,
  }) => {
    // Too narrow for the title, the More tab and the open field together: the title gives way.
    await page.setViewportSize({ width: 900, height: 800 });
    await open(page);
    await page.getByRole('button', { name: 'More actions' }).click();
    await page.getByRole('menu', { name: 'More actions' }).getByRole('menuitem').click();
    await expect(page.getByRole('search', { name: 'Search' }).getByRole('textbox')).toBeFocused();
    const layout = () =>
      page.evaluate(() => {
        const heading = document.querySelector('[data-testid="page-heading"]')!;
        const field = heading.querySelector('.TectonHeading-searchField')!.getBoundingClientRect();
        const tabs = heading.querySelector('.TectonHeading-tabGroup')!.getBoundingClientRect();
        const title = heading.querySelector('h1')!;
        return {
          gap: Math.round(field.left - tabs.right),
          titleShortened: title.scrollWidth > title.clientWidth,
        };
      });
    // The space between two actions (space-200), not a field against the tabs.
    await expect.poll(layout).toEqual({ gap: 16, titleShortened: true });
  });

  test('narrow: actions that wrap onto a line of their own start where the title starts', async ({
    page,
  }) => {
    // Too narrow for the open field beside the title: the actions take a line of their own. The
    // gap before the actions is the row's column gap, so it does not indent that line.
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('search', { name: 'Search' }).getByRole('textbox')).toBeFocused();
    const layout = () =>
      page.evaluate(() => {
        const heading = document.querySelector('[data-testid="page-heading"]')!;
        const title = heading.querySelector('[data-heading-part="title"]')!.getBoundingClientRect();
        const actions = heading
          .querySelector('[data-heading-part="actions"]')!
          .getBoundingClientRect();
        const field = heading.querySelector('.TectonHeading-searchField')!.getBoundingClientRect();
        return {
          ownLine: actions.top >= title.bottom - 1,
          indent: Math.round(field.left - title.left),
        };
      });
    await expect.poll(layout).toEqual({ ownLine: true, indent: 0 });
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
    // Narrow: the tabs are one dropdown, named after the open tab; the primary action an icon.
    await expect(page.getByRole('tab')).toHaveCount(1);
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-haspopup',
      'menu',
    );
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Create Project' })).toHaveClass(
      /MuiIconButton-root/,
    );

    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), {
          message: `horizontal overflow at ${width}px`,
        })
        .toBeLessThanOrEqual(0);
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
    await page.setViewportSize({ width: 1200, height: 800 });
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
        // Gone, not fading out: half-transparent items would fail the contrast check.
        await expect(page.locator('.MuiMenu-paper')).toHaveCount(0);

        // Collapsed: the More tab's menu and the overflow menu.
        await page.setViewportSize({ width: 1000, height: 800 });
        await page.getByRole('tab', { name: 'More' }).click();
        await shown('[role="menu"]');
        expect(await analyze()).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.locator('.MuiMenu-paper')).toHaveCount(0);
        await page.getByRole('button', { name: 'More actions' }).click();
        await shown('[role="menu"]');
        expect(await analyze()).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(page.locator('.MuiMenu-paper')).toHaveCount(0);

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
