import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../../styles/index.js';
import ColorSwatchControl, {
  colorSwatchControlClasses,
  normalizeColorSwatchControlValue,
  type ColorSwatchControlProps,
} from '../index.js';
import * as root from '../../index.js';

function renderSwatch(
  props: Partial<ColorSwatchControlProps> & React.RefAttributes<HTMLSpanElement> = {},
) {
  const result = render(
    <ThemeProvider>
      <ColorSwatchControl aria-label="Fill color" {...props} />
    </ThemeProvider>,
  );
  const input = screen.getByLabelText('Fill color') as HTMLInputElement;
  const rootElement = result.container.querySelector<HTMLElement>(
    `.${colorSwatchControlClasses.root}`,
  )!;
  const label = rootElement.querySelector<HTMLElement>(`.${colorSwatchControlClasses.label}`)!;
  const swatch = rootElement.querySelector<HTMLElement>(`.${colorSwatchControlClasses.swatch}`)!;
  return { ...result, input, root: rootElement, label, swatch };
}

/** The CSS rules Emotion injected for the swatch (not the token style sheet). */
function swatchRules() {
  return Array.from(document.querySelectorAll('style'))
    .flatMap((style) => (style.textContent ?? '').split('\n'))
    .filter((rule) => rule.includes('TectonColorSwatchControl'))
    .join('\n');
}

describe('ColorSwatchControl', () => {
  it('is exported from the root and the subpath', () => {
    expect(root.ColorSwatchControl).toBe(ColorSwatchControl);
    expect(root.colorSwatchControlClasses).toBe(colorSwatchControlClasses);
    expect(root.normalizeColorSwatchControlValue).toBe(normalizeColorSwatchControlValue);
  });

  it('renders the color as a swatch beside its uppercase hex value', () => {
    const { input, root: rootElement, label, swatch } = renderSwatch({ defaultValue: '#218585' });
    expect(label).toHaveTextContent('#218585');
    expect(label).toHaveAttribute('dir', 'ltr');
    expect(swatch.style.getPropertyValue('--TectonColorSwatchControl-color')).toBe('#218585');
    expect(swatch).toHaveAttribute('aria-hidden', 'true');
    expect(input).toHaveAttribute('type', 'color');
    expect(input.value).toBe('#218585');
    expect(rootElement).toHaveClass(
      colorSwatchControlClasses.root,
      colorSwatchControlClasses.sizeMedium,
    );
    expect(rootElement).not.toHaveClass(colorSwatchControlClasses.inherited);
  });

  it('defaults to black', () => {
    const { input, label } = renderSwatch();
    expect(label).toHaveTextContent('#000000');
    expect(input.value).toBe('#000000');
  });

  describe('normalizeColorSwatchControlValue', () => {
    it.each([
      ['#218585', '#218585'],
      ['#abcdef', '#ABCDEF'],
      ['#abc', '#AABBCC'],
      ['abc', '#AABBCC'],
      ['  12ab9f ', '#12AB9F'],
      ['red', 'RED'],
      ['#12345', '#12345'],
    ])('%j becomes %j', (input, expected) => {
      expect(normalizeColorSwatchControlValue(input)).toBe(expected);
    });
  });

  it('expands and uppercases short hex values', () => {
    const { input, label } = renderSwatch({ value: '#a1c' });
    expect(label).toHaveTextContent('#AA11CC');
    expect(input.value).toBe('#aa11cc');
  });

  it('shows a value that is not a hex color as given, and opens the picker on black', () => {
    const { input, label, swatch } = renderSwatch({ value: 'red' });
    expect(label).toHaveTextContent('RED');
    expect(swatch.style.getPropertyValue('--TectonColorSwatchControl-color')).toBe('RED');
    expect(input.value).toBe('#000000');
  });

  it('uncontrolled: shows the picked color and reports it normalized', () => {
    const onChange = vi.fn();
    const { input, label } = renderSwatch({ defaultValue: '#218585', onChange });
    fireEvent.input(input, { target: { value: '#ff8800' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![1]).toBe('#FF8800');
    expect(onChange.mock.calls[0]![0].target).toBe(input);
    expect(label).toHaveTextContent('#FF8800');
  });

  it('controlled: follows the value prop only', () => {
    const onChange = vi.fn();
    const { input, label, rerender } = renderSwatch({ value: '#218585', onChange });
    fireEvent.input(input, { target: { value: '#ff8800' } });
    expect(onChange).toHaveBeenCalledWith(expect.anything(), '#FF8800');
    expect(label).toHaveTextContent('#218585');
    expect(input.value).toBe('#218585');
    rerender(
      <ThemeProvider>
        <ColorSwatchControl aria-label="Fill color" value="#FF8800" onChange={onChange} />
      </ThemeProvider>,
    );
    expect(label).toHaveTextContent('#FF8800');
    expect(input.value).toBe('#ff8800');
  });

  it('calls onChangeCommitted on the native change event only', () => {
    const onChange = vi.fn();
    const onChangeCommitted = vi.fn();
    const { input } = renderSwatch({ onChange, onChangeCommitted });
    // Dragging in the picker fires input events.
    fireEvent.input(input, { target: { value: '#110000' } });
    fireEvent.input(input, { target: { value: '#220000' } });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChangeCommitted).not.toHaveBeenCalled();
    // Closing the picker fires change.
    fireEvent.change(input, { target: { value: '#330000' } });
    expect(onChangeCommitted).toHaveBeenCalledTimes(1);
    expect(onChangeCommitted.mock.calls[0]![0]).toBeInstanceOf(Event);
    expect(onChangeCommitted.mock.calls[0]![1]).toBe('#330000');
  });

  it('stops listening for commits after unmounting', () => {
    const onChangeCommitted = vi.fn();
    const { input, unmount } = renderSwatch({ onChangeCommitted });
    unmount();
    input.value = '#123456';
    input.dispatchEvent(new Event('change'));
    expect(onChangeCommitted).not.toHaveBeenCalled();
  });

  it('has a small size', () => {
    const { root: rootElement } = renderSwatch({ size: 'small' });
    expect(rootElement).toHaveClass(colorSwatchControlClasses.sizeSmall);
    expect(rootElement).not.toHaveClass(colorSwatchControlClasses.sizeMedium);
  });

  it('marks an inherited color', () => {
    const { root: rootElement } = renderSwatch({ inherited: true });
    expect(rootElement).toHaveClass(colorSwatchControlClasses.inherited);
  });

  it('disables the input', () => {
    const { input, root: rootElement, label } = renderSwatch({ disabled: true });
    expect(input).toBeDisabled();
    expect(rootElement).toHaveClass('Mui-disabled');
    // The value text is inactive too, so contrast checkers skip it like the input's own text.
    expect(label).toHaveAttribute('aria-disabled', 'true');
  });

  describe('accessibility', () => {
    it('names the input and describes it with the visible hex value', () => {
      const { input, label } = renderSwatch({ defaultValue: '#218585' });
      expect(input).toHaveAccessibleName('Fill color');
      expect(input).toHaveAccessibleDescription('#218585');
      expect(label).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps a description given by the consumer', () => {
      render(
        <ThemeProvider>
          <span id="hint">Used for the outline</span>
          <ColorSwatchControl aria-label="Stroke" aria-describedby="hint" defaultValue="#abc" />
        </ThemeProvider>,
      );
      expect(screen.getByLabelText('Stroke')).toHaveAccessibleDescription(
        'Used for the outline #AABBCC',
      );
    });

    it('is labelled by a <label htmlFor> through id, or by aria-labelledby', () => {
      render(
        <ThemeProvider>
          <label htmlFor="fill">Fill</label>
          <ColorSwatchControl id="fill" />
          <span id="stroke-label">Stroke</span>
          <ColorSwatchControl aria-labelledby="stroke-label" />
        </ThemeProvider>,
      );
      expect(screen.getByLabelText('Fill')).toHaveAttribute('id', 'fill');
      expect(screen.getByLabelText('Stroke')).toHaveAttribute('type', 'color');
    });

    it('takes the keyboard focus', async () => {
      const user = userEvent.setup();
      const { input } = renderSwatch();
      await user.tab();
      expect(input).toHaveFocus();
    });

    it("draws Tecton's pink focus ring, not the Storybook saffron, on keyboard focus", () => {
      renderSwatch();
      const rules = swatchRules();
      const ring = new RegExp(
        String.raw`:has\(\.TectonColorSwatchControl-input:focus-visible\)\{[^}]*outline:var\(--tecton-border-width-200\) solid var\(--tecton-color-focus-ring\);outline-offset:1px`,
      );
      expect(rules).toMatch(ring);
      expect(rules).not.toContain('saffron');
      // The fill does not change on hover or focus (the lighter filled-input fills vanish on light
      // surfaces).
      expect(rules).not.toContain('color-input-filled-bg-hover');
      expect(rules).not.toContain('color-input-filled-bg-focus');
    });
  });

  it('passes id, name, tabIndex, autoFocus, refs and slotProps to the right elements', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const { input, root: rootElement } = renderSwatch({
      ref,
      inputRef,
      id: 'fill',
      name: 'fill',
      tabIndex: -1,
      autoFocus: true,
      className: 'custom',
      title: 'Fill',
      slotProps: { input: { form: 'style-form', className: 'custom-input' } },
    });
    expect(ref.current).toBe(rootElement);
    expect(inputRef.current).toBe(input);
    expect(rootElement).toHaveClass('custom');
    expect(rootElement).toHaveAttribute('title', 'Fill');
    expect(rootElement).not.toHaveAttribute('id');
    expect(input).toHaveAttribute('id', 'fill');
    expect(input).toHaveAttribute('name', 'fill');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('form', 'style-form');
    expect(input).toHaveClass(colorSwatchControlClasses.input, 'custom-input');
    expect(input).toHaveFocus();
  });

  it('submits its value with a form', () => {
    const { container } = render(
      <ThemeProvider>
        <form>
          <ColorSwatchControl name="fill" defaultValue="#ABC" />
        </form>
      </ThemeProvider>,
    );
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('fill')).toBe('#aabbcc');
  });

  it('renders on the server', () => {
    const html = renderToString(
      <ThemeProvider>
        <ColorSwatchControl aria-label="Fill color" defaultValue="#218585" size="small" inherited />
      </ThemeProvider>,
    );
    expect(html).toContain('#218585');
    expect(html).toContain('type="color"');
    expect(html).toContain(colorSwatchControlClasses.inherited);
  });
});
