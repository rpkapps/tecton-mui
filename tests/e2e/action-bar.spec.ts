import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const state = (page: Page) => page.getByTestId('action-bar-state');
const bar = (page: Page, name = 'Canvas tools') => page.getByRole('toolbar', { name });
// CSS locators: while a menu is open (modal) the rest of the page leaves the accessibility tree.
const measure = (page: Page) =>
  page.locator('[aria-label="Canvas tools"] .TectonActionBar-toolMenu');
const markers = (page: Page) => page.locator('[aria-label="Map tools"] .TectonActionBar-toolMenu');
/** The menu paper once its opening transition has finished. */
const openMenu = async (page: Page) => {
  const paper = page.locator('.TectonActionBar-menu');
  await expect(paper).toHaveCSS('opacity', '1');
  return paper;
};

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

test.describe('ActionBar', () => {
  test('keyboard: one tab stop, roving focus, skips disabled, Select opens with Enter', async ({
    page,
  }) => {
    await page.goto('/?scenario=action-bar');
    const zoom = page.getByRole('combobox', { name: 'Zoom level' });
    await expect(zoom).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(zoom).toBeFocused();
    // Down moves along the bar instead of opening the Select.
    await page.keyboard.press('ArrowDown');
    await expect(bar(page).getByRole('button', { name: 'Select' })).toBeFocused();
    await expect(page.getByRole('listbox')).toBeHidden();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(measure(page)).toBeFocused();
    // End lands on Undo: Redo is disabled and skipped.
    await page.keyboard.press('End');
    await expect(bar(page).getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(state(page)).toHaveText('tool=select zoom=fit last=Undo');
    // Tab leaves the bar (the next bar is its own tab stop) and Shift+Tab comes back.
    await page.keyboard.press('Tab');
    await expect(markers(page)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(bar(page).getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(zoom).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('option', { name: 'Fit' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(state(page)).toHaveText('tool=select zoom=100 last=Undo');
    await expect(zoom).toBeFocused();
  });

  test('tool menu: arrow key opens it beside the button, Enter picks, focus returns', async ({
    page,
  }) => {
    await page.goto('/?scenario=action-bar');
    const button = measure(page);
    await button.focus();
    await expect(button).toHaveAttribute('aria-label', 'Ruler');
    await page.keyboard.press('ArrowRight');
    const menu = page.getByRole('menu', { name: 'Measure' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('menuitemradio', { name: 'Ruler' })).toBeFocused();
    await expect(page.getByRole('menuitemradio', { name: 'Ruler' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // Figma: the menu opens 2px to the right of the button, on top of the tools.
    const paper = await openMenu(page);
    const [buttonBox, paperBox] = await Promise.all([button.boundingBox(), paper.boundingBox()]);
    expect(paperBox!.x - (buttonBox!.x + buttonBox!.width)).toBeCloseTo(2, 0);
    expect(paperBox!.y - buttonBox!.y).toBeCloseTo(-2, 0);
    // Figma: 32px rows, the tool icon at the button's 20px size, 12px in, the name 12px after it.
    const row = paper.locator('.TectonActionBar-tool').first();
    const [rowBox, iconBox, textBox] = await Promise.all([
      row.boundingBox(),
      row.locator('.TectonIcon-root').boundingBox(),
      row.locator('.MuiListItemText-root').boundingBox(),
    ]);
    expect(rowBox!.height).toBe(32);
    expect([iconBox!.width, iconBox!.height]).toEqual([20, 20]);
    expect(iconBox!.x - rowBox!.x).toBe(12);
    expect(textBox!.x - (iconBox!.x + iconBox!.width)).toBe(12);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(state(page)).toHaveText('tool=area zoom=fit last=none');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-label', 'Area');
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    // The arrow key back toward the bar closes the menu.
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitemradio', { name: 'Area' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('pointer: tooltip beside the button; long press and right-click open the menu', async ({
    page,
  }) => {
    await page.goto('/?scenario=action-bar');
    const pan = bar(page).getByRole('button', { name: 'Pan' });
    await pan.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Pan');
    const [panBox, tipBox] = await Promise.all([
      pan.boundingBox(),
      tooltip.locator('.MuiTooltip-tooltip').boundingBox(),
    ]);
    expect(tipBox!.x - (panBox!.x + panBox!.width)).toBeCloseTo(2, 0);
    expect(tipBox!.y + tipBox!.height / 2).toBeCloseTo(panBox!.y + panBox!.height / 2, 0);

    // A short click uses the shown tool.
    await measure(page).click();
    await expect(state(page)).toHaveText('tool=ruler zoom=fit last=none');
    await expect(page.getByRole('menu')).toBeHidden();

    // Holding the button opens the menu; releasing does not close it.
    const box = (await measure(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    await expect(page.getByRole('menu', { name: 'Measure' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();

    await measure(page).click({ button: 'right' });
    await expect(page.getByRole('menu', { name: 'Measure' })).toBeVisible();
    await page.getByRole('menuitemradio', { name: 'Area' }).click();
    await expect(state(page)).toHaveText('tool=area zoom=fit last=none');
  });

  test('uses the Tecton tokens of the Figma component', async ({ page }) => {
    await page.goto('/?scenario=action-bar&mode=dark');
    const group = bar(page).getByRole('group').first();
    await expect(group).toBeVisible();
    const styles = await group.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        border: cs.borderTopColor,
        radius: cs.borderTopLeftRadius,
        width: el.getBoundingClientRect().width,
      };
    });
    expect(styles.bg).toBe(await tokenColor(page, 'color-bg-paper'));
    expect(styles.border).toBe(await tokenColor(page, 'color-divider-subtle'));
    expect(styles.radius).toBe('4px');
    const current = bar(page).getByRole('button', { name: 'Select' });
    expect(await current.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      await tokenColor(page, 'color-action-tertiary-bg-active'),
    );
    expect(await current.evaluate((el) => el.getBoundingClientRect().height)).toBe(32);
    const indicator = measure(page).locator('.TectonActionBar-moreIndicator');
    expect(await indicator.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      await tokenColor(page, 'color-action-tertiary-adornment'),
    );
    // Button groups are 40px wide, as in Figma (32px button, space-50 inside the border).
    const buttons = bar(page).getByRole('group').nth(1);
    expect(await buttons.evaluate((el) => el.getBoundingClientRect().width)).toBe(40);
  });

  test('selects: Figma insets, and two selects in a row move with Left and Right', async ({
    page,
  }) => {
    await page.goto('/?scenario=action-bar');
    const layer = page.getByRole('combobox', { name: 'Layer' });
    const style = page.getByRole('combobox', { name: 'Style' });
    await expect(layer).toBeVisible();
    // Figma `_ActionBarSelectBehavior_*` with "Value": TextOnly 67px with the value 4px in,
    // Filled 79px with the value 12px in.
    const measureSelect = (combobox: typeof layer) =>
      combobox.evaluate((el) => {
        const root = el.closest('.TectonActionBar-select')!.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);
        const text = range.getBoundingClientRect();
        return {
          width: root.width,
          inset: text.left - root.left,
          top: root.top,
          right: root.right,
        };
      });
    const [textOnly, filled] = await Promise.all([measureSelect(layer), measureSelect(style)]);
    expect(textOnly.width).toBeCloseTo(67, 0);
    expect(textOnly.inset).toBe(4);
    expect(filled.width).toBeCloseTo(79, 0);
    expect(filled.inset).toBe(12);
    // One row, 4px apart, as Figma's double dropdown.
    const filledLeft = await style.evaluate(
      (el) => el.closest('.TectonActionBar-select')!.getBoundingClientRect().left,
    );
    expect(filled.top).toBe(textOnly.top);
    expect(filledLeft - textOnly.right).toBe(4);

    await layer.focus();
    await page.keyboard.press('ArrowRight');
    await expect(style).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(style).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(layer).toBeFocused();
    await expect(page.getByRole('listbox')).toBeHidden();
    // Each select's menu opens below it (measured first: the open menu hides the page from roles).
    const styleBox = await style.evaluate((el) => {
      const r = el.closest('.TectonActionBar-select')!.getBoundingClientRect();
      return { x: r.left, bottom: r.bottom };
    });
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    const listBox = await page.locator('.MuiPopover-paper').boundingBox();
    expect(listBox!.x).toBeCloseTo(styleBox.x, 0);
    expect(listBox!.y).toBeGreaterThan(styleBox.bottom);
    await page.keyboard.press('Escape');
    await expect(style).toBeFocused();
  });

  test('right alignment opens the menu to the left', async ({ page }) => {
    await page.goto('/?scenario=action-bar');
    const button = markers(page);
    await button.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menu')).toBeHidden();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('menu', { name: 'Markers' })).toBeVisible();
    const paper = await openMenu(page);
    const [buttonBox, paperBox] = await Promise.all([button.boundingBox(), paper.boundingBox()]);
    expect(buttonBox!.x - (paperBox!.x + paperBox!.width)).toBeCloseTo(2, 0);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menu')).toBeHidden();
  });

  test('RTL: a left-aligned bar opens its menus to the left', async ({ page }) => {
    await page.goto('/?scenario=action-bar&dir=rtl');
    const button = measure(page);
    // The corner triangle mirrors too: bottom-left, 2px inside the button.
    const [triangle, buttonRect] = await Promise.all([
      button.locator('.TectonActionBar-moreIndicator').boundingBox(),
      button.boundingBox(),
    ]);
    expect(triangle!.x - buttonRect!.x).toBeCloseTo(2, 0);
    expect(buttonRect!.y + buttonRect!.height - (triangle!.y + triangle!.height)).toBeCloseTo(2, 0);
    // So does the select's inset: the value sits 4px from the right edge.
    const inset = await page.getByRole('combobox', { name: 'Layer' }).evaluate((el) => {
      const root = el.closest('.TectonActionBar-select')!.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(el);
      return root.right - range.getBoundingClientRect().right;
    });
    expect(inset).toBe(4);
    await button.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('menu', { name: 'Measure' })).toBeVisible();
    const paper = await openMenu(page);
    const [buttonBox, paperBox] = await Promise.all([button.boundingBox(), paper.boundingBox()]);
    expect(buttonBox!.x - (paperBox!.x + paperBox!.width)).toBeCloseTo(2, 0);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(button).toBeFocused();
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`axe: bar, tooltip and open tool menu (${mode})`, async ({ page }) => {
      await page.goto(`/?scenario=action-bar&mode=${mode}`);
      const analyze = async () => {
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        return results.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`));
      };
      await bar(page).getByRole('button', { name: 'Pan' }).hover();
      await expect(page.locator('.MuiTooltip-tooltip')).toHaveCSS('opacity', '1');
      expect(await analyze()).toEqual([]);
      await measure(page).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('menu')).toBeVisible();
      await openMenu(page);
      expect(await analyze()).toEqual([]);
    });
  }
});
