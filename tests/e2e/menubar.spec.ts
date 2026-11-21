import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const state = (page: Page) => page.getByTestId('menubar-state');
const trigger = (page: Page, name: string) =>
  page.getByRole('menubar', { name: 'Application' }).getByRole('menuitem', { name });

test.describe('Menubar', () => {
  test('keyboard: roving triggers, open, navigate, run, focus return', async ({ page }) => {
    await page.goto('/?scenario=menubar');
    await expect(trigger(page, 'File')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(trigger(page, 'File')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(trigger(page, 'View')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /New/ })).toBeFocused();
    // The disabled item stays reachable.
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Save' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(state(page)).toHaveText('last=New wrap=false zoom=100');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger(page, 'File')).toBeFocused();
  });

  test('submenu opens with the arrow key and Escape returns focus', async ({ page }) => {
    await page.goto('/?scenario=menubar');
    await trigger(page, 'File').focus();
    await page.keyboard.press('ArrowDown');
    // The opening menu focuses its first item; wait for it before moving the focus.
    await expect(page.getByRole('menuitem', { name: /New/ })).toBeFocused();
    await page.getByRole('menuitem', { name: 'Export as' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'CSV' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('menuitem', { name: 'Export as' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger(page, 'File')).toBeFocused();
  });

  test('pointer: hovering another trigger switches menus; checkbox and radio items', async ({
    page,
  }) => {
    await page.goto('/?scenario=menubar');
    await trigger(page, 'File').click();
    await expect(page.getByRole('menuitem', { name: /New/ })).toBeVisible();
    await trigger(page, 'View').hover();
    const wrap = page.getByRole('menuitemcheckbox', { name: 'Word wrap' });
    await expect(wrap).toBeVisible();
    await expect(trigger(page, 'View')).toHaveAttribute('aria-expanded', 'true');
    await wrap.click();
    await expect(wrap).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('menuitemradio', { name: '150%' }).click();
    await expect(state(page)).toHaveText('last=none wrap=true zoom=150');
    // The popup paints the open trigger and uses the theme Menu surface (no white shadow).
    const popup = page.getByRole('menu');
    expect(await popup.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');
    await page.keyboard.press('Escape');
  });

  test('RTL mirrors the arrow keys and opens submenus to the left', async ({ page }) => {
    await page.goto('/?scenario=menubar&dir=rtl');
    await trigger(page, 'File').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(trigger(page, 'View')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    // The opening menu focuses its first item; wait for it before moving the focus.
    await expect(page.getByRole('menuitem', { name: /New/ })).toBeFocused();
    const exportItem = page.getByRole('menuitem', { name: 'Export as' });
    await exportItem.focus();
    await page.keyboard.press('ArrowLeft');
    const csv = page.getByRole('menuitem', { name: 'CSV' });
    await expect(csv).toBeFocused();
    // The submenu opens on the inline-start side (left in RTL).
    await expect(page.locator('.TectonMenubar-popup')).toHaveCount(2);
    const [parentLeft, childRight] = await page.evaluate(() => [
      document.querySelector('.TectonMenubar-submenuTrigger')!.getBoundingClientRect().left,
      document.querySelectorAll('.TectonMenubar-popup')[1]!.getBoundingClientRect().right,
    ]);
    expect(childRight).toBeLessThanOrEqual(parentLeft + 2);
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`axe with an open menu (${mode})`, async ({ page }) => {
      await page.goto(`/?scenario=menubar&mode=${mode}`);
      await trigger(page, 'View').click();
      await expect(page.getByRole('menuitemcheckbox', { name: 'Word wrap' })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`));
      expect(blocking).toEqual([]);
    });
  }
});
