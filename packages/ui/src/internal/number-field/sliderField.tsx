'use client';
// Parts shared by `NumberSlider` and `NumberRangeSlider` around the bar: the field root, the row
// that holds the bar and the input, the input and the details object of bar changes.
import * as React from 'react';
import type { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { styled, type CSSObject, type Theme } from '@mui/material/styles';
import FilledInput from '@mui/material/FilledInput';
import { cssVar } from '../../styles/tecton/index.js';
import {
  textFieldRootStyles,
  unitAdornmentStyles,
  type NumberFieldFilledInputSlotProps,
} from './shared.js';

/** Props of the `FilledInput` of a slider field, for example an `endAdornment` with a unit. */
export type NumberSliderInputSlotProps = NumberFieldFilledInputSlotProps;

/** Width of the input in characters (the longest formatted limit), set on the group. */
const CHARS_VAR = '--TectonNumberSlider-input-chars';

/**
 * Root styles: the `TextField` typography and label states of the active theme, and a default
 * width (bar and input 128px each) unless `fullWidth` is set. A width set through `sx` wins.
 */
export function sliderFieldRootStyles({
  theme,
  fullWidth,
}: {
  theme: Theme;
  fullWidth?: boolean;
}): CSSObject {
  return {
    ...textFieldRootStyles(theme, { variant: 'filled' }),
    ...(!fullWidth && { width: `calc(2 * ${cssVar('space-1600')} + ${cssVar('space-50')})` }),
  };
}

/** The row with the bar and the input. They share the width evenly by default. */
export const SliderGroup = styled('div', {
  name: 'TectonNumberSlider',
  slot: 'Group',
  shouldForwardProp: (prop) => prop !== 'chars',
})<{ chars: number }>(({ chars }) => ({
  [CHARS_VAR]: chars,
  display: 'flex',
  alignItems: 'stretch',
  gap: cssVar('space-50'),
  width: '100%',
}));

// The value sits at the end, next to an optional unit. The input never gets narrower than its
// longest value, so the bar gives way first in a tight layout.
export const SliderInput = styled(FilledInput, { name: 'TectonNumberSlider', slot: 'Input' })({
  flex: '1 1 50%',
  minWidth: `calc(var(${CHARS_VAR}) * 1ch + ${cssVar('space-400')})`,
  '& .MuiInputBase-input': { textAlign: 'end' },
  ...unitAdornmentStyles,
});

/** Character count of the longest of `values` formatted like the input shows them. */
export function useInputChars(
  locale: Intl.LocalesArgument | undefined,
  format: Intl.NumberFormatOptions | undefined,
  ...values: number[]
) {
  const key = values.join(' ');
  return React.useMemo(() => {
    const formatter = new Intl.NumberFormat(locale, format);
    return Math.max(2, ...key.split(' ').map((value) => formatter.format(Number(value)).length));
  }, [locale, format, key]);
}

/**
 * Change details for a value set with the bar. They have the shape of Base UI's own details
 * (reason `scrub`, the pointer event, `cancel()`), so `onValueChange` sees one kind of object.
 */
export function barChangeDetails(
  event: PointerEvent,
  trigger: Element,
): BaseNumberField.Root.ChangeEventDetails {
  let canceled = false;
  let propagationAllowed = false;
  return {
    reason: 'scrub',
    event,
    trigger,
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
  };
}
