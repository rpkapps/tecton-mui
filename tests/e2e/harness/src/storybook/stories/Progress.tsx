// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@tecton-mui/ui';

const p = ['primary', 'secondary', 'tertiary'];
const R = ['determinate', 'buffer', 'indeterminate'];
const u = ['primary', 'secondary', 'inherit'];
const _ = ['medium', 'small'];
const W = { small: 'Small (16px)', medium: 'Medium (32px)' };
const B = 243;
const F = 200;
function CB({ color: r, value: a, valueBuffer: i, variant: s = 'determinate' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, width: B }}>
      <Box sx={{ width: F, display: 'flex', alignItems: 'center' }}>
        <LinearProgress
          variant={s}
          color={r}
          {...(s !== 'indeterminate' ? { value: a } : {})}
          {...(s === 'buffer' && i !== undefined ? { valueBuffer: i } : {})}
          sx={{ width: '100%' }}
        />
      </Box>
      <Typography variant="body2" sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
        {a}%
      </Typography>
    </Box>
  );
}
function G({ color: r, value: a, size: i = 'medium' }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" color={r} size={i} value={a} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" sx={{ fontSize: 12, lineHeight: 1 }}>
          {a}%
        </Typography>
      </Box>
    </Box>
  );
}
function CircularCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Circular</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2" />
        {u.map((r) => (
          <Typography
            key={r}
            variant="caption"
            sx={{ minWidth: 60, textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}
          >
            {r}
          </Typography>
        ))}
      </Stack>
      {_.map((r) => (
        <Stack key={r} direction="row" spacing={3} alignItems="center">
          <Typography sx={{ minWidth: 120 }} variant="body2">
            {W[r]}
          </Typography>
          {u.map((a) => (
            <Stack key={a} sx={{ minWidth: 60, alignItems: 'center' }}>
              <CircularProgress color={a} size={r} />
            </Stack>
          ))}
        </Stack>
      ))}
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2">
          Medium w/Label (32px)
        </Typography>
        {u.map((r) => (
          <Stack key={r} sx={{ minWidth: 60, alignItems: 'center' }}>
            <G color={r} value={60} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function LinearCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5">Linear</Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography sx={{ minWidth: 120 }} variant="body2" />
        {p.map((r) => (
          <Typography
            key={r}
            variant="caption"
            sx={{ minWidth: B, textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}
          >
            {r}
          </Typography>
        ))}
      </Stack>
      {R.map((r) => (
        <Stack key={r} direction="row" spacing={3} alignItems="center">
          <Typography sx={{ minWidth: 120, textTransform: 'capitalize' }} variant="body2">
            {r}
          </Typography>
          {p.map((a) => (
            <Box key={a} sx={{ minWidth: B }}>
              <CB
                color={a}
                variant={r}
                value={50}
                {...(r === 'buffer' ? { valueBuffer: 70 } : {})}
              />
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">Determinate</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          {p.map((r) => (
            <CB key={r} color={r} value={50} />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Buffer</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          {p.map((r) => (
            <CB key={r} color={r} variant="buffer" value={50} valueBuffer={70} />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Indeterminate</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          {p.map((r) => (
            <CB key={r} color={r} variant="indeterminate" value={50} />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Circular w/Label</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          {u.map((r) => (
            <G key={r} color={r} value={60} />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Circular · Medium (32px)</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          {u.map((r) => (
            <CircularProgress key={r} color={r} size="medium" />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Circular · Small (16px)</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          {u.map((r) => (
            <CircularProgress key={r} color={r} size="small" />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
const te = { title: 'Atoms/Progress', component: LinearProgress };
const Story_Circular = { name: 'Circular', render: () => <CircularCanvas /> };
const Story_Linear = { name: 'Linear', render: () => <LinearCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    kind: 'circular',
    variant: 'indeterminate',
    value: 50,
    valueBuffer: 70,
    color: 'primary',
    size: 'medium',
  },
  render: function StoryRender(r) {
    if (r.kind === 'circular') {
      const a = r.variant === 'buffer' ? 'indeterminate' : r.variant;
      return (
        <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
          <CircularProgress
            variant={a}
            color={r.color}
            size={r.size}
            {...(a === 'determinate' ? { value: r.value } : {})}
          />
        </Stack>
      );
    }
    return (
      <Stack sx={{ p: 3, width: 320 }}>
        <LinearProgress
          variant={r.variant}
          color={r.color}
          sx={{ width: '100%' }}
          {...(r.variant === 'determinate' || r.variant === 'buffer' ? { value: r.value } : {})}
          {...(r.variant === 'buffer' ? { valueBuffer: r.valueBuffer } : {})}
        />
      </Stack>
    );
  },
};

export const meta = te;
export const stories = {
  'atoms-progress--circular': Story_Circular,
  'atoms-progress--examples': Story_Examples,
  'atoms-progress--linear': Story_Linear,
  'atoms-progress--playground': Story_Playground,
};
