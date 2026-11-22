'use client';
// A range of two numbers: a bar with two thumbs next to one filled input that holds both values
// ("10 – 50"). Each value is a Base UI `NumberField` (MIT); the input box is a Material `FilledInput`
// whose `inputComponent` holds the two number inputs, so the Tecton theme styles it like the input of
// `NumberSlider` (see THIRD_PARTY_NOTICES.md). The bar is this library's own.
import * as React from 'react';
import clsx from 'clsx';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import FormHelperText, { type FormHelperTextProps } from '@mui/material/FormHelperText';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import InputLabel, { type InputLabelProps } from '@mui/material/InputLabel';
import useControlled from '@mui/utils/useControlled';
import useForkRef from '@mui/utils/useForkRef';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { cssVar } from '../styles/tecton/index.js';
import { joinIds, useFieldIds } from '../internal/number-field/shared.js';
import { SliderBar, type SliderBarSlotProps } from '../internal/number-field/SliderBar.js';
import {
  SliderGroup,
  SliderInput,
  barChangeDetails,
  sliderFieldRootStyles,
  useInputChars,
  type NumberSliderInputSlotProps,
} from '../internal/number-field/sliderField.js';

type BaseRootProps = BaseNumberField.Root.Props;
export type NumberRangeSliderValue = [number, number];

/** Attributes of one of the two native `<input>` elements (start or end). */
export type NumberRangeSliderHtmlInputSlotProps = Omit<
  BaseNumberField.Input.Props,
  'render' | 'className' | 'style' | 'value' | 'defaultValue'
> & {
  className?: string;
  style?: React.CSSProperties;
};

export interface NumberRangeSliderSlotProps {
  /** Props of the `FilledInput` that holds both values, for example an `endAdornment` with a unit. */
  input?: NumberSliderInputSlotProps;
  /** Attributes of the native `<input>` of the start value. */
  startInput?: NumberRangeSliderHtmlInputSlotProps;
  /** Attributes of the native `<input>` of the end value. */
  endInput?: NumberRangeSliderHtmlInputSlotProps;
  /** Props of the bar. */
  rail?: SliderBarSlotProps;
  /** Props of the `InputLabel`. */
  inputLabel?: Partial<InputLabelProps>;
  /** Props of the `FormHelperText`. */
  formHelperText?: Partial<FormHelperTextProps>;
}

export interface NumberRangeSliderProps extends Pick<
  BaseRootProps,
  | 'smallStep'
  | 'largeStep'
  | 'snapOnStep'
  | 'format'
  | 'locale'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'name'
  | 'form'
  | 'allowWheelScrub'
> {
  /** The range, `[start, end]` with `start <= end` (controlled). */
  value?: NumberRangeSliderValue;
  /** The initial range when uncontrolled. Default `[min, max]`. */
  defaultValue?: NumberRangeSliderValue;
  /** Called when either value changes: typing, stepping or dragging the bar. */
  onValueChange?: (
    value: NumberRangeSliderValue,
    details: BaseNumberField.Root.ChangeEventDetails,
  ) => void;
  /** Called when a change is complete (on blur after typing, per key press, or when a drag ends). */
  onValueCommitted?: (
    value: NumberRangeSliderValue,
    details: BaseNumberField.Root.CommitEventDetails,
  ) => void;
  /** The value at the start of the bar. Default `0`. */
  min?: number;
  /** The value at the end of the bar. Default `100`. */
  max?: number;
  /** Amount for one arrow key press, and the step the bar snaps to. Default `1`. */
  step?: number | 'any';
  /**
   * Accessible name of the start (`0`) and end (`1`) input. By default each input is named by the
   * label followed by "minimum" or "maximum"; pass this to localize the names.
   */
  getAriaLabel?: (index: 0 | 1) => string;
  /** Id of the start input; the end input gets `${id}-end`. */
  id?: string;
  /** The label content. */
  label?: React.ReactNode;
  /** Helper or error text shown below the field and linked with `aria-describedby`. */
  helperText?: React.ReactNode;
  /** Shows the error state. The inputs also get `aria-invalid`. */
  error?: boolean;
  /** The size of the field. Default `medium`. */
  size?: 'small' | 'medium';
  /** Takes the full width of the container. */
  fullWidth?: boolean;
  /** Class name of the root element. */
  className?: string;
  /** Inline style of the root element. */
  style?: React.CSSProperties;
  /** System prop for styles of the root element. */
  sx?: SxProps<Theme>;
  /** Props of the inner components. */
  slotProps?: NumberRangeSliderSlotProps;
}

export const numberRangeSliderClasses = {
  root: 'TectonNumberRangeSlider-root',
  group: 'TectonNumberRangeSlider-group',
  rail: 'TectonNumberRangeSlider-rail',
  track: 'TectonNumberRangeSlider-track',
  thumb: 'TectonNumberRangeSlider-thumb',
  input: 'TectonNumberRangeSlider-input',
  separator: 'TectonNumberRangeSlider-separator',
} as const;

const DEFAULT_NAMES = ['minimum', 'maximum'] as const;

const NumberRangeSliderRoot = styled(FormControl, {
  name: 'TectonNumberRangeSlider',
  slot: 'Root',
})(sliderFieldRootStyles);

// Takes the place of the native input inside the `FilledInput`, with its padding and typography:
// the two values sit at the end, around a dash.
const InputsRoot = styled('span', { name: 'TectonNumberRangeSlider', slot: 'Inputs' })({
  '&&': {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: cssVar('space-100'),
    cursor: 'text',
  },
});

const PartRoot = styled('span', { name: 'TectonNumberRangeSlider', slot: 'Part' })({
  display: 'contents',
});

const HtmlInput = styled('input', { name: 'TectonNumberRangeSlider', slot: 'HtmlInput' })({
  font: 'inherit',
  letterSpacing: 'inherit',
  color: 'inherit',
  WebkitTextFillColor: 'inherit',
  opacity: 1,
  padding: 0,
  margin: 0,
  border: 0,
  outline: 0,
  background: 'none',
  minWidth: '1ch',
  boxSizing: 'content-box',
  textAlign: 'end',
});

interface InputsProps {
  className?: string;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  /** The two number fields and the dash, rendered by `NumberRangeSlider`. */
  parts?: React.ReactNode;
}

/**
 * `inputComponent` of the `FilledInput`. It receives the input props of `InputBase`; it keeps the
 * class names and the focus handlers (focus events of both inputs bubble to them, so the field looks
 * focused while either value has focus) and gives `InputBase` the start input as its input element.
 */
const Inputs = React.forwardRef<HTMLInputElement, InputsProps>(function Inputs(props, ref) {
  const { className, onFocus, onBlur, parts } = props;
  const rootRef = React.useRef<HTMLSpanElement>(null);
  // The start input exists once the parts are mounted.
  React.useImperativeHandle(
    ref,
    () => rootRef.current?.querySelector('input') as HTMLInputElement,
    [],
  );
  return (
    <InputsRoot ref={rootRef} className={className} onFocus={onFocus} onBlur={onBlur}>
      {parts}
    </InputsRoot>
  );
});

/**
 * A range of two numbers between `min` (default 0) and `max` (default 100): a bar with two thumbs
 * next to one filled input that shows both values. Press or drag the bar to move the nearest thumb;
 * a thumb stops at the other one. Drag the tinted part between the thumbs to move the whole range,
 * keeping its width, until it reaches `min` or `max`. Each value can be typed or stepped with the keyboard like a
 * `NumberField`; the start value never exceeds the end value. The bar is a pointer shortcut and is
 * hidden from assistive technology.
 */
export const NumberRangeSlider = React.forwardRef<HTMLDivElement, NumberRangeSliderProps>(
  function NumberRangeSlider(props, ref) {
    const {
      id: idProp,
      label,
      helperText,
      error = false,
      size = 'medium',
      fullWidth = false,
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
      getAriaLabel,
      ...numberProps
    } = props;
    const { id, labelId, helperTextId } = useFieldIds(idProp);
    const { rail, input, startInput, endInput, inputLabel, formHelperText } = slotProps;
    const [value, setValue] = useControlled<NumberRangeSliderValue>({
      controlled: valueProp,
      default: defaultValue ?? [min, max],
      name: 'NumberRangeSlider',
      state: 'value',
    });
    const rootRef = React.useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(ref, rootRef);
    const chars = useInputChars(numberProps.locale, numberProps.format, min, max);
    const hasLabel = label != null && label !== '';
    const ids = [id, `${id}-end`] as const;

    const withValue = (index: 0 | 1, next: number): NumberRangeSliderValue =>
      index === 0 ? [next, value[1]] : [value[0], next];

    const handlePartChange = (
      index: 0 | 1,
      next: number | null,
      details: BaseNumberField.Root.ChangeEventDetails,
    ) => {
      // An emptied input keeps the range: it shows the previous value again on blur.
      if (next == null) {
        return;
      }
      const nextValue = withValue(index, next);
      onValueChange?.(nextValue, details);
      if (!details.isCanceled) {
        setValue(nextValue);
      }
    };

    const renderPart = (index: 0 | 1) => {
      const htmlInput = index === 0 ? startInput : endInput;
      const ariaLabel = getAriaLabel?.(index);
      return (
        <BaseNumberField.Root
          {...numberProps}
          id={ids[index]}
          min={index === 0 ? min : value[0]}
          max={index === 0 ? value[1] : max}
          step={step}
          value={value[index]}
          onValueChange={(next, details) => handlePartChange(index, next, details)}
          onValueCommitted={(next, details) =>
            onValueCommitted?.(next == null ? value : withValue(index, next), details)
          }
          render={<PartRoot />}
        >
          <BaseNumberField.Input
            {...htmlInput}
            render={(inputProps, state) => (
              <HtmlInput
                {...inputProps}
                value={state.inputValue}
                style={{ width: `${Math.max(1, state.inputValue.length)}ch`, ...htmlInput?.style }}
                aria-label={ariaLabel}
                aria-labelledby={
                  ariaLabel == null ? joinIds(hasLabel && labelId, `${ids[index]}-name`) : undefined
                }
                aria-invalid={inputProps['aria-invalid'] ?? (error || undefined)}
                aria-describedby={joinIds(
                  helperText != null && helperTextId,
                  htmlInput?.['aria-describedby'],
                )}
              />
            )}
          />
        </BaseNumberField.Root>
      );
    };

    const parts = (
      <React.Fragment>
        {renderPart(0)}
        <span aria-hidden className={numberRangeSliderClasses.separator}>
          –
        </span>
        {renderPart(1)}
      </React.Fragment>
    );

    return (
      <NumberRangeSliderRoot
        ref={handleRef}
        className={clsx(numberRangeSliderClasses.root, className)}
        style={style}
        sx={sx}
        size={size}
        fullWidth={fullWidth}
        disabled={numberProps.disabled}
        required={numberProps.required}
        error={error}
        variant="filled"
      >
        {hasLabel ? (
          <InputLabel htmlFor={id} id={labelId} shrink {...inputLabel}>
            {label}
          </InputLabel>
        ) : null}
        {getAriaLabel == null
          ? DEFAULT_NAMES.map((name, index) => (
              <span key={name} id={`${ids[index]}-name`} style={visuallyHidden}>
                {name}
              </span>
            ))
          : null}
        <SliderGroup className={numberRangeSliderClasses.group} chars={2 * chars + 2}>
          <SliderBar
            {...rail}
            classes={numberRangeSliderClasses}
            values={value}
            min={min}
            max={max}
            step={step}
            disabled={numberProps.disabled}
            readOnly={numberProps.readOnly}
            onPress={() => {
              // Commit text typed into either input first, so it does not overwrite the bar on blur.
              const active = rootRef.current?.ownerDocument.activeElement;
              if (active instanceof HTMLElement && rootRef.current?.contains(active)) {
                active.blur();
              }
            }}
            onValuesChange={(values, event, trigger) => {
              const details = barChangeDetails(event, trigger);
              const nextValue = values as NumberRangeSliderValue;
              onValueChange?.(nextValue, details);
              if (details.isCanceled) {
                return false;
              }
              setValue(nextValue);
              return true;
            }}
            onValuesCommitted={(values, event) =>
              onValueCommitted?.(values as NumberRangeSliderValue, { reason: 'scrub', event })
            }
          />
          <SliderInput
            {...input}
            className={clsx(numberRangeSliderClasses.input, input?.className)}
            // Marks the field as filled for the label; the inputs show the values.
            value={`${value[0]}–${value[1]}`}
            inputComponent={Inputs as React.ElementType<InputBaseComponentProps>}
            // `InputBase` passes unknown input props on to its `inputComponent`.
            slotProps={{ input: { parts } as InputBaseComponentProps }}
          />
        </SliderGroup>
        {helperText != null ? (
          <FormHelperText id={helperTextId} {...formHelperText}>
            {helperText}
          </FormHelperText>
        ) : null}
      </NumberRangeSliderRoot>
    );
  },
);

export default NumberRangeSlider;
