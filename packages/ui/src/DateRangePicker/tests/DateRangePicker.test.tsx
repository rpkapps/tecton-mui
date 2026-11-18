import * as React from 'react';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DateRangePicker, type DateRange } from '../index.js';
import { DesktopDateRangePicker } from '../../DesktopDateRangePicker/index.js';
import { MobileDateRangePicker } from '../../MobileDateRangePicker/index.js';
import { StaticDateRangePicker } from '../../StaticDateRangePicker/index.js';
import { MultiInputDateRangeField } from '../../MultiInputDateRangeField/index.js';
import {
  day,
  days,
  mockMatchMedia,
  renderWithProvider,
} from '../../internal/range-pickers/tests/testUtils.js';

const JAN_2026 = day(2026, 0, 1);

function openButton() {
  return screen.getByRole('button', { name: /choose range/i });
}

function pickDays(...numbers: number[]) {
  const dialog = screen.getByRole('dialog');
  for (const n of numbers) {
    fireEvent.click(within(dialog).getAllByRole('gridcell', { name: String(n) })[0]);
  }
}

describe('DesktopDateRangePicker', () => {
  it('opens a labelled popup with two calendars and focuses a day', () => {
    const onOpen = vi.fn();
    renderWithProvider(
      <DesktopDateRangePicker label="Stay" referenceDate={JAN_2026} onOpen={onOpen} />,
    );
    expect(openButton()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(openButton()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(openButton());
    const dialog = screen.getByRole('dialog', { name: 'Stay' });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(openButton()).toHaveAttribute('aria-expanded', 'true');
    expect(openButton()).toHaveAttribute('aria-controls', dialog.id);
    expect(within(dialog).getAllByRole('grid')).toHaveLength(2);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('fires onChange per click, then onAccept and closes when the range is complete', () => {
    const onChange = vi.fn();
    const onAccept = vi.fn();
    const onClose = vi.fn();
    renderWithProvider(
      <DesktopDateRangePicker
        label="Stay"
        referenceDate={JAN_2026}
        onChange={onChange}
        onAccept={onAccept}
        onClose={onClose}
      />,
    );
    fireEvent.click(openButton());
    pickDays(5);
    expect(onAccept).not.toHaveBeenCalled();
    pickDays(9);
    expect(onChange.mock.calls.map((call) => days(call[0]))).toEqual([
      ['2026-01-05', null],
      ['2026-01-05', '2026-01-09'],
    ]);
    expect(onChange.mock.calls[1][1]).toEqual({
      validationError: [null, null],
      shortcut: undefined,
    });
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(days(onAccept.mock.calls[0][0])).toEqual(['2026-01-05', '2026-01-09']);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Stay' })).toHaveValue('01/05/2026 – 01/09/2026');
    expect(openButton()).toHaveFocus();
  });

  it('stays open with closeOnSelect={false}; Escape commits and closes', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <DesktopDateRangePicker referenceDate={JAN_2026} closeOnSelect={false} onAccept={onAccept} />,
    );
    fireEvent.click(openButton());
    pickDays(5, 9);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('does not fire onAccept when nothing changed', () => {
    const onAccept = vi.fn();
    renderWithProvider(<DesktopDateRangePicker referenceDate={JAN_2026} onAccept={onAccept} />);
    fireEvent.click(openButton());
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('closes on click away', async () => {
    renderWithProvider(
      <div>
        <button type="button">outside</button>
        <DesktopDateRangePicker referenceDate={JAN_2026} />
      </div>,
    );
    fireEvent.click(openButton());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // ClickAwayListener arms itself on the next tick.
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    fireEvent.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports a controlled value and a controlled open state', () => {
    const onChange = vi.fn();
    const onOpen = vi.fn();
    const value: DateRange<Date> = [day(2026, 0, 5), day(2026, 0, 7)];
    const { rerender } = renderWithProvider(
      <DesktopDateRangePicker value={value} onChange={onChange} open={false} onOpen={onOpen} />,
    );
    fireEvent.click(openButton());
    expect(onOpen).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<DesktopDateRangePicker value={value} onChange={onChange} open />);
    pickDays(12);
    expect(onChange).toHaveBeenCalledTimes(1);
    // The parent kept the value: field still shows it.
    expect(screen.getByRole('textbox')).toHaveValue('01/05/2026 – 01/07/2026');
  });

  it('accepts typed input and reports validation errors', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    renderWithProvider(
      <DesktopDateRangePicker
        label="Stay"
        onChange={onChange}
        onError={onError}
        minDate={day(2026, 0, 3)}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Stay' });
    fireEvent.change(input, { target: { value: '01/05/2026 – 01/09/2026' } });
    expect(days(onChange.mock.lastCall![0])).toEqual(['2026-01-05', '2026-01-09']);
    expect(input).toHaveAttribute('aria-invalid', 'false');

    fireEvent.change(input, { target: { value: '01/01/2026 – 01/09/2026' } });
    expect(onChange.mock.lastCall![1].validationError).toEqual(['minDate', null]);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onError).toHaveBeenLastCalledWith(['minDate', null], expect.any(Array));

    fireEvent.change(input, { target: { value: '01/09/2026 – 01/05/2026' } });
    expect(onError).toHaveBeenLastCalledWith(['invalidRange', 'invalidRange'], expect.any(Array));

    fireEvent.change(input, { target: { value: 'nope' } });
    expect(onError).toHaveBeenLastCalledWith(['invalidDate', null], expect.any(Array));
  });

  it('applies a shortcut and reports it in the context', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <DesktopDateRangePicker
        referenceDate={JAN_2026}
        onAccept={onAccept}
        maxDate={day(2026, 11, 31)}
        slotProps={{
          shortcuts: {
            items: [
              { label: 'First week', getValue: () => [day(2026, 0, 1), day(2026, 0, 7)] },
              { label: 'Far future', getValue: () => [day(2030, 0, 1), day(2030, 0, 7)] },
            ],
          },
        }}
      />,
    );
    fireEvent.click(openButton());
    expect(screen.getByRole('button', { name: 'Far future' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'First week' }));
    expect(days(onAccept.mock.calls[0][0])).toEqual(['2026-01-01', '2026-01-07']);
    expect(onAccept.mock.calls[0][1].shortcut.label).toBe('First week');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the requested number of calendars and an action bar', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <DesktopDateRangePicker
        referenceDate={JAN_2026}
        defaultValue={[day(2026, 0, 2), day(2026, 0, 3)]}
        calendars={3}
        onAccept={onAccept}
        slotProps={{ actionBar: { actions: ['clear', 'today', 'accept'] } }}
      />,
    );
    fireEvent.click(openButton());
    expect(within(screen.getByRole('dialog')).getAllByRole('grid')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onAccept).toHaveBeenLastCalledWith([null, null], expect.anything());
    fireEvent.click(openButton());
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    const today = new Date();
    expect(days(onAccept.mock.lastCall![0])).toEqual(days([today, today]));
  });

  it('cannot be opened when disabled or readOnly', () => {
    const { rerender } = renderWithProvider(<DesktopDateRangePicker disabled />);
    expect(openButton()).toBeDisabled();
    rerender(<DesktopDateRangePicker readOnly />);
    expect(openButton()).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('works with the multi input field and localeText', () => {
    renderWithProvider(
      <DesktopDateRangePicker
        referenceDate={JAN_2026}
        localeText={{ start: 'Check-in', end: 'Check-out' }}
        slots={{ field: MultiInputDateRangeField }}
      />,
    );
    expect(screen.getByText('Check-in', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('Check-out', { selector: 'label' })).toBeInTheDocument();
    fireEvent.click(openButton());
    pickDays(5, 9);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('group')[0]).toBeInTheDocument();
  });

  it('uses the theme default props and the custom open icon', () => {
    function Icon() {
      return <span data-testid="custom-icon" />;
    }
    const theme = createTheme({
      components: {
        // @ts-expect-error -- range pickers are not part of the MUI theme typings.
        MuiDesktopDateRangePicker: { defaultProps: { label: 'From theme' } },
      },
    });
    renderWithProvider(
      <ThemeProvider theme={theme}>
        <DesktopDateRangePicker slots={{ openPickerIcon: Icon }} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'From theme' })).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('MobileDateRangePicker', () => {
  it('opens a modal dialog from the field; OK accepts', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <MobileDateRangePicker label="Stay" referenceDate={JAN_2026} onAccept={onAccept} />,
    );
    const input = screen.getByRole('textbox', { name: 'Stay' });
    expect(input).toHaveAttribute('readonly');
    fireEvent.click(input);
    const dialog = screen.getByRole('dialog', { name: 'Select date range' });
    expect(within(dialog).getAllByRole('grid')).toHaveLength(1);
    pickDays(5, 9);
    // Mobile does not close on select.
    expect(onAccept).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('button', { name: 'Start: 01/05/2026' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(days(onAccept.mock.calls[0][0])).toEqual(['2026-01-05', '2026-01-09']);
  });

  it('Cancel reverts the value', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <MobileDateRangePicker
        defaultValue={[day(2026, 0, 2), day(2026, 0, 3)]}
        onChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    pickDays(1);
    expect(days(onChange.mock.lastCall![0])).toEqual(['2026-01-01', '2026-01-03']);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(days(onChange.mock.lastCall![0])).toEqual(['2026-01-02', '2026-01-03']);
    // The field is aria-hidden while the dialog plays its exit transition.
    expect(screen.getByRole('textbox', { hidden: true })).toHaveValue('01/02/2026 – 01/03/2026');
  });

  it('toolbar buttons switch the edited endpoint', () => {
    const onRangePositionChange = vi.fn();
    renderWithProvider(
      <MobileDateRangePicker
        referenceDate={JAN_2026}
        onRangePositionChange={onRangePositionChange}
      />,
    );
    fireEvent.click(screen.getByRole('textbox'));
    const end = screen.getByRole('button', { name: 'End' });
    expect(end).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(end);
    expect(onRangePositionChange).toHaveBeenCalledWith('end');
    expect(screen.getByRole('button', { name: 'End' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('MultiInputDateRangeField in pickers', () => {
  it('opens the mobile dialog on the clicked endpoint', () => {
    const onRangePositionChange = vi.fn();
    renderWithProvider(
      <MobileDateRangePicker
        referenceDate={JAN_2026}
        slots={{ field: MultiInputDateRangeField }}
        onRangePositionChange={onRangePositionChange}
        minDate={day(2026, 0, 1)}
        maxDate={day(2026, 11, 31)}
        disablePast={false}
        disableFuture={false}
        shouldDisableDate={() => false}
      />,
    );
    const end = document.querySelectorAll('.MuiPickersTextField-root')[1];
    fireEvent.click(end.querySelector('.MuiPickersInputBase-root')!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onRangePositionChange).toHaveBeenCalledWith('end');
  });

  it('disables the open button when disabled', () => {
    renderWithProvider(
      <DesktopDateRangePicker disabled slots={{ field: MultiInputDateRangeField }} />,
    );
    expect(openButton()).toBeDisabled();
  });
});

describe('StaticDateRangePicker', () => {
  it('renders inline without a field (mobile layout by default)', () => {
    const onChange = vi.fn();
    renderWithProvider(<StaticDateRangePicker referenceDate={JAN_2026} onChange={onChange} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Select date range' })).toBeInTheDocument();
    expect(screen.getAllByRole('grid')).toHaveLength(1);
    fireEvent.click(screen.getByRole('gridcell', { name: '5' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('desktop layout shows two calendars and accepts on completion', () => {
    const onAccept = vi.fn();
    renderWithProvider(
      <StaticDateRangePicker
        displayStaticWrapperAs="desktop"
        referenceDate={JAN_2026}
        onAccept={onAccept}
      />,
    );
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('gridcell', { name: '5' })[0]);
    fireEvent.click(screen.getAllByRole('gridcell', { name: '9' })[0]);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});

describe('DateRangePicker (responsive)', () => {
  let restore: () => void;
  afterEach(() => restore());

  it('renders the desktop variant when the media query matches', () => {
    restore = mockMatchMedia(true);
    renderWithProvider(<DateRangePicker label="Stay" />);
    expect(openButton()).toBeInTheDocument();
  });

  it('renders the mobile variant otherwise', () => {
    restore = mockMatchMedia(false);
    renderWithProvider(<DateRangePicker label="Stay" />);
    expect(screen.queryByRole('button', { name: /choose range/i })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Stay' })).toHaveAttribute('readonly');
  });

  it('forwards the ref to the field root', () => {
    restore = mockMatchMedia(true);
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(<DateRangePicker ref={ref} />);
    expect(ref.current).toHaveClass('MuiTextField-root');
  });
});
