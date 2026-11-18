'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { StaticDateTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { StaticDateTimeRangePickerProps };

/** Date-time range picker rendered inline, without a field or popup. */
export const StaticDateTimeRangePicker = createRangePicker<StaticDateTimeRangePickerProps>(
  'StaticDateTimeRangePicker',
  'date-time',
  'static',
);

export default StaticDateTimeRangePicker;
