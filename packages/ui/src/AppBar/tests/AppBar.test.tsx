import * as React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { ThemeProvider } from '../../styles/index.js';
import AppBar, {
  appBarClasses,
  type AppBarFixedTab,
  type AppBarProps,
  type AppBarTab,
} from '../index.js';
import * as root from '../../index.js';

const HOME: AppBarFixedTab[] = [{ id: 'home', icon: 'home', label: 'Home' }];
const TABS: AppBarTab[] = [
  { id: 'tab-1', label: 'Tab 1', icon: 'project' },
  { id: 'tab-2', label: 'Tab 2', icon: 'project' },
];

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

/** A page that owns the tabs, as the drop-in stories' host does. */
function Host({
  initialTabs = TABS,
  initialActive = 'tab-1',
  maxTabs,
  onEvent = () => {},
}: {
  initialTabs?: AppBarTab[];
  initialActive?: string;
  maxTabs?: number;
  onEvent?: (event: string) => void;
}) {
  const [state, setState] = React.useState({ tabs: initialTabs, active: initialActive });
  const added = React.useRef(0);
  return (
    <AppBar
      appName="APP"
      fixedTabs={HOME}
      tabs={state.tabs}
      activeTab={state.active}
      maxTabs={maxTabs}
      onTabSelect={(id) => {
        onEvent(`select ${id}`);
        setState((s) => ({ ...s, active: id }));
      }}
      onTabClose={(id) => {
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
      onTabAdd={() => {
        onEvent('add');
        added.current += 1;
        const id = `new-${added.current}`;
        setState((s) => ({
          tabs: [...s.tabs, { id, label: `New tab ${added.current}`, icon: 'project' }],
          active: id,
        }));
      }}
    />
  );
}

describe('AppBar: MUI behaviour without navigation props', () => {
  it('renders children in a header, like the MUI AppBar', () => {
    wrap(
      <AppBar position="static" color="secondary">
        <Toolbar>Content</Toolbar>
      </AppBar>,
    );
    const header = screen.getByRole('banner');
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveClass(appBarClasses.root, appBarClasses.positionStatic);
    expect(header).toHaveClass(appBarClasses.colorSecondary);
    expect(header).toHaveTextContent('Content');
    expect(header.querySelector('[data-region]')).toBeNull();
  });

  it('forwards the ref and supports `component`', () => {
    const ref = React.createRef<HTMLElement>();
    wrap(
      <AppBar ref={ref} component="nav" position="static">
        x
      </AppBar>,
    );
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('renders the same markup as @mui/material/AppBar', () => {
    const ours = renderToString(
      <ThemeProvider>
        <AppBar position="sticky" tier="secondary">
          <Toolbar>x</Toolbar>
        </AppBar>
      </ThemeProvider>,
    );
    const mui = renderToString(
      <ThemeProvider>
        <MuiAppBar position="sticky" tier="secondary">
          <Toolbar>x</Toolbar>
        </MuiAppBar>
      </ThemeProvider>,
    );
    expect(ours).toBe(mui);
  });

  it('is the export of the root barrel', () => {
    expect(root.AppBar).toBe(AppBar);
    expect(root.appBarClasses).toBe(appBarClasses);
  });
});

describe('AppBar: Tecton app bar layout', () => {
  it('renders the branding, the fixed tabs, the tabs, + and the actions region', () => {
    wrap(
      <AppBar fixedTabs={HOME} tabs={TABS} activeTab="tab-1">
        <button type="button">notifications</button>
      </AppBar>,
    );
    const bar = screen.getByRole('banner');
    expect(bar).toHaveAttribute('data-region', 'app-bar');
    expect(bar).toHaveClass(appBarClasses.positionStatic);
    expect(within(bar).getByText('APP')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Add tab' })).toBeInTheDocument();
    const actions = bar.querySelector('[data-region="right"][data-slot="actions"]');
    expect(within(actions as HTMLElement).getByText('notifications')).toBeInTheDocument();
  });

  it('switches layout on any navigation prop, and keeps MUI props', () => {
    const ref = React.createRef<HTMLElement>();
    wrap(<AppBar ref={ref} appName="Planner" position="sticky" className="mine" sx={{ mt: 1 }} />);
    expect(ref.current).toHaveAttribute('data-region', 'app-bar');
    expect(ref.current).toHaveClass('mine', appBarClasses.positionSticky);
    expect(screen.getByText('Planner')).toBeInTheDocument();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('shows the filled icon on the active tab and the outline icon elsewhere', () => {
    const { container } = wrap(<AppBar fixedTabs={HOME} tabs={TABS} activeTab="tab-1" />);
    expect(container.querySelector('.tecton-home-outline')).not.toBeNull();
    const [tab1, tab2] = screen.getAllByRole('tab').slice(1);
    expect(tab1.querySelector('.tecton-project-filled')).not.toBeNull();
    expect(tab2.querySelector('.tecton-project-outline')).not.toBeNull();
  });

  it('resolves the branding source: logo, then logoSrc, then a placeholder', () => {
    const { rerender, container } = wrap(
      <AppBar appName="Apps" logo="apps-filled" logoSrc="x.svg" />,
    );
    const branding = () => container.querySelector('[data-region="branding"]') as HTMLElement;
    expect(branding().querySelector('.tecton-apps-filled')).not.toBeNull();
    expect(branding().querySelector('img')).toBeNull();
    rerender(
      <ThemeProvider>
        <AppBar appName="Product" logoSrc="x.svg" />
      </ThemeProvider>,
    );
    expect(branding().querySelector('img')).toHaveAttribute('alt', 'Product');
    rerender(
      <ThemeProvider>
        <AppBar appName="APP" tabs={[]} />
      </ThemeProvider>,
    );
    expect(branding().querySelector('img, .tecton-appbar-icon')).toBeNull();
    expect(branding().querySelector('[data-region="branding-logo"] > div')).not.toBeNull();
  });

  it('tier="secondary" drops the branding and the fixed tabs', () => {
    const { container } = wrap(
      <AppBar tier="secondary" fixedTabs={HOME} tabs={TABS} activeTab="tab-1" />,
    );
    expect(container.querySelector('[data-region="branding"]')).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Home' })).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('banner')).toHaveAttribute('tier', 'secondary');
  });

  it('applies the per-tab options: tags, closeable and disabled', () => {
    wrap(
      <AppBar
        tabs={[
          { id: 'overview', label: 'Overview', tags: ['beta'] },
          { id: 'pinned', label: 'Pinned', closeable: false },
          { id: 'archived', label: 'Archived', disabled: true },
        ]}
        activeTab="pinned"
      />,
    );
    const overview = screen.getByRole('tab', { name: /Overview/ });
    expect(within(overview).getByText('beta').closest('.MuiChip-root')).not.toBeNull();
    expect(within(overview).queryByRole('button', { name: 'close tab' })).toBeNull();
    const pinned = screen.getByRole('tab', { name: /Pinned/ });
    expect(pinned).toHaveAttribute('aria-selected', 'true');
    expect(within(pinned).queryByRole('button', { name: 'close tab' })).toBeNull();
    expect(screen.getByRole('tab', { name: /Archived/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls back on select, add and close; the page owns the tabs', async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    wrap(<Host onEvent={(e) => events.push(e)} />);
    await user.click(screen.getByRole('tab', { name: /Tab 2/ }));
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'Add tab' }));
    const added = screen.getByRole('tab', { name: /New tab 1/ });
    expect(added).toHaveAttribute('aria-selected', 'true');
    await user.click(within(added).getByRole('button', { name: 'close tab' }));
    expect(screen.queryByRole('tab', { name: /New tab 1/ })).toBeNull();
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute('aria-selected', 'true');
    expect(events).toEqual(['select tab-2', 'add', 'close new-1']);
  });

  it('does not change the tabs on its own', async () => {
    const user = userEvent.setup();
    const onTabClose = vi.fn();
    wrap(<AppBar tabs={TABS} activeTab="tab-1" onTabClose={onTabClose} />);
    await user.click(screen.getByRole('button', { name: 'close tab' }));
    expect(onTabClose).toHaveBeenCalledWith('tab-1', expect.anything());
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('hides + with disableTabAdd, and once tabs.length reaches maxTabs', () => {
    const { unmount } = wrap(<AppBar tabs={TABS} disableTabAdd />);
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
    unmount();
    wrap(<AppBar tabs={TABS} maxTabs={0} />);
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
  });

  it('re-renders in place when props change, keeping the same root', () => {
    const { rerender } = wrap(<AppBar tabs={TABS} activeTab="tab-1" />);
    const bar = screen.getByRole('banner');
    rerender(
      <ThemeProvider>
        <AppBar tabs={TABS} activeTab="tab-1" appName="Renamed app" maxTabs={2} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('banner')).toBe(bar);
    expect(screen.getByText('Renamed app')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add tab' })).toBeNull();
  });

  it('renders on the server', () => {
    const html = renderToString(
      <ThemeProvider>
        <AppBar fixedTabs={HOME} tabs={TABS} activeTab="tab-1">
          <span>x</span>
        </AppBar>
      </ThemeProvider>,
    );
    expect(html).toContain('data-region="app-bar"');
    expect(html).toContain('Tab 2');
  });
});

describe('AppBar: keyboard', () => {
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

  it('closes the active closeable tab with Delete or Backspace', () => {
    const onTabClose = vi.fn();
    wrap(<AppBar tabs={TABS} activeTab="tab-1" onTabClose={onTabClose} />);
    const active = screen.getByRole('tab', { name: /Tab 1/ });
    expect(active).toHaveAttribute('aria-keyshortcuts', 'Delete');
    fireEvent.keyDown(active, { key: 'Delete' });
    fireEvent.keyDown(active, { key: 'Backspace' });
    expect(onTabClose.mock.calls.map(([id]) => id)).toEqual(['tab-1', 'tab-1']);
  });

  it('does not close inactive, non-closeable or disabled tabs from the keyboard', () => {
    const onTabClose = vi.fn();
    const { rerender } = wrap(<AppBar tabs={TABS} activeTab="tab-1" onTabClose={onTabClose} />);
    const inactive = screen.getByRole('tab', { name: /Tab 2/ });
    expect(inactive).not.toHaveAttribute('aria-keyshortcuts');
    fireEvent.keyDown(inactive, { key: 'Delete' });
    rerender(
      <ThemeProvider>
        <AppBar
          tabs={[{ id: 'pinned', label: 'Pinned', closeable: false }]}
          activeTab="pinned"
          onTabClose={onTabClose}
        />
      </ThemeProvider>,
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: /Pinned/ }), { key: 'Delete' });
    expect(onTabClose).not.toHaveBeenCalled();
  });

  it('ignores Delete pressed on the close button itself', () => {
    const onTabClose = vi.fn();
    wrap(<AppBar tabs={TABS} activeTab="tab-1" onTabClose={onTabClose} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'close tab' }), { key: 'Delete' });
    expect(onTabClose).not.toHaveBeenCalled();
  });

  it('moves focus to the newly active tab after the focused tab is closed', async () => {
    const user = userEvent.setup();
    wrap(<Host initialActive="tab-2" />);
    act(() => screen.getByRole('tab', { name: /Tab 2/ }).focus());
    await user.keyboard('{Delete}');
    expect(screen.queryByRole('tab', { name: /Tab 2/ })).toBeNull();
    expect(screen.getByRole('tab', { name: /Tab 1/ })).toHaveFocus();
  });

  it('moves focus to the newly active tab after its close button is used', async () => {
    const user = userEvent.setup();
    wrap(<Host />);
    act(() => screen.getByRole('button', { name: 'close tab' }).focus());
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('tab', { name: /Tab 1/ })).toBeNull();
    // Tab 1 was the first tab: the host activates Tab 2, which receives focus.
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveFocus();
  });

  it('moves focus to the active tab when + disappears at maxTabs', async () => {
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
    wrap(<AppBar tabs={TABS} activeTab="tab-1" onTabClose={() => {}} />);
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

// MUI's documented extension pattern keeps working.
interface ExtendedAppBarProps extends AppBarProps {
  open?: boolean;
}
export const ExtendedAppBar = (props: ExtendedAppBarProps) => <AppBar {...props} />;

// Type-level checks (compiled by `pnpm typecheck`).
export function typeChecks() {
  return (
    <>
      <AppBar position="static">
        <Toolbar />
      </AppBar>
      <AppBar tabs={TABS} onTabSelect={(id: string) => id}>
        <button type="button">Share</button>
      </AppBar>
      <AppBar component="nav" tabs={TABS} />
      {/* @ts-expect-error Tabs need an id. */}
      <AppBar tabs={[{ label: 'No id' }]} />
      {/* @ts-expect-error Unknown tier. */}
      <AppBar tabs={TABS} tier="tertiary" />
    </>
  );
}
