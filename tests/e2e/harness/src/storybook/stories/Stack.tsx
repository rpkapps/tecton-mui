// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Box, Divider, Stack, Typography } from '@tecton-mui/ui';

function CR() {
  return (
    <Box
      sx={{
        minWidth: 'calc(var(--tecton-space-1000) + var(--tecton-space-500))',
        height: 'var(--tecton-space-300)',
        px: 'var(--tecton-space-100)',
        borderRadius: 'var(--tecton-radius-50)',
        backgroundColor: 'transparent',
        color: 'var(--tecton-color-action-primary-adornment)',
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        component="svg"
        aria-hidden="true"
        focusable="false"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <rect
          x="calc(var(--tecton-border-width-100) / 2)"
          y="calc(var(--tecton-border-width-100) / 2)"
          width="calc(100% - var(--tecton-border-width-100))"
          height="calc(100% - var(--tecton-border-width-100))"
          rx="var(--tecton-radius-50)"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--tecton-border-width-100)"
          strokeDasharray="10 5"
        />
      </Box>
      <Typography
        sx={{
          fontFamily: 'var(--tecton-font-family-base)',
          fontSize: 'var(--tecton-font-size-small)',
          lineHeight: 'var(--tecton-line-height-small)',
          fontWeight: 'var(--tecton-font-weight-small)',
        }}
      >
        Instance Slot
      </Typography>
    </Box>
  );
}
function V({ spacing: t }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography
        sx={{
          minWidth: 'calc(var(--tecton-space-500) + var(--tecton-space-250))',
          color: 'var(--tecton-color-text-secondary)',
          fontFamily: 'var(--tecton-font-family-base)',
          fontSize: 'var(--tecton-font-size-small)',
          lineHeight: 'var(--tecton-line-height-small)',
          fontWeight: 'var(--tecton-font-weight-small)',
        }}
      >
        {'Spacing '}
        {t}
      </Typography>
      <Stack direction="row" spacing={t} alignItems="center">
        <CR />
        <CR />
      </Stack>
    </Stack>
  );
}
function CD({ children: t }) {
  return (
    <Typography
      sx={{
        color: 'var(--tecton-color-text-secondary)',
        fontFamily: 'var(--tecton-font-family-base)',
        fontSize: 'var(--tecton-font-size-medium)',
        lineHeight: 'var(--tecton-line-height-medium)',
        fontWeight: 'var(--tecton-font-weight-medium)',
      }}
    >
      {t}
    </Typography>
  );
}
function F({ direction: t, items: n, spacing: s }) {
  return (
    <Stack spacing={1}>
      <Typography
        sx={{
          color: 'var(--tecton-color-text-secondary)',
          fontFamily: 'var(--tecton-font-family-base)',
          fontSize: 'var(--tecton-font-size-small)',
          lineHeight: 'var(--tecton-line-height-small)',
          fontWeight: 'var(--tecton-font-weight-small)',
        }}
      >
        {t === 'row' ? 'Row' : 'Column'}
        {' · '}
        {n} {n === 1 ? 'item' : 'items'}
        {' · Spacing '}
        {s}
      </Typography>
      <Stack direction={t} spacing={s} alignItems="flex-start">
        {Array.from({ length: n }, (a, i) => (
          <CR key={i} />
        ))}
      </Stack>
    </Stack>
  );
}
function CL({ direction: t, items: n, spacings: s }) {
  return (
    <Stack spacing={2}>
      <CD>
        {t === 'row' ? 'Row' : 'Column'}
        {', '}
        {n} {n === 1 ? 'item' : 'items'}
      </CD>
      <Stack
        direction={t === 'row' ? 'column' : 'row'}
        spacing={3}
        sx={{ flexWrap: 'wrap' }}
        useFlexGap
      >
        {s.map((a) => (
          <F key={a} direction={t} items={n} spacing={a} />
        ))}
      </Stack>
    </Stack>
  );
}
const f = [0, 1, 2, 3, 4, 5, 6, 7, 8];
function RowCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <CD>More instances</CD>
        <Stack direction="row" spacing={3} alignItems="center">
          <CR />
          <CR />
          <CR />
          <CR />
          <CR />
        </Stack>
      </Stack>
      <CL direction="row" items={5} spacings={[0, 1, 2, 4, 5, 6, 7, 8]} />
      <CL direction="row" items={1} spacings={[0]} />
      <CL direction="row" items={3} spacings={f} />
      <CL direction="row" items={4} spacings={f} />
    </Stack>
  );
}
function ColumnCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <CD>Vertical</CD>
        <Stack direction="column" spacing={1}>
          <CR />
          <CR />
          <CR />
          <CR />
          <CR />
        </Stack>
      </Stack>
      <CL direction="column" items={2} spacings={[0, 1, 2, 3, 4, 5, 6, 7, 8]} />
      <CL direction="column" items={5} spacings={[0, 2, 3, 4, 5, 6, 7, 8]} />
      <CL direction="column" items={1} spacings={[0, 1]} />
      <CL direction="column" items={3} spacings={f} />
      <CL direction="column" items={4} spacings={f} />
    </Stack>
  );
}
function DividedCanvas() {
  return (
    <Stack spacing={2}>
      <CD>Add Dividers</CD>
      <Stack
        direction="column"
        spacing={2}
        divider={<Divider sx={{ borderColor: 'var(--tecton-color-divider)' }} />}
      >
        <CR />
        <CR />
        <CR />
        <CR />
        <CR />
      </Stack>
    </Stack>
  );
}
function SpacedCanvas() {
  return (
    <Stack spacing={2}>
      <CD>Spacing Options</CD>
      <Stack spacing={2}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
          <V key={t} spacing={t} />
        ))}
      </Stack>
    </Stack>
  );
}
const ae = { title: 'Atoms/Stack', component: Stack };
const Story_Row = { name: 'Row', render: () => <RowCanvas /> };
const Story_Column = { name: 'Column', render: () => <ColumnCanvas /> };
const Story_Divided = { name: 'Divided', render: () => <DividedCanvas /> };
const Story_Spaced = { name: 'Spaced', render: () => <SpacedCanvas /> };

export const meta = ae;
export const stories = {
  'atoms-stack--column': Story_Column,
  'atoms-stack--divided': Story_Divided,
  'atoms-stack--row': Story_Row,
  'atoms-stack--spaced': Story_Spaced,
};
