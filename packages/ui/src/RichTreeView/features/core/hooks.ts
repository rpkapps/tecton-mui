'use client';
import * as React from 'react';
import type { KeyedEmitter } from './KeyedEmitter.js';

/**
 * Subscribes a component to one key of a `KeyedEmitter`. `getSnapshot` must return a
 * primitive (or a referentially stable value) so React can bail out when nothing changed.
 */
export function useKeyedSnapshot<T>(emitter: KeyedEmitter, key: string, getSnapshot: () => T): T {
  const subscribe = React.useCallback(
    (listener: () => void) => emitter.subscribeKey(key, listener),
    [emitter, key],
  );
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Subscribes a component to every emit of a `KeyedEmitter`. */
export function useGlobalSnapshot<T>(emitter: KeyedEmitter, getSnapshot: () => T): T {
  return React.useSyncExternalStore(emitter.subscribe, getSnapshot, getSnapshot);
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- handlers of any event type
type AnyHandler = ((...args: any[]) => void) | undefined;

/** Calls `first` then `second` (when defined). */
export function composeHandlers<H extends AnyHandler>(first: H, second: H): H {
  if (!first) {
    return second;
  }
  if (!second) {
    return first;
  }
  return ((...args: unknown[]) => {
    first(...args);
    second(...args);
  }) as H;
}

type SlotProps = Record<string, unknown>;
type SlotPropsValue = SlotProps | ((ownerState: never) => SlotProps) | undefined;

/**
 * Merges extra props into a slot props value (object or `(ownerState) => props` function).
 * Event handlers present on both sides are chained (consumer first); other extra props win.
 */
export function mergeSlotProps(
  external: SlotPropsValue,
  extra: SlotProps,
): SlotProps | ((ownerState: never) => SlotProps) {
  const merge = (resolved: SlotProps | undefined): SlotProps => {
    const result: SlotProps = { ...resolved, ...extra };
    if (resolved) {
      for (const key of Object.keys(extra)) {
        const own = resolved[key];
        const added = extra[key];
        if (/^on[A-Z]/.test(key) && typeof own === 'function' && typeof added === 'function') {
          result[key] = composeHandlers(own as AnyHandler, added as AnyHandler);
        }
      }
      if (resolved.style && extra.style) {
        result.style = { ...(resolved.style as object), ...(extra.style as object) };
      }
    }
    return result;
  };
  if (typeof external === 'function') {
    return (ownerState: never) => merge(external(ownerState));
  }
  return merge(external);
}
