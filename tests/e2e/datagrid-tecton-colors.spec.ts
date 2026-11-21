import { expect, test, type Page } from '@playwright/test';

// The grid's toolbar, panels, menus and footer use the Tecton tokens the Tecton drop-in table and
// menus use (Tecton Storybook, drop-ins: wc-table, wc-filter-menu, wc-column-menu,
// wc-datagrid-menu, wc-export-menu), in both modes.

/** Resolves a Tecton color token to the computed `rgb()` string. */
const token = (page: Page, name: string) =>
  page.evaluate((n) => {
    const probe = document.createElement('div');
    probe.style.color = `var(--tecton-${n})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);

const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);
const width = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((e) => Math.round(e.getBoundingClientRect().width));

for (const mode of ['light', 'dark'] as const) {
  test.describe(`DataGrid Tecton colors (${mode})`, () => {
    test('toolbar, filter panel, columns panel, column menu and footer', async ({ page }) => {
      await page.goto(`/?scenario=grid:toolbar&mode=${mode}`);
      const root = page.getByTestId('grid-toolbar').locator('.MuiDataGrid-root');
      await expect(root.locator('.MuiDataGrid-row').first()).toBeVisible();

      // Quick filter search icon: 20px, not 1em of the small input text.
      await root.getByRole('button', { name: 'Search' }).click();
      await expect(root.getByRole('searchbox')).toBeVisible();
      expect(
        await width(
          page,
          '.MuiDataGrid-toolbarQuickFilter .MuiInputAdornment-root > [class*="tecton-"]',
        ),
      ).toBe(20);

      // Footer text and pagination arrows.
      const secondary = await token(page, 'color-text-secondary');
      expect(await style(page, '.MuiTablePagination-selectLabel', 'color')).toBe(secondary);
      expect(await style(page, '.MuiTablePagination-displayedRows', 'color')).toBe(secondary);
      expect(await style(page, '.MuiTablePagination-actions', 'color')).toBe(
        await token(page, 'color-action-tertiary-text'),
      );

      // Filter panel: Tecton paper, no shadow.
      await root.getByRole('button', { name: 'Filters' }).click();
      await expect(page.locator('.TectonDataGrid-filterPanel')).toBeVisible();
      expect(await style(page, '.MuiDataGrid-panel .MuiDataGrid-paper', 'background-color')).toBe(
        await token(page, 'color-bg-paper'),
      );
      expect(await style(page, '.MuiDataGrid-panel .MuiDataGrid-paper', 'box-shadow')).toBe('none');
      await page.keyboard.press('Escape');

      // Columns panel: elevation-2 surface, 20px search icon.
      await root.getByRole('button', { name: 'Columns' }).click();
      await expect(page.locator('.MuiDataGrid-columnsManagement')).toBeVisible();
      expect(await style(page, '.MuiDataGrid-panel .MuiDataGrid-paper', 'background-color')).toBe(
        await token(page, 'color-surface-elevation-2-bg'),
      );
      expect(
        await width(
          page,
          '.MuiDataGrid-columnsManagementSearchInput .MuiInputAdornment-root > [class*="tecton-"]',
        ),
      ).toBe(20);
      await page.keyboard.press('Escape');

      // Column menu: action/secondary surface, tertiary text, 32px items, 14px icons.
      const nameHeader = root.locator('.MuiDataGrid-columnHeader[data-field="name"]');
      await nameHeader.hover();
      await nameHeader.locator('.MuiDataGrid-menuIcon button').click();
      const menuPaper = '.MuiDataGrid-menu .MuiPaper-root';
      await expect(page.locator(menuPaper)).toBeVisible();
      expect(await style(page, menuPaper, 'background-color')).toBe(
        await token(page, 'color-action-secondary-bg'),
      );
      expect(await style(page, menuPaper, 'box-shadow')).toBe('none');
      const item = '.MuiDataGrid-menuList .MuiMenuItem-root';
      expect(await style(page, item, 'color')).toBe(
        await token(page, 'color-action-tertiary-text'),
      );
      // Sizes once the menu's grow transition has finished.
      await expect
        .poll(() =>
          page
            .locator(item)
            .first()
            .evaluate((e) => Math.round(e.getBoundingClientRect().height)),
        )
        .toBe(32);
      await expect
        .poll(() => width(page, '.MuiDataGrid-menuList .MuiListItemIcon-root [class*="tecton-"]'))
        .toBe(14);
    });

    test('a selected row is one color across its width; select header filters use the chevron', async ({
      page,
    }) => {
      await page.goto(`/?scenario=grid:pinning&mode=${mode}`);
      const root = page.getByTestId('grid-pinning').locator('.MuiDataGrid-root');
      const row = root.locator('.MuiDataGrid-row[data-rowindex="0"]');
      await row.locator('input[type="checkbox"]').click();
      await page.mouse.move(0, 0);
      const active = await token(page, 'color-table-cell-bg-active');
      await expect(row).toHaveClass(/Mui-selected/);
      expect(await row.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(active);
      const cellColors = await row
        .locator('.MuiDataGrid-cell:not(.MuiDataGrid-cellEmpty)')
        .evaluateAll((cells) => [
          ...new Set(cells.map((c) => getComputedStyle(c).backgroundColor)),
        ]);
      expect(cellColors).toEqual([active]);
      // No Material SVG icon anywhere in the grid (boolean cells, column separators, header).
      expect(await root.locator('svg.MuiSvgIcon-root').count()).toBe(0);
      // Boolean cells keep their accessible "yes" / "no" on the Tecton icon.
      await expect(
        root.locator('[data-field="producing"] [role="img"][aria-label]').first(),
      ).toHaveAttribute('aria-label', /^(yes|no)$/);
      // The boolean header filter is a NativeSelect: Tecton chevron, not the Material triangle.
      const select = root.locator('.TectonDataGrid-headerFilterRow .MuiNativeSelect-icon');
      await expect(select).toHaveCount(1);
      expect(await select.evaluate((e) => e.tagName)).toBe('SPAN');
    });
  });
}
