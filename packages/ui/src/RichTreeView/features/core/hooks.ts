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

// Shared with the Data Grid; re-exported here for the tree's feature modules and tests.
export { useShallowStable } from '../../../internal/useShallowStable.js';

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
