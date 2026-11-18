import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';

/**
 * Controlled/uncontrolled state with a stable setter. When `controlled` is defined it wins; the
 * setter always notifies `onChange` (if the value changed) and updates internal state otherwise.
 */
export function useControlled<T>(
  controlled: T | undefined,
  defaultValue: T | (() => T),
  onChange?: (value: T) => void,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : internal;
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const set = useEventCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next;
    if (Object.is(resolved, valueRef.current)) return;
    valueRef.current = resolved;
    if (!isControlled) setInternal(resolved);
    onChange?.(resolved);
  });
  return [value, set];
}

/** Returns a ref that always holds the latest value (read in event handlers/effects). */
export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}
