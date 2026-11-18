// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup as ToggleButtonGroup_a,
  Typography,
} from '@tecton-mui/ui';

function CP({ fluid: r = false, left: n, right: a }) {
  return (
    <Box
      sx={{
        width: r ? '100%' : 1920,
        paddingInline: '72px',
        paddingBlock: '32px',
        boxSizing: 'border-box',
      }}
    >
      <Stack
        direction="row"
        sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {n}
        {a ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', marginLeft: 'auto' }}>
            {a}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
const ue = {
  fontFamily: 'var(--tecton-font-family-sans)',
  fontSize: 'var(--tecton-font-size-heading-1)',
  fontWeight: 500,
  lineHeight: 'var(--tecton-line-height-heading-1)',
  color: 'var(--tecton-color-text-primary)',
  whiteSpace: 'nowrap',
};
function CH({ title: r, homeButton: n = false, chevronButton: a = false }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center' }} spacing="6px">
      {n ? (
        <IconButton size="medium" aria-label="Home">
          <span className="tecton-home-outline" aria-hidden />
        </IconButton>
      ) : null}
      <Typography sx={ue}>{r}</Typography>
      {a ? (
        <IconButton size="small" aria-label="More">
          <span
            className="tecton-chevron-down-outline"
            style={{ fontSize: 'var(--tecton-icon-size-100)' }}
            aria-hidden
          />
        </IconButton>
      ) : null}
    </Stack>
  );
}
function B({ label: r }) {
  return (
    <InputAdornment position="start">
      <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
        {r}
      </Typography>
    </InputAdornment>
  );
}
function F() {
  return (
    <Box
      component="hr"
      role="separator"
      aria-orientation="vertical"
      sx={{
        width: '1px',
        margin: 0,
        border: 0,
        alignSelf: 'stretch',
        backgroundColor: 'var(--tecton-color-divider-subtle)',
      }}
    />
  );
}
function P({ fluid: r = false }) {
  return (
    <CP
      fluid={r}
      left={<CH title="Portfolio" homeButton chevronButton />}
      right={
        <Button
          variant="contained"
          color="primary"
          startIcon={<span className="tecton-add-outline" aria-hidden />}
        >
          New Project
        </Button>
      }
    />
  );
}
function D({ fluid: r = false }) {
  return (
    <CP
      fluid={r}
      left={
        <Stack
          direction="row"
          sx={{ alignItems: 'center', height: 'var(--tecton-space-600)' }}
          spacing={4}
        >
          <CH title="Orion Discovery" />
          <Box
            sx={{
              bgcolor: 'var(--tecton-color-bg-paper)',
              p: 'var(--tecton-space-75)',
              borderRadius: 'var(--tecton-radius-50)',
            }}
          >
            <Tabs value={0} variant="pills" aria-label="Discovery sections">
              <Tab label="Overview" />
              <Tab label="Framing" />
              <Tab label="Team" />
              <Tab label="Builder" />
              <Tab label="Time & Cost" />
              <Tab label="Compare" />
              <Tab label="Analytics" />
            </Tabs>
          </Box>
        </Stack>
      }
      right={
        <ToggleButtonGroup_a exclusive value="list" size="small" aria-label="View mode">
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
        </ToggleButtonGroup_a>
      }
    />
  );
}
function O({ fluid: r = false }) {
  return (
    <CP
      fluid={r}
      left={
        <Stack
          direction="row"
          sx={{ alignItems: 'center', height: 'var(--tecton-space-600)' }}
          spacing={4}
        >
          <CH title="Wells" />
          <Box
            sx={{
              bgcolor: 'var(--tecton-color-bg-paper)',
              p: 'var(--tecton-space-75)',
              borderRadius: 'var(--tecton-radius-50)',
            }}
          >
            <Tabs value={0} variant="pills" aria-label="Wells views">
              <Tab label="Grid" />
              <Tab label="List" />
              <Tab label="Map" />
            </Tabs>
          </Box>
        </Stack>
      }
      right={
        <React.Fragment>
          <IconButton size="medium" aria-label="Search">
            <span className="tecton-search-outline" aria-hidden />
          </IconButton>
          <IconButton size="medium" aria-label="Filter">
            <span className="tecton-filter-outline" aria-hidden />
          </IconButton>
          <F />
          <FormControl size="small" variant="filled">
            <Select value="by well" startAdornment={<B label="View:" />}>
              <MenuItem value="by well">by well</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" variant="filled">
            <Select value="Recent" startAdornment={<B label="Sort:" />}>
              <MenuItem value="Recent">Recent</MenuItem>
            </Select>
          </FormControl>
          <F />
          <Button
            variant="contained"
            color="primary"
            startIcon={<span className="tecton-add-outline" aria-hidden />}
          >
            New Well
          </Button>
        </React.Fragment>
      }
    />
  );
}
function E({ fluid: r = false }) {
  return (
    <CP
      fluid={r}
      left={
        <Stack
          direction="row"
          sx={{ alignItems: 'center', height: 'var(--tecton-space-600)' }}
          spacing={4}
        >
          <CH title="Workspaces" />
          <Box
            sx={{
              bgcolor: 'var(--tecton-color-bg-paper)',
              p: 'var(--tecton-space-75)',
              borderRadius: 'var(--tecton-radius-50)',
            }}
          >
            <Tabs value={0} variant="pills" aria-label="Workspace scopes">
              <Tab label="All Workspaces" />
              <Tab label="Projects" />
              <Tab label="My Sandbox" />
            </Tabs>
          </Box>
        </Stack>
      }
      right={
        <React.Fragment>
          <FormControl size="small" variant="filled">
            <Select value="Recent" startAdornment={<B label="Sort:" />}>
              <MenuItem value="Recent">Recent</MenuItem>
            </Select>
          </FormControl>
          <F />
          <Button
            variant="contained"
            color="primary"
            startIcon={<span className="tecton-add-outline" aria-hidden />}
          >
            New Workspace
          </Button>
        </React.Fragment>
      }
    />
  );
}
function CLe() {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', height: 'var(--tecton-space-600)' }}
      spacing={4}
    >
      <CH title="Portfolio" homeButton chevronButton />
      <Box
        sx={{
          bgcolor: 'var(--tecton-color-bg-paper)',
          p: 'var(--tecton-space-75)',
          borderRadius: 'var(--tecton-radius-50)',
        }}
      >
        <Tabs value={0} variant="pills" aria-label="Portfolio sections">
          <Tab label="Overview" />
          <Tab label="Framing" />
          <Tab label="Team" />
          <Tab label="Builder" />
          <Tab label="Time & Cost" />
          <Tab label="Compare" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>
    </Stack>
  );
}
function CCe() {
  return (
    <React.Fragment>
      <IconButton size="medium" aria-label="Search">
        <span className="tecton-search-outline" aria-hidden />
      </IconButton>
      <IconButton size="medium" aria-label="Filter">
        <span className="tecton-filter-outline" aria-hidden />
      </IconButton>
      <FormControl size="small" variant="filled">
        <Select value="by well" startAdornment={<B label="View:" />}>
          <MenuItem value="by well">by well</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" variant="filled">
        <Select value="Recent" startAdornment={<B label="Sort:" />}>
          <MenuItem value="Recent">Recent</MenuItem>
        </Select>
      </FormControl>
      <ToggleButtonGroup_a exclusive value="list" size="small" aria-label="View mode">
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
      </ToggleButtonGroup_a>
      <Button variant="text" color="secondary">
        Publish
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<span className="tecton-add-outline" aria-hidden />}
      >
        Create Project
      </Button>
    </React.Fragment>
  );
}
function SectionCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="caption" sx={{ opacity: 0.7, px: 9 }}>
        Section-level heading: title cluster only, no tabs, no right cluster. Uses the shared
        HeadingFrame at Figma-exact 1920px width.
      </Typography>
      <CP left={<CH title="Portfolio" />} />
    </Stack>
  );
}
function PageCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="caption" sx={{ opacity: 0.7, px: 9 }}>
        Canonical page heading Figma authors on the master symbol: title + 7-tab filled TabGroup +
        full right cluster. Fixed 1920px width matches Figma exactly.
      </Typography>
      <CP left={<CLe />} right={<CCe />} />
    </Stack>
  );
}
function ElevatedCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="caption" sx={{ opacity: 0.7, px: 9 }}>
        Same canonical composition, fluid width. Elevated to fill the host container instead of the
        Figma-authored 1920px.
      </Typography>
      <CP fluid left={<CLe />} right={<CCe />} />
    </Stack>
  );
}
function WithCrumbsCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="caption" sx={{ opacity: 0.7, px: 9 }}>
        Breadcrumb-style title cluster: home IconButton + title + chevron IconButton, no tabs, no
        right cluster. Shows the navigation-in-title pattern in isolation.
      </Typography>
      <CP left={<CH title="Portfolio" homeButton chevronButton />} />
    </Stack>
  );
}
function CL({ label: r, children: n }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ px: 9, color: 'text.secondary' }}>
        {r}
      </Typography>
      {n}
    </Stack>
  );
}
function WellsCanvas() {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <CL label="Wells · Figma-exact width (1920px)">
        <O />
      </CL>
      <CL label="Wells · fluid width">
        <O fluid />
      </CL>
    </Stack>
  );
}
function WorkspacesCanvas() {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <CL label="Workspaces · Figma-exact width (1920px)">
        <E />
      </CL>
      <CL label="Workspaces · fluid width">
        <E fluid />
      </CL>
    </Stack>
  );
}
function CompactCanvas() {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <CL label="Portfolio · Figma-exact width (1920px)">
        <P />
      </CL>
      <CL label="Portfolio · fluid width">
        <P fluid />
      </CL>
    </Stack>
  );
}
function ReportsCanvas() {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <CL label="Orion Discovery · Figma-exact width (1920px)">
        <D />
      </CL>
      <CL label="Orion Discovery · fluid width">
        <D fluid />
      </CL>
    </Stack>
  );
}
const Ct = { title: 'Organisms/Heading', component: Box };
const Story_Section = { name: 'Section', render: () => <SectionCanvas /> };
const Story_Page = { name: 'Page', render: () => <PageCanvas /> };
const Story_Elevated = { name: 'Elevated', render: () => <ElevatedCanvas /> };
const Story_WithCrumbs = { name: 'With crumbs', render: () => <WithCrumbsCanvas /> };
const Story_Wells = { name: 'Wells', render: () => <WellsCanvas /> };
const Story_Workspaces = { name: 'Workspaces', render: () => <WorkspacesCanvas /> };
const Story_Compact = { name: 'Compact', render: () => <CompactCanvas /> };
const Story_Reports = { name: 'Reports', render: () => <ReportsCanvas /> };

export const meta = Ct;
export const stories = {
  'organisms-heading--compact': Story_Compact,
  'organisms-heading--elevated': Story_Elevated,
  'organisms-heading--page': Story_Page,
  'organisms-heading--reports': Story_Reports,
  'organisms-heading--section': Story_Section,
  'organisms-heading--wells': Story_Wells,
  'organisms-heading--with-crumbs': Story_WithCrumbs,
  'organisms-heading--workspaces': Story_Workspaces,
};
