import { validateDate, validateDateTime, validateTime } from '@mui/x-date-pickers/validation';
import type { MuiPickersAdapter, PickerValidDate, TimeView } from '@mui/x-date-pickers/models';
import type { PickerRangeValue, RangePosition, RangeValueType } from './models.js';
import { isValidDate } from './utils.js';

/** Validation props shared by every range component (each one uses the subset that applies). */
export interface RangeValidationProps {
  minDate?: PickerValidDate;
  maxDate?: PickerValidDate;
  disablePast?: boolean;
  disableFuture?: boolean;
  /** Return `true` to disable a day. `position` is the endpoint being validated or edited. */
  shouldDisableDate?: (day: PickerValidDate, position: RangePosition) => boolean;
  minTime?: PickerValidDate;
  maxTime?: PickerValidDate;
  minDateTime?: PickerValidDate;
  maxDateTime?: PickerValidDate;
  minutesStep?: number;
  shouldDisableTime?: (value: PickerValidDate, view: TimeView, position: RangePosition) => boolean;
  disableIgnoringDatePartForTimeValidation?: boolean;
}

export type RangeEndpointError = string | null;
export type RangeError = [RangeEndpointError, RangeEndpointError];

export const NO_RANGE_ERROR: RangeError = [null, null];

/** Defaults of the Community pickers, needed because the public validators require them. */
function defaultBounds(adapter: MuiPickersAdapter) {
  return {
    minDate: adapter.date('1900-01-01T00:00:00.000'),
    maxDate: adapter.date('2099-12-31T00:00:00.000'),
  };
}

/** Validates both endpoints with the Community validators, then checks their order. */
export function validateRange(
  adapter: MuiPickersAdapter,
  value: PickerRangeValue,
  valueType: RangeValueType,
  props: RangeValidationProps,
): RangeError {
  const bounds = defaultBounds(adapter);
  const timezone = 'default';
  const validateEndpoint = (date: PickerValidDate | null, position: RangePosition) => {
    if (date == null) {
      return null;
    }
    const shouldDisableDate = props.shouldDisableDate
      ? (day: PickerValidDate) => props.shouldDisableDate!(day, position)
      : undefined;
    const shouldDisableTime = props.shouldDisableTime
      ? (time: PickerValidDate, view: TimeView) => props.shouldDisableTime!(time, view, position)
      : undefined;
    const common = {
      disablePast: props.disablePast ?? false,
      disableFuture: props.disableFuture ?? false,
    };
    if (valueType === 'date') {
      return validateDate({
        adapter,
        value: date,
        timezone,
        props: {
          ...common,
          minDate: props.minDate ?? bounds.minDate,
          maxDate: props.maxDate ?? bounds.maxDate,
          shouldDisableDate,
        },
      });
    }
    const timeProps = {
      ...common,
      minTime: props.minTime,
      maxTime: props.maxTime,
      minutesStep: props.minutesStep,
      shouldDisableTime,
      disableIgnoringDatePartForTimeValidation: props.disableIgnoringDatePartForTimeValidation,
    };
    if (valueType === 'time') {
      return validateTime({ adapter, value: date, timezone, props: timeProps });
    }
    const error = validateDateTime({
      adapter,
      value: date,
      timezone,
      props: {
        ...timeProps,
        minDate: props.minDate ?? bounds.minDate,
        maxDate: props.maxDate ?? bounds.maxDate,
        shouldDisableDate,
      },
    });
    if (error != null) {
      return error;
    }
    // `minDateTime` / `maxDateTime` bind a moment, not a time of day.
    if (props.minDateTime && adapter.isBefore(date, props.minDateTime)) {
      return adapter.isBeforeDay(date, props.minDateTime) ? 'minDate' : 'minTime';
    }
    if (props.maxDateTime && adapter.isAfter(date, props.maxDateTime)) {
      return adapter.isAfterDay(date, props.maxDateTime) ? 'maxDate' : 'maxTime';
    }
    return null;
  };

  const startError = validateEndpoint(value[0], 'start');
  const endError = validateEndpoint(value[1], 'end');
  if (startError != null || endError != null) {
    return [startError, endError];
  }
  const [start, end] = value;
  if (isValidDate(adapter, start) && isValidDate(adapter, end) && adapter.isAfter(start, end)) {
    return ['invalidRange', 'invalidRange'];
  }
  return NO_RANGE_ERROR;
}

export function hasRangeError(error: RangeError) {
  return error[0] != null || error[1] != null;
}

export function areErrorsEqual(a: RangeError, b: RangeError) {
  return a[0] === b[0] && a[1] === b[1];
}
