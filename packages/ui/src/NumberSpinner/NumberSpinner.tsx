'use client';
// Number input with decrement/increment buttons at both ends of the value. Composes Base UI
// `NumberField` (MIT) with Material form components; adapted from the MIT "Number Spinner" recipe
// of mui/material-ui v9.5.0 (see THIRD_PARTY_NOTICES.md).
import * as React from 'react';
import clsx from 'clsx';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { styled } from '@mui/material/styles';
import Button, { type ButtonProps } from '@mui/material/Button';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Icon from '../Icon/Icon.js';
import { INPUT_FOCUS_VISIBLE_SELECTOR, cssVar, focusRingShadow } from '../styles/tecton/index.js';
import {
  SSRInitialFilled,
  joinIds,
  selectIconStyles,
  textFieldRootStyles,
  unitAdornmentStyles,
  useFieldIds,
  type NumberFieldBaseProps,
  type NumberFieldCommonSlotProps,
  type NumberFieldFilledInputSlotProps,
  type NumberFieldInputSlotProps,
} from '../internal/number-field/shared.js';

export interface NumberSpinnerSlotProps extends Omit<NumberFieldCommonSlotProps, 'input'> {
  /** Props of the input: `OutlinedInput`, or `FilledInput` when `variant="filled"`. */
  input?: NumberFieldInputSlotProps | NumberFieldFilledInputSlotProps;
  /** Props of the increment `Button` (for example a localized `aria-label`). */
  incrementButton?: Partial<ButtonProps>;
  /** Props of the decrement `Button` (for example a localized `aria-label`). */
  decrementButton?: Partial<ButtonProps>;
}

export interface NumberSpinnerProps extends NumberFieldBaseProps {
  /** The variant to use, as in `TextField`. Default `outlined`. */
  variant?: 'outlined' | 'filled';
  /**
   * Turns off scrubbing: by default, dragging the label horizontally changes the value
   * (pointer lock; not in Safari). Keyboard and button stepping are unaffected.
   */
  disableScrub?: boolean;
  /** Props of the inner components. */
  slotProps?: NumberSpinnerSlotProps;
}

export const numberSpinnerClasses = {
  root: 'TectonNumberSpinner-root',
  scrubArea: 'TectonNumberSpinner-scrubArea',
  group: 'TectonNumberSpinner-group',
  incrementButton: 'TectonNumberSpinner-increment',
  decrementButton: 'TectonNumberSpinner-decrement',
} as const;

// Same input typography and label states as `TextField` in the active theme.
const NumberSpinnerRoot = styled(FormControl, { name: 'TectonNumberSpinner', slot: 'Root' })(
  ({ theme, variant }) => textFieldRootStyles(theme, { variant }) ?? {},
);

const ScrubArea = styled('span', { name: 'TectonNumberSpinner', slot: 'ScrubArea' })({
  alignSelf: 'flex-start',
  userSelect: 'none',
  cursor: 'ew-resize',
  '& .MuiInputLabel-root': { cursor: 'inherit' },
});

const ScrubCursor = styled(Icon, { name: 'TectonNumberSpinner', slot: 'ScrubCursor' })({
  transform: 'rotate(45deg)',
});

// Keyboard focus rings the whole control (both buttons and the value), not the value alone.
const Group = styled('div', { name: 'TectonNumberSpinner', slot: 'Group' })({
  display: 'flex',
  width: '100%',
  borderRadius: cssVar('radius-50'),
  [`&:has(.MuiInputBase-root${INPUT_FOCUS_VISIBLE_SELECTOR})`]: { boxShadow: focusRingShadow },
});

// The buttons sit inside the input, at its two ends: one outline (or fill) wraps the buttons and
// the value, with no dividers between them. The value, and a unit after it, is centred between the
// buttons.
const spinnerInputStyles = {
  flex: 1,
  paddingInline: 0,
  '& .MuiInputBase-input': {
    width: 'auto',
    flex: '0 1 auto',
    minWidth: 0,
    paddingInline: 0,
    textAlign: 'center',
  },
  ...unitAdornmentStyles,
  [`&&${INPUT_FOCUS_VISIBLE_SELECTOR}`]: { boxShadow: 'none' },
} as const;

// On keyboard focus Tecton turns an outlined input's border to its active colour. Here the ring
// surrounds the whole control, so the outline keeps its colour (red in error).
const OutlinedSpinnerInput = styled(OutlinedInput, {
  name: 'TectonNumberSpinner',
  slot: 'Input',
})({
  ...spinnerInputStyles,
  [`&&${INPUT_FOCUS_VISIBLE_SELECTOR}:not(.Mui-error) .MuiOutlinedInput-notchedOutline`]: {
    borderColor: cssVar('color-input-outlined-border'),
  },
});

const FilledSpinnerInput = styled(FilledInput, { name: 'TectonNumberSpinner', slot: 'Input' })(
  spinnerInputStyles,
);

const inputComponents = { outlined: OutlinedSpinnerInput, filled: FilledSpinnerInput } as const;

// Square text buttons at the ends of the input. The minus and plus take the Select chevron colour
// of the field's variant and state, like the arrows of `NumberField`.
const SpinnerButton = styled(Button, { name: 'TectonNumberSpinner', slot: 'Button' })(
  ({ theme }) => ({
    // Square: as wide as the input is high. An explicit width (not `aspect-ratio`) lets the field
    // size itself to the buttons and the value.
    width: cssVar('space-400'),
    '.MuiInputBase-sizeSmall &': { width: `calc(${cssVar('space-400')} - ${cssVar('space-50')})` },
    minWidth: 0,
    minHeight: 0,
    height: 'auto',
    flexShrink: 0,
    alignSelf: 'stretch',
    padding: 0,
    borderRadius: 0,
    ...selectIconStyles(theme),
    // In a filled field the hover shows in the icon colour only: the field's own hover fill is
    // behind the buttons, and a lighter square on top would split the bar.
    '.MuiFilledInput-root &:hover, .MuiFilledInput-root &:active': {
      backgroundColor: 'transparent',
    },
    // Read-only fields expose the buttons as aria-disabled (still focusable by assistive tech). The
    // selector out-ranks the chevron colours keyed off the input root.
    '.MuiInputBase-root &&[aria-disabled="true"]': {
      color: theme.palette.text.disabled,
      cursor: 'default',
      backgroundColor: 'transparent',
    },
    // The free space goes between the buttons and the value, which keeps the value centred.
    [`&.${numberSpinnerClasses.decrementButton}`]: {
      marginInlineEnd: 'auto',
      borderStartStartRadius: 'inherit',
      borderEndStartRadius: 'inherit',
    },
    [`&.${numberSpinnerClasses.incrementButton}`]: {
      marginInlineStart: 'auto',
      borderStartEndRadius: 'inherit',
      borderEndEndRadius: 'inherit',
    },
  }),
);

/**
 * A numeric input between decrement and increment buttons, for small counts and quantities. Shares
 * the value, stepping and formatting behavior of `NumberField` (Base UI `NumberField`); the label
 * doubles as a scrub area unless `disableScrub` is set.
 */
export const NumberSpinner = React.forwardRef<HTMLDivElement, NumberSpinnerProps>(
  function NumberSpinner(props, ref) {
    const {
      id: idProp,
      label,
      helperText,
      error = false,
      size = 'medium',
      variant = 'outlined',
      fullWidth = false,
      placeholder,
      inputRef,
      className,
      style,
      sx,
      disableScrub = false,
      slotProps = {},
      ...rootProps
    } = props;
    const { id, labelId, helperTextId } = useFieldIds(idProp);
    const { incrementButton, decrementButton, input, htmlInput, inputLabel, formHelperText } =
      slotProps;
    const describedBy = joinIds(
      helperText != null && helperTextId,
      htmlInput?.['aria-describedby'],
    );
    const minLength = rootProps.min != null ? String(rootProps.min).length : 0;
    const SpinnerInput = inputComponents[variant] as typeof OutlinedSpinnerInput;
    const iconSize = size === 'small' ? 'small' : 'medium';

    const labelElement =
      label != null && label !== '' ? (
        <InputLabel htmlFor={id} id={labelId} shrink {...inputLabel}>
          {label}
        </InputLabel>
      ) : null;

    return (
      <BaseNumberField.Root
        {...rootProps}
        id={id}
        ref={ref}
        render={(baseProps, state) => (
          <NumberSpinnerRoot
            {...(baseProps as Omit<typeof baseProps, 'color'>)}
            className={clsx(numberSpinnerClasses.root, className)}
            style={style}
            sx={sx}
            size={size}
            fullWidth={fullWidth}
            disabled={state.disabled}
            required={state.required}
            error={error}
            variant={variant}
          />
        )}
      >
        <SSRInitialFilled value={rootProps.value} defaultValue={rootProps.defaultValue} />
        {labelElement && !disableScrub ? (
          <BaseNumberField.ScrubArea
            render={<ScrubArea className={numberSpinnerClasses.scrubArea} />}
          >
            {labelElement}
            <BaseNumberField.ScrubAreaCursor>
              <ScrubCursor name="expand-content" size="small" />
            </BaseNumberField.ScrubAreaCursor>
          </BaseNumberField.ScrubArea>
        ) : (
          labelElement
        )}
        <Group className={numberSpinnerClasses.group}>
          <BaseNumberField.Input
            {...htmlInput}
            ref={inputRef}
            render={(inputProps, state) => (
              <SpinnerInput
                placeholder={placeholder}
                readOnly={state.readOnly}
                {...input}
                value={state.inputValue}
                inputRef={inputProps.ref}
                startAdornment={
                  <React.Fragment>
                    <BaseNumberField.Decrement
                      render={
                        <SpinnerButton
                          size={size}
                          aria-label="Decrease"
                          {...decrementButton}
                          className={clsx(
                            numberSpinnerClasses.decrementButton,
                            decrementButton?.className,
                          )}
                        />
                      }
                    >
                      <Icon name="remove" size={iconSize} />
                    </BaseNumberField.Decrement>
                    {input?.startAdornment}
                  </React.Fragment>
                }
                endAdornment={
                  <React.Fragment>
                    {input?.endAdornment}
                    <BaseNumberField.Increment
                      render={
                        <SpinnerButton
                          size={size}
                          aria-label="Increase"
                          {...incrementButton}
                          className={clsx(
                            numberSpinnerClasses.incrementButton,
                            incrementButton?.className,
                          )}
                        />
                      }
                    >
                      <Icon name="add" size={iconSize} />
                    </BaseNumberField.Increment>
                  </React.Fragment>
                }
                slotProps={{
                  input: {
                    ...inputProps,
                    size: Math.max(minLength, state.inputValue.length || 1) + 1,
                    'aria-invalid': inputProps['aria-invalid'] ?? (error || undefined),
                    'aria-describedby': describedBy,
                  },
                }}
              />
            )}
          />
        </Group>
        {helperText != null ? (
          <FormHelperText id={helperTextId} {...formHelperText}>
            {helperText}
          </FormHelperText>
        ) : null}
      </BaseNumberField.Root>
    );
  },
);

export default NumberSpinner;
