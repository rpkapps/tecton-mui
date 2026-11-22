'use client';
// Filled number input next to a bar that shows where the value sits between `min` and `max`;
// dragging or pressing the bar sets the value. The input composes Base UI `NumberField` (MIT) with
// Material form components, like `NumberField` and `NumberSpinner` (see THIRD_PARTY_NOTICES.md).
// The bar is this library's own (`internal/number-field/SliderBar.tsx`).
import * as React from 'react';
import clsx from 'clsx';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import useControlled from '@mui/utils/useControlled';
import useForkRef from '@mui/utils/useForkRef';
import {
  SSRInitialFilled,
  joinIds,
  useFieldIds,
  type NumberFieldBaseProps,
  type NumberFieldCommonSlotProps,
} from '../internal/number-field/shared.js';
import { SliderBar, type SliderBarSlotProps } from '../internal/number-field/SliderBar.js';
import {
  SliderGroup,
  SliderInput,
  barChangeDetails,
  sliderFieldRootStyles,
  useInputChars,
  type NumberSliderInputSlotProps,
} from '../internal/number-field/sliderField.js';

export type { NumberSliderInputSlotProps } from '../internal/number-field/sliderField.js';
export type NumberSliderRailSlotProps = SliderBarSlotProps;

export interface NumberSliderSlotProps extends Omit<NumberFieldCommonSlotProps, 'input'> {
  /** Props of the `FilledInput` that shows the value, for example an `endAdornment` with a unit. */
  input?: NumberSliderInputSlotProps;
  /** Props of the bar. */
  rail?: NumberSliderRailSlotProps;
}

export interface NumberSliderProps extends Omit<NumberFieldBaseProps, 'min' | 'max'> {
  /** The value at the start of the bar. Default `0`. */
  min?: number;
  /** The value at the end of the bar. Default `100`. */
  max?: number;
  /** Props of the inner components. */
  slotProps?: NumberSliderSlotProps;
}

export const numberSliderClasses = {
  root: 'TectonNumberSlider-root',
  group: 'TectonNumberSlider-group',
  rail: 'TectonNumberSlider-rail',
  track: 'TectonNumberSlider-track',
  thumb: 'TectonNumberSlider-thumb',
  input: 'TectonNumberSlider-input',
} as const;

const NumberSliderRoot = styled(FormControl, { name: 'TectonNumberSlider', slot: 'Root' })(
  sliderFieldRootStyles,
);

/**
 * A filled number input next to a bar that shows the value's position between `min` (default 0)
 * and `max` (default 100). Press or drag the bar to set the value; it snaps to `step`. The input
 * has the value, stepping, formatting and keyboard behavior of `NumberField` (Base UI
 * `NumberField`). The bar is a pointer shortcut: it is hidden from assistive technology because the
 * input offers the same actions.
 */
export const NumberSlider = React.forwardRef<HTMLDivElement, NumberSliderProps>(
  function NumberSlider(props, ref) {
    const {
      id: idProp,
      label,
      helperText,
      error = false,
      size = 'medium',
      fullWidth = false,
      placeholder,
      inputRef: inputRefProp,
      className,
      style,
      sx,
      slotProps = {},
      min = 0,
      max = 100,
      step = 1,
      value: valueProp,
      defaultValue,
      onValueChange,
      onValueCommitted,
      ...rootProps
    } = props;
    const { id, labelId, helperTextId } = useFieldIds(idProp);
    const { rail, input, htmlInput, inputLabel, formHelperText } = slotProps;
    const describedBy = joinIds(
      helperText != null && helperTextId,
      htmlInput?.['aria-describedby'],
    );
    const [value, setValue] = useControlled<number | null>({
      controlled: valueProp,
      default: defaultValue ?? null,
      name: 'NumberSlider',
      state: 'value',
    });
    const ownInputRef = React.useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef(inputRefProp, ownInputRef);
    const inputChars = useInputChars(rootProps.locale, rootProps.format, min, max);

    const handleValueChange = (
      next: number | null,
      details: BaseNumberField.Root.ChangeEventDetails,
    ) => {
      onValueChange?.(next, details);
      if (!details.isCanceled) {
        setValue(next);
      }
    };

    return (
      <BaseNumberField.Root
        {...rootProps}
        id={id}
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleValueChange}
        onValueCommitted={onValueCommitted}
        render={(baseProps, state) => (
          <NumberSliderRoot
            {...(baseProps as Omit<typeof baseProps, 'color'>)}
            className={clsx(numberSliderClasses.root, className)}
            style={style}
            sx={sx}
            size={size}
            fullWidth={fullWidth}
            disabled={state.disabled}
            required={state.required}
            error={error}
            variant="filled"
          />
        )}
      >
        <SSRInitialFilled value={value} />
        {label != null && label !== '' ? (
          <InputLabel htmlFor={id} id={labelId} shrink {...inputLabel}>
            {label}
          </InputLabel>
        ) : null}
        <SliderGroup className={numberSliderClasses.group} chars={inputChars}>
          <SliderBar
            {...rail}
            classes={numberSliderClasses}
            values={[value]}
            min={min}
            max={max}
            step={step}
            disabled={rootProps.disabled}
            readOnly={rootProps.readOnly}
            onPress={() => {
              // Commit text typed into the input first, so the bar's value is not overwritten on blur.
              const inputElement = ownInputRef.current;
              if (inputElement && inputElement.ownerDocument.activeElement === inputElement) {
                inputElement.blur();
              }
            }}
            onValuesChange={([next = null], event, trigger) => {
              const details = barChangeDetails(event, trigger);
              onValueChange?.(next, details);
              if (details.isCanceled) {
                return false;
              }
              setValue(next);
              return true;
            }}
            onValuesCommitted={([next = null], event) =>
              onValueCommitted?.(next, { reason: 'scrub', event })
            }
          />
          <BaseNumberField.Input
            {...htmlInput}
            ref={handleInputRef}
            render={(inputProps, state) => (
              <SliderInput
                placeholder={placeholder}
                readOnly={state.readOnly}
                {...input}
                className={clsx(numberSliderClasses.input, input?.className)}
                value={state.inputValue}
                inputRef={inputProps.ref}
                slotProps={{
                  input: {
                    ...inputProps,
                    'aria-invalid': inputProps['aria-invalid'] ?? (error || undefined),
                    'aria-describedby': describedBy,
                  },
                }}
              />
            )}
          />
        </SliderGroup>
        {helperText != null ? (
          <FormHelperText id={helperTextId} {...formHelperText}>
            {helperText}
          </FormHelperText>
        ) : null}
      </BaseNumberField.Root>
    );
  },
);

export default NumberSlider;
