'use client';
import * as React from 'react';
import clsx from 'clsx';
import useControlled from '@mui/utils/useControlled';
import useEventCallback from '@mui/utils/useEventCallback';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import Divider from '@mui/material/Divider';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { DateCalendar, type DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import type { PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import type { DateView, PickerValidDate } from '@mui/x-date-pickers/models';
import {
  CalendarIndexContext,
  RangeDayContext,
  RangeHeaderContext,
  type RangeDayContextValue,
  type RangeHeaderContextValue,
} from './contexts.js';
import { createRangeHighlightStore, type RangeHighlightState } from './highlightStore.js';
import type {
  PickerRangeValue,
  RangeDayState,
  RangePosition,
  RangeSelectionState,
} from './models.js';
import { RangeCalendarHeader } from './RangeCalendarHeader.js';
import { RangeDay } from './RangeDay.js';
import {
  applyDayToRange,
  areRangesEqual,
  EMPTY_RANGE,
  getDayKey,
  isRangeComplete,
  isValidDate,
} from './utils.js';
import { validateRange } from './validation.js';

export const dateRangeCalendarClasses = {
  root: 'TectonDateRangeCalendar-root',
  calendar: 'TectonDateRangeCalendar-calendar',
  divider: 'TectonDateRangeCalendar-divider',
} as const;

/** Props of a custom `slots.day` component: the Community day props plus the range state. */
export type DateRangePickerDayProps = PickerDayProps & { rangeState: RangeDayState };

export interface DateRangeCalendarSlots {
  /** Day cell rendered inside the range wrapper. Receives `PickerDayProps` plus `rangeState`. */
  day?: React.ElementType<DateRangePickerDayProps>;
}

export interface DateRangeCalendarSlotProps {
  /** Extra props for every day cell (static object). */
  day?: Partial<PickerDayProps>;
}

export interface DateRangeCalendarProps {
  value?: PickerRangeValue;
  defaultValue?: PickerRangeValue;
  /** Fired on every day selection. `selectionState` is `finish` once the end has been picked. */
  onChange?: (value: PickerRangeValue, selectionState: RangeSelectionState) => void;
  /** Date used to pick the initial month when there is no value. */
  referenceDate?: PickerValidDate;
  /** Number of months shown side by side. @default 2 */
  calendars?: 1 | 2 | 3;
  /** 1-based position of the reference month among the calendars. @default 1 */
  currentMonthCalendarPosition?: 1 | 2 | 3;
  rangePosition?: RangePosition;
  defaultRangePosition?: RangePosition;
  onRangePositionChange?: (position: RangePosition) => void;
  /** Do not move the visible months when the value changes from outside. */
  disableAutoMonthSwitching?: boolean;
  minDate?: PickerValidDate;
  maxDate?: PickerValidDate;
  disablePast?: boolean;
  disableFuture?: boolean;
  /** `position` is the endpoint that the next click edits. */
  shouldDisableDate?: (day: PickerValidDate, position: RangePosition) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Focus the start day (or the first calendar) on mount. */
  autoFocus?: boolean;
  disableHighlightToday?: boolean;
  /** Only applies when `calendars` is 1. */
  showDaysOutsideCurrentMonth?: boolean;
  displayWeekNumber?: boolean;
  fixedWeekNumber?: number;
  dayOfWeekFormatter?: DateCalendarProps['dayOfWeekFormatter'];
  reduceAnimations?: boolean;
  loading?: boolean;
  renderLoading?: () => React.ReactNode;
  /** Fired with the first visible month whenever the visible months change. */
  onMonthChange?: (month: PickerValidDate) => void;
  slots?: DateRangeCalendarSlots;
  slotProps?: DateRangeCalendarSlotProps;
  className?: string;
  sx?: SxProps<Theme>;
}

const DAY_VIEWS: readonly DateView[] = ['day'];
const CALENDAR_SLOTS = { day: RangeDay, calendarHeader: RangeCalendarHeader };

const DateRangeCalendarRoot = styled('div', { name: 'TectonDateRangeCalendar', slot: 'Root' })(({
  theme,
}) => {
  // Themes that space day cells with a column gap (Tecton does) get a continuous range band:
  // each band extends by half the gap on both sides.
  const weekContainer = (
    theme.components as
      | { MuiDayCalendar?: { styleOverrides?: { weekContainer?: { columnGap?: unknown } } } }
      | undefined
  )?.MuiDayCalendar?.styleOverrides?.weekContainer;
  const gap = typeof weekContainer?.columnGap === 'string' ? weekContainer.columnGap : null;
  return {
    display: 'flex',
    flexDirection: 'row',
    ...(gap ? { '--TectonDateRangePickerDay-bleed': `calc(${gap} / 2)` } : null),
  };
});

function useBaseMonth(
  initial: () => PickerValidDate,
  onMonthChange: ((month: PickerValidDate) => void) | undefined,
) {
  const adapter = usePickerAdapter();
  const [baseMonth, setBaseMonthState] = React.useState(initial);
  const baseRef = React.useRef(baseMonth);
  const setBaseMonth = useEventCallback((month: PickerValidDate) => {
    const next = adapter.startOfMonth(month);
    if (adapter.isSameMonth(next, baseRef.current)) {
      return;
    }
    baseRef.current = next;
    setBaseMonthState(next);
    onMonthChange?.(next);
  });
  return { baseMonth, baseRef, setBaseMonth };
}

/**
 * Range calendar built from one Community `DateCalendar` per visible month. Range highlight is
 * kept in an external store read by each day cell (see `RangeDay`), so hovering and selecting do
 * not re-render the calendars.
 */
export const DateRangeCalendar = React.forwardRef<HTMLDivElement, DateRangeCalendarProps>(
  function DateRangeCalendar(props, ref) {
    const adapter = usePickerAdapter();
    const {
      value: valueProp,
      defaultValue,
      onChange,
      referenceDate,
      calendars = 2,
      currentMonthCalendarPosition = 1,
      rangePosition: rangePositionProp,
      defaultRangePosition = 'start',
      onRangePositionChange,
      disableAutoMonthSwitching = false,
      minDate,
      maxDate,
      disablePast,
      disableFuture,
      shouldDisableDate,
      disabled = false,
      readOnly = false,
      autoFocus,
      disableHighlightToday,
      showDaysOutsideCurrentMonth,
      displayWeekNumber,
      fixedWeekNumber,
      dayOfWeekFormatter,
      reduceAnimations,
      loading,
      renderLoading,
      onMonthChange,
      slots,
      slotProps,
      className,
      sx,
    } = props;

    const [value, setValueState] = useControlled<PickerRangeValue>({
      controlled: valueProp,
      default: defaultValue ?? EMPTY_RANGE,
      name: 'DateRangeCalendar',
      state: 'value',
    });
    const [rangePosition, setRangePositionState] = useControlled<RangePosition>({
      controlled: rangePositionProp,
      default: defaultRangePosition,
      name: 'DateRangeCalendar',
      state: 'rangePosition',
    });

    const { baseMonth, baseRef, setBaseMonth } = useBaseMonth(() => {
      const anchor = [value[0], value[1]].find((date) => isValidDate(adapter, date));
      if (anchor) {
        const month = adapter.startOfMonth(anchor);
        // Show an end-only value in the last calendar.
        return anchor === value[1] ? adapter.addMonths(month, -(calendars - 1)) : month;
      }
      const reference = adapter.startOfMonth(referenceDate ?? adapter.date());
      return adapter.addMonths(reference, -(Math.min(currentMonthCalendarPosition, calendars) - 1));
    }, onMonthChange);

    // ---- Highlight store -------------------------------------------------------------------
    const startKey = getDayKey(adapter, value[0]);
    const endKey = getDayKey(adapter, value[1]);
    const [store] = React.useState(() =>
      createRangeHighlightStore({
        start: startKey,
        end: endKey,
        previewStart: null,
        previewEnd: null,
      }),
    );
    // Latest committed props for the stable event callbacks below.
    const latest = React.useRef({ value, rangePosition });
    useEnhancedEffect(() => {
      latest.current = { value, rangePosition };
    });
    const hoveredRef = React.useRef<PickerValidDate | null>(null);
    const interactive = !disabled && !readOnly;

    const isDayDisabled = useEventCallback((day: PickerValidDate) => {
      const position = latest.current.rangePosition;
      const range: PickerRangeValue = position === 'start' ? [day, null] : [null, day];
      const error = validateRange(adapter, range, 'date', {
        minDate,
        maxDate,
        disablePast,
        disableFuture,
        shouldDisableDate,
      });
      return error[position === 'start' ? 0 : 1] != null;
    });

    const computePreview = useEventCallback((): Partial<RangeHighlightState> => {
      const hovered = hoveredRef.current;
      const none = { previewStart: null, previewEnd: null };
      if (!interactive || hovered == null || isDayDisabled(hovered)) {
        return none;
      }
      const { value: current, rangePosition: position } = latest.current;
      const { nextRange } = applyDayToRange(adapter, current, hovered, position);
      if (!isRangeComplete(adapter, nextRange) || areRangesEqual(adapter, nextRange, current)) {
        return none;
      }
      return {
        previewStart: getDayKey(adapter, nextRange[0]),
        previewEnd: getDayKey(adapter, nextRange[1]),
      };
    });

    const handleHover = useEventCallback((day: PickerValidDate | null) => {
      hoveredRef.current = day;
      store.setState(computePreview());
    });

    useEnhancedEffect(() => {
      store.setState({ start: startKey, end: endKey, ...computePreview() });
    }, [store, startKey, endKey, rangePosition, interactive, computePreview]);

    // ---- Auto month switching --------------------------------------------------------------
    const internalChangeRef = React.useRef(false);
    useEnhancedEffect(() => {
      if (internalChangeRef.current) {
        internalChangeRef.current = false;
        return;
      }
      if (disableAutoMonthSwitching) {
        return;
      }
      const base = baseRef.current;
      const lastMonth = adapter.endOfMonth(adapter.addMonths(base, calendars - 1));
      const isVisible = (date: PickerValidDate) =>
        !adapter.isBeforeDay(date, base) && !adapter.isAfterDay(date, lastMonth);
      const [start, end] = latest.current.value;
      if (isValidDate(adapter, start) && !isVisible(start)) {
        setBaseMonth(start);
      } else if (isValidDate(adapter, end) && !isVisible(end)) {
        setBaseMonth(adapter.addMonths(adapter.startOfMonth(end), -(calendars - 1)));
      }
    }, [startKey, endKey]);

    // ---- Selection -------------------------------------------------------------------------
    const handleDayChange = useEventCallback((day: PickerValidDate | null) => {
      if (day == null || !interactive) {
        return;
      }
      const { value: current, rangePosition: position } = latest.current;
      const { nextRange, nextPosition } = applyDayToRange(adapter, current, day, position);
      const selectionState: RangeSelectionState =
        position === 'end' && isRangeComplete(adapter, nextRange) ? 'finish' : 'partial';
      internalChangeRef.current = true;
      latest.current = { value: nextRange, rangePosition: nextPosition };
      setValueState(nextRange);
      setRangePositionState(nextPosition);
      onChange?.(nextRange, selectionState);
      if (nextPosition !== position) {
        onRangePositionChange?.(nextPosition);
      }
    });

    const monthChangeHandlers = React.useMemo(
      () =>
        Array.from(
          { length: calendars },
          (_, index) => (month: PickerValidDate) => setBaseMonth(adapter.addMonths(month, -index)),
        ),
      [adapter, calendars, setBaseMonth],
    );

    const calendarShouldDisableDate = React.useMemo(
      () =>
        shouldDisableDate
          ? (day: PickerValidDate) => shouldDisableDate(day, rangePosition)
          : undefined,
      [shouldDisableDate, rangePosition],
    );

    // ---- Contexts (stable values) ----------------------------------------------------------
    const getKey = React.useCallback((day: PickerValidDate) => getDayKey(adapter, day), [adapter]);
    const userDay = slots?.day as React.ElementType | undefined;
    const userDayProps = slotProps?.day as Record<string, unknown> | undefined;
    const dayContext = React.useMemo<RangeDayContextValue>(
      () => ({ store, getKey, onHover: handleHover, Day: userDay, dayProps: userDayProps }),
      [store, getKey, handleHover, userDay, userDayProps],
    );
    const headerContext = React.useMemo<RangeHeaderContextValue>(
      () => ({ baseMonth, calendars, setBaseMonth }),
      [baseMonth, calendars, setBaseMonth],
    );

    // Reference date per calendar: only read on mount of each DateCalendar.
    const referenceDates = React.useMemo(
      () =>
        Array.from({ length: calendars }, (_, index) => {
          const month = adapter.addMonths(baseMonth, index);
          const start = value[0];
          return isValidDate(adapter, start) && adapter.isSameMonth(start, month)
            ? adapter.startOfDay(start)
            : month;
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [adapter, calendars],
    );
    const start = value[0];
    const focusIndex = isValidDate(adapter, start)
      ? Math.max(
          0,
          referenceDates.findIndex((date) => adapter.isSameMonth(date, start)),
        )
      : 0;

    const clearHover = React.useCallback(() => handleHover(null), [handleHover]);

    return (
      <RangeDayContext.Provider value={dayContext}>
        <RangeHeaderContext.Provider value={headerContext}>
          <DateRangeCalendarRoot
            ref={ref}
            className={clsx(dateRangeCalendarClasses.root, className)}
            sx={sx}
            onMouseLeave={clearHover}
          >
            {referenceDates.map((reference, index) => (
              <React.Fragment key={index}>
                {index > 0 ? (
                  <Divider
                    orientation="vertical"
                    flexItem
                    className={dateRangeCalendarClasses.divider}
                  />
                ) : null}
                <CalendarIndexContext.Provider value={index}>
                  <DateCalendar
                    className={dateRangeCalendarClasses.calendar}
                    value={null}
                    referenceDate={reference}
                    onChange={handleDayChange}
                    onMonthChange={monthChangeHandlers[index]}
                    views={DAY_VIEWS}
                    openTo="day"
                    slots={CALENDAR_SLOTS}
                    minDate={minDate}
                    maxDate={maxDate}
                    disablePast={disablePast}
                    disableFuture={disableFuture}
                    shouldDisableDate={calendarShouldDisableDate}
                    disabled={disabled}
                    readOnly={readOnly}
                    autoFocus={autoFocus && index === focusIndex}
                    disableHighlightToday={disableHighlightToday}
                    showDaysOutsideCurrentMonth={calendars === 1 && showDaysOutsideCurrentMonth}
                    displayWeekNumber={displayWeekNumber}
                    fixedWeekNumber={fixedWeekNumber}
                    dayOfWeekFormatter={dayOfWeekFormatter}
                    reduceAnimations={reduceAnimations}
                    loading={loading}
                    renderLoading={renderLoading}
                  />
                </CalendarIndexContext.Provider>
              </React.Fragment>
            ))}
          </DateRangeCalendarRoot>
        </RangeHeaderContext.Provider>
      </RangeDayContext.Provider>
    );
  },
);
