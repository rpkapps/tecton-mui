'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { MobileTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { MobileTimeRangePickerProps };

/** Time range picker with a read-only field that opens a dialog with an analog clock. */
export const MobileTimeRangePicker = createRangePicker<MobileTimeRangePickerProps>(
  'MobileTimeRangePicker',
  'time',
  'mobile',
);

export default MobileTimeRangePicker;
