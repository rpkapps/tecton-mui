import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import InputAdornment from '@mui/material/InputAdornment';
import { ThemeProvider, getDefaultTheme } from '../../styles/index.js';
import NumberSpinner, { numberSpinnerClasses } from '../index.js';
import { NumberSpinner as RootNumberSpinner } from '../../index.js';

const input = () => screen.getByRole('textbox') as HTMLInputElement;
const increase = () => screen.getByRole('button', { name: 'Increase' });
const decrease = () => screen.getByRole('button', { name: 'Decrease' });

describe('NumberSpinner', () => {
  it('is exported from the root and the subpath', () => {
    expect(RootNumberSpinner).toBe(NumberSpinner);
  });

  it('renders the value between decrement and increment buttons', () => {
    render(<NumberSpinner label="Crew" defaultValue={4} />);
    const group = document.querySelector(`.${numberSpinnerClasses.group}`)!;
    const order = [...group.children].map((el) =>
      el.matches('button') ? el.getAttribute('aria-label') : 'input',
    );
    expect(order).toEqual(['Decrease', 'input', 'Increase']);
    expect(screen.getByLabelText('Crew')).toHaveValue('4');
    expect(decrease().querySelector('.tecton-remove-outline')).not.toBeNull();
    expect(increase().querySelector('.tecton-add-outline')).not.toBeNull();
    expect(increase()).toHaveClass('MuiButton-outlined');
    // The native size grows with the value (at least the width of `min`).
    expect(input()).toHaveAttribute('size', '2');
  });

  it('renders a filled spinner with variant="filled"', () => {
    render(
      <ThemeProvider theme={getDefaultTheme('light')}>
        <NumberSpinner variant="filled" label="Crew" defaultValue={4} min={0} size="small" />
      </ThemeProvider>,
    );
    const root = input().closest('.MuiFilledInput-root');
    expect(root).toHaveClass('MuiInputBase-sizeSmall');
    expect(root).not.toHaveClass('MuiFilledInput-underline');
    expect(input().closest('.MuiOutlinedInput-root')).toBeNull();
    // The buttons are text buttons on the filled background, not outlined buttons.
    expect(increase()).toHaveClass('MuiButton-text', 'MuiButton-sizeSmall');
    expect(decrease()).not.toHaveClass('MuiButton-outlined');
    fireEvent.click(increase());
    expect(input()).toHaveValue('5');
  });

  it('shows the error and disabled states in the filled variant', () => {
    const { rerender } = render(
      <NumberSpinner variant="filled" label="Count" error helperText="Required" />,
    );
    const filledRoot = () => input().closest('.MuiFilledInput-root');
    expect(filledRoot()).toHaveClass('Mui-error');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    rerender(<NumberSpinner variant="filled" label="Count" disabled defaultValue={2} />);
    expect(filledRoot()).toHaveClass('Mui-disabled');
    expect(increase()).toHaveClass('Mui-disabled');
    expect(decrease()).toBeDisabled();
  });

  it('steps with the buttons and the keyboard, clamped to min and max', () => {
    const onValueChange = vi.fn();
    render(
      <NumberSpinner label="Crew" defaultValue={1} min={0} max={3} onValueChange={onValueChange} />,
    );
    fireEvent.click(increase());
    fireEvent.click(increase());
    expect(input()).toHaveValue('3');
    expect(increase()).toBeDisabled();
    act(() => input().focus());
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(input()).toHaveValue('2');
    fireEvent.keyDown(input(), { key: 'Home' });
    expect(input()).toHaveValue('0');
    expect(decrease()).toBeDisabled();
    expect(onValueChange).toHaveBeenLastCalledWith(0, expect.anything());
  });

  it('commits typed values on blur, using smallStep with Alt', () => {
    render(<NumberSpinner label="Ratio" locale="en-US" smallStep={0.5} defaultValue={1} />);
    const el = input();
    act(() => el.focus());
    fireEvent.change(el, { target: { value: '2.25' } });
    fireEvent.blur(el);
    expect(el).toHaveValue('2.25');
    act(() => el.focus());
    fireEvent.keyDown(el, { key: 'ArrowUp', altKey: true });
    expect(el).toHaveValue('2.75');
  });

  it('makes the label a scrub area unless disableScrub is set', () => {
    const { rerender } = render(<NumberSpinner label="Count" />);
    const scrub = document.querySelector(`.${numberSpinnerClasses.scrubArea}`);
    expect(scrub).toContainElement(screen.getByText('Count'));
    rerender(<NumberSpinner label="Count" disableScrub />);
    expect(document.querySelector(`.${numberSpinnerClasses.scrubArea}`)).toBeNull();
    expect(screen.getByLabelText('Count')).toBe(input());
  });

  it('supports disabled, error and helper text', () => {
    const { rerender } = render(
      <NumberSpinner label="Count" error helperText="Required" id="count" />,
    );
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAttribute('aria-describedby', 'count-helper-text');
    expect(screen.getByText('Required')).toHaveClass('Mui-error');
    rerender(<NumberSpinner label="Count" disabled defaultValue={2} />);
    expect(input()).toBeDisabled();
    expect(increase()).toBeDisabled();
    expect(decrease()).toBeDisabled();
    expect(input()).not.toHaveAttribute('aria-describedby');
  });

  it('forwards refs and slot props', () => {
    const ref = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    render(
      <NumberSpinner
        ref={ref}
        inputRef={inputRef}
        label="Count"
        size="small"
        className="custom"
        slotProps={{ incrementButton: { 'aria-label': 'More' }, inputLabel: { className: 'lbl' } }}
      />,
    );
    expect(ref.current).toHaveClass('custom', numberSpinnerClasses.root);
    expect(inputRef.current).toBe(input());
    expect(screen.getByRole('button', { name: 'More' })).toHaveClass('MuiButton-sizeSmall');
    expect(screen.getByText('Count')).toHaveClass('lbl');
  });

  it('server-renders the value and the label', () => {
    const html = renderToString(<NumberSpinner label="Crew" defaultValue={12} />);
    expect(html).toContain('value="12"');
    expect(html).toMatch(/<label[^>]*data-shrink="true"/);
  });

  it('shows a unit adornment after the value, between the buttons', () => {
    render(
      <NumberSpinner
        label="Step"
        defaultValue={5}
        slotProps={{ input: { endAdornment: <InputAdornment position="end">Hz</InputAdornment> } }}
      />,
    );
    const inputRoot = input().closest('.MuiInputBase-root')!;
    expect(inputRoot).toHaveClass('MuiInputBase-adornedEnd');
    expect(inputRoot).toContainElement(screen.getByText('Hz'));
    expect(inputRoot.nextElementSibling).toBe(increase());
    fireEvent.click(increase());
    expect(input()).toHaveValue('6');
  });

  it.each(['light', 'dark'] as const)('renders in the %s Tecton theme', (mode) => {
    const errors = vi.spyOn(console, 'error');
    render(
      <ThemeProvider theme={getDefaultTheme(mode)}>
        <NumberSpinner label="Themed" defaultValue={1} />
      </ThemeProvider>,
    );
    expect(input()).toHaveValue('1');
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
