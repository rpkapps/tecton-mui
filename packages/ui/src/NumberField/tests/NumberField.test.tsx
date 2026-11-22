import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import InputAdornment from '@mui/material/InputAdornment';
import { ThemeProvider, getDefaultTheme } from '../../styles/index.js';
import NumberField, { NumberField as NamedNumberField, numberFieldClasses } from '../index.js';
import { NumberField as RootNumberField } from '../../index.js';

const input = () => screen.getByRole('textbox') as HTMLInputElement;
const increase = () => screen.getByRole('button', { name: 'Increase' });
const decrease = () => screen.getByRole('button', { name: 'Decrease' });

/** One activation of a stepper button (a click without a preceding pointer press steps once). */
function press(button: HTMLElement) {
  fireEvent.click(button);
}

function type(value: string) {
  const el = input();
  act(() => el.focus());
  fireEvent.change(el, { target: { value } });
  fireEvent.blur(el);
}

describe('NumberField', () => {
  it('is the same component from the root, the subpath default and the named export', () => {
    expect(RootNumberField).toBe(NumberField);
    expect(NamedNumberField).toBe(NumberField);
  });

  it('renders an outlined field with a label and stepper buttons', () => {
    render(<NumberField label="Quantity" defaultValue={3} locale="en-US" />);
    const field = screen.getByLabelText('Quantity');
    expect(field).toBe(input());
    expect(field).toHaveValue('3');
    expect(field).toHaveAttribute('inputmode');
    expect(field.closest('.MuiOutlinedInput-root')).not.toBeNull();
    expect(field.closest(`.${numberFieldClasses.root}`)).toHaveClass('MuiFormControl-root');
    expect(increase()).toHaveClass(numberFieldClasses.incrementButton);
    expect(decrease()).toHaveClass(numberFieldClasses.decrementButton);
    expect(increase().querySelector('.tecton-chevron-up-small-outline')).not.toBeNull();
    expect(decrease().querySelector('.tecton-chevron-down-small-outline')).not.toBeNull();
  });

  it('renders a filled field with variant="filled"', () => {
    render(
      <ThemeProvider theme={getDefaultTheme('light')}>
        <NumberField variant="filled" label="Quantity" defaultValue={3} size="small" />
      </ThemeProvider>,
    );
    const root = input().closest('.MuiFilledInput-root');
    expect(root).not.toBeNull();
    expect(root).toHaveClass('MuiInputBase-sizeSmall');
    // The Tecton theme turns the Material underline off, as for a filled TextField.
    expect(root).not.toHaveClass('MuiFilledInput-underline');
    expect(input().closest('.MuiOutlinedInput-root')).toBeNull();
    expect(screen.getByLabelText('Quantity')).toBe(input());
    expect(root).toContainElement(increase());
    expect(root).toContainElement(decrease());
    press(increase());
    expect(input()).toHaveValue('4');
  });

  it('shows the error, disabled and read-only states in the filled variant', () => {
    const { rerender } = render(
      <NumberField variant="filled" label="Pressure" error helperText="Too high" />,
    );
    const filledRoot = () => input().closest('.MuiFilledInput-root');
    expect(filledRoot()).toHaveClass('Mui-error');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    rerender(<NumberField variant="filled" label="Pressure" disabled />);
    expect(filledRoot()).toHaveClass('Mui-disabled');
    expect(increase()).toBeDisabled();
    rerender(<NumberField variant="filled" label="Pressure" readOnly defaultValue={1} />);
    expect(filledRoot()).toHaveClass('MuiInputBase-readOnly');
    expect(increase()).toHaveAttribute('aria-disabled', 'true');
  });

  it('passes slotProps.input to the FilledInput', () => {
    render(
      <NumberField
        variant="filled"
        label="Depth"
        slotProps={{ input: { className: 'custom-input', startAdornment: <span>m</span> } }}
      />,
    );
    const root = input().closest('.MuiFilledInput-root');
    expect(root).toHaveClass('custom-input', 'MuiInputBase-adornedStart');
    expect(root).toHaveTextContent('m');
  });

  it('links helper text only when it is provided', () => {
    const { rerender } = render(<NumberField label="Depth" id="depth" />);
    expect(input()).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText(/./, { selector: '.MuiFormHelperText-root' })).toBeNull();
    rerender(<NumberField label="Depth" id="depth" helperText="Between 10 and 40" />);
    expect(input()).toHaveAttribute('id', 'depth');
    expect(input()).toHaveAttribute('aria-describedby', 'depth-helper-text');
    expect(screen.getByText('Between 10 and 40')).toHaveAttribute('id', 'depth-helper-text');
    expect(input()).toHaveAccessibleDescription('Between 10 and 40');
  });

  it('increments and decrements by step within min and max', () => {
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Pumps"
        defaultValue={8}
        min={0}
        max={10}
        step={2}
        onValueChange={onValueChange}
      />,
    );
    press(increase());
    expect(input()).toHaveValue('10');
    expect(onValueChange).toHaveBeenLastCalledWith(10, expect.anything());
    expect(increase()).toBeDisabled();
    press(decrease());
    press(decrease());
    expect(input()).toHaveValue('6');
    expect(increase()).not.toBeDisabled();
  });

  it('steps with ArrowUp and ArrowDown and clamps to min', () => {
    render(<NumberField label="Count" defaultValue={1} min={0} />);
    const el = input();
    act(() => el.focus());
    fireEvent.keyDown(el, { key: 'ArrowUp' });
    expect(el).toHaveValue('2');
    fireEvent.keyDown(el, { key: 'ArrowDown' });
    fireEvent.keyDown(el, { key: 'ArrowDown' });
    fireEvent.keyDown(el, { key: 'ArrowDown' });
    expect(el).toHaveValue('0');
    expect(decrease()).toBeDisabled();
  });

  it('commits typed text on blur and formats it (currency)', () => {
    const onValueCommitted = vi.fn();
    render(
      <NumberField
        label="Budget"
        locale="en-US"
        format={{ style: 'currency', currency: 'USD' }}
        onValueCommitted={onValueCommitted}
      />,
    );
    type('1234.5');
    expect(input()).toHaveValue('$1,234.50');
    expect(onValueCommitted).toHaveBeenLastCalledWith(1234.5, expect.anything());
  });

  it('formats percentages and units', () => {
    render(
      <>
        <NumberField
          label="Rate"
          locale="en-US"
          defaultValue={0.25}
          format={{ style: 'percent' }}
        />
        <NumberField
          label="Length"
          locale="en-US"
          defaultValue={12}
          format={{ style: 'unit', unit: 'meter' }}
        />
      </>,
    );
    expect(screen.getByLabelText('Rate')).toHaveValue('25%');
    expect(screen.getByLabelText('Length')).toHaveValue('12 m');
  });

  it('works as a controlled field', () => {
    function Controlled() {
      const [value, setValue] = React.useState<number | null>(5);
      return (
        <>
          <NumberField label="Wells" value={value} onValueChange={setValue} />
          <output data-testid="out">{String(value)}</output>
          <button type="button" onClick={() => setValue(42)}>
            set
          </button>
        </>
      );
    }
    render(<Controlled />);
    press(increase());
    expect(screen.getByTestId('out')).toHaveTextContent('6');
    fireEvent.click(screen.getByRole('button', { name: 'set' }));
    expect(input()).toHaveValue('42');
    type('');
    expect(screen.getByTestId('out')).toHaveTextContent('null');
  });

  it('ignores steps when disabled or read-only', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumberField label="Disabled" defaultValue={1} disabled onValueChange={onValueChange} />,
    );
    expect(input()).toBeDisabled();
    expect(increase()).toBeDisabled();
    expect(input().closest('.MuiOutlinedInput-root')).toHaveClass('Mui-disabled');
    rerender(
      <NumberField label="Read only" defaultValue={1} readOnly onValueChange={onValueChange} />,
    );
    expect(input()).toHaveAttribute('readonly');
    expect(input().closest('.MuiOutlinedInput-root')).toHaveClass('MuiInputBase-readOnly');
    expect(increase()).toHaveAttribute('aria-disabled', 'true');
    press(increase());
    act(() => input().focus());
    fireEvent.keyDown(input(), { key: 'ArrowUp' });
    expect(input()).toHaveValue('1');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows the error state with aria-invalid', () => {
    render(<NumberField label="Pressure" error helperText="Too high" required />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toBeRequired();
    expect(input().closest('.MuiOutlinedInput-root')).toHaveClass('Mui-error');
    expect(screen.getByText('Too high')).toHaveClass('Mui-error');
    expect(document.querySelector('.MuiInputLabel-root')).toHaveClass('Mui-error');
  });

  it('forwards the root ref, inputRef, sx/className and slot props', () => {
    const ref = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    render(
      <NumberField
        ref={ref}
        inputRef={inputRef}
        label="Count"
        size="small"
        fullWidth
        placeholder="0"
        name="count"
        className="custom"
        sx={{ mt: 1 }}
        data-testid="root"
        slotProps={{
          htmlInput: { 'data-testid': 'native' } as never,
          incrementButton: { 'aria-label': 'Plus' },
          decrementButton: { 'aria-label': 'Minus' },
          formHelperText: { className: 'helper' },
        }}
        helperText="Help"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('root'));
    expect(ref.current).toHaveClass('custom', 'MuiFormControl-fullWidth', numberFieldClasses.root);
    expect(inputRef.current).toBe(input());
    expect(screen.getByTestId('native')).toBe(input());
    expect(input()).toHaveAttribute('placeholder', '0');
    expect(input().closest('.MuiOutlinedInput-root')).toHaveClass('MuiInputBase-sizeSmall');
    expect(screen.getByRole('button', { name: 'Plus' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minus' })).toBeInTheDocument();
    expect(screen.getByText('Help')).toHaveClass('helper');
    // Base UI keeps a hidden native number input for form submission.
    expect(document.querySelector('input[name="count"]')).toHaveAttribute('type', 'number');
  });

  it('keeps the label shrunk while a placeholder is shown', () => {
    render(<NumberField label="Stations" placeholder="Enter a count" />);
    expect(input()).toHaveAttribute('placeholder', 'Enter a count');
    expect(screen.getByText('Stations')).toHaveAttribute('data-shrink', 'true');
  });

  it('server-renders with the label shrunk when a value is set', () => {
    const filled = renderToString(<NumberField label="Filled" defaultValue={7} />);
    expect(filled).toMatch(/<label[^>]*data-shrink="true"/);
    expect(filled).toContain('value="7"');
    const empty = renderToString(<NumberField label="Empty" />);
    expect(empty).toMatch(/<label[^>]*data-shrink="false"/);
  });

  it.each(['outlined', 'filled'] as const)(
    'shows a unit adornment before the stepper (%s)',
    (variant) => {
      render(
        <NumberField
          variant={variant}
          label="Rate"
          defaultValue={48}
          slotProps={{
            input: { endAdornment: <InputAdornment position="end">kHz</InputAdornment> },
          }}
        />,
      );
      const unit = screen.getByText('kHz').closest('.MuiInputAdornment-root')!;
      const stepper = document.querySelector(`.${numberFieldClasses.stepper}`)!;
      expect(unit.nextElementSibling).toBe(stepper);
      expect(unit.closest('.MuiInputBase-root')).toBe(input().closest('.MuiInputBase-root'));
      fireEvent.click(increase());
      expect(input()).toHaveValue('49');
    },
  );

  it.each(['light', 'dark'] as const)('renders in the %s Tecton theme', (mode) => {
    const errors = vi.spyOn(console, 'error');
    render(
      <ThemeProvider theme={getDefaultTheme(mode)}>
        <NumberField label="Themed" defaultValue={1} helperText="Help" />
        <NumberField variant="filled" label="Filled" defaultValue={2} helperText="Help" />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('Themed')).toHaveValue('1');
    expect(screen.getByLabelText('Filled')).toHaveValue('2');
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
