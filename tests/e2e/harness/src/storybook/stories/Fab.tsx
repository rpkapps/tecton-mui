// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Fab, Stack, Typography } from '@tecton-mui/ui';

const m = ['primary', 'secondary', 'tertiary', 'outlined'];
const ge = ['extended', 'circular'];
const x = 100;
const Q = ['Enabled', 'Focused', 'Disabled'];
function Z(e) {
  return e === 'Focused'
    ? { className: 'Mui-focusVisible' }
    : e === 'Disabled'
      ? { disabled: true }
      : {};
}
function CJ({ heading: e, variant: n, size: t, icon: i }) {
  const s = <span className="tecton-cube-outline" aria-hidden />;
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {e}
      </Typography>
      {Q.map((r) => (
        <Stack key={r} direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: 96 }} variant="body2">
            {r}
          </Typography>
          {m.map((l) => (
            <Stack key={l} sx={{ minWidth: x, alignItems: 'center' }}>
              <Fab variant={n} color={l} size={t} {...Z(r)}>
                {n === 'extended' ? 'Fab' : null}
                {i ? s : null}
              </Fab>
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function CircularCanvas() {
  const e = <span className="tecton-cube-outline" aria-hidden />;
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Variant = circular · Size = medium</Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography sx={{ minWidth: 96 }} variant="body2" />
        {m.map((n) => (
          <Typography
            key={n}
            variant="caption"
            sx={{ minWidth: x, textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}
          >
            {n}
          </Typography>
        ))}
      </Stack>
      {['Enabled', 'Focused', 'Disabled'].map((n) => (
        <Stack key={n} direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: 96 }} variant="body2">
            {n}
          </Typography>
          {m.map((t) => (
            <Stack key={t} sx={{ minWidth: x, alignItems: 'center' }}>
              <Fab
                variant="circular"
                color={t}
                size="medium"
                {...(n === 'Focused' ? { className: 'Mui-focusVisible' } : {})}
                {...(n === 'Disabled' ? { disabled: true } : {})}
              >
                {e}
              </Fab>
            </Stack>
          ))}
        </Stack>
      ))}
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Hover / Pressed / Activated states apply via '}
        <code>:hover</code>
        {' / '}
        <code>:active</code>. Interact with any Enabled Fab above.
      </Typography>
    </Stack>
  );
}
function ExtendedCanvas() {
  const e = <span className="tecton-cube-outline" aria-hidden />;
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Variant = extended · Size = medium</Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography sx={{ minWidth: 96 }} variant="body2" />
        {m.map((n) => (
          <Typography
            key={n}
            variant="caption"
            sx={{ minWidth: x, textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}
          >
            {n}
          </Typography>
        ))}
      </Stack>
      {['Enabled', 'Focused', 'Disabled'].map((n) => (
        <Stack key={n} direction="row" spacing={1.5} rowGap={2} alignItems="center">
          <Typography sx={{ minWidth: 96 }} variant="body2">
            {n}
          </Typography>
          {m.map((t) => (
            <Stack key={t} sx={{ minWidth: x, alignItems: 'center' }}>
              <Fab
                variant="extended"
                color={t}
                size="medium"
                {...(n === 'Focused' ? { className: 'Mui-focusVisible' } : {})}
                {...(n === 'Disabled' ? { disabled: true } : {})}
              >
                Fab{e}
              </Fab>
            </Stack>
          ))}
        </Stack>
      ))}
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Extended · No Icon
        </Typography>
        {Q.map((n) => (
          <Stack key={n} direction="row" spacing={1.5} rowGap={2} alignItems="center">
            <Typography sx={{ minWidth: 96 }} variant="body2">
              {n}
            </Typography>
            {m.map((t) => (
              <Stack key={t} sx={{ minWidth: x, alignItems: 'center' }}>
                <Fab variant="extended" color={t} size="medium" {...Z(n)}>
                  Fab
                </Fab>
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function SizesCanvas() {
  const e = <span className="tecton-cube-outline" aria-hidden />;
  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="h6">Size Medium (48px round / 40px extended)</Typography>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
          {ge.map((n) => (
            <Stack key={n} spacing={1} alignItems="center">
              <Fab variant={n} color="primary" size="medium">
                {n === 'extended' ? <React.Fragment>Fab{e}</React.Fragment> : e}
              </Fab>
              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                {n === 'circular' ? 'circular' : 'extended + icon'}
              </Typography>
            </Stack>
          ))}
          <Stack spacing={1} alignItems="center">
            <Fab variant="extended" color="primary" size="medium">
              Fab
            </Fab>
            <Typography variant="caption">extended label-only</Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={4}>
        <Typography variant="h6">Size Small (40px round / 34px extended)</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ minWidth: 96 }} variant="body2" />
          {m.map((n) => (
            <Typography
              key={n}
              variant="caption"
              sx={{
                minWidth: x,
                textAlign: 'center',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {n}
            </Typography>
          ))}
        </Stack>
        <CJ heading="Variant = circular · Size = small" variant="circular" size="small" icon />
        <CJ heading="Variant = extended · Size = small" variant="extended" size="small" icon />
        <CJ heading="Extended · Small · No Icon" variant="extended" size="small" icon={false} />
      </Stack>
    </Stack>
  );
}
function ColorsCanvas() {
  const e = <span className="tecton-cube-outline" aria-hidden />;
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Color roles (circular, medium)</Typography>
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
        {m.map((n) => (
          <Stack key={n} spacing={1} alignItems="center">
            <Fab variant="circular" color={n} size="medium">
              {e}
            </Fab>
            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
              {n}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  const e = <span className="tecton-cube-outline" aria-hidden />;
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">Variants</Typography>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
          <Fab variant="extended" color="primary">
            Fab{e}
          </Fab>
          <Fab variant="circular" color="primary">
            {e}
          </Fab>
          <Fab variant="extended" color="primary">
            Fab
          </Fab>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Small Size</Typography>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
          <Fab variant="extended" color="primary" size="small">
            Fab{e}
          </Fab>
          <Fab variant="circular" color="primary" size="small">
            {e}
          </Fab>
          <Fab variant="extended" color="primary" size="small">
            Fab
          </Fab>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Colors</Typography>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" rowGap={2}>
          <Fab variant="circular" color="primary">
            {e}
          </Fab>
          <Fab variant="circular" color="secondary">
            {e}
          </Fab>
          <Fab variant="circular" color="outlined">
            {e}
          </Fab>
        </Stack>
      </Stack>
    </Stack>
  );
}
const Ue = { title: 'Atoms/Fab', component: Fab };
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_Circular = { name: 'Circular', render: () => <CircularCanvas /> };
const Story_Extended = { name: 'Extended', render: () => <ExtendedCanvas /> };
const Story_Colors = { name: 'Colors', render: () => <ColorsCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
function Ae(e) {
  if (e !== 'none') return <span className={`tecton-${e}`} aria-hidden />;
}
const Story_Playground = {
  name: 'Playground',
  args: {
    variant: 'circular',
    color: 'primary',
    size: 'medium',
    disabled: false,
    icon: 'add-outline',
    label: 'Fab',
  },
  render: function StoryRender(e) {
    const n = Ae(e.icon);
    return (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        <Fab variant={e.variant} color={e.color} size={e.size} disabled={e.disabled}>
          {e.variant === 'extended' ? (
            <React.Fragment>
              {e.label}
              {n}
            </React.Fragment>
          ) : (
            n
          )}
        </Fab>
      </Stack>
    );
  },
};

export const meta = Ue;
export const stories = {
  'atoms-fab--circular': Story_Circular,
  'atoms-fab--colors': Story_Colors,
  'atoms-fab--examples': Story_Examples,
  'atoms-fab--extended': Story_Extended,
  'atoms-fab--playground': Story_Playground,
  'atoms-fab--sizes': Story_Sizes,
};
