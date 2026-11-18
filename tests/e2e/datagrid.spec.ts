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

  test('column drag shows a ghost, slides columns live, and Escape cancels', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const fields = () =>
      root
        .locator('.MuiDataGrid-columnHeader')
        .evaluateAll((els) => els.map((e) => e.getAttribute('data-field')));
    const before = await fields();
    const source = await header(root, 'site')
      .locator('.MuiDataGrid-columnHeaderTitle')
      .boundingBox();
    const target = await header(root, 'name').boundingBox();
    await page.mouse.move(source!.x + 10, source!.y + 8);
    await page.mouse.down();
    await page.mouse.move(target!.x + 10, target!.y + 8, { steps: 10 });
    await expect(page.locator('.TectonDataGrid-dragGhost')).toHaveText('Site');
    // The passed column slid right to open the slot; nothing re-ordered yet.
    const nameTransform = await header(root, 'name').evaluate((e) => getComputedStyle(e).transform);
    expect(nameTransform).not.toBe('none');
    expect(await fields()).toEqual(before);
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(page.locator('.TectonDataGrid-dragGhost')).toHaveCount(0);
    expect(await fields()).toEqual(before);
  });

  test('row drag reorders rows; undo restores; Alt+Arrow moves the focused row', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:rows');
    const root = grid(page, 'grid-rows');
    const handle = await root
      .locator('.MuiDataGrid-row[data-rowindex="0"] [data-row-reorder-handle]')
      .boundingBox();
    const target = await root.locator('.MuiDataGrid-row[data-rowindex="3"]').boundingBox();
    await page.mouse.move(handle!.x + 10, handle!.y + 10);
    await page.mouse.down();
    await page.mouse.move(handle!.x + 10, target!.y + target!.height - 4, { steps: 12 });
    await expect(root.locator('.MuiDataGrid-row--beingDragged')).toHaveCount(1);
    await expect(page.locator('.TectonDataGrid-dragGhost')).toContainText('Employee 1');
    await page.mouse.up();
    expect((await cellTexts(root, 'name')).slice(0, 4)).toEqual([
      'Employee 2',
      'Employee 3',
      'Employee 4',
      'Employee 1',
    ]);
    await page.keyboard.press('Control+z');
    await expect.poll(async () => (await cellTexts(root, 'name'))[0]).toBe('Employee 1');
    await root.locator('.MuiDataGrid-row[data-rowindex="0"] [data-row-reorder-handle]').click();
    await page.keyboard.press('Alt+ArrowDown');
    await expect
      .poll(async () => (await cellTexts(root, 'name')).slice(0, 2))
      .toEqual(['Employee 2', 'Employee 1']);
  });

  test('cell range selection copies TSV and paste fills consecutive rows', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/?scenario=grid:rows');
    const root = grid(page, 'grid-rows');
    const cell = (r: number, f: string) =>
      root.locator(`.MuiDataGrid-row[data-rowindex="${r}"] [data-field="${f}"]`);
    const a = await cell(1, 'name').boundingBox();
    const b = await cell(2, 'department').boundingBox();
    await page.mouse.move(a!.x + 10, a!.y + 10);
    await page.mouse.down();
    await page.mouse.move(b!.x + 10, b!.y + 10, { steps: 6 });
    await page.mouse.up();
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('');
    await page.keyboard.press('Control+c');
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('Employee 2\tResearch\r\nEmployee 3\tOperations');
    await page.evaluate(() => navigator.clipboard.writeText('X1\nX2'));
    await cell(5, 'name').click();
    await page.keyboard.press('Control+v');
    await expect
      .poll(async () => (await cellTexts(root, 'name')).slice(5, 7))
      .toEqual(['X1', 'X2']);
  });

  test('selection persists across pages and select-all covers every row', async ({ page }) => {
    await page.goto('/?scenario=grid:pinning');
    const root = grid(page, 'grid-pinning');
    await root
      .locator('.MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row[data-rowindex="1"] input')
      .click();
    await root.getByRole('button', { name: /next page/i }).click();
    await root.getByRole('button', { name: /previous page/i }).click();
    await expect(root.locator('.MuiDataGrid-selectedRowCount')).toHaveText('1 row selected');
    await root.getByRole('checkbox', { name: /select all rows/i }).click();
    await expect(root.locator('.MuiDataGrid-selectedRowCount')).toHaveText('60 rows selected');
  });

  test('hovering a row does not shift cells and the header line is 1px', async ({ page }) => {
    await page.goto('/?scenario=grid:pinning');
    const root = grid(page, 'grid-pinning');
    const cell = root.locator(
      '.MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row[data-rowindex="3"] [data-field="depth"]',
    );
    const before = await cell.boundingBox();
    await cell.hover();
    expect(await cell.boundingBox()).toEqual(before);
    const containerBorder = await root
      .locator('.MuiDataGrid-columnHeaders')
      .evaluate((e) => getComputedStyle(e).borderBottomWidth);
    expect(containerBorder).toBe('0px');
  });

  test('Space on a group row toggles the group', async ({ page }) => {
    await page.goto('/?scenario=grid:grouping');
    const root = grid(page, 'grid-grouping');
    const row = root.locator('.MuiDataGrid-row[data-rowindex="0"]');
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await row.locator('.MuiDataGrid-cell').first().click();
    await page.keyboard.press(' ');
    await expect(row).toHaveAttribute('aria-expanded', 'false');
  });
});
