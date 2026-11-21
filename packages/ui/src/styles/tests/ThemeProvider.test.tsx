import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar';
import { MonthCalendar } from '@mui/x-date-pickers/MonthCalendar';
import { LocalizationProvider } from '../../LocalizationProvider/index.js';
import {
  ThemeProvider,
  createTheme,
  getThemeManager,
  useTectonMode,
  initTecton,
} from '../index.js';
import { __resetModeStoreForTests } from '../modeStore.js';
import { GRID_FOCUS_SELECTOR } from '../tecton/compat.js';

function ThemeProbe({ id = 'probe' }: { id?: string }) {
  const theme = useTheme();
  return (
    <span data-testid={id} data-mode={theme.palette.mode} data-dir={theme.direction}>
      {theme.typography.fontFamily}
    </span>
  );
}

beforeEach(() => {
  localStorage.clear();
  delete (globalThis as Record<string, unknown>).__WEBFRAMEWORK_TECTON_THEME_MANAGER__;
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('data-theme');
  __resetModeStoreForTests();
});

describe('ThemeProvider', () => {
  it('provides the Tecton theme with no configuration', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-mode', 'light');
    expect(probe.textContent).toContain('var(--tecton-font-family-sans)');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.querySelector('style[data-tecton="tokens"]')).not.toBeNull();
  });

  it('follows the shared themeManager across independent React roots', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.append(a, b);
    const rootA = createRoot(a);
    const rootB = createRoot(b);
    act(() => {
      rootA.render(
        <ThemeProvider>
          <ThemeProbe id="a" />
        </ThemeProvider>,
      );
      rootB.render(
        <ThemeProvider>
          <ThemeProbe id="b" />
        </ThemeProvider>,
      );
    });
    act(() => getThemeManager()!.toggleMode());
    expect(a.querySelector('[data-testid=a]')).toHaveAttribute('data-mode', 'dark');
    expect(b.querySelector('[data-testid=b]')).toHaveAttribute('data-mode', 'dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    act(() => {
      rootA.unmount();
      rootB.unmount();
    });
  });

  it('reuses one cached theme object per mode', () => {
    const seen: unknown[] = [];
    function Capture() {
      seen.push(useTheme());
      return null;
    }
    const { rerender } = render(
      <ThemeProvider>
        <Capture />
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider>
        <Capture />
      </ThemeProvider>,
    );
    expect(seen[0]).toBe(seen[1]);
  });

  it('applies themeOptions on top of Tecton defaults and keeps the shared mode', () => {
    getThemeManager()!.setMode('dark');
    const options = { shape: { borderRadius: 2 } };
    function Radius() {
      const t = useTheme();
      return <span data-testid="r" data-radius={t.shape.borderRadius} data-mode={t.palette.mode} />;
    }
    render(
      <ThemeProvider themeOptions={options}>
        <Radius />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('r')).toHaveAttribute('data-radius', '2');
    expect(screen.getByTestId('r')).toHaveAttribute('data-mode', 'dark');
  });

  it('uses an explicit theme as-is (MUI semantics) and supports rtl', () => {
    const theme = createTheme({ palette: { mode: 'dark' } });
    render(
      <ThemeProvider theme={theme}>
        <ThemeProbe id="explicit" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('explicit')).toHaveAttribute('data-mode', 'dark');
    render(
      <ThemeProvider direction="rtl">
        <ThemeProbe id="rtl" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('rtl')).toHaveAttribute('data-dir', 'rtl');
  });

  it('accepts a partial theme nested inside the Tecton theme (MUI semantics)', () => {
    function Primary() {
      return <span data-testid="primary">{useTheme().palette.primary.main}</span>;
    }
    render(
      <ThemeProvider>
        <ThemeProvider
          theme={(outer) => ({
            ...outer,
            palette: { ...outer.palette, primary: { ...outer.palette.primary, main: '#007FFF' } },
          })}
        >
          <Primary />
        </ThemeProvider>
        <ThemeProvider theme={{ shape: { borderRadius: 2 } }}>
          <ThemeProbe id="partial" />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('primary')).toHaveTextContent('#007FFF');
    // The partial theme keeps the outer palette.
    expect(screen.getByTestId('partial')).toHaveAttribute('data-mode', 'light');
  });

  it('renders inputs with placeholders in rtl (Tecton input styles use ::placeholder)', () => {
    expect(() =>
      render(
        <ThemeProvider direction="rtl">
          <TextField placeholder="Search" label="Search" />
          <InputBase placeholder="Filter" inputProps={{ readOnly: true }} />
        </ThemeProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByPlaceholderText('Filter')).toBeInTheDocument();
  });

  it('exposes mode controls through useTectonMode with stable actions', () => {
    const apis: ReturnType<typeof useTectonMode>[] = [];
    function Toggle() {
      const api = useTectonMode();
      apis.push(api);
      return <button onClick={api.toggleMode}>{api.mode}</button>;
    }
    render(<Toggle />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(localStorage.getItem('tecton-theme-mode')).toBe('dark');
    expect(apis[0].toggleMode).toBe(apis[apis.length - 1].toggleMode);
    act(() => apis[0].setMode('light'));
    expect(apis[apis.length - 1].preference).toBe('light');
    act(() => apis[0].clearPreference());
    expect(localStorage.getItem('tecton-theme-mode')).toBeNull();
  });

  it('does not inject tokens twice when the global stylesheet already provides them', () => {
    const style = document.createElement('style');
    style.textContent = ':root{--tecton-space-100:8px}';
    document.head.appendChild(style);
    const original = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const cs = original(el);
      return {
        ...cs,
        getPropertyValue: (p: string) =>
          p === '--tecton-space-100' ? '8px' : cs.getPropertyValue(p),
      } as CSSStyleDeclaration;
    });
    initTecton({ defaultMode: 'light' });
    const markers = document.querySelectorAll('style[data-tecton="tokens"]');
    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveAttribute('data-tecton-static', 'true');
    vi.restoreAllMocks();
  });

  it('hydrates server markup rendered in the server mode without mismatch', () => {
    localStorage.setItem('tecton-theme-mode', 'dark');
    const container = document.createElement('div');
    document.body.appendChild(container);
    // Server render: no manager on the server -> light.
    const html = renderToString(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(html).toContain('data-mode="light"');
    container.innerHTML = html;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot>;
    act(() => {
      root = hydrateRoot(
        container,
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );
    });
    expect(container.querySelector('[data-testid=probe]')).toHaveAttribute('data-mode', 'dark');
    errors.mockRestore();
    act(() => root.unmount());
  });
});

describe('createTheme', () => {
  it('starts from Tecton defaults and merges extra args like MUI', () => {
    const theme = createTheme({ palette: { mode: 'dark' } }, { custom: { x: 1 } });
    expect(theme.palette.mode).toBe('dark');
    expect(theme.typography.button.textTransform).toBe('none');
    expect((theme as unknown as { custom: { x: number } }).custom.x).toBe(1);
    expect(theme.spacing(2)).toBe('calc(var(--tecton-space-100) * 2)');
  });

  it('includes the MUI 9 TablePagination icon compat override', () => {
    const theme = createTheme();
    const slots = theme.components?.MuiTablePagination?.defaultProps?.slots as { actions?: object };
    expect(slots.actions).toHaveProperty('nextButtonIcon');
  });
});

describe('Tecton compat corrections', () => {
  it('keeps the selected day as the Tecton Storybook renders it and restores disabled days', () => {
    const root = createTheme().components?.MuiPickerDay?.styleOverrides?.root as Record<
      string,
      unknown
    >;
    // Tecton's `.MuiPickerDay-selected` rule never matches MUI X 9; the Storybook shows MUI's own
    // selected day, so no selected alias is added.
    expect(root['&.MuiPickerDay-selected']).toBeDefined();
    expect(root['&.Mui-selected']).toBeUndefined();
    // Disabled days must look disabled: Tecton's disabled token on MUI X 9's `Mui-disabled`.
    expect(root['&.Mui-disabled:not(.Mui-selected)']).toEqual({
      color: 'var(--tecton-color-text-disabled)',
    });
  });

  it('does not pass the unknown disableRipple prop to the year and month calendars', () => {
    const components = createTheme().components as Record<
      string,
      { defaultProps?: Record<string, unknown> } | undefined
    >;
    expect(components.MuiYearCalendar?.defaultProps).not.toHaveProperty('disableRipple');
    expect(components.MuiMonthCalendar?.defaultProps).not.toHaveProperty('disableRipple');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ThemeProvider>
        <LocalizationProvider>
          <YearCalendar />
          <MonthCalendar />
        </LocalizationProvider>
      </ThemeProvider>,
    );
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/disableRipple/);
    errors.mockRestore();
  });

  it('gives the TimeClock face a visible Tecton surface in dark mode only', () => {
    const clockOf = (mode: 'light' | 'dark') =>
      (
        createTheme({ palette: { mode } }).components as Record<
          string,
          { styleOverrides?: Record<string, unknown> } | undefined
        >
      ).MuiClock?.styleOverrides?.clock;
    expect(clockOf('dark')).toEqual({
      backgroundColor: 'var(--tecton-color-component-input-filled-background)',
    });
    expect(clockOf('light')).toBeUndefined();
  });
});

describe('Tecton data grid corrections', () => {
  it('uses Tecton icons for the toolbar and filter panel slots', () => {
    const slots = (
      createTheme().components as Record<
        string,
        { defaultProps: { slots: Record<string, unknown> } }
      >
    ).MuiDataGrid.defaultProps.slots;
    for (const name of [
      'columnSelectorIcon',
      'openFilterButtonIcon',
      'exportIcon',
      'quickFilterIcon',
      'filterPanelDeleteIcon',
      // Tecton's own column menu icons are kept.
      'columnMenuIcon',
    ]) {
      expect((slots[name] as { displayName?: string }).displayName).toBe('TectonSlotIcon');
    }
  });

  it('draws a visible keyboard focus indicator on cells and column headers', () => {
    const grid = (
      createTheme().components as Record<
        string,
        { styleOverrides: Record<string, Record<string, unknown>> }
      >
    ).MuiDataGrid.styleOverrides;
    for (const slot of ['cell', 'columnHeader']) {
      expect(grid[slot][GRID_FOCUS_SELECTOR]).toEqual({
        outline: 'var(--tecton-border-width-200) solid var(--tecton-color-focus-ring)',
        outlineOffset: 'calc(-1 * var(--tecton-border-width-200))',
      });
    }
  });
});

describe('Tecton menu corrections', () => {
  it('pulls the menu list back without a bottom margin (no 1px scroll overflow)', () => {
    const components = createTheme().components as Record<string, Record<string, any>>;
    for (const paper of [
      components.MuiMenu.styleOverrides.paper,
      components.MuiSelect.defaultProps.MenuProps.slotProps.paper.sx,
    ]) {
      expect(paper['& > :first-child']).toEqual({
        marginTop: 'calc(-1 * var(--tecton-border-width-100))',
      });
      expect(paper['& > :last-child']).toEqual({ marginBottom: 0 });
      expect(paper['& > .MuiList-padding:last-child']).toEqual({
        paddingBottom: 'calc(8px - var(--tecton-border-width-100))',
      });
    }
  });
});

describe('Tecton tree item corrections', () => {
  it('draws the focus ring on keyboard focus and aligns nested loading rows', () => {
    const components = createTheme().components as Record<
      string,
      { styleOverrides: Record<string, Record<string, unknown>> }
    >;
    const content = components.MuiTreeItem.styleOverrides.content;
    expect(content['.MuiTreeItem-root:focus-visible > &&']).toHaveProperty('boxShadow');
    // Tecton's own rule (kept): no ring for every focus, including mouse focus.
    expect(content['&[data-focused]']).toMatchObject({ boxShadow: 'none' });
    expect(components.MuiTreeItemLoader.styleOverrides.root).toEqual({
      '.MuiTreeItem-groupTransition &': { paddingLeft: 'var(--tecton-space-100)' },
    });
  });
});

describe('Tecton tree view defaults', () => {
  it('shares the Tecton SimpleTreeView defaults with RichTreeView', () => {
    const components = createTheme().components as Record<string, unknown>;
    expect(components.MuiRichTreeView).toBe(components.MuiSimpleTreeView);
  });
});

describe('Tecton Data Grid compat', () => {
  it('uses the Tecton divider token for grid dividers (as the table) and aligns the header checkbox', () => {
    const overrides = createTheme().components?.MuiDataGrid?.styleOverrides as Record<
      string,
      Record<string, unknown>
    >;
    expect(overrides.root['&&']).toEqual({
      '--DataGrid-t-color-border-base': 'var(--tecton-color-divider)',
    });
    // MUI X already draws the header bottom border on each header cell (in the border colour
    // above); Tecton's extra border on the header container is removed so it is not 2px.
    expect(overrides.columnHeaders.borderBottom).toBe('none');
    // Hovered rows have no stroke; the selected row stroke is an overlay, not a layout-shifting
    // border.
    const row = overrides.row as Record<string, Record<string, unknown>>;
    expect(row['&:hover'].border).toBe('none');
    expect(row['&:hover']).not.toHaveProperty('&::after');
    const rowSelected = row['&.Mui-selected, &.Mui-selected:hover'];
    expect(rowSelected.border).toBe('none');
    expect((rowSelected['&::after'] as Record<string, unknown>).pointerEvents).toBe('none');
    expect(overrides.columnHeader['&.MuiDataGrid-columnHeaderCheckbox']).toEqual({ padding: 0 });
  });
});

describe('Tecton data grid header and striping', () => {
  const grid = () =>
    createTheme().components?.MuiDataGrid?.styleOverrides as Record<
      string,
      Record<string, unknown>
    >;

  it('draws header sort and menu icons like the Tecton table (16px, secondary text)', () => {
    const overrides = grid();
    expect(overrides.sortIcon).toEqual({
      color: 'var(--tecton-color-text-secondary)',
      width: 'var(--tecton-icon-size-100)',
      height: 'var(--tecton-icon-size-100)',
    });
    expect(overrides.menuIconButton).toEqual({ color: 'var(--tecton-color-text-secondary)' });
    expect(overrides.columnHeaderTitle).toMatchObject({
      fontWeight: 'var(--tecton-font-weight-medium-strong)',
    });
  });

  it('stripes rows by row index, not by DOM position in the virtualized window', () => {
    const row = grid().row;
    expect(row).not.toHaveProperty('&:nth-of-type(even)');
    expect(row).toHaveProperty('&.TectonDataGrid-row--odd');
  });
});

describe('Tecton outlined input', () => {
  it('keeps the outline closed for a Select label (static Tecton labels)', () => {
    expect(createTheme().components?.MuiOutlinedInput?.defaultProps).toMatchObject({
      notched: false,
    });
  });
});
