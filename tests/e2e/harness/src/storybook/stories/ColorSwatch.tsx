// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
/* eslint-disable no-var -- verbatim story code */
import * as React from 'react';
import { Box, Stack, Typography } from '@tecton-mui/ui';

const O = 'var(--tecton-color-component-input-filled-value-text)';
const R = 'var(--tecton-color-component-input-filled-background)';
const f = 'var(--tecton-color-accent-saffron-fill)';
const L = 'var(--tecton-color-text-secondary)';
const D = 'var(--tecton-radius-50)';
const w = 'var(--tecton-radius-25)';
const q = {
  small: {
    height: 'calc(var(--tecton-space-250) + var(--tecton-space-100))',
    py: 'var(--tecton-space-25)',
    iconSize: 'var(--tecton-icon-size-100)',
    fontSize: 'var(--tecton-font-size-small)',
    lineHeight: 'var(--tecton-line-height-small)',
    fontWeight: 'var(--tecton-font-weight-small)',
  },
  medium: {
    height: 'calc(var(--tecton-space-250) + var(--tecton-space-100) + var(--tecton-space-100))',
    py: 'calc(var(--tecton-space-50) + var(--tecton-space-25))',
    iconSize: 'var(--tecton-icon-size-150)',
    fontSize: 'var(--tecton-font-size-medium)',
    lineHeight: 'var(--tecton-line-height-medium)',
    fontWeight: 'var(--tecton-font-weight-medium)',
  },
};
function y(a) {
  const t = a.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(t)
    ? t
    : /^#[0-9A-F]{3}$/.test(t)
      ? `#${t
          .slice(1)
          .split('')
          .map((s) => `${s}${s}`)
          .join('')}`
      : t;
}
function CP({ value: a, onChange: t, size: s, forceFocused: n = false, inherited: i = false }) {
  const o = React.useRef(null),
    r = y(a.hex),
    d = q[s],
    V = (l) => {
      const A = y(l);
      t({ hex: A });
    };
  return (
    <React.Fragment>
      <Box
        component="button"
        type="button"
        value={r}
        onMouseDown={(l) => l.preventDefault()}
        onClick={() => {
          var l;
          return (l = o.current) == null ? undefined : l.click();
        }}
        sx={{
          appearance: 'none',
          WebkitAppearance: 'none',
          border: 'none',
          borderRadius: D,
          overflow: 'hidden',
          backgroundColor: R,
          height: d.height,
          px: 'var(--tecton-space-100)',
          py: d.py,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--tecton-space-50)',
          cursor: 'pointer',
          userSelect: 'none',
          ...(n
            ? {
                outline: `var(--tecton-border-width-200) solid ${f}`,
                outlineOffset: 'var(--tecton-space-25)',
              }
            : {}),
          '&:focus-visible': {
            outline: `var(--tecton-border-width-200) solid ${f}`,
            outlineOffset: 'var(--tecton-space-25)',
          },
        }}
      >
        <Box
          sx={{
            width: d.iconSize,
            height: d.iconSize,
            borderRadius: w,
            overflow: 'hidden',
            backgroundColor: i ? 'transparent' : r,
            boxSizing: 'border-box',
            flexShrink: 0,
            ...(i ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
          }}
        >
          {i ? (
            <Box sx={{ width: '50%', height: '50%', borderRadius: w, backgroundColor: r }} />
          ) : null}
        </Box>
        <Typography
          sx={{
            color: O,
            fontFamily: 'var(--tecton-font-family-base)',
            fontSize: d.fontSize,
            lineHeight: d.lineHeight,
            fontWeight: d.fontWeight,
            textTransform: 'uppercase',
          }}
        >
          {r}
        </Typography>
      </Box>
      <Box
        component="input"
        type="color"
        value={/^#[0-9A-F]{6}$/.test(r) ? r : '#000000'}
        onChange={(l) => V(l.target.value)}
        ref={o}
        tabIndex={-1}
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 0,
          height: 0,
          p: 0,
          border: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </React.Fragment>
  );
}
function CM({ children: a }) {
  return (
    <Typography
      sx={{
        color: L,
        fontFamily: 'var(--tecton-font-family-base)',
        fontSize: 'var(--tecton-font-size-small)',
        lineHeight: 'var(--tecton-line-height-small)',
        fontWeight: 'var(--tecton-font-weight-small)',
      }}
    >
      {a}
    </Typography>
  );
}
function SmallCanvas() {
  const [a, t] = React.useState({ hex: '#218585' }),
    [s, n] = React.useState({ hex: '#218585' }),
    [i, o] = React.useState({ hex: '#218585' });
  return (
    <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <CM>Default</CM>
        <CP value={a} onChange={t} size="small" />
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <CM>Focused</CM>
        <CP value={s} onChange={n} size="small" forceFocused />
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <CM>Inherited</CM>
        <CP value={i} onChange={o} size="small" inherited />
      </Stack>
    </Stack>
  );
}
function MediumCanvas() {
  const [a, t] = React.useState({ hex: '#218585' }),
    [s, n] = React.useState({ hex: '#218585' }),
    [i, o] = React.useState({ hex: '#218585' });
  return (
    <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <CM>Default</CM>
        <CP value={a} onChange={t} size="medium" />
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <CM>Focused</CM>
        <CP value={s} onChange={n} size="medium" forceFocused />
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <CM>Inherited</CM>
        <CP value={i} onChange={o} size="medium" inherited />
      </Stack>
    </Stack>
  );
}
const P = { title: 'Atoms/Color Swatch', component: CP };
const Story_Small = { name: 'Small', render: () => <SmallCanvas /> };
const Story_Medium = { name: 'Medium', render: () => <MediumCanvas /> };

export const meta = P;
export const stories = {
  'atoms-color-swatch--medium': Story_Medium,
  'atoms-color-swatch--small': Story_Small,
};
