'use client';
// The bar of `NumberSlider` and `NumberRangeSlider`: a filled surface tinted up to the value (or
// between the two values of a range) with a line at each value. Pressing or dragging it sets the
// nearest value; on a range, dragging the tinted part between the two lines moves both values
// together. It is a pointer shortcut only: the number inputs next to it carry the value for the
// keyboard and assistive technology, so the bar is `aria-hidden` and not focusable.
import * as React from 'react';
import clsx from 'clsx';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../../styles/tecton/index.js';

export interface SliderBarSlotProps {
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
}

/** Class names of the bar parts, per component (`TectonNumberSlider-rail`, ...). */
export interface SliderBarClasses {
  rail: string;
  track: string;
  thumb: string;
}

export interface SliderBarProps extends SliderBarSlotProps {
  /** One value, or the start and end of a range. `null` (an empty field) shows no thumb. */
  values: readonly (number | null)[];
  min: number;
  max: number;
  step: number | 'any';
  disabled?: boolean;
  readOnly?: boolean;
  classes: SliderBarClasses;
  /** Runs when the bar is pressed, before the value changes. */
  onPress?: () => void;
  /**
   * Called with the new values while dragging. Returns `false` when the change was canceled; the
   * drag then keeps the previous value.
   */
  onValuesChange: (values: number[], event: PointerEvent, trigger: Element) => boolean;
  /** Called with the final values when a drag that changed them ends. */
  onValuesCommitted: (values: number[], event: PointerEvent) => void;
}

const THUMB_WIDTH = '--TectonNumberSlider-thumb-width';
// The thumbs stay inside the bar: at `min` a thumb touches the start, at `max` the end.
const offset = (ratio: number) => `calc(${ratio} * (100% - var(${THUMB_WIDTH})))`;
// The tinted part lets the bar's surface (and its hover colour) show through.
const tint = (color: string) => `color-mix(in srgb, ${color} 25%, transparent)`;

const Rail = styled('div', { name: 'TectonNumberSlider', slot: 'Rail' })({
  [THUMB_WIDTH]: cssVar('space-50'),
  position: 'relative',
  // Half of the row, like the input (a basis of 0 would count the input's padding against the bar).
  flex: '1 1 50%',
  minWidth: cssVar('space-800'),
  overflow: 'hidden',
  borderRadius: cssVar('radius-50'),
  backgroundColor: cssVar('color-input-filled-bg'),
  // Like the scrub area of `NumberSpinner`: the bar is dragged sideways.
  cursor: 'ew-resize',
  touchAction: 'none',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  '&:hover, &[data-dragging]': { backgroundColor: cssVar('color-input-filled-bg-hover') },
  // While dragging, the cursor of the drag stays on, whichever part of the bar is under the pointer.
  // (`&&` outranks the cursor of the track.)
  '&&[data-dragging] *': { cursor: 'inherit' },
  '&[data-dragging="range"]': { cursor: 'grabbing' },
  '&[data-readonly]': { cursor: 'default', backgroundColor: cssVar('color-input-filled-bg') },
  '&[data-disabled]': { cursor: 'default', backgroundColor: cssVar('color-disabled-filled-bg') },
});

// The colours are those of the Tecton `Slider` (`color="primary"`): the lilac accent, and the
// disabled text colour. The Slider's hovered-thumb tone (`accent-lilac-muted`) is not used: in light
// mode it is almost the colour of the tinted bar, so a hovered thumb would disappear. Hover shows on
// the bar's surface instead.

// The part of the bar up to the value, or between the two values: a tint of the Slider colour.
const Track = styled('span', { name: 'TectonNumberSlider', slot: 'Track' })({
  position: 'absolute',
  insetBlock: 0,
  backgroundColor: tint(cssVar('color-accent-lilac-main')),
  // The part between the two values of a range is grabbed to move both of them.
  '[data-range] > &': { cursor: 'grab' },
  '[data-readonly] > &, [data-disabled] > &': { cursor: 'inherit' },
  '[data-disabled] > &': { backgroundColor: tint(cssVar('color-text-disabled')) },
});

// A full-height line at each value in the Slider colour.
const Thumb = styled('span', { name: 'TectonNumberSlider', slot: 'Thumb' })({
  position: 'absolute',
  insetBlock: 0,
  width: `var(${THUMB_WIDTH})`,
  backgroundColor: cssVar('color-accent-lilac-main'),
  '[data-disabled] > &': { backgroundColor: cssVar('color-text-disabled') },
  // A wider, invisible grab area, so that a thumb next to the track of a range can be taken (with the
  // resize cursor of the bar) rather than the track.
  '&::before': {
    content: '""',
    position: 'absolute',
    insetBlock: 0,
    insetInline: `calc(-1 * ${cssVar('space-100')})`,
  },
});

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Number of decimal places of `value`, including values written in exponent notation. */
function decimalPlaces(value: number) {
  const [mantissa = '', exponent = '0'] = value.toExponential().split('e');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent));
}

/** Rounds `value` to the nearest step counted from `min`, without floating-point noise. */
export function roundToStep(value: number, min: number, max: number, step: number | 'any') {
  if (step === 'any' || !(step > 0)) {
    return clamp(value, min, max);
  }
  const stepped = min + Math.round((value - min) / step) * step;
  const precision = Math.min(100, Math.max(decimalPlaces(step), decimalPlaces(min)));
  return clamp(Number(stepped.toFixed(precision)), min, max);
}

/** `value + delta` without floating-point noise, at the precision of the step and the value. */
function shift(value: number, delta: number, min: number, step: number | 'any') {
  if (step === 'any' || !(step > 0)) {
    return value + delta;
  }
  const precision = Math.min(
    100,
    Math.max(decimalPlaces(step), decimalPlaces(min), decimalPlaces(value)),
  );
  return Number((value + delta).toFixed(precision));
}

/** Position of `value` on the bar, from 0 (`min`) to 1 (`max`). */
function toRatio(value: number, min: number, max: number) {
  return max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
}

/** Index of the value a press at `value` moves: the nearest one, or toward the press on a tie. */
function closestIndex(values: readonly (number | null)[], value: number) {
  if (values.length < 2) {
    return 0;
  }
  const [start, end] = values;
  if (start == null) return 0;
  if (end == null) return 1;
  const toStart = Math.abs(value - start);
  const toEnd = Math.abs(value - end);
  if (toStart === toEnd) {
    return value < start ? 0 : 1;
  }
  return toStart < toEnd ? 0 : 1;
}

interface DragState {
  pointerId: number;
  /** `thumb` moves the value at `index`; `range` moves both values of a range together. */
  mode: 'thumb' | 'range';
  index: number;
  /** The value under the pointer when the drag started. */
  origin: number;
  /** The values when the drag started. */
  initial: (number | null)[];
  values: (number | null)[];
  changed: boolean;
}

export function SliderBar(props: SliderBarProps) {
  const {
    values,
    min,
    max,
    step,
    disabled = false,
    readOnly = false,
    classes,
    onPress,
    onValuesChange,
    onValuesCommitted,
    className,
    style,
    sx,
  } = props;
  const thumbRef = React.useRef<HTMLSpanElement>(null);
  const trackRef = React.useRef<HTMLSpanElement>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const [dragging, setDragging] = React.useState<DragState['mode'] | null>(null);
  const range = values.length > 1;
  const ratios = values.map((value) => (value == null ? null : toRatio(value, min, max)));

  /** The value under the pointer, with the thumb centred on it. */
  const valueAtPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const rect = rail.getBoundingClientRect();
    const thumb = thumbRef.current?.offsetWidth ?? 0;
    const span = rect.width - thumb;
    if (span <= 0) {
      return min;
    }
    const rtl = getComputedStyle(rail).direction === 'rtl';
    const distance = rtl ? rect.right - event.clientX : event.clientX - rect.left;
    const position = clamp((distance - thumb / 2) / span, 0, 1);
    return roundToStep(min + position * (max - min), min, max, step);
  };

  /** The values of a range moved by the distance the pointer travelled, keeping its width. */
  const shiftedRange = (drag: DragState, event: React.PointerEvent<HTMLDivElement>) => {
    const [start, end] = drag.initial as [number, number];
    // The range stops at `min` and `max`. A range wider than the bar does not move.
    const delta = clamp(
      valueAtPointer(event) - drag.origin,
      Math.min(0, min - start),
      Math.max(0, max - end),
    );
    return [shift(start, delta, min, step), shift(end, delta, min, step)];
  };

  const update = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    if (drag.mode === 'range') {
      const nextValues = shiftedRange(drag, event);
      if (nextValues.every((value, i) => value === drag.values[i])) {
        return;
      }
      if (!onValuesChange(nextValues, event.nativeEvent, event.currentTarget)) {
        return;
      }
      drag.values = nextValues;
      drag.changed = true;
      return;
    }
    const { index } = drag;
    let next = valueAtPointer(event);
    // A range thumb stops at the other thumb.
    if (range) {
      next =
        index === 0 ? Math.min(next, drag.values[1] ?? max) : Math.max(next, drag.values[0] ?? min);
    }
    if (next === drag.values[index]) {
      return;
    }
    const nextValues = drag.values.map((value, i) => (i === index ? next : (value ?? next)));
    if (!onValuesChange(nextValues, event.nativeEvent, event.currentTarget)) {
      return;
    }
    drag.values = nextValues;
    drag.changed = true;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || readOnly || event.button !== 0 || dragRef.current) {
      return;
    }
    onPress?.();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const origin = valueAtPointer(event);
    // A press on the track between the two values of a range grabs the whole range; it moves only
    // once the pointer does. Anywhere else (including a thumb's grab area) moves the nearest value.
    const mode =
      range &&
      values.every((value) => value != null) &&
      event.target instanceof Node &&
      trackRef.current?.contains(event.target)
        ? 'range'
        : 'thumb';
    dragRef.current = {
      pointerId: event.pointerId,
      mode,
      index: closestIndex(values, origin),
      origin,
      initial: [...values],
      values: [...values],
      changed: false,
    };
    setDragging(mode);
    if (mode === 'thumb') {
      update(event);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      update(event);
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(null);
    if (drag.changed) {
      onValuesCommitted(drag.values as number[], event.nativeEvent);
    }
  };

  const [startRatio, endRatio] = ratios;
  let trackStyle: React.CSSProperties;
  if (!range) {
    trackStyle = { insetInlineStart: 0, width: startRatio == null ? 0 : offset(startRatio) };
  } else if (startRatio == null || endRatio == null) {
    trackStyle = { display: 'none' };
  } else {
    // Between the inner edges of the two thumbs.
    trackStyle = {
      insetInlineStart: `calc(${offset(startRatio)} + var(${THUMB_WIDTH}))`,
      width: `max(0px, calc(${offset(endRatio)} - ${offset(startRatio)} - var(${THUMB_WIDTH})))`,
    };
  }

  return (
    <Rail
      aria-hidden
      sx={sx}
      className={clsx(classes.rail, className)}
      style={style}
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      data-range={range ? '' : undefined}
      data-dragging={dragging ?? undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
    >
      <Track ref={trackRef} className={classes.track} style={trackStyle} />
      {ratios.map((ratio, index) => (
        <Thumb
          key={index}
          ref={index === 0 ? thumbRef : undefined}
          className={classes.thumb}
          data-index={index}
          style={{
            insetInlineStart: offset(ratio ?? 0),
            // An empty field has no position; the thumb stays measurable for the pointer maths.
            visibility: ratio == null ? 'hidden' : undefined,
          }}
        />
      ))}
    </Rail>
  );
}
