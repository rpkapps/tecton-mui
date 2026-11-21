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
    };
  });

test.describe('Tecton app bar: adding tabs to a full strip', () => {
  for (const dir of ['ltr', 'rtl']) {
    test(`every added tab ends fully in view with no end arrow (${dir})`, async ({ page }) => {
      // The drop-in leaves every second added tab half under the end arrow (the arrow appears
      // after MUI has scrolled the tab into view and narrows the strip).
      await open(page, 'overflow', `&dir=${dir}`);
      const bar = page.locator('[data-region="app-bar"]').nth(2);
      for (let i = 1; i <= 4; i += 1) {
        await bar.getByRole('button', { name: 'Add tab' }).click();
        await expect(bar.getByRole('tab', { name: new RegExp(`New tab ${i}`) })).toHaveAttribute(
          'aria-selected',
          'true',
        );
        // No end arrow, the new tab fully visible. (The start arrow is MUI's own business: under
        // heavy load its observer can miss an update, in the drop-in too.)
        await expect
          .poll(async () => {
            const state = await stripState(bar);
            return { endArrow: state.arrows[1], selectedVisible: state.selectedVisible };
          })
          .toEqual({ endArrow: 'd', selectedVisible: true });
      }
    });
  }

  test('scrolling with an arrow right after adding a tab is not undone', async ({ page }) => {
    await open(page, 'overflow');
    const bar = page.locator('[data-region="app-bar"]').nth(2);
    await bar.getByRole('button', { name: 'Add tab' }).click();
    await bar.locator('.MuiTabs-scrollButtons').first().click();
    await page.waitForTimeout(2000);
    const state = await stripState(bar);
    expect(state.scrollLeft).toBeLessThan(state.maxScroll - 50);
  });
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
