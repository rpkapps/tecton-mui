'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { MobileDateRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { MobileDateRangePickerProps };

/** Date range picker with a read-only field that opens a modal dialog. */
export const MobileDateRangePicker = createRangePicker<MobileDateRangePickerProps>(
  'MobileDateRangePicker',
  'date',
  'mobile',
);

export default MobileDateRangePicker;
