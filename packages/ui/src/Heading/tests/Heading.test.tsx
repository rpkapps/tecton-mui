import * as React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../styles/index.js';
import Button from '../../Button/index.js';
import Divider from '../../Divider/index.js';
import Tab from '../../Tab/index.js';
import ToggleButton from '../../ToggleButton/index.js';
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

  it('labels the buttons "Home" and "More" by default, with decorative icons', () => {
    wrap(
      <HeadingTitle onHomeClick={() => {}} onMenuClick={() => {}}>
        Portfolio
      </HeadingTitle>,
    );
    for (const name of ['Home', 'More']) {
      const button = screen.getByRole('button', { name });
      expect(button.querySelector('[aria-hidden]')).not.toBeNull();
    }
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

describe('HeadingTabs scrolling', () => {
  it('has both scroll arrows while the tabs do not fit, as MUI scrollable Tabs do', () => {
    wrap(
      <HeadingTabs value={0} aria-label="Sections">
        {['Overview', 'Framing', 'Team', 'Builder'].map((label) => (
          <Tab key={label} label={label} />
        ))}
      </HeadingTabs>,
    );
    const group = document.querySelector(`.${headingClasses.tabGroup}`)!;
    const arrows = () => group.querySelectorAll(`.${headingClasses.scrollButton}`);
    // The tabs fit: no arrows.
    expect(arrows()).toHaveLength(0);
    expect(within(screen.getByRole('tablist')).getAllByRole('tab')).toHaveLength(4);

    // Narrower than its tabs, at its start: both arrows, the start one disabled (MUI's own
    // TabScrollButton hides it, in its place).
    const scroller = group.querySelector<HTMLElement>('.MuiTabs-scroller')!;
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 600 });
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 200 });
    const scrollTo = (left: number) =>
      act(() => {
        Object.defineProperty(scroller, 'scrollLeft', { configurable: true, value: left });
        scroller.dispatchEvent(new Event('scroll'));
      });
    scrollTo(0);
    expect(arrows()).toHaveLength(2);
    expect(arrows()[0]).toHaveClass('Mui-disabled', 'MuiTabScrollButton-root');
    expect(arrows()[1]).not.toHaveClass('Mui-disabled');
    // Mid-strip, both scroll; at the end, the end one is disabled.
    scrollTo(200);
    expect(arrows()[0]).not.toHaveClass('Mui-disabled');
    expect(arrows()[1]).not.toHaveClass('Mui-disabled');
    scrollTo(400);
    expect(arrows()).toHaveLength(2);
    expect(arrows()[1]).toHaveClass('Mui-disabled');
  });

  it('lets the pills scroll natively, without a scrollbar', () => {
    wrap(
      <HeadingTabs value={0} aria-label="Sections">
        <Tab label="Overview" />
      </HeadingTabs>,
    );
    const scroller = document.querySelector<HTMLElement>('.MuiTabs-scroller')!;
    expect(getComputedStyle(scroller).overflowX).toBe('auto');
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
    children,
  }: {
    layout: Partial<HeadingLayout>;
    children: React.ReactNode;
  }) {
    const context = React.useMemo<HeadingContextValue>(
      () => ({
        layout: { ...FULL_LAYOUT, ...layout },
        register: () => () => {},
        requestMeasure: () => {},
      }),
      [layout],
    );
    return <HeadingContext.Provider value={context}>{children}</HeadingContext.Provider>;
  }

  function Actions({
    layout,
    onCreate,
  }: {
    layout: Partial<HeadingLayout>;
    onCreate?: () => void;
  }) {
    return (
      <Collapsed layout={layout}>
        <HeadingActions>
          <>
            <Button>Search</Button>
            <Divider orientation="vertical" flexItem />
          </>
          <ToggleButton value="list" selected>
            List
          </ToggleButton>
          <Button variant="contained" onClick={onCreate}>
            Create
          </Button>
        </HeadingActions>
      </Collapsed>
    );
  }

  it('moves the actions that do not fit into the overflow tray, as they are', async () => {
    wrap(<Actions layout={{ actions: 2 }} />);
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    const overflow = screen.getByRole('button', { name: 'More actions' });
    expect(overflow).toHaveClass(headingClasses.overflowButton);
    expect(overflow).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(overflow);
    expect(overflow).toHaveAttribute('aria-expanded', 'true');
    const tray = screen.getByRole('dialog', { name: 'More actions' });
    expect(tray).toHaveClass(headingClasses.overflowTray);
    expect(within(tray).getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(within(tray).getByRole('button', { name: 'List' })).toBeInTheDocument();
    // The separator between them stays.
    expect(tray.querySelector('.MuiDivider-root')).not.toBeNull();
  });

  it('leaves out a separator at either end of the tray', async () => {
    wrap(<Actions layout={{ actions: 1 }} />);
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const tray = screen.getByRole('dialog', { name: 'More actions' });
    expect(within(tray).getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(tray.querySelector('.MuiDivider-root')).toBeNull();
  });

  it('closes the tray after a command, not after a toggle', async () => {
    const onCreate = vi.fn();
    wrap(<Actions layout={{ actions: 3 }} onCreate={onCreate} />);
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const tray = screen.getByRole('dialog', { name: 'More actions' });
    await userEvent.click(within(tray).getByRole('button', { name: 'List' }));
    expect(screen.getByRole('dialog', { name: 'More actions' })).toBeInTheDocument();
    await userEvent.click(within(tray).getByRole('button', { name: 'Create' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
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
    expect(screen.getAllByRole('tab')).toHaveLength(1);
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
          <Button variant="contained">Create</Button>
        </HeadingActions>
      </Heading>
    );
  }

  const resizeTo = (width: number) =>
    act(() => {
      headingWidth = width;
      observers.forEach((callback) => callback());
    });

  it('measures its parts and lets them give way as it narrows', () => {
    wrap(<Page />);
    const heading = screen.getByTestId('heading');
    // Everything fits.
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
    expect(heading).toHaveAttribute('data-width', 'lg');
    expect(heading).not.toHaveAttribute('data-measuring');

    // The actions go first, the primary one stays: 956px of content (72px gutters) holds the title,
    // the five tabs, ⋮ and the primary action (870px), not one more action (1006px).
    resizeTo(1100);
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5);

    // Then the tabs narrow (and scroll), still in one row: 636px of content (32px gutters) holds
    // the title, the narrowest tab group and ⋮ with the primary action, not the whole group.
    resizeTo(700);
    expect(heading).toHaveAttribute('data-width', 'md');
    expect(heading).toHaveAttribute('data-tabs');
    expect(heading).not.toHaveClass(headingClasses.compact);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();

    // Compact: the tabs get a row of their own.
    resizeTo(300);
    expect(heading).toHaveAttribute('data-width', 'sm');
    expect(heading).toHaveClass(headingClasses.compact);

    // And back.
    resizeTo(2000);
    expect(heading).not.toHaveClass(headingClasses.compact);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
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
    // The heading narrows: two actions collapse, the filter and the primary one, not the open
    // search.
    rerender(actions(2));
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Filter' })).toBeNull();
  });

  it('opens in the overflow tray, which stays open', async () => {
    wrap(
      <Collapsed actions={3}>
        <HeadingActions>
          <HeadingSearch />
          <Button>Filter</Button>
          <Button variant="contained">Create</Button>
        </HeadingActions>
      </Collapsed>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const tray = screen.getByRole('dialog', { name: 'More actions' });
    await userEvent.click(within(tray).getByRole('button', { name: 'Search' }));
    expect(within(tray).getByRole('search')).toBeInTheDocument();
    await userEvent.keyboard('g');
    await userEvent.click(within(tray).getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('dialog', { name: 'More actions' })).toBeInTheDocument();
  });
});
