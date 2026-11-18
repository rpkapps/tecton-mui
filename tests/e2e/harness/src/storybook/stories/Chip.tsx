// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';

// The Storybook's sample avatar photo (loaded from the Storybook CDN, not vendored).
const image_a =
  'https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/storybook-mui/0.10.1/assets/image-DhKpiPGa.png';
import { Avatar, Chip, Stack, Typography } from '@tecton-mui/ui';

const d = ['default', 'primary', 'error', 'warning', 'info', 'success'];
const ne = ['filled', 'outlined'];
const u = ['pill', 'rectangle'];
const m = ['Medium', 'Small'];
const M = ['Enabled', 'Focused', 'Disabled'];
function A({ size: a, variant: n, shape: i, state: t, clickable: s = false }) {
  return (
    <Stack direction="row" spacing={1} rowGap={1} alignItems="center">
      <Typography sx={{ minWidth: 130 }} variant="body2" style={{ textTransform: 'capitalize' }}>
        {s ? 'clickable · ' : ''}
        {n}
        {' · '}
        {i}
        {' · '}
        {t}
      </Typography>
      {d.map((p) => (
        <Stack key={p} sx={{ minWidth: 80, alignItems: 'center' }}>
          <Chip
            label="Chip"
            size={a}
            color={p}
            variant={n}
            {...(t === 'Disabled' ? { disabled: true } : {})}
            {...(t === 'Focused' ? { className: 'Mui-focusVisible' } : {})}
            shape={i}
            {...(s ? { onClick: () => {} } : {})}
          />
        </Stack>
      ))}
    </Stack>
  );
}
function CJ() {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography sx={{ minWidth: 130 }} variant="body2" />
      {d.map((a) => (
        <Typography
          key={a}
          variant="caption"
          sx={{ minWidth: 80, textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}
        >
          {a}
        </Typography>
      ))}
    </Stack>
  );
}
function FilledCanvas() {
  return (
    <Stack spacing={5}>
      {['Medium', 'Small', 'Xsmall'].map((a) => {
        const n = a.toLowerCase();
        return (
          <Stack key={n} spacing={3}>
            <Typography variant="h5">
              {'Size '}
              {a}: Filled Color × Shape × State
            </Typography>
            <CJ />
            {u.map((i) =>
              ['Enabled', 'Focused', 'Disabled'].map((t) => (
                <A key={`${i}-${t}`} size={n} variant="filled" shape={i} state={t} />
              )),
            )}
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {'Hover and Pressed states apply via '}
              <code>:hover</code>
              {' / '}
              <code>:active</code>. Interact with any Enabled chip above.
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
function OutlinedCanvas() {
  return (
    <Stack spacing={5}>
      {['Medium', 'Small', 'Xsmall'].map((a) => {
        const n = a.toLowerCase();
        return (
          <Stack key={n} spacing={3}>
            <Typography variant="h5">
              {'Size '}
              {a}: Outlined Color × Shape × State
            </Typography>
            <CJ />
            {u.map((i) =>
              ['Enabled', 'Focused', 'Disabled'].map((t) => (
                <A key={`${i}-${t}`} size={n} variant="outlined" shape={i} state={t} />
              )),
            )}
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {'Hover and Pressed states apply via '}
              <code>:hover</code>
              {' / '}
              <code>:active</code>. Interact with any Enabled chip above.
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
function ClickableMatrixCanvas({ variant: a }) {
  const n = a === 'filled' ? 'Filled' : 'Outlined';
  return (
    <Stack spacing={5}>
      {m.map((i) => {
        const t = i.toLowerCase();
        return (
          <Stack key={t} spacing={3}>
            <Typography variant="h5">
              {'Size '}
              {i}
              {': Clickable '}
              {n}
              {' Color × Shape × State'}
            </Typography>
            <CJ />
            {u.map((s) =>
              M.map((p) => (
                <A key={`${s}-${p}`} size={t} variant={a} shape={s} state={p} clickable />
              )),
            )}
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {'Hovered and Pressed states apply via '}
              <code>:hover</code>
              {' / '}
              <code>:active</code>. Interact with any Enabled chip above.
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
function ClickableCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Clickable</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Static
          </Typography>
          <Chip label="Chip" />
        </Stack>
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Clickable
          </Typography>
          <Chip label="Chip" onClick={() => {}} />
        </Stack>
      </Stack>
    </Stack>
  );
}
function DeletableCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Deletable</Typography>
      {ne.map((a) => (
        <Stack key={a} direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
          {d.map((n) => (
            <Chip
              key={n}
              label={n.charAt(0).toUpperCase() + n.slice(1)}
              color={n}
              variant={a}
              onDelete={() => {}}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function ShapesCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Shapes</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        {u.map((a) => (
          <Stack key={a} spacing={0.5} alignItems="center">
            <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
              {a}
            </Typography>
            <Chip label="Chip" shape={a} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">Shapes</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label="Interactive Pill" />
          <Chip label="Display Rectangle" shape="rectangle" />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Sizes</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label="Chip" size="medium" />
          <Chip label="Chip" size="small" />
          <Chip label="Chip" size="xsmall" />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Colors</Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
          {d.map((a) => (
            <Chip
              key={a}
              label={a.charAt(0).toUpperCase() + a.slice(1)}
              color={a}
              variant="filled"
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
          {d.map((a) => (
            <Chip
              key={a}
              label={a.charAt(0).toUpperCase() + a.slice(1)}
              color={a}
              variant="outlined"
            />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Adornment</Typography>
        {ne.map((a) => (
          <Stack key={a} direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
            <Chip
              size="small"
              variant={a}
              color="default"
              label="Icon"
              icon={<span className="tecton-cube-outline" aria-hidden />}
              shape="rectangle"
            />
            <Chip
              size="small"
              variant={a}
              color="primary"
              label="Text"
              icon={<span style={{ fontSize: 12, lineHeight: 1, fontWeight: 500 }}>USD</span>}
              shape="rectangle"
            />
            <Chip
              size="small"
              variant={a}
              color="info"
              label="Avatar"
              avatar={<Avatar src={image_a} alt="OP" />}
              onClick={() => {}}
            />
            <Chip
              size="small"
              variant={a}
              color="info"
              label="Avatar"
              avatar={<Avatar>OP</Avatar>}
              onClick={() => {}}
              shape="rectangle"
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
const Ve = { title: 'Atoms/Chip', component: Chip };
const Story_Filled = { name: 'Filled', render: () => <FilledCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_ClickableFilled = {
  name: 'Clickable Filled',
  render: () => <ClickableMatrixCanvas variant="filled" />,
};
const Story_ClickableOutlined = {
  name: 'Clickable Outlined',
  render: () => <ClickableMatrixCanvas variant="outlined" />,
};
const Story_Clickable = { name: 'Clickable', render: () => <ClickableCanvas /> };
const Story_Deletable = { name: 'Deletable', render: () => <DeletableCanvas /> };
const Story_Shapes = { name: 'Shapes', render: () => <ShapesCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    label: 'Chip',
    variant: 'filled',
    color: 'primary',
    size: 'medium',
    shape: 'pill',
    clickable: false,
    deletable: false,
    disabled: false,
  },
  render: (a) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Chip
        label={a.label}
        variant={a.variant}
        color={a.color}
        size={a.size}
        shape={a.shape}
        disabled={a.disabled}
        {...(a.clickable ? { onClick: () => {} } : {})}
        {...(a.deletable ? { onDelete: () => {} } : {})}
      />
    </Stack>
  ),
};

export const meta = Ve;
export const stories = {
  'atoms-chip--clickable': Story_Clickable,
  'atoms-chip--clickable-filled': Story_ClickableFilled,
  'atoms-chip--clickable-outlined': Story_ClickableOutlined,
  'atoms-chip--deletable': Story_Deletable,
  'atoms-chip--examples': Story_Examples,
  'atoms-chip--filled': Story_Filled,
  'atoms-chip--outlined': Story_Outlined,
  'atoms-chip--playground': Story_Playground,
  'atoms-chip--shapes': Story_Shapes,
};
