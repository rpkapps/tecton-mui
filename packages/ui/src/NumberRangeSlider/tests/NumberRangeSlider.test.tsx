import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import InputAdornment from '@mui/material/InputAdornment';
import { ThemeProvider, getDefaultTheme } from '../../styles/index.js';
import NumberRangeSlider, {
  numberRangeSliderClasses,
  type NumberRangeSliderValue,
} from '../index.js';
import { NumberRangeSlider as RootNumberRangeSlider } from '../../index.js';

const inputs = () => screen.getAllByRole('textbox') as HTMLInputElement[];
const values = () => inputs().map((el) => el.value);
const rail = () => document.querySelector(`.${numberRangeSliderClasses.rail}`) as HTMLElement;
const thumbs = () =>
  [...document.querySelectorAll(`.${numberRangeSliderClasses.thumb}`)] as HTMLElement[];
const track = () => document.querySelector(`.${numberRangeSliderClasses.track}`) as HTMLElement;
const inputRoot = () => document.querySelector(`.${numberRangeSliderClasses.input}`) as HTMLElement;

/** jsdom has no layout: give the bar a 200px box starting at x = 0. */
function layOutRail() {
  vi.spyOn(rail(), 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 32 }),
  );
}

const press = (clientX: number) =>
  fireEvent.pointerDown(rail(), { clientX, pointerId: 1, button: 0 });
const move = (clientX: number) => fireEvent.pointerMove(rail(), { clientX, pointerId: 1 });
const release = (clientX: number) => fireEvent.pointerUp(rail(), { clientX, pointerId: 1 });

describe('NumberRangeSlider', () => {
  it('is exported from the root and the subpath', () => {
    expect(RootNumberRangeSlider).toBe(NumberRangeSlider);
  });

  it('shows both values in one filled input and a thumb at each', () => {
    render(<NumberRangeSlider label="Frequency" defaultValue={[10, 50]} />);
    expect(values()).toEqual(['10', '50']);
    expect(inputRoot()).toHaveClass('MuiFilledInput-root');
    expect(inputRoot()).toContainElement(inputs()[1]!);
    expect(inputRoot().querySelector(`.${numberRangeSliderClasses.separator}`)).toHaveTextContent(
      '–',
    );
    expect(thumbs().map((el) => el.style.insetInlineStart)).toEqual([
      expect.stringContaining('0.1 *'),
      expect.stringContaining('0.5 *'),
    ]);
    expect(rail()).toHaveAttribute('aria-hidden', 'true');
  });

  it('defaults to the whole range and names the inputs after the label', () => {
    render(<NumberRangeSlider label="Frequency" />);
    expect(values()).toEqual(['0', '100']);
    expect(screen.getByRole('textbox', { name: 'Frequency minimum' })).toBe(inputs()[0]);
    expect(screen.getByRole('textbox', { name: 'Frequency maximum' })).toBe(inputs()[1]);
  });

  it('names the inputs with getAriaLabel', () => {
    render(
      <NumberRangeSlider label="Frequenz" getAriaLabel={(index) => (index ? 'Bis' : 'Von')} />,
    );
    expect(screen.getByRole('textbox', { name: 'Von' })).toBe(inputs()[0]);
    expect(screen.getByRole('textbox', { name: 'Bis' })).toBe(inputs()[1]);
  });

  it('moves the nearer thumb, which stops at the other one', () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    render(
      <NumberRangeSlider
        label="Frequency"
        defaultValue={[20, 60]}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
      />,
    );
    layOutRail();
    press(160); // 80 is nearer the end
    expect(values()).toEqual(['20', '80']);
    expect(onValueChange).toHaveBeenLastCalledWith(
      [20, 80],
      expect.objectContaining({ reason: 'scrub' }),
    );
    move(10); // dragged past the start: stops there
    expect(values()).toEqual(['20', '20']);
    release(10);
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith(
      [20, 20],
      expect.objectContaining({ reason: 'scrub' }),
    );
    // With the thumbs together, a press below moves the start and a press above moves the end.
    press(20);
    release(20);
    press(180);
    release(180);
    expect(values()).toEqual(['10', '90']);
  });

  it('moves the whole range when the part between the thumbs is dragged', () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    render(
      <NumberRangeSlider
        label="Frequency"
        defaultValue={[20, 60]}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
      />,
    );
    layOutRail();
    // A press between the thumbs grabs the range without moving a thumb.
    fireEvent.pointerDown(track(), { clientX: 80, pointerId: 1, button: 0 });
    expect(values()).toEqual(['20', '60']);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rail()).toHaveAttribute('data-dragging', 'range');
    move(100); // 10 to the right
    expect(values()).toEqual(['30', '70']);
    expect(onValueChange).toHaveBeenLastCalledWith(
      [30, 70],
      expect.objectContaining({ reason: 'scrub' }),
    );
    move(200); // the end stops at max; the width stays
    expect(values()).toEqual(['60', '100']);
    move(-100); // the start stops at min
    expect(values()).toEqual(['0', '40']);
    release(-100);
    expect(rail()).not.toHaveAttribute('data-dragging');
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith(
      [0, 40],
      expect.objectContaining({ reason: 'scrub' }),
    );
  });

  it('does not commit a press between the thumbs that does not move', () => {
    const onValueCommitted = vi.fn();
    render(
      <NumberRangeSlider
        label="Frequency"
        defaultValue={[20, 60]}
        onValueCommitted={onValueCommitted}
      />,
    );
    layOutRail();
    fireEvent.pointerDown(track(), { clientX: 80, pointerId: 1, button: 0 });
    move(80.5); // less than half a step (2px at this width)
    release(80.5);
    expect(values()).toEqual(['20', '60']);
    expect(onValueCommitted).not.toHaveBeenCalled();
  });

  it('still moves a single thumb when the thumb itself is pressed', () => {
    render(<NumberRangeSlider label="Frequency" defaultValue={[20, 60]} />);
    layOutRail();
    fireEvent.pointerDown(thumbs()[1]!, { clientX: 120, pointerId: 1, button: 0 });
    move(100);
    release(100);
    expect(values()).toEqual(['20', '50']);
  });

  it('moves the range by whole steps without floating-point noise', () => {
    render(
      <NumberRangeSlider label="Level" min={0} max={1} step={0.1} defaultValue={[0.1, 0.3]} />,
    );
    layOutRail();
    fireEvent.pointerDown(track(), { clientX: 40, pointerId: 1, button: 0 });
    move(80);
    expect(values()).toEqual(['0.3', '0.5']);
    release(80);
  });

  it('can cancel a change while the range is dragged', () => {
    function Controlled() {
      const [value, setValue] = React.useState<NumberRangeSliderValue>([20, 60]);
      return (
        <NumberRangeSlider
          label="Frequency"
          value={value}
          onValueChange={(next, details) => {
            if (next[1] > 70) details.cancel();
            else setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    layOutRail();
    fireEvent.pointerDown(track(), { clientX: 80, pointerId: 1, button: 0 });
    move(100);
    move(120); // would end at 80: canceled, the range stays where it was
    expect(values()).toEqual(['30', '70']);
    move(90);
    release(90);
    expect(values()).toEqual(['25', '65']);
  });

  it('does not drag the range when disabled or read-only', () => {
    const { rerender } = render(
      <NumberRangeSlider label="Frequency" defaultValue={[20, 60]} disabled />,
    );
    layOutRail();
    fireEvent.pointerDown(track(), { clientX: 80, pointerId: 1, button: 0 });
    move(120);
    release(120);
    expect(values()).toEqual(['20', '60']);
    rerender(<NumberRangeSlider label="Frequency" defaultValue={[20, 60]} readOnly />);
    fireEvent.pointerDown(track(), { clientX: 80, pointerId: 1, button: 0 });
    move(120);
    release(120);
    expect(values()).toEqual(['20', '60']);
  });

  it('keeps the start at or below the end when typing and stepping', () => {
    render(<NumberRangeSlider label="Frequency" defaultValue={[10, 50]} />);
    const [start, end] = inputs() as [HTMLInputElement, HTMLInputElement];
    act(() => start.focus());
    fireEvent.change(start, { target: { value: '90' } });
    fireEvent.blur(start);
    expect(values()).toEqual(['50', '50']);
    act(() => end.focus());
    fireEvent.keyDown(end, { key: 'ArrowDown' });
    expect(values()).toEqual(['50', '50']);
    fireEvent.keyDown(end, { key: 'End' });
    expect(values()).toEqual(['50', '100']);
  });

  it('shows the previous value again when an input is emptied', () => {
    const onValueChange = vi.fn();
    render(
      <NumberRangeSlider label="Frequency" defaultValue={[10, 50]} onValueChange={onValueChange} />,
    );
    const [start] = inputs() as [HTMLInputElement];
    act(() => start.focus());
    fireEvent.change(start, { target: { value: '' } });
    fireEvent.blur(start);
    expect(values()).toEqual(['10', '50']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('looks focused while either input has focus', () => {
    render(<NumberRangeSlider label="Frequency" />);
    const [start, end] = inputs() as [HTMLInputElement, HTMLInputElement];
    act(() => start.focus());
    expect(inputRoot()).toHaveClass('Mui-focused');
    act(() => end.focus());
    expect(inputRoot()).toHaveClass('Mui-focused');
    act(() => end.blur());
    expect(inputRoot()).not.toHaveClass('Mui-focused');
  });

  it('commits text typed into either input before the bar takes over', () => {
    const onValueCommitted = vi.fn();
    render(
      <NumberRangeSlider
        label="Frequency"
        defaultValue={[10, 50]}
        onValueCommitted={onValueCommitted}
      />,
    );
    layOutRail();
    const [, end] = inputs() as [HTMLInputElement, HTMLInputElement];
    act(() => end.focus());
    fireEvent.change(end, { target: { value: '70' } });
    press(40);
    release(40);
    expect(onValueCommitted.mock.calls.map(([value]) => value)).toEqual([
      [10, 70],
      [20, 70],
    ]);
  });

  it('works controlled and can cancel a change', () => {
    function Controlled() {
      const [value, setValue] = React.useState<NumberRangeSliderValue>([30, 40]);
      return (
        <>
          <NumberRangeSlider
            label="Frequency"
            value={value}
            onValueChange={(next, details) => {
              if (next[1] > 90) details.cancel();
              else setValue(next);
            }}
          />
          <output>{value.join(' ')}</output>
        </>
      );
    }
    render(<Controlled />);
    layOutRail();
    press(160);
    move(196);
    release(196);
    expect(screen.getByRole('status')).toHaveTextContent('30 80');
    expect(values()).toEqual(['30', '80']);
  });

  it('supports disabled, read-only, error, helper text and a unit', () => {
    const { rerender } = render(
      <NumberRangeSlider
        label="Frequency"
        id="freq"
        error
        helperText="Too wide."
        slotProps={{ input: { endAdornment: <InputAdornment position="end">Hz</InputAdornment> } }}
      />,
    );
    for (const el of inputs()) {
      expect(el).toHaveAttribute('aria-invalid', 'true');
      expect(el).toHaveAttribute('aria-describedby', 'freq-helper-text');
    }
    expect(inputs()[1]).toHaveAttribute('id', 'freq-end');
    expect(inputRoot()).toHaveClass('Mui-error');
    expect(screen.getByText('Hz')).toBeInTheDocument();
    rerender(<NumberRangeSlider label="Frequency" disabled />);
    layOutRail();
    expect(inputs()[0]).toBeDisabled();
    expect(inputRoot()).toHaveClass('Mui-disabled');
    press(20);
    expect(values()).toEqual(['0', '100']);
    rerender(<NumberRangeSlider label="Frequency" readOnly />);
    expect(inputs()[1]).toHaveAttribute('readonly');
    press(20);
    expect(values()).toEqual(['0', '100']);
  });

  it('forwards the root ref, class names and slot props', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <NumberRangeSlider
        ref={ref}
        label="Frequency"
        className="custom"
        size="small"
        slotProps={{
          rail: { className: 'bar' },
          startInput: { className: 'from' },
          endInput: { 'aria-describedby': 'extra' },
        }}
      />,
    );
    expect(ref.current).toHaveClass('custom', numberRangeSliderClasses.root);
    expect(rail()).toHaveClass('bar');
    expect(inputs()[0]).toHaveClass('from');
    expect(inputs()[1]).toHaveAttribute('aria-describedby', 'extra');
    expect(inputRoot()).toHaveClass('MuiInputBase-sizeSmall');
  });

  it('server-renders both values', () => {
    const html = renderToString(<NumberRangeSlider label="Frequency" defaultValue={[10, 50]} />);
    expect(html).toContain('value="10"');
    expect(html).toContain('value="50"');
  });

  it.each(['light', 'dark'] as const)('renders in the %s Tecton theme', (mode) => {
    const errors = vi.spyOn(console, 'error');
    render(
      <ThemeProvider theme={getDefaultTheme(mode)}>
        <NumberRangeSlider label="Themed" defaultValue={[1, 2]} />
      </ThemeProvider>,
    );
    expect(values()).toEqual(['1', '2']);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
