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

/** The input root (`.MuiInputBase-root`) around a labelled input. */
const inputRoot = (page: Page, label: string) =>
  page.locator('.MuiInputBase-root').filter({ has: page.getByLabel(label, { exact: true }) });
const outline = (root: Locator) => root.locator('.MuiOutlinedInput-notchedOutline');

test.describe('NumberField and NumberSpinner', () => {
  test('outlined error fields keep the red outline while focused with the pointer', async ({
    page,
  }) => {
    await page.goto('/?scenario=number-field');
    const red = await tokenColor(page, 'color-status-error-outline-border-strong');
    // Tecton's pointer-focus outline reset used to out-rank the error outline (compat.ts).
    for (const label of ['Outlined error', 'Text error', 'Outlined spinner']) {
      const root = inputRoot(page, label);
      await expect(outline(root)).toHaveCSS('border-color', red);
      await page.getByLabel(label, { exact: true }).click();
      await expect(root).toHaveClass(/Mui-focused/);
      await expect(outline(root)).toHaveCSS('border-color', red);
    }
  });

  test('stepper arrows have the Select chevron colour in the error state', async ({ page }) => {
    await page.goto('/?scenario=number-field');
    for (const variant of ['Outlined', 'Filled']) {
      const chevron = await inputRoot(page, `${variant} select error`)
        .locator('.MuiSelect-icon')
        .evaluate((el) => getComputedStyle(el).color);
      const field = inputRoot(page, `${variant} error`);
      for (const name of ['Increase', 'Decrease']) {
        await expect(field.getByRole('button', { name })).toHaveCSS('color', chevron);
      }
    }
    // The filled arrows used to keep the grey adornment colour on the red error fill.
    await expect(
      inputRoot(page, 'Filled error').getByRole('button', { name: 'Increase' }),
    ).toHaveCSS('color', await tokenColor(page, 'color-status-error-filled-text'));
  });

  test('filled error fields keep the error fill while focused', async ({ page }) => {
    await page.goto('/?scenario=number-field');
    const root = inputRoot(page, 'Filled error');
    await expect(root).toHaveClass(/MuiFilledInput-root/);
    const errorFill = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.getByLabel('Filled error', { exact: true }).click();
    await expect(root).toHaveClass(/Mui-focused/);
    await expect(root).toHaveCSS('background-color', errorFill);
  });

  test('a filled spinner keeps one continuous fill when a button is hovered', async ({ page }) => {
    await page.goto('/?scenario=number-field');
    const spinner = page.locator('.TectonNumberSpinner-root').filter({ hasText: 'Filled spinner' });
    const increase = spinner.getByRole('button', { name: 'Increase' });
    const fill = await spinner
      .locator('.MuiFilledInput-root')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await expect(increase).toHaveCSS('background-color', fill);
    await increase.hover();
    await expect(increase).toHaveCSS('background-color', fill);
    await increase.click();
    await expect(page.getByLabel('Filled spinner', { exact: true })).toHaveValue('5');
  });
});
