// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Autocomplete, Box, Stack, TextField, Typography } from '@tecton-mui/ui';

const Le = ['Option 1', 'Option 2', 'Option 3'];
const tn = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];
const fe = 300;
function FieldLabel({ children: o }) {
  return (
    <Typography
      component="label"
      sx={{
        display: 'block',
        fontSize: 'var(--tecton-font-size-small)',
        lineHeight: 'var(--tecton-line-height-small)',
        color: 'var(--tecton-color-text-secondary)',
        marginBottom: 'var(--tecton-space-25)',
      }}
    >
      {o}
    </Typography>
  );
}
function ge(o) {
  return { width: o, '& .MuiFilledInput-root.Mui-focused': { boxShadow: 'none' } };
}
function on(o, l, ..._p) {
  const { key: c, ...h } = o;
  return (
    <Box
      key={c}
      component="li"
      {...h}
      sx={{ display: 'flex', alignItems: 'center', gap: 'var(--tecton-space-75)' }}
    >
      <span
        className="tecton-cube-outline"
        style={{ width: 16, height: 16, display: 'block' }}
        aria-hidden
      />
      {l}
    </Box>
  );
}
function SingleClosedCanvas() {
  return (
    <Box>
      <FieldLabel>Option</FieldLabel>
      <Autocomplete
        options={Le}
        sx={ge(fe)}
        renderInput={(o) => <TextField {...o} variant="filled" />}
      />
    </Box>
  );
}
function SingleOpenCanvas() {
  return (
    <Box>
      <FieldLabel>Option</FieldLabel>
      <Autocomplete
        options={Le}
        open
        sx={ge(fe)}
        renderInput={(o) => <TextField {...o} variant="filled" />}
      />
    </Box>
  );
}
function MultiClosedCanvas() {
  return (
    <Box>
      <FieldLabel>Options</FieldLabel>
      <Autocomplete
        multiple
        options={Le}
        defaultValue={['Option 1', 'Option 2']}
        sx={ge(fe)}
        renderInput={(o) => <TextField {...o} variant="filled" placeholder="Select option" />}
      />
    </Box>
  );
}
function MultiOpenCanvas() {
  return (
    <Box>
      <FieldLabel>Options</FieldLabel>
      <Autocomplete
        multiple
        options={Le}
        defaultValue={['Option 1', 'Option 2']}
        open
        sx={ge(fe)}
        renderInput={(o) => <TextField {...o} variant="filled" placeholder="Select option" />}
      />
    </Box>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1.5}>
        <Typography variant="overline">Single-select</Typography>
        <Box>
          <FieldLabel>Option</FieldLabel>
          <Autocomplete
            options={Le}
            sx={ge(fe)}
            renderInput={(o) => <TextField {...o} variant="filled" />}
          />
        </Box>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Multi-select with chips</Typography>
        <Box>
          <FieldLabel>Options</FieldLabel>
          <Autocomplete
            multiple
            options={tn}
            defaultValue={['Option 1', 'Option 2']}
            sx={ge(fe)}
            renderInput={(o) => <TextField {...o} variant="filled" placeholder="Select option" />}
          />
        </Box>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Options with icons</Typography>
        <Box>
          <FieldLabel>Option</FieldLabel>
          <Autocomplete
            options={Le}
            renderOption={on}
            sx={ge(fe)}
            renderInput={(o) => <TextField {...o} variant="filled" />}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
const mr = { title: 'Molecules/Autocomplete', component: Autocomplete };
const Story_SingleClosed = { name: 'Single closed', render: () => <SingleClosedCanvas /> };
const Story_MultiClosed = { name: 'Multi closed', render: () => <MultiClosedCanvas /> };
const Story_SingleOpen = { name: 'Single open', render: () => <SingleOpenCanvas /> };
const Story_MultiOpen = { name: 'Multi open', render: () => <MultiOpenCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const fn = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
const Story_Playground = {
  name: 'Playground',
  args: { multiple: false, disabled: false, label: 'Option', placeholder: 'Select option' },
  render: (o) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Box>
        {o.label ? <FieldLabel>{o.label}</FieldLabel> : null}
        <Autocomplete
          key={String(o.multiple)}
          multiple={o.multiple}
          disabled={o.disabled}
          options={fn}
          sx={ge(fe)}
          renderInput={(l) => <TextField {...l} variant="filled" placeholder={o.placeholder} />}
        />
      </Box>
    </Stack>
  ),
};

export const meta = mr;
export const stories = {
  'molecules-autocomplete--examples': Story_Examples,
  'molecules-autocomplete--multi-closed': Story_MultiClosed,
  'molecules-autocomplete--multi-open': Story_MultiOpen,
  'molecules-autocomplete--playground': Story_Playground,
  'molecules-autocomplete--single-closed': Story_SingleClosed,
  'molecules-autocomplete--single-open': Story_SingleOpen,
};
