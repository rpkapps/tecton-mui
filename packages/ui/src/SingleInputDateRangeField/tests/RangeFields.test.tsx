import { fireEvent, screen } from '@testing-library/react';
import { SingleInputDateRangeField } from '../index.js';
import { SingleInputTimeRangeField } from '../../SingleInputTimeRangeField/index.js';
import { SingleInputDateTimeRangeField } from '../../SingleInputDateTimeRangeField/index.js';
import { MultiInputDateRangeField } from '../../MultiInputDateRangeField/index.js';
import {
  day,
  days,
  renderWithProvider,
  times,
} from '../../internal/range-pickers/tests/testUtils.js';

describe('SingleInputDateRangeField', () => {
  it('formats the value and shows a placeholder', () => {
    const { unmount } = renderWithProvider(
      <SingleInputDateRangeField label="Stay" defaultValue={[day(2026, 0, 5), day(2026, 0, 9)]} />,
    );
    expect(screen.getByRole('textbox', { name: 'Stay' })).toHaveValue('01/05/2026 – 01/09/2026');
    unmount();
    renderWithProvider(<SingleInputDateRangeField label="Other" />);
    expect(screen.getByRole('textbox', { name: 'Other' })).toHaveAttribute(
      'placeholder',
      'MM/DD/YYYY – MM/DD/YYYY',
    );
  });

  it('labels itself when no label is given', () => {
    renderWithProvider(<SingleInputDateRangeField />);
    expect(screen.getByRole('textbox', { name: 'Choose range' })).toBeInTheDocument();
  });

  it('parses typed text and keeps partial input', () => {
    const onChange = vi.fn();
    renderWithProvider(<SingleInputDateRangeField onChange={onChange} format="yyyy-MM-dd" />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '2026-01-05' } });
    expect(days(onChange.mock.lastCall![0])).toEqual(['2026-01-05', null]);
    fireEvent.change(input, { target: { value: '2026-01-05 - 2026-01-09' } });
    expect(days(onChange.mock.lastCall![0])).toEqual(['2026-01-05', '2026-01-09']);
    fireEvent.blur(input);
    expect(input).toHaveValue('2026-01-05 – 2026-01-09');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange.mock.lastCall![0]).toEqual([null, null]);
  });

  it('keeps invalid text while showing the error', () => {
    const onError = vi.fn();
    renderWithProvider(<SingleInputDateRangeField onError={onError} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '13/45/2026' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('13/45/2026');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onError).toHaveBeenLastCalledWith(['invalidDate', null], expect.any(Array));
  });

  it('follows a controlled value', () => {
    const { rerender } = renderWithProvider(
      <SingleInputDateRangeField value={[day(2026, 0, 5), null]} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('01/05/2026 – ');
    rerender(<SingleInputDateRangeField value={[day(2026, 1, 1), day(2026, 1, 2)]} />);
    expect(screen.getByRole('textbox')).toHaveValue('02/01/2026 – 02/02/2026');
  });

  it('validates shouldDisableDate per position and forwards textField props', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <SingleInputDateRangeField
        onChange={onChange}
        shouldDisableDate={(date, position) => position === 'end' && date.getDay() === 0}
        slotProps={{ textField: { helperText: 'Weekdays only', variant: 'filled' } }}
        disablePast={false}
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '01/04/2026 – 01/04/2026' },
    });
    // Jan 4 2026 is a Sunday: only the end is disabled.
    expect(onChange.mock.lastCall![1].validationError).toEqual([null, 'shouldDisableDate']);
    expect(screen.getByText('Weekdays only')).toBeInTheDocument();
  });
});

describe('SingleInputTimeRangeField', () => {
  it('keeps the existing day when a time is typed', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <SingleInputTimeRangeField
        ampm={false}
        defaultValue={[day(2026, 0, 5, 9), day(2026, 0, 5, 17)]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('09:00 – 17:00');
    fireEvent.change(input, { target: { value: '10:15 – 17:00' } });
    const value = onChange.mock.lastCall![0];
    expect(times(value)).toEqual(['10:15', '17:00']);
    expect(days(value)).toEqual(['2026-01-05', '2026-01-05']);
  });

  it('reports minTime errors', () => {
    const onError = vi.fn();
    renderWithProvider(
      <SingleInputTimeRangeField
        ampm={false}
        minTime={day(2026, 0, 1, 8)}
        defaultValue={[day(2026, 0, 5, 7), day(2026, 0, 5, 9)]}
        onError={onError}
      />,
    );
    expect(onError).toHaveBeenCalledWith(['minTime', null], expect.any(Array));
  });
});

describe('SingleInputDateTimeRangeField', () => {
  it('formats date and time', () => {
    renderWithProvider(
      <SingleInputDateTimeRangeField
        ampm={false}
        defaultValue={[day(2026, 0, 5, 9, 30), day(2026, 0, 6, 18)]}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('01/05/2026 09:30 – 01/06/2026 18:00');
  });
});

describe('MultiInputDateRangeField', () => {
  it('renders one Community field per endpoint with localized labels', () => {
    renderWithProvider(
      <MultiInputDateRangeField
        label="Stay"
        defaultValue={[day(2026, 0, 5), day(2026, 0, 9)]}
        name="stay"
      />,
    );
    expect(screen.getByRole('group', { name: 'Stay' })).toBeInTheDocument();
    expect(screen.getByText('Start', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('End', { selector: 'label' })).toBeInTheDocument();
    const hidden = document.querySelectorAll<HTMLInputElement>('input[name^="stay-"]');
    expect([...hidden].map((input) => input.value)).toEqual(['01/05/2026', '01/09/2026']);
  });

  it('marks both fields invalid for a reversed range', () => {
    const onError = vi.fn();
    renderWithProvider(
      <MultiInputDateRangeField
        defaultValue={[day(2026, 0, 9), day(2026, 0, 5)]}
        onError={onError}
        localeText={{ start: 'From', end: 'To' }}
      />,
    );
    expect(onError).toHaveBeenCalledWith(['invalidRange', 'invalidRange'], expect.any(Array));
    expect(document.querySelectorAll('.Mui-error').length).toBeGreaterThan(0);
    expect(screen.getByText('From', { selector: 'label' })).toBeInTheDocument();
  });

  it('emits changes from the start field', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <MultiInputDateRangeField
        defaultValue={[day(2026, 0, 5), day(2026, 0, 9)]}
        onChange={onChange}
        slotProps={{ textField: (position) => ({ 'data-position': position }) as never }}
      />,
    );
    const startSections = document.querySelectorAll('[data-position="start"] [role="spinbutton"]');
    expect(startSections.length).toBe(3);
    const daySection = startSections[1] as HTMLElement;
    fireEvent.focus(daySection);
    fireEvent.keyDown(daySection, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalled();
    const [start, end] = days(onChange.mock.lastCall![0]);
    expect(start).not.toBe('2026-01-05');
    expect(end).toBe('2026-01-09');
  });
});
