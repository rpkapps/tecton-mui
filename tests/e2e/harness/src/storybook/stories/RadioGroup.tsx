// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@tecton-mui/ui';

const Y = ['medium', 'small'];
function EnabledCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={3}>
        <Typography variant="h5">Bare control</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ minWidth: 96 }} variant="body2" />
          <Typography variant="caption" sx={{ minWidth: 96, textAlign: 'center', fontWeight: 600 }}>
            Unselected
          </Typography>
          <Typography variant="caption" sx={{ minWidth: 96, textAlign: 'center', fontWeight: 600 }}>
            Selected
          </Typography>
        </Stack>
        {Y.map((a) => (
          <Stack key={a} spacing={2}>
            <Typography variant="h6">
              {'Size '}
              {a === 'medium' ? 'Medium' : 'Small'}
            </Typography>
            <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
              <Typography sx={{ minWidth: 96 }} variant="body2">
                Enabled
              </Typography>
              <Stack sx={{ minWidth: 96, alignItems: 'center' }}>
                <Radio size={a} />
              </Stack>
              <Stack sx={{ minWidth: 96, alignItems: 'center' }}>
                <Radio checked size={a} />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
              <Typography sx={{ minWidth: 96 }} variant="body2">
                Focused
              </Typography>
              <Stack sx={{ minWidth: 96, alignItems: 'center' }}>
                <Radio className="Mui-focusVisible" size={a} />
              </Stack>
              <Stack sx={{ minWidth: 96, alignItems: 'center' }}>
                <Radio checked className="Mui-focusVisible" size={a} />
              </Stack>
            </Stack>
          </Stack>
        ))}
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {'Hover and Pressed states apply via '}
          <code>:hover</code>
          {' / '}
          <code>:active</code>. Interact with any Enabled radio above.
        </Typography>
      </Stack>
      <Stack spacing={3}>
        <Typography variant="h5">With label (FormControlLabel)</Typography>
        {['end', 'start', 'top', 'bottom'].map((a) => (
          <Stack key={a} direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
              {a}
            </Typography>
            <Stack sx={{ minWidth: 140, alignItems: 'center' }}>
              <FormControlLabel control={<Radio />} label="Label" labelPlacement={a} />
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={3}>
        <Typography variant="h5">Grouped vertically (FormControl + RadioGroup)</Typography>
        <Stack spacing={1}>
          <Typography variant="h6">State = Enabled</Typography>
          <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
            <FormControl>
              <FormLabel>Group (Enabled)</FormLabel>
              <RadioGroup defaultValue="a" name="fg-Enabled-3">
                <FormControlLabel value="a" control={<Radio />} label="Label" />
                <FormControlLabel value="b" control={<Radio />} label="Label" />
                <FormControlLabel value="c" control={<Radio />} label="Label" />
              </RadioGroup>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Group (Enabled)</FormLabel>
              <RadioGroup defaultValue="a" name="fg-Enabled-5">
                <FormControlLabel value="a" control={<Radio />} label="Label" />
                <FormControlLabel value="b" control={<Radio />} label="Label" />
                <FormControlLabel value="c" control={<Radio />} label="Label" />
                <FormControlLabel value="d" control={<Radio />} label="Label" />
                <FormControlLabel value="e" control={<Radio />} label="Label" />
              </RadioGroup>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
function DisabledCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={3}>
        <Typography variant="h5">Bare control</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ minWidth: 96 }} variant="body2" />
          <Typography variant="caption" sx={{ minWidth: 96, textAlign: 'center', fontWeight: 600 }}>
            Unselected
          </Typography>
          <Typography variant="caption" sx={{ minWidth: 96, textAlign: 'center', fontWeight: 600 }}>
            Selected
          </Typography>
        </Stack>
        {Y.map((a) => (
          <Stack key={a} spacing={2}>
            <Typography variant="h6">
              {'Size '}
              {a === 'medium' ? 'Medium' : 'Small'}
            </Typography>
            <Stack direction="row" spacing={1.5} rowGap={2} alignItems="center">
              <Typography sx={{ minWidth: 96 }} variant="body2">
                Disabled
              </Typography>
              <Stack sx={{ minWidth: 96, alignItems: 'center' }}>
                <Radio disabled size={a} />
              </Stack>
              <Stack sx={{ minWidth: 96, alignItems: 'center' }}>
                <Radio checked disabled size={a} />
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={3}>
        <Typography variant="h5">With label (FormControlLabel)</Typography>
        {['end', 'start', 'top', 'bottom'].map((a) => (
          <Stack key={a} direction="row" spacing={6} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
              {a}
            </Typography>
            <Stack sx={{ minWidth: 140, alignItems: 'center' }}>
              <FormControlLabel control={<Radio />} label="Label" labelPlacement={a} disabled />
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={3}>
        <Typography variant="h5">Grouped vertically (FormControl + RadioGroup)</Typography>
        <Stack spacing={1}>
          <Typography variant="h6">State = Disabled</Typography>
          <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
            <FormControl disabled>
              <FormLabel>Group (Disabled)</FormLabel>
              <RadioGroup defaultValue="a" name="fg-Disabled-3">
                <FormControlLabel value="a" control={<Radio />} label="Label" />
                <FormControlLabel value="b" control={<Radio />} label="Label" />
                <FormControlLabel value="c" control={<Radio />} label="Label" />
              </RadioGroup>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
            <FormControl disabled>
              <FormLabel>Group (Disabled)</FormLabel>
              <RadioGroup defaultValue="a" name="fg-Disabled-5">
                <FormControlLabel value="a" control={<Radio />} label="Label" />
                <FormControlLabel value="b" control={<Radio />} label="Label" />
                <FormControlLabel value="c" control={<Radio />} label="Label" />
                <FormControlLabel value="d" control={<Radio />} label="Label" />
                <FormControlLabel value="e" control={<Radio />} label="Label" />
              </RadioGroup>
              <FormHelperText>Helper text</FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
function ErrorCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Grouped vertically (FormControl + RadioGroup)</Typography>
      <Stack spacing={1}>
        <Typography variant="h6">State = Error</Typography>
        <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
          <FormControl error>
            <FormLabel>Group (Error)</FormLabel>
            <RadioGroup defaultValue="a" name="fg-Error-3">
              <FormControlLabel value="a" control={<Radio />} label="Label" />
              <FormControlLabel value="b" control={<Radio />} label="Label" />
              <FormControlLabel value="c" control={<Radio />} label="Label" />
            </RadioGroup>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
          <FormControl error>
            <FormLabel>Group (Error)</FormLabel>
            <RadioGroup defaultValue="a" name="fg-Error-5">
              <FormControlLabel value="a" control={<Radio />} label="Label" />
              <FormControlLabel value="b" control={<Radio />} label="Label" />
              <FormControlLabel value="c" control={<Radio />} label="Label" />
              <FormControlLabel value="d" control={<Radio />} label="Label" />
              <FormControlLabel value="e" control={<Radio />} label="Label" />
            </RadioGroup>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
        </Stack>
      </Stack>
    </Stack>
  );
}
function VerticalCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Group directions (column)</Typography>
      {[
        { state: 'Enabled', disabled: false },
        { state: 'Disabled', disabled: true },
      ].map((a) => (
        <Stack key={a.state} spacing={2}>
          <Typography variant="h6">
            {'State = '}
            {a.state}
          </Typography>
          <Stack direction="row" spacing={6} alignItems="flex-start" flexWrap="wrap">
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Vertical · 3
              </Typography>
              <RadioGroup defaultValue="a" name={`grp-${a.state}-v3`}>
                <FormControlLabel
                  value="a"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
                <FormControlLabel
                  value="b"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
                <FormControlLabel
                  value="c"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
              </RadioGroup>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Vertical · 5
              </Typography>
              <RadioGroup defaultValue="a" name={`grp-${a.state}-v5`}>
                <FormControlLabel
                  value="a"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
                <FormControlLabel
                  value="b"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
                <FormControlLabel
                  value="c"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
                <FormControlLabel
                  value="d"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
                <FormControlLabel
                  value="e"
                  control={<Radio disabled={a.disabled} />}
                  label="Label"
                  disabled={a.disabled}
                />
              </RadioGroup>
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function HorizontalCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Group directions (row)</Typography>
      {[
        { state: 'Enabled', disabled: false },
        { state: 'Disabled', disabled: true },
      ].map((a) => (
        <Stack key={a.state} spacing={2}>
          <Typography variant="h6">
            {'State = '}
            {a.state}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Horizontal · 3
            </Typography>
            <RadioGroup row defaultValue="a" name={`grp-${a.state}-h3`}>
              <FormControlLabel
                value="a"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
              <FormControlLabel
                value="b"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
              <FormControlLabel
                value="c"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
            </RadioGroup>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Horizontal · 5
            </Typography>
            <RadioGroup row defaultValue="a" name={`grp-${a.state}-h5`}>
              <FormControlLabel
                value="a"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
              <FormControlLabel
                value="b"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
              <FormControlLabel
                value="c"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
              <FormControlLabel
                value="d"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
              <FormControlLabel
                value="e"
                control={<Radio disabled={a.disabled} />}
                label="Label"
                disabled={a.disabled}
              />
            </RadioGroup>
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
        <Typography variant="h6">Medium</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Radio size="medium" />
          <Radio checked size="medium" />
          <Radio disabled size="medium" />
          <Radio checked disabled size="medium" />
        </Stack>
        <Typography variant="h6">Small</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Radio size="small" />
          <Radio checked size="small" />
          <Radio disabled size="small" />
          <Radio checked disabled size="small" />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Label</Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
            <FormControlLabel control={<Radio size="medium" />} label="Left" labelPlacement="end" />
            <FormControlLabel
              control={<Radio size="medium" />}
              label="Right"
              labelPlacement="start"
            />
            <FormControlLabel control={<Radio size="small" />} label="Left" labelPlacement="end" />
            <FormControlLabel
              control={<Radio size="small" />}
              label="Right"
              labelPlacement="start"
            />
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
            <FormControlLabel
              control={<Radio checked size="medium" />}
              label="Left"
              labelPlacement="end"
            />
            <FormControlLabel
              control={<Radio checked size="medium" />}
              label="Right"
              labelPlacement="start"
            />
            <FormControlLabel
              control={<Radio checked size="small" />}
              label="Left"
              labelPlacement="end"
            />
            <FormControlLabel
              control={<Radio checked size="small" />}
              label="Right"
              labelPlacement="start"
            />
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
            <FormControlLabel
              control={<Radio disabled size="medium" />}
              label="Left"
              labelPlacement="end"
              disabled
            />
            <FormControlLabel
              control={<Radio disabled size="medium" />}
              label="Right"
              labelPlacement="start"
              disabled
            />
            <FormControlLabel
              control={<Radio disabled size="small" />}
              label="Left"
              labelPlacement="end"
              disabled
            />
            <FormControlLabel
              control={<Radio disabled size="small" />}
              label="Right"
              labelPlacement="start"
              disabled
            />
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
            <FormControlLabel
              control={<Radio checked disabled size="medium" />}
              label="Left"
              labelPlacement="end"
              disabled
            />
            <FormControlLabel
              control={<Radio checked disabled size="medium" />}
              label="Right"
              labelPlacement="start"
              disabled
            />
            <FormControlLabel
              control={<Radio checked disabled size="small" />}
              label="Left"
              labelPlacement="end"
              disabled
            />
            <FormControlLabel
              control={<Radio checked disabled size="small" />}
              label="Right"
              labelPlacement="start"
              disabled
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Form Group</Typography>
        <Stack direction="row" spacing={6} rowGap={3} flexWrap="wrap">
          <FormControl>
            <FormLabel>Vertical Group</FormLabel>
            <RadioGroup defaultValue="a" name="rg-enabled">
              <FormControlLabel value="a" control={<Radio />} label="Label" />
              <FormControlLabel value="b" control={<Radio />} label="Label" />
              <FormControlLabel value="c" control={<Radio />} label="Label" />
            </RadioGroup>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
          <FormControl error>
            <FormLabel>Error</FormLabel>
            <RadioGroup name="rg-error">
              <FormControlLabel value="a" control={<Radio />} label="Label" />
              <FormControlLabel value="b" control={<Radio />} label="Label" />
              <FormControlLabel value="c" control={<Radio />} label="Label" />
            </RadioGroup>
            <FormHelperText>Helper text</FormHelperText>
          </FormControl>
        </Stack>
      </Stack>
    </Stack>
  );
}
const $a = { title: 'Atoms/Radio Group', component: RadioGroup };
const Story_Enabled = { name: 'Enabled', render: () => <EnabledCanvas /> };
const Story_Disabled = { name: 'Disabled', render: () => <DisabledCanvas /> };
const Story_Error = { name: 'Error', render: () => <ErrorCanvas /> };
const Story_Vertical = { name: 'Vertical', render: () => <VerticalCanvas /> };
const Story_Horizontal = { name: 'Horizontal', render: () => <HorizontalCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { value: 'a', size: 'medium', row: false, disabled: false, errorState: false },
  render: (a) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <FormControl disabled={a.disabled} error={a.errorState}>
        <FormLabel>Group label</FormLabel>
        <RadioGroup value={a.value} row={a.row} name="playground">
          <FormControlLabel value="a" control={<Radio size={a.size} />} label="Option A" />
          <FormControlLabel value="b" control={<Radio size={a.size} />} label="Option B" />
          <FormControlLabel value="c" control={<Radio size={a.size} />} label="Option C" />
        </RadioGroup>
        {a.errorState ? <FormHelperText>Please choose an option.</FormHelperText> : null}
      </FormControl>
    </Stack>
  ),
};

export const meta = $a;
export const stories = {
  'atoms-radio-group--disabled': Story_Disabled,
  'atoms-radio-group--enabled': Story_Enabled,
  'atoms-radio-group--error': Story_Error,
  'atoms-radio-group--examples': Story_Examples,
  'atoms-radio-group--horizontal': Story_Horizontal,
  'atoms-radio-group--playground': Story_Playground,
  'atoms-radio-group--vertical': Story_Vertical,
};
