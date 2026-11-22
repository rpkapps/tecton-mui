// Tecton app bar (React version of the `<wc-app-bar>` drop-in) in a real browser: the behaviour the
// drop-in Storybook's own interaction tests check, plus the keyboard additions. Scenarios come from
// tests/e2e/harness/src/storybook/stories/DropInsAppBar.tsx.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const open = async (page: Page, story: string, query = '') => {
  await page.goto(`/?scenario=sb:drop-ins-app-bar--${story}${query}`);
  await expect(page.getByRole('banner').first()).toBeVisible();
};
const tab = (page: Page, name: string | RegExp) => page.getByRole('tab', { name });

test.describe('Tecton app bar: drop-in behaviour', () => {
  test('select, add and close update the bar through the page', async ({ page }) => {
    await open(page, 'primary');
    await expect(page.getByText('APP', { exact: true })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(3);
    await tab(page, /Tab 2/).click();
    await expect(tab(page, /Tab 2/)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('event-log')).toHaveText(
      'Last event: wc-app-bar-tab-select {"id":"tab-2"}',
    );
    await page.getByRole('button', { name: 'Add tab' }).click();
    await expect(tab(page, /New tab 1/)).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: 'close tab' }).click();
    await expect(tab(page, /New tab 1/)).toHaveCount(0);
    await expect(tab(page, /Tab 2/)).toHaveAttribute('aria-selected', 'true');
  });

  test('tier="secondary" styles the bar without a tier attribute', async ({ page }) => {
    await open(page, 'secondary');
    const bar = page.locator('[data-region="app-bar"]').first();
    await expect(bar).not.toHaveAttribute('tier');
    await expect(bar.locator('.MuiToolbar-root')).toHaveCSS('height', '40px');
  });

  test('a click on an action reaches the page', async ({ page }) => {
    await open(page, 'primary');
    await page.getByRole('button', { name: 'notifications' }).click();
    await expect(page.getByText('Action "notifications" was clicked.')).toBeVisible();
  });

  test('max-tabs hides + once the cap is reached', async ({ page }) => {
    await open(page, 'tab-limits');
    const [capped, disabled] = [page.getByRole('banner').nth(0), page.getByRole('banner').nth(1)];
    await expect(disabled.getByRole('button', { name: 'Add tab' })).toHaveCount(0);
    await capped.getByRole('button', { name: 'Add tab' }).click();
    await capped.getByRole('button', { name: 'Add tab' }).click();
    await expect(capped.getByRole('button', { name: 'Add tab' })).toHaveCount(0);
    await expect(capped.getByRole('tab')).toHaveCount(4);
  });

  test('overflowing tabs scroll with the arrows; branding, + and actions stay in the bar', async ({
    page,
  }) => {
    await open(page, 'overflow');
    const bars = page.locator('[data-region="app-bar"]');
    for (let i = 0; i < 3; i += 1) {
      const bar = bars.nth(i);
      const box = (await bar.boundingBox())!;
      for (const part of [
        bar.getByRole('button', { name: 'Add tab' }),
        bar.locator('[data-slot="actions"]'),
      ]) {
        const b = (await part.boundingBox())!;
        expect(b.x).toBeGreaterThanOrEqual(box.x);
        expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
      }
    }
    const strip = bars.nth(0).locator('[data-region="tabs"]');
    const [start, end] = [
      strip.locator('.MuiTabs-scrollButtons').nth(0),
      strip.locator('.MuiTabs-scrollButtons').nth(1),
    ];
    await expect(start).toHaveClass(/Mui-disabled/);
    await expect(end).not.toHaveClass(/Mui-disabled/);
    for (
      let i = 0;
      i < 14 && !(await end.getAttribute('class'))?.includes('Mui-disabled');
      i += 1
    ) {
      await end.click();
      await page.waitForTimeout(400);
    }
    await expect(end).toHaveClass(/Mui-disabled/);
    await expect(start).not.toHaveClass(/Mui-disabled/);
    await expect(bars.nth(0).getByRole('tab', { name: /Tab 14$/ })).toBeInViewport();
  });
});

test.describe('Tecton app bar: keyboard', () => {
  test('arrow keys, Home and End move between tabs; Enter selects', async ({ page }) => {
    await open(page, 'primary');
    await tab(page, /Tab 1/).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, /Tab 2/)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tab(page, 'Home')).toBeFocused();
    await page.keyboard.press('End');
    await expect(tab(page, /Tab 2/)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(tab(page, /Tab 2/)).toHaveAttribute('aria-selected', 'true');
  });

  test('Tab moves from the active tab to its close button, + and the actions', async ({ page }) => {
    await open(page, 'primary');
    await tab(page, /Tab 1/).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'close tab' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Add tab' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'layers' })).toBeFocused();
  });

  test('Delete closes the active tab and focus moves to the newly active tab', async ({ page }) => {
    await open(page, 'primary');
    await tab(page, /Tab 2/).click();
    await expect(tab(page, /Tab 2/)).toHaveAttribute('aria-keyshortcuts', 'Delete');
    await page.keyboard.press('Delete');
    await expect(tab(page, /Tab 2/)).toHaveCount(0);
    await expect(tab(page, /Tab 1/)).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, /Tab 1/)).toBeFocused();
    await page.keyboard.press('Backspace');
    await expect(tab(page, /Tab 1/)).toHaveCount(0);
    // The host falls back to the first fixed tab.
    await expect(tab(page, 'Home')).toBeFocused();
  });

  test('closing with the close button keeps focus in the bar', async ({ page }) => {
    await open(page, 'primary');
    await tab(page, /Tab 1/).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(tab(page, /Tab 1/)).toHaveCount(0);
    await expect(tab(page, /Tab 2/)).toBeFocused();
  });

  test('focus moves to the new tab when + disappears at max-tabs', async ({ page }) => {
    await open(page, 'tab-limits');
    const capped = page.getByRole('banner').nth(0);
    await capped.getByRole('button', { name: 'Add tab' }).focus();
    await page.keyboard.press('Enter');
    await expect(capped.getByRole('button', { name: 'Add tab' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(capped.getByRole('button', { name: 'Add tab' })).toHaveCount(0);
    await expect(capped.getByRole('tab', { name: /New tab 2/ })).toBeFocused();
  });

  test('arrow keys follow the reading direction in RTL', async ({ page }) => {
    await open(page, 'primary', '&dir=rtl');
    await tab(page, /Tab 1/).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, /Tab 2/)).toBeFocused();
  });
});

/** Each visible close button covers its tab's empty slot exactly. */
async function expectCloseButtonsOnSlots(page: Page) {
  const offsets = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-region="tabs"]')).flatMap((tabs) => {
      const slot = tabs.querySelector('[role="tab"][aria-selected="true"] [data-close-slot]');
      const button = tabs.querySelector('button[aria-label="close tab"]');
      if (!slot && !button) return [];
      if (!slot || !button) return [Infinity];
      const a = slot.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      return [Math.abs(a.left - b.left), Math.abs(a.top - b.top), Math.abs(a.width - b.width)];
    }),
  );
  expect(offsets.length).toBeGreaterThan(0);
  for (const offset of offsets) expect(offset).toBeLessThan(0.01);
}

/** Arrow states (start, end; `e` enabled, `d` disabled) and scroll state of a bar's tab strip. */
const stripState = (bar: Locator) =>
  bar.evaluate((el) => {
    const tabs = el.querySelector('[data-region="tabs"]')!;
    const scroller = tabs.querySelector('.MuiTabs-scroller')!;
    const arrows = Array.from(tabs.querySelectorAll('.MuiTabs-scrollButtons'))
      .map((b) => (b.classList.contains('Mui-disabled') ? 'd' : 'e'))
      .join('');
    const tab = scroller.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    return {
      arrows,
      scrollLeft: Math.abs(scroller.scrollLeft),
      maxScroll: scroller.scrollWidth - scroller.clientWidth,
      // Sub-pixel layout can leave a fraction of a pixel outside the strip.
      selectedVisible: tab.left >= box.left - 1 && tab.right <= box.right + 1,
      // A tab wider than the strip is shown from its start edge (MUI's rule, like scrollIntoView).
      startShown:
        getComputedStyle(scroller).direction === 'rtl'
          ? Math.abs(tab.right - box.right) <= 1
          : Math.abs(tab.left - box.left) <= 1,
      // For the failure message: whether the tab can fit at all.
      tabWidth: Math.round(tab.width),
      stripWidth: Math.round(box.width),
    };
  });

/** Waits until a bar's tab strip has stopped sliding. */
async function stripIdle(bar: Locator) {
  let last = -1;
  await expect
    .poll(
      async () => {
        const { scrollLeft } = await stripState(bar);
        const still = scrollLeft === last;
        last = scrollLeft;
        return still;
      },
      { intervals: [150], timeout: 5000 },
    )
    .toBe(true);
}

/**
 * Opens a story and waits until the page has loaded (fonts included) and the tab strips are idle,
 * as a person would before adding tabs. MUI's scroll arrows can miss an update when the strip is
 * changed while the first layout is still settling.
 */
async function openSettled(page: Page, story: string, query = '') {
  await open(page, story, query);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

test.describe('Tecton app bar: adding tabs to a full strip', () => {
  for (const dir of ['ltr', 'rtl']) {
    test(`every added tab ends fully in view with no end arrow (${dir})`, async ({ page }) => {
      // The drop-in leaves every second added tab half under the end arrow (the arrow appears
      // after MUI has scrolled the tab into view and narrows the strip).
      await openSettled(page, 'overflow', `&dir=${dir}`);
      // The full-width bar (14 tabs): the strip is scrollable and much wider than one tab. (In a
      // strip narrower than the tab, MUI keeps the end arrow on even at the end, in the drop-in too.)
      const bar = page.locator('[data-region="app-bar"]').nth(0);
      for (let i = 1; i <= 4; i += 1) {
        await bar.getByRole('button', { name: 'Add tab' }).click();
        await expect(bar.getByRole('tab', { name: new RegExp(`New tab ${i}`) })).toHaveAttribute(
          'aria-selected',
          'true',
        );
        // At once (the drop-in, and an earlier fix, could leave it hidden for a second): no end
        // arrow, the start arrow on, the new tab fully visible.
        await expect
          .poll(
            async () => {
              const { arrows, selectedVisible, scrollLeft, maxScroll, tabWidth, stripWidth } =
                await stripState(bar);
              return {
                fits: tabWidth <= stripWidth,
                endArrow: arrows[1],
                selectedVisible,
                scrollLeft,
                maxScroll,
                tabWidth,
                stripWidth,
              };
            },
            { timeout: 1000 },
          )
          .toEqual(expect.objectContaining({ endArrow: 'd', selectedVisible: true, fits: true }));
        expect((await stripState(bar)).arrows).toBe('ed');
      }
    });
  }

  test('scrolling with an arrow right after adding a tab is not undone', async ({ page }) => {
    await openSettled(page, 'overflow');
    const bar = page.locator('[data-region="app-bar"]').nth(0);
    await bar.getByRole('button', { name: 'Add tab' }).click();
    // As soon as the start arrow shows (the strip is moving to the new tab), scroll back with it.
    await bar.locator('.MuiTabs-scrollButtons').first().click();
    await page.waitForTimeout(2000);
    const state = await stripState(bar);
    expect(state.scrollLeft).toBeLessThan(state.maxScroll - 50);
  });
});

test.describe('Tecton app bar: scroll arrows follow the strip', () => {
  for (const dir of ['ltr', 'rtl']) {
    test(`each arrow shows exactly while the strip can scroll its way (${dir})`, async ({
      page,
    }) => {
      // Two bars, each scrolled end to end with smooth scrolling: longer than the default 30s.
      test.setTimeout(120_000);
      await openSettled(page, 'overflow', `&dir=${dir}`);
      for (const n of [0, 2]) {
        const bar = page.locator('[data-region="app-bar"]').nth(n);
        const arrows = bar.locator('.MuiTabs-scrollButtons');
        /** The arrows the strip's position calls for (start, end), within a pixel of an edge. */
        const check = async (step: string) => {
          await expect
            .poll(
              async () => {
                const {
                  arrows: shown,
                  scrollLeft,
                  maxScroll,
                  selectedVisible,
                  startShown,
                  tabWidth,
                  stripWidth,
                } = await stripState(bar);
                const expected = `${scrollLeft > 1 ? 'e' : 'd'}${scrollLeft < maxScroll - 1 ? 'e' : 'd'}`;
                // A tab wider than the strip (the narrow bar on some machines) cannot be fully
                // visible; it is shown from its start edge.
                const fits = tabWidth <= stripWidth;
                return {
                  step,
                  matches: shown === expected,
                  shown: fits ? selectedVisible : startShown,
                };
              },
              { timeout: 2000 },
            )
            .toEqual({ step, matches: true, shown: true });
        };
        // Through the strip with the arrows (the selected tab may scroll away meanwhile).
        for (let i = 0; i < 20 && (await arrows.nth(1).isVisible()); i += 1) {
          await arrows.nth(1).click();
          await stripIdle(bar);
        }
        await expect(arrows.nth(1)).toBeHidden();
        await expect(arrows.nth(0)).toBeVisible();
        for (let i = 0; i < 20 && (await arrows.nth(0).isVisible()); i += 1) {
          await arrows.nth(0).click();
          await stripIdle(bar);
        }
        await expect(arrows.nth(0)).toBeHidden();
        await check('back at the start');
        await bar.getByRole('tab').nth(3).click();
        await check('select a tab');
        await bar.getByRole('button', { name: 'Add tab' }).click();
        await check('add');
        await bar.getByRole('button', { name: 'Add tab' }).click();
        await check('add again');
        await bar.getByRole('button', { name: 'close tab' }).click();
        await check('close the active tab');
        await bar.getByRole('button', { name: 'close tab' }).click();
        await check('close it again');
      }
    });
  }
});

test.describe('Tecton app bar: scroll arrows page through a narrow strip', () => {
  for (const dir of ['ltr', 'rtl']) {
    test(`each click moves the strip by whole tabs, not by Home's width (${dir})`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      // Wide enough for MUI to show the arrows (600px and up), narrow enough that the strip holds
      // about one tab. MUI's page (the tabs that fit, counted from Home) was Home's 48px here: some
      // 30 clicks from one end of 15 tabs to the other.
      await page.setViewportSize({ width: 640, height: 720 });
      await openSettled(page, 'overflow', `&dir=${dir}`);
      const bar = page.locator('[data-region="app-bar"]').nth(0);
      const arrows = bar.locator('.MuiTabs-scrollButtons');
      const tabs = await bar.getByRole('tab').count();
      for (const arrow of [arrows.nth(1), arrows.nth(0)]) {
        const steps: { moved: number; strip: number }[] = [];
        for (let i = 0; i < tabs && (await arrow.isVisible()); i += 1) {
          const before = await stripState(bar);
          await arrow.click();
          await stripIdle(bar);
          const after = await stripState(bar);
          steps.push({
            moved: Math.abs(after.scrollLeft - before.scrollLeft),
            strip: before.stripWidth,
          });
        }
        // At least a tab at a time: the strip is crossed in fewer clicks than it has tabs.
        await expect(arrow).toBeHidden();
        expect(steps.length).toBeLessThan(tabs);
        // Every click but the last (to the end, however near) moves a third of the strip or more.
        for (const { moved, strip } of steps.slice(0, -1)) {
          expect(moved).toBeGreaterThanOrEqual(strip / 3);
        }
      }
    });
  }
});

test.describe('Tecton app bar: close button placement', () => {
  for (const dir of ['ltr', 'rtl']) {
    test(`the close button sits on the active tab (${dir}, scrolled strips included)`, async ({
      page,
    }) => {
      await open(page, 'overflow', `&dir=${dir}`);
      await page.waitForTimeout(500);
      await expectCloseButtonsOnSlots(page);
      // Scroll the first strip and select a tab further along: the button follows.
      const bar = page.locator('[data-region="app-bar"]').first();
      await bar.locator('.MuiTabs-scrollButtons').nth(1).click();
      await page.waitForTimeout(500);
      await bar.getByRole('tab', { name: /Tab 6$/ }).click();
      await page.waitForTimeout(500);
      await expectCloseButtonsOnSlots(page);
    });
  }

  test('the close button follows a tab that grows', async ({ page }) => {
    await open(page, 'primary');
    await page.getByRole('button', { name: 'Add tab' }).click();
    await page.getByRole('tab', { name: /New tab 1/ }).click();
    await expectCloseButtonsOnSlots(page);
    await page.getByRole('tab', { name: /Tab 1$/ }).click();
    await expectCloseButtonsOnSlots(page);
  });
});

test.describe('Tecton app bar: axe', () => {
  for (const story of ['primary', 'tab-options', 'secondary']) {
    for (const mode of ['light', 'dark']) {
      test(`${story} (${mode}) has no serious or critical violations of its own`, async ({
        page,
      }) => {
        await open(page, story, `&mode=${mode}`);
        const results = await new AxeBuilder({ page })
          .include('[data-region="app-bar"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const blocking: string[] = [];
        for (const v of results.violations) {
          if (v.impact !== 'serious' && v.impact !== 'critical') continue;
          for (const node of v.nodes) {
            const label = `${v.id}: ${node.target.join(' ')}`;
            // Tecton design: inactive tab labels render at 70% opacity (Figma NavTab Enabled), which
            // takes them under 4.5:1. Reported, not compliant; owned by the Tecton tokens/design.
            if (v.id === 'color-contrast' && label.includes('data-region="tab-label"')) {
              test.info().annotations.push({
                type: 'tecton-token defect (unapproved)',
                description: label,
              });
            } else blocking.push(label);
          }
        }
        expect(blocking).toEqual([]);
      });
    }
  }
});
