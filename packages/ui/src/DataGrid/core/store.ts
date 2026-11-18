import * as React from 'react';

type Listener = () => void;

/**
 * Minimal external store. Interaction state (expansion, detail panels, drag indicators) lives here
 * so components subscribe to the exact slice they render via `useStoreSelector`, instead of
 * re-rendering the whole grid through React state.
 */
export class Store<S> {
  private listeners = new Set<Listener>();
  constructor(private state: S) {}

  getState = (): S => this.state;

  setState = (updater: Partial<S> | ((prev: S) => Partial<S>)): void => {
    const patch = typeof updater === 'function' ? updater(this.state) : updater;
    let changed = false;
    for (const key of Object.keys(patch) as Array<keyof S>) {
      if (!Object.is(this.state[key], patch[key])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

/** Subscribes to a derived slice. Return primitives (or stable references) to avoid re-renders. */
export function useStoreSelector<S, T>(store: Store<S>, selector: (state: S) => T): T {
  const getSnapshot = React.useCallback(() => selector(store.getState()), [store, selector]);
  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
