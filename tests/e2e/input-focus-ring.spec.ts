import { expect, test, type Page } from '@playwright/test';

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

/** The input root (`.MuiInputBase-root`) around a labelled input or select. */
const inputRoot = (page: Page, label: string) =>
  page.locator('.MuiInputBase-root').filter({ has: page.getByLabel(label, { exact: true }) });
const boxShadow = (page: Page, label: string) =>
  inputRoot(page, label).evaluate((el) => getComputedStyle(el).boxShadow);
/** Shadow of the element that carries the ring: the input root, or a NumberSpinner's group. */
const ringShadow = (page: Page, label: string) =>
  inputRoot(page, label).evaluate(
    (el) => getComputedStyle(el.closest('.TectonNumberSpinner-group') ?? el).boxShadow,
  );

/** Presses Tab until the labelled control has the focus. */
async function tabTo(page: Page, label: string) {
  const target = page.getByLabel(label, { exact: true });
  for (let i = 0; i < 6 && !(await target.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

const labels = [
  'Outlined text',
  'Filled text',
  'Outlined select',
  'Filled select',
  'Outlined number',
  'Filled number',
  'Spinner',
];

test.describe('Input focus ring', () => {
  test('inputs reached with Tab show the Tecton focus ring', async ({ page }) => {
    await page.goto('/?scenario=input-focus');
    const ring = await tokenColor(page, 'color-focus-ring');
    await page.getByRole('button', { name: 'Start' }).click();
    for (const label of labels) {
      await tabTo(page, label);
      await expect.poll(() => ringShadow(page, label)).toContain(ring);
      // Only the focused input is marked.
      await expect(page.locator('[data-tecton-focus-visible]')).toHaveCount(1);
    }
  });

  test('a NumberSpinner rings both buttons and the value, not the value alone', async ({
    page,
  }) => {
    await page.goto('/?scenario=input-focus');
    await page.getByLabel('Filled number', { exact: true }).click();
    await tabTo(page, 'Spinner');
    const group = page.locator('.TectonNumberSpinner-group').filter({
      has: page.getByLabel('Spinner', { exact: true }),
    });
    await expect
      .poll(() => group.evaluate((el) => getComputedStyle(el).boxShadow))
      .toContain(await tokenColor(page, 'color-focus-ring'));
    expect(await boxShadow(page, 'Spinner')).toBe('none');
    // The value keeps the border it shares with the buttons (no active border inside the ring).
    await expect(inputRoot(page, 'Spinner').locator('.MuiOutlinedInput-notchedOutline')).toHaveCSS(
      'border-color',
      await tokenColor(page, 'color-input-outlined-border'),
    );
  });

  test('inputs focused with the pointer show no ring, also while typing', async ({ page }) => {
    await page.goto('/?scenario=input-focus');
    await page.getByLabel('Outlined text', { exact: true }).click();
    await page.keyboard.type('abc');
    expect(await boxShadow(page, 'Outlined text')).toBe('none');

    const select = page.getByRole('combobox', { name: 'Outlined select' });
    await select.click();
    await page.getByRole('option', { name: 'Feet' }).click();
    await expect(select).toBeFocused();
    expect(await boxShadow(page, 'Outlined select')).toBe('none');
    await expect(page.locator('[data-tecton-focus-visible]')).toHaveCount(0);
  });

  test('an invalid outlined field keeps its red outline inside the ring', async ({ page }) => {
    await page.goto('/?scenario=input-focus');
    await page.getByLabel('Spinner', { exact: true }).click();
    await tabTo(page, 'Invalid text');
    await expect
      .poll(() => boxShadow(page, 'Invalid text'))
      .toContain(await tokenColor(page, 'color-focus-ring'));
    await expect(
      inputRoot(page, 'Invalid text').locator('.MuiOutlinedInput-notchedOutline'),
    ).toHaveCSS('border-color', await tokenColor(page, 'color-status-error-outline-border-strong'));
  });
});
