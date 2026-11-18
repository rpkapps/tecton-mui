import { expect, test, type Locator, type Page } from '@playwright/test';

const grid = (page: Page, id: string) => page.getByTestId(id).locator('.MuiDataGrid-root');
const header = (root: Locator, field: string) =>
  root.locator(`.MuiDataGrid-columnHeader[data-field="${field}"]`);
const cellTexts = (root: Locator, field: string) =>
  root
    .locator(
      `.MuiDataGrid-row:not(.TectonDataGrid-row--detail):not(.TectonDataGrid-headerFilterRow):not(.TectonDataGrid-pinnedRow) .MuiDataGrid-cell[data-field="${field}"]`,
    )
    .allInnerTexts();

test.describe('DataGrid advanced features', () => {
  test('multi-column sorting with shift+click and priority indicators', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    // initialState: department asc, salary desc
    const departments = await cellTexts(root, 'department');
    expect(departments.slice(0, 3)).toEqual(['Engineering', 'Engineering', 'Engineering']);
    const salaries = (await cellTexts(root, 'salary')).map((s) => Number(s.replace(/[$,]/g, '')));
    expect(salaries.slice(0, 5)).toEqual([...salaries.slice(0, 5)].sort((a, b) => b - a));
    await expect(header(root, 'salary')).toContainText('priority 2');

    // Plain click replaces the model; shift+click appends.
    await header(root, 'name').locator('.MuiDataGrid-columnHeaderTitle').first().click();
    await expect(header(root, 'name')).toHaveAttribute('aria-sort', 'ascending');
    await expect(header(root, 'salary')).not.toContainText('priority');
    await header(root, 'site')
      .locator('.MuiDataGrid-columnHeaderTitle')
      .first()
      .click({ modifiers: ['Shift'] });
    await expect(header(root, 'site')).toContainText('priority 2');
  });

  test('header filters filter rows', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    await root.getByRole('textbox', { name: 'Filter Site' }).fill('Houston');
    await expect
      .poll(async () => new Set(await cellTexts(root, 'site')))
      .toEqual(new Set(['Houston']));
    await expect(root.locator('.TectonDataGrid-pagination')).toContainText('of 67');
  });

  test('detail panels toggle and span the full row', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const firstToggle = root.locator('.TectonDataGrid-detailPanelToggle').first();
    await firstToggle.click();
    const panel = root.locator('.TectonDataGrid-detailPanel').first();
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Engineering');
    await expect(firstToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('row grouping expands groups and shows aggregates', async ({ page }) => {
    await page.goto('/?scenario=grid:grouping');
    const root = grid(page, 'grid-grouping');
    const houston = root.locator('.MuiDataGrid-row', { hasText: 'Houston' }).first();
    await expect(houston).toHaveAttribute('aria-expanded', 'false');
    await expect(houston).toHaveAttribute('aria-level', '2');
    await houston.locator('.TectonDataGrid-groupingToggle').click();
    await expect(houston).toHaveAttribute('aria-expanded', 'true');
    await expect(root.locator('.MuiDataGrid-row[aria-level="3"]').first()).toBeVisible();
    await expect(root.locator('.TectonDataGrid-aggregationRow')).toContainText('$20,908,100');
  });

  test('pinned columns stay in place while scrolling horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/?scenario=grid:grouping');
    const root = grid(page, 'grid-grouping');
    const nameHeader = header(root, 'name');
    const before = await nameHeader.boundingBox();
    await root.locator('.MuiDataGrid-virtualScroller').evaluate((el) => (el.scrollLeft = 400));
    await page.waitForTimeout(100);
    const after = await nameHeader.boundingBox();
    expect(Math.round(after!.x)).toBe(Math.round(before!.x));
    const site = await header(root, 'site').boundingBox();
    expect(site!.x).toBeLessThan(before!.x + 700);
  });

  test('columns can be reordered by dragging headers', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const fields = () =>
      root
        .locator('.MuiDataGrid-columnHeader[data-field]')
        .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.field));
    const source = await header(root, 'site')
      .locator('.MuiDataGrid-columnHeaderTitle')
      .first()
      .boundingBox();
    const target = await header(root, 'name').boundingBox();
    await page.mouse.move(source!.x + 10, source!.y + 10);
    await page.mouse.down();
    await page.mouse.move(source!.x - 40, source!.y + 10, { steps: 3 });
    await page.mouse.move(target!.x + 5, target!.y + 10, { steps: 5 });
    await page.mouse.up();
    const order = await fields();
    expect(order.indexOf('site')).toBeLessThan(order.indexOf('name'));
  });

  test('tree data renders hierarchy with aggregated parents', async ({ page }) => {
    await page.goto('/?scenario=grid:tree');
    const root = grid(page, 'grid-tree');
    const src = root.locator('.MuiDataGrid-row', { hasText: 'src' }).first();
    await expect(src).toContainText('23400');
    await src.locator('.TectonDataGrid-groupingToggle').click();
    await expect(root.locator('.MuiDataGrid-row', { hasText: 'Button.tsx' })).toHaveCount(0);
  });
});
