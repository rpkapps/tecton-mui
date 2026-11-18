'use client';
import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import {
  DateRangeCalendar as DateRangeCalendarBase,
  type DateRangeCalendarProps,
} from '../internal/range-pickers/DateRangeCalendar.js';

export type { DateRangeCalendarProps };

/** One Community `DateCalendar` per visible month with range selection and hover preview. */
export const DateRangeCalendar = React.forwardRef<HTMLDivElement, DateRangeCalendarProps>(
  function DateRangeCalendar(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiDateRangeCalendar' });
    return <DateRangeCalendarBase {...props} ref={ref} />;
  },
);

export default DateRangeCalendar;
