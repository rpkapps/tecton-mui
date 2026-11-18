'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import { usePickerAdapter, usePickerTranslations } from '@mui/x-date-pickers/hooks';
import type { PickerValidDate, TimeStepOptions, TimeView } from '@mui/x-date-pickers/models';
import type { PickerRangeValue, RangePosition, RangeSelectionState } from './models.js';
import { formatEndpoint, isValidDate, positionIndex } from './utils.js';

/** Props of the time part of the time and date-time range pickers. */
export interface TimeRangeViewOptions {
  /** 12-hour clock with AM/PM. Defaults to the locale's cycle. */
  ampm?: boolean;
  /** Mobile clock: show the AM/PM buttons inside the clock. @default true */
  ampmInClock?: boolean;
  /** Time units to edit. @default ['hours', 'minutes'] */
  views?: readonly TimeView[];
  /** Step of each digital clock column. @default { hours: 1, minutes: 5, seconds: 5 } */
  timeSteps?: TimeStepOptions;
  /** Only minutes that are a multiple of this are valid. @default 1 */
  minutesStep?: number;
  minTime?: PickerValidDate;
  maxTime?: PickerValidDate;
  shouldDisableTime?: (value: PickerValidDate, view: TimeView, position: RangePosition) => boolean;
  disableIgnoringDatePartForTimeValidation?: boolean;
  /** Hide disabled options in the digital clocks. */
  skipDisabled?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
}

export interface TimeRangeViewProps extends TimeRangeViewOptions {
  value: PickerRangeValue;
  onChange: (
    value: PickerRangeValue,
    selectionState: RangeSelectionState,
    position: RangePosition,
  ) => void;
  rangePosition: RangePosition;
  onRangePositionChange: (position: RangePosition) => void;
  variant: 'desktop' | 'mobile';
  /** Show only the clock of the active endpoint (used by the date-time range picker). */
  single?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  referenceDate?: PickerValidDate;
  localeText?: { start?: string; end?: string };
}

const DEFAULT_VIEWS: readonly TimeView[] = ['hours', 'minutes'];

/** Desktop: one Community digital clock per endpoint. Mobile: tabs plus the analog clock. */
export function TimeRangeView(props: TimeRangeViewProps) {
  const {
    value,
    onChange,
    rangePosition,
    onRangePositionChange,
    variant,
    single = false,
    ampm: ampmProp,
    ampmInClock = true,
    views = DEFAULT_VIEWS,
    timeSteps,
    minutesStep,
    minTime,
    maxTime,
    shouldDisableTime,
    disableIgnoringDatePartForTimeValidation,
    skipDisabled,
    disablePast,
    disableFuture,
    disabled,
    readOnly,
    autoFocus,
    referenceDate,
    localeText,
  } = props;
  const adapter = usePickerAdapter();
  const translations = usePickerTranslations();
  const ampm = ampmProp ?? adapter.is12HourCycleInCurrentLocale();
  const timeFormat = ampm ? adapter.formats.fullTime12h : adapter.formats.fullTime24h;
  const labels = {
    start: localeText?.start ?? translations.startTime,
    end: localeText?.end ?? translations.endTime,
  };
  const idBase = React.useId();

  // The end was finished while the start was empty: finishing the start then completes the range.
  const [endFirst, setEndFirst] = React.useState(false);
  const handleChange = (
    position: RangePosition,
    date: PickerValidDate | null,
    selectionState: RangeSelectionState | undefined,
  ) => {
    const index = positionIndex(position);
    const next: PickerRangeValue = index === 0 ? [date, value[1]] : [value[0], date];
    const finished = selectionState === 'finish';
    // Finishing the start moves to the end, unless the end was finished first (start was empty).
    if (finished && position === 'start' && !(endFirst && isValidDate(adapter, next[1]))) {
      onChange(next, 'partial', position);
      onRangePositionChange('end');
      return;
    }
    const complete = isValidDate(adapter, next[0]) && isValidDate(adapter, next[1]);
    if (finished && !complete) {
      // Finishing one end of an incomplete range moves to the missing end instead of closing.
      onChange(next, 'partial', position);
      const missing: RangePosition = isValidDate(adapter, next[0]) ? 'end' : 'start';
      setEndFirst(position === 'end');
      if (missing !== position) onRangePositionChange(missing);
      return;
    }
    if (finished && endFirst) setEndFirst(false);
    onChange(next, selectionState ?? 'partial', position);
  };

  const referenceFor = (position: RangePosition) => {
    if (position === 'end' && isValidDate(adapter, value[0])) {
      return value[0];
    }
    return referenceDate;
  };

  const clockProps = (position: RangePosition) => ({
    value: value[positionIndex(position)],
    referenceDate: referenceFor(position),
    onChange: (date: PickerValidDate | null, state?: RangeSelectionState) =>
      handleChange(position, date, state),
    ampm,
    minTime,
    maxTime,
    minutesStep,
    shouldDisableTime: shouldDisableTime
      ? (time: PickerValidDate, view: TimeView) => shouldDisableTime(time, view, position)
      : undefined,
    disableIgnoringDatePartForTimeValidation,
    disablePast,
    disableFuture,
    disabled,
    readOnly,
  });

  if (variant === 'mobile' || single) {
    const tabs = single ? null : (
      <Tabs
        value={rangePosition}
        onChange={(_, position: RangePosition) => onRangePositionChange(position)}
        variant="fullWidth"
        aria-label={translations.timeRangePickerToolbarTitle}
      >
        {(['start', 'end'] as const).map((position) => (
          <Tab
            key={position}
            value={position}
            id={`${idBase}-tab-${position}`}
            aria-controls={`${idBase}-panel`}
            label={`${labels[position]}${
              value[positionIndex(position)]
                ? ` ${formatEndpoint(adapter, value[positionIndex(position)], timeFormat)}`
                : ''
            }`}
          />
        ))}
      </Tabs>
    );
    return (
      <Box className="TectonTimeRangeView-root">
        {tabs}
        <Box
          role={single ? undefined : 'tabpanel'}
          id={`${idBase}-panel`}
          aria-labelledby={single ? undefined : `${idBase}-tab-${rangePosition}`}
        >
          {variant === 'mobile' ? (
            <TimeClock
              key={rangePosition}
              {...clockProps(rangePosition)}
              views={views}
              ampmInClock={ampmInClock}
              autoFocus={autoFocus}
            />
          ) : (
            <MultiSectionDigitalClock
              key={rangePosition}
              {...clockProps(rangePosition)}
              aria-label={labels[rangePosition]}
              views={views}
              timeSteps={timeSteps}
              skipDisabled={skipDisabled}
              autoFocus={autoFocus}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="TectonTimeRangeView-root" sx={{ display: 'flex' }}>
      {(['start', 'end'] as const).map((position, index) => (
        <React.Fragment key={position}>
          {index > 0 ? <Divider orientation="vertical" flexItem /> : null}
          <Box
            role="group"
            aria-labelledby={`${idBase}-${position}`}
            onFocus={() => {
              if (position !== rangePosition) {
                onRangePositionChange(position);
              }
            }}
          >
            <Typography
              id={`${idBase}-${position}`}
              variant="subtitle2"
              sx={{ px: 2, pt: 1.5, pb: 0.5 }}
            >
              {labels[position]}
            </Typography>
            <MultiSectionDigitalClock
              {...clockProps(position)}
              views={views}
              timeSteps={timeSteps}
              skipDisabled={skipDisabled}
              autoFocus={autoFocus && position === rangePosition}
            />
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
}
