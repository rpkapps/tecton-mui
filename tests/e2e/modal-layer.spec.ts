import { expect, test, type Page } from '@playwright/test';

// Dialogs of two independent MUI copies on one page: the shell renders @tecton-mui/ui, the
// micro-frontend in its slot renders MUI's CommonJS build (its own ModalManager and FocusTrap, and
// no library registration: copy "unknown"). The page-level modal layer, which the shell's
// ThemeProvider installs on its own, makes them stack like dialogs of one copy. Without it the two
// focus traps re-focus each other (stack overflows), and closing them out of order unlocks scroll
// too early, exposes the page behind an open dialog, and leaves scroll locked for good.

const focusIsIn = (page: Page, testId: string) =>
  page.evaluate((id) => !!document.activeElement?.closest(`[data-testid="${id}"]`), testId);
const bodyOverflow = (page: Page) => page.evaluate(() => document.body.style.overflow);
const pageHidden = (page: Page) =>
  page.evaluate(() => document.getElementById('root')!.getAttribute('aria-hidden'));
const layerMarks = (page: Page) =>
  page.evaluate(
    () =>
      document.querySelectorAll(
        '[inert], [data-tecton-modal-layer-inert], [data-tecton-modal-layer-hidden]',
      ).length,
  );

async function openStacked(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?scenario=modal-layer');
  await page.getByTestId('open-shell').click();
  await expect.poll(() => focusIsIn(page, 'shell-dialog')).toBe(true);
  await page.getByTestId('open-mfe').click();
  await expect.poll(() => focusIsIn(page, 'mfe-dialog')).toBe(true);
  return errors;
}

test.describe('modal layer: dialogs of two MUI copies', () => {
  test('the top dialog keeps the focus; the lower one is inert', async ({ page }) => {
    const errors = await openStacked(page);
    await expect(page.getByTestId('shell-dialog')).toHaveAttribute('inert', '');
    await expect(page.getByTestId('mfe-dialog')).not.toHaveAttribute('inert');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      expect(await focusIsIn(page, 'mfe-dialog')).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('closing the lower dialog first keeps the page locked and hidden until the last one closes', async ({
    page,
  }) => {
    const errors = await openStacked(page);
    await page.getByTestId('close-shell-now').click();
    await expect(page.getByTestId('shell-dialog')).toHaveCount(0);
    expect(await bodyOverflow(page)).toBe('hidden');
    expect(await pageHidden(page)).toBe('true');
    expect(await focusIsIn(page, 'mfe-dialog')).toBe(true);

    await page.getByTestId('close-mfe').click();
    await expect(page.getByTestId('mfe-dialog')).toHaveCount(0);
    await expect.poll(() => bodyOverflow(page)).toBe('');
    expect(await pageHidden(page)).toBeNull();
    expect(await layerMarks(page)).toBe(0);
    // The page scrolls again.
    await page.mouse.move(200, 300);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('closing the top dialog gives the focus back to the dialog below', async ({ page }) => {
    const errors = await openStacked(page);
    await page.getByTestId('close-mfe').click();
    await expect(page.getByTestId('open-mfe')).toBeFocused();
    await expect(page.getByTestId('shell-dialog')).not.toHaveAttribute('inert');
    await page.getByTestId('close-shell').click();
    await expect(page.getByTestId('open-shell')).toBeFocused();
    await expect.poll(() => bodyOverflow(page)).toBe('');
    expect(await layerMarks(page)).toBe(0);
    expect(errors).toEqual([]);
  });

  test('leaves dialogs and menus of one copy to MUI', async ({ page }) => {
    await page.goto('/?scenario=modal-layer');
    await page.getByTestId('open-shell').click();
    await page.getByTestId('open-menu').click();
    await expect(page.getByTestId('menu-item')).toBeFocused();
    expect(await layerMarks(page)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('open-menu')).toBeFocused();
    expect(await layerMarks(page)).toBe(0);
  });
});
