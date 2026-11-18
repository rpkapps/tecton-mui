// Reproduction of the Tecton Storybook 0.10.1 "Organisms/Date" stories, rendered with
// @tecton-mui/ui. The Storybook bundles MUI X Community pickers inline; here the same JSX uses our
// passthrough pickers and the default `LocalizationProvider` (AdapterDateFns, en-US), which matches
// the Storybook's `AdapterDateFns` setup.
import * as React from 'react';
import {
  DatePicker,
  Divider,
  MobileDatePicker,
  Stack,
  StaticDatePicker,
  Typography,
} from '@tecton-mui/ui';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';

const shrinkLabel = { textField: { InputLabelProps: { shrink: true } } };
const DEC_14 = () => new Date('2023-12-14');

function MediumPicker() {
  return (
    <LocalizationProvider>
      <DatePicker label="Select date" format="MM/dd/yyyy" slotProps={shrinkLabel} />
    </LocalizationProvider>
  );
}
function SmallPicker() {
  return (
    <LocalizationProvider>
      <DatePicker size="small" label="Select date" format="MM/dd/yyyy" slotProps={shrinkLabel} />
    </LocalizationProvider>
  );
}
function StaticPicker() {
  return (
    <LocalizationProvider>
      <StaticDatePicker defaultValue={DEC_14()} />
    </LocalizationProvider>
  );
}
function StaticViewPickerExample({ openTo }: { openTo: 'month' | 'year' }) {
  return (
    <LocalizationProvider>
      <StaticDatePicker
        defaultValue={DEC_14()}
        views={['year', 'month', 'day']}
        openTo={openTo}
        sx={{ width: 320 }}
      />
    </LocalizationProvider>
  );
}
function MobilePicker() {
  return (
    <LocalizationProvider>
      <MobileDatePicker label="Select date" format="MM/dd/yyyy" slotProps={shrinkLabel} />
    </LocalizationProvider>
  );
}
function StatePicker({
  state,
  size,
  value,
}: {
  state: string;
  size: 'small' | 'medium';
  value?: Date;
}) {
  const slotProps = {
    textField: {
      InputLabelProps: { shrink: true },
      error: state === 'error',
      helperText: state === 'error' ? 'Invalid date' : undefined,
    },
  };
  return (
    <LocalizationProvider>
      <DatePicker
        size={size}
        label="Select date"
        format="MM/dd/yyyy"
        disabled={state === 'disabled'}
        defaultValue={value}
        slotProps={slotProps}
      />
    </LocalizationProvider>
  );
}
function ExampleRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      {children}
    </Stack>
  );
}
function DateInputCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {'Basic '}
        <code>DatePicker</code>
        {' at medium size, empty. Label pinned to the outline notch via '}
        <code>InputLabelProps.shrink=true</code>.
      </Typography>
      <ExampleRow label="Date Picker (medium, empty)">
        <MediumPicker />
      </ExampleRow>
    </Stack>
  );
}
function DateTimeCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        <code>DatePicker</code>
        {' filled with a specific '}
        <code>Date</code>
        {
          'value. The underlying value carries date + time internally; the input renders the date portion via the '
        }
        <code>MM/dd/yyyy</code>format mask.
      </Typography>
      <ExampleRow label="Date Picker (medium, filled 14 Dec 2023)">
        <LocalizationProvider>
          <DatePicker
            label="Select date"
            format="MM/dd/yyyy"
            defaultValue={DEC_14()}
            slotProps={shrinkLabel}
          />
        </LocalizationProvider>
      </ExampleRow>
    </Stack>
  );
}
function RangeCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        <code>StaticDatePicker</code>
        {
          ' renders the full month grid inline so the calendar surface (day range, selected day, month navigation) is visible without opening a popover.'
        }
      </Typography>
      <ExampleRow label="Static Date Picker (320 x 441)">
        <StaticPicker />
      </ExampleRow>
    </Stack>
  );
}
function TimeCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        <code>MobileDatePicker</code>
        {
          ' renders a trigger input; tapping opens a 393 x 852 modal calendar (mobile-first selection UX).'
        }
      </Typography>
      <ExampleRow label="Mobile Date Picker (opens 393 x 852 modal on click)">
        <MobilePicker />
      </ExampleRow>
    </Stack>
  );
}
const STATES = [
  { name: 'default', label: 'Default (empty)' },
  { name: 'default', label: 'Filled (14 Dec 2023)', value: DEC_14() },
  { name: 'disabled', label: 'Disabled' },
  { name: 'error', label: 'Error' },
];
function SizesCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        <code>DatePicker</code>
        {' state matrix. Every state × both sizes. Empty fields show the '}
        <code>MM/DD/YYYY</code>
        {' placeholder because'}
        <code>{' InputLabelProps.shrink=true'}</code>
        {' keeps the label in the outline notch (matches Figma’s static render).'}
      </Typography>
      <Stack spacing={3}>
        {(['medium', 'small'] as const).map((size, i) => (
          <React.Fragment key={size}>
            {i > 0 ? <Divider flexItem /> : null}
            <Stack direction="row" spacing={4} alignItems="flex-start">
              <Typography variant="overline" sx={{ width: 80, opacity: 0.6 }}>
                {size === 'medium' ? 'Medium' : 'Small'}
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                {STATES.map((s, e) => (
                  <Stack key={`${size[0]}-${e}`} spacing={0.5} sx={{ width: 320 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      {s.label}
                    </Typography>
                    <StatePicker state={s.name} size={size} value={s.value} />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </React.Fragment>
        ))}
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <ExampleRow label="Date Picker · medium (320 × 52)">
        <MediumPicker />
      </ExampleRow>
      <ExampleRow label="Date Picker · small (320 × 48)">
        <SmallPicker />
      </ExampleRow>
      <ExampleRow label="Static Date Picker (320 × 441)">
        <StaticPicker />
      </ExampleRow>
      <ExampleRow label="Mobile Date Picker · trigger (opens 393 × 852 modal on click)">
        <MobilePicker />
      </ExampleRow>
    </Stack>
  );
}

interface PlaygroundArgs {
  disabled: boolean;
  readOnly: boolean;
  size: 'small' | 'medium';
  label: string;
  format: string;
  disableFuture: boolean;
  disablePast: boolean;
  open: boolean;
  view: 'year' | 'month' | 'day';
}

export const meta = { title: 'Organisms/Date', component: DatePicker };
export const stories = {
  'organisms-date--sizes': { name: 'Sizes', render: () => <SizesCanvas /> },
  'organisms-date--range': { name: 'Range', render: () => <RangeCanvas /> },
  'organisms-date--month-view': {
    name: 'Month view',
    render: () => (
      <ExampleRow label="Static Date Picker, month view">
        <StaticViewPickerExample openTo="month" />
      </ExampleRow>
    ),
  },
  'organisms-date--year-view': {
    name: 'Year view',
    render: () => (
      <ExampleRow label="Static Date Picker, year view">
        <StaticViewPickerExample openTo="year" />
      </ExampleRow>
    ),
  },
  'organisms-date--date-input': { name: 'Date', render: () => <DateInputCanvas /> },
  'organisms-date--date-time': { name: 'DateTime', render: () => <DateTimeCanvas /> },
  'organisms-date--time': { name: 'Time', render: () => <TimeCanvas /> },
  'organisms-date--examples': { render: () => <ExamplesCanvas /> },
  'organisms-date--playground': {
    name: 'Playground',
    args: {
      disabled: false,
      readOnly: false,
      size: 'medium',
      label: 'Select date',
      format: 'MM/dd/yyyy',
      disableFuture: false,
      disablePast: false,
      open: false,
      view: 'day',
    },
    render: (t: PlaygroundArgs) => (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        <LocalizationProvider>
          <DatePicker
            size={t.size}
            label={t.label}
            format={t.format}
            disabled={t.disabled}
            readOnly={t.readOnly}
            disableFuture={t.disableFuture}
            disablePast={t.disablePast}
            {...(t.open
              ? { open: true, views: ['year', 'month', 'day'] as const, openTo: t.view }
              : {})}
            slotProps={{
              textField: { InputLabelProps: { shrink: true } },
              popper: { disablePortal: true },
            }}
          />
        </LocalizationProvider>
      </Stack>
    ),
  },
};
