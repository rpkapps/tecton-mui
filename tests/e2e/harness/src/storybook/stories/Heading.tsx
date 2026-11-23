// Reproduction of the Tecton Storybook 0.10.1 "Organisms/Heading" stories, rendered with the
// @tecton-mui/ui `Heading` component and its parts (see tests/e2e/storybook-parity). The Storybook
// composes each heading by hand from MUI parts: a padded frame (`Heading`), a title cluster
// (`HeadingTitle`), a filled tab group on paper (`HeadingTabs`) and a right cluster
// (`HeadingActions`). The canvases, captions and controls are the story bundle's. Story ids match
// the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Button,
  Divider,
  FormControl,
  Heading,
  HeadingActions,
  HeadingSearch,
  HeadingTabs,
  HeadingTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@tecton-mui/ui';

const noop = () => {};
/** The Storybook's headings are 1920px wide (the Figma frame) unless fluid. */
const figmaWidth = { width: 1920 } as const;

function Frame({
  fluid = false,
  children,
  actions,
}: {
  fluid?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Heading sx={fluid ? undefined : figmaWidth}>
      {children}
      {actions ? <HeadingActions>{actions}</HeadingActions> : null}
    </Heading>
  );
}

function Title({
  title,
  homeButton = false,
  chevronButton = false,
}: {
  title: string;
  homeButton?: boolean;
  chevronButton?: boolean;
}) {
  return (
    <HeadingTitle
      onHomeClick={homeButton ? noop : undefined}
      onMenuClick={chevronButton ? noop : undefined}
    >
      {title}
    </HeadingTitle>
  );
}

function SelectLabel({ label }: { label: string }) {
  return (
    <InputAdornment position="start">
      <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
        {label}
      </Typography>
    </InputAdornment>
  );
}

function Separator() {
  return <Divider orientation="vertical" flexItem emphasis="subtle" />;
}

function AddButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<span className="tecton-add-outline" aria-hidden />}
    >
      {children}
    </Button>
  );
}

function ViewModeToggle() {
  return (
    <ToggleButtonGroup exclusive value="list" size="small" aria-label="View mode">
      <ToggleButton value="list">
        <span
          className="tecton-list-outline"
          style={{ fontSize: 'var(--tecton-icon-size-100)', marginRight: '4px' }}
          aria-hidden
        />
        List
      </ToggleButton>
      <ToggleButton value="grid">
        <span
          className="tecton-grid-view-outline"
          style={{ fontSize: 'var(--tecton-icon-size-100)', marginRight: '4px' }}
          aria-hidden
        />
        Grid
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function LabeledSelect({ label, value }: { label: string; value: string }) {
  return (
    <FormControl size="small" variant="filled">
      <Select value={value} startAdornment={<SelectLabel label={label} />}>
        <MenuItem value={value}>{value}</MenuItem>
      </Select>
    </FormControl>
  );
}

function SearchAndFilter() {
  return (
    <>
      <HeadingSearch />
      <IconButton size="medium" aria-label="Filter">
        <span className="tecton-filter-outline" aria-hidden />
      </IconButton>
    </>
  );
}

function Tabs({ label, tabs }: { label: string; tabs: string[] }) {
  return (
    <HeadingTabs value={0} aria-label={label}>
      {tabs.map((tab) => (
        <Tab key={tab} label={tab} />
      ))}
    </HeadingTabs>
  );
}

const SECTIONS = ['Overview', 'Framing', 'Team', 'Builder', 'Time & Cost', 'Compare', 'Analytics'];

// Compact: the portfolio title cluster and one action.
function Compact({ fluid = false }: { fluid?: boolean }) {
  return (
    <Frame fluid={fluid} actions={<AddButton>New Project</AddButton>}>
      <Title title="Portfolio" homeButton chevronButton />
    </Frame>
  );
}

// Reports: title, the section tabs and the view toggle.
function Reports({ fluid = false }: { fluid?: boolean }) {
  return (
    <Frame fluid={fluid} actions={<ViewModeToggle />}>
      <Title title="Orion Discovery" />
      <Tabs label="Discovery sections" tabs={SECTIONS} />
    </Frame>
  );
}

function Wells({ fluid = false }: { fluid?: boolean }) {
  return (
    <Frame
      fluid={fluid}
      actions={
        <>
          <SearchAndFilter />
          <Separator />
          <LabeledSelect label="View:" value="by well" />
          <LabeledSelect label="Sort:" value="Recent" />
          <Separator />
          <AddButton>New Well</AddButton>
        </>
      }
    >
      <Title title="Wells" />
      <Tabs label="Wells views" tabs={['Grid', 'List', 'Map']} />
    </Frame>
  );
}

function Workspaces({ fluid = false }: { fluid?: boolean }) {
  return (
    <Frame
      fluid={fluid}
      actions={
        <>
          <LabeledSelect label="Sort:" value="Recent" />
          <Separator />
          <AddButton>New Workspace</AddButton>
        </>
      }
    >
      <Title title="Workspaces" />
      <Tabs label="Workspace scopes" tabs={['All Workspaces', 'Projects', 'My Sandbox']} />
    </Frame>
  );
}

// The canonical page heading: title cluster, seven tabs and the full right cluster.
function Canonical({ fluid = false }: { fluid?: boolean }) {
  return (
    <Frame
      fluid={fluid}
      actions={
        <>
          <SearchAndFilter />
          <LabeledSelect label="View:" value="by well" />
          <LabeledSelect label="Sort:" value="Recent" />
          <ViewModeToggle />
          <Button variant="text" color="secondary">
            Publish
          </Button>
          <AddButton>Create Project</AddButton>
        </>
      }
    >
      <Title title="Portfolio" homeButton chevronButton />
      <Tabs label="Portfolio sections" tabs={SECTIONS} />
    </Frame>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="caption" sx={{ opacity: 0.7, px: 9 }}>
      {children}
    </Typography>
  );
}

function SectionCanvas() {
  return (
    <Stack spacing={3}>
      <Caption>
        Section-level heading: title cluster only, no tabs, no right cluster. Uses the shared
        HeadingFrame at Figma-exact 1920px width.
      </Caption>
      <Frame>
        <Title title="Portfolio" />
      </Frame>
    </Stack>
  );
}
function PageCanvas() {
  return (
    <Stack spacing={3}>
      <Caption>
        Canonical page heading Figma authors on the master symbol: title + 7-tab filled TabGroup +
        full right cluster. Fixed 1920px width matches Figma exactly.
      </Caption>
      <Canonical />
    </Stack>
  );
}
function ElevatedCanvas() {
  return (
    <Stack spacing={3}>
      <Caption>
        Same canonical composition, fluid width. Elevated to fill the host container instead of the
        Figma-authored 1920px.
      </Caption>
      <Canonical fluid />
    </Stack>
  );
}
function WithCrumbsCanvas() {
  return (
    <Stack spacing={3}>
      <Caption>
        Breadcrumb-style title cluster: home IconButton + title + chevron IconButton, no tabs, no
        right cluster. Shows the navigation-in-title pattern in isolation.
      </Caption>
      <Frame>
        <Title title="Portfolio" homeButton chevronButton />
      </Frame>
    </Stack>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ px: 9, color: 'text.secondary' }}>
        {label}
      </Typography>
      {children}
    </Stack>
  );
}
function Pair({
  name,
  Variant,
}: {
  name: string;
  Variant: React.ComponentType<{ fluid?: boolean }>;
}) {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <Labeled label={`${name} · Figma-exact width (1920px)`}>
        <Variant />
      </Labeled>
      <Labeled label={`${name} · fluid width`}>
        <Variant fluid />
      </Labeled>
    </Stack>
  );
}

export const meta = { title: 'Organisms/Heading' };
export const stories = {
  'organisms-heading--compact': {
    name: 'Compact',
    render: () => <Pair name="Portfolio" Variant={Compact} />,
  },
  'organisms-heading--elevated': { name: 'Elevated', render: () => <ElevatedCanvas /> },
  'organisms-heading--page': { name: 'Page', render: () => <PageCanvas /> },
  'organisms-heading--reports': {
    name: 'Reports',
    render: () => <Pair name="Orion Discovery" Variant={Reports} />,
  },
  'organisms-heading--section': { name: 'Section', render: () => <SectionCanvas /> },
  'organisms-heading--wells': {
    name: 'Wells',
    render: () => <Pair name="Wells" Variant={Wells} />,
  },
  'organisms-heading--with-crumbs': { name: 'With crumbs', render: () => <WithCrumbsCanvas /> },
  'organisms-heading--workspaces': {
    name: 'Workspaces',
    render: () => <Pair name="Workspaces" Variant={Workspaces} />,
  },
};
