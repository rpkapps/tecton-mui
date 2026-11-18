// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Badge, Box, IconButton, Stack, Typography } from '@tecton-mui/ui';

const R = ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'];
const F = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
const G = (a) => (a === 'secondary' ? 'Accent' : a.charAt(0).toUpperCase() + a.slice(1));
const _ = 96;
function CB({ variant: a, colors: r, anchor: n, badgeContent: t }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      {r.map((o) => (
        <Stack
          key={o}
          alignItems="center"
          sx={{ width: _, minHeight: 60, justifyContent: 'flex-start' }}
        >
          <Typography variant="caption" sx={{ mb: 1, fontWeight: 600, minHeight: 18 }}>
            {G(o)}
          </Typography>
          <Box sx={{ pt: '10px' }}>
            {n === 'iconbutton' ? (
              <Badge
                variant={a}
                color={o}
                badgeContent={a === 'standard' ? (t ?? 1) : undefined}
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <IconButton
                  color="tertiary"
                  variant="round"
                  size="medium"
                  aria-label={`${o}-anchor`}
                >
                  <span className="tecton-notifications-filled" aria-hidden />
                </IconButton>
              </Badge>
            ) : (
              <Badge variant={a} color={o} badgeContent={a === 'standard' ? (t ?? 1) : undefined} />
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
function StandardCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Standalone (no anchor)</Typography>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Variant = Standard
        </Typography>
        <CB variant="standard" colors={R} anchor="standalone" />
      </Stack>
    </Stack>
  );
}
function DotCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Standalone (no anchor)</Typography>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Variant = Dot
        </Typography>
        <CB variant="dot" colors={F} anchor="standalone" />
      </Stack>
    </Stack>
  );
}
function ColorsCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Anchored to an IconButton</Typography>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Variant = Standard
        </Typography>
        <CB variant="standard" colors={R} anchor="iconbutton" />
      </Stack>
    </Stack>
  );
}
function PlacementCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Anchored to an IconButton</Typography>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Variant = Dot
        </Typography>
        <CB variant="dot" colors={F} anchor="iconbutton" />
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack direction="row" spacing={5} alignItems="flex-start" sx={{ pt: '10px' }}>
      <Badge variant="standard" badgeContent={1} color="primary" overlap="circular">
        <IconButton color="tertiary" variant="round" size="medium" aria-label="Notifications">
          <span className="tecton-notifications-filled" aria-hidden />
        </IconButton>
      </Badge>
      <Badge
        variant="standard"
        badgeContent={1}
        color="secondary"
        overlap="rectangular"
        shape="rectangle"
      >
        <IconButton color="secondary" variant="square" size="medium" aria-label="Menu">
          <span className="tecton-menu-outline" aria-hidden />
        </IconButton>
      </Badge>
      <Badge variant="dot" color="info" overlap="circular">
        <IconButton color="tertiary" variant="round" size="medium" aria-label="Oil rig">
          <span className="tecton-oil-rig-offshore-outline" aria-hidden />
        </IconButton>
      </Badge>
      <Badge variant="standard" badgeContent="20+" color="error" overlap="circular">
        <IconButton color="tertiary" variant="round" size="medium" aria-label="Drill bit">
          <span className="tecton-drill-bit-outline" aria-hidden />
        </IconButton>
      </Badge>
    </Stack>
  );
}
const Be = { title: 'Atoms/Badge', component: Badge };
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Dot = { name: 'Dot', render: () => <DotCanvas /> };
const Story_Colors = { name: 'Colors', render: () => <ColorsCanvas /> };
const Story_Placement = { name: 'Placement', render: () => <PlacementCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    badgeContent: '5',
    color: 'primary',
    variant: 'standard',
    shape: 'pill',
    overlap: 'circular',
    invisible: false,
  },
  render: (a) => (
    <Stack sx={{ p: 3, pt: '20px', alignItems: 'flex-start' }}>
      <Badge
        variant={a.variant}
        shape={a.shape}
        color={a.color}
        badgeContent={a.variant === 'standard' ? a.badgeContent : undefined}
        overlap={a.overlap}
        invisible={a.invisible}
      >
        <IconButton color="tertiary" variant="round" size="medium" aria-label="Notifications">
          <span className="tecton-notifications-filled" aria-hidden />
        </IconButton>
      </Badge>
    </Stack>
  ),
};

export const meta = Be;
export const stories = {
  'atoms-badge--colors': Story_Colors,
  'atoms-badge--dot': Story_Dot,
  'atoms-badge--examples': Story_Examples,
  'atoms-badge--placement': Story_Placement,
  'atoms-badge--playground': Story_Playground,
  'atoms-badge--standard': Story_Standard,
};
