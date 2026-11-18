'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { StaticTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { StaticTimeRangePickerProps };

/** Time range picker rendered inline, without a field or popup. */
export const StaticTimeRangePicker = createRangePicker<StaticTimeRangePickerProps>(
  'StaticTimeRangePicker',
  'time',
  'static',
);

export default StaticTimeRangePicker;
