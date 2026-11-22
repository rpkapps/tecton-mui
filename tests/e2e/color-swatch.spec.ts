import AxeBuilder from '@axe-core/playwright';
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

/** The swatch root around a color input. */
const swatchRoot = (input: Locator) => input.locator('xpath=..');

const ring = (root: Locator) =>
  root.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: cs.outlineStyle,
      color: cs.outlineColor,
      width: cs.outlineWidth,
      offset: cs.outlineOffset,
    };
  });

const box = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right };
  });

test.describe('ColorSwatchControl', () => {
  test('keyboard focus shows the pink Tecton ring, not the saffron one; a click does not', async ({
    page,
  }) => {
    await page.goto('/?scenario=color-swatch');
    const [pink, saffron] = await Promise.all([
      tokenColor(page, 'color-focus-ring'),
      tokenColor(page, 'color-accent-saffron-fill'),
    ]);
    const fill = page.getByLabel('Fill', { exact: true });
    await page.getByRole('button', { name: 'Start' }).click();
    await page.keyboard.press('Tab');
    await expect(fill).toBeFocused();
    const focused = await ring(swatchRoot(fill));
    expect(focused).toEqual({ style: 'solid', color: pink, width: '2px', offset: '1px' });
    expect(focused.color).not.toBe(saffron);
    // Tab moves on to the next swatch and takes the ring with it.
    const stroke = page.getByLabel('Stroke');
    await page.keyboard.press('Tab');
    await expect(stroke).toBeFocused();
    expect((await ring(swatchRoot(fill))).style).toBe('none');
    expect((await ring(swatchRoot(stroke))).color).toBe(pink);
    // Focus from the pointer draws no ring.
    await page.getByRole('button', { name: 'Start' }).click();
    await fill.click();
    await expect(fill).toBeFocused();
    expect((await ring(swatchRoot(fill))).style).toBe('none');
  });

  test('matches the filled input sizes: 32px medium, 28px small', async ({ page }) => {
    await page.goto('/?scenario=color-swatch');
    for (const [name, height, swatchSize] of [
      ['Fill', 32, 20],
      ['Stroke', 28, 16],
    ] as const) {
      const root = swatchRoot(page.getByLabel(name, { exact: true }));
      const [rootBox, swatchBox, labelBox] = await Promise.all([
        box(root),
        box(root.locator('.TectonColorSwatchControl-swatch')),
        box(root.locator('.TectonColorSwatchControl-label')),
      ]);
      expect(rootBox.height).toBe(height);
      expect(swatchBox.width).toBe(swatchSize);
      expect(swatchBox.height).toBe(swatchSize);
      // 8px padding, the swatch centred, the value 4px after it, 8px before the end.
      expect(swatchBox.x - rootBox.x).toBe(8);
      expect(swatchBox.y - rootBox.y).toBe((height - swatchSize) / 2);
      expect(labelBox.x - (swatchBox.x + swatchBox.width)).toBe(4);
      expect(rootBox.right - labelBox.right).toBeCloseTo(8, 0);
    }
    const fillRoot = swatchRoot(page.getByLabel('Fill', { exact: true }));
    await expect(fillRoot.locator('.TectonColorSwatchControl-label')).toHaveText('#218585');
    await expect(fillRoot.locator('.TectonColorSwatchControl-swatch')).toHaveCSS(
      'background-color',
      'rgb(33, 133, 133)',
    );
    await expect(fillRoot).toHaveCSS(
      'background-color',
      await tokenColor(page, 'color-input-filled-bg'),
    );
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`keeps its fill on hover and keyboard focus (${mode})`, async ({ page }) => {
      // The filled input's hover/focus fills equal the page surface in light mode, so a swatch
      // using them vanished under the pointer.
      await page.goto(`/?scenario=color-swatch&mode=${mode}`);
      const fill = page.getByLabel('Fill', { exact: true });
      const root = swatchRoot(fill);
      const rest = await tokenColor(page, 'color-input-filled-bg');
      await expect(root).toHaveCSS('background-color', rest);
      await root.hover();
      await expect(root).toHaveCSS('background-color', rest);
      await page.getByRole('button', { name: 'Start' }).click();
      await page.keyboard.press('Tab');
      await expect(fill).toBeFocused();
      await expect(root).toHaveCSS('outline-style', 'solid');
      await expect(root).toHaveCSS('background-color', rest);
    });
  }

  test('the whole swatch is the click target for the picker', async ({ page }) => {
    await page.goto('/?scenario=color-swatch');
    const fill = page.getByLabel('Fill', { exact: true });
    const [inputBox, rootBox] = await Promise.all([box(fill), box(swatchRoot(fill))]);
    expect(inputBox).toEqual(rootBox);
    await expect(fill).toHaveCSS('opacity', '0');
  });

  test('picking a color updates the value live and reports the commit', async ({ page }) => {
    await page.goto('/?scenario=color-swatch');
    const fill = page.getByLabel('Fill', { exact: true });
    await fill.fill('#ff8800');
    await expect(page.getByTestId('color-swatch-state')).toHaveText(
      'fill=#FF8800 committed=#FF8800',
    );
    await expect(swatchRoot(fill).locator('.TectonColorSwatchControl-label')).toHaveText('#FF8800');
    await expect(fill).toHaveAccessibleDescription('#FF8800');
  });

  test('inherited draws a half-size square; disabled is skipped by Tab', async ({ page }) => {
    await page.goto('/?scenario=color-swatch');
    const swatch = swatchRoot(page.getByLabel('Inherited fill')).locator(
      '.TectonColorSwatchControl-swatch',
    );
    await expect(swatch).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const inner = await swatch.evaluate((el) => {
      const cs = getComputedStyle(el, '::after');
      return { width: cs.width, height: cs.height, color: cs.backgroundColor };
    });
    expect(inner).toEqual({ width: '10px', height: '10px', color: 'rgb(33, 133, 133)' });

    const locked = page.getByLabel('Locked fill');
    await expect(locked).toBeDisabled();
    await page.getByLabel('Inherited fill').focus();
    await page.keyboard.press('Tab');
    await expect(locked).not.toBeFocused();
  });

  test('RTL: the swatch leads on the right and the hex value still reads #RRGGBB', async ({
    page,
  }) => {
    await page.goto('/?scenario=color-swatch&dir=rtl');
    const root = swatchRoot(page.getByLabel('Fill', { exact: true }));
    const [swatchBox, labelBox] = await Promise.all([
      box(root.locator('.TectonColorSwatchControl-swatch')),
      box(root.locator('.TectonColorSwatchControl-label')),
    ]);
    expect(swatchBox.x).toBeGreaterThan(labelBox.right);
    const label = root.locator('.TectonColorSwatchControl-label');
    await expect(label).toHaveCSS('direction', 'ltr');
    // The "#" renders first (leftmost): measure the first character.
    const firstGlyphLeft = await label.evaluate((el) => {
      const range = document.createRange();
      range.setStart(el.firstChild!, 0);
      range.setEnd(el.firstChild!, 1);
      return range.getBoundingClientRect().left - el.getBoundingClientRect().left;
    });
    expect(firstGlyphLeft).toBeLessThan(1);
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`axe: swatches at rest and focused (${mode})`, async ({ page }) => {
      await page.goto(`/?scenario=color-swatch&mode=${mode}`);
      const analyze = async () => {
        const results = await new AxeBuilder({ page })
          .include('.TectonColorSwatchControl-root')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        return results.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`));
      };
      expect(await analyze()).toEqual([]);
      await page.getByRole('button', { name: 'Start' }).click();
      await page.keyboard.press('Tab');
      expect(await analyze()).toEqual([]);
    });
  }
});
