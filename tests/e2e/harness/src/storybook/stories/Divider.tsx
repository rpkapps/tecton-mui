// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Divider, Stack, Typography } from '@tecton-mui/ui';

const x = ['medium', 'subtle', 'strong'];
function HorizontalCanvas() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 280 }}>
      {x.map((t) => (
        <Stack key={t} spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {t}
          </Typography>
          <Divider emphasis={t} />
        </Stack>
      ))}
    </Stack>
  );
}
function VerticalCanvas() {
  return (
    <Stack direction="row" spacing={4}>
      {x.map((t) => (
        <Stack key={t} spacing={1} sx={{ width: 40, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {t}
          </Typography>
          <Divider orientation="vertical" sx={{ height: 220, width: '1px' }} emphasis={t} />
        </Stack>
      ))}
    </Stack>
  );
}
function LabeledCanvas() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 280 }}>
      {x.map((t) => (
        <Stack key={t} spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {t}
          </Typography>
          <Divider emphasis={t}>Label</Divider>
        </Stack>
      ))}
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2} sx={{ maxWidth: 280 }}>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Strong Emphasis
          </Typography>
          <Divider emphasis="strong" />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Medium Emphasis
          </Typography>
          <Divider />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Subtle Emphasis
          </Typography>
          <Divider emphasis="subtle" />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Vertical
        </Typography>
        <Stack direction="row" spacing={4} sx={{ height: 220, alignItems: 'stretch' }}>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ width: '1px !important', flexShrink: 0 }}
            emphasis="strong"
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ width: '1px !important', flexShrink: 0 }}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ width: '1px !important', flexShrink: 0 }}
            emphasis="subtle"
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
const N = { title: 'Atoms/Divider', component: Divider };
const Story_Horizontal = { name: 'Horizontal', render: () => <HorizontalCanvas /> };
const Story_Vertical = { name: 'Vertical', render: () => <VerticalCanvas /> };
const Story_Labeled = { name: 'Labeled', render: () => <LabeledCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };

export const meta = N;
export const stories = {
  'atoms-divider--examples': Story_Examples,
  'atoms-divider--horizontal': Story_Horizontal,
  'atoms-divider--labeled': Story_Labeled,
  'atoms-divider--vertical': Story_Vertical,
};
