// Parity scenarios that have no direct Storybook story: our clocks and our independently implemented
// range pickers, laid out like the Storybook "Organisms/Date" stories (caption + ExampleRow) so they
// can be compared with the Storybook "Range" story (a StaticDatePicker) and checked visually.
import * as React from 'react';
import {
  DateRangeCalendar,
  DigitalClock,
  MultiSectionDigitalClock,
  Stack,
  StaticDatePicker,
  StaticDateRangePicker,
  StaticTimePicker,
  TimeClock,
  Typography,
} from '@tecton-mui/ui';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';

const DEC_14 = () => new Date('2023-12-14');
const TIME = () => new Date(2023, 11, 14, 10, 25);

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
function Canvas({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {caption}
        </Typography>
        {children}
      </Stack>
    </LocalizationProvider>
  );
}

export const meta = { title: 'Extra/Pickers' };
export const stories = {
  // Same structure as organisms-date--range, with our range picker in place of StaticDatePicker:
  // one month, the start endpoint on Dec 14 (what the Storybook story selects).
  'extra-pickers--range-single-endpoint': {
    render: () => (
      <Canvas caption="StaticDateRangePicker, one calendar, start endpoint only.">
        <ExampleRow label="Static Date Range Picker">
          <StaticDateRangePicker calendars={1} defaultValue={[DEC_14(), null]} />
        </ExampleRow>
      </Canvas>
    ),
  },
  'extra-pickers--range-mobile': {
    render: () => (
      <Canvas caption="StaticDateRangePicker (mobile wrapper), Dec 11 – Dec 19, 2023.">
        <ExampleRow label="Static Date Range Picker">
          <StaticDateRangePicker
            calendars={1}
            defaultValue={[new Date('2023-12-11'), new Date('2023-12-19')]}
          />
        </ExampleRow>
      </Canvas>
    ),
  },
  'extra-pickers--range-desktop': {
    render: () => (
      <Canvas caption="StaticDateRangePicker (desktop wrapper), two calendars, Dec 28 – Jan 9.">
        <ExampleRow label="Static Date Range Picker">
          <StaticDateRangePicker
            displayStaticWrapperAs="desktop"
            defaultValue={[new Date('2023-12-28'), new Date('2024-01-09')]}
          />
        </ExampleRow>
      </Canvas>
    ),
  },
  'extra-pickers--range-calendar': {
    render: () => (
      <Canvas caption="DateRangeCalendar, two calendars, Dec 11 – Dec 19, 2023.">
        <DateRangeCalendar defaultValue={[new Date('2023-12-11'), new Date('2023-12-19')]} />
      </Canvas>
    ),
  },
  'extra-pickers--static-date': {
    render: () => (
      <Canvas caption="StaticDatePicker reference (same as the Storybook Range story).">
        <ExampleRow label="Static Date Picker">
          <StaticDatePicker defaultValue={DEC_14()} />
        </ExampleRow>
      </Canvas>
    ),
  },
  'extra-pickers--clocks': {
    render: () => (
      <Canvas caption="TimeClock, DigitalClock and MultiSectionDigitalClock at 10:25.">
        <Stack direction="row" spacing={4} alignItems="flex-start">
          <ExampleRow label="TimeClock">
            <TimeClock defaultValue={TIME()} />
          </ExampleRow>
          <ExampleRow label="DigitalClock">
            <DigitalClock defaultValue={TIME()} />
          </ExampleRow>
          <ExampleRow label="MultiSectionDigitalClock">
            <MultiSectionDigitalClock defaultValue={TIME()} />
          </ExampleRow>
        </Stack>
      </Canvas>
    ),
  },
  // The docs demo layout (apps/docs/src/demos/time-clock/Clocks.tsx): the three views as direct
  // children of a flex row. MUI's views are sized for the picker layout: TimeClock is a 320px
  // `overflow: hidden` view that a flex row may shrink (clipping the dial), DigitalClock is
  // `width: 100%` (it grows to take the row's free space).
  'extra-pickers--clocks-flex-row': {
    render: () => (
      <Canvas caption="Docs layout: clocks as direct flex-row children.">
        <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
          <TimeClock defaultValue={TIME()} />
          <DigitalClock defaultValue={TIME()} timeStep={30} sx={{ maxHeight: 280 }} />
          <MultiSectionDigitalClock defaultValue={TIME()} />
        </Stack>
      </Canvas>
    ),
  },
  // Same row with each view wrapped in a block box (the fix for the docs demo): the views then
  // keep their intrinsic picker size, as inside a picker layout.
  'extra-pickers--clocks-flex-row-wrapped': {
    render: () => (
      <Canvas caption="Docs layout with each view wrapped in a block box.">
        <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
          <div>
            <TimeClock defaultValue={TIME()} />
          </div>
          <div>
            <DigitalClock defaultValue={TIME()} timeStep={30} sx={{ maxHeight: 280 }} />
          </div>
          <div>
            <MultiSectionDigitalClock defaultValue={TIME()} />
          </div>
        </Stack>
      </Canvas>
    ),
  },
  'extra-pickers--static-time': {
    render: () => (
      <Canvas caption="StaticTimePicker (mobile wrapper, analog clock).">
        <StaticTimePicker defaultValue={TIME()} />
      </Canvas>
    ),
  },
};
