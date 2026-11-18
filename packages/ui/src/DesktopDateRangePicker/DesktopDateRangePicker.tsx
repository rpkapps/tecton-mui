'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { DesktopDateRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { DesktopDateRangePickerProps };

/** Date range picker with a field and a popover holding two calendars (by default). */
export const DesktopDateRangePicker = createRangePicker<DesktopDateRangePickerProps>(
  'DesktopDateRangePicker',
  'date',
  'desktop',
);

export default DesktopDateRangePicker;
