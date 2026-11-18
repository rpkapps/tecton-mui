'use client';
import { createRangePicker } from '../internal/range-pickers/createPicker.js';
import type { MobileDateTimeRangePickerProps } from '../internal/range-pickers/pickerTypes.js';

export type { MobileDateTimeRangePickerProps };

/** Date-time range picker with a read-only field that opens a modal dialog. */
export const MobileDateTimeRangePicker = createRangePicker<MobileDateTimeRangePickerProps>(
  'MobileDateTimeRangePicker',
  'date-time',
  'mobile',
);

export default MobileDateTimeRangePicker;
