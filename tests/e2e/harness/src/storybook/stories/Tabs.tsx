// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Accordion,
  AccordionSummary as AccordionSummary_a,
  Box,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@tecton-mui/ui';

const g = ['Overview', 'Framing', 'Team', 'Project Well', 'Analytics', 'FD Builder', 'Time & Cost'];
function MediumCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Medium size, 32px tab height
      </Typography>
      <Tabs value={n} onChange={(a, t) => i(t)} variant="pills">
        {g.map((a) => (
          <Tab key={a} label={a} />
        ))}
        <Tab label="Archived" disabled />
      </Tabs>
    </Stack>
  );
}
function SmallCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Small size, 32px tab height
      </Typography>
      <Tabs value={n} onChange={(a, t) => i(t)} variant="pills" size="small">
        {g.map((a) => (
          <Tab key={a} label={a} />
        ))}
        <Tab label="Archived" disabled />
      </Tabs>
    </Stack>
  );
}
function TabIcon({ active: n, className: i }) {
  return (
    <span
      className={[`tecton-${n ? 'project-filled' : 'project-outline'}`, i]
        .filter(Boolean)
        .join(' ')}
      style={{ fontSize: 'var(--tecton-icon-size-100)' }}
      aria-hidden
    />
  );
}
function WithIconCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        With leading icon
      </Typography>
      <Tabs value={n} onChange={(a, t) => i(t)} variant="pills">
        {g.slice(0, 5).map((a, t) => (
          <Tab key={a} label={a} icon={<TabIcon active={n === t} />} iconPosition="start" />
        ))}
        <Tab label="Archived" icon={<TabIcon active={false} />} iconPosition="start" disabled />
      </Tabs>
    </Stack>
  );
}
function FilledCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        With elevated background wrapper: surface elevation-1
      </Typography>
      <Box
        sx={{
          backgroundColor: 'var(--tecton-color-bg-paper)',
          padding: 'var(--tecton-space-100)',
          borderRadius: 'var(--tecton-radius-50)',
          display: 'inline-block',
        }}
      >
        <Tabs value={n} onChange={(a, t) => i(t)} variant="pills">
          {g.map((a) => (
            <Tab key={a} label={a} />
          ))}
        </Tabs>
      </Box>
    </Stack>
  );
}
function VerticalCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Vertical orientation: left-side navigation</Typography>
      <Box sx={{ width: 200 }}>
        <Tabs orientation="vertical" value={n} onChange={(a, t) => i(t)} variant="pills">
          <Tab label="Overview" />
          <Tab label="Framing" />
          <Tab label="Team" />
          <Tab label="Analytics" />
          <Tab label="FD Builder" />
          <Tab label="Archived" disabled />
        </Tabs>
      </Box>
    </Stack>
  );
}
function SmallVerticalCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Small size, vertical
      </Typography>
      <Box sx={{ width: 200 }}>
        <Tabs
          orientation="vertical"
          value={n}
          onChange={(a, t) => i(t)}
          variant="pills"
          size="small"
        >
          <Tab label="Overview" />
          <Tab label="Framing" />
          <Tab label="Team" />
          <Tab label="Analytics" />
          <Tab label="FD Builder" />
          <Tab label="Archived" disabled />
        </Tabs>
      </Box>
    </Stack>
  );
}
function WithTrailingIconCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        With trailing icon
      </Typography>
      <Tabs value={n} onChange={(a, t) => i(t)} variant="pills">
        {g.slice(0, 5).map((a, t) => (
          <Tab key={a} label={a} icon={<TabIcon active={n === t} />} iconPosition="end" />
        ))}
        <Tab label="Archived" icon={<TabIcon active={false} />} iconPosition="end" disabled />
      </Tabs>
    </Stack>
  );
}
function SmallWithTrailingIconCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Small size, trailing icon
      </Typography>
      <Tabs value={n} onChange={(a, t) => i(t)} variant="pills" size="small">
        {g.slice(0, 5).map((a, t) => (
          <Tab key={a} label={a} icon={<TabIcon active={n === t} />} iconPosition="end" />
        ))}
        <Tab label="Archived" icon={<TabIcon active={false} />} iconPosition="end" disabled />
      </Tabs>
    </Stack>
  );
}
function ProjectNavCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Project navigation: filled pill on selected tab
      </Typography>
      <Tabs value={n} onChange={(a, t) => i(t)} variant="pills">
        {g.map((a) => (
          <Tab key={a} label={a} />
        ))}
      </Tabs>
    </Stack>
  );
}
function FilledWrapperCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Filled with elevated background wrapper
      </Typography>
      <Box
        sx={{
          backgroundColor: 'var(--tecton-color-bg-paper)',
          padding: 'var(--tecton-space-100)',
          borderRadius: 'var(--tecton-radius-50)',
          display: 'inline-block',
        }}
      >
        <Tabs value={n} onChange={(a, t) => i(t)} variant="pills">
          {g.map((a) => (
            <Tab key={a} label={a} />
          ))}
        </Tabs>
      </Box>
    </Stack>
  );
}
function AddTriggerCanvas() {
  const [n, i] = React.useState(0);
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Tabs with add-tab trigger + content panel
      </Typography>
      <Paper sx={{ p: 2, width: 360 }}>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Tabs value={n} onChange={(a, t) => i(t)} variant="pills" sx={{ flexGrow: 1 }}>
            <Tab label="All" />
            <Tab label="Projects" />
            <Tab label="Assets" />
          </Tabs>
          <IconButton size="small" aria-label="Add tab">
            <span
              className="tecton-add-outline"
              style={{ fontSize: 'var(--tecton-icon-size-100)' }}
              aria-hidden
            />
          </IconButton>
        </Stack>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary_a>
            <Typography variant="body2">Text</Typography>
          </AccordionSummary_a>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary_a>
            <Typography variant="body2">Text</Typography>
          </AccordionSummary_a>
        </Accordion>
      </Paper>
    </Stack>
  );
}
const fa = { title: 'Molecules/Tabs', component: Tabs };
const Story_Medium = { name: 'Medium', render: () => <MediumCanvas /> };
const Story_Small = { name: 'Small', render: () => <SmallCanvas /> };
const Story_SmallVertical = { name: 'Small vertical', render: () => <SmallVerticalCanvas /> };
const Story_SmallWithTrailingIcon = {
  name: 'Small with trailing icon',
  render: () => <SmallWithTrailingIconCanvas />,
};
const Story_WithIcon = { name: 'With icon', render: () => <WithIconCanvas /> };
const Story_Filled = { name: 'Filled', render: () => <FilledCanvas /> };
const Story_Vertical = { name: 'Vertical', render: () => <VerticalCanvas /> };
const Story_WithTrailingIcon = {
  name: 'With trailing icon',
  render: () => <WithTrailingIconCanvas />,
};
const Story_ProjectNav = { name: 'Project nav', render: () => <ProjectNavCanvas /> };
const Story_FilledWrapper = { name: 'Filled wrapper', render: () => <FilledWrapperCanvas /> };
const Story_AddTrigger = { name: 'Add trigger', render: () => <AddTriggerCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { value: 0, variant: 'standard', size: 'medium', orientation: 'horizontal', icon: 'none' },
  render: function StoryRender(n) {
    const [i, a] = React.useState(n.value);
    return (
      React.useEffect(() => {
        a(n.value);
      }, [n.value]),
      (
        <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
          <Tabs
            value={i}
            onChange={(t, s) => a(s)}
            variant={n.variant}
            size={n.size}
            orientation={n.orientation}
          >
            {['Overview', 'Framing', 'Team', 'Archived'].map((t, s) => (
              <Tab
                key={t}
                label={t}
                disabled={t === 'Archived'}
                {...(n.icon === 'none'
                  ? {}
                  : { icon: <TabIcon active={i === s} />, iconPosition: n.icon })}
              />
            ))}
          </Tabs>
        </Stack>
      )
    );
  },
};

export const meta = fa;
export const stories = {
  'molecules-tabs--add-trigger': Story_AddTrigger,
  'molecules-tabs--filled': Story_Filled,
  'molecules-tabs--filled-wrapper': Story_FilledWrapper,
  'molecules-tabs--medium': Story_Medium,
  'molecules-tabs--playground': Story_Playground,
  'molecules-tabs--project-nav': Story_ProjectNav,
  'molecules-tabs--small': Story_Small,
  'molecules-tabs--small-vertical': Story_SmallVertical,
  'molecules-tabs--small-with-trailing-icon': Story_SmallWithTrailingIcon,
  'molecules-tabs--vertical': Story_Vertical,
  'molecules-tabs--with-icon': Story_WithIcon,
  'molecules-tabs--with-trailing-icon': Story_WithTrailingIcon,
};
