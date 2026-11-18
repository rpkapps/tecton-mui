// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Link, Stack, Typography } from '@tecton-mui/ui';

const N = {
  backgroundColor: 'var(--tecton-color-action-text-only-bg-focus)',
  boxShadow: '0 0 0 1px var(--tecton-color-bg-paper), 0 0 0 3px var(--tecton-color-focus-ring)',
  borderRadius: 'var(--tecton-radius-50)',
};
const p = [
  { key: 'Enabled', sx: {} },
  {
    key: 'Hovered',
    sx: {
      color: 'var(--tecton-color-action-text-only-text-hover)',
      textDecorationColor: 'var(--tecton-color-action-outlined-border-hover)',
      textDecorationLine: 'underline',
    },
  },
  { key: 'Focused', sx: N },
  {
    key: 'Pressed',
    sx: {
      color: 'var(--tecton-color-action-text-only-text-press)',
      textDecorationColor: 'var(--tecton-color-action-outlined-border-press)',
      textDecorationLine: 'underline',
    },
  },
  { key: 'Activated', sx: { color: 'var(--tecton-color-action-text-only-text-active)' } },
];
const f = { color: 'var(--tecton-color-text-disabled)', pointerEvents: 'none' };
function BodyCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Underline = hover (default) with interaction states</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2" />
        {p.map((n) => (
          <Typography
            key={n.key}
            variant="caption"
            sx={{ minWidth: 80, textAlign: 'center', fontWeight: 600 }}
          >
            {n.key}
          </Typography>
        ))}
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
        <Typography sx={{ minWidth: 120, textTransform: 'capitalize' }} variant="body2">
          Underline=hover
        </Typography>
        {p.map((n) => (
          <Stack key={n.key} sx={{ minWidth: 80, alignItems: 'center' }}>
            <Link href="#" underline="hover" sx={n.sx}>
              Link
            </Link>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover / Focus / Press states shown here are forced via '}
        <code>sx</code>
        {' so they render statically. In real usage they apply automatically via '}
        <code>:hover</code>,<code>.Mui-focusVisible</code>
        {', and '}
        <code>:active</code>.
      </Typography>
    </Stack>
  );
}
function InlineCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Underline = always with interaction states</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2" />
        {p.map((n) => (
          <Typography
            key={n.key}
            variant="caption"
            sx={{ minWidth: 80, textAlign: 'center', fontWeight: 600 }}
          >
            {n.key}
          </Typography>
        ))}
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
        <Typography sx={{ minWidth: 120, textTransform: 'capitalize' }} variant="body2">
          Underline=always
        </Typography>
        {p.map((n) => (
          <Stack key={n.key} sx={{ minWidth: 80, alignItems: 'center' }}>
            <Link href="#" underline="always" sx={n.sx}>
              Link
            </Link>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover / Focus / Press states shown here are forced via '}
        <code>sx</code>
        {' so they render statically. In real usage they apply automatically via '}
        <code>:hover</code>,<code>.Mui-focusVisible</code>
        {', and '}
        <code>:active</code>.
      </Typography>
    </Stack>
  );
}
function DisabledCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Disabled state across both underline modes</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2">
          Underline=hover
        </Typography>
        <Stack sx={{ minWidth: 80, alignItems: 'center' }}>
          <Link href="#" underline="hover" sx={f} aria-disabled="true">
            Link
          </Link>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2">
          Underline=always
        </Typography>
        <Stack sx={{ minWidth: 80, alignItems: 'center' }}>
          <Link href="#" underline="always" sx={f} aria-disabled="true">
            Link
          </Link>
        </Stack>
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'MUI Link has no '}
        <code>disabled</code>
        {' prop. The disabled visual is applied via'}
        <code>aria-disabled="true"</code>
        {' plus the disabled text token.'}
      </Typography>
    </Stack>
  );
}
function WithIconCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Link with trailing adornment</Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        <Link href="#" underline="hover">
          {'Learn more '}→
        </Link>
        <Link href="#" underline="always">
          {'Learn more '}→
        </Link>
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Underline modes on the left (hover) and right (always) render the same adornment position;
        the underline behaviour is inherited from the mode.
      </Typography>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 320 }}>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Underline on hover
        </Typography>
        <Link href="#">Link</Link>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Underline always
        </Typography>
        <Link href="#" underline="always">
          Link
        </Link>
      </Stack>
    </Stack>
  );
}
const oe = { title: 'Atoms/Link', component: Link };
const Story_Disabled = { name: 'Disabled', render: () => <DisabledCanvas /> };
const Story_Body = { name: 'Body', render: () => <BodyCanvas /> };
const Story_Inline = { name: 'Inline', render: () => <InlineCanvas /> };
const Story_WithIcon = { name: 'With icon', render: () => <WithIconCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { href: '#', underline: 'hover', disabled: false, children: 'Link' },
  render: (n) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Link
        href={n.href}
        underline={n.underline}
        aria-disabled={n.disabled ? 'true' : undefined}
        sx={n.disabled ? f : undefined}
      >
        {n.children}
      </Link>
    </Stack>
  ),
};

export const meta = oe;
export const stories = {
  'atoms-link--body': Story_Body,
  'atoms-link--disabled': Story_Disabled,
  'atoms-link--examples': Story_Examples,
  'atoms-link--inline': Story_Inline,
  'atoms-link--playground': Story_Playground,
  'atoms-link--with-icon': Story_WithIcon,
};
