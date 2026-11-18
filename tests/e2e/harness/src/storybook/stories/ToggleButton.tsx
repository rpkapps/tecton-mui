// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup as ToggleButtonGroup_a,
  Typography,
} from '@tecton-mui/ui';

const Te = { title: 'Molecules/Toggle Button', component: ToggleButton };
const p = [
  { key: 'large', label: 'Large · 56×56' },
  { key: 'medium', label: 'Medium · 44×44' },
  { key: 'small', label: 'Small · 32×32' },
  { key: 'xsmall', label: 'Xsmall · 28×28' },
];
function CC({ name: t }) {
  return <span className={`tecton-${t}`} aria-hidden />;
}
const U = [
  { key: 'enabled', label: 'Enabled' },
  { key: 'hovered', label: 'Hovered' },
  { key: 'activated', label: 'Activated' },
  { key: 'pressed', label: 'Pressed' },
  { key: 'focused', label: 'Focused' },
  { key: 'disabled', label: 'Disabled' },
];
function O({ state: t, size: n }) {
  const r =
    t === 'hovered' || t === 'focused'
      ? 'Mui-focusVisible'
      : t === 'pressed'
        ? 'Mui-selected'
        : undefined;
  return (
    <ToggleButton
      value="cell"
      size={n}
      selected={t === 'activated'}
      disabled={t === 'disabled'}
      className={r}
      aria-label={t}
    >
      <CC name="cube-outline" />
    </ToggleButton>
  );
}
const $ = ['enabled', 'activated', 'disabled'];
function SizesCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">4 Tecton sizes at Enabled, Activated and Disabled states</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Outer box includes 1px border. Icon dims per size: Large 24 · Medium 20 · Small 16 · Xsmall
        16.
      </Typography>
      <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-end' }}>
        {p.map((t) => (
          <Stack key={t.key} spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="caption">{t.label}</Typography>
            <Stack direction="row" spacing={1}>
              {$.map((n) => (
                <O key={n} state={n} size={t.key} />
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function StatesCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">6 states at Medium size</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Hover / Pressed / Focused cells force-render the state so you can see the visual without
        interacting.
      </Typography>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-end' }}>
        {U.map((t) => (
          <Stack key={t.key} spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {t.label}
            </Typography>
            <O state={t.key} size="medium" />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function ColorsCanvas() {
  const [t, n] = React.useState('grid'),
    [r, a] = React.useState(['grid']),
    [s, l] = React.useState(['grid']);
  return (
    <Stack spacing={2}>
      <Typography variant="h6">ToggleButtonGroup: orientation × selection mode</Typography>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="caption">Horizontal · single-select (exclusive)</Typography>
          <ToggleButtonGroup_a exclusive value={t} onChange={(m, g) => n(g)}>
            <ToggleButton value="grid">
              <CC name="grid-view-outline" />
            </ToggleButton>
            <ToggleButton value="list">
              <CC name="list-outline" />
            </ToggleButton>
            <ToggleButton value="cube">
              <CC name="cube-outline" />
            </ToggleButton>
          </ToggleButtonGroup_a>
        </Stack>
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="caption">Horizontal · multi-select</Typography>
          <ToggleButtonGroup_a value={r} onChange={(m, g) => a(g)}>
            <ToggleButton value="grid">
              <CC name="grid-view-outline" />
            </ToggleButton>
            <ToggleButton value="list">
              <CC name="list-outline" />
            </ToggleButton>
            <ToggleButton value="cube">
              <CC name="cube-outline" />
            </ToggleButton>
          </ToggleButtonGroup_a>
        </Stack>
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="caption">Vertical · multi-select</Typography>
          <ToggleButtonGroup_a orientation="vertical" value={s} onChange={(m, g) => l(g)}>
            <ToggleButton value="grid">
              <CC name="grid-view-outline" />
            </ToggleButton>
            <ToggleButton value="list">
              <CC name="list-outline" />
            </ToggleButton>
            <ToggleButton value="cube">
              <CC name="cube-outline" />
            </ToggleButton>
          </ToggleButtonGroup_a>
        </Stack>
      </Stack>
    </Stack>
  );
}
function S({ size: t, leftIcon: n, rightIcon: r, defaultValue: a }) {
  const [s, l] = React.useState(a);
  return (
    <ToggleButtonGroup_a exclusive value={s} onChange={(m, g) => g && l(g)} size={t}>
      <ToggleButton value="left">
        <CC name={n} />
      </ToggleButton>
      <ToggleButton value="right">
        <CC name={r} />
      </ToggleButton>
    </ToggleButtonGroup_a>
  );
}
function Y({ size: t, leftIcon: n, leftText: r, rightIcon: a, rightText: s, defaultValue: l }) {
  const [m, g] = React.useState(l);
  return (
    <ToggleButtonGroup_a exclusive value={m} onChange={(ne, j) => j && g(j)} size={t}>
      <ToggleButton value="left" sx={{ gap: 'var(--tecton-space-100)' }}>
        <CC name={n} />
        {r}
      </ToggleButton>
      <ToggleButton value="right" sx={{ gap: 'var(--tecton-space-100)' }}>
        <CC name={a} />
        {s}
      </ToggleButton>
    </ToggleButtonGroup_a>
  );
}
function Q({ size: t }) {
  const [n, r] = React.useState('a');
  return (
    <ToggleButtonGroup_a exclusive value={n} onChange={(a, s) => s && r(s)} size={t}>
      <ToggleButton value="a">
        <CC name="cube-outline" />
      </ToggleButton>
      <ToggleButton value="b">
        <CC name="cube-outline" />
      </ToggleButton>
      <ToggleButton value="c">
        <CC name="cube-outline" />
      </ToggleButton>
      <ToggleButton value="d" disabled>
        <CC name="cube-outline" />
      </ToggleButton>
    </ToggleButtonGroup_a>
  );
}
function PatternsCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          2-icon toggle · both cube-outline (Figma row 1 · 4 sizes)
        </Typography>
        <Stack direction="row" spacing={6}>
          {p.map((t) => (
            <Stack key={t.key} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Typography variant="caption">{t.label.split(' · ')[0]}</Typography>
              <S
                size={t.key}
                leftIcon="cube-outline"
                rightIcon="cube-outline"
                defaultValue="right"
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          2-icon toggle · grid-view + cube/list (Figma row 2 · 4 sizes)
        </Typography>
        <Stack direction="row" spacing={6}>
          {p.map((t) => (
            <Stack key={t.key} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Typography variant="caption">{t.label.split(' · ')[0]}</Typography>
              <S
                size={t.key}
                leftIcon="grid-view-outline"
                rightIcon={t.key === 'small' ? 'list-outline' : 'cube-outline'}
                defaultValue="left"
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Text + icon toggle · Preview / Value (Figma row 3 · 4 sizes)
        </Typography>
        <Stack direction="row" spacing={6} sx={{ flexWrap: 'wrap' }} rowGap={2}>
          {p.map((t) => (
            <Stack key={t.key} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Typography variant="caption">{t.label.split(' · ')[0]}</Typography>
              <Y
                size={t.key}
                leftIcon="visibility-outline"
                leftText="Preview"
                rightIcon={t.key === 'small' ? 'search-outline' : 'cube-outline'}
                rightText={t.key === 'small' ? 'Code' : 'Value'}
                defaultValue="left"
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          4-button icon toggle · with disabled option (Figma row 4 · 4 sizes)
        </Typography>
        <Stack direction="row" spacing={6}>
          {p.map((t) => (
            <Stack key={t.key} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Typography variant="caption">{t.label.split(' · ')[0]}</Typography>
              <Q size={t.key} />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
const Story_States = { name: 'States', render: () => <StatesCanvas /> };
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_Colors = { name: 'Colors', render: () => <ColorsCanvas /> };
const Story_Patterns = { name: 'Patterns', render: () => <PatternsCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { selected: false, disabled: false, size: 'medium', value: 'one', label: 'Toggle' },
  render: (t) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <ToggleButton value={t.value} size={t.size} selected={t.selected} disabled={t.disabled}>
        {t.label}
      </ToggleButton>
    </Stack>
  ),
};

export const meta = Te;
export const stories = {
  'molecules-toggle-button--colors': Story_Colors,
  'molecules-toggle-button--patterns': Story_Patterns,
  'molecules-toggle-button--playground': Story_Playground,
  'molecules-toggle-button--sizes': Story_Sizes,
  'molecules-toggle-button--states': Story_States,
};
