import { fireEvent, screen, within } from '@testing-library/react';
import { DateTimeRangePicker } from '../index.js';
import { DesktopDateTimeRangePicker } from '../../DesktopDateTimeRangePicker/index.js';
import { MobileDateTimeRangePicker } from '../../MobileDateTimeRangePicker/index.js';
import { StaticDateTimeRangePicker } from '../../StaticDateTimeRangePicker/index.js';
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

function pick(dialog: HTMLElement, column: number, name: string) {
  const listbox = within(dialog).getAllByRole('listbox')[column];
  fireEvent.click(within(listbox).getByRole('option', { name }));
}

describe('DesktopDateTimeRangePicker', () => {
  it('selects start day and time, then end day and time', () => {
    const onChange = vi.fn();
    const onAccept = vi.fn();
    renderWithProvider(
      <DesktopDateTimeRangePicker
        label="Trip"
        referenceDate={REF}
        ampm={false}
        onChange={onChange}
        onAccept={onAccept}
      />,
    );
    const dialog = openPicker();
    expect(within(dialog).getAllByRole('grid')).toHaveLength(1);
    const startButton = within(dialog).getByRole('button', { name: 'Start' });
    expect(startButton).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog).getByRole('group', { name: 'Start time' })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('gridcell', { name: '5' }));
    pick(dialog, 0, '9 hours');
    pick(dialog, 1, '30 minutes');
    // Completing the start time moves on to the end.
    expect(within(dialog).getByRole('group', { name: 'End time' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '9' }));
    // The new end takes the start's time.
    expect(times(onChange.mock.lastCall![0])).toEqual(['09:30', '09:30']);
    pick(dialog, 0, '17 hours');
    pick(dialog, 1, '0 minutes');

    const last = onChange.mock.lastCall![0];
    expect(days(last)).toEqual(['2026-01-05', '2026-01-09']);
    expect(times(last)).toEqual(['09:30', '17:00']);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Trip' })).toHaveValue(
      '01/05/2026 09:30 – 01/09/2026 17:00',
    );
  });

  it('keeps the edited endpoint when a day before the start restarts the range', () => {
    const onRangePositionChange = vi.fn();
    renderWithProvider(
      <DesktopDateTimeRangePicker
        ampm={false}
        defaultValue={[day(2026, 0, 10, 8), null]}
        defaultRangePosition="end"
        onRangePositionChange={onRangePositionChange}
      />,
    );
    const dialog = openPicker();
    fireEvent.click(within(dialog).getByRole('button', { name: 'End' }));
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '3' }));
    expect(onRangePositionChange).toHaveBeenLastCalledWith('start');
  });

  it('validates minDateTime / maxDateTime', () => {
    const onError = vi.fn();
    renderWithProvider(
      <DesktopDateTimeRangePicker
        ampm={false}
        minDateTime={day(2026, 0, 5, 12)}
        maxDateTime={day(2026, 0, 20, 12)}
        defaultValue={[day(2026, 0, 5, 9), day(2026, 0, 21, 9)]}
        onError={onError}
      />,
    );
    expect(onError).toHaveBeenCalledWith(['minTime', 'maxDate'], expect.any(Array));
  });

  it('can show two calendars', () => {
    renderWithProvider(<DesktopDateTimeRangePicker referenceDate={REF} calendars={2} />);
    expect(within(openPicker()).getAllByRole('grid')).toHaveLength(2);
  });
});

describe('MobileDateTimeRangePicker', () => {
  it('switches between the date and time views', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <MobileDateTimeRangePicker referenceDate={REF} ampm={false} onAccept={onAccept} />,
    );
    fireEvent.click(screen.getByRole('textbox'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('grid')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '5' }));
    // Picking a day opens the clock.
    expect(within(dialog).queryByRole('grid')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('tab', { name: 'pick time' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(within(dialog).getByRole('tab', { name: 'pick date' }));
    expect(within(dialog).getByRole('grid')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(days(onAccept.mock.calls[0][0])).toEqual(['2026-01-05', null]);
  });
});

describe('StaticDateTimeRangePicker', () => {
  it('renders inline', () => {
    renderWithProvider(
      <StaticDateTimeRangePicker referenceDate={REF} displayStaticWrapperAs="desktop" />,
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(2);
  });
});

describe('DateTimeRangePicker (responsive)', () => {
  it('renders the desktop variant on a fine pointer', () => {
    const restore = mockMatchMedia(true);
    renderWithProvider(<DateTimeRangePicker />);
    expect(screen.getByRole('button', { name: /choose range/i })).toBeInTheDocument();
    restore();
  });
});
