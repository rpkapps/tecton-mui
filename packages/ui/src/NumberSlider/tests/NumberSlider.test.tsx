import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import InputAdornment from '@mui/material/InputAdornment';
import { ThemeProvider, getDefaultTheme } from '../../styles/index.js';
import NumberSlider, { numberSliderClasses } from '../index.js';
import { NumberSlider as RootNumberSlider } from '../../index.js';

const input = () => screen.getByRole('textbox') as HTMLInputElement;
const rail = () => document.querySelector(`.${numberSliderClasses.rail}`) as HTMLElement;
const thumb = () => document.querySelector(`.${numberSliderClasses.thumb}`) as HTMLElement;
const track = () => document.querySelector(`.${numberSliderClasses.track}`) as HTMLElement;

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

describe('NumberSlider', () => {
  it('is exported from the root and the subpath', () => {
    expect(RootNumberSlider).toBe(NumberSlider);
  });

  it('renders a bar at the value next to a filled input', () => {
    render(<NumberSlider label="Opacity" defaultValue={35} />);
    expect(screen.getByLabelText('Opacity')).toHaveValue('35');
    expect(input().closest('.MuiFilledInput-root')).toHaveClass(numberSliderClasses.input);
    // The bar is a pointer shortcut only.
    expect(rail()).toHaveAttribute('aria-hidden', 'true');
    expect(rail().querySelector('[tabindex]')).toBeNull();
    expect(thumb().style.insetInlineStart).toContain('0.35 *');
    expect(track().style.width).toContain('0.35 *');
    expect(thumb().style.visibility).toBe('');
  });

  it('hides the thumb and the tint while the field is empty', () => {
    render(<NumberSlider label="Opacity" />);
    expect(input()).toHaveValue('');
    expect(thumb().style.visibility).toBe('hidden');
    expect(track().style.width).toBe('0px');
  });

  it('sets the value from the pointer, snapped to the step, and commits when released', () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    render(
      <NumberSlider
        label="Level"
        defaultValue={10}
        step={5}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
      />,
    );
    layOutRail();
    press(73); // 36.5% of the bar -> 35
    expect(input()).toHaveValue('35');
    expect(rail()).toHaveAttribute('data-dragging');
    expect(onValueChange).toHaveBeenLastCalledWith(
      35,
      expect.objectContaining({ reason: 'scrub' }),
    );
    move(500); // past the end -> max
    expect(input()).toHaveValue('100');
    move(-20); // before the start -> min
    expect(input()).toHaveValue('0');
    expect(onValueCommitted).not.toHaveBeenCalled();
    release(-20);
    expect(rail()).not.toHaveAttribute('data-dragging');
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith(0, expect.objectContaining({ reason: 'scrub' }));
    // Moving without a pressed pointer does nothing.
    move(100);
    expect(input()).toHaveValue('0');
  });

  it('measures from the right edge in right-to-left layouts', () => {
    render(
      <NumberSlider
        label="Level"
        defaultValue={0}
        step={5}
        slotProps={{ rail: { style: { direction: 'rtl' } } }}
      />,
    );
    layOutRail();
    press(73); // 127px from the right edge -> 63.5 -> 65
    expect(input()).toHaveValue('65');
  });

  it('keeps decimal steps free of floating-point noise and respects min and max', () => {
    render(
      <NumberSlider label="Gain" locale="en-US" defaultValue={0} min={-1} max={1} step={0.1} />,
    );
    layOutRail();
    press(130); // 65% of [-1, 1] -> 0.3 (not 0.30000000000000004)
    expect(input()).toHaveValue('0.3');
  });

  it('does not apply a change that onValueChange cancels', () => {
    const onValueCommitted = vi.fn();
    render(
      <NumberSlider
        label="Level"
        defaultValue={10}
        onValueChange={(_value, details) => details.cancel()}
        onValueCommitted={onValueCommitted}
      />,
    );
    layOutRail();
    press(150);
    release(150);
    expect(input()).toHaveValue('10');
    expect(onValueCommitted).not.toHaveBeenCalled();
  });

  it('ignores the pointer when disabled or read-only, and for secondary buttons', () => {
    const { rerender } = render(<NumberSlider label="Level" defaultValue={10} disabled />);
    layOutRail();
    press(150);
    expect(input()).toHaveValue('10');
    expect(input()).toBeDisabled();
    expect(rail()).toHaveAttribute('data-disabled');
    rerender(<NumberSlider label="Level" defaultValue={10} readOnly />);
    press(150);
    expect(input()).toHaveValue('10');
    expect(rail()).toHaveAttribute('data-readonly');
    rerender(<NumberSlider label="Level" defaultValue={10} />);
    fireEvent.pointerDown(rail(), { clientX: 150, pointerId: 1, button: 2 });
    expect(input()).toHaveValue('10');
  });

  it('moves the bar while typing and steps with the keyboard', () => {
    render(<NumberSlider label="Level" defaultValue={10} max={50} />);
    const el = input();
    act(() => el.focus());
    fireEvent.change(el, { target: { value: '25' } });
    expect(thumb().style.insetInlineStart).toContain('0.5 *');
    fireEvent.keyDown(el, { key: 'ArrowUp' });
    expect(el).toHaveValue('26');
    fireEvent.keyDown(el, { key: 'End' });
    expect(el).toHaveValue('50');
  });

  it('commits typed text before the bar takes over', () => {
    const onValueCommitted = vi.fn();
    render(<NumberSlider label="Level" defaultValue={10} onValueCommitted={onValueCommitted} />);
    layOutRail();
    const el = input();
    act(() => el.focus());
    fireEvent.change(el, { target: { value: '80' } });
    press(40);
    release(40);
    expect(document.activeElement).not.toBe(el);
    expect(onValueCommitted.mock.calls.map(([value]) => value)).toEqual([80, 20]);
    expect(el).toHaveValue('20');
  });

  it('works controlled', () => {
    function Controlled() {
      const [value, setValue] = React.useState<number | null>(40);
      return (
        <>
          <NumberSlider label="Level" value={value} onValueChange={setValue} />
          <output>{String(value)}</output>
        </>
      );
    }
    render(<Controlled />);
    layOutRail();
    press(20);
    expect(screen.getByRole('status')).toHaveTextContent('10');
    expect(input()).toHaveValue('10');
  });

  it('shows a unit adornment, helper text and the error state', () => {
    render(
      <NumberSlider
        label="Window"
        defaultValue={16}
        error
        helperText="Too long."
        id="window"
        slotProps={{ input: { endAdornment: <InputAdornment position="end">ms</InputAdornment> } }}
      />,
    );
    expect(screen.getByText('ms').closest('.MuiInputAdornment-positionEnd')).not.toBeNull();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAttribute('aria-describedby', 'window-helper-text');
    expect(input().closest('.MuiFilledInput-root')).toHaveClass('Mui-error');
  });

  it('forwards refs, class names and slot props', () => {
    const ref = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    render(
      <NumberSlider
        ref={ref}
        inputRef={inputRef}
        label="Level"
        size="small"
        className="custom"
        slotProps={{ rail: { className: 'bar' }, inputLabel: { className: 'lbl' } }}
      />,
    );
    expect(ref.current).toHaveClass('custom', numberSliderClasses.root);
    expect(inputRef.current).toBe(input());
    expect(rail()).toHaveClass('bar');
    expect(input().closest('.MuiInputBase-root')).toHaveClass('MuiInputBase-sizeSmall');
    expect(screen.getByText('Level')).toHaveClass('lbl');
  });

  it('server-renders the value and the bar position', () => {
    const html = renderToString(<NumberSlider label="Opacity" defaultValue={35} />);
    expect(html).toContain('value="35"');
    expect(html).toContain('0.35 *');
  });

  it.each(['light', 'dark'] as const)('renders in the %s Tecton theme', (mode) => {
    const errors = vi.spyOn(console, 'error');
    render(
      <ThemeProvider theme={getDefaultTheme(mode)}>
        <NumberSlider label="Themed" defaultValue={1} />
      </ThemeProvider>,
    );
    expect(input()).toHaveValue('1');
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
