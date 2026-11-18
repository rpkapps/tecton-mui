'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { DesktopTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { DesktopTimeRangePickerProps };

/** Time range picker with a field and a popover holding one digital clock per endpoint. */
export const DesktopTimeRangePicker = createRangePicker<DesktopTimeRangePickerProps>(
  'DesktopTimeRangePicker',
  'time',
  'desktop',
);

export default DesktopTimeRangePicker;
