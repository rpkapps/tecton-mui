// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
/* eslint-disable react-hooks/set-state-in-effect -- verbatim story code */
import * as React from 'react';
import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useKeyboardFocusVisible,
} from '@tecton-mui/ui';

const Ot = { title: 'Molecules/Select', component: Select };
const we = {
  filled: '--tecton-color-input-filled-text-placeholder',
  outlined: '--tecton-color-input-outlined-text-placeholder',
  standard: '--tecton-color-input-text-only-text-placeholder',
};
function CI({
  variant: t,
  size: n,
  error: a = false,
  disabled: l = false,
  helperText: r,
  startAdornment: b = false,
  label: m = 'Label',
  value: p = 'Value',
  options: g,
  placeholder: h,
  forceFocusVisible: u = false,
  open: ue = false,
  width: de = 220,
}) {
  const [pe, me] = React.useState(p),
    he = (x) => me(x.target.value),
    be = g ?? Array.from(new Set([p, 'Value', 'Option 1', 'Option 2'].filter(Boolean))),
    { focusVisible: fe, onFocus: xe, onBlur: ve } = useKeyboardFocusVisible(),
    ye = fe || u;
  return (
    <FormControl variant={t} size={n} error={a} disabled={l} sx={{ width: de }}>
      {m ? <InputLabel>{m}</InputLabel> : null}
      <Select
        value={pe}
        onChange={he}
        onFocus={xe}
        onBlur={ve}
        className={ye ? 'Mui-focused Tecton-focusVisible' : undefined}
        {...(ue
          ? {
              open: true,
              MenuProps: {
                disablePortal: true,
                disableScrollLock: true,
                hideBackdrop: true,
                disableAutoFocus: true,
                disableEnforceFocus: true,
                disableRestoreFocus: true,
                autoFocus: false,
                transitionDuration: 0,
                slotProps: { list: { dense: true } },
              },
            }
          : {})}
        displayEmpty={!!h}
        renderValue={
          h
            ? (x) =>
                x || (
                  <Box component="span" sx={{ color: `var(${we[t]})` }}>
                    {h}
                  </Box>
                )
            : undefined
        }
        startAdornment={
          b ? (
            <InputAdornment position="start">
              <span className="tecton-money-outline" style={{ fontSize: '16px' }} aria-hidden />
            </InputAdornment>
          ) : undefined
        }
      >
        {be.map((x) => (
          <MenuItem key={x} value={x} size="small">
            {x}
          </MenuItem>
        ))}
      </Select>
      {r ? <FormHelperText error={a}>{r}</FormHelperText> : null}
    </FormControl>
  );
}
function CD({ label: t, children: n }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption">{t}</Typography>
      {n}
    </Stack>
  );
}
const f = ['medium', 'small'];
const I = ['Enabled', 'Hover', 'Focused', 'Error', 'Disabled'];
const v = ['filled', 'outlined', 'standard'];
const H = { filled: 'Filled', outlined: 'Outlined', standard: 'Text Only' };
function ce(t) {
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
function CK({ variant: t, size: n }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">
        {'Size '}
        {n === 'medium' ? 'Medium' : 'Small'}
      </Typography>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
        {I.map((a) => (
          <CD key={a} label={a}>
            <CI variant={t} size={n} width={200} {...ce(a)} />
          </CD>
        ))}
      </Stack>
    </Stack>
  );
}
function Te({ size: t }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">
        {'Size '}
        {t === 'medium' ? 'Medium' : 'Small'}
      </Typography>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
        {v.map((n) => (
          <Box key={n} sx={{ minHeight: 260 }}>
            <CD label={H[n]}>
              <CI variant={n} size={t} width={200} open />
            </CD>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
function OpenCanvas() {
  return (
    <Stack spacing={5}>
      {f.map((t) => (
        <Te key={t} size={t} />
      ))}
    </Stack>
  );
}
function FilledCanvas() {
  return (
    <Stack spacing={5}>
      {f.map((t) => (
        <CK key={t} variant="filled" size={t} />
      ))}
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover applies via '}
        <code>:hover</code>. Interact with any Enabled cell above.
      </Typography>
    </Stack>
  );
}
function OutlinedCanvas() {
  return (
    <Stack spacing={5}>
      {f.map((t) => (
        <CK key={t} variant="outlined" size={t} />
      ))}
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover applies via '}
        <code>:hover</code>. Interact with any Enabled cell above.
      </Typography>
    </Stack>
  );
}
function StandardCanvas() {
  return (
    <Stack spacing={5}>
      {f.map((t) => (
        <CK key={t} variant="standard" size={t} />
      ))}
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover applies via '}
        <code>:hover</code>. Interact with any Enabled cell above.
      </Typography>
    </Stack>
  );
}
function StatesCanvas() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={4} alignItems="center">
        <Typography sx={{ minWidth: 96 }} variant="body2" />
        {v.map((t) => (
          <Typography key={t} variant="caption" sx={{ minWidth: 200, fontWeight: 600 }}>
            {H[t]}
          </Typography>
        ))}
      </Stack>
      {I.map((t) => (
        <Stack key={t} direction="row" spacing={4} alignItems="flex-start">
          <Typography sx={{ minWidth: 96, pt: 2 }} variant="body2">
            {t}
          </Typography>
          {v.map((n) => (
            <Box
              key={n}
              sx={{
                height: 'var(--tecton-space-800)',
                display: 'flex',
                alignItems: 'flex-end',
                minWidth: 200,
              }}
            >
              <CI variant={n} size="medium" width={200} {...ce(t)} />
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
function ExamplesCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={1.5}>
        <Typography variant="overline">State examples: Solid / small size</Typography>
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <CD label="Leading Icon">
            <CI variant="filled" size="small" startAdornment value="Cash adornment" width={200} />
          </CD>
          <CD label="Placeholder">
            <CI
              variant="filled"
              size="small"
              value=""
              options={['Cash adornment', 'Option 1', 'Option 2']}
              placeholder="Placeholder text"
              width={180}
            />
          </CD>
          <CD label="Helper Text">
            <CI
              variant="filled"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              width={180}
            />
          </CD>
          <CD label="Error">
            <CI
              variant="filled"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              error
              width={180}
            />
          </CD>
          <CD label="Focused">
            <CI
              variant="filled"
              size="small"
              value="Cash adornment"
              forceFocusVisible
              width={180}
            />
          </CD>
          <CD label="No Label">
            <CI variant="filled" size="small" value="Cash adornment" label="" width={180} />
          </CD>
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Helper Text: Solid / Outlined / Text Only</Typography>
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <CD label="Solid">
            <CI
              variant="filled"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              width={180}
            />
          </CD>
          <CD label="Outlined">
            <CI
              variant="outlined"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              width={180}
            />
          </CD>
          <CD label="Text Only">
            <CI
              variant="standard"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              width={180}
            />
          </CD>
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Error: Solid / Outlined / Text Only</Typography>
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <CD label="Solid">
            <CI
              variant="filled"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              error
              width={180}
            />
          </CD>
          <CD label="Outlined">
            <CI
              variant="outlined"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              error
              width={180}
            />
          </CD>
          <CD label="Text Only">
            <CI
              variant="standard"
              size="small"
              value="Cash adornment"
              helperText="Helper text"
              error
              width={180}
            />
          </CD>
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="overline">Form composition</Typography>
        <Box
          sx={{
            width: 300,
            p: 2,
            border: '1px solid var(--tecton-color-divider-subtle)',
            borderRadius: 'var(--tecton-radius-50)',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <span className="tecton-panel-outline tecton-icon-md" aria-hidden />
              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                Wait Rick. Is any of this canon?
              </Typography>
            </Stack>
            <CI
              variant="filled"
              size="medium"
              startAdornment
              label="Cost Estimate"
              value="Value"
              helperText="Helper text"
              width={268}
            />
            <CI
              variant="filled"
              size="medium"
              label="Risk Estimate"
              value="Lowest to highest"
              options={['Lowest to highest', 'Highest to lowest', 'Random']}
              helperText="Helper text"
              width={268}
            />
            <Divider />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              It could have been, Morty.
            </Typography>
            <CI
              variant="filled"
              size="small"
              label="Which option?"
              value="Try your best"
              options={['Try your best', 'Take a guess', 'Skip']}
              helperText="Helper text"
              width={268}
            />
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
const Story_States = { name: 'States', render: () => <StatesCanvas /> };
const Story_Filled = { name: 'Filled', render: () => <FilledCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Open = { name: 'Open', render: () => <OpenCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const O = ['Option A', 'Option B', 'Option C'];
function PlaygroundSelect(t) {
  const [n, a] = React.useState(t.value);
  return (
    React.useEffect(() => {
      a(t.value);
    }, [t.value]),
    (
      <Box sx={{ minHeight: t.open ? 260 : undefined }}>
        <FormControl
          variant={t.variant}
          size={t.size}
          disabled={t.disabled}
          error={t.error}
          sx={{ width: 240 }}
        >
          {t.label ? <InputLabel>{t.label}</InputLabel> : null}
          <Select
            value={n}
            onChange={(l) => a(l.target.value)}
            className={t.focused ? 'Mui-focused Tecton-focusVisible' : undefined}
            {...(t.open
              ? {
                  open: true,
                  MenuProps: {
                    disablePortal: true,
                    disableScrollLock: true,
                    hideBackdrop: true,
                    disableAutoFocus: true,
                    disableEnforceFocus: true,
                    disableRestoreFocus: true,
                    autoFocus: false,
                    transitionDuration: 0,
                    slotProps: { list: { dense: true } },
                  },
                }
              : {})}
          >
            {O.map((l) => (
              <MenuItem key={l} value={l} size="small">
                {l}
              </MenuItem>
            ))}
          </Select>
          {t.helperText ? <FormHelperText error={t.error}>{t.helperText}</FormHelperText> : null}
        </FormControl>
      </Box>
    )
  );
}
const Story_Playground = {
  name: 'Playground',
  args: {
    variant: 'filled',
    size: 'medium',
    label: 'Label',
    disabled: false,
    error: false,
    helperText: '',
    value: 'Option A',
    focused: false,
    open: false,
  },
  render: (t) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <PlaygroundSelect {...t} />
    </Stack>
  ),
};

export const meta = Ot;
export const stories = {
  'molecules-select--examples': Story_Examples,
  'molecules-select--filled': Story_Filled,
  'molecules-select--open': Story_Open,
  'molecules-select--outlined': Story_Outlined,
  'molecules-select--playground': Story_Playground,
  'molecules-select--standard': Story_Standard,
  'molecules-select--states': Story_States,
};
