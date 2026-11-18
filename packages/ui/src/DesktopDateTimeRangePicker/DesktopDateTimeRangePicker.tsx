'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { DesktopDateTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { DesktopDateTimeRangePickerProps };

/** Date-time range picker with a field and a popover holding a calendar and a clock. */
export const DesktopDateTimeRangePicker = createRangePicker<DesktopDateTimeRangePickerProps>(
  'DesktopDateTimeRangePicker',
  'date-time',
  'desktop',
);

export default DesktopDateTimeRangePicker;
