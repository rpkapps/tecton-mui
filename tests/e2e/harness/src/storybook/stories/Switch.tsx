// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormGroup as FormGroup_a,
  FormHelperText,
  FormLabel,
  Stack,
  Switch,
  Typography,
} from '@tecton-mui/ui';

const k = { switchBase: { className: 'Mui-focusVisible' } };
const l = 96;
function BareCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Bare control</Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography sx={{ minWidth: l }} variant="body2" />
        <Typography variant="caption" sx={{ minWidth: l, textAlign: 'center', fontWeight: 600 }}>
          Unchecked
        </Typography>
        <Typography variant="caption" sx={{ minWidth: l, textAlign: 'center', fontWeight: 600 }}>
          Checked
        </Typography>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Size Medium</Typography>
        <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: l }} variant="body2">
            Enabled
          </Typography>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch size="medium" />
          </Stack>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch checked size="medium" />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: l }} variant="body2">
            Focused
          </Typography>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch size="medium" slotProps={k} />
          </Stack>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch checked size="medium" slotProps={k} />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: l }} variant="body2">
            Disabled
          </Typography>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch disabled size="medium" />
          </Stack>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch checked disabled size="medium" />
          </Stack>
        </Stack>
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover and Pressed states apply via '}
        <code>:hover</code>
        {' / '}
        <code>:active</code>. Interact with any Enabled switch above.
      </Typography>
    </Stack>
  );
}
function SmallCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Bare control</Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography sx={{ minWidth: l }} variant="body2" />
        <Typography variant="caption" sx={{ minWidth: l, textAlign: 'center', fontWeight: 600 }}>
          Unchecked
        </Typography>
        <Typography variant="caption" sx={{ minWidth: l, textAlign: 'center', fontWeight: 600 }}>
          Checked
        </Typography>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Size Small</Typography>
        <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: l }} variant="body2">
            Enabled
          </Typography>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch size="small" />
          </Stack>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch checked size="small" />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: l }} variant="body2">
            Focused
          </Typography>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch size="small" slotProps={k} />
          </Stack>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch checked size="small" slotProps={k} />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: l }} variant="body2">
            Disabled
          </Typography>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch disabled size="small" />
          </Stack>
          <Stack sx={{ minWidth: l, alignItems: 'center' }}>
            <Switch checked disabled size="small" />
          </Stack>
        </Stack>
      </Stack>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover and Pressed states apply via '}
        <code>:hover</code>
        {' / '}
        <code>:active</code>. Interact with any Enabled switch above.
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
      {['end', 'start', 'top', 'bottom'].map((s) => (
        <Stack key={s} direction="row" spacing={6} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
            {s}
          </Typography>
          <Stack sx={{ minWidth: 140, alignItems: 'center' }}>
            <FormControlLabel control={<Switch />} label="Label" labelPlacement={s} />
          </Stack>
          <Stack sx={{ minWidth: 140, alignItems: 'center' }}>
            <FormControlLabel control={<Switch />} label="Label" labelPlacement={s} disabled />
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
      ].map((s) => (
        <Stack key={s.state} spacing={1}>
          <Typography variant="h6">
            {'State = '}
            {s.state}
          </Typography>
          <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
            <FormControl error={s.error} disabled={s.disabled}>
              <FormLabel>Group ({s.state})</FormLabel>
              <FormGroup_a>
                <FormControlLabel control={<Switch defaultChecked />} label="Label" />
                <FormControlLabel control={<Switch />} label="Label" />
                <FormControlLabel control={<Switch />} label="Label" />
              </FormGroup_a>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
            <FormControl error={s.error} disabled={s.disabled}>
              <FormLabel>Group ({s.state})</FormLabel>
              <FormGroup_a>
                <FormControlLabel control={<Switch defaultChecked />} label="Label" />
                <FormControlLabel control={<Switch />} label="Label" />
                <FormControlLabel control={<Switch />} label="Label" />
                <FormControlLabel control={<Switch />} label="Label" />
                <FormControlLabel control={<Switch />} label="Label" />
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
      <Stack spacing={2}>
        <Typography variant="h6">States</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Switch checked size="medium" />
          <Switch size="medium" />
          <Switch checked disabled size="medium" />
          <Switch disabled size="medium" />
        </Stack>
        <Typography variant="h6">Small</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Switch checked size="small" />
          <Switch size="small" />
          <Switch checked disabled size="small" />
          <Switch disabled size="small" />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Label</Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <FormControlLabel control={<Switch />} label="Left" labelPlacement="end" />
            <FormControlLabel control={<Switch />} label="Right" labelPlacement="start" />
          </Stack>
          <Stack direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <FormControlLabel control={<Switch checked />} label="Left" labelPlacement="end" />
            <FormControlLabel control={<Switch checked />} label="Right" labelPlacement="start" />
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Form Group</Typography>
        <Stack direction="row" spacing={6} rowGap={3} flexWrap="wrap">
          <FormControl>
            <FormLabel>Group</FormLabel>
            <FormGroup_a>
              <FormControlLabel control={<Switch defaultChecked />} label="Label" />
              <FormControlLabel control={<Switch defaultChecked />} label="Label" />
              <FormControlLabel control={<Switch />} label="Label" />
            </FormGroup_a>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
          <FormControl error>
            <FormLabel>Group Error</FormLabel>
            <FormGroup_a>
              <FormControlLabel control={<Switch />} label="Label" />
              <FormControlLabel control={<Switch />} label="Label" />
              <FormControlLabel control={<Switch />} label="Label" />
            </FormGroup_a>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
        </Stack>
      </Stack>
    </Stack>
  );
}
const Le = { title: 'Atoms/Switch', component: Switch };
const Story_Bare = { name: 'Bare', render: () => <BareCanvas /> };
const Story_Small = { name: 'Small', render: () => <SmallCanvas /> };
const Story_Labeled = { name: 'Labeled', render: () => <LabeledCanvas /> };
const Story_Grouped = { name: 'Grouped', render: () => <GroupedCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { checked: false, disabled: false, size: 'medium', label: 'Label' },
  render: function StoryRender(s) {
    const r = (
      <Switch checked={s.checked} disabled={s.disabled} size={s.size} onChange={() => {}} />
    );
    return (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        {s.label && s.label.length > 0 ? <FormControlLabel control={r} label={s.label} /> : r}
      </Stack>
    );
  },
};

export const meta = Le;
export const stories = {
  'atoms-switch--bare': Story_Bare,
  'atoms-switch--examples': Story_Examples,
  'atoms-switch--grouped': Story_Grouped,
  'atoms-switch--labeled': Story_Labeled,
  'atoms-switch--playground': Story_Playground,
  'atoms-switch--small': Story_Small,
};
