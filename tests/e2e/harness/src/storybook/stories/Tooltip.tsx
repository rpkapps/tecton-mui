// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Button, Chip, IconButton, Link, Stack, Tooltip, Typography } from '@tecton-mui/ui';

const No = { title: 'Atoms/Tooltip', component: Tooltip };
function TriggerCell({ children: e }) {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        minWidth: 160,
        padding: 'var(--tecton-space-300)',
      }}
    >
      {e}
    </Stack>
  );
}
function DefaultCanvas() {
  return (
    <TriggerCell>
      <Tooltip title="My Tooltip">
        <Button variant="outlined">Hover me</Button>
      </Tooltip>
    </TriggerCell>
  );
}
const Ke = ['Bottom', 'Top', 'Right', 'Left'];
const Dt = ['Center', 'Start', 'End'];
const Xe = { Bottom: 'bottom', Top: 'top', Right: 'right', Left: 'left' };
const Je = { Center: '', Start: '-start', End: '-end' };
function Ye(e, o) {
  return `${Xe[e]}${Je[o]}`;
}
function PlacementCanvas() {
  return (
    <Stack spacing={3}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(var(--tecton-space-1200), var(--tecton-space-1400)) repeat(3, minmax(var(--tecton-space-1400), 1fr))',
          columnGap: 'var(--tecton-space-300)',
          rowGap: 'var(--tecton-space-300)',
          alignItems: 'start',
        }}
      >
        <div />
        {Dt.map((e) => (
          <Typography key={e} variant="subtitle2" sx={{ textAlign: 'center' }}>
            {e}
          </Typography>
        ))}
        {Ke.map((e) => (
          <div key={e} style={{ display: 'contents' }}>
            <Typography
              variant="body2"
              sx={{
                alignSelf: 'center',
                justifySelf: 'end',
                paddingRight: 'var(--tecton-space-100)',
                minWidth: 'var(--tecton-space-1200)',
              }}
            >
              {e}
            </Typography>
            {Dt.map((o) => (
              <TriggerCell key={`${e}-${o}`}>
                <Tooltip arrow placement={Ye(e, o)} title="My Tooltip">
                  <Button variant="outlined">Hover me</Button>
                </Tooltip>
              </TriggerCell>
            ))}
          </div>
        ))}
      </div>
    </Stack>
  );
}
function ArrowCanvas() {
  return (
    <Stack direction="row" spacing={4} alignItems="center">
      <TriggerCell>
        <Tooltip title="My Tooltip" placement="bottom">
          <Button variant="outlined">Hover me</Button>
        </Tooltip>
      </TriggerCell>
      <TriggerCell>
        <Tooltip arrow title="My Tooltip" placement="bottom">
          <Button variant="outlined">Hover me</Button>
        </Tooltip>
      </TriggerCell>
    </Stack>
  );
}
function LongCanvas() {
  return (
    <TriggerCell>
      <Tooltip
        arrow
        placement="bottom"
        title="A longer tooltip label that wraps across multiple lines when the trigger sits near the viewport edge."
      >
        <Button variant="outlined">Hover me</Button>
      </Tooltip>
    </TriggerCell>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h6">Icon Button</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Label" arrow>
            <IconButton>
              <span className="tecton-cube-outline" aria-hidden />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Button (Icon + Label)</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Add a new item" arrow>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<span className="tecton-add-outline" aria-hidden />}
            >
              New
            </Button>
          </Tooltip>
          <Tooltip title="Continue to next step" arrow>
            <Button
              variant="outlined"
              size="small"
              endIcon={<span className="tecton-chevron-right-outline" aria-hidden />}
            >
              Next
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Chip</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Filter is active" arrow>
            <Chip label="Active filter" color="primary" size="small" />
          </Tooltip>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Link</Typography>
        <Typography variant="body2">
          Read the{' '}
          <Tooltip title="Opens in a new window" arrow placement="top">
            <Link href="#">documentation</Link>
          </Tooltip>{' '}
          for details.
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Rich Content</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip
            title={
              <span>
                <b>Keyboard shortcut</b>
                <br />
                Ctrl+K to open command palette
              </span>
            }
            arrow
            placement="right"
          >
            <IconButton>
              <span className="tecton-search-outline" aria-hidden />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">No Arrow</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Simple hint without arrow">
            <IconButton>
              <span className="tecton-info-outline" aria-hidden />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Hover any trigger to reveal its tooltip.
      </Typography>
    </Stack>
  );
}
const Story_Default = { name: 'Default', render: () => <DefaultCanvas /> };
const Story_Placement = { name: 'Placement', render: () => <PlacementCanvas /> };
const Story_Arrow = { name: 'Arrow', render: () => <ArrowCanvas /> };
const Story_Long = { name: 'Long', render: () => <LongCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { title: 'My Tooltip', placement: 'bottom', arrow: true, disableInteractive: false },
  render: (e) => (
    <TriggerCell>
      <Tooltip
        title={e.title}
        placement={e.placement}
        arrow={e.arrow}
        disableInteractive={e.disableInteractive}
      >
        <IconButton aria-label="Info">
          <span className="tecton-cube-outline" aria-hidden />
        </IconButton>
      </Tooltip>
    </TriggerCell>
  ),
};

export const meta = No;
export const stories = {
  'atoms-tooltip--arrow': Story_Arrow,
  'atoms-tooltip--default': Story_Default,
  'atoms-tooltip--examples': Story_Examples,
  'atoms-tooltip--long': Story_Long,
  'atoms-tooltip--placement': Story_Placement,
  'atoms-tooltip--playground': Story_Playground,
};
