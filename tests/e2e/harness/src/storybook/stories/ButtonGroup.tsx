// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
/* eslint-disable react-hooks/refs -- verbatim story code */
import * as React from 'react';
import {
  Button,
  ButtonGroup,
  ClickAwayListener as Ut,
  Grow,
  Popper,
  Stack,
  Typography,
} from '@tecton-mui/ui';

const Re = { title: 'Molecules/Button Group', component: ButtonGroup };
function CT() {
  return (
    <span
      className="tecton-chevron-down-outline"
      style={{ fontSize: 'var(--tecton-icon-size-100)' }}
      aria-hidden
    />
  );
}
function CS({ variant: e, size: o, orientation: n = 'horizontal', color: r = 'primary' }) {
  return (
    <ButtonGroup variant={e} size={o} orientation={n} color={r}>
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </ButtonGroup>
  );
}
function CL({ label: e, children: o }) {
  return (
    <Stack spacing={1} alignItems="flex-start">
      <Typography variant="caption">{e}</Typography>
      {o}
    </Stack>
  );
}
function PrimaryCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Primary: solid fill
      </Typography>
      <CL label="Medium">
        <CS variant="contained" color="primary" size="medium" />
      </CL>
    </Stack>
  );
}
function SecondaryCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Secondary: subtle surface fill
      </Typography>
      <CL label="Medium">
        <CS variant="contained" color="secondary" size="medium" />
      </CL>
    </Stack>
  );
}
function TertiaryCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Tertiary: text-only, no chrome
      </Typography>
      <CL label="Medium">
        <CS variant="text" size="medium" />
      </CL>
    </Stack>
  );
}
function OutlinedCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Outline: bordered, no fill
      </Typography>
      <CL label="Medium">
        <CS variant="outlined" size="medium" />
      </CL>
    </Stack>
  );
}
function VerticalCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Vertical stack: 4 variants (medium size)
      </Typography>
      <Stack direction="row" spacing={4}>
        <CL label="Primary">
          <CS variant="contained" color="primary" size="medium" orientation="vertical" />
        </CL>
        <CL label="Secondary">
          <CS variant="contained" color="secondary" size="medium" orientation="vertical" />
        </CL>
        <CL label="Tertiary">
          <CS variant="text" size="medium" orientation="vertical" />
        </CL>
        <CL label="Outline">
          <CS variant="outlined" size="medium" orientation="vertical" />
        </CL>
      </Stack>
    </Stack>
  );
}
function SizesCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Medium (32px) vs Small (28px) across all 4 variants
      </Typography>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Primary
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <CL label="Medium">
            <CS variant="contained" color="primary" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="contained" color="primary" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Secondary
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <CL label="Medium">
            <CS variant="contained" color="secondary" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="contained" color="secondary" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Tertiary
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <CL label="Medium">
            <CS variant="text" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="text" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Outline
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <CL label="Medium">
            <CS variant="outlined" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="outlined" size="small" />
          </CL>
        </Stack>
      </Stack>
    </Stack>
  );
}
function X({ label: e, size: o }) {
  const n = React.useRef(null),
    [r, u] = React.useState(false);
  return (
    <Stack spacing={1} alignItems="flex-start">
      <Typography variant="caption">{e}</Typography>
      <Stack direction="row" sx={{ position: 'relative' }}>
        <ButtonGroup ref={n} variant="contained" color="primary" size={o}>
          <Button>One</Button>
          <Button
            aria-label="open options"
            aria-haspopup="true"
            aria-expanded={r}
            onClick={() => u((c) => !c)}
            sx={{ minWidth: 0, paddingInline: 'var(--tecton-space-100)' }}
          >
            <CT />
          </Button>
        </ButtonGroup>
        <Popper
          open={r}
          anchorEl={n.current}
          placement="bottom-end"
          transition
          disablePortal
          sx={{ zIndex: 1 }}
        >
          {({ TransitionProps: c }) => (
            <Grow {...c} style={{ transformOrigin: 'top right' }}>
              <div>
                <Ut onClickAway={() => u(false)}>
                  <ButtonGroup
                    orientation="vertical"
                    variant="contained"
                    color="secondary"
                    size={o}
                  >
                    <Button onClick={() => u(false)}>Edit</Button>
                    <Button onClick={() => u(false)}>Duplicate</Button>
                    <Button onClick={() => u(false)}>Delete</Button>
                  </ButtonGroup>
                </Ut>
              </div>
            </Grow>
          )}
        </Popper>
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Combo button: action + trailing menu trigger
        </Typography>
        <Stack direction="row" spacing={4}>
          <X label="Medium" size="medium" />
          <X label="Small" size="small" />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Primary group: 3 solid-filled buttons
        </Typography>
        <Stack direction="row" spacing={4}>
          <CL label="Medium">
            <CS variant="contained" color="primary" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="contained" color="primary" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Secondary group: surface-fill buttons
        </Typography>
        <Stack direction="row" spacing={4}>
          <CL label="Medium">
            <CS variant="contained" color="secondary" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="contained" color="secondary" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Tertiary group: text-only buttons
        </Typography>
        <Stack direction="row" spacing={4}>
          <CL label="Medium">
            <CS variant="text" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="text" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Outline group: bordered buttons, no fill
        </Typography>
        <Stack direction="row" spacing={4}>
          <CL label="Medium">
            <CS variant="outlined" size="medium" />
          </CL>
          <CL label="Small">
            <CS variant="outlined" size="small" />
          </CL>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Vertical groups: one per variant
        </Typography>
        <Stack direction="row" spacing={4}>
          <CL label="Primary">
            <CS variant="contained" color="primary" size="medium" orientation="vertical" />
          </CL>
          <CL label="Secondary">
            <CS variant="contained" color="secondary" size="medium" orientation="vertical" />
          </CL>
          <CL label="Tertiary">
            <CS variant="text" size="medium" orientation="vertical" />
          </CL>
          <CL label="Outline">
            <CS variant="outlined" size="medium" orientation="vertical" />
          </CL>
        </Stack>
      </Stack>
    </Stack>
  );
}
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_Primary = { name: 'Primary', render: () => <PrimaryCanvas /> };
const Story_Secondary = { name: 'Secondary', render: () => <SecondaryCanvas /> };
const Story_Tertiary = { name: 'Tertiary', render: () => <TertiaryCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_Vertical = { name: 'Vertical', render: () => <VerticalCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Y = ['One', 'Two', 'Three', 'Four'];
const Story_Playground = {
  name: 'Playground',
  args: {
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    orientation: 'horizontal',
    disabled: false,
    buttonCount: 3,
  },
  render: (e) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <ButtonGroup
        variant={e.variant}
        color={e.color}
        size={e.size}
        orientation={e.orientation}
        disabled={e.disabled}
      >
        {Y.slice(0, e.buttonCount).map((o) => (
          <Button key={o}>{o}</Button>
        ))}
      </ButtonGroup>
    </Stack>
  ),
};

export const meta = Re;
export const stories = {
  'molecules-button-group--examples': Story_Examples,
  'molecules-button-group--outlined': Story_Outlined,
  'molecules-button-group--playground': Story_Playground,
  'molecules-button-group--primary': Story_Primary,
  'molecules-button-group--secondary': Story_Secondary,
  'molecules-button-group--sizes': Story_Sizes,
  'molecules-button-group--tertiary': Story_Tertiary,
  'molecules-button-group--vertical': Story_Vertical,
};
