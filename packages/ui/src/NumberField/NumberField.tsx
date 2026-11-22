'use client';
// Outlined or filled number field with stacked increment/decrement buttons in the end adornment.
// Composes Base UI `NumberField` (MIT) with Material form components; adapted from the MIT "Number
// Field" recipe of mui/material-ui v9.5.0 (see THIRD_PARTY_NOTICES.md).
import * as React from 'react';
import clsx from 'clsx';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { styled } from '@mui/material/styles';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import InputAdornment, { type InputAdornmentProps } from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Icon from '../Icon/Icon.js';
import { cssVar } from '../styles/tecton/index.js';
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

export type {
  NumberFieldBaseProps,
  NumberFieldCommonSlotProps,
  NumberFieldFilledInputSlotProps,
  NumberFieldHtmlInputSlotProps,
  NumberFieldInputSlotProps,
} from '../internal/number-field/shared.js';

export interface NumberFieldSlotProps extends Omit<NumberFieldCommonSlotProps, 'input'> {
  /** Props of the input: `OutlinedInput`, or `FilledInput` when `variant="filled"`. */
  input?: NumberFieldInputSlotProps | NumberFieldFilledInputSlotProps;
  /** Props of the `InputAdornment` that holds the stepper buttons. */
  stepper?: Partial<InputAdornmentProps>;
  /** Props of the increment `IconButton` (for example a localized `aria-label`). */
  incrementButton?: Partial<IconButtonProps>;
  /** Props of the decrement `IconButton` (for example a localized `aria-label`). */
  decrementButton?: Partial<IconButtonProps>;
}

export interface NumberFieldProps extends NumberFieldBaseProps {
  /** The variant to use, as in `TextField`. Default `outlined`. */
  variant?: 'outlined' | 'filled';
  /** Props of the inner components. */
  slotProps?: NumberFieldSlotProps;
}

export const numberFieldClasses = {
  root: 'TectonNumberField-root',
  stepper: 'TectonNumberField-stepper',
  incrementButton: 'TectonNumberField-increment',
  decrementButton: 'TectonNumberField-decrement',
} as const;

// Same input typography and label states as `TextField` in the active theme.
const NumberFieldRoot = styled(FormControl, { name: 'TectonNumberField', slot: 'Root' })(
  ({ theme, variant }) => textFieldRootStyles(theme, { variant }) ?? {},
);

// The stepper sits flush against the right edge, inside the outline or the fill. A unit adornment
// before it keeps the usual gap to the stepper's divider.
const numberFieldInputStyles = {
  paddingRight: 0,
  ...unitAdornmentStyles,
  [`& .MuiInputAdornment-positionEnd:not(.${numberFieldClasses.stepper})`]: {
    marginInlineEnd: cssVar('space-100'),
  },
};

const OutlinedNumberFieldInput = styled(OutlinedInput, {
  name: 'TectonNumberField',
  slot: 'Input',
})(numberFieldInputStyles);

const FilledNumberFieldInput = styled(FilledInput, { name: 'TectonNumberField', slot: 'Input' })(
  numberFieldInputStyles,
);

const inputComponents = {
  outlined: OutlinedNumberFieldInput,
  filled: FilledNumberFieldInput,
} as const;

const Stepper = styled(InputAdornment, { name: 'TectonNumberField', slot: 'Stepper' })(
  ({ theme }) => ({
    flexDirection: 'column',
    alignSelf: 'stretch',
    height: 'auto',
    maxHeight: 'none',
    marginLeft: 0,
    borderLeft: `1px solid ${theme.palette.divider}`,
    '&.MuiInputAdornment-positionEnd': { marginLeft: 0 },
  }),
);

const StepperButton = styled(IconButton, { name: 'TectonNumberField', slot: 'StepperButton' })(
  ({ theme }) => ({
    flex: 1,
    minHeight: 0,
    paddingBlock: 0,
    paddingInline: theme.spacing(0.5),
    borderRadius: 0,
    // The arrows take the Select chevron colour of the field's variant and state (error included).
    ...selectIconStyles(theme),
    fontSize: cssVar('icon-size-100'),
    '&&.MuiIconButton-sizeSmall': { fontSize: cssVar('icon-size-50') },
    '&& [class*="tecton-"]': { fontSize: 'inherit' },
    // Read-only fields expose the buttons as aria-disabled (still focusable by assistive tech). The
    // selector out-ranks the chevron colours keyed off the input root.
    '.MuiInputBase-root &&[aria-disabled="true"]': {
      color: theme.palette.text.disabled,
      cursor: 'default',
      backgroundColor: 'transparent',
    },
    '&:first-of-type': { borderTopRightRadius: theme.shape.borderRadius },
    '&:last-of-type': { borderBottomRightRadius: theme.shape.borderRadius },
  }),
);

/**
 * A numeric input (`outlined` or `filled`) with a label, increment/decrement buttons, keyboard
 * stepping (Arrow keys, with Alt/Shift for the small/large step; Home/End jump to `min`/`max`),
 * locale-aware formatting through `format` and optional `min`/`max` clamping. Value handling is
 * Base UI's `NumberField`; the visuals are Material form components styled by the Tecton theme.
 */
export const NumberField = React.forwardRef<HTMLDivElement, NumberFieldProps>(
  function NumberField(props, ref) {
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
      slotProps = {},
      ...rootProps
    } = props;
    const { id, labelId, helperTextId } = useFieldIds(idProp);
    const Input = inputComponents[variant] as typeof OutlinedNumberFieldInput;
    const describedBy = joinIds(
      helperText != null && helperTextId,
      slotProps.htmlInput?.['aria-describedby'],
    );
    const {
      stepper,
      incrementButton,
      decrementButton,
      input,
      htmlInput,
      inputLabel,
      formHelperText,
    } = slotProps;

    return (
      <BaseNumberField.Root
        {...rootProps}
        id={id}
        ref={ref}
        render={(baseProps, state) => (
          <NumberFieldRoot
            {...(baseProps as Omit<typeof baseProps, 'color'>)}
            className={clsx(numberFieldClasses.root, className)}
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
        {label != null && label !== '' ? (
          <InputLabel
            htmlFor={id}
            id={labelId}
            // A shrunk label keeps the placeholder visible (MUI hides it under an empty label).
            shrink={placeholder ? true : undefined}
            {...inputLabel}
          >
            {label}
          </InputLabel>
        ) : null}
        <BaseNumberField.Input
          {...htmlInput}
          ref={inputRef}
          render={(inputProps, state) => (
            <Input
              placeholder={placeholder}
              readOnly={state.readOnly}
              {...input}
              value={state.inputValue}
              inputRef={inputProps.ref}
              slotProps={{
                input: {
                  ...inputProps,
                  'aria-invalid': inputProps['aria-invalid'] ?? (error || undefined),
                  'aria-describedby': describedBy,
                },
              }}
              endAdornment={
                <React.Fragment>
                  {input?.endAdornment}
                  <Stepper
                    position="end"
                    {...stepper}
                    className={clsx(numberFieldClasses.stepper, stepper?.className)}
                  >
                    <BaseNumberField.Increment
                      render={
                        <StepperButton
                          size={size}
                          aria-label="Increase"
                          {...incrementButton}
                          className={clsx(
                            numberFieldClasses.incrementButton,
                            incrementButton?.className,
                          )}
                        />
                      }
                    >
                      <Icon name="chevron-up-small" />
                    </BaseNumberField.Increment>
                    <BaseNumberField.Decrement
                      render={
                        <StepperButton
                          size={size}
                          aria-label="Decrease"
                          {...decrementButton}
                          className={clsx(
                            numberFieldClasses.decrementButton,
                            decrementButton?.className,
                          )}
                        />
                      }
                    >
                      <Icon name="chevron-down-small" />
                    </BaseNumberField.Decrement>
                  </Stepper>
                </React.Fragment>
              }
            />
          )}
        />
        {helperText != null ? (
          <FormHelperText id={helperTextId} {...formHelperText}>
            {helperText}
          </FormHelperText>
        ) : null}
      </BaseNumberField.Root>
    );
  },
);

export default NumberField;
