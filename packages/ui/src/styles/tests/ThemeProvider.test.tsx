import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { useTheme } from '@mui/material/styles';
import {
  ThemeProvider,
  createTheme,
  getThemeManager,
  useTectonMode,
  initTecton,
} from '../index.js';
import { __resetModeStoreForTests } from '../modeStore.js';

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
  it('aliases PickerDay state rules onto the classes MUI X renders', () => {
    const root = createTheme().components?.MuiPickerDay?.styleOverrides?.root as Record<
      string,
      unknown
    >;
    expect(root['&.Mui-selected']).toBe(root['&.MuiPickerDay-selected']);
    expect(root['&.Mui-disabled']).toBe(root['&.MuiPickerDay-disabled']);
  });
});

describe('Tecton tree view defaults', () => {
  it('shares the Tecton SimpleTreeView defaults with RichTreeView', () => {
    const components = createTheme().components as Record<string, unknown>;
    expect(components.MuiRichTreeView).toBe(components.MuiSimpleTreeView);
  });
});
