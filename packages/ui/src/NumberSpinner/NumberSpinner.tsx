'use client';
// Number input with decrement/increment buttons on both sides of the value. Composes Base UI
// `NumberField` (MIT) with Material form components; adapted from the MIT "Number Spinner" recipe
// of mui/material-ui v9.5.0 (see THIRD_PARTY_NOTICES.md).
import * as React from 'react';
import clsx from 'clsx';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { styled } from '@mui/material/styles';
import Button, { type ButtonProps } from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Icon from '../Icon/Icon.js';
import {
  SSRInitialFilled,
  joinIds,
  textFieldRootStyles,
  useFieldIds,
  type NumberFieldBaseProps,
  type NumberFieldCommonSlotProps,
} from '../internal/number-field/shared.js';

export interface NumberSpinnerSlotProps extends NumberFieldCommonSlotProps {
  /** Props of the increment `Button` (for example a localized `aria-label`). */
  incrementButton?: Partial<ButtonProps>;
  /** Props of the decrement `Button` (for example a localized `aria-label`). */
  decrementButton?: Partial<ButtonProps>;
}

export interface NumberSpinnerProps extends NumberFieldBaseProps {
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
  ({ theme }) => textFieldRootStyles(theme, { variant: 'outlined' }) ?? {},
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

const Group = styled('div', { name: 'TectonNumberSpinner', slot: 'Group' })({
  display: 'flex',
  width: '100%',
});

const SpinnerInput = styled(OutlinedInput, { name: 'TectonNumberSpinner', slot: 'Input' })({
  flex: 1,
  borderRadius: 0,
  '& .MuiInputBase-input': { textAlign: 'center' },
});

const SpinnerButton = styled(Button, { name: 'TectonNumberSpinner', slot: 'Button' })(
  ({ theme }) => ({
    minWidth: 0,
    flexShrink: 0,
    aspectRatio: '1 / 1',
    paddingInline: 0,
    borderColor: theme.palette.divider,
    // Read-only fields expose the buttons as aria-disabled (still focusable by assistive tech).
    '&[aria-disabled="true"]': {
      color: theme.palette.text.disabled,
      cursor: 'default',
      backgroundColor: 'transparent',
    },
    // The input's outline is the shared border between the buttons and the value.
    '&.TectonNumberSpinner-decrement': {
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
      borderInlineEndWidth: 0,
    },
    '&.TectonNumberSpinner-increment': {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      borderInlineStartWidth: 0,
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
            variant="outlined"
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
          <BaseNumberField.Decrement
            render={
              <SpinnerButton
                variant="outlined"
                size={size}
                aria-label="Decrease"
                {...decrementButton}
                className={clsx(numberSpinnerClasses.decrementButton, decrementButton?.className)}
              />
            }
          >
            <Icon name="remove" size={size === 'small' ? 'small' : 'medium'} />
          </BaseNumberField.Decrement>
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
          <BaseNumberField.Increment
            render={
              <SpinnerButton
                variant="outlined"
                size={size}
                aria-label="Increase"
                {...incrementButton}
                className={clsx(numberSpinnerClasses.incrementButton, incrementButton?.className)}
              />
            }
          >
            <Icon name="add" size={size === 'small' ? 'small' : 'medium'} />
          </BaseNumberField.Increment>
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
