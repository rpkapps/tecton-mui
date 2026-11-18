// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useKeyboardFocusVisible,
} from '@tecton-mui/ui';

const Tt = { title: 'Molecules/TextField', component: TextField };
function CVe({ onIncrement: t, onDecrement: a }) {
  const n = {
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--tecton-icon-size-50)',
    height: 'var(--tecton-icon-size-50)',
    borderRadius: 'var(--tecton-radius-25)',
    backgroundColor: 'var(--tecton-color-action-text-only-adornment)',
    color: 'var(--tecton-color-text-primary)',
    cursor: 'pointer',
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--tecton-space-25)' }}>
      <Box component="button" type="button" aria-label="Increment" onClick={t} sx={n}>
        <span className="tecton-chevron-up-small-outline" style={{ fontSize: '8px' }} aria-hidden />
      </Box>
      <Box component="button" type="button" aria-label="Decrement" onClick={a} sx={n}>
        <span
          className="tecton-chevron-down-small-outline"
          style={{ fontSize: '8px' }}
          aria-hidden
        />
      </Box>
    </Box>
  );
}
function CL({
  variant: t,
  size: a = 'medium',
  label: n = 'Label',
  value: s = 'Value',
  placeholder: d,
  helperText: u,
  error: ae = false,
  disabled: ne = false,
  startAdornment: ie = false,
  endAdornment: le = false,
  type: A = 'text',
  multiline: se = false,
  minRows: re,
  forceFocusVisible: oe = false,
  fullWidth: M = false,
  width: de = 121,
}) {
  const [z, j] = React.useState(s),
    F = A === 'number',
    { focusVisible: ce, onFocus: ue, onBlur: pe } = useKeyboardFocusVisible(),
    me = ce || oe;
  return (
    <TextField
      variant={t}
      size={a}
      label={n || undefined}
      value={z}
      onChange={(he) => j(he.target.value)}
      onFocus={ue}
      onBlur={pe}
      placeholder={d}
      helperText={u}
      error={ae}
      disabled={ne}
      type={F ? 'text' : A}
      multiline={se}
      minRows={re}
      fullWidth={M}
      sx={[
        M ? {} : { width: de },
        F
          ? {
              '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input': { MozAppearance: 'textfield' },
            }
          : {},
      ]}
      slotProps={{
        input: {
          className: me ? 'Mui-focused Tecton-focusVisible' : undefined,
          startAdornment: ie ? (
            <InputAdornment position="start">
              <span className="tecton-money-outline" style={{ fontSize: '16px' }} aria-hidden />
            </InputAdornment>
          ) : undefined,
          endAdornment: F ? (
            <InputAdornment position="end">
              <CVe
                onIncrement={() => j(String(Number(z || 0) + 1))}
                onDecrement={() => j(String(Number(z || 0) - 1))}
              />
            </InputAdornment>
          ) : le ? (
            <InputAdornment position="end">
              <span className="tecton-money-outline" style={{ fontSize: '16px' }} aria-hidden />
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
const B = ['filled', 'outlined', 'standard'];
const te = { filled: 'Filled', outlined: 'Outlined', standard: 'Text Only' };
const T = ['medium', 'small'];
const w = ['Enabled', 'Hover', 'Focused', 'Error', 'Disabled'];
function S(t) {
  switch (t) {
    case 'Focused':
      return { forceFocusVisible: true };
    case 'Error':
      return { error: true, helperText: 'Helper text' };
    case 'Disabled':
      return { disabled: true };
    default:
      return {};
  }
}
function FilledCanvas() {
  return (
    <Stack spacing={5}>
      {T.map((t) => (
        <Stack key={t} spacing={2}>
          <Typography variant="h6">
            {'Size '}
            {t === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          {w.map((a) => (
            <Stack key={a} direction="row" spacing={4} alignItems="flex-start">
              <Typography sx={{ minWidth: 96, pt: 2 }} variant="body2">
                {a}
              </Typography>
              <Box sx={{ minWidth: 140 }}>
                <CL variant="filled" size={t} width={140} {...S(a)} />
              </Box>
            </Stack>
          ))}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {'Hover applies via '}
            <code>:hover</code>. Interact with the Enabled cell above.
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
function OutlinedCanvas() {
  return (
    <Stack spacing={5}>
      {T.map((t) => (
        <Stack key={t} spacing={2}>
          <Typography variant="h6">
            {'Size '}
            {t === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          {w.map((a) => (
            <Stack key={a} direction="row" spacing={4} alignItems="flex-start">
              <Typography sx={{ minWidth: 96, pt: 2 }} variant="body2">
                {a}
              </Typography>
              <Box sx={{ minWidth: 140 }}>
                <CL variant="outlined" size={t} width={140} {...S(a)} />
              </Box>
            </Stack>
          ))}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {'Hover applies via '}
            <code>:hover</code>. Interact with the Enabled cell above.
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
function StandardCanvas() {
  return (
    <Stack spacing={5}>
      {T.map((t) => (
        <Stack key={t} spacing={2}>
          <Typography variant="h6">
            {'Size '}
            {t === 'medium' ? 'Medium' : 'Small'}
          </Typography>
          {w.map((a) => (
            <Stack key={a} direction="row" spacing={4} alignItems="flex-start">
              <Typography sx={{ minWidth: 96, pt: 2 }} variant="body2">
                {a}
              </Typography>
              <Box sx={{ minWidth: 140 }}>
                <CL variant="standard" size={t} width={140} {...S(a)} />
              </Box>
            </Stack>
          ))}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {'Hover applies via '}
            <code>:hover</code>. Interact with the Enabled cell above.
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
function StatesCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={4} alignItems="center">
        <Typography sx={{ minWidth: 96 }} variant="body2" />
        {B.map((t) => (
          <Typography key={t} variant="caption" sx={{ minWidth: 140, fontWeight: 600 }}>
            {te[t]}
          </Typography>
        ))}
      </Stack>
      {w.map((t) => (
        <Stack key={t} direction="row" spacing={4} alignItems="flex-start">
          <Typography sx={{ minWidth: 96, pt: 2 }} variant="body2">
            {t}
          </Typography>
          {B.map((a) => (
            <Box key={a} sx={{ minWidth: 140 }}>
              <CL variant={a} size="medium" width={140} {...S(t)} />
            </Box>
          ))}
        </Stack>
      ))}
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover applies via '}
        <code>:hover</code>. Interact with any Enabled cell above.
      </Typography>
    </Stack>
  );
}
function SizesCanvas() {
  return (
    <Stack spacing={5}>
      {T.map((t) => (
        <Stack key={t} spacing={2}>
          <Typography variant="h6">
            {'Size '}
            {t === 'medium' ? 'Medium (40px)' : 'Small (32px)'}
          </Typography>
          <Stack direction="row" spacing={4} alignItems="center">
            {B.map((a) => (
              <Box key={a} sx={{ minWidth: 140 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  {te[a]}
                </Typography>
                <CL variant={a} size={t} width={140} />
              </Box>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={1.5}>
        <Typography variant="overline">Focused: Solid / Outlined / Text Only</Typography>
        <Stack direction="row" spacing={4}>
          <CL variant="filled" size="medium" forceFocusVisible />
          <CL variant="outlined" size="medium" forceFocusVisible />
          <CL variant="standard" size="medium" forceFocusVisible />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Error: Solid / Outlined / Text Only</Typography>
        <Stack direction="row" spacing={4}>
          <CL variant="filled" size="medium" error helperText="Helper text" />
          <CL variant="outlined" size="medium" error helperText="Helper text" />
          <CL variant="standard" size="medium" error helperText="Helper text" />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Placeholder + Leading Icon</Typography>
        <Stack direction="row" spacing={4}>
          <CL
            variant="filled"
            size="medium"
            value=""
            placeholder="Placeholder"
            startAdornment
            width={113}
          />
          <CL
            variant="outlined"
            size="medium"
            value=""
            placeholder="Placeholder"
            startAdornment
            width={113}
          />
          <CL
            variant="standard"
            size="medium"
            value=""
            placeholder="Placeholder"
            startAdornment
            width={113}
          />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Helper Text</Typography>
        <Stack direction="row" spacing={4}>
          <CL variant="filled" size="medium" helperText="Helper text" />
          <CL variant="outlined" size="medium" helperText="Helper text" />
          <CL variant="standard" size="medium" helperText="Helper text" />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Placeholder + Trailing Icon</Typography>
        <Stack direction="row" spacing={4}>
          <CL variant="filled" size="medium" value="" placeholder="Placeholder" endAdornment />
          <CL variant="outlined" size="medium" value="" placeholder="Placeholder" endAdornment />
          <CL variant="standard" size="medium" value="" placeholder="Placeholder" endAdornment />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Numeric Input: Medium / Small</Typography>
        <Stack direction="row" spacing={4}>
          <CL
            variant="filled"
            size="medium"
            label=""
            value="108"
            type="number"
            startAdornment
            width={121}
          />
          <CL
            variant="filled"
            size="small"
            label=""
            value="108"
            type="number"
            startAdornment
            width={89}
          />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">No Label + Both Icons: Medium / Small</Typography>
        <Stack direction="row" spacing={4}>
          <CL variant="filled" size="medium" label="" startAdornment endAdornment width={248} />
          <CL variant="filled" size="small" label="" startAdornment endAdornment width={184} />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Full Width</Typography>
        <CL variant="filled" size="medium" fullWidth />
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Long Text / Wrapping: Medium / Small</Typography>
        <Stack direction="row" spacing={4}>
          <CL
            variant="filled"
            size="medium"
            multiline
            minRows={2}
            value="asdfadfasdf asdfasdfasdf asdfa asdf asdfas asdfasdfasdf asdfasdfasdfasdfasdf asdfasdf"
            width={248}
          />
          <CL
            variant="filled"
            size="small"
            multiline
            minRows={2}
            value="asdfadfasdf asdfasdfasdf asdfa asdf asdfas asdfasdfasdf asdfasdfasdfasdfasdf asdfasdf"
            width={187}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
const Story_States = { name: 'States', render: () => <StatesCanvas /> };
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_Filled = { name: 'Filled', render: () => <FilledCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    variant: 'filled',
    size: 'medium',
    label: 'Label',
    placeholder: '',
    disabled: false,
    error: false,
    helperText: '',
    value: 'Value',
  },
  render: (t) => (
    <TextField
      key={t.value}
      variant={t.variant}
      size={t.size}
      label={t.label || undefined}
      placeholder={t.placeholder || undefined}
      defaultValue={t.value}
      disabled={t.disabled}
      error={t.error}
      helperText={t.helperText || undefined}
    />
  ),
};

export const meta = Tt;
export const stories = {
  'molecules-textfield--examples': Story_Examples,
  'molecules-textfield--filled': Story_Filled,
  'molecules-textfield--outlined': Story_Outlined,
  'molecules-textfield--playground': Story_Playground,
  'molecules-textfield--sizes': Story_Sizes,
  'molecules-textfield--standard': Story_Standard,
  'molecules-textfield--states': Story_States,
};
