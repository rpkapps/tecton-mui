import * as React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../styles/index.js';
import Button from '../../Button/index.js';
import Divider from '../../Divider/index.js';
import Icon from '../../Icon/index.js';
import IconButton from '../../IconButton/index.js';
import InputAdornment from '../../InputAdornment/index.js';
import MenuItem from '../../MenuItem/index.js';
import Select from '../../Select/index.js';
import Tab from '../../Tab/index.js';
import ToggleButton from '../../ToggleButton/index.js';
import ToggleButtonGroup from '../../ToggleButtonGroup/index.js';
import { HeadingContext, type HeadingContextValue } from '../HeadingContext.js';
import { FULL_LAYOUT, type HeadingLayout } from '../layout.js';
import Heading, {
  HeadingActions,
  HeadingSearch,
  HeadingTabs,
  HeadingTitle,
  headingClasses,
  type HeadingSearchProps,
  type HeadingTabsProps,
} from '../index.js';
import * as root from '../../index.js';

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

/** The canonical page heading: title cluster, tabs and actions. */
function PageHeading({
  value = 0,
  onChange,
}: {
  value?: number;
  onChange?: HeadingTabsProps['onChange'];
}) {
  return (
    <Heading>
      <HeadingTitle onHomeClick={() => {}} onMenuClick={() => {}}>
        Portfolio
      </HeadingTitle>
      <HeadingTabs value={value} onChange={onChange} aria-label="Portfolio sections">
        <Tab label="Overview" />
        <Tab label="Team" />
      </HeadingTabs>
      <HeadingActions>
        <Button variant="contained">New Project</Button>
      </HeadingActions>
    </Heading>
  );
}

describe('Heading', () => {
  it('is exported from the root barrel with its parts', () => {
    expect(root.Heading).toBe(Heading);
    expect(root.HeadingTitle).toBe(HeadingTitle);
    expect(root.HeadingTabs).toBe(HeadingTabs);
    expect(root.HeadingActions).toBe(HeadingActions);
    expect(root.HeadingSearch).toBe(HeadingSearch);
    expect(root.headingClasses).toBe(headingClasses);
  });

  it('lays out the title, the tabs and the actions in one row', () => {
    const { container } = wrap(<PageHeading />);
    const heading = container.querySelector(`.${headingClasses.root}`)!;
    expect(heading.tagName).toBe('DIV');
    expect(heading).not.toHaveClass(headingClasses.disableGutters);
    expect(within(heading as HTMLElement).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Portfolio',
    );
    expect(heading.querySelector(`.${headingClasses.title}`)).not.toBeNull();
    expect(heading.querySelector(`.${headingClasses.tabs}`)).toHaveClass('MuiTabs-root');
    expect(heading.querySelector(`.${headingClasses.actions}`)).toHaveTextContent('New Project');
  });

  it('takes a root component, disableGutters, className, sx and a ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    wrap(
      <Heading
        ref={ref}
        component="header"
        disableGutters
        className="page-heading"
        sx={{ mb: 2 }}
        data-testid="heading"
      >
        <HeadingTitle>Wells</HeadingTitle>
      </Heading>,
    );
    const heading = screen.getByTestId('heading');
    expect(ref.current).toBe(heading);
    expect(heading.tagName).toBe('HEADER');
    expect(heading).toHaveClass(headingClasses.root, headingClasses.disableGutters, 'page-heading');
    expect(getComputedStyle(heading).paddingLeft).toBe('0px');
    expect(getComputedStyle(heading).marginBottom).not.toBe('');
  });

  it('has the Figma frame gutters by default', () => {
    wrap(
      <Heading data-testid="heading">
        <HeadingTitle>Wells</HeadingTitle>
      </Heading>,
    );
    const style = getComputedStyle(screen.getByTestId('heading'));
    expect(style.paddingLeft).toBe('72px');
    expect(style.paddingTop).toBe('32px');
  });

  it('renders on the server', () => {
    const html = renderToString(
      <ThemeProvider>
        <PageHeading />
      </ThemeProvider>,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('Portfolio');
    expect(html).toContain('role="tablist"');
    expect(html).toContain(headingClasses.actions);
  });
});

describe('HeadingTitle', () => {
  it('is an h1 with no buttons by default', () => {
    wrap(<HeadingTitle>Portfolio</HeadingTitle>);
    const title = screen.getByRole('heading', { level: 1, name: 'Portfolio' });
    expect(title).toHaveClass(headingClasses.titleText, 'MuiTypography-h4');
    // Tecton heading-1 without MUI's h4 letter spacing.
    expect(getComputedStyle(title).letterSpacing).toBe('normal');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('takes the title element and Typography props through slotProps.title', () => {
    wrap(
      <HeadingTitle slotProps={{ title: { component: 'h2', className: 'title', id: 'wells' } }}>
        Wells
      </HeadingTitle>,
    );
    const title = screen.getByRole('heading', { level: 2, name: 'Wells' });
    expect(title).toHaveClass(headingClasses.titleText, 'title');
    expect(title).toHaveAttribute('id', 'wells');
  });

  it('shows the home button with onHomeClick and calls it', async () => {
    const onHomeClick = vi.fn();
    const onClick = vi.fn();
    wrap(
      <HeadingTitle onHomeClick={onHomeClick} slotProps={{ homeButton: { onClick } }}>
        Portfolio
      </HeadingTitle>,
    );
    const home = screen.getByRole('button', { name: 'Home' });
    expect(home).toHaveClass(headingClasses.homeButton);
    // The button comes before the title.
    expect(
      home.compareDocumentPosition(screen.getByRole('heading')) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await userEvent.click(home);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onHomeClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('shows the home button as a link with an href', () => {
    wrap(
      <HeadingTitle slotProps={{ homeButton: { href: '/home', 'aria-label': 'All portfolios' } }}>
        Portfolio
      </HeadingTitle>,
    );
    expect(screen.getByRole('link', { name: 'All portfolios' })).toHaveAttribute('href', '/home');
  });

  it('shows the menu button with onMenuClick and calls it with the event', async () => {
    const onMenuClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.currentTarget);
    const onClick = vi.fn();
    wrap(
      <HeadingTitle
        onMenuClick={onMenuClick}
        slotProps={{
          menuButton: {
            'aria-label': 'Switch portfolio',
            'aria-haspopup': 'menu',
            className: 'chevron',
            onClick,
          },
        }}
      >
        Portfolio
      </HeadingTitle>,
    );
    const menu = screen.getByRole('button', { name: 'Switch portfolio' });
    expect(menu).toHaveClass(headingClasses.menuButton, 'chevron', 'MuiIconButton-sizeSmall');
    expect(menu).toHaveAttribute('aria-haspopup', 'menu');
    expect(
      menu.compareDocumentPosition(screen.getByRole('heading')) & Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
    await userEvent.click(menu);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onMenuClick).toHaveBeenCalledTimes(1);
    expect(onMenuClick.mock.results[0]!.value).toBe(menu);
  });

  it('labels the buttons "Home" and "Page menu" by default, with decorative icons', () => {
    wrap(
      <HeadingTitle onHomeClick={() => {}} onMenuClick={() => {}}>
        Portfolio
      </HeadingTitle>,
    );
    for (const name of ['Home', 'Page menu']) {
      const button = screen.getByRole('button', { name });
      expect(button.querySelector('[aria-hidden]')).not.toBeNull();
      expect(button).toHaveClass('MuiIconButton-colorTertiary');
    }
    expect(screen.getByRole('button', { name: 'Page menu' })).toHaveAttribute(
      'aria-haspopup',
      'menu',
    );
  });

  it('forwards its ref, className and HTML attributes to the cluster', () => {
    const ref = React.createRef<HTMLDivElement>();
    wrap(
      <HeadingTitle ref={ref} className="cluster" data-testid="cluster">
        Portfolio
      </HeadingTitle>,
    );
    expect(ref.current).toBe(screen.getByTestId('cluster'));
    expect(ref.current).toHaveClass(headingClasses.title, 'cluster');
  });
});

describe('HeadingTabs', () => {
  it('is a tab list of MUI tabs, selected by value, that reports changes', async () => {
    const onChange = vi.fn();
    wrap(<PageHeading value={0} onChange={onChange} />);
    const list = screen.getByRole('tablist', { name: 'Portfolio sections' });
    expect(within(list).getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(within(list).getByRole('tab', { name: 'Team' }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 1);
  });

  it('forwards its ref, className and sx to the Tabs root', () => {
    const ref = React.createRef<HTMLDivElement>();
    wrap(
      <HeadingTabs
        ref={ref}
        value="a"
        className="sections"
        sx={{ borderRadius: '3px' }}
        aria-label="Sections"
      >
        <Tab value="a" label="A" />
      </HeadingTabs>,
    );
    expect(ref.current).toHaveClass('MuiTabs-root', headingClasses.tabs, 'sections');
    expect(getComputedStyle(ref.current!).borderRadius).toBe('3px');
    // The tabs sit on the tab group's paper surface.
    const group = ref.current!.parentElement!;
    expect(group).toHaveClass(headingClasses.tabGroup);
    expect(getComputedStyle(group).padding).toBe('6px');
    expect(ref.current).toContainElement(screen.getByRole('tablist', { name: 'Sections' }));
  });

  it('takes the small tab size', () => {
    wrap(
      <HeadingTabs value={0} size="small" aria-label="Views">
        <Tab label="Grid" />
      </HeadingTabs>,
    );
    expect(screen.getByRole('tab', { name: 'Grid' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('HeadingActions', () => {
  it('holds the actions and forwards its ref and attributes', () => {
    const ref = React.createRef<HTMLDivElement>();
    wrap(
      <HeadingActions ref={ref} className="tools" aria-label="Page actions" role="group">
        <Button>Publish</Button>
      </HeadingActions>,
    );
    const group = screen.getByRole('group', { name: 'Page actions' });
    expect(ref.current).toBe(group);
    expect(group).toHaveClass(headingClasses.actions, 'tools');
    expect(within(group).getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });
});

// Type-level checks (compiled by `pnpm typecheck`).
export function typeChecks() {
  return (
    <>
      <Heading component="section" disableGutters />
      <HeadingTitle
        onHomeClick={(event: React.MouseEvent<HTMLButtonElement>) => event}
        onMenuClick={(event: React.MouseEvent<HTMLButtonElement>) => event.currentTarget}
        slotProps={{
          title: { component: 'h2', variant: 'h5' },
          homeButton: { href: '/' },
          menuButton: { 'aria-expanded': true },
        }}
      />
      <HeadingTabs value={0} size="small" onChange={(_event, value: number) => value} />
      {/* @ts-expect-error The heading's tabs are always the filled (pills) tab group. */}
      <HeadingTabs value={0} variant="scrollable" />
      {/* @ts-expect-error The heading's tabs are horizontal. */}
      <HeadingTabs value={0} orientation="vertical" />
      {/* @ts-expect-error The filled tab group has no indicator. */}
      <HeadingTabs value={0} indicatorColor="secondary" />
      {/* @ts-expect-error The filled tab group sets the label colors. */}
      <HeadingTabs value={0} textColor="secondary" />
      {/* @ts-expect-error Only the filled tab group's scroll-free row is offered. */}
      <HeadingTabs value={0} scrollButtons />
    </>
  );
}

describe('collapsed parts (in a narrow Heading)', () => {
  /** Renders the parts with a given layout, as their `Heading` would after measuring them. */
  function Collapsed({
    layout,
    narrow = false,
    children,
  }: {
    layout: Partial<HeadingLayout>;
    narrow?: boolean;
    children: React.ReactNode;
  }) {
    const context = React.useMemo<HeadingContextValue>(
      () => ({
        layout: { ...FULL_LAYOUT, ...layout },
        narrow,
        register: () => () => {},
        requestMeasure: () => {},
      }),
      [layout, narrow],
    );
    return <HeadingContext.Provider value={context}>{children}</HeadingContext.Provider>;
  }

  const SECTIONS = ['Overview', 'Framing', 'Team', 'Builder'];
  function Sections({ layout, narrow }: { layout: Partial<HeadingLayout>; narrow?: boolean }) {
    const [value, setValue] = React.useState('Overview');
    return (
      <Collapsed layout={layout} narrow={narrow}>
        <HeadingTabs
          value={value}
          onChange={(_event, next) => setValue(next)}
          aria-label="Sections"
        >
          {SECTIONS.map((name) => (
            <Tab key={name} value={name} label={name} />
          ))}
        </HeadingTabs>
      </Collapsed>
    );
  }
  const tabNames = () =>
    within(screen.getByRole('tablist'))
      .getAllByRole('tab')
      .map((tab) => `${tab.textContent}${tab.getAttribute('aria-selected') === 'true' ? '*' : ''}`);

  it('shows the first tabs and a More tab, last in the tab list, with a menu of the others', async () => {
    wrap(<Sections layout={{ tabs: 2 }} />);
    expect(tabNames()).toEqual(['Overview*', 'Framing', 'More']);
    const more = screen.getByRole('tab', { name: 'More' });
    expect(more).toHaveClass(headingClasses.moreTab);
    expect(more).toHaveAttribute('aria-haspopup', 'menu');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Team', 'Builder']);
  });

  it('selects a tab picked in the menu: the More tab is selected while the open tab is in it', async () => {
    wrap(<Sections layout={{ tabs: 2 }} />);
    await userEvent.click(screen.getByRole('tab', { name: 'More' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Builder' }));
    expect(tabNames()).toEqual(['Overview', 'Framing', 'More*']);
    await waitFor(() => expect(screen.getByRole('tab', { name: 'More' })).toHaveFocus());
    await userEvent.click(screen.getByRole('tab', { name: 'More' }));
    expect(screen.getByRole('menuitem', { name: 'Builder' })).toHaveClass('Mui-selected');
    // The tabs that show are tabs as ever.
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('tab', { name: 'Framing' }));
    expect(tabNames()).toEqual(['Overview', 'Framing*', 'More']);
  });

  it('is one dropdown named after the open tab on a narrow heading', async () => {
    wrap(<Sections layout={{ tabs: 4 }} narrow />);
    expect(tabNames()).toEqual(['Overview*']);
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Team' }));
    expect(tabNames()).toEqual(['Team*']);
  });

  it('shows no More tab when every tab fits, and none outside a Heading', () => {
    const { unmount } = wrap(<Sections layout={{ tabs: 9 }} />);
    expect(tabNames()).toEqual(['Overview*', 'Framing', 'Team', 'Builder']);
    unmount();
    wrap(
      <HeadingTabs value={0} aria-label="Views">
        <Tab label="Grid" />
        <Tab label="Map" />
      </HeadingTabs>,
    );
    expect(tabNames()).toEqual(['Grid*', 'Map']);
  });

  it('takes the More tab label and props through slotProps', () => {
    wrap(
      <Collapsed layout={{ tabs: 1 }}>
        <HeadingTabs
          value={0}
          aria-label="Views"
          slotProps={{ moreTab: { label: 'Plus', className: 'extra' } }}
        >
          <Tab label="Grid" />
          <Tab label="Map" />
        </HeadingTabs>
      </Collapsed>,
    );
    expect(screen.getByRole('tab', { name: 'Plus' })).toHaveClass('extra');
  });

  function Actions({
    layout,
    narrow,
    on = {},
  }: {
    layout: Partial<HeadingLayout>;
    narrow?: boolean;
    on?: {
      filter?: () => void;
      sort?: (value: string) => void;
      view?: (value: string) => void;
      create?: () => void;
    };
  }) {
    return (
      <Collapsed layout={layout} narrow={narrow}>
        <HeadingActions>
          <IconButton aria-label="Search">
            <Icon name="search" />
          </IconButton>
          <IconButton aria-label="Filter" onClick={on.filter}>
            <Icon name="filter" />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <Select
            value="recent"
            onChange={(event) => on.sort?.(String(event.target.value))}
            startAdornment={<InputAdornment position="start">Sort:</InputAdornment>}
            inputProps={{ 'aria-label': 'Sort' }}
          >
            <MenuItem value="recent">Recent</MenuItem>
            <MenuItem value="name">Name</MenuItem>
          </Select>
          <Divider orientation="vertical" flexItem />
          <ToggleButtonGroup
            exclusive
            value="list"
            aria-label="Page view"
            onChange={(_event, value: string) => on.view?.(value)}
          >
            <ToggleButton value="list">
              <Icon name="list" />
              List
            </ToggleButton>
            <ToggleButton value="grid">
              <Icon name="grid-view" />
              Grid
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider orientation="vertical" flexItem />
          <Button variant="contained" color="secondary">
            Publish
          </Button>
          <Button variant="contained" startIcon={<Icon name="add" />} onClick={on.create}>
            Create
          </Button>
        </HeadingActions>
      </Collapsed>
    );
  }
  const rowNames = () =>
    Array.from(
      document.querySelectorAll(
        `.${headingClasses.actions} :is(button, [role="combobox"], .MuiDivider-root)`,
      ),
    ).map((element) =>
      element.classList.contains('MuiDivider-root')
        ? '|'
        : (element.getAttribute('aria-label') ?? element.textContent),
    );

  it('folds the actions by kind, the primary one never, with ⋮ before it', () => {
    const { rerender } = wrap(<Actions layout={{ actions: 0 }} />);
    expect(rowNames()).toEqual([
      'Search',
      'Filter',
      '|',
      'Sort',
      '|',
      'List',
      'Grid',
      '|',
      'Publish',
      'Create',
    ]);
    const steps: [number, string[]][] = [
      [1, ['Search', 'Filter', '|', 'Sort', '|', 'List', 'Grid', '|', 'More actions', 'Create']],
      [2, ['Search', 'Filter', '|', 'Sort', '|', 'More actions', 'Create']],
      [3, ['Search', 'Filter', '|', 'More actions', 'Create']],
      [4, ['Search', '|', 'More actions', 'Create']],
      [5, ['More actions', 'Create']],
      [9, ['More actions', 'Create']],
    ];
    for (const [actions, names] of steps) {
      rerender(
        <ThemeProvider>
          <Actions layout={{ actions }} />
        </ThemeProvider>,
      );
      expect(rowNames()).toEqual(names);
    }
    const overflow = screen.getByRole('button', { name: 'More actions' });
    expect(overflow).toHaveClass(headingClasses.overflowButton);
    expect(overflow).toHaveAttribute('aria-haspopup', 'menu');
    expect(overflow).toHaveAttribute('title', 'More actions');
  });

  it('lists the folded actions in its menu as menu items, in row order', async () => {
    wrap(<Actions layout={{ actions: 5 }} />);
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const menu = screen.getByRole('menu', { name: 'More actions' });
    expect(menu.closest(`.${headingClasses.overflowMenu}`)).not.toBeNull();
    expect(
      Array.from(menu.children).map((item) => {
        if (item.tagName === 'HR') return '|';
        // A select's or a group's name is presentational: a menu holds menu items only.
        const role = item.getAttribute('role');
        const checked = item.getAttribute('aria-checked') === 'true' ? '*' : '';
        return `${role === 'presentation' ? 'label' : role}:${item.textContent}${checked}`;
      }),
    ).toEqual([
      'menuitem:Search',
      'menuitem:Filter',
      '|',
      'label:Sort',
      'menuitemradio:Recent*',
      'menuitemradio:Name',
      '|',
      'label:Page view',
      'menuitemradio:List*',
      'menuitemradio:Grid',
      '|',
      'menuitem:Publish',
    ]);
  });

  it('runs the folded actions from the menu: clicks, select and toggle changes', async () => {
    const on = { filter: vi.fn(), sort: vi.fn(), view: vi.fn() };
    wrap(<Actions layout={{ actions: 5 }} on={on} />);
    const pick = async (role: 'menuitem' | 'menuitemradio', name: string) => {
      await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
      await userEvent.click(screen.getByRole(role, { name }));
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    };
    await pick('menuitem', 'Filter');
    expect(on.filter).toHaveBeenCalledTimes(1);
    await pick('menuitemradio', 'Name');
    expect(on.sort).toHaveBeenCalledWith('name');
    // The checked option changes nothing.
    await pick('menuitemradio', 'Recent');
    expect(on.sort).toHaveBeenCalledTimes(1);
    await pick('menuitemradio', 'Grid');
    expect(on.view).toHaveBeenCalledWith('grid');
  });

  it('shows the primary action as an icon button on a narrow heading', async () => {
    const create = vi.fn();
    wrap(<Actions layout={{ actions: 5 }} narrow on={{ create }} />);
    const primary = screen.getByRole('button', { name: 'Create' });
    expect(primary).toHaveClass('MuiIconButton-root', 'MuiIconButton-colorPrimary');
    expect(primary).toHaveAttribute('title', 'Create');
    expect(primary).not.toHaveTextContent('Create');
    await userEvent.click(primary);
    expect(create).toHaveBeenCalledTimes(1);
    expect(rowNames()).toEqual(['More actions', 'Create']);
  });

  it('shows an action it cannot read as it is, in the menu', async () => {
    wrap(
      <Collapsed layout={{ actions: 1 }}>
        <HeadingActions>
          <span data-testid="status">Draft</span>
          <Button variant="contained">Create</Button>
        </HeadingActions>
      </Collapsed>,
    );
    expect(screen.queryByTestId('status')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(within(screen.getByRole('menu')).getByTestId('status')).toHaveTextContent('Draft');
  });

  it('keeps the overflow button out of sight and reach while measuring', () => {
    wrap(
      <Collapsed layout={{ measuring: true }}>
        <HeadingTabs value={0} aria-label="Views">
          <Tab label="Grid" />
        </HeadingTabs>
        <HeadingActions>
          <Button>Publish</Button>
        </HeadingActions>
      </Collapsed>,
    );
    const button = document.querySelector<HTMLElement>(`.${headingClasses.overflowButton}`)!;
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button.style.visibility).toBe('hidden');
    // The More tab is measured too, out of the tab order.
    expect(screen.getByRole('tab', { name: 'More' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });
});

describe('Heading layout (with layout geometry)', () => {
  // jsdom has no layout: give the parts natural widths and the heading a width that a test sets,
  // and drive the ResizeObserver by hand.
  let headingWidth = 2000;
  // Every observer's callback (MUI's Tabs observe too).
  let observers: (() => void)[] = [];
  const widthFor = (element: Element) => {
    if (element.classList.contains(headingClasses.root)) return headingWidth;
    if (element.classList.contains(headingClasses.title)) return 160;
    if (element.classList.contains(headingClasses.moreTab)) return 80;
    if (element.getAttribute('role') === 'tab') return 90;
    if (element.classList.contains(headingClasses.overflowButton)) return 40;
    if (element.hasAttribute('data-overflow-item')) return 120;
    return 0;
  };

  beforeEach(() => {
    headingWidth = 2000;
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(
      () => [{}] as unknown as DOMRectList,
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return { width: widthFor(this) } as DOMRect;
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

  function Page() {
    const [value, setValue] = React.useState(0);
    return (
      <Heading data-testid="heading">
        <HeadingTitle>Portfolio</HeadingTitle>
        <HeadingTabs
          value={value}
          onChange={(_event, next) => setValue(next)}
          aria-label="Sections"
        >
          {['A', 'B', 'C', 'D', 'E'].map((label) => (
            <Tab key={label} label={label} />
          ))}
        </HeadingTabs>
        <HeadingActions>
          <Button>Search</Button>
          <Button>Publish</Button>
          <Button variant="contained" startIcon={<Icon name="add" />}>
            Create
          </Button>
        </HeadingActions>
      </Heading>
    );
  }

  const resizeTo = (width: number) =>
    act(() => {
      headingWidth = width;
      observers.forEach((callback) => callback());
    });

  const tabNames = () =>
    screen
      .getAllByRole('tab')
      .map((tab) => `${tab.textContent}${tab.getAttribute('aria-selected') === 'true' ? '*' : ''}`);

  it('measures its parts and lets them give way as it narrows', () => {
    wrap(<Page />);
    const heading = screen.getByTestId('heading');
    // Everything fits.
    expect(tabNames()).toEqual(['A*', 'B', 'C', 'D', 'E']);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
    expect(heading).toHaveAttribute('data-width', 'wide');
    expect(heading).not.toHaveAttribute('data-measuring');

    // The actions fold first, the primary one never: 1056px of content (72px gutters) holds the
    // title, the five tabs, ⋮ and two actions, not the third.
    resizeTo(1200);
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
    expect(tabNames()).toEqual(['A*', 'B', 'C', 'D', 'E']);

    // Then the last tabs fold into the More tab.
    resizeTo(1000);
    expect(screen.queryByRole('button', { name: 'Publish' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(tabNames()).toEqual(['A*', 'B', 'C', 'More']);

    // Narrow (720px and below): the tabs are one dropdown, the primary action an icon button.
    resizeTo(700);
    expect(heading).toHaveAttribute('data-width', 'narrow');
    expect(heading).toHaveClass(headingClasses.compact);
    expect(tabNames()).toEqual(['A*']);
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass('MuiIconButton-root');

    // And back.
    resizeTo(2000);
    expect(heading).not.toHaveClass(headingClasses.compact);
    expect(tabNames()).toEqual(['A*', 'B', 'C', 'D', 'E']);
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass('MuiButton-root');
  });

  it('shows everything while it has no layout (hidden)', () => {
    wrap(<Page />);
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(
      () => [] as unknown as DOMRectList,
    );
    resizeTo(300);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
  });
});

describe('HeadingSearch', () => {
  function Search(props: Partial<HeadingSearchProps>) {
    const [value, setValue] = React.useState(props.defaultValue ?? '');
    return (
      <>
        <HeadingSearch {...props} value={value} onChange={(_event, next) => setValue(next)} />
        <output data-testid="value">{value}</output>
        <button type="button">Elsewhere</button>
      </>
    );
  }

  it('is a Search button that opens into a focused search field', async () => {
    const onOpen = vi.fn();
    wrap(<Search onOpen={onOpen} />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveClass(headingClasses.searchButton);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('search')).toBeNull();
    await userEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
    const field = screen.getByRole('textbox', { name: 'Search' });
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute('placeholder', 'Search');
    expect(screen.getByRole('search', { name: 'Search' })).toHaveClass(headingClasses.search);
    await userEvent.keyboard('gulf');
    expect(screen.getByTestId('value')).toHaveTextContent('gulf');
  });

  it('grows out of the button when it opens, not when it starts open', async () => {
    wrap(<Search />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    const field = document.querySelector(`.${headingClasses.searchField}`)!;
    expect(field).toHaveAttribute('data-overflow-growing');
    // An animation of the input inside (autofill) is not the field's.
    fireEvent.animationEnd(screen.getByRole('textbox'));
    expect(field).toHaveAttribute('data-overflow-growing');
    fireEvent.animationEnd(field);
    expect(field).not.toHaveAttribute('data-overflow-growing');
  });

  it('starts open without growing, and does not grow with reduced motion', async () => {
    const { unmount } = wrap(<Search defaultValue="gulf" />);
    expect(document.querySelector(`.${headingClasses.searchField}`)).not.toHaveAttribute(
      'data-overflow-growing',
    );
    unmount();
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: query.includes('reduce'), media: query })),
    );
    wrap(<Search />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(document.querySelector(`.${headingClasses.searchField}`)).not.toHaveAttribute(
      'data-overflow-growing',
    );
    vi.unstubAllGlobals();
  });

  it('clears with the clear button, then with Escape, and closes on a second Escape', async () => {
    const onClose = vi.fn();
    wrap(<Search onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await userEvent.keyboard('gulf');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByTestId('value')).toHaveTextContent('');
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    await userEvent.keyboard('sea{Escape}');
    expect(screen.getByTestId('value')).toHaveTextContent('');
    expect(screen.getByRole('search')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'escapeKeyDown');
    expect(screen.queryByRole('search')).toBeNull();
    expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
  });

  it('closes when the focus leaves it empty, and stays open with a search in progress', async () => {
    const onClose = vi.fn();
    wrap(<Search onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await userEvent.keyboard('gulf');
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(screen.getByRole('search')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'blur');
    expect(screen.queryByRole('search')).toBeNull();
  });

  it('starts open with text to show, and follows a controlled open state', () => {
    const { rerender } = wrap(<Search defaultValue="north" />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('north');
    rerender(
      <ThemeProvider>
        <HeadingSearch open={false} value="north" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('is medium by default, like the buttons and inputs beside it, and small on request', async () => {
    const { unmount } = wrap(<Search />);
    expect(screen.getByRole('button', { name: 'Search' })).toHaveClass('MuiIconButton-sizeMedium');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('textbox').closest('.MuiInputBase-root')).not.toHaveClass(
      'MuiInputBase-sizeSmall',
    );
    unmount();
    wrap(<Search size="small" />);
    expect(screen.getByRole('button', { name: 'Search' })).toHaveClass('MuiIconButton-sizeSmall');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('textbox').closest('.MuiInputBase-root')).toHaveClass(
      'MuiInputBase-sizeSmall',
    );
  });

  it('takes its label and its parts through props and slotProps', async () => {
    const onClick = vi.fn();
    wrap(
      <Search
        label="Search wells"
        placeholder="Well name"
        slotProps={{
          button: { onClick },
          input: { className: 'field' },
          clearButton: { 'aria-label': 'Erase' },
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search wells' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    const field = screen.getByRole('textbox', { name: 'Search wells' });
    expect(field).toHaveAttribute('placeholder', 'Well name');
    expect(field.closest(`.${headingClasses.searchField}`)).toHaveClass('field');
    await userEvent.keyboard('a');
    expect(screen.getByRole('button', { name: 'Erase' })).toBeInTheDocument();
  });

  function Collapsed({ actions, children }: { actions: number; children: React.ReactNode }) {
    const context = React.useMemo<HeadingContextValue>(
      () => ({
        layout: { ...FULL_LAYOUT, actions },
        narrow: false,
        register: () => () => {},
        requestMeasure: () => {},
      }),
      [actions],
    );
    return <HeadingContext.Provider value={context}>{children}</HeadingContext.Provider>;
  }

  it('collapses after the other secondary actions, and never while open', async () => {
    wrap(
      <Collapsed actions={1}>
        <HeadingActions>
          <HeadingSearch />
          <Button>Filter</Button>
          <Button variant="contained">Create</Button>
        </HeadingActions>
      </Collapsed>,
    );
    // The filter goes first, though it comes after the search.
    expect(screen.queryByRole('button', { name: 'Filter' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('keeps its place while open, however narrow the heading', async () => {
    const actions = (collapsed: number) => (
      <ThemeProvider>
        <Collapsed actions={collapsed}>
          <HeadingActions>
            <HeadingSearch />
            <Button>Filter</Button>
            <Button variant="contained">Create</Button>
          </HeadingActions>
        </Collapsed>
      </ThemeProvider>
    );
    const { rerender } = render(actions(0));
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    // The heading narrows: the filter folds, not the open search (nor the primary action).
    rerender(actions(2));
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filter' })).toBeNull();
  });

  it('is a Search item in the overflow menu, which opens it back in the row', async () => {
    const onOpen = vi.fn();
    wrap(
      <Collapsed actions={2}>
        <HeadingActions>
          <HeadingSearch onOpen={onOpen} />
          <Button>Filter</Button>
          <Button variant="contained">Create</Button>
        </HeadingActions>
      </Collapsed>,
    );
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const menu = screen.getByRole('menu', { name: 'More actions' });
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Search', 'Filter']);
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Search' }));
    // Back in the row, open and focused; the filter stays folded.
    const field = await screen.findByRole('textbox', { name: 'Search' });
    expect(field.closest(`.${headingClasses.actions}`)).not.toBeNull();
    await waitFor(() => expect(field).toHaveFocus());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Filter' })).toBeNull();
  });
});
