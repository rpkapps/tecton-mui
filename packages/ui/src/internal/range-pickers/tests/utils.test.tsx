import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import { LocalizationProvider } from '../../../LocalizationProvider/index.js';
import {
  applyDayToRange,
  areDatesEqual,
  copyDay,
  formatRange,
  getDayKey,
  getDefaultRangeFormat,
  getRangePlaceholder,
  parseRange,
  splitRangeText,
} from '../utils.js';
import { areErrorsEqual, hasRangeError, validateRange } from '../validation.js';
import { createRangeHighlightStore, DAY_FLAG, getDayFlags } from '../highlightStore.js';
import { day } from './testUtils.js';

function useAdapter() {
  return renderHook(usePickerAdapter, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <LocalizationProvider>{children}</LocalizationProvider>
    ),
  }).result.current;
}

describe('range utils', () => {
  it('splits text at dashes', () => {
    expect(splitRangeText('a – b')).toEqual(['a', 'b']);
    expect(splitRangeText('a—b')).toEqual(['a', 'b']);
    expect(splitRangeText('2026-01-01 - 2026-01-02')).toEqual(['2026-01-01', '2026-01-02']);
    expect(splitRangeText(' 2026-01-01 ')).toEqual(['2026-01-01', '']);
  });

  it('formats and parses ranges', () => {
    const adapter = useAdapter();
    const format = getDefaultRangeFormat(adapter, 'date', false);
    expect(formatRange(adapter, [null, null], format)).toBe('');
    expect(formatRange(adapter, [null, day(2026, 0, 2)], format)).toBe(' – 01/02/2026');
    const [start, end] = parseRange(adapter, 'x – ', format);
    expect(adapter.isValid(start)).toBe(false);
    expect(end).toBeNull();
    expect(getDefaultRangeFormat(adapter, 'time', true)).toBe(adapter.formats.fullTime12h);
    expect(getDefaultRangeFormat(adapter, 'date-time', true)).toBe(
      adapter.formats.keyboardDateTime12h,
    );
    expect(getRangePlaceholder(adapter, 'hh:mm aa')).toBe('hh:mm AM – hh:mm AM');
  });

  it('compares dates including null and invalid', () => {
    const adapter = useAdapter();
    const invalid = adapter.date('invalid');
    expect(areDatesEqual(adapter, null, null)).toBe(true);
    expect(areDatesEqual(adapter, null, day(2026, 0, 1))).toBe(false);
    expect(areDatesEqual(adapter, invalid, adapter.date('invalid'))).toBe(true);
    expect(areDatesEqual(adapter, invalid, day(2026, 0, 1))).toBe(false);
    expect(getDayKey(adapter, invalid)).toBeNull();
    expect(copyDay(adapter, day(2026, 0, 1, 10), day(2027, 5, 3)).toISOString()).toBe(
      day(2027, 5, 3, 10).toISOString(),
    );
  });

  it('applies picked days', () => {
    const adapter = useAdapter();
    const r = applyDayToRange(adapter, [day(2026, 0, 5), day(2026, 0, 9)], day(2026, 0, 3), 'end');
    expect(r.nextRange).toEqual([day(2026, 0, 3), null]);
    expect(r.changedIndex).toBe(0);
    const s = applyDayToRange(adapter, [null, day(2026, 0, 9)], day(2026, 0, 3), 'start');
    expect(s).toEqual({
      nextRange: [day(2026, 0, 3), day(2026, 0, 9)],
      nextPosition: 'end',
      changedIndex: 0,
    });
  });

  it('validates ranges', () => {
    const adapter = useAdapter();
    const error = validateRange(adapter, [day(2026, 0, 9), day(2026, 0, 5)], 'date', {});
    expect(error).toEqual(['invalidRange', 'invalidRange']);
    expect(hasRangeError(error)).toBe(true);
    expect(areErrorsEqual(error, ['invalidRange', null])).toBe(false);
    expect(
      validateRange(adapter, [day(2026, 0, 1, 7), null], 'time', {
        shouldDisableTime: (_, view, position) => view === 'hours' && position === 'start',
      }),
    ).toEqual(['shouldDisableTime-hours', null]);
    expect(
      validateRange(adapter, [day(2026, 0, 5, 9), day(2026, 0, 6, 9)], 'date-time', {
        maxDateTime: day(2026, 0, 6, 8),
        minDateTime: day(2026, 0, 1),
        shouldDisableDate: () => false,
      }),
    ).toEqual([null, 'maxTime']);
    expect(
      validateRange(adapter, [day(2026, 0, 5, 9), null], 'date-time', {
        minDateTime: day(2026, 0, 6),
      }),
    ).toEqual(['minDate', null]);
    expect(
      validateRange(adapter, [day(2026, 0, 5, 9), null], 'date-time', { minDate: day(2026, 0, 6) }),
    ).toEqual(['minDate', null]);
  });
});

describe('highlight store', () => {
  it('notifies only on change and computes flags', () => {
    const store = createRangeHighlightStore({
      start: 1,
      end: 5,
      previewStart: null,
      previewEnd: null,
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setState({ start: 1 });
    expect(listener).not.toHaveBeenCalled();
    store.setState({ previewStart: 3, previewEnd: 7 });
    expect(listener).toHaveBeenCalledTimes(1);
    const state = store.getState();
    expect(getDayFlags(state, null)).toBe(0);
    expect(getDayFlags(state, 1) & DAY_FLAG.startBand).toBeTruthy();
    expect(getDayFlags(state, 5) & DAY_FLAG.endBand).toBeTruthy();
    expect(getDayFlags(state, 4) & DAY_FLAG.inRange).toBeTruthy();
    expect(getDayFlags(state, 4) & DAY_FLAG.inPreview).toBeTruthy();
    expect(getDayFlags(state, 7) & DAY_FLAG.previewEndBand).toBeTruthy();
    unsubscribe();
    store.setState({ end: 9 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
