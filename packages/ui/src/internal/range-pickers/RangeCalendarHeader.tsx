'use client';
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import {
  PickersCalendarHeader,
  type PickersCalendarHeaderProps,
} from '@mui/x-date-pickers/PickersCalendarHeader';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import type { PickerValidDate } from '@mui/x-date-pickers/models';
import { CalendarIndexContext, RangeHeaderContext, useRequiredContext } from './contexts.js';

const HIDDEN_ARROW = {
  style: { visibility: 'hidden' as const },
  'aria-hidden': true,
  tabIndex: -1,
};

/**
 * `calendarHeader` slot of each `DateCalendar` in a range calendar. It renders the Community
 * `PickersCalendarHeader` (so the Tecton header overrides apply), keeps the calendar on its month
 * relative to the shared base month, and routes arrow navigation to the shared base month. Only
 * the first calendar shows "previous" and only the last one shows "next".
 */
export function RangeCalendarHeader(props: PickersCalendarHeaderProps) {
  const { onMonthChange, currentMonth, slotProps } = props;
  const adapter = usePickerAdapter();
  const { baseMonth, calendars, setBaseMonth } = useRequiredContext(
    RangeHeaderContext,
    'RangeCalendarHeader',
  );
  const index = React.useContext(CalendarIndexContext);
  const targetMonth = React.useMemo(
    () => adapter.addMonths(baseMonth, index),
    [adapter, baseMonth, index],
  );

  // Moves this DateCalendar to its month through the public header callback.
  useEnhancedEffect(() => {
    if (!adapter.isSameMonth(currentMonth, targetMonth)) {
      onMonthChange(targetMonth);
    }
  }, [adapter, currentMonth, targetMonth, onMonthChange]);

  const handleMonthChange = React.useCallback(
    (month: PickerValidDate) => setBaseMonth(adapter.addMonths(month, -index)),
    [adapter, index, setBaseMonth],
  );

  const headerSlotProps = React.useMemo(
    () => ({
      ...slotProps,
      previousIconButton: index > 0 ? HIDDEN_ARROW : slotProps?.previousIconButton,
      nextIconButton: index < calendars - 1 ? HIDDEN_ARROW : slotProps?.nextIconButton,
    }),
    [slotProps, index, calendars],
  );

  return (
    <PickersCalendarHeader
      {...props}
      onMonthChange={handleMonthChange}
      slotProps={headerSlotProps as PickersCalendarHeaderProps['slotProps']}
    />
  );
}
