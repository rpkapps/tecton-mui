// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Rating, Stack, Typography } from '@tecton-mui/ui';

const P = ['small', 'medium', 'large'];
const oa = { title: 'Atoms/Rating', component: Rating };
const L = 78;
const j = 198;
const f = 96;
function FilledCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography sx={{ width: f }} variant="body2" />
        <Typography variant="caption" sx={{ width: L, textAlign: 'center', fontWeight: 600 }}>
          Full
        </Typography>
      </Stack>
      {P.map((e) => (
        <Stack key={e} direction="row" alignItems="center">
          <Typography sx={{ width: f, textTransform: 'capitalize' }} variant="body2">
            {e}
          </Typography>
          <Stack sx={{ width: L, alignItems: 'center' }}>
            <Rating max={1} readOnly precision={0.5} size={e} value={1} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function HalfCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography sx={{ width: f }} variant="body2" />
        <Typography variant="caption" sx={{ width: L, textAlign: 'center', fontWeight: 600 }}>
          Half
        </Typography>
      </Stack>
      {P.map((e) => (
        <Stack key={e} direction="row" alignItems="center">
          <Typography sx={{ width: f, textTransform: 'capitalize' }} variant="body2">
            {e}
          </Typography>
          <Stack sx={{ width: L, alignItems: 'center' }}>
            <Rating max={1} readOnly precision={0.5} size={e} value={0.5} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function ReadOnlyCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography sx={{ width: f }} variant="body2" />
        <Typography variant="caption" sx={{ width: L, textAlign: 'center', fontWeight: 600 }}>
          None
        </Typography>
      </Stack>
      {P.map((e) => (
        <Stack key={e} direction="row" alignItems="center">
          <Typography sx={{ width: f, textTransform: 'capitalize' }} variant="body2">
            {e}
          </Typography>
          <Stack sx={{ width: L, alignItems: 'center' }}>
            <Rating max={1} readOnly precision={0.5} size={e} value={0} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function DisabledCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography sx={{ width: f }} variant="body2" />
        <Typography variant="caption" sx={{ width: j, textAlign: 'center', fontWeight: 600 }}>
          Disabled: true
        </Typography>
      </Stack>
      {P.map((e) => (
        <Stack key={e} direction="row" alignItems="center">
          <Typography sx={{ width: f, textTransform: 'capitalize' }} variant="body2">
            {e}
          </Typography>
          <Stack sx={{ width: j, alignItems: 'center' }}>
            <Rating size={e} precision={0.5} defaultValue={2.5} disabled />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function SizesCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography sx={{ width: f }} variant="body2" />
        <Typography variant="caption" sx={{ width: j, textAlign: 'center', fontWeight: 600 }}>
          Disabled: false
        </Typography>
      </Stack>
      {P.map((e) => (
        <Stack key={e} direction="row" alignItems="center">
          <Typography sx={{ width: f, textTransform: 'capitalize' }} variant="body2">
            {e}
          </Typography>
          <Stack sx={{ width: j, alignItems: 'center' }}>
            <Rating size={e} precision={0.5} defaultValue={2.5} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography sx={{ width: f }} variant="body2" />
        {['Disabled: false', 'Disabled: true'].map((e) => (
          <Typography
            key={e}
            variant="caption"
            sx={{ width: j, textAlign: 'center', fontWeight: 600 }}
          >
            {e}
          </Typography>
        ))}
      </Stack>
      {P.map((e) => (
        <Stack key={e} direction="row" alignItems="center">
          <Typography sx={{ width: f, textTransform: 'capitalize' }} variant="body2">
            {e}
          </Typography>
          <Stack sx={{ width: j, alignItems: 'center' }}>
            <Rating size={e} precision={0.5} defaultValue={2.5} />
          </Stack>
          <Stack sx={{ width: j, alignItems: 'center' }}>
            <Rating size={e} precision={0.5} defaultValue={2.5} disabled />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
const Story_Disabled = { name: 'Disabled', render: () => <DisabledCanvas /> };
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_Filled = { name: 'Filled', render: () => <FilledCanvas /> };
const Story_Half = { name: 'Half', render: () => <HalfCanvas /> };
const Story_ReadOnly = { name: 'Read only', render: () => <ReadOnlyCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { value: 2.5, max: 5, precision: 0.5, readOnly: false, disabled: false, size: 'medium' },
  render: (e) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Rating
        value={e.value}
        max={e.max}
        precision={e.precision}
        readOnly={e.readOnly}
        disabled={e.disabled}
        size={e.size}
      />
    </Stack>
  ),
};

export const meta = oa;
export const stories = {
  'atoms-rating--disabled': Story_Disabled,
  'atoms-rating--examples': Story_Examples,
  'atoms-rating--filled': Story_Filled,
  'atoms-rating--half': Story_Half,
  'atoms-rating--playground': Story_Playground,
  'atoms-rating--read-only': Story_ReadOnly,
  'atoms-rating--sizes': Story_Sizes,
};
