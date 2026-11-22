'use client';
// Shared parts of NumberField and NumberSpinner. Both compose the Base UI number field
// (`@base-ui/react/number-field`, MIT) with Material form components, adapted from the MIT recipes
// on the Material UI "Number Field" page (mui/material-ui v9.5.0). See THIRD_PARTY_NOTICES.md.
import * as React from 'react';
import type { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import type { CSSObject, SxProps, Theme } from '@mui/material/styles';
import type { FilledInputProps } from '@mui/material/FilledInput';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import type { InputLabelProps } from '@mui/material/InputLabel';
import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { cssVar } from '../../styles/tecton/index.js';

type BaseRootProps = BaseNumberField.Root.Props;

/**
 * Props shared by `NumberField` and `NumberSpinner`: the Base UI `NumberField.Root` props (value,
 * stepping, formatting, form and state props) plus the Material field props.
 */
export interface NumberFieldBaseProps extends Omit<
  BaseRootProps,
  'render' | 'className' | 'style' | 'inputRef' | 'children' | 'color'
> {
  /** The label content. */
  label?: React.ReactNode;
  /** Helper or error text shown below the field and linked with `aria-describedby`. */
  helperText?: React.ReactNode;
  /** Shows the error state. The field also gets `aria-invalid`. */
  error?: boolean;
  /** The size of the field. Default `medium`. */
  size?: 'small' | 'medium';
  /** Takes the full width of the container. */
  fullWidth?: boolean;
  /** Placeholder text shown while the field is empty. The label then stays shrunk. */
  placeholder?: string;
  /** Ref of the visible `<input>` element. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Class name of the root element. */
  className?: string;
  /** Inline style of the root element. */
  style?: React.CSSProperties;
  /** System prop for styles of the root element. */
  sx?: SxProps<Theme>;
}

/** Input props that the number field controls itself (value, handlers and element). */
type ControlledInputProps =
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'inputRef'
  | 'inputProps'
  | 'slotProps'
  | 'slots'
  | 'inputComponent'
  | 'multiline'
  | 'rows'
  | 'minRows'
  | 'maxRows'
  | 'type';

/**
 * Props for the Material input (`OutlinedInput`). The value and its handlers belong to Base UI.
 * `endAdornment` (usually an `InputAdornment` with a unit) sits after the value, before any stepper
 * buttons.
 */
export type NumberFieldInputSlotProps = Partial<Omit<OutlinedInputProps, ControlledInputProps>>;

/** Props for the `FilledInput` of a `variant="filled"` field. */
export type NumberFieldFilledInputSlotProps = Partial<Omit<FilledInputProps, ControlledInputProps>>;

/** Attributes and handlers of the native `<input>`. Handlers run before the Base UI handlers. */
export type NumberFieldHtmlInputSlotProps = Omit<
  BaseNumberField.Input.Props,
  'render' | 'className' | 'style' | 'value' | 'defaultValue'
> & {
  className?: string;
  style?: React.CSSProperties;
};

export interface NumberFieldCommonSlotProps {
  /** Props of the `OutlinedInput`. */
  input?: NumberFieldInputSlotProps;
  /** Attributes of the native `<input>` element. */
  htmlInput?: NumberFieldHtmlInputSlotProps;
  /** Props of the `InputLabel`. */
  inputLabel?: Partial<InputLabelProps>;
  /** Props of the `FormHelperText`. */
  formHelperText?: Partial<FormHelperTextProps>;
}

/**
 * Placeholder child of `FormControl` that sets the initial filled state on the server: FormControl
 * reads `value`/`defaultValue` from a child whose `muiName` is `Input`, so the label is shrunk in
 * the first render when the field has a value. Renders nothing.
 */
export function SSRInitialFilled(_props: { value?: number | null; defaultValue?: number | null }) {
  return null;
}
SSRInitialFilled.muiName = 'Input';

/** Stable ids of the input, its label and its helper text. */
export function useFieldIds(idProp: string | undefined) {
  const generated = React.useId();
  const id = idProp ?? generated;
  return { id, labelId: `${id}-label`, helperTextId: `${id}-helper-text` };
}

/**
 * Root styles of `TextField` from the active theme (`components.MuiTextField.styleOverrides.root`),
 * so that number fields use the same input typography and label states as text fields.
 */
export function textFieldRootStyles(
  theme: Theme,
  ownerState: Record<string, unknown>,
): CSSObject | undefined {
  const root = theme.components?.MuiTextField?.styleOverrides?.root as unknown;
  if (typeof root === 'function') {
    return (root as (props: { theme: Theme; ownerState: Record<string, unknown> }) => CSSObject)({
      theme,
      ownerState,
    });
  }
  return root && typeof root === 'object' ? (root as CSSObject) : undefined;
}

/**
 * Closed-chevron styles of `Select` from the active theme (`components.MuiSelect.styleOverrides
 * .icon`). They key the colour off the input root (`.MuiOutlinedInput-root.Mui-error &`, ...), so the
 * stepper buttons of a number field get the Select chevron colour in every variant and state.
 */
export function selectIconStyles(theme: Theme): CSSObject | undefined {
  const icon = theme.components?.MuiSelect?.styleOverrides?.icon as unknown;
  if (typeof icon === 'function') {
    return (icon as (props: { theme: Theme; ownerState: Record<string, unknown> }) => CSSObject)({
      theme,
      ownerState: {},
    });
  }
  return icon && typeof icon === 'object' ? (icon as CSSObject) : undefined;
}

/**
 * A unit in an end or start adornment (`<InputAdornment position="end">Hz</InputAdornment>`) is
 * quieter than the value: the small text style in the input's adornment colour.
 */
export const unitAdornmentStyles: CSSObject = {
  '& .MuiInputAdornment-root .MuiTypography-root': {
    color: 'inherit',
    fontSize: cssVar('font-size-small'),
    fontWeight: cssVar('font-weight-small'),
    lineHeight: cssVar('line-height-small'),
  },
};

/** Joins `aria-describedby` ids, skipping empty values. */
export function joinIds(...ids: (string | undefined | false)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined || undefined;
}
