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

const field = (page: Page, label: string) =>
  page.locator('.MuiFormControl-root').filter({ has: page.getByText(label, { exact: true }) });
const rail = (root: Locator) => root.locator('[class*="-rail"]');

/** Presses (and optionally drags across) the bar at fractions of the thumb's travel. */
async function dragRail(page: Page, root: Locator, from: number, to = from) {
  const box = (await rail(root).boundingBox())!;
  const thumb = 4;
  const x = (fraction: number) => box.x + thumb / 2 + fraction * (box.width - thumb);
  const y = box.y + box.height / 2;
  await page.mouse.move(x(from), y);
  await page.mouse.down();
  await page.mouse.move(x(to), y, { steps: 5 });
  await page.mouse.up();
}

test.describe('NumberSlider and NumberRangeSlider', () => {
  test('the bar and the input share the row evenly at the input height', async ({ page }) => {
    await page.goto('/?scenario=number-slider');
    for (const label of ['Frequency', 'Step', 'Opacity']) {
      const root = field(page, label);
      const bar = (await rail(root).boundingBox())!;
      const input = (await root.locator('.MuiFilledInput-root').boundingBox())!;
      expect(Math.abs(bar.width - input.width)).toBeLessThanOrEqual(1);
      expect(bar.height).toBe(input.height);
      expect(bar.height).toBe(32);
    }
  });

  test('slot props set the share of the bar and the input', async ({ page }) => {
    await page.goto('/?scenario=number-slider');
    const root = field(page, 'Wide bar');
    const bar = (await rail(root).boundingBox())!;
    const input = (await root.locator('.MuiFilledInput-root').boundingBox())!;
    expect(bar.width / input.width).toBeCloseTo(3, 1);
  });

  test('uses the Slider colours and a sideways-drag cursor', async ({ page }) => {
    await page.goto('/?scenario=number-slider&mode=dark');
    const root = field(page, 'Opacity');
    const input = root.locator('.MuiFilledInput-root');
    await expect(rail(root)).toHaveCSS(
      'background-color',
      await input.evaluate((el) => getComputedStyle(el).backgroundColor),
    );
    await expect(root.locator('[class*="-thumb"]')).toHaveCSS(
      'background-color',
      await tokenColor(page, 'color-accent-lilac-main'),
    );
    await expect(rail(root)).toHaveCSS('cursor', 'ew-resize');
  });

  test('pressing and dragging the bar sets the value', async ({ page }) => {
    await page.goto('/?scenario=number-slider');
    const root = field(page, 'Opacity');
    await dragRail(page, root, 0.2, 0.75);
    await expect(page.getByLabel('Opacity')).toHaveValue('75');
    await dragRail(page, root, 0.1);
    await expect(page.getByLabel('Opacity')).toHaveValue('10');
  });

  test('the bar runs from right to left in RTL', async ({ page }) => {
    await page.goto('/?scenario=number-slider&dir=rtl');
    const root = field(page, 'Opacity');
    const box = (await rail(root).boundingBox())!;
    await page.mouse.click(box.x + box.width - 2 - 0.25 * (box.width - 4), box.y + 16);
    await expect(page.getByLabel('Opacity')).toHaveValue('25');
  });

  test('a range thumb stops at the other thumb', async ({ page }) => {
    await page.goto('/?scenario=number-slider');
    const root = field(page, 'Frequency');
    const start = page.getByRole('textbox', { name: 'Frequency minimum' });
    const end = page.getByRole('textbox', { name: 'Frequency maximum' });
    // 50 of 80 is at 62.5%: start the drag on the end thumb and pull it past the start (10).
    await dragRail(page, root, 0.625, 0.02);
    await expect(start).toHaveValue('10');
    await expect(end).toHaveValue('10');
    await dragRail(page, root, 0.9);
    await expect(end).toHaveValue('72');
  });

  test('the keyboard reaches both range values but never the bars', async ({ page }) => {
    await page.goto('/?scenario=number-slider');
    const start = page.getByRole('textbox', { name: 'Frequency minimum' });
    await start.focus();
    await page.keyboard.press('Tab');
    const end = page.getByRole('textbox', { name: 'Frequency maximum' });
    await expect(end).toBeFocused();
    const box = field(page, 'Frequency').locator('.MuiFilledInput-root');
    await expect(box).toHaveAttribute('data-tecton-focus-visible', '');
    await expect(box).toHaveCSS('box-shadow', /rgb/);
    await page.keyboard.press('ArrowUp');
    await expect(end).toHaveValue('51');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Step')).toBeFocused();
  });
});
