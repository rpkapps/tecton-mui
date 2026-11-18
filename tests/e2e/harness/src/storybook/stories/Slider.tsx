// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Box, Slider, Stack, Typography } from '@tecton-mui/ui';

function CX({ label: e, slider: t }) {
  return (
    <Stack spacing={1} sx={{ minWidth: 200, alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {e}
      </Typography>
      <Box sx={{ width: 200, paddingInline: 1 }}>{t}</Box>
    </Stack>
  );
}
const L = ['medium', 'small'];
function COe({ children: e }) {
  return (
    <React.Fragment>
      {L.map((t) => (
        <Stack key={t} spacing={1}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {t === 'medium' ? 'Size medium' : 'Size small'}
          </Typography>
          <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }} rowGap={2}>
            {e(t)}
          </Stack>
        </Stack>
      ))}
    </React.Fragment>
  );
}
function ContinuousCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Continuous: single thumb, no marks
      </Typography>
      <COe>
        {(e) => (
          <React.Fragment>
            <CX
              label="Primary (lilac)"
              slider={<Slider size={e} defaultValue={5} min={0} max={12} color="primary" />}
            />
            <CX
              label="Secondary (blue)"
              slider={<Slider size={e} defaultValue={5} min={0} max={12} color="secondary" />}
            />
            <CX
              label="Tertiary (lime)"
              slider={<Slider size={e} defaultValue={5} min={0} max={12} color="tertiary" />}
            />
            <CX
              label="Disabled"
              slider={<Slider size={e} defaultValue={5} min={0} max={12} disabled />}
            />
            <CX
              label="Tertiary disabled"
              slider={
                <Slider size={e} defaultValue={5} min={0} max={12} color="tertiary" disabled />
              }
            />
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
function DiscreteCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Discrete: step-based increments without visible marks
      </Typography>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }} rowGap={2}>
        <CX
          label="Primary"
          slider={<Slider defaultValue={5} min={0} max={12} step={1} color="primary" />}
        />
        <CX
          label="Secondary"
          slider={<Slider defaultValue={5} min={0} max={12} step={1} color="secondary" />}
        />
        <CX
          label="Tertiary"
          slider={<Slider defaultValue={5} min={0} max={12} step={1} color="tertiary" />}
        />
        <CX
          label="Disabled"
          slider={<Slider defaultValue={5} min={0} max={12} step={1} disabled />}
        />
      </Stack>
    </Stack>
  );
}
function RangeCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Range: two thumbs bounding a selectable range
      </Typography>
      <COe>
        {(e) => (
          <React.Fragment>
            <CX
              label="Primary"
              slider={<Slider size={e} defaultValue={[3, 9]} min={0} max={12} color="primary" />}
            />
            <CX
              label="Secondary"
              slider={<Slider size={e} defaultValue={[3, 9]} min={0} max={12} color="secondary" />}
            />
            <CX
              label="Tertiary"
              slider={<Slider size={e} defaultValue={[3, 9]} min={0} max={12} color="tertiary" />}
            />
            <CX
              label="Disabled"
              slider={<Slider size={e} defaultValue={[3, 9]} min={0} max={12} disabled />}
            />
            <CX
              label="Tertiary disabled"
              slider={
                <Slider size={e} defaultValue={[3, 9]} min={0} max={12} color="tertiary" disabled />
              }
            />
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
function MarksCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Marks: discrete step indicators
      </Typography>
      <COe>
        {(e) => (
          <React.Fragment>
            <CX
              label="Primary"
              slider={
                <Slider size={e} defaultValue={5} min={0} max={12} step={1} marks color="primary" />
              }
            />
            <CX
              label="Secondary"
              slider={
                <Slider
                  size={e}
                  defaultValue={5}
                  min={0}
                  max={12}
                  step={1}
                  marks
                  color="secondary"
                />
              }
            />
            <CX
              label="Tertiary"
              slider={
                <Slider
                  size={e}
                  defaultValue={5}
                  min={0}
                  max={12}
                  step={1}
                  marks
                  color="tertiary"
                />
              }
            />
            <CX
              label="Disabled"
              slider={<Slider size={e} defaultValue={5} min={0} max={12} step={1} marks disabled />}
            />
            <CX
              label="Tertiary disabled"
              slider={
                <Slider
                  size={e}
                  defaultValue={5}
                  min={0}
                  max={12}
                  step={1}
                  marks
                  color="tertiary"
                  disabled
                />
              }
            />
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
function RangeHoverCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Range hover: first thumb centred on the track
      </Typography>
      <COe>
        {(e) => (
          <React.Fragment>
            <CX
              label="Primary"
              slider={<Slider size={e} defaultValue={[6, 9]} min={0} max={12} color="primary" />}
            />
            <CX
              label="Secondary"
              slider={<Slider size={e} defaultValue={[6, 9]} min={0} max={12} color="secondary" />}
            />
            <CX
              label="Tertiary"
              slider={<Slider size={e} defaultValue={[6, 9]} min={0} max={12} color="tertiary" />}
            />
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
function CIe({ label: e, slider: t }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {e}
      </Typography>
      <Box sx={{ height: 162 }}>{t}</Box>
    </Stack>
  );
}
function VerticalMarksCanvas() {
  const e = (t, i, s = false) => (
    <Slider
      orientation="vertical"
      size={t}
      defaultValue={5}
      min={0}
      max={12}
      step={1}
      marks
      color={i}
      disabled={s}
      sx={{ height: '100%' }}
    />
  );
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Vertical marks: discrete step indicators, vertical orientation
      </Typography>
      <COe>
        {(t) => (
          <React.Fragment>
            <CIe label="Primary" slider={e(t, 'primary')} />
            <CIe label="Secondary" slider={e(t, 'secondary')} />
            <CIe label="Tertiary" slider={e(t, 'tertiary')} />
            <CIe label="Disabled" slider={e(t, undefined, true)} />
            <CIe
              label="Tertiary disabled"
              slider={
                <Slider
                  orientation="vertical"
                  size={t}
                  defaultValue={5}
                  min={0}
                  max={12}
                  step={1}
                  marks
                  color="tertiary"
                  disabled
                  sx={{ height: '100%' }}
                />
              }
            />
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
const Za = [
  { name: 'Primary', color: 'primary' },
  { name: 'Secondary', color: 'secondary' },
  { name: 'Tertiary', color: 'tertiary' },
  { name: 'Disabled', disabled: true },
  { name: 'Tertiary disabled', color: 'tertiary', disabled: true },
];
function VerticalCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Vertical orientation
      </Typography>
      <COe>
        {(e) => (
          <React.Fragment>
            {['Continuous', 'Range'].flatMap((t) =>
              Za.map(({ name: i, disabled: s, color: l }) => (
                <CIe
                  key={`${t}-${i}`}
                  label={`${t} · ${i}`}
                  slider={
                    <Slider
                      orientation="vertical"
                      size={e}
                      defaultValue={t === 'Range' ? [3, 9] : 5}
                      min={0}
                      max={12}
                      color={l}
                      disabled={s}
                      sx={{ height: '100%' }}
                    />
                  }
                />
              )),
            )}
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
function VerticalRangeHoverCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Vertical range hover: first thumb centred on the track
      </Typography>
      <COe>
        {(e) => (
          <React.Fragment>
            {Za.filter((t) => !t.disabled).map(({ name: t, color: i }) => (
              <CIe
                key={t}
                label={t}
                slider={
                  <Slider
                    orientation="vertical"
                    size={e}
                    defaultValue={[6, 9]}
                    min={0}
                    max={12}
                    color={i}
                    sx={{ height: '100%' }}
                  />
                }
              />
            ))}
          </React.Fragment>
        )}
      </COe>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack
      direction="row"
      spacing={6}
      sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}
      rowGap={3}
    >
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Continuous · Primary (lilac)
        </Typography>
        <Box sx={{ width: 200, paddingInline: 1 }}>
          <Slider
            defaultValue={4}
            min={0}
            max={12}
            valueLabelDisplay="off"
            marks={[
              { value: 0, label: '0' },
              { value: 12, label: '12' },
            ]}
            color="primary"
          />
        </Box>
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Vertical · Secondary (blue)
        </Typography>
        <Box sx={{ height: 162, paddingBlock: 1 }}>
          <Slider
            orientation="vertical"
            defaultValue={7}
            min={0}
            max={12}
            marks={[
              { value: 0, label: '12' },
              { value: 12, label: '12' },
            ]}
            valueLabelDisplay="off"
            color="secondary"
            sx={{ height: '100%' }}
          />
        </Box>
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Range · Tertiary (lime)
        </Typography>
        <Box sx={{ width: 250, paddingInline: 1 }}>
          <Slider
            defaultValue={[3, 8]}
            min={0}
            max={12}
            step={1}
            marks={[
              { value: 0, label: '0' },
              { value: 12, label: '12' },
            ]}
            valueLabelDisplay="off"
            color="tertiary"
          />
        </Box>
      </Stack>
    </Stack>
  );
}
const dr = { title: 'Molecules/Slider', component: Slider };
const Story_RangeHover = { name: 'Range hover', render: () => <RangeHoverCanvas /> };
const Story_VerticalRangeHover = {
  name: 'Vertical range hover',
  render: () => <VerticalRangeHoverCanvas />,
};
const Story_Continuous = { name: 'Continuous', render: () => <ContinuousCanvas /> };
const Story_Range = { name: 'Range', render: () => <RangeCanvas /> };
const Story_Marks = { name: 'Marks', render: () => <MarksCanvas /> };
const Story_VerticalMarks = { name: 'Vertical marks', render: () => <VerticalMarksCanvas /> };
const Story_Discrete = { name: 'Discrete', render: () => <DiscreteCanvas /> };
const Story_Vertical = { name: 'Vertical', render: () => <VerticalCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    value: 50,
    range: false,
    rangeEnd: 80,
    min: 0,
    max: 100,
    step: 1,
    marks: false,
    orientation: 'horizontal',
    disabled: false,
    height: 200,
    size: 'medium',
    color: 'primary',
  },
  render: (e) => (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Box
        sx={e.orientation === 'vertical' ? { height: e.height } : { width: 300, paddingInline: 1 }}
      >
        <Slider
          value={e.range ? [e.value, e.rangeEnd] : e.value}
          min={e.min}
          max={e.max}
          step={Math.max(1, e.step)}
          marks={e.marks}
          orientation={e.orientation}
          size={e.size}
          color={e.color}
          disabled={e.disabled}
          onChange={() => {}}
          sx={e.orientation === 'vertical' ? { height: '100%' } : undefined}
        />
      </Box>
    </Stack>
  ),
};

export const meta = dr;
export const stories = {
  'molecules-slider--continuous': Story_Continuous,
  'molecules-slider--discrete': Story_Discrete,
  'molecules-slider--examples': Story_Examples,
  'molecules-slider--marks': Story_Marks,
  'molecules-slider--playground': Story_Playground,
  'molecules-slider--range': Story_Range,
  'molecules-slider--range-hover': Story_RangeHover,
  'molecules-slider--vertical': Story_Vertical,
  'molecules-slider--vertical-marks': Story_VerticalMarks,
  'molecules-slider--vertical-range-hover': Story_VerticalRangeHover,
};
