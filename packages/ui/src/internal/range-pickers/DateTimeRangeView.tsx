'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { usePickerAdapter, usePickerTranslations } from '@mui/x-date-pickers/hooks';
import { CalendarIcon, ClockIcon } from '@mui/x-date-pickers/icons';
import { DateRangeCalendar, type DateRangeCalendarProps } from './DateRangeCalendar.js';
import type { PickerRangeValue, RangePosition, RangeSelectionState } from './models.js';
import { TimeRangeView, type TimeRangeViewOptions } from './TimeRangeView.js';
import { areDatesEqual, copyTime, isValidDate } from './utils.js';

export type DateTimeRangeCalendarOptions = Omit<
  DateRangeCalendarProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'rangePosition'
  | 'defaultRangePosition'
  | 'onRangePositionChange'
  | 'className'
  | 'sx'
  | 'autoFocus'
>;

export interface DateTimeRangeViewProps extends DateTimeRangeCalendarOptions, TimeRangeViewOptions {
  value: PickerRangeValue;
  onChange: (value: PickerRangeValue, selectionState: RangeSelectionState) => void;
  rangePosition: RangePosition;
  onRangePositionChange: (position: RangePosition) => void;
  variant: 'desktop' | 'mobile';
  autoFocus?: boolean;
  localeText?: { start?: string; end?: string };
}

/**
 * Calendar plus the clock of the active endpoint. Picking a day edits the active endpoint's date;
 * completing its time moves on to the end, and completing the end time finishes the range.
 */
export function DateTimeRangeView(props: DateTimeRangeViewProps) {
  const {
    value,
    onChange,
    rangePosition,
    onRangePositionChange,
    variant,
    autoFocus,
    localeText,
    calendars = 1,
    ampm,
    ampmInClock,
    views,
    timeSteps,
    minutesStep,
    minTime,
    maxTime,
    shouldDisableTime,
    disableIgnoringDatePartForTimeValidation,
    skipDisabled,
    ...calendarProps
  } = props;
  const adapter = usePickerAdapter();
  const translations = usePickerTranslations();
  const [mobileView, setMobileView] = React.useState<'day' | 'time'>('day');
  const idBase = React.useId();

  const handleDateChange = (next: PickerRangeValue) => {
    const changed: 0 | 1 = areDatesEqual(adapter, next[0], value[0]) ? 1 : 0;
    const other = changed === 0 ? next[1] : next[0];
    const picked = next[changed];
    // A new endpoint takes the other endpoint's time so the range stays ordered on one day.
    if (picked != null && value[changed] == null && isValidDate(adapter, other)) {
      next =
        changed === 0
          ? [copyTime(adapter, picked, other), next[1]]
          : [next[0], copyTime(adapter, picked, other)];
    }
    const position: RangePosition = changed === 0 ? 'start' : 'end';
    onChange(next, 'partial');
    if (position !== rangePosition) {
      onRangePositionChange(position);
    }
    if (variant === 'mobile') {
      setMobileView('time');
    }
  };

  const handlePositionChange = (position: RangePosition) => {
    onRangePositionChange(position);
    if (variant === 'mobile') {
      setMobileView('day');
    }
  };

  const calendar = (
    <DateRangeCalendar
      {...calendarProps}
      calendars={variant === 'mobile' ? 1 : calendars}
      value={value}
      onChange={handleDateChange}
      rangePosition={rangePosition}
      autoFocus={autoFocus}
    />
  );
  const clock = (
    <TimeRangeView
      value={value}
      onChange={onChange}
      rangePosition={rangePosition}
      onRangePositionChange={handlePositionChange}
      variant={variant}
      single
      ampm={ampm}
      ampmInClock={ampmInClock}
      views={views}
      timeSteps={timeSteps}
      minutesStep={minutesStep}
      minTime={minTime}
      maxTime={maxTime}
      shouldDisableTime={shouldDisableTime}
      disableIgnoringDatePartForTimeValidation={disableIgnoringDatePartForTimeValidation}
      skipDisabled={skipDisabled}
      disablePast={calendarProps.disablePast}
      disableFuture={calendarProps.disableFuture}
      disabled={calendarProps.disabled}
      readOnly={calendarProps.readOnly}
      referenceDate={calendarProps.referenceDate}
      localeText={localeText}
    />
  );

  if (variant === 'mobile') {
    return (
      <Box className="TectonDateTimeRangeView-root">
        <Tabs
          value={mobileView}
          onChange={(_, view: 'day' | 'time') => setMobileView(view)}
          variant="fullWidth"
          aria-label={translations.dateTimePickerToolbarTitle}
        >
          <Tab
            value="day"
            icon={<CalendarIcon />}
            aria-label={translations.dateTableLabel}
            id={`${idBase}-day`}
            aria-controls={`${idBase}-panel`}
          />
          <Tab
            value="time"
            icon={<ClockIcon />}
            aria-label={translations.timeTableLabel}
            id={`${idBase}-time`}
            aria-controls={`${idBase}-panel`}
          />
        </Tabs>
        <Box role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-${mobileView}`}>
          {mobileView === 'day' ? calendar : clock}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="TectonDateTimeRangeView-root" sx={{ display: 'flex' }}>
      {calendar}
      <Divider orientation="vertical" flexItem />
      {clock}
    </Box>
  );
}
