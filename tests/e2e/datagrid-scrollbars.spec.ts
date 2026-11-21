import { expect, test } from '@playwright/test';

// Headless Chromium hides scrollbars by default. With them visible, opening a Select locks the page
// scroll (MUI adds the scrollbar width as body padding), which used to shift the filter panel.
test.use({
  launchOptions: {
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
    ignoreDefaultArgs: ['--hide-scrollbars'],
  },
});

test('the filter panel stays in place when a dropdown in it opens (page scroll lock)', async ({
  page,
}) => {
  // Every grid scenario: the page is taller than the viewport, so it has a scrollbar.
  await page.goto('/?scenario=grid');
  const scrollbar = await page.evaluate(
    () => window.innerWidth - document.documentElement.clientWidth,
  );
  expect(scrollbar).toBeGreaterThan(0);
  const root = page.getByTestId('grid-toolbar').locator('.MuiDataGrid-root');
  await root.getByRole('button', { name: 'Filters' }).click();
  const panel = page.locator('.TectonDataGrid-filterPanel');
  await expect(panel).toBeVisible();
  const before = await panel.boundingBox();
  // Open the column select of the first condition.
  await panel.locator('.MuiDataGrid-filterFormColumnInput [role="combobox"]').first().click();
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  const after = await panel.boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 0);
  expect(after!.y).toBeCloseTo(before!.y, 0);
});
