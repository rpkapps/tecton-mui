// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Button, IconButton, Stack, Typography } from '@tecton-mui/ui';

const k = ['Primary', 'Secondary', 'Tertiary', 'Outlined', 'TextOnly'];
const y = ['medium', 'small'];
function E(n) {
  return n === 'Primary'
    ? { variant: 'contained', color: 'primary' }
    : n === 'Secondary'
      ? { variant: 'contained', color: 'secondary' }
      : n === 'Tertiary'
        ? { variant: 'text', color: 'tertiary' }
        : n === 'Outlined'
          ? { variant: 'outlined', color: 'primary' }
          : { variant: 'text', color: 'textOnly' };
}
function P(n) {
  return n === 'TextOnly' ? 'Text Only' : n;
}
const hn = ['Primary', 'Secondary', 'Tertiary', 'Outlined', 'TextOnly'];
const D = ['round', 'square'];
const N = ['medium', 'small'];
function z(n) {
  return n === 'Primary'
    ? 'primary'
    : n === 'Secondary'
      ? 'secondary'
      : n === 'Tertiary'
        ? 'tertiary'
        : n === 'Outlined'
          ? 'outlined'
          : 'textOnly';
}
const C = <span className="tecton-cube-outline" aria-hidden />;
const fn = ['Enabled', 'Focused', 'Activated'];
function q(n) {
  return n === 'Focused'
    ? { className: 'Mui-focusVisible' }
    : n === 'Activated'
      ? { activated: true }
      : n === 'Disabled'
        ? { disabled: true }
        : {};
}
function A({ variants: n }) {
  return (
    <Stack spacing={6}>
      <Stack spacing={4}>
        <Typography variant="h6">Labelled buttons</Typography>
        {y.map((a) => (
          <Stack key={a} spacing={2}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {'Size '}
              {a === 'medium' ? 'Medium' : 'Small'}
            </Typography>
            {['Enabled', 'Focused'].map((e) => (
              <Stack
                key={e}
                direction="row"
                spacing={1.5}
                rowGap={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography sx={{ minWidth: 96 }} variant="body2">
                  {e}
                </Typography>
                {n.map((o) => {
                  const r = E(o);
                  return (
                    <Button key={o} variant={r.variant} color={r.color} size={a} {...q(e)}>
                      {P(o)}
                    </Button>
                  );
                })}
              </Stack>
            ))}
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {'Hover and Pressed states apply via '}
              <code>:hover</code>
              {' / '}
              <code>:active</code>. Interact with any Enabled button above.
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={4}>
        <Typography variant="h6">Icon-only buttons</Typography>
        {D.map((a) => (
          <Stack key={a} spacing={3}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {'Shape '}
              {a === 'round' ? 'Round' : 'Square'}
            </Typography>
            {N.map((e) => (
              <Stack key={`${a}-${e}`} spacing={2}>
                <Typography variant="body2">
                  {'Size '}
                  {e === 'medium' ? 'Medium' : 'Small'}
                </Typography>
                {fn.map((o) => (
                  <Stack
                    key={o}
                    direction="row"
                    spacing={1.5}
                    rowGap={2}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography sx={{ minWidth: 96 }} variant="body2">
                      {o}
                    </Typography>
                    {n.map((r) => (
                      <IconButton
                        key={r}
                        color={z(r)}
                        size={e}
                        variant={a === 'square' ? 'square' : undefined}
                        {...q(o)}
                        aria-label={r}
                      >
                        {C}
                      </IconButton>
                    ))}
                  </Stack>
                ))}
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function PrimaryCanvas() {
  return <A variants={['Primary']} />;
}
function SecondaryCanvas() {
  return <A variants={['Secondary']} />;
}
function TertiaryCanvas() {
  return <A variants={['Tertiary', 'TextOnly']} />;
}
function OutlinedCanvas() {
  return <A variants={['Outlined']} />;
}
function DisabledCanvas() {
  return (
    <Stack spacing={6}>
      <Stack spacing={4}>
        <Typography variant="h6">Labelled buttons</Typography>
        {y.map((n) => (
          <Stack key={n} spacing={2}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {'Size '}
              {n === 'medium' ? 'Medium' : 'Small'}
            </Typography>
            <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center" flexWrap="wrap">
              <Typography sx={{ minWidth: 96 }} variant="body2">
                Disabled
              </Typography>
              {k.map((a) => {
                const e = E(a);
                return (
                  <Button key={a} disabled variant={e.variant} color={e.color} size={n}>
                    {P(a)}
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={4}>
        <Typography variant="h6">Icon-only buttons</Typography>
        {D.map((n) => (
          <Stack key={n} spacing={3}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {'Shape '}
              {n === 'round' ? 'Round' : 'Square'}
            </Typography>
            {N.map((a) => (
              <Stack key={`${n}-${a}`} spacing={2}>
                <Typography variant="body2">
                  {'Size '}
                  {a === 'medium' ? 'Medium' : 'Small'}
                </Typography>
                <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center" flexWrap="wrap">
                  <Typography sx={{ minWidth: 96 }} variant="body2">
                    Disabled
                  </Typography>
                  {hn.map((e) => (
                    <IconButton
                      key={e}
                      disabled
                      color={z(e)}
                      size={a}
                      variant={n === 'square' ? 'square' : undefined}
                      aria-label={e}
                    >
                      {C}
                    </IconButton>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function StateRowCanvas({ state: n }) {
  const a = n === 'Activated' ? { activated: true } : { loading: true };
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Labelled buttons</Typography>
      {y.map((e) => (
        <Stack key={e} spacing={2}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {'Size '}
            {e === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center" flexWrap="wrap">
            <Typography sx={{ minWidth: 96 }} variant="body2">
              {n}
            </Typography>
            {k.map((o) => {
              const r = E(o);
              return (
                <Button key={o} variant={r.variant} color={r.color} size={e} {...a}>
                  {P(o)}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
const An = [
  { color: 'tertiary', shape: 'round', icon: 'filter-outline', ariaLabel: 'Filter' },
  { color: 'primary', shape: 'square', icon: 'add-outline', ariaLabel: 'Add' },
  { color: 'secondary', shape: 'round', icon: 'edit-square-outline', ariaLabel: 'Edit' },
  {
    color: 'secondary',
    shape: 'round',
    icon: 'export-upload-outline',
    ariaLabel: 'Upload',
    disabled: true,
  },
  {
    color: 'tertiary',
    shape: 'square',
    icon: 'list-outline',
    ariaLabel: 'List view',
    activated: true,
  },
  { color: 'tertiary', shape: 'square', icon: 'grid-view-outline', ariaLabel: 'Grid view' },
];
function En() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">With Icon</Typography>
      {y.map((n) => (
        <Stack key={n} direction="row" spacing={1.5} rowGap={2} alignItems="center" flexWrap="wrap">
          <Typography sx={{ minWidth: 96 }} variant="body2">
            {n === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size={n}
            startIcon={<span className="tecton-add-outline" aria-hidden />}
          >
            New
          </Button>
          <Button
            variant="text"
            color="tertiary"
            size={n}
            startIcon={<span className="tecton-export-upload-outline" aria-hidden />}
          >
            Publish
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size={n}
            startIcon={<span className="tecton-lock-outline" aria-hidden />}
          >
            Lock
          </Button>
          <Button
            variant="outlined"
            size={n}
            startIcon={<span className="tecton-chevron-left-outline" aria-hidden />}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="primary"
            size={n}
            endIcon={<span className="tecton-chevron-right-outline" aria-hidden />}
          >
            Next
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
function Dn() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Icon Button</Typography>
      {N.map((n) => (
        <Stack key={n} direction="row" spacing={1.5} rowGap={2} alignItems="center" flexWrap="wrap">
          <Typography sx={{ minWidth: 96 }} variant="body2">
            {n === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          {An.map((a, e) => (
            <IconButton
              key={`${n}-${e}`}
              color={a.color}
              size={n}
              variant={a.shape === 'square' ? 'square' : undefined}
              disabled={a.disabled}
              activated={a.activated}
              aria-label={a.ariaLabel}
            >
              <span className={`tecton-${a.icon}`} aria-hidden />
            </IconButton>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={5}>
      <En />
      <Dn />
    </Stack>
  );
}
const Xn = { title: 'Atoms/Button', component: Button };
const Story_Disabled = { name: 'Disabled', render: () => <DisabledCanvas /> };
const Story_Activated = { name: 'Activated', render: () => <StateRowCanvas state="Activated" /> };
const Story_Working = { name: 'Working', render: () => <StateRowCanvas state="Working" /> };
const Story_Primary = { name: 'Primary', render: () => <PrimaryCanvas /> };
const Story_Secondary = { name: 'Secondary', render: () => <SecondaryCanvas /> };
const Story_Tertiary = { name: 'Tertiary', render: () => <TertiaryCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
function F(n) {
  if (n !== 'none') return <span className={`tecton-${n}`} aria-hidden />;
}
const Story_Playground = {
  name: 'Playground',
  args: {
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
    fullWidth: false,
    children: 'Primary',
    startIcon: 'none',
    endIcon: 'none',
    activated: false,
    loading: false,
  },
  render: (n) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Button
        variant={n.variant}
        color={n.color}
        size={n.size}
        disabled={n.disabled}
        fullWidth={n.fullWidth}
        startIcon={F(n.startIcon)}
        endIcon={F(n.endIcon)}
        activated={n.activated}
        loading={n.loading}
      >
        {n.children}
      </Button>
    </Stack>
  ),
};
const Story_IconButtonPlayground = {
  name: 'IconButton Playground',
  args: { color: 'primary', size: 'medium', shape: 'round', disabled: false, activated: false },
  render: (n) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <IconButton
        color={n.color}
        size={n.size}
        variant={n.shape === 'square' ? 'square' : undefined}
        disabled={n.disabled}
        activated={n.activated}
        aria-label="icon button"
      >
        {C}
      </IconButton>
    </Stack>
  ),
};

export const meta = Xn;
export const stories = {
  'atoms-button--activated': Story_Activated,
  'atoms-button--disabled': Story_Disabled,
  'atoms-button--examples': Story_Examples,
  'atoms-button--icon-button-playground': Story_IconButtonPlayground,
  'atoms-button--outlined': Story_Outlined,
  'atoms-button--playground': Story_Playground,
  'atoms-button--primary': Story_Primary,
  'atoms-button--secondary': Story_Secondary,
  'atoms-button--tertiary': Story_Tertiary,
  'atoms-button--working': Story_Working,
};
