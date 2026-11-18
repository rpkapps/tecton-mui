import * as React from 'react';
import type { PickerValidDate } from '@mui/x-date-pickers/models';
import type { RangeHighlightStore } from './highlightStore.js';

/** Everything a day cell needs. The value is stable for the lifetime of a range calendar. */
export interface RangeDayContextValue {
  store: RangeHighlightStore;
  getKey: (day: PickerValidDate) => number | null;
  onHover: (day: PickerValidDate | null) => void;
  /** User `slots.day`, rendered inside the range wrapper. */
  Day: React.ElementType | undefined;
  /** User `slotProps.day`. */
  dayProps: Record<string, unknown> | undefined;
}

export const RangeDayContext = React.createContext<RangeDayContextValue | null>(null);

/** Month navigation shared by the calendars of one range calendar (changes on navigation only). */
export interface RangeHeaderContextValue {
  /** First day of the month shown by the first calendar. */
  baseMonth: PickerValidDate;
  calendars: number;
  setBaseMonth: (month: PickerValidDate) => void;
}

export const RangeHeaderContext = React.createContext<RangeHeaderContextValue | null>(null);

/** Index of the calendar a header or day belongs to. */
export const CalendarIndexContext = React.createContext(0);

export function useRequiredContext<T>(context: React.Context<T | null>, name: string): T {
  const value = React.useContext(context);
  if (value == null) {
    throw new Error(`Tecton range pickers: ${name} must be rendered inside a DateRangeCalendar.`);
  }
  return value;
}
