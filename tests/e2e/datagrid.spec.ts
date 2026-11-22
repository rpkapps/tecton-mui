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
    // The generated stylesheet, scoped to this grid's root, paints the range and nothing else.
    await expect(root).toHaveAttribute('data-tecton-grid-scope', /^\d+$/);
    await expect(cell(1, 'name')).toHaveCSS('background-image', /linear-gradient/);
    await expect(cell(2, 'department')).toHaveCSS('background-image', /linear-gradient/);
    await expect(cell(3, 'name')).toHaveCSS('background-image', 'none');
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
    // A hovered row has only the hover fill: no stroke around it.
    const row = root.locator(
      '.MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row[data-rowindex="3"]',
    );
    expect(await row.evaluate((e) => getComputedStyle(e, '::after').content)).toBe('none');
    expect(await row.evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe('0px');
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
  test('the virtual scroller keeps its native scrollbars hidden (one set of scrollbars)', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:pinning');
    const root = grid(page, 'grid-pinning');
    const scroller = root.locator('.MuiDataGrid-virtualScroller');
    expect(await scroller.evaluate((e) => getComputedStyle(e).scrollbarWidth)).toBe('none');
    // Scroll down, then right: rows stay put (the scroll range is not clamped back).
    await scroller.evaluate((e) => (e.scrollTop = e.scrollHeight));
    await page.waitForTimeout(100);
    const top = await scroller.evaluate((e) => e.scrollTop);
    await scroller.evaluate((e) => (e.scrollLeft = 300));
    await page.waitForTimeout(400);
    expect(await scroller.evaluate((e) => e.scrollTop)).toBe(top);
  });

  test('the last rows scroll fully into view above the total row and below header filters', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:pinning');
    const root = grid(page, 'grid-pinning');
    const scroller = root.locator('.MuiDataGrid-virtualScroller');
    await scroller.evaluate((e) => (e.scrollTop = e.scrollHeight));
    await page.waitForTimeout(600);
    const { lastBottom, totalTop } = await root.evaluate((r) => {
      const rows = r.querySelectorAll('.MuiDataGrid-virtualScrollerRenderZone > .MuiDataGrid-row');
      return {
        lastBottom: rows[rows.length - 1]!.getBoundingClientRect().bottom,
        totalTop: r.querySelector('.TectonDataGrid-pinnedRows--bottom')!.getBoundingClientRect()
          .top,
      };
    });
    expect(lastBottom).toBeLessThanOrEqual(totalTop + 1);
  });

  test('the multi-sort priority badge sits on the sort arrow', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const head = header(root, 'department');
    const badge = await head.locator('.MuiBadge-badge').boundingBox();
    const button = await head.locator('.MuiDataGrid-sortButton').boundingBox();
    const box = await head.boundingBox();
    expect(badge!.y).toBeGreaterThanOrEqual(box!.y);
    // Overlaps the button's top end corner.
    expect(badge!.x).toBeGreaterThan(button!.x);
    expect(badge!.y).toBeLessThan(button!.y + button!.height / 2);
  });

  test('group labels count the rows in the group; the column menu has no doubled dividers', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:grouping');
    const root = grid(page, 'grid-grouping');
    // 200 employees in 4 departments: the first department group holds 50 rows (in 3 site groups).
    await expect(root.locator('.MuiDataGrid-row[data-rowindex="0"]')).toContainText('(50)');
    const groupColumn = root.locator('.MuiDataGrid-columnHeader').first();
    await groupColumn.hover();
    await groupColumn.locator('.MuiDataGrid-menuIconButton').click();
    const layout = await page.locator('.MuiDataGrid-menuList').evaluate((list) =>
      Array.from(list.children)
        .filter((e) => getComputedStyle(e).display !== 'none')
        .map((e) => (e.tagName === 'HR' ? '|' : 'item')),
    );
    expect(layout[0]).not.toBe('|');
    expect(layout[layout.length - 1]).not.toBe('|');
    expect(layout.join(' ')).not.toContain('| |');
  });

  test('keyboard focus is visible on cells and headers, not on mouse focus', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const cell = root.locator(
      '.MuiDataGrid-row[data-rowindex="2"] .MuiDataGrid-cell[data-field="site"]',
    );
    await cell.click();
    const outline = () =>
      page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(await outline()).toBe('none');
    await page.keyboard.press('ArrowRight');
    expect(await outline()).toBe('solid');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(header(root, 'salary')).toBeFocused();
    expect(await outline()).toBe('solid');
  });

  test('arrow keys move through the header filter row', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const filter = (field: string) =>
      root.locator(`.TectonDataGrid-headerFilterCell[data-field="${field}"] input`);
    await root
      .locator('.MuiDataGrid-row[data-rowindex="0"] .MuiDataGrid-cell[data-field="name"]')
      .click();
    await page.keyboard.press('ArrowUp');
    await expect(filter('name')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(header(root, 'name')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(filter('name')).toBeFocused();
    // Left/Right move between filters once the caret is at the edge of the text.
    await page.keyboard.type('Em');
    await page.keyboard.press('ArrowRight');
    await expect(filter('department')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(filter('name')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(filter('id')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(
      root.locator('.MuiDataGrid-row[data-rowindex="0"] .MuiDataGrid-cell[data-field="id"]'),
    ).toBeFocused();
  });

  test('arrow keys step over detail panels', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    await root
      .locator('.MuiDataGrid-row[data-rowindex="0"] .TectonDataGrid-detailPanelToggle')
      .click();
    const detail = root.locator('.TectonDataGrid-row--detail').first();
    const index = Number(await detail.getAttribute('data-rowindex'));
    await root
      .locator(
        `.MuiDataGrid-row[data-rowindex="${index - 1}"] .MuiDataGrid-cell[data-field="name"]`,
      )
      .click();
    await page.keyboard.press('ArrowDown');
    const below = root.locator(
      `.MuiDataGrid-row[data-rowindex="${index + 1}"] .MuiDataGrid-cell[data-field="name"]`,
    );
    await expect(below).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(
      root.locator(
        `.MuiDataGrid-row[data-rowindex="${index - 1}"] .MuiDataGrid-cell[data-field="name"]`,
      ),
    ).toBeFocused();
  });

  test('the dragged column is painted as the drop slot', async ({ page }) => {
    await page.goto('/?scenario=grid:sorting');
    const root = grid(page, 'grid-sorting');
    const source = await header(root, 'site')
      .locator('.MuiDataGrid-columnHeaderTitle')
      .boundingBox();
    await page.mouse.move(source!.x + 10, source!.y + 8);
    await page.mouse.down();
    await page.mouse.move(source!.x - 120, source!.y + 8, { steps: 8 });
    const slot = (sel: string) =>
      root
        .locator(sel)
        .first()
        .evaluate((e) => getComputedStyle(e).boxShadow);
    expect(await slot('.MuiDataGrid-columnHeader[data-field="site"]')).toContain('inset');
    expect(await slot('.MuiDataGrid-row .MuiDataGrid-cell[data-field="site"]')).toContain('inset');
    // Header tooltips and hover paint are off during the drag.
    expect(
      await root
        .locator('.MuiDataGrid-columnHeaders')
        .evaluate((e) => getComputedStyle(e).pointerEvents),
    ).toBe('none');
    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('row drag scrolls a virtualized grid both ways and drops; shows the total row count', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:virtual');
    const root = grid(page, 'grid-virtual');
    await expect(root.locator('.MuiDataGrid-footerContainer')).toContainText('2,000');
    const scroller = root.locator('.MuiDataGrid-virtualScroller');
    const rows = await root.locator('.MuiDataGrid-virtualScrollerRenderZone').boundingBox();
    const view = await scroller.boundingBox();
    const headerBottom = await root
      .locator('.MuiDataGrid-topContainer')
      .evaluate((e) => e.getBoundingClientRect().bottom);
    const drag = async (rowIndex: number, toY: number, waitMs: number) => {
      const handle = root.locator(
        `.MuiDataGrid-row[data-rowindex="${rowIndex}"] [data-row-reorder-handle]`,
      );
      const hb = await handle.boundingBox();
      await page.mouse.move(hb!.x + hb!.width / 2, hb!.y + hb!.height / 2);
      await page.mouse.down();
      await page.mouse.move(hb!.x + hb!.width / 2, hb!.y + hb!.height / 2 + 10, { steps: 2 });
      await page.mouse.move(hb!.x + hb!.width / 2, toY, { steps: 6 });
      await page.waitForTimeout(waitMs);
    };
    // Down: near the bottom edge of the rows.
    await drag(1, view!.y + view!.height - 16, 800);
    const scrolledDown = await scroller.evaluate((e) => e.scrollTop);
    expect(scrolledDown).toBeGreaterThan(200);
    // The source row is out of view: a slot box marks where it will land.
    await expect(page.locator('.TectonDataGrid-dragSlot')).toBeVisible();
    await page.mouse.up();
    await page.waitForTimeout(300);
    // Up: just below the headers (not over them).
    const visible = await root.evaluate(
      (r) =>
        Array.from(r.querySelectorAll<HTMLElement>('.MuiDataGrid-row[data-rowindex]'))
          .filter(
            (row) =>
              row.getBoundingClientRect().top >
              r.querySelector('.MuiDataGrid-topContainer')!.getBoundingClientRect().bottom + 60,
          )
          .map((row) => Number(row.dataset.rowindex))[0],
    );
    await drag(visible!, headerBottom + 12, 600);
    expect(await scroller.evaluate((e) => e.scrollTop)).toBeLessThan(scrolledDown);
    await page.mouse.up();
    expect(rows).not.toBeNull();
    // The first drop moved "Item 2" down: row 2 now shows "Item 3".
    await scroller.evaluate((e) => (e.scrollTop = 0));
    await expect(root.locator('.MuiDataGrid-row[data-rowindex="1"]')).toContainText('Item 3');
  });
  test('toolbar: quick filter, filter panel with an active-filter marker, export menu', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:toolbar');
    const root = grid(page, 'grid-toolbar');
    const footer = root.locator('.MuiDataGrid-footerContainer');
    await expect(footer).toContainText('of 40');
    // Quick filter: rows containing every word.
    await root.getByRole('searchbox').fill('Research Houston');
    await expect(footer).toContainText('1–3 of 3');
    await root.getByRole('searchbox').fill('');
    await expect(footer).toContainText('of 40');
    // Filter panel opened from the toolbar; the button is marked while a filter is active.
    const filters = root.getByRole('button', { name: 'Filters' });
    await expect(filters.locator('.MuiBadge-badge')).toHaveClass(/MuiBadge-invisible/);
    await filters.click();
    const panel = page.locator('.TectonDataGrid-filterPanel');
    await expect(panel).toBeVisible();
    // Outlined inputs with a closed border, as in the Tecton drop-in filter menu.
    expect(await panel.locator('.MuiFilledInput-root').count()).toBe(0);
    for (const legend of await panel.locator('.MuiOutlinedInput-notchedOutline legend').all()) {
      expect(await legend.evaluate((e) => e.getBoundingClientRect().width)).toBeLessThan(1);
    }
    // The first condition targets the first column (ID, "=").
    await panel.locator('.MuiDataGrid-filterFormValueInput input').first().fill('5');
    await expect(footer).toContainText('1–1 of 1');
    // A second condition: its And/Or selector and delete button line up with its inputs.
    await panel.getByRole('button', { name: 'Add filter' }).click();
    const tops = await panel
      .locator('.MuiDataGrid-filterForm')
      .nth(1)
      .evaluate((form) =>
        Array.from(form.children).map((child) =>
          Math.round(
            (child.querySelector('.MuiInputBase-root, button') ?? child).getBoundingClientRect()
              .top,
          ),
        ),
      );
    expect(new Set(tops).size).toBe(1);
    await page.keyboard.press('Escape');
    await expect(filters.locator('.MuiBadge-badge')).not.toHaveClass(/MuiBadge-invisible/);
    // Toolbar icons are Tecton icons, not Material SVGs.
    expect(await root.locator('.MuiDataGrid-toolbar svg').count()).toBe(0);
    await root.getByRole('button', { name: 'Export' }).click();
    await expect(page.getByRole('menuitem', { name: 'Download as CSV' })).toBeVisible();
  });

  test('row stripes follow the row index wherever the virtualized window starts', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:virtual');
    const root = grid(page, 'grid-virtual');
    const scroller = root.locator('.MuiDataGrid-virtualScroller');
    await expect(root.locator('.MuiDataGrid-row[data-rowindex="0"]')).toBeVisible();
    // Keep the pointer off the rows (hover paints its own background).
    await page.mouse.move(0, 0);
    const stripes = () =>
      root.evaluate((r) => {
        const byParity: [Set<string>, Set<string>] = [new Set(), new Set()];
        for (const row of r.querySelectorAll<HTMLElement>(
          '.MuiDataGrid-virtualScrollerRenderZone > .MuiDataGrid-row[data-rowindex]',
        )) {
          byParity[Number(row.dataset.rowindex) % 2]!.add(getComputedStyle(row).backgroundColor);
        }
        return byParity.map((set) => [...set]);
      });
    const first = await stripes();
    expect(first[0]).toHaveLength(1);
    expect(first[1]).toHaveLength(1);
    expect(first[0]).not.toEqual(first[1]);
    // Scroll so that the render window starts at odd and even rows: the stripes stay put.
    const rowHeight = await root
      .locator('.MuiDataGrid-row[data-rowindex="0"]')
      .evaluate((e) => e.getBoundingClientRect().height);
    for (const rows of [37, 500, 501, 1001]) {
      await scroller.evaluate((e, top) => (e.scrollTop = top), rows * rowHeight);
      await expect(root.locator(`.MuiDataGrid-row[data-rowindex="${rows + 1}"]`)).toBeVisible();
      expect(await stripes()).toEqual(first);
    }
  });

  test('the column menu changes aggregation functions and grouping (initial models)', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:grouping');
    const root = grid(page, 'grid-grouping');
    const salary = header(root, 'salary');
    const groupSalary = root.locator('.MuiDataGrid-row[data-rowindex="0"] [data-field="salary"]');
    const totalSalary = root.locator('.TectonDataGrid-pinnedRow [data-field="salary"]');
    await expect(totalSalary).toHaveText('$20,908,100');
    const openMenu = async (field: string) => {
      const h = header(root, field);
      await h.hover();
      await h.locator('.MuiDataGrid-menuIcon button').click();
    };
    // sum -> avg: group rows, the total row and the header label follow.
    await openMenu('salary');
    await page.getByRole('menuitem', { name: 'avg' }).click();
    await expect(salary).toContainText('avg');
    await expect(totalSalary).toHaveText('$104,541');
    await expect(groupSalary).toHaveText('$103,462');
    // Choosing the active function again removes the aggregation.
    await openMenu('salary');
    await page.getByRole('menuitem', { name: 'avg' }).click();
    await expect(totalSalary).toHaveText('');
    await expect(groupSalary).toHaveText('');
    // Stop grouping by Site from its column menu: the expanded department group now lists its
    // employees directly (no site groups).
    await expect(root.locator('.MuiDataGrid-row[data-rowindex="1"]')).toContainText('Houston(17)');
    await openMenu('site');
    await page.getByRole('menuitem', { name: 'Stop grouping by Site' }).click();
    await expect(root.locator('.MuiDataGrid-row[data-rowindex="1"]')).toContainText('Employee');
  });

  test('compact density shrinks rows, the header filter row and the aggregation row', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:pinning&density=compact');
    const root = grid(page, 'grid-pinning');
    const height = (selector: string) =>
      root
        .locator(selector)
        .first()
        .evaluate((e) => Math.round(e.getBoundingClientRect().height));
    await expect(root.locator('.MuiDataGrid-row[data-rowindex="0"]')).toBeVisible();
    expect(await height('.MuiDataGrid-row[data-rowindex="0"]')).toBe(36);
    expect(await height('.TectonDataGrid-headerFilterRow')).toBe(36);
    expect(
      await height(
        '.TectonDataGrid-pinnedRow.TectonDataGrid-aggregationRow, .TectonDataGrid-pinnedRow:last-child',
      ),
    ).toBe(36);
  });

  test('filter panel from the keyboard; multi-value input and active-filter dot layout', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:toolbar');
    const root = grid(page, 'grid-toolbar');
    const filters = root.getByRole('button', { name: 'Filters', exact: true });
    // Enter on the toolbar button moves the focus into the panel; Escape returns it.
    await filters.focus();
    await page.keyboard.press('Enter');
    const panel = page.locator('.TectonDataGrid-filterPanel');
    await expect(panel).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest('.MuiDataGrid-panel')))
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(filters).toBeFocused();
    // "is any of": the chips and the text stay clear of the clear and popup buttons.
    await filters.click();
    await panel.locator('.MuiDataGrid-filterFormOperatorInput [role="combobox"]').click();
    await page.getByRole('option', { name: 'is any of' }).click();
    const input = panel.locator('.MuiDataGrid-filterFormValueInput input');
    await input.fill('5');
    await input.press('Enter');
    await input.fill('7');
    await input.press('Enter');
    await expect(panel.locator('.MuiDataGrid-filterFormValueInput .MuiChip-root')).toHaveCount(2);
    const [inputRight, buttonsLeft] = await panel
      .locator('.MuiDataGrid-filterFormValueInput .MuiAutocomplete-inputRoot')
      .evaluate((r) => [
        r.querySelector('input')!.getBoundingClientRect().right,
        r.querySelector('.MuiAutocomplete-endAdornment')!.getBoundingClientRect().left,
      ]);
    expect(inputRight).toBeLessThanOrEqual(buttonsLeft);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    // The active-filter dot sits on the corner of the 20px icon, not 10px above it.
    const [icon, dot] = await filters.evaluate((b) =>
      [b.querySelector('[class*="tecton-filter"]')!, b.querySelector('.MuiBadge-badge')!].map(
        (e) => e.getBoundingClientRect().toJSON() as DOMRect,
      ),
    );
    expect(Math.abs(dot.top + dot.height / 2 - icon.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(dot.left + dot.width / 2 - icon.right)).toBeLessThanOrEqual(1);
  });

  test('infinite scroll appends client rows; infinite loading stops at the last server row', async ({
    page,
  }) => {
    await page.goto('/?scenario=grid:infinite');
    const count = page.getByTestId('infinite-count');
    await expect(count).toHaveText('20');
    const client = page.getByTestId('grid-infinite').locator('.MuiDataGrid-root').first();
    const scrollToEnd = (root: Locator) =>
      root.locator('.MuiDataGrid-virtualScroller').evaluate((e) => (e.scrollTop = e.scrollHeight));
    for (const expected of ['40', '60', '80', '100']) {
      await scrollToEnd(client);
      await expect(count).toHaveText(expected);
    }
    // No more rows once the handler is removed.
    await scrollToEnd(client);
    await page.waitForTimeout(300);
    await expect(count).toHaveText('100');

    // Server without rowCount: 130 rows in chunks of 40; ends at row 130 with no placeholders.
    const server = page.getByTestId('grid-infinite-server').locator('.MuiDataGrid-root');
    await expect(server.locator('.MuiDataGrid-row[data-rowindex="0"]')).toContainText('Item 1');
    for (let i = 0; i < 6; i++) {
      await scrollToEnd(server);
      await page.waitForTimeout(250);
    }
    await expect(server.locator('.MuiDataGrid-row[data-rowindex="129"]')).toContainText('Item 130');
    await expect(server.locator('.MuiDataGrid-row[data-rowindex="130"]')).toHaveCount(0);
    await expect(server.locator('.TectonDataGrid-row--skeleton')).toHaveCount(0);
  });

  test('one focus ring: a focused header filter input does not ring its cell too', async ({
    page,
  }) => {
    const cellOutline = () =>
      page.evaluate(() => {
        const cell = document.activeElement?.closest(
          '.MuiDataGrid-cell, .MuiDataGrid-columnHeader',
        );
        return cell ? getComputedStyle(cell).outlineStyle : 'no cell';
      });
    // Header filter: keyboard focus from the first row (ArrowUp).
    await page.goto('/?scenario=grid:sorting');
    const sorting = grid(page, 'grid-sorting');
    await sorting
      .locator('.MuiDataGrid-row[data-rowindex="0"] .MuiDataGrid-cell[data-field="name"]')
      .click();
    await page.keyboard.press('ArrowUp');
    await expect(
      sorting.locator('.TectonDataGrid-headerFilterCell[data-field="name"] input'),
    ).toBeFocused();
    expect(await cellOutline()).toBe('none');
    // The control draws Tecton's ring itself.
    expect(
      await page.evaluate(() => {
        const control = document.activeElement?.closest('.TectonDataGrid-headerFilterControl');
        return control ? getComputedStyle(control).boxShadow : 'none';
      }),
    ).not.toBe('none');
    // A plain cell focused from the keyboard still shows the cell ring.
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(() =>
        page.evaluate(() => document.activeElement?.classList.contains('MuiDataGrid-cell')),
      )
      .toBe(true);
    expect(await cellOutline()).toBe('solid');
  });
});
