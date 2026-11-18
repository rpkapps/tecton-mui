'use client';
import { createResponsiveRangePicker } from '../internal/range-pickers/createPicker.js';
import type { DateTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';
import { DesktopDateTimeRangePicker } from '../DesktopDateTimeRangePicker/DesktopDateTimeRangePicker.js';
import { MobileDateTimeRangePicker } from '../MobileDateTimeRangePicker/MobileDateTimeRangePicker.js';

export type { DateTimeRangePickerProps };

/**
 * Renders `DesktopDateTimeRangePicker` when `desktopModeMediaQuery` matches (a fine pointer by default) and
 * `MobileDateTimeRangePicker` otherwise.
 */
export const DateTimeRangePicker = createResponsiveRangePicker<DateTimeRangePickerProps>(
  'DateTimeRangePicker',
  DesktopDateTimeRangePicker,
  MobileDateTimeRangePicker,
);

export default DateTimeRangePicker;
