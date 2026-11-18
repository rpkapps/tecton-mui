'use client';
import { createResponsiveRangePicker } from '../internal/range-pickers/createPicker.js';
import type { DateRangePickerProps } from '../internal/range-pickers/pickerTypes.js';
import { DesktopDateRangePicker } from '../DesktopDateRangePicker/DesktopDateRangePicker.js';
import { MobileDateRangePicker } from '../MobileDateRangePicker/MobileDateRangePicker.js';

export type { DateRangePickerProps };

/**
 * Renders `DesktopDateRangePicker` when `desktopModeMediaQuery` matches (a fine pointer by default) and
 * `MobileDateRangePicker` otherwise.
 */
export const DateRangePicker = createResponsiveRangePicker<DateRangePickerProps>(
  'DateRangePicker',
  DesktopDateRangePicker,
  MobileDateRangePicker,
);

export default DateRangePicker;
