'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { StaticDateRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { StaticDateRangePickerProps };

/** Date range picker rendered inline, without a field or popup. */
export const StaticDateRangePicker = createRangePicker<StaticDateRangePickerProps>(
  'StaticDateRangePicker',
  'date',
  'static',
);

export default StaticDateRangePicker;
