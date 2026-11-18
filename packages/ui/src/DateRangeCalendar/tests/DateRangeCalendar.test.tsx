import * as React from 'react';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';
import {
  DateRangeCalendar,
  dateRangePickerDayClasses,
  type DateRangePickerDayProps,
  type DateRange,
} from '../index.js';
import { day, days, renderWithProvider } from '../../internal/range-pickers/tests/testUtils.js';

const JAN_2026 = day(2026, 0, 1);
// State class of a selected PickerDay (global or component-scoped depending on the class generator).
const SELECTED = /\b(Mui|MuiPickerDay)-selected\b/;

function grid(label: string) {
  return screen.getByRole('grid', { name: label });
}

function cell(gridLabel: string, dayNumber: number) {
  return within(grid(gridLabel)).getByRole('gridcell', { name: String(dayNumber) });
}

function selectedDays(gridLabel: string) {
  return within(grid(gridLabel))
    .getAllByRole('gridcell')
    .filter((element) => element.getAttribute('aria-selected') === 'true')
    .map((element) => Number(element.textContent));
}

describe('DateRangeCalendar', () => {
  it('renders two consecutive months by default', () => {
    renderWithProvider(<DateRangeCalendar referenceDate={JAN_2026} />);
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    expect(grid('January 2026')).toBeInTheDocument();
    expect(grid('February 2026')).toBeInTheDocument();
  });

  it.each([1, 3] as const)('renders %i calendars', (calendars) => {
    renderWithProvider(<DateRangeCalendar referenceDate={JAN_2026} calendars={calendars} />);
    expect(screen.getAllByRole('grid')).toHaveLength(calendars);
  });

  it('places the reference month at currentMonthCalendarPosition', () => {
    renderWithProvider(
      <DateRangeCalendar referenceDate={JAN_2026} calendars={3} currentMonthCalendarPosition={2} />,
    );
    const labels = screen
      .getAllByRole('grid')
      .map((element) => element.getAttribute('aria-labelledby'));
    expect(labels.map((id) => document.getElementById(id!)?.textContent)).toEqual([
      'December 2025',
      'January 2026',
      'February 2026',
    ]);
  });

  it('opens on the month of the value start', () => {
    renderWithProvider(<DateRangeCalendar defaultValue={[day(2026, 4, 3), day(2026, 4, 9)]} />);
    expect(grid('May 2026')).toBeInTheDocument();
    expect(selectedDays('May 2026')).toEqual([3, 4, 5, 6, 7, 8, 9]);
  });

  it('shows an end-only value in the last calendar', () => {
    renderWithProvider(<DateRangeCalendar defaultValue={[null, day(2026, 4, 9)]} />);
    expect(grid('April 2026')).toBeInTheDocument();
    expect(grid('May 2026')).toBeInTheDocument();
  });

  it('selects a start then an end, marking the range with aria-selected', () => {
    const onChange = vi.fn();
    const onRangePositionChange = vi.fn();
    renderWithProvider(
      <DateRangeCalendar
        referenceDate={JAN_2026}
        onChange={onChange}
        onRangePositionChange={onRangePositionChange}
      />,
    );
    fireEvent.click(cell('January 2026', 28));
    expect(days(onChange.mock.calls[0][0])).toEqual(['2026-01-28', null]);
    expect(onChange.mock.calls[0][1]).toBe('partial');
    expect(onRangePositionChange).toHaveBeenLastCalledWith('end');

    fireEvent.click(cell('February 2026', 2));
    expect(days(onChange.mock.calls[1][0])).toEqual(['2026-01-28', '2026-02-02']);
    expect(onChange.mock.calls[1][1]).toBe('finish');
    expect(onRangePositionChange).toHaveBeenLastCalledWith('start');

    expect(selectedDays('January 2026')).toEqual([28, 29, 30, 31]);
    expect(selectedDays('February 2026')).toEqual([1, 2]);
    expect(cell('January 2026', 28).className).toMatch(SELECTED);
    expect(cell('January 2026', 29).className).not.toMatch(SELECTED);
    expect(cell('January 2026', 29).parentElement).toHaveClass(dateRangePickerDayClasses.inRange);
    expect(cell('January 2026', 28).parentElement).toHaveClass(
      dateRangePickerDayClasses.rangeStart,
      dateRangePickerDayClasses.startBand,
    );
  });

  it('restarts the range when the end is picked before the start (reversed selection)', () => {
    const onChange = vi.fn();
    renderWithProvider(<DateRangeCalendar referenceDate={JAN_2026} onChange={onChange} />);
    fireEvent.click(cell('January 2026', 20));
    fireEvent.click(cell('January 2026', 10));
    expect(days(onChange.mock.calls[1][0])).toEqual(['2026-01-10', null]);
    expect(onChange.mock.calls[1][1]).toBe('partial');
    fireEvent.click(cell('January 2026', 15));
    expect(days(onChange.mock.calls[2][0])).toEqual(['2026-01-10', '2026-01-15']);
  });

  it('drops the end when a new start is picked after it', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 5), day(2026, 0, 8)]}
        defaultRangePosition="start"
        onChange={onChange}
      />,
    );
    fireEvent.click(cell('January 2026', 12));
    expect(days(onChange.mock.calls[0][0])).toEqual(['2026-01-12', null]);
    fireEvent.click(cell('January 2026', 14));
    expect(days(onChange.mock.calls[1][0])).toEqual(['2026-01-12', '2026-01-14']);
  });

  it('keeps the time of the edited endpoint', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 5, 9, 30), day(2026, 0, 8, 17, 15)]}
        rangePosition="end"
        onChange={onChange}
      />,
    );
    fireEvent.click(cell('January 2026', 10));
    const [, end] = onChange.mock.calls[0][0] as DateRange<Date>;
    expect(end!.getDate()).toBe(10);
    expect([end!.getHours(), end!.getMinutes()]).toEqual([17, 15]);
  });

  it('disables days outside minDate/maxDate and via shouldDisableDate(day, position)', () => {
    const shouldDisableDate = vi.fn(
      (date: Date, position: 'start' | 'end') => position === 'end' && date.getDate() === 20,
    );
    renderWithProvider(
      <DateRangeCalendar
        referenceDate={JAN_2026}
        calendars={1}
        minDate={day(2026, 0, 5)}
        maxDate={day(2026, 0, 25)}
        shouldDisableDate={shouldDisableDate}
      />,
    );
    expect(cell('January 2026', 4)).toBeDisabled();
    expect(cell('January 2026', 26)).toBeDisabled();
    expect(cell('January 2026', 20)).not.toBeDisabled();
    expect(shouldDisableDate).toHaveBeenCalledWith(expect.any(Date), 'start');

    fireEvent.click(cell('January 2026', 10));
    expect(shouldDisableDate).toHaveBeenCalledWith(expect.any(Date), 'end');
    expect(cell('January 2026', 20)).toBeDisabled();
  });

  it('disables past and future days', () => {
    const today = new Date();
    const { unmount } = renderWithProvider(
      <DateRangeCalendar calendars={1} referenceDate={today} disablePast />,
    );
    const label = screen.getByRole('grid').getAttribute('aria-labelledby')!;
    const monthLabel = document.getElementById(label)!.textContent!;
    if (today.getDate() > 1) {
      expect(cell(monthLabel, today.getDate() - 1)).toBeDisabled();
    }
    expect(cell(monthLabel, today.getDate())).not.toBeDisabled();
    unmount();
    renderWithProvider(<DateRangeCalendar calendars={1} referenceDate={today} disableFuture />);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() < lastDay) {
      expect(cell(monthLabel, today.getDate() + 1)).toBeDisabled();
    }
  });

  it('is controlled by value', () => {
    const onChange = vi.fn();
    const value: DateRange<Date> = [day(2026, 0, 5), day(2026, 0, 7)];
    const { rerender } = renderWithProvider(
      <DateRangeCalendar value={value} onChange={onChange} defaultRangePosition="start" />,
    );
    fireEvent.click(cell('January 2026', 12));
    expect(onChange).toHaveBeenCalledTimes(1);
    // The parent did not update the value: the selection is unchanged.
    expect(selectedDays('January 2026')).toEqual([5, 6, 7]);

    rerender(
      <DateRangeCalendar value={[day(2026, 0, 12), day(2026, 0, 13)]} onChange={onChange} />,
    );
    expect(selectedDays('January 2026')).toEqual([12, 13]);
  });

  it('switches months when a controlled value moves out of view', () => {
    const { rerender } = renderWithProvider(
      <DateRangeCalendar value={[day(2026, 0, 5), day(2026, 0, 7)]} />,
    );
    rerender(<DateRangeCalendar value={[day(2026, 5, 3), day(2026, 5, 9)]} />);
    expect(grid('June 2026')).toBeInTheDocument();
    expect(selectedDays('June 2026')).toEqual([3, 4, 5, 6, 7, 8, 9]);
    rerender(<DateRangeCalendar value={[day(2026, 5, 3), day(2026, 9, 9)]} />);
    expect(grid('October 2026')).toBeInTheDocument();
  });

  it('does not switch months with disableAutoMonthSwitching', () => {
    const { rerender } = renderWithProvider(
      <DateRangeCalendar value={[day(2026, 0, 5), day(2026, 0, 7)]} disableAutoMonthSwitching />,
    );
    rerender(
      <DateRangeCalendar value={[day(2026, 5, 3), day(2026, 5, 9)]} disableAutoMonthSwitching />,
    );
    expect(grid('January 2026')).toBeInTheDocument();
  });

  it('navigates all calendars together; only the edge calendars show arrows', () => {
    const onMonthChange = vi.fn();
    renderWithProvider(
      <DateRangeCalendar referenceDate={JAN_2026} calendars={3} onMonthChange={onMonthChange} />,
    );
    // Hidden arrows are removed from the accessibility tree.
    expect(screen.getAllByRole('button', { name: /next month/i })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /previous month/i })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(grid('February 2026')).toBeInTheDocument();
    expect(grid('April 2026')).toBeInTheDocument();
    expect(screen.queryByRole('grid', { name: 'January 2026' })).not.toBeInTheDocument();
    expect(days([onMonthChange.mock.calls[0][0]])).toEqual(['2026-02-01']);

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(grid('December 2025')).toBeInTheDocument();
  });

  it('follows keyboard navigation across months', () => {
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 31), null]}
        calendars={2}
        autoFocus
        reduceAnimations
      />,
    );
    expect(cell('January 2026', 31)).toHaveFocus();
    fireEvent.keyDown(cell('January 2026', 31), { key: 'ArrowRight' });
    expect(cell('February 2026', 1)).toHaveFocus();
    expect(grid('March 2026')).toBeInTheDocument();
  });

  it('ignores clicks when readOnly or disabled', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProvider(
      <DateRangeCalendar referenceDate={JAN_2026} readOnly onChange={onChange} />,
    );
    fireEvent.click(cell('January 2026', 10));
    rerender(<DateRangeCalendar referenceDate={JAN_2026} disabled onChange={onChange} />);
    expect(cell('January 2026', 10)).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('previews the range on hover and clears it on mouse leave', () => {
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 5), null]}
        defaultRangePosition="end"
        calendars={1}
      />,
    );
    fireEvent.mouseEnter(cell('January 2026', 8));
    const wrapper = (n: number) => cell('January 2026', n).parentElement!;
    expect(wrapper(5)).toHaveClass(dateRangePickerDayClasses.previewStart);
    expect(wrapper(6)).toHaveClass(dateRangePickerDayClasses.inPreview);
    expect(wrapper(8)).toHaveClass(dateRangePickerDayClasses.previewEnd);
    expect(wrapper(9)).not.toHaveClass(dateRangePickerDayClasses.inPreview);

    fireEvent.mouseLeave(screen.getByRole('grid').closest('.TectonDateRangeCalendar-root')!);
    expect(wrapper(6)).not.toHaveClass(dateRangePickerDayClasses.inPreview);

    // Keyboard focus previews too; a disabled or unchanged target shows nothing.
    fireEvent.focus(cell('January 2026', 3));
    expect(wrapper(3)).not.toHaveClass(dateRangePickerDayClasses.previewStart);
  });

  it('shows days outside the month only with one calendar', () => {
    renderWithProvider(
      <DateRangeCalendar referenceDate={JAN_2026} calendars={1} showDaysOutsideCurrentMonth />,
    );
    // January 2026 starts on a Thursday: Dec 28 – 31 are visible.
    expect(within(grid('January 2026')).getAllByRole('gridcell', { name: '31' })).toHaveLength(2);
  });

  it('passes the range state to a custom day slot', () => {
    const seen: string[] = [];
    function CustomDay({ rangeState, ...props }: DateRangePickerDayProps) {
      if (rangeState.isInRange) {
        seen.push(String(props.day.getDate()));
      }
      return <PickerDay {...props} data-custom="" />;
    }
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 5), day(2026, 0, 7)]}
        calendars={1}
        slots={{ day: CustomDay }}
        slotProps={{ day: { disableRipple: true } }}
      />,
    );
    expect(cell('January 2026', 6)).toHaveAttribute('data-custom');
    expect(seen).toContain('6');
  });
});

describe('RangeDay outside a range calendar', () => {
  it('throws a helpful error', async () => {
    const { RangeDay } = await import('../../internal/range-pickers/RangeDay.js');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderWithProvider(
        <RangeDay day={JAN_2026} onDaySelect={() => {}} outsideCurrentMonth={false} />,
      ),
    ).toThrow(/inside a DateRangeCalendar/);
    spy.mockRestore();
  });
});

describe('DateRangeCalendar re-render budget', () => {
  let renders = 0;
  const rendered: number[] = [];
  function CountingDay({ rangeState: _rangeState, ...props }: DateRangePickerDayProps) {
    renders += 1;
    rendered.push((props.day as Date).getDate());
    return <PickerDay {...props} />;
  }
  const SLOTS = { day: CountingDay };

  function reset() {
    renders = 0;
    rendered.length = 0;
  }

  it('re-renders only the days whose highlight changes on hover', () => {
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 5), null]}
        defaultRangePosition="end"
        slots={SLOTS}
      />,
    );
    const totalCells = screen.getAllByRole('gridcell').length;
    expect(totalCells).toBeGreaterThan(50);

    reset();
    fireEvent.mouseEnter(cell('January 2026', 10));
    // 5 (preview start), 6–9 (in preview), 10 (preview end).
    expect(renders).toBe(6);
    expect([...rendered].sort((a, b) => a - b)).toEqual([5, 6, 7, 8, 9, 10]);

    reset();
    fireEvent.mouseEnter(cell('January 2026', 11));
    // Only 10 (end -> inside) and 11 (new end) change.
    expect([...rendered].sort((a, b) => a - b)).toEqual([10, 11]);

    reset();
    fireEvent.mouseEnter(cell('January 2026', 11));
    expect(renders).toBe(0);

    reset();
    fireEvent.mouseLeave(screen.getAllByRole('grid')[0].closest('.TectonDateRangeCalendar-root')!);
    expect(renders).toBe(7);
  });

  it('keeps unrelated days untouched when the value changes', () => {
    renderWithProvider(
      <DateRangeCalendar
        defaultValue={[day(2026, 0, 5), null]}
        defaultRangePosition="end"
        slots={SLOTS}
      />,
    );
    fireEvent.mouseEnter(cell('January 2026', 8));
    reset();
    act(() => {
      fireEvent.click(cell('January 2026', 8));
    });
    // Days 5–8 switch from preview to selected; a couple more may change focusability.
    expect(renders).toBeLessThanOrEqual(12);
    expect(rendered).not.toContain(20);
  });

  it('keeps day renders stable when the parent re-renders', () => {
    function Parent() {
      const [count, setCount] = React.useState(0);
      return (
        <>
          <button type="button" onClick={() => setCount(count + 1)}>
            bump {count}
          </button>
          <DateRangeCalendar referenceDate={JAN_2026} slots={SLOTS} />
        </>
      );
    }
    renderWithProvider(<Parent />);
    reset();
    fireEvent.click(screen.getByRole('button', { name: /bump/ }));
    expect(renders).toBe(0);
  });
});
