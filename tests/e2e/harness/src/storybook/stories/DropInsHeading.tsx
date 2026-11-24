// Reproduction of the Tecton drop-in Storybook (apps/storybook 1.3.0) "Drop-ins/Heading" stories,
// rendered with the React `Heading` parts of @tecton-mui/ui instead of the `<wc-heading>` web
// component (wc-heading 1.0.0). The host page follows the story code; only the element changes: the
// attributes become parts and MUI children (`page-title`, `home-button` and `page-menu` a
// `HeadingTitle`, `.tabs` and `active-tab` a `HeadingTabs` of `Tab`s, `search`, `filter`,
// `.selects`, `view-toggle`, `secondary-action` and `primary-action` the `IconButton`s, `Select`s,
// `ToggleButtonGroup` and `Button`s of a `HeadingActions`, with the dividers the drop-in puts
// between them), and the `wc-heading-*` events become `onClick`, `onChange` and the title's
// `onHomeClick` / `onMenuClick`. See tests/e2e/storybook-parity.spec.ts.
import * as React from 'react';
import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  Heading,
  HeadingActions,
  HeadingTabs,
  HeadingTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';

interface TabItem {
  value: string;
  label: string;
}
interface SelectItem {
  id: string;
  label?: string;
  value: string;
  options: { value: string; label: string }[];
}

const PROJECT_TABS: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'framing', label: 'Framing' },
  { value: 'team', label: 'Team' },
  { value: 'builder', label: 'Builder' },
  { value: 'time-and-cost', label: 'Time & Cost' },
  { value: 'compare', label: 'Compare' },
  { value: 'analytics', label: 'Analytics' },
];
const WELLS_TABS: TabItem[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'map', label: 'Map' },
];
const WORKSPACES_TABS: TabItem[] = [
  { value: 'all', label: 'All Workspaces' },
  { value: 'projects', label: 'Projects' },
  { value: 'sandbox', label: 'My Sandbox' },
];
const VIEW: SelectItem = {
  id: 'view',
  label: 'View:',
  value: 'by-well',
  options: [
    { value: 'by-well', label: 'by well' },
    { value: 'by-pad', label: 'by pad' },
    { value: 'by-field', label: 'by field' },
  ],
};
const SORT: SelectItem = {
  id: 'sort',
  label: 'Sort:',
  value: 'recent',
  options: [
    { value: 'recent', label: 'Recent' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
  ],
};
const VIEW_AND_SORT = [VIEW, SORT];
const PAGES = ['Portfolio', 'Projects', 'Reports'];
const noop = () => {};

/** The props of one drop-in heading, as its attributes and properties. */
interface HeadingConfig {
  pageTitle: string;
  homeButton?: boolean;
  pageMenu?: boolean;
  tabs?: TabItem[];
  activeTab?: string;
  search?: boolean;
  filter?: boolean;
  selects?: SelectItem[];
  viewToggle?: boolean;
  view?: string;
  secondaryAction?: string;
  primaryAction?: string;
  onHomeClick?: () => void;
  onPageMenuClick?: (anchor: HTMLElement) => void;
  onTabChange?: (value: string) => void;
  onSelectChange?: (id: string, value: string) => void;
  onViewChange?: (view: string) => void;
}

/** The drop-in's select label: Tecton tiny type in the secondary text color. */
const SELECT_LABEL: React.CSSProperties = {
  fontFamily: 'var(--tecton-font-family-sans)',
  fontSize: 'var(--tecton-font-size-tiny)',
  lineHeight: 'var(--tecton-line-height-tiny)',
  fontWeight: 'var(--tecton-font-weight-tiny)',
  color: 'var(--tecton-color-text-secondary)',
};

const selectLabel = (select: SelectItem) =>
  select.label ? select.label.replace(/:\s*$/, '') : select.id;

/** `<wc-heading>` as `Heading` parts, in the drop-in's row order (src/fold.ts `rowItems`). */
function DropInHeading(props: HeadingConfig) {
  const {
    pageTitle,
    homeButton = false,
    pageMenu = false,
    tabs = [],
    activeTab,
    search = false,
    filter = false,
    selects = [],
    viewToggle = false,
    view = 'list',
    secondaryAction,
    primaryAction,
  } = props;
  const buttons = search || filter;
  const page: React.ReactNode[] = [];
  if (secondaryAction) {
    page.push(
      <Button key="secondary" variant="contained" color="secondary" onClick={noop}>
        {secondaryAction}
      </Button>,
    );
  }
  if (primaryAction) {
    page.push(
      <Button key="primary" variant="contained" startIcon={<Icon name="add" />} onClick={noop}>
        {primaryAction}
      </Button>,
    );
  }
  const divider = (key: string) => (
    <Divider key={`divider:${key}`} orientation="vertical" flexItem emphasis="subtle" />
  );
  const actions: React.ReactNode[] = [];
  if (search) {
    actions.push(
      <IconButton key="search" color="tertiary" variant="square" aria-label="Search" onClick={noop}>
        <Icon name="search" />
      </IconButton>,
    );
  }
  if (filter) {
    actions.push(
      <IconButton key="filter" color="tertiary" variant="square" aria-label="Filter" onClick={noop}>
        <Icon name="filter" />
      </IconButton>,
    );
  }
  if (buttons && selects.length > 0) actions.push(divider('buttons'));
  for (const select of selects) {
    actions.push(
      <Select
        key={`select:${select.id}`}
        variant="filled"
        value={select.value}
        onChange={(event) => props.onSelectChange?.(select.id, String(event.target.value))}
        startAdornment={
          select.label ? (
            <InputAdornment position="start">
              <span style={SELECT_LABEL}>{select.label}</span>
            </InputAdornment>
          ) : undefined
        }
        inputProps={{ 'aria-label': selectLabel(select) }}
        // The drop-in's selects are 152px wide.
        sx={{ width: 152 }}
      >
        {select.options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>,
    );
  }
  if (buttons || selects.length > 0) actions.push(divider('filter-and-sort'));
  if (viewToggle) {
    actions.push(
      <ToggleButtonGroup
        key="view-toggle"
        exclusive
        size="small"
        value={view}
        aria-label="Page view"
        onChange={(_event, next: string | null) => next && props.onViewChange?.(next)}
      >
        <ToggleButton value="list">
          <Icon name="list" />
          List
        </ToggleButton>
        <ToggleButton value="grid">
          <Icon name="grid-view" />
          Grid
        </ToggleButton>
      </ToggleButtonGroup>,
    );
    if (page.length > 0) actions.push(divider('view-toggle'));
  }
  actions.push(...page);

  return (
    <Heading>
      <HeadingTitle
        onHomeClick={homeButton ? (props.onHomeClick ?? noop) : undefined}
        onMenuClick={
          pageMenu
            ? (event: React.MouseEvent<HTMLButtonElement>) =>
                props.onPageMenuClick?.(event.currentTarget)
            : undefined
        }
      >
        {pageTitle}
      </HeadingTitle>
      {tabs.length > 0 ? (
        <HeadingTabs
          value={activeTab ?? false}
          onChange={(_event, next: string) => props.onTabChange?.(next)}
          aria-label="Page sections"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </HeadingTabs>
      ) : null}
      {actions.length > 0 ? <HeadingActions>{actions}</HeadingActions> : null}
    </Heading>
  );
}

/** The app owns the tab, the view and the select values, as the story pages do. */
function StatefulHeading(config: HeadingConfig) {
  const [tab, setTab] = React.useState(config.activeTab);
  const [view, setView] = React.useState(config.view ?? 'list');
  const [selects, setSelects] = React.useState(config.selects ?? []);
  return (
    <DropInHeading
      {...config}
      activeTab={tab}
      view={view}
      selects={selects}
      onTabChange={setTab}
      onViewChange={setView}
      onSelectChange={(id, value) =>
        setSelects((current) =>
          current.map((select) => (select.id === id ? { ...select, value } : select)),
        )
      }
    />
  );
}

const BASIC: HeadingConfig = {
  pageTitle: 'Portfolio',
  homeButton: true,
  pageMenu: true,
  primaryAction: 'New Project',
};
const PROJECT: HeadingConfig = {
  pageTitle: 'Orion Discovery',
  tabs: PROJECT_TABS,
  activeTab: 'overview',
  viewToggle: true,
};
const WELLS: HeadingConfig = {
  pageTitle: 'Wells',
  tabs: WELLS_TABS,
  activeTab: 'grid',
  search: true,
  filter: true,
  selects: VIEW_AND_SORT,
  primaryAction: 'New Well',
};
const WORKSPACES: HeadingConfig = {
  pageTitle: 'Workspaces',
  tabs: WORKSPACES_TABS,
  activeTab: 'all',
  selects: [SORT],
  primaryAction: 'New Workspace',
};
const ALL_PARTS: HeadingConfig = {
  pageTitle: 'Portfolio',
  homeButton: true,
  pageMenu: true,
  tabs: PROJECT_TABS,
  activeTab: 'overview',
  search: true,
  filter: true,
  selects: VIEW_AND_SORT,
  viewToggle: true,
  secondaryAction: 'Publish',
  primaryAction: 'Create Project',
};
const LONG_TITLE: HeadingConfig = {
  pageTitle: 'Northern Lights Phase II Reservoir Characterisation Study',
  homeButton: true,
  pageMenu: true,
  primaryAction: 'New Study',
};

function PageMenuStory() {
  const [page, setPage] = React.useState(PAGES[0]!);
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  return (
    <>
      <DropInHeading
        pageTitle={page}
        homeButton
        pageMenu
        onHomeClick={() => setPage(PAGES[0]!)}
        onPageMenuClick={setAnchor}
      />
      <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
        {PAGES.map((name) => (
          <MenuItem
            key={name}
            selected={name === page}
            onClick={() => {
              setPage(name);
              setAnchor(null);
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const ATTRIBUTES = [
  { name: 'home-button', label: 'home-button' },
  { name: 'page-menu', label: 'page-menu' },
  { name: 'search', label: 'search' },
  { name: 'filter', label: 'filter' },
  { name: 'view-toggle', label: 'view-toggle' },
  { name: 'secondary-action', label: 'secondary-action="Publish"' },
  { name: 'primary-action', label: 'primary-action="New Project"' },
] as const;

function LiveAttributesStory() {
  const [on, setOn] = React.useState<ReadonlySet<string>>(
    new Set(['home-button', 'page-menu', 'primary-action']),
  );
  const toggle = (name: string) =>
    setOn((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  return (
    <Stack spacing={2}>
      <FormGroup row>
        {ATTRIBUTES.map(({ name, label }) => (
          <FormControlLabel
            key={name}
            label={label}
            control={<Switch checked={on.has(name)} onChange={() => toggle(name)} />}
          />
        ))}
      </FormGroup>
      <DropInHeading
        pageTitle="Portfolio"
        homeButton={on.has('home-button')}
        pageMenu={on.has('page-menu')}
        search={on.has('search')}
        filter={on.has('filter')}
        viewToggle={on.has('view-toggle')}
        secondaryAction={on.has('secondary-action') ? 'Publish' : undefined}
        primaryAction={on.has('primary-action') ? 'New Project' : undefined}
      />
    </Stack>
  );
}

const SCREENS = [
  { name: 'The canvas' },
  { name: 'Small laptop', width: 1024 },
  { name: 'Tablet', width: 768 },
  { name: 'Narrow breakpoint', width: 720 },
  { name: 'Phone', width: 375 },
  { name: 'Small phone', width: 320 },
];

/** One screen of the Responsiveness story: a resizable frame, captioned with its width. */
function Screen({
  name,
  width,
  children,
}: {
  name: string;
  width?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = React.useState<number | null>(null);
  React.useEffect(() => {
    const frame = ref.current;
    if (!frame) return undefined;
    const observer = new ResizeObserver(() =>
      setMeasured(Math.round(frame.getBoundingClientRect().width)),
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  return (
    <figure data-screen={name} style={{ margin: 0 }}>
      <Typography component="figcaption" variant="caption" color="text.secondary">
        {name} · {measured ?? width ?? '…'}px
      </Typography>
      <div
        ref={ref}
        data-screen-frame=""
        style={{
          width: width ?? '100%',
          maxWidth: '100%',
          minWidth: 280,
          resize: 'horizontal',
          overflow: 'hidden',
          outline: '1px dashed var(--tecton-color-divider)',
        }}
      >
        {children}
      </div>
    </figure>
  );
}

function ResponsiveExamples() {
  return (
    <>
      <DropInHeading {...BASIC} />
      <DropInHeading {...PROJECT} />
      <DropInHeading {...WELLS} />
      <DropInHeading {...WORKSPACES} />
      <DropInHeading {...ALL_PARTS} />
      <DropInHeading {...LONG_TITLE} />
    </>
  );
}

function ResponsivenessStory() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <style>{`[data-screen-frame] .TectonHeading-root + .TectonHeading-root { border-top: 1px dashed var(--tecton-color-divider-subtle); }`}</style>
      {SCREENS.map((screen) => (
        <Screen key={screen.name} name={screen.name} width={screen.width}>
          <ResponsiveExamples />
        </Screen>
      ))}
    </div>
  );
}

/** The Figma variant: every part, in the Figma frame's width (1920px), scrolling sideways. */
function FigmaVariantStory() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ width: 1920 }}>
        <DropInHeading {...ALL_PARTS} />
      </div>
    </div>
  );
}

type Args = Record<string, unknown>;

export const meta = { title: 'Drop-ins/Heading' };
export const stories: Record<string, { args?: Args; render: (args: Args) => React.ReactNode }> = {
  'drop-ins-heading--basic': { render: () => <DropInHeading {...BASIC} /> },
  'drop-ins-heading--tabs-and-view-toggle': { render: () => <StatefulHeading {...PROJECT} /> },
  'drop-ins-heading--filter-and-sort': { render: () => <StatefulHeading {...WELLS} /> },
  'drop-ins-heading--tabs-and-sort': { render: () => <StatefulHeading {...WORKSPACES} /> },
  'drop-ins-heading--all-parts': { render: () => <StatefulHeading {...ALL_PARTS} /> },
  'drop-ins-heading--responsiveness': { render: () => <ResponsivenessStory /> },
  'drop-ins-heading--page-menu': { render: () => <PageMenuStory /> },
  'drop-ins-heading--figma-variant': { render: () => <FigmaVariantStory /> },
  'drop-ins-heading--live-attributes': { render: () => <LiveAttributesStory /> },
  'drop-ins-heading--playground': {
    args: {
      pageTitle: 'Portfolio',
      homeButton: true,
      pageMenu: true,
      tabs: true,
      search: false,
      filter: false,
      selects: false,
      viewToggle: false,
      view: 'list',
      secondaryAction: '',
      primaryAction: 'New Project',
    },
    render: (args) => (
      <StatefulHeading
        key={JSON.stringify(args)}
        pageTitle={args.pageTitle as string}
        homeButton={args.homeButton as boolean}
        pageMenu={args.pageMenu as boolean}
        tabs={args.tabs ? PROJECT_TABS : undefined}
        activeTab={args.tabs ? 'overview' : undefined}
        search={args.search as boolean}
        filter={args.filter as boolean}
        selects={args.selects ? VIEW_AND_SORT : undefined}
        viewToggle={args.viewToggle as boolean}
        view={args.view as string}
        secondaryAction={(args.secondaryAction as string) || undefined}
        primaryAction={(args.primaryAction as string) || undefined}
      />
    ),
  },
};
