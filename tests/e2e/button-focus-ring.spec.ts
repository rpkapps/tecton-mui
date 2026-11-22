import { expect, test, type Locator, type Page } from '@playwright/test';

/** Color of a Tecton token, resolved by the browser (`rgb(...)`), for comparison with styles. */
async function tokenColor(page: Page, token: string) {
  return page.evaluate((name) => {
    const probe = document.createElement('div');
    probe.style.color = `var(--tecton-${name})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

const ring = (locator: Locator) =>
  locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: cs.outlineStyle,
      color: cs.outlineColor,
      offset: parseFloat(cs.outlineOffset),
      boxShadow: cs.boxShadow,
      zIndex: cs.zIndex,
    };
  });

/** Presses Tab until the control has the focus. */
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 12 && !(await target.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

// Tecton's ring through MUI 9's `theme.focusVisible` (compat.ts): every ButtonBase control gets it
// on keyboard focus; it is drawn inside where an ancestor clips (toggle group, tab strip, list).
test.describe('Button focus ring', () => {
  test('ButtonBase controls reached with Tab show the Tecton ring', async ({ page }) => {
    await page.goto('/?scenario=button-focus');
    const pink = await tokenColor(page, 'color-focus-ring');
    await page.getByRole('button', { name: 'Start' }).click();
    const outset = [
      page.getByRole('button', { name: 'One' }),
      page.getByRole('button', { name: 'page 1', exact: true }),
      page.getByRole('link', { name: 'Wells' }),
    ];
    const inset = [
      page.getByRole('button', { name: 'Left' }),
      page.getByRole('tab', { name: 'Summary' }),
      page.getByRole('button', { name: 'Overview' }),
    ];
    for (const control of [inset[0], outset[0], outset[1], inset[1], inset[2], outset[2]]) {
      await tabTo(page, control);
      const r = await ring(control);
      expect(r.style).toBe('solid');
      expect(r.color).toBe(pink);
      if (inset.includes(control)) expect(r.offset).toBeLessThan(0);
      else expect(r.offset).toBeGreaterThan(0);
      // One ring: Tecton's own box-shadow ring is dropped where the outline is inset.
      if (inset.includes(control)) expect(r.boxShadow).not.toContain(pink);
    }
  });

  test('a focused grouped button is painted above its neighbours', async ({ page }) => {
    await page.goto('/?scenario=button-focus');
    await page.getByRole('button', { name: 'Start' }).click();
    const one = page.getByRole('button', { name: 'One' });
    await tabTo(page, one);
    expect((await ring(one)).zIndex).toBe('1');
  });

  test('menu items keep the focus fill of Tecton menus instead of the ring', async ({ page }) => {
    await page.goto('/?scenario=button-focus');
    await page.getByRole('link', { name: 'Wells' }).focus();
    const cut = page.getByRole('menuitem', { name: 'Cut' });
    await tabTo(page, cut);
    await expect(cut).toHaveClass(/Mui-focusVisible/);
    const r = await ring(cut);
    expect(r.style).toBe('none');
    expect(await cut.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  });

  test('the pointer does not show the ring', async ({ page }) => {
    await page.goto('/?scenario=button-focus');
    const one = page.getByRole('button', { name: 'One' });
    await one.click();
    expect((await ring(one)).style).toBe('none');
  });
});
