// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@tecton-mui/ui';

function CU({ title: a = 'Card Title', subheader: t = 'Subheader' }) {
  return (
    <React.Fragment>
      <CardHeader title={a} subheader={t} sx={{ padding: 0 }} />
      <CardContent sx={{ padding: 0, paddingTop: 1, '&:last-child': { paddingBottom: 0 } }}>
        <Typography variant="body2">
          Card body content, Tecton Card demo. Figma spec: radius 8, padding 16, border 1px.
        </Typography>
      </CardContent>
    </React.Fragment>
  );
}
function CH({ state: a, children: t }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption">
        {'State '}
        {a}
      </Typography>
      {t}
    </Stack>
  );
}
function StandardCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Elevation 1: elevated surface (bg-paper)
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} rowGap={2}>
        <CH state="Enabled">
          <Card sx={{ width: 240, padding: 'var(--tecton-space-200)' }}>
            <CU title="Enabled" subheader="Static surface" />
          </Card>
        </CH>
        <CH state="Focused">
          <Card
            className="Mui-focusVisible"
            sx={{ width: 240, padding: 'var(--tecton-space-200)' }}
          >
            <CU title="Focused" subheader="Static surface" />
          </Card>
        </CH>
        <CH state="Disabled">
          <Card sx={{ width: 240, padding: 'var(--tecton-space-200)', opacity: 0.3 }}>
            <CU title="Disabled" subheader="Non-interactive" />
          </Card>
        </CH>
      </Stack>
    </Stack>
  );
}
function OutlinedCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Elevation 0: outlined surface (bg-default)
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} rowGap={2}>
        <CH state="Enabled">
          <Card variant="outlined" sx={{ width: 240, padding: 'var(--tecton-space-200)' }}>
            <CU title="Enabled" subheader="Static surface" />
          </Card>
        </CH>
        <CH state="Focused">
          <Card
            variant="outlined"
            className="Mui-focusVisible"
            sx={{ width: 240, padding: 'var(--tecton-space-200)' }}
          >
            <CU title="Focused" subheader="Static surface" />
          </Card>
        </CH>
        <CH state="Disabled">
          <Card
            variant="outlined"
            sx={{ width: 240, padding: 'var(--tecton-space-200)', opacity: 0.3 }}
          >
            <CU title="Disabled" subheader="Non-interactive" />
          </Card>
        </CH>
      </Stack>
    </Stack>
  );
}
const R = {
  outlined: {
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--tecton-color-surface-base-border-active)' },
    '&:active': {
      borderColor: 'var(--tecton-color-surface-base-border-active)',
      backgroundColor: 'var(--tecton-color-surface-base-bg-active)',
    },
  },
  elevation: {
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--tecton-color-surface-elevation-1-border-active)' },
    '&:active': {
      borderColor: 'var(--tecton-color-surface-elevation-1-border-active)',
      backgroundColor: 'var(--tecton-color-surface-elevation-1-bg-active)',
    },
  },
  alt: {
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'var(--tecton-color-surface-base-border-active)',
      backgroundColor: 'var(--tecton-color-action-secondary-bg-hover)',
    },
    '&:active': {
      borderColor: 'var(--tecton-color-surface-base-border-active)',
      backgroundColor: 'var(--tecton-color-action-secondary-bg-press)',
    },
  },
};
const v = { width: 240, padding: 'var(--tecton-space-200)' };
function ClickableCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Clickable = true: hover / press / focused states apply via CSS
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} rowGap={2}>
        <CH state="Enabled">
          <Card variant="outlined" sx={{ ...v, ...R.outlined }}>
            <CU title="Clickable" subheader="Hover me" />
          </Card>
        </CH>
        <CH state="Enabled">
          <Card sx={{ ...v, ...R.elevation }}>
            <CU title="Clickable" subheader="Hover me" />
          </Card>
        </CH>
        <CH state="Focused">
          <Card variant="outlined" className="Mui-focusVisible" sx={{ ...v, cursor: 'pointer' }}>
            <CU title="Clickable" subheader="Focused" />
          </Card>
        </CH>
        <CH state="Focused">
          <Card className="Mui-focusVisible" sx={{ ...v, cursor: 'pointer' }}>
            <CU title="Clickable" subheader="Focused" />
          </Card>
        </CH>
        <CH state="Disabled">
          <Card variant="outlined" sx={{ ...v, opacity: 0.3 }}>
            <CU title="Disabled" subheader="Non-interactive" />
          </Card>
        </CH>
        <CH state="Disabled">
          <Card sx={{ ...v, opacity: 0.3 }}>
            <CU title="Disabled" subheader="Non-interactive" />
          </Card>
        </CH>
      </Stack>
    </Stack>
  );
}
function ClickableAltCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Clickable ALT (elevation 0): hover and press tint the surface with the secondary action
        fill, Focused uses MUI's real focus-visible class
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} rowGap={2}>
        <CH state="Enabled">
          <Card variant="outlined" sx={{ ...v, ...R.alt }}>
            <CU title="Clickable ALT" subheader="Hover me" />
          </Card>
        </CH>
        <CH state="Focused">
          <Card variant="outlined" className="Mui-focusVisible" sx={{ ...v, cursor: 'pointer' }}>
            <CU title="Clickable ALT" subheader="Focused" />
          </Card>
        </CH>
        <CH state="Disabled">
          <Card variant="outlined" sx={{ ...v, opacity: 0.3 }}>
            <CU title="Disabled" subheader="Non-interactive" />
          </Card>
        </CH>
      </Stack>
    </Stack>
  );
}
function MediaCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Card with media area (Elevation 1)
      </Typography>
      <Card sx={{ width: 320, padding: 'var(--tecton-space-200)' }}>
        <Stack spacing={2}>
          <CardHeader title="Card with Media" subheader="Elevation 1" sx={{ padding: 0 }} />
          <Box
            sx={{
              height: 160,
              backgroundColor: 'var(--tecton-color-bg-default)',
              border: '1px solid var(--tecton-color-divider-subtle)',
              borderRadius: 'var(--tecton-radius-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              Media placeholder
            </Typography>
          </Box>
          <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
            <Typography variant="body2">
              Card body content, Tecton Card demo. Figma spec: radius 8, padding 16, border 1px.
            </Typography>
          </CardContent>
        </Stack>
      </Card>
    </Stack>
  );
}
function WithActionsCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Card with CardActions footer buttons
      </Typography>
      <Card sx={{ width: 320 }}>
        <CardHeader title="Card with Actions" subheader="Elevation 1" />
        <CardContent>
          <Typography variant="body2">
            Card body content, Tecton Card demo. Figma spec: radius 8, padding 16, border 1px.
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Cancel</Button>
          <Button size="small" variant="contained">
            Confirm
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}
function CY({ label: a, value: t }) {
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
        {a}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {t}
      </Typography>
    </Stack>
  );
}
function CVa() {
  return (
    <Card sx={{ width: 385, padding: 'var(--tecton-space-200)' }}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <span
              className="tecton-checkbox-unchecked-outline"
              style={{ fontSize: 'var(--tecton-icon-size-100)' }}
              aria-hidden
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Initial Design
            </Typography>
          </Stack>
          <IconButton size="small" aria-label="More options">
            <span
              className="tecton-more-vert-outline"
              style={{ fontSize: 'var(--tecton-icon-size-100)' }}
              aria-hidden
            />
          </IconButton>
        </Stack>
        <Chip label="Primary" size="small" />
        <Box
          sx={{
            height: 240,
            backgroundColor: 'var(--tecton-color-bg-default)',
            border: '1px solid var(--tecton-color-divider-subtle)',
            borderRadius: 'var(--tecton-radius-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Well schematic
          </Typography>
        </Box>
        <Stack spacing={1}>
          <CY label="AFE Cost" value="31M-34M" />
          <CY label="Plan Days" value="23d-38d" />
          <CY label="DDI" value="5.4" />
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
              Risk
            </Typography>
            <LinearProgress
              variant="determinate"
              value={80}
              color="error"
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
function CBa() {
  return (
    <Card sx={{ width: 450, padding: 'var(--tecton-space-200)' }}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <span
              className="tecton-checkbox-unchecked-outline"
              style={{ fontSize: 'var(--tecton-icon-size-100)' }}
              aria-hidden
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              FDA 1
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip label="Reference Case" size="small" variant="outlined" />
            <Chip label="Ongoing" size="small" />
          </Stack>
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Existing tie-ins
        </Typography>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
            Description
          </Typography>
          <Typography variant="body2">
            Prioritized combined well template for Orion B+C, followed…
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <CY label="Economics" value="High-Performing" />
          <Stack direction="row" spacing={3}>
            <Stack>
              <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
                NPV
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                18.43
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
                IRR
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                23.2%
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
                Breakevens
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                $36
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
                CapEx
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                27.5M
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
function CGa() {
  return (
    <Card sx={{ width: 370, padding: 'var(--tecton-space-200)' }}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Apollo-1
          </Typography>
          <Chip label="Ongoing" size="small" />
        </Stack>
        <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
          Field Name / Site Name
        </Typography>
        <Box
          sx={{
            height: 160,
            backgroundColor: 'var(--tecton-color-bg-default)',
            border: '1px solid var(--tecton-color-divider-subtle)',
            borderRadius: 'var(--tecton-radius-50)',
          }}
        />
        <Stack spacing={1}>
          <CY label="Progress" value="Publish results" />
          <CY label="Team" value="31M-34M" />
          <CY label="Type" value="Offshore Producer" />
        </Stack>
      </Stack>
    </Card>
  );
}
function CMa() {
  return (
    <Card sx={{ width: 214, padding: 'var(--tecton-space-200)' }}>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
          Spare Capacity
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
          <Typography variant="h4" sx={{ fontWeight: 'var(--tecton-font-weight-heading)' }}>
            38
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
            Mbbl/d
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
          Available for tiebacks
        </Typography>
      </Stack>
    </Card>
  );
}
function CYa() {
  return (
    <Card sx={{ width: 367, padding: 'var(--tecton-space-200)' }}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Northreach Delta
          </Typography>
          <Chip label="Ongoing" size="small" />
        </Stack>
        <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
          Multi-well · Orion hub
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {['DG-0', 'DG-1', 'DG-2', 'DG-3'].map((a, t) => (
            <Box key={a} sx={{ flex: 1 }}>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    t < 2
                      ? 'var(--tecton-color-status-success-filled-bg)'
                      : 'var(--tecton-color-divider-subtle)',
                }}
              />
              <Typography variant="caption" sx={{ mt: 0.5 }}>
                {a}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <span
            className="tecton-calendar-outline"
            style={{
              fontSize: 'var(--tecton-icon-size-100)',
              color: 'var(--tecton-color-text-secondary)',
            }}
            aria-hidden
          />
          <Typography variant="caption">Last Update: 12-Nov-2025</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
function Ca() {
  return (
    <Card sx={{ width: 214, padding: 'var(--tecton-space-200)' }}>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ color: 'var(--tecton-color-text-secondary)' }}>
          Flowline tie-in point
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Existing manifold
        </Typography>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <span
              className="tecton-checkbox-unchecked-outline"
              style={{ fontSize: 'var(--tecton-icon-size-100)' }}
              aria-hidden
            />
            <Typography variant="caption">Facilities</Typography>
          </Stack>
          <Chip label="Approved" size="small" color="success" sx={{ height: 20, fontSize: 11 }} />
        </Stack>
      </Stack>
    </Card>
  );
}
function ExamplesCanvas() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(470px, 1fr))',
        columnGap: 'var(--tecton-space-400)',
        rowGap: 'var(--tecton-space-600)',
        maxWidth: 1500,
        alignItems: 'start',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Well design overview
        </Typography>
        <CVa />
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Field development analysis
        </Typography>
        <CBa />
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Field site overview
        </Typography>
        <CGa />
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Multi-well status
        </Typography>
        <CYa />
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Approval flag
        </Typography>
        <Ca />
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          KPI callout
        </Typography>
        <CMa />
      </Stack>
    </Box>
  );
}
const _a = { title: 'Molecules/Card', component: Card };
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_Media = { name: 'Media', render: () => <MediaCanvas /> };
const Story_Clickable = { name: 'Clickable', render: () => <ClickableCanvas /> };
const Story_ClickableAlt = { name: 'Clickable ALT', render: () => <ClickableAltCanvas /> };
const Story_WithActions = { name: 'With actions', render: () => <WithActionsCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    variant: 'elevated',
    title: 'Card Title',
    description:
      'Card body content, Tecton Card demo. Figma spec: radius 8, padding 16, border 1px.',
    showActions: false,
    clickable: 'false',
    state: 'enabled',
  },
  render: function StoryRender(a) {
    const t =
        a.clickable === 'trueAlt' ? 'alt' : a.variant === 'outlined' ? 'outlined' : 'elevation',
      o =
        a.clickable === 'false' || a.state === 'disabled'
          ? {}
          : a.state === 'focused'
            ? { cursor: 'pointer' }
            : R[t];
    return (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        <Card
          variant={a.variant}
          className={a.state === 'focused' ? 'Mui-focusVisible' : undefined}
          sx={{
            width: 320,
            padding: 'var(--tecton-space-200)',
            ...o,
            ...(a.state === 'disabled' ? { opacity: 0.3 } : {}),
          }}
        >
          <CardHeader title={a.title} />
          <CardContent>
            <Typography variant="body2">{a.description}</Typography>
          </CardContent>
          {a.showActions && (
            <CardActions>
              <Button size="small">Cancel</Button>
              <Button size="small" variant="contained">
                Confirm
              </Button>
            </CardActions>
          )}
        </Card>
      </Stack>
    );
  },
};

export const meta = _a;
export const stories = {
  'molecules-card--clickable': Story_Clickable,
  'molecules-card--clickable-alt': Story_ClickableAlt,
  'molecules-card--examples': Story_Examples,
  'molecules-card--media': Story_Media,
  'molecules-card--outlined': Story_Outlined,
  'molecules-card--playground': Story_Playground,
  'molecules-card--standard': Story_Standard,
  'molecules-card--with-actions': Story_WithActions,
};
