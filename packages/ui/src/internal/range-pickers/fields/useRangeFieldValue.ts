import * as React from 'react';
import useControlled from '@mui/utils/useControlled';
import useEventCallback from '@mui/utils/useEventCallback';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import type { PickerRangeValue, RangeValueType } from '../models.js';
import { areRangesEqual, EMPTY_RANGE, getDefaultRangeFormat } from '../utils.js';
import { areErrorsEqual, hasRangeError, NO_RANGE_ERROR, validateRange } from '../validation.js';
import type { RangeFieldProps } from './fieldTypes.js';

/** Value, format and validation state shared by the range fields. */
export function useRangeFieldValue(props: RangeFieldProps, valueType: RangeValueType) {
  const adapter = usePickerAdapter();
  const {
    value: valueProp,
    defaultValue,
    onChange,
    onError,
    format: formatProp,
    ampm: ampmProp,
    error: errorProp,
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    shouldDisableDate,
    minTime,
    maxTime,
    minDateTime,
    maxDateTime,
    minutesStep,
    shouldDisableTime,
    disableIgnoringDatePartForTimeValidation,
  } = props;
  const ampm = ampmProp ?? adapter.is12HourCycleInCurrentLocale();
  const format = formatProp ?? getDefaultRangeFormat(adapter, valueType, ampm);
  const [value, setValueState] = useControlled<PickerRangeValue>({
    controlled: valueProp,
    default: defaultValue ?? EMPTY_RANGE,
    name: 'RangeField',
    state: 'value',
  });

  const validationProps = {
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    shouldDisableDate,
    minTime,
    maxTime,
    minDateTime,
    maxDateTime,
    minutesStep,
    shouldDisableTime,
    disableIgnoringDatePartForTimeValidation,
  };
  const validate = (candidate: PickerRangeValue) =>
    validateRange(adapter, candidate, valueType, validationProps);
  const validationError = validate(value);

  const lastErrorRef = React.useRef(NO_RANGE_ERROR);
  React.useEffect(() => {
    if (!areErrorsEqual(lastErrorRef.current, validationError)) {
      lastErrorRef.current = validationError;
      onError?.(validationError, value);
    }
  });

  const setValue = useEventCallback((next: PickerRangeValue) => {
    if (areRangesEqual(adapter, next, value)) {
      return;
    }
    setValueState(next);
    onChange?.(next, { validationError: validate(next) });
  });

  return {
    adapter,
    value,
    setValue,
    format,
    ampm,
    validationError,
    hasError: errorProp ?? hasRangeError(validationError),
  };
}
