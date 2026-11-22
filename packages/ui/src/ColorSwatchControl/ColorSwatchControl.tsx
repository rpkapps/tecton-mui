'use client';
// Color Swatch: a single-color input styled as a filled input (Tecton "Atoms/Color Swatch"). A
// rounded swatch sits beside the uppercase hex value; the whole control opens the browser's color
// picker. Material UI has no color input, so this one is composed from a native
// `<input type="color">` and Tecton tokens:
//
// - The native input is the control. It covers the whole swatch with opacity 0 (as MUI's
//   `SwitchBase` covers a checkbox), so a click anywhere opens the picker under the control, the
//   value takes part in forms (`name`), and labels, focus and keyboard work natively.
// - Keyboard focus draws Tecton's pink focus ring (`color-focus-ring`, 2px after a 1px gap, as
//   `theme.focusVisible`), not the saffron ring of the Tecton Storybook story.
// - Sizes follow the filled input: 32px medium, 28px small.
import * as React from 'react';
import clsx from 'clsx';
import useControlled from '@mui/utils/useControlled';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';

export const colorSwatchControlClasses = {
  root: 'TectonColorSwatchControl-root',
  sizeSmall: 'TectonColorSwatchControl-sizeSmall',
  sizeMedium: 'TectonColorSwatchControl-sizeMedium',
  /** On the root of a swatch that shows an inherited color (`inherited`). */
  inherited: 'TectonColorSwatchControl-inherited',
  /** On the root of a disabled swatch. */
  disabled: 'Mui-disabled',
  swatch: 'TectonColorSwatchControl-swatch',
  label: 'TectonColorSwatchControl-label',
  input: 'TectonColorSwatchControl-input',
} as const;

const SHORT_HEX = /^#?([0-9a-f]{3})$/i;
const LONG_HEX = /^#?([0-9a-f]{6})$/i;
const DEFAULT_VALUE = '#000000';

/**
 * Normalizes a hex color to uppercase `#RRGGBB`: three-digit colors are expanded and a missing `#`
 * is added. Any other string is only trimmed and uppercased.
 */
export function normalizeColorSwatchControlValue(value: string): string {
  const color = value.trim();
  const long = LONG_HEX.exec(color);
  if (long) return `#${long[1]!.toUpperCase()}`;
  const short = SHORT_HEX.exec(color);
  if (short) {
    const [r, g, b] = short[1]!.toUpperCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return color.toUpperCase();
}

export interface ColorSwatchControlSlotProps {
  /** Props of the native `<input type="color">` (for example `data-*` attributes or `form`). */
  input?: React.InputHTMLAttributes<HTMLInputElement>;
}

export interface ColorSwatchControlProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'onChange' | 'defaultValue' | 'color' | 'id' | 'tabIndex'
> {
  /** The color (controlled): a `#RRGGBB` or `#RGB` hex color. */
  value?: string;
  /** The initial color (uncontrolled). Default `#000000`. */
  defaultValue?: string;
  /**
   * Called whenever the user changes the color, also while dragging in the picker. `value` is the
   * new color as uppercase `#RRGGBB`.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  /**
   * Called once the user commits a color, usually when the picker closes (the native `change`
   * event). `value` is the color as uppercase `#RRGGBB`.
   */
  onChangeCommitted?: (event: Event, value: string) => void;
  /**
   * `small` matches the small filled input (28px), `medium` the medium one (32px). Default
   * `medium`.
   */
  size?: 'small' | 'medium';
  /**
   * Shows that the color is inherited (from a parent item, a layer or a default) instead of set on
   * this item: the swatch draws a smaller square. Picking a color still calls `onChange`.
   */
  inherited?: boolean;
  /** Disables the swatch. */
  disabled?: boolean;
  /** The `id` of the input, for a `<label htmlFor>`. */
  id?: string;
  /** The `name` of the input, submitted with its form. */
  name?: string;
  /** Focuses the input on mount. */
  autoFocus?: boolean;
  /** The `tabIndex` of the input. */
  tabIndex?: number;
  /** Ref to the native input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Props of the inner parts. */
  slotProps?: ColorSwatchControlSlotProps;
  sx?: SxProps<Theme>;
}

const ColorSwatchRoot = styled('span', { name: 'TectonColorSwatchControl', slot: 'Root' })(
  ({ theme }) => ({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: cssVar('space-50'),
    boxSizing: 'border-box',
    height: cssVar('space-400'),
    paddingInline: cssVar('space-100'),
    borderRadius: cssVar('radius-50'),
    backgroundColor: cssVar('color-input-filled-bg'),
    color: cssVar('color-input-filled-text-value'),
    fontFamily: theme.typography.fontFamily,
    fontSize: cssVar('font-size-medium'),
    fontWeight: cssVar('font-weight-medium'),
    lineHeight: cssVar('line-height-medium'),
    verticalAlign: 'middle',
    cursor: 'pointer',
    userSelect: 'none',
    // The fill stays the same on hover and focus, as in the Tecton story. The filled input's
    // hover and focus fills (`color-input-filled-bg-hover` / `-focus`) are lighter than its rest
    // fill and, in light mode, match the page and card surfaces: the swatch would vanish under
    // the pointer.
    // Tecton's pink keyboard focus ring, drawn like `theme.focusVisible` (an outline, so it stays
    // visible in forced colors mode). Browsers do not match :focus-visible on a color input
    // focused with the mouse.
    [`&:has(.${colorSwatchControlClasses.input}:focus-visible)`]: {
      outline: `${cssVar('border-width-200')} solid ${cssVar('color-focus-ring')}`,
      outlineOffset: '1px',
    },
    [`&.${colorSwatchControlClasses.sizeSmall}`]: {
      height: `calc(${cssVar('space-400')} - ${cssVar('space-50')})`,
      fontSize: cssVar('font-size-small'),
      fontWeight: cssVar('font-weight-small'),
      lineHeight: cssVar('line-height-small'),
    },
    [`&.${colorSwatchControlClasses.disabled}`]: {
      backgroundColor: cssVar('color-disabled-filled-bg'),
      color: cssVar('color-disabled-filled-text'),
      cursor: 'default',
    },
  }),
);

const ColorSwatchSwatch = styled('span', { name: 'TectonColorSwatchControl', slot: 'Swatch' })({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  width: cssVar('icon-size-150'),
  height: cssVar('icon-size-150'),
  borderRadius: cssVar('radius-25'),
  backgroundColor: 'var(--TectonColorSwatchControl-color)',
  [`.${colorSwatchControlClasses.sizeSmall} > &`]: {
    width: cssVar('icon-size-100'),
    height: cssVar('icon-size-100'),
  },
  // Inherited: a half-size square of the color in an empty swatch.
  [`.${colorSwatchControlClasses.inherited} > &`]: {
    backgroundColor: 'transparent',
    '&::after': {
      content: '""',
      width: '50%',
      height: '50%',
      borderRadius: cssVar('radius-25'),
      backgroundColor: 'var(--TectonColorSwatchControl-color)',
    },
  },
});

const ColorSwatchLabel = styled('span', { name: 'TectonColorSwatchControl', slot: 'Label' })({
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

const ColorSwatchInput = styled('input', { name: 'TectonColorSwatchControl', slot: 'Input' })({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  padding: 0,
  border: 0,
  opacity: 0,
  cursor: 'inherit',
});

/**
 * A color input styled as a filled input: a swatch of the color beside its hex value. Clicking it,
 * or pressing Enter or Space while it has the focus, opens the browser's color picker.
 */
export const ColorSwatchControl = React.forwardRef<HTMLSpanElement, ColorSwatchControlProps>(
  function ColorSwatchControl(
    {
      value: valueProp,
      defaultValue = DEFAULT_VALUE,
      onChange,
      onChangeCommitted,
      size = 'medium',
      inherited = false,
      disabled = false,
      id,
      name,
      autoFocus,
      tabIndex,
      inputRef,
      slotProps,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...other
    },
    ref,
  ) {
    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: 'ColorSwatchControl',
      state: 'value',
    });
    const color = normalizeColorSwatchControlValue(value);
    // The native input only holds `#rrggbb`; anything else opens the picker on black.
    const inputValue = LONG_HEX.test(color) ? color.toLowerCase() : DEFAULT_VALUE;
    const labelId = `${React.useId()}-value`;

    const inputElement = React.useRef<HTMLInputElement | null>(null);
    const handleInputRef = useForkRef(inputRef, inputElement);
    const { input: inputSlotProps } = slotProps ?? {};

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = normalizeColorSwatchControlValue(event.target.value);
      setValue(next);
      onChange?.(event, next);
    };

    // React's onChange follows the native `input` event; the native `change` event marks the
    // commit.
    const handleCommit = useEventCallback((event: Event) => {
      const target = event.target as HTMLInputElement;
      onChangeCommitted?.(event, normalizeColorSwatchControlValue(target.value));
    });
    React.useEffect(() => {
      const input = inputElement.current;
      if (!input) return undefined;
      input.addEventListener('change', handleCommit);
      return () => input.removeEventListener('change', handleCommit);
    }, [handleCommit]);

    return (
      <ColorSwatchRoot
        ref={ref}
        className={clsx(
          colorSwatchControlClasses.root,
          size === 'small'
            ? colorSwatchControlClasses.sizeSmall
            : colorSwatchControlClasses.sizeMedium,
          inherited && colorSwatchControlClasses.inherited,
          disabled && colorSwatchControlClasses.disabled,
          className,
        )}
        {...other}
      >
        <ColorSwatchSwatch
          aria-hidden
          className={colorSwatchControlClasses.swatch}
          style={{ '--TectonColorSwatchControl-color': color } as React.CSSProperties}
        />
        {/* The hex value reads left to right in RTL too ("#218585", not "218585#"). It is text of
            the input, so it shares its disabled state (inactive controls are exempt from the text
            contrast minimum, and checkers such as axe skip text marked so). */}
        <ColorSwatchLabel
          aria-hidden
          aria-disabled={disabled || undefined}
          id={labelId}
          dir="ltr"
          className={colorSwatchControlClasses.label}
        >
          {color}
        </ColorSwatchLabel>
        <ColorSwatchInput
          type="color"
          id={id}
          name={name}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...inputSlotProps}
          // The visible hex value describes the input, so screen readers announce it.
          aria-describedby={clsx(ariaDescribedBy, inputSlotProps?.['aria-describedby'], labelId)}
          className={clsx(colorSwatchControlClasses.input, inputSlotProps?.className)}
          ref={handleInputRef}
          value={inputValue}
          onChange={handleChange}
        />
      </ColorSwatchRoot>
    );
  },
);

export default ColorSwatchControl;
