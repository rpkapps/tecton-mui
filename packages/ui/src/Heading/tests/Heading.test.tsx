import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../styles/index.js';
import Button from '../../Button/index.js';
import Tab from '../../Tab/index.js';
import Heading, {
  HeadingActions,
  HeadingTabs,
  HeadingTitle,
  headingClasses,
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
    // The paper surface is the part's own style; the consumer's sx comes after it.
    expect(getComputedStyle(ref.current!).padding).toBe('6px');
    expect(getComputedStyle(ref.current!).borderRadius).toBe('3px');
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
