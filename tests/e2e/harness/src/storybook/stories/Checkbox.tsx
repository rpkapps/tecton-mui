// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup as FormGroup_a,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
} from '@tecton-mui/ui';

const $ = ['medium', 'small'];
const x = ['unchecked', 'indeterminate', 'checked'];
function B(a) {
  return a === 'unchecked'
    ? { checked: false, indeterminate: false }
    : a === 'indeterminate'
      ? { checked: false, indeterminate: true }
      : { checked: true, indeterminate: false };
}
function _(a) {
  return a === 'unchecked' ? 'Unchecked' : a === 'indeterminate' ? 'Indeterminate' : 'Checked';
}
const m = 96;
function BareCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Bare control</Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography sx={{ minWidth: m }} variant="body2" />
        {x.map((a) => (
          <Typography
            key={a}
            variant="caption"
            sx={{ minWidth: m, textAlign: 'center', fontWeight: 600 }}
          >
            {_(a)}
          </Typography>
        ))}
      </Stack>
      {$.map((a) => (
        <Stack key={a} spacing={2}>
          <Typography variant="h6">
            {'Size '}
            {a === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
            <Typography sx={{ minWidth: m }} variant="body2">
              Enabled
            </Typography>
            {x.map((n) => (
              <Stack key={n} sx={{ minWidth: m, alignItems: 'center' }}>
                <Checkbox {...B(n)} size={a} />
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
            <Typography sx={{ minWidth: m }} variant="body2">
              Focused
            </Typography>
            {x.map((n) => (
              <Stack key={n} sx={{ minWidth: m, alignItems: 'center' }}>
                <Checkbox {...B(n)} className="Mui-focusVisible" size={a} />
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
            <Typography sx={{ minWidth: m }} variant="body2">
              Disabled
            </Typography>
            {x.map((n) => (
              <Stack key={n} sx={{ minWidth: m, alignItems: 'center' }}>
                <Checkbox {...B(n)} disabled size={a} />
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover and Pressed states apply via '}
        <code>:hover</code>
        {' / '}
        <code>:active</code>. Interact with any Enabled checkbox above.
      </Typography>
    </Stack>
  );
}
function LabeledCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">With label (FormControlLabel)</Typography>
      <Stack direction="row" spacing={6} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2" />
        <Typography variant="caption" sx={{ minWidth: 140, textAlign: 'center', fontWeight: 600 }}>
          Enabled
        </Typography>
        <Typography variant="caption" sx={{ minWidth: 140, textAlign: 'center', fontWeight: 600 }}>
          Disabled
        </Typography>
      </Stack>
      {['end', 'start', 'top', 'bottom'].map((a) => (
        <Stack key={a} direction="row" spacing={6} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
            {a}
          </Typography>
          <Stack sx={{ minWidth: 140, alignItems: 'center' }}>
            <FormControlLabel control={<Checkbox />} label="Label" labelPlacement={a} />
          </Stack>
          <Stack sx={{ minWidth: 140, alignItems: 'center' }}>
            <FormControlLabel control={<Checkbox />} label="Label" labelPlacement={a} disabled />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function GroupedCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Grouped (FormGroup)</Typography>
      {[
        { state: 'Enabled', error: false, disabled: false },
        { state: 'Disabled', error: false, disabled: true },
        { state: 'Error', error: true, disabled: false },
      ].map((a) => (
        <Stack key={a.state} spacing={1}>
          <Typography variant="h6">
            {'State = '}
            {a.state}
          </Typography>
          <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
            <FormControl error={a.error} disabled={a.disabled}>
              <FormLabel>Group ({a.state})</FormLabel>
              <FormGroup_a>
                <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Label" />
              </FormGroup_a>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
            <FormControl error={a.error} disabled={a.disabled}>
              <FormLabel>Group ({a.state})</FormLabel>
              <FormGroup_a>
                <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Label" />
              </FormGroup_a>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
        <Stack spacing={2}>
          <Typography variant="h6">Medium</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Checkbox size="medium" />
            <Checkbox indeterminate size="medium" />
            <Checkbox checked size="medium" />
          </Stack>
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Small</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Checkbox size="small" />
            <Checkbox indeterminate size="small" />
            <Checkbox checked size="small" />
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">With Label</Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <FormControlLabel control={<Checkbox />} label="Left" labelPlacement="end" />
            <FormControlLabel control={<Checkbox />} label="Right" labelPlacement="start" />
          </Stack>
          <Stack direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <FormControlLabel
              control={<Checkbox indeterminate />}
              label="Left"
              labelPlacement="end"
            />
            <FormControlLabel
              control={<Checkbox indeterminate />}
              label="Right"
              labelPlacement="start"
            />
          </Stack>
          <Stack direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <FormControlLabel control={<Checkbox checked />} label="Left" labelPlacement="end" />
            <FormControlLabel control={<Checkbox checked />} label="Right" labelPlacement="start" />
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Form Group</Typography>
        <Stack direction="row" spacing={6} rowGap={3} flexWrap="wrap">
          <FormControl>
            <FormLabel>Group</FormLabel>
            <FormGroup_a>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
              <FormControlLabel control={<Checkbox />} label="Label" />
              <FormControlLabel control={<Checkbox />} label="Label" />
            </FormGroup_a>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
          <FormControl error>
            <FormLabel>With Error</FormLabel>
            <FormGroup_a>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
              <FormControlLabel control={<Checkbox />} label="Label" />
              <FormControlLabel control={<Checkbox />} label="Label" />
            </FormGroup_a>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
        </Stack>
      </Stack>
    </Stack>
  );
}
const Le = { title: 'Atoms/Checkbox', component: Checkbox };
const Story_Bare = { name: 'Bare', render: () => <BareCanvas /> };
const Story_Labeled = { name: 'Labeled', render: () => <LabeledCanvas /> };
const Story_Grouped = { name: 'Grouped', render: () => <GroupedCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    size: 'medium',
    label: '',
    labelPlacement: 'end',
  },
  render: function StoryRender(a) {
    const n = (
      <Checkbox
        checked={a.checked}
        indeterminate={a.indeterminate}
        disabled={a.disabled}
        size={a.size}
        onChange={() => {}}
      />
    );
    return (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        {a.label && a.label.length > 0 ? (
          <FormControlLabel
            control={n}
            label={a.label}
            labelPlacement={a.labelPlacement}
            disabled={a.disabled}
          />
        ) : (
          n
        )}
      </Stack>
    );
  },
};

export const meta = Le;
export const stories = {
  'atoms-checkbox--bare': Story_Bare,
  'atoms-checkbox--examples': Story_Examples,
  'atoms-checkbox--grouped': Story_Grouped,
  'atoms-checkbox--labeled': Story_Labeled,
  'atoms-checkbox--playground': Story_Playground,
};
