import * as React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { ThemeProvider } from '../../styles/index.js';
import Icon from '../../Icon/index.js';
import AppBar, {
  AppBarActions,
  AppBarBrand,
  AppBarTab,
  AppBarTabs,
  appBarClasses,
  type AppBarProps,
  type AppBarTabsProps,
} from '../index.js';
import * as root from '../../index.js';

interface Item {
  id: string;
  label: string;
  closeable?: boolean;
  disabled?: boolean;
  tags?: string[];
}

const TABS: Item[] = [
  { id: 'tab-1', label: 'Tab 1' },
  { id: 'tab-2', label: 'Tab 2' },
];

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

/** A primary bar: branding, Home, the given tabs (closeable unless said otherwise) and actions. */
function Bar({
  value,
  tabs = TABS,
  home = true,
  onChange,
  onClose = () => {},
  onAdd,
  children,
  ...props
}: {
  value: AppBarTabsProps['value'];
  tabs?: Item[];
  home?: boolean;
  onChange?: AppBarTabsProps['onChange'];
  onClose?: (id: string, event: React.SyntheticEvent) => void;
  onAdd?: AppBarTabsProps['onAdd'];
  children?: React.ReactNode;
} & Omit<AppBarProps, 'children' | 'onChange'>) {
  return (
    <AppBar {...props}>
      <AppBarBrand logo={<Icon name="apps" variant="filled" />}>APP</AppBarBrand>
      <AppBarTabs value={value} onChange={onChange} onAdd={onAdd}>
        {home && <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />}
        {tabs.map((tab) => (
          <AppBarTab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={<Icon name="project" />}
            tags={tab.tags}
            disabled={tab.disabled}
            onClose={tab.closeable === false ? undefined : (event) => onClose(tab.id, event)}
          />
        ))}
      </AppBarTabs>
      {children && <AppBarActions>{children}</AppBarActions>}
    </AppBar>
  );
}

/** A page that owns the tabs, as the drop-in stories' host does. */
function Host({
  initialTabs = TABS,
  initialActive = 'tab-1',
  maxTabs,
  onEvent = () => {},
}: {
  initialTabs?: Item[];
  initialActive?: string;
  maxTabs?: number;
  onEvent?: (event: string) => void;
}) {
  const [state, setState] = React.useState({ tabs: initialTabs, active: initialActive });
  const added = React.useRef(0);
  return (
    <Bar
      value={state.active}
      tabs={state.tabs}
      onChange={(_event, id) => {
        onEvent(`select ${id}`);
        setState((s) => ({ ...s, active: String(id) }));
      }}
      onClose={(id) => {
        onEvent(`close ${id}`);
        setState((s) => {
          const index = s.tabs.findIndex((t) => t.id === id);
          const tabs = s.tabs.filter((t) => t.id !== id);
          return {
            tabs,
            active: s.active === id ? (tabs[Math.max(0, index - 1)]?.id ?? 'home') : s.active,
          };
        });
      }}
      onAdd={
        maxTabs == null || state.tabs.length < maxTabs
          ? () => {
              onEvent('add');
              added.current += 1;
              const id = `new-${added.current}`;
              setState((s) => ({
                tabs: [...s.tabs, { id, label: `New tab ${added.current}` }],
                active: id,
              }));
            }
          : undefined
      }
    />
  );
}

/** A Tecton token as the browser resolves it, for comparison with computed styles. */
function tokenColor(token: string) {
  const probe = document.createElement('div');
  probe.style.color = `var(--tecton-${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

describe('AppBar: the bar', () => {
  it('draws the Tecton row with only the parts it is given', () => {
    const { container } = wrap(<AppBar />);
    const bar = screen.getByRole('banner');
    expect(bar.tagName).toBe('HEADER');
    expect(bar).toHaveAttribute('data-region', 'app-bar');
    expect(bar).toHaveClass(appBarClasses.root, appBarClasses.positionStatic);
    expect(bar.querySelector('.MuiToolbar-root')).not.toBeNull();
    // No drop-in defaults: no branding, tabs or add button unless composed.
    expect(container.querySelector('[data-region="branding"]')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
  });

  it('renders the parts and any other content in its row', () => {
    const { container } = wrap(
      <Bar value="tab-1">
        <button type="button">notifications</button>
      </Bar>,
    );
    const bar = screen.getByRole('banner');
    expect(within(bar).getByText('APP')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    const actions = container.querySelector('[data-region="right"][data-slot="actions"]');
    expect(within(actions as HTMLElement).getByText('notifications')).toBeInTheDocument();
    wrap(
      <AppBar>
        <span data-testid="free">Anything</span>
      </AppBar>,
    );
    expect(screen.getByTestId('free').closest('.MuiToolbar-root')).not.toBeNull();
  });

  it('keeps the MUI root props, the ref and `component`', () => {
    const ref = React.createRef<HTMLElement>();
    wrap(
      <AppBar ref={ref} component="nav" position="sticky" className="mine" sx={{ mt: 1 }}>
        <AppBarBrand>Planner</AppBarBrand>
      </AppBar>,
    );
    expect(ref.current?.tagName).toBe('NAV');
    expect(ref.current).toHaveAttribute('data-region', 'app-bar');
    expect(ref.current).toHaveClass('mine', appBarClasses.positionSticky);
    expect(screen.getByText('Planner')).toBeInTheDocument();
  });

  it('exports the parts from the root barrel', () => {
    expect(root.AppBar).toBe(AppBar);
    expect(root.AppBarBrand).toBe(AppBarBrand);
    expect(root.AppBarTabs).toBe(AppBarTabs);
    expect(root.AppBarTab).toBe(AppBarTab);
    expect(root.AppBarActions).toBe(AppBarActions);
    expect(root.appBarClasses).toBe(appBarClasses);
  });

  it('styles tier through the theme without putting it on the DOM', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { container } = wrap(
        <>
          <Bar value="tab-1" />
          <AppBar tier="secondary">
            <AppBarTabs value="a">
              <AppBarTab value="a" label="A" />
            </AppBarTabs>
          </AppBar>
          <AppBar component="nav" tier="secondary" />
        </>,
      );
      const bars = Array.from(container.querySelectorAll('[data-region="app-bar"]'));
      expect(bars.map((bar) => bar.tagName)).toEqual(['HEADER', 'HEADER', 'NAV']);
      for (const bar of bars) {
        for (const name of ['tier', 'rootcomponent']) {
          expect(bar).not.toHaveAttribute(name);
        }
      }
      expect(error).not.toHaveBeenCalled();
      const toolbarHeight = (bar: Element) =>
        getComputedStyle(bar.querySelector('.MuiToolbar-root')!).height;
      expect(toolbarHeight(bars[1]!)).toBe('40px');
      expect(toolbarHeight(bars[0]!)).not.toBe('40px');
    } finally {
      error.mockRestore();
    }
  });

  it('renders on the server', () => {
    const html = renderToString(
      <ThemeProvider>
        <Bar value="tab-1">
          <span>x</span>
        </Bar>
      </ThemeProvider>,
    );
    expect(html).toContain('data-region="app-bar"');
    expect(html).toContain('Tab 2');
    // The close button is laid over the tab after mount, never inside it.
    expect(html).not.toContain('close tab');
  });
});

describe('AppBarBrand', () => {
  it('shows the logo and the name in the documented regions', () => {
    const { container } = wrap(
      <AppBar>
        <AppBarBrand logo={<Icon name="apps" variant="filled" />}>Apps</AppBarBrand>
        <AppBarBrand logo={<img src="x.svg" alt="Product" />}>Product</AppBarBrand>
        <AppBarBrand>Placeholder</AppBarBrand>
        <AppBarBrand logo={null}>No logo</AppBarBrand>
      </AppBar>,
    );
    const [icon, image, placeholder, none] = Array.from(
      container.querySelectorAll('[data-region="branding"]'),
    );
    for (const part of ['branding-lockup', 'branding-logo', 'branding-name']) {
      expect(icon!.querySelector(`[data-region="${part}"]`)).not.toBeNull();
    }
    expect(icon!.querySelector('.tecton-apps-filled.tecton-appbar-icon')).not.toBeNull();
    expect(image!.querySelector('[data-region="branding-logo"] > img')).toHaveAttribute(
      'alt',
      'Product',
    );
    // Left out: the Tecton generic app icon, a pink square, as on the drop-in.
    const square = placeholder!.querySelector('[data-region="branding-logo"] > div')!;
    expect(square).not.toBeNull();
    expect(getComputedStyle(square).backgroundColor).toBe(tokenColor('color-accent-pink-fill'));
    // `null`: no logo at all.
    expect(none!.querySelector('[data-region="branding-logo"]')).toBeNull();
    expect(none).toHaveTextContent('No logo');
  });

  it('colours the logo and the name with the tertiary text colour', () => {
    const { container } = wrap(
      <AppBar>
        <AppBarBrand logo={<Icon name="map" variant="filled" />}>Field Planner</AppBarBrand>
      </AppBar>,
    );
    const lockup = container.querySelector('[data-region="branding-lockup"]') as HTMLElement;
    expect(getComputedStyle(lockup.querySelector('.tecton-appbar-icon')!).color).toBe(
      tokenColor('color-action-tertiary-text'),
    );
    expect(getComputedStyle(within(lockup).getByText('Field Planner')).color).toBe(
      tokenColor('color-action-tertiary-text'),
    );
  });
  it('takes an MUI SvgIcon logo at the icon size, and a raw SVG mark fills the box', () => {
    const { container } = wrap(
      <AppBar>
        <AppBarBrand
          logo={
            <SvgIcon data-testid="svg-icon">
              <path d="M12 2 22 12 12 22 2 12z" />
            </SvgIcon>
          }
        >
          Survey Studio
        </AppBarBrand>
        <AppBarBrand
          logo={
            <svg data-testid="raw-svg" viewBox="0 0 24 24">
              <path d="M12 2 22 12 12 22 2 12z" />
            </svg>
          }
        >
          Raw mark
        </AppBarBrand>
      </AppBar>,
    );
    const icon = screen.getByTestId('svg-icon');
    // Sized and coloured like a Tecton Icon by the theme's `.tecton-appbar-icon` rule, not stretched.
    expect(icon).toHaveClass('tecton-appbar-icon');
    expect(getComputedStyle(icon).width).not.toBe('100%');
    expect(getComputedStyle(icon).color).toBe(tokenColor('color-action-tertiary-text'));
    expect(icon.closest('[data-region="branding-logo"]')).not.toBeNull();
    const raw = screen.getByTestId('raw-svg');
    expect(getComputedStyle(raw).width).toBe('100%');
    expect(getComputedStyle(raw).height).toBe('100%');
    expect(container.querySelectorAll('[data-region="branding-name"]')).toHaveLength(2);
  });
});

describe('AppBarTabs and AppBarTab', () => {
  it('shows a Tecton icon filled on the selected tab and outlined elsewhere', () => {
    const { container } = wrap(
      <AppBar>
        <AppBarTabs value="tab-1">
          <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
          <AppBarTab value="tab-1" icon={<Icon name="project" />} label="Tab 1" />
          <AppBarTab value="tab-2" icon={<Icon name="project" />} label="Tab 2" />
          <AppBarTab value="pinned" icon={<Icon name="pin" variant="filled" />} label="Pinned" />
        </AppBarTabs>
      </AppBar>,
    );
    expect(container.querySelector('.tecton-home-outline.tecton-appbar-icon')).not.toBeNull();
    const [, tab1, tab2, pinned] = screen.getAllByRole('tab');
    expect(tab1!.querySelector('.tecton-project-filled')).not.toBeNull();
    expect(tab2!.querySelector('.tecton-project-outline')).not.toBeNull();
    // An explicit variant is kept.
    expect(pinned!.querySelector('.tecton-pin-filled')).not.toBeNull();
  });

  it('takes an MUI SvgIcon as a tab icon, without a Tecton variant', () => {
    wrap(
      <AppBar>
        <AppBarTabs value="survey">
          <AppBarTab
            value="survey"
            label="Survey"
            icon={
              <SvgIcon data-testid="tab-svg-icon">
                <path d="M12 2 22 12 12 22 2 12z" />
              </SvgIcon>
            }
          />
        </AppBarTabs>
      </AppBar>,
    );
    const icon = screen.getByTestId('tab-svg-icon');
    expect(icon).toHaveClass('tecton-appbar-icon');
    expect(icon).not.toHaveAttribute('variant');
    expect(within(screen.getByRole('tab')).getByText('Survey')).toBeInTheDocument();
  });

  it('applies the per-tab options: tags, onClose and disabled', () => {
    wrap(
      <Bar
        value="pinned"
        home={false}
        tabs={[
          { id: 'overview', label: 'Overview', tags: ['beta'] },
          { id: 'pinned', label: 'Pinned', closeable: false },
          { id: 'archived', label: 'Archived', disabled: true },
        ]}
      />,
    );
    const overview = screen.getByRole('tab', { name: /Overview/ });
    expect(within(overview).getByText('beta').closest('.MuiChip-root')).not.toBeNull();
    expect(screen.getByRole('tab', { name: /Pinned/ })).toHaveAttribute('aria-selected', 'true');
    // The selected tab has no onClose: no close button.
    expect(screen.queryByRole('button', { name: 'close tab' })).toBeNull();
    expect(screen.getByRole('tab', { name: /Archived/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls back on select, add and close; the page owns the tabs', async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    wrap(<Host onEvent={(e) => events.push(e)} />);
    await user.click(screen.getByRole('tab', { name: /Tab 2/ }));
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'Add tab' }));
    expect(screen.getByRole('tab', { name: /New tab 1/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'close tab' }));
    expect(screen.queryByRole('tab', { name: /New tab 1/ })).toBeNull();
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute('aria-selected', 'true');
    expect(events).toEqual(['select tab-2', 'add', 'close new-1']);
  });

  it('passes the event to onChange and onClose, and does not change the tabs on its own', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClose = vi.fn();
    wrap(<Bar value="tab-1" onChange={onChange} onClose={onClose} />);
    await user.click(screen.getByRole('tab', { name: /Tab 2/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), 'tab-2');
    await user.click(screen.getByRole('button', { name: 'close tab' }));
    expect(onClose).toHaveBeenCalledWith('tab-1', expect.objectContaining({ type: 'click' }));
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('shows + only with onAdd, with the props of slotProps.addButton', async () => {
    const user = userEvent.setup();
    const { unmount } = wrap(<Bar value="tab-1" />);
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
    unmount();
    const onAdd = vi.fn();
    wrap(
      <AppBar>
        <AppBarTabs value="a" onAdd={onAdd} slotProps={{ addButton: { 'aria-label': 'New view' } }}>
          <AppBarTab value="a" label="A" />
        </AppBarTabs>
      </AppBar>,
    );
    await user.click(screen.getByRole('button', { name: 'New view' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('keeps controls out of the tabs and has a single tab list', () => {
    const { container } = wrap(<Bar value="tab-1" />);
    expect(container.querySelectorAll('[role="tablist"]')).toHaveLength(1);
    expect(container.querySelector('.MuiTabs-root')).not.toHaveAttribute('role');
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.querySelector('button, a[href], input, [tabindex]')).toBeNull();
    }
    const close = screen.getByRole('button', { name: 'close tab' });
    expect(close.closest('[role="tab"]')).toBeNull();
    expect(close.parentElement).toHaveClass('MuiTabs-scroller');
    // The selected tab keeps an empty slot of the button's size.
    expect(
      screen.getByRole('tab', { name: /Tab 1/ }).querySelector('[data-close-slot]'),
    ).not.toBeNull();
  });

  it('shows the close button only for the selected tab that has onClose', () => {
    const { rerender } = wrap(<Bar value="home" />);
    expect(screen.queryByRole('button', { name: 'close tab' })).toBeNull();
    rerender(
      <ThemeProvider>
        <Bar value="tab-2" />
      </ThemeProvider>,
    );
    expect(screen.getAllByRole('button', { name: 'close tab' })).toHaveLength(1);
    expect(
      screen.getByRole('tab', { name: /Tab 2/ }).querySelector('[data-close-slot]'),
    ).not.toBeNull();
    expect(
      screen.getByRole('tab', { name: /Tab 1/ }).querySelector('[data-close-slot]'),
    ).toBeNull();
    rerender(
      <ThemeProvider>
        <Bar value={false} />
      </ThemeProvider>,
    );
    expect(screen.queryByRole('button', { name: 'close tab' })).toBeNull();
    expect(screen.getAllByRole('tab').some((t) => t.getAttribute('aria-selected') === 'true')).toBe(
      false,
    );
  });

  it('re-renders in place when props change, keeping the same root', () => {
    const { rerender } = wrap(<Bar value="tab-1" onAdd={() => {}} />);
    const bar = screen.getByRole('banner');
    rerender(
      <ThemeProvider>
        <Bar value="tab-2" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('banner')).toBe(bar);
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
  });
});

describe('AppBarTabs: keyboard', () => {
  it('moves between tabs with the arrow keys and selects with Enter', async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    wrap(<Host onEvent={(e) => events.push(e)} />);
    act(() => screen.getByRole('tab', { name: /Tab 1/ }).focus());
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(events).toEqual(['select tab-2']);
  });

  it('closes the selected closeable tab with Delete or Backspace', () => {
    const onClose = vi.fn();
    wrap(<Bar value="tab-1" onClose={onClose} />);
    const active = screen.getByRole('tab', { name: /Tab 1/ });
    expect(active).toHaveAttribute('aria-keyshortcuts', 'Delete');
    fireEvent.keyDown(active, { key: 'Delete' });
    fireEvent.keyDown(active, { key: 'Backspace' });
    expect(onClose.mock.calls.map(([id]) => id)).toEqual(['tab-1', 'tab-1']);
  });

  it('does not close other, unclosable or disabled tabs from the keyboard', () => {
    const onClose = vi.fn();
    const { rerender } = wrap(<Bar value="tab-1" onClose={onClose} />);
    const inactive = screen.getByRole('tab', { name: /Tab 2/ });
    expect(inactive).not.toHaveAttribute('aria-keyshortcuts');
    fireEvent.keyDown(inactive, { key: 'Delete' });
    rerender(
      <ThemeProvider>
        <Bar
          value="pinned"
          tabs={[{ id: 'pinned', label: 'Pinned', closeable: false }]}
          onClose={onClose}
        />
      </ThemeProvider>,
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: /Pinned/ }), { key: 'Delete' });
    rerender(
      <ThemeProvider>
        <Bar value="off" tabs={[{ id: 'off', label: 'Off', disabled: true }]} onClose={onClose} />
      </ThemeProvider>,
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: /Off/ }), { key: 'Delete' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores Delete pressed on the close button itself', () => {
    const onClose = vi.fn();
    wrap(<Bar value="tab-1" onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'close tab' }), { key: 'Delete' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus to the newly selected tab after the focused tab is closed', async () => {
    const user = userEvent.setup();
    wrap(<Host initialActive="tab-2" />);
    act(() => screen.getByRole('tab', { name: /Tab 2/ }).focus());
    await user.keyboard('{Delete}');
    expect(screen.queryByRole('tab', { name: /Tab 2/ })).toBeNull();
    expect(screen.getByRole('tab', { name: /Tab 1/ })).toHaveFocus();
  });

  it('moves focus to the newly selected tab after its close button is used', async () => {
    const user = userEvent.setup();
    wrap(<Host />);
    act(() => screen.getByRole('button', { name: 'close tab' }).focus());
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('tab', { name: /Tab 1/ })).toBeNull();
    // Tab 1 was the first tab: the host selects Tab 2, which receives focus.
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveFocus();
  });

  it('moves focus to the selected tab when + goes away', async () => {
    const user = userEvent.setup();
    wrap(<Host maxTabs={3} />);
    act(() => screen.getByRole('button', { name: 'Add tab' }).focus());
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
    expect(screen.getByRole('tab', { name: /New tab 1/ })).toHaveFocus();
  });

  it('keeps focus on + while it stays', async () => {
    const user = userEvent.setup();
    wrap(<Host />);
    const add = screen.getByRole('button', { name: 'Add tab' });
    act(() => add.focus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: /New tab 1/ })).toHaveAttribute('aria-selected', 'true');
    expect(add).toHaveFocus();
  });

  it('leaves focus alone when the page keeps the tab, or focus was elsewhere', async () => {
    const user = userEvent.setup();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    wrap(<Bar value="tab-1" />);
    const active = screen.getByRole('tab', { name: /Tab 1/ });
    act(() => active.focus());
    await user.keyboard('{Delete}');
    expect(active).toHaveFocus();
    act(() => outside.focus());
    fireEvent.click(screen.getByRole('button', { name: 'close tab' }));
    expect(outside).toHaveFocus();
    outside.remove();
  });
});

describe('AppBarActions: collapsing (with layout geometry)', () => {
  // jsdom has no layout: give the bar, its parts and the actions widths, and drive the
  // ResizeObservers by hand.
  let barWidth = 1200;
  let observers: (() => void)[] = [];
  const widthFor = (element: Element) => {
    if (element.classList.contains('MuiToolbar-root')) return barWidth;
    if (element.getAttribute('data-region') === 'branding') return 100;
    if (element.getAttribute('role') === 'tab') return 120;
    if (element.getAttribute('aria-label') === 'Add tab') return 48;
    if (element.classList.contains('TectonAppBar-overflowButton')) return 40;
    if (element.hasAttribute('data-overflow-item')) return 40;
    return 0;
  };

  beforeEach(() => {
    barWidth = 1200;
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(
      () => [{}] as unknown as DOMRectList,
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return { width: widthFor(this), left: 0, right: widthFor(this) } as DOMRect;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return widthFor(this);
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          observers.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    observers = [];
  });

  const resizeTo = (width: number) =>
    act(() => {
      barWidth = width;
      observers.forEach((callback) => callback());
    });

  // MUI's scrollable Tabs do not settle on jsdom geometry (every element at x = 0), so a plain
  // stand-in takes the tab strip's place: the region, its Tabs root with the selected tab, and the
  // add button, which is all the actions read of it. The browser tests use the real strip.
  function Actions() {
    return (
      <AppBar>
        <AppBarBrand>APP</AppBarBrand>
        <div data-region="tab-strip">
          <div className="MuiTabs-root">
            <div role="tab" aria-selected="true">
              Tab 1
            </div>
          </div>
          <button type="button" aria-label="Add tab" />
        </div>
        <AppBarActions>
          <IconButton aria-label="Search" />
          <IconButton aria-label="Notifications" />
          <IconButton aria-label="Account" />
        </AppBarActions>
      </AppBar>
    );
  }

  it('keeps the actions while the narrowest tab strip leaves them room', () => {
    wrap(<Actions />);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('collapses them first to last, keeping the last, as the bar narrows', () => {
    wrap(<Actions />);
    const actions = document.querySelector('[data-region="right"]')!;
    const padding =
      Number.parseFloat(getComputedStyle(actions).paddingLeft) +
      Number.parseFloat(getComputedStyle(actions).paddingRight);
    // The narrowest strip: the selected tab between two arrows and the add button.
    const strip = 120 + 2 * 48 + 48;
    // Room for ⋮ and the last action (40 + gap + 40), not one more.
    const gap = Number.parseFloat(getComputedStyle(actions).columnGap) || 0;
    resizeTo(100 + strip + padding + 80 + gap + 20);
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveClass(
      'TectonAppBar-overflowButton',
    );
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Notifications' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();

    // Wide again: every action is back.
    resizeTo(1200);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('shows every action while the bar has no layout (hidden)', () => {
    wrap(<Actions />);
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(
      () => [] as unknown as DOMRectList,
    );
    resizeTo(200);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});

describe('AppBarTabs: attached', () => {
  const fill = (bar: Element, name: RegExp) =>
    getComputedStyle(within(bar as HTMLElement).getByRole('tab', { name })).backgroundColor;
  /** Any fully transparent colour (the theme's transparent tokens are `#ffffff00` or `#00000000`). */
  const TRANSPARENT = /^rgba\(\d+, \d+, \d+, 0\)$/;
  const tabs = (attached: boolean | string) => (
    <AppBarTabs value="tab-2" attached={attached}>
      <AppBarTab value="tab-1" label="Tab 1" />
      <AppBarTab value="tab-2" label="Tab 2" />
    </AppBarTabs>
  );

  it('fills the selected tab with the content surface, in both tiers', () => {
    const { container } = wrap(
      <>
        <AppBar>{tabs(true)}</AppBar>
        <AppBar tier="secondary">{tabs(true)}</AppBar>
        <AppBar>{tabs(false)}</AppBar>
      </>,
    );
    const [primary, secondary, plain] = Array.from(
      container.querySelectorAll('[data-region="app-bar"]'),
    );
    for (const bar of [primary!, secondary!]) {
      expect(fill(bar, /Tab 2/)).toBe(tokenColor('color-bg-default'));
      // The other tabs stay clear, so the bar's bottom line shows under them.
      expect(fill(bar, /Tab 1/)).toMatch(TRANSPARENT);
      expect(bar.querySelector('[attached]')).toBeNull();
    }
    // Without `attached` the selected tab keeps the theme's look (no fill).
    expect(fill(plain!, /Tab 2/)).toMatch(TRANSPARENT);
  });

  it('takes the content color as a theme palette path or a CSS color', () => {
    const { container } = wrap(
      <>
        <AppBar tier="secondary">{tabs('background.paper')}</AppBar>
        <AppBar tier="secondary">{tabs('rgb(1, 2, 3)')}</AppBar>
      </>,
    );
    const [paper, custom] = Array.from(container.querySelectorAll('[data-region="app-bar"]'));
    expect(fill(paper!, /Tab 2/)).toBe(tokenColor('color-bg-paper'));
    expect(fill(custom!, /Tab 2/)).toBe('rgb(1, 2, 3)');
    expect(fill(custom!, /Tab 1/)).toMatch(TRANSPARENT);
  });
});

// MUI's documented extension pattern keeps working.
interface ExtendedAppBarProps extends AppBarProps {
  open?: boolean;
}
export const ExtendedAppBar = (props: ExtendedAppBarProps) => <AppBar {...props} />;

// Type-level checks (compiled by `pnpm typecheck`).
export function typeChecks() {
  return (
    <>
      <AppBar position="fixed" />
      <AppBar component="nav" tier="secondary" />
      {/* @ts-expect-error productColor was removed. */}
      <AppBar productColor="app1" />
      {/* @ts-expect-error The theme sets the bar's colors. */}
      <AppBar color="primary" />
      {/* @ts-expect-error The theme sets the bar's colors. */}
      <AppBar enableColorOnDark />
      {/* @ts-expect-error The theme sets the bar's surface. */}
      <AppBar elevation={0} />
      {/* @ts-expect-error The theme sets the bar's surface. */}
      <AppBar square={false} />
      {/* @ts-expect-error The theme sets the bar's surface. */}
      <AppBar variant="outlined" />
      <AppBarTabs value={false} onChange={(_event, value: string | number) => value}>
        <AppBarTab value="a" label="A" onClose={(event: React.SyntheticEvent) => event} />
      </AppBarTabs>
      {/* @ts-expect-error A tab needs a value. */}
      <AppBarTab label="No value" />
      {/* @ts-expect-error The strip lays its tabs out itself. */}
      <AppBarTabs value="a" variant="fullWidth" />
      {/* @ts-expect-error The bar sets the tabs' height. */}
      <AppBarTabs value="a" size="small" />
      {/* @ts-expect-error A tab's content goes in `label`. */}
      <AppBarTab value="a">A</AppBarTab>
      {/* @ts-expect-error Unknown tier. */}
      <AppBar tier="tertiary" />
    </>
  );
}
