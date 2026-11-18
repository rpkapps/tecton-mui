'use client';
import { createResponsiveRangePicker } from '../internal/range-pickers/createPicker.js';
import type { TimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';
import { DesktopTimeRangePicker } from '../DesktopTimeRangePicker/DesktopTimeRangePicker.js';
import { MobileTimeRangePicker } from '../MobileTimeRangePicker/MobileTimeRangePicker.js';

export type { TimeRangePickerProps };

/**
 * Renders `DesktopTimeRangePicker` when `desktopModeMediaQuery` matches (a fine pointer by default) and
 * `MobileTimeRangePicker` otherwise.
 */
export const TimeRangePicker = createResponsiveRangePicker<TimeRangePickerProps>(
  'TimeRangePicker',
  DesktopTimeRangePicker,
  MobileTimeRangePicker,
);

export default TimeRangePicker;
