import * as React from 'react';

/**
 * Highlight state of a range calendar, keyed by day (see `getDayKey`). Kept outside React state so
 * that hovering a day only re-renders the day cells whose highlight actually changes: each cell
 * subscribes with a selector that returns a primitive bit mask.
 */
export interface RangeHighlightState {
  start: number | null;
  end: number | null;
  previewStart: number | null;
  previewEnd: number | null;
}

export const DAY_FLAG = {
  start: 1,
  end: 2,
  inRange: 4,
  previewStart: 8,
  previewEnd: 16,
  inPreview: 32,
  /** Start endpoint with a band towards a later end. */
  startBand: 64,
  /** End endpoint with a band towards an earlier start. */
  endBand: 128,
  previewStartBand: 256,
  previewEndBand: 512,
} as const;

export interface RangeHighlightStore {
  getState: () => RangeHighlightState;
  setState: (patch: Partial<RangeHighlightState>) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createRangeHighlightStore(initial: RangeHighlightState): RangeHighlightStore {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState: (patch) => {
      let changed = false;
      for (const key of Object.keys(patch) as (keyof RangeHighlightState)[]) {
        if (patch[key] !== undefined && patch[key] !== state[key]) {
          changed = true;
        }
      }
      if (!changed) {
        return;
      }
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function between(key: number, from: number | null, to: number | null) {
  return from != null && to != null && from < key && key < to;
}

/** Bit mask of `DAY_FLAG`s for one day. */
export function getDayFlags(state: RangeHighlightState, key: number | null): number {
  if (key == null) {
    return 0;
  }
  let flags = 0;
  const { start, end, previewStart, previewEnd } = state;
  if (key === start) {
    flags |= DAY_FLAG.start;
    if (end != null && end > key) flags |= DAY_FLAG.startBand;
  }
  if (key === end) {
    flags |= DAY_FLAG.end;
    if (start != null && start < key) flags |= DAY_FLAG.endBand;
  }
  if (between(key, start, end)) flags |= DAY_FLAG.inRange;
  if (key === previewStart) {
    flags |= DAY_FLAG.previewStart;
    if (previewEnd != null && previewEnd > key) flags |= DAY_FLAG.previewStartBand;
  }
  if (key === previewEnd) {
    flags |= DAY_FLAG.previewEnd;
    if (previewStart != null && previewStart < key) flags |= DAY_FLAG.previewEndBand;
  }
  if (between(key, previewStart, previewEnd)) flags |= DAY_FLAG.inPreview;
  return flags;
}

/** Subscribes one day cell to the store; re-renders only when its own flags change. */
export function useDayFlags(store: RangeHighlightStore, key: number | null): number {
  const getSnapshot = () => getDayFlags(store.getState(), key);
  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
