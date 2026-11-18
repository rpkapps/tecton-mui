import { fireEvent, screen, within } from '@testing-library/react';
import { TimeRangePicker } from '../index.js';
import { DesktopTimeRangePicker } from '../../DesktopTimeRangePicker/index.js';
import { MobileTimeRangePicker } from '../../MobileTimeRangePicker/index.js';
import { StaticTimeRangePicker } from '../../StaticTimeRangePicker/index.js';
import {
  day,
  days,
  mockMatchMedia,
  renderWithProvider,
  times,
} from '../../internal/range-pickers/tests/testUtils.js';

const REF = day(2026, 0, 1);

function openPicker() {
  fireEvent.click(screen.getByRole('button', { name: /choose range/i }));
  return screen.getByRole('dialog');
}

function columns(dialog: HTMLElement, endpoint: 'Start time' | 'End time') {
  const group = within(dialog).getByRole('group', { name: endpoint });
  return within(group).getAllByRole('listbox');
}

function pick(listbox: HTMLElement, name: string) {
  fireEvent.click(within(listbox).getByRole('option', { name }));
}

describe('DesktopTimeRangePicker', () => {
  it('selects a start and an end time, then accepts and closes', () => {
    const onChange = vi.fn();
    const onAccept = vi.fn();
    renderWithProvider(
      <DesktopTimeRangePicker
        label="Shift"
        referenceDate={REF}
        ampm={false}
        onChange={onChange}
        onAccept={onAccept}
      />,
    );
    const dialog = openPicker();
    const [startHours, startMinutes] = columns(dialog, 'Start time');
    pick(startHours, '9 hours');
    pick(startMinutes, '30 minutes');
    const [endHours, endMinutes] = columns(dialog, 'End time');
    pick(endHours, '17 hours');
    expect(onAccept).not.toHaveBeenCalled();
    pick(endMinutes, '0 minutes');
    expect(onChange.mock.calls.map((call) => times(call[0]))).toEqual([
      ['09:00', null],
      ['09:30', null],
      ['09:30', '17:30'],
      ['09:30', '17:00'],
    ]);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(days(onAccept.mock.calls[0][0])).toEqual(['2026-01-01', '2026-01-01']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Shift' })).toHaveValue('09:30 – 17:00');
  });

  it('finishing the end time with no start stays open and moves to the start', () => {
    const onAccept = vi.fn();
    const onChange = vi.fn();
    renderWithProvider(
      <DesktopTimeRangePicker
        label="Shift"
        referenceDate={REF}
        ampm={false}
        onChange={onChange}
        onAccept={onAccept}
      />,
    );
    const dialog = openPicker();
    const [endHours, endMinutes] = columns(dialog, 'End time');
    pick(endHours, '17 hours');
    pick(endMinutes, '0 minutes');
    expect(onAccept).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(times(onChange.mock.lastCall![0])).toEqual([null, '17:00']);
    const [startHours, startMinutes] = columns(screen.getByRole('dialog'), 'Start time');
    pick(startHours, '9 hours');
    pick(startMinutes, '0 minutes');
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('uses a 12-hour format with AM/PM and the accept button', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <DesktopTimeRangePicker
        ampm
        defaultValue={[day(2026, 0, 1, 9), day(2026, 0, 1, 13)]}
        onAccept={onAccept}
        closeOnSelect={false}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('09:00 AM – 01:00 PM');
    const dialog = openPicker();
    expect(columns(dialog, 'Start time')).toHaveLength(3);
    pick(columns(dialog, 'End time')[0], '3 hours');
    fireEvent.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(times(onAccept.mock.calls[0][0])).toEqual(['09:00', '15:00']);
  });

  it('flags an end before the start as invalidRange', () => {
    const onError = vi.fn();
    renderWithProvider(
      <DesktopTimeRangePicker
        ampm={false}
        defaultValue={[day(2026, 0, 1, 15), day(2026, 0, 1, 9)]}
        onError={onError}
      />,
    );
    expect(onError).toHaveBeenCalledWith(['invalidRange', 'invalidRange'], expect.any(Array));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('respects minTime / maxTime and timeSteps', () => {
    renderWithProvider(
      <DesktopTimeRangePicker
        ampm={false}
        referenceDate={REF}
        minTime={day(2026, 0, 1, 8)}
        maxTime={day(2026, 0, 1, 18)}
        timeSteps={{ minutes: 15 }}
      />,
    );
    const dialog = openPicker();
    const [hours, minutes] = columns(dialog, 'Start time');
    expect(within(hours).getByRole('option', { name: '7 hours' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(within(minutes).getAllByRole('option')).toHaveLength(4);
  });

  it('localeText renames the endpoints', () => {
    renderWithProvider(
      <DesktopTimeRangePicker referenceDate={REF} localeText={{ start: 'Opens', end: 'Closes' }} />,
    );
    const dialog = openPicker();
    expect(within(dialog).getByRole('group', { name: 'Opens' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Closes' })).toBeInTheDocument();
  });
});

describe('MobileTimeRangePicker', () => {
  it('shows tabs for the endpoints and an analog clock', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <MobileTimeRangePicker
        referenceDate={REF}
        ampm={false}
        defaultValue={[day(2026, 0, 1, 9), null]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('textbox'));
    const dialog = screen.getByRole('dialog', { name: 'Select time range' });
    const tabs = within(dialog).getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByRole('tabpanel')).toBeInTheDocument();
    expect(within(dialog).getByRole('listbox')).toBeInTheDocument(); // TimeClock
    fireEvent.click(tabs[1]);
    expect(within(dialog).getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  });
});

describe('StaticTimeRangePicker', () => {
  it('renders inline', () => {
    renderWithProvider(
      <StaticTimeRangePicker displayStaticWrapperAs="desktop" referenceDate={REF} />,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Select time range' })).toBeInTheDocument();
    expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(4);
  });
});

describe('TimeRangePicker (responsive)', () => {
  it('picks the variant from the media query', () => {
    const restore = mockMatchMedia(false);
    renderWithProvider(<TimeRangePicker label="Shift" />);
    expect(screen.getByRole('textbox', { name: 'Shift' })).toHaveAttribute('readonly');
    restore();
  });
});
