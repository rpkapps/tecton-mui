// Tecton app bar (React version of the `<wc-app-bar>` drop-in) in a real browser: the behaviour the
// drop-in Storybook's own interaction tests check, plus the keyboard additions. Scenarios come from
// tests/e2e/harness/src/storybook/stories/DropInsAppBar.tsx.
import { expect, test, type Page } from '@playwright/test';

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
    await tab(page, /New tab 1/)
      .getByRole('button', { name: 'close tab' })
      .click();
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
