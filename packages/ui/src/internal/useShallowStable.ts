'use client';
import * as React from 'react';

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }
  return aKeys.every(
    (key) => Object.is(a[key], b[key]) && Object.prototype.hasOwnProperty.call(b, key),
  );
}

/**
 * Returns the previous object while the new one is shallowly equal, so inline objects such as
 * `slots={{ item: MyItem }}` keep a stable identity (the Community component remounts items
 * when the slot identity changes).
 */
export function useShallowStable<T extends object | undefined>(value: T): T {
  const [stable, setStable] = React.useState(value);
  if (stable === value) {
    return stable;
  }
  if (
    stable != null &&
    value != null &&
    shallowEqual(stable as Record<string, unknown>, value as Record<string, unknown>)
  ) {
    return stable;
  }
  // Derived state update during render (React re-renders immediately with the new value).
  setStable(() => value);
  return value;
}
