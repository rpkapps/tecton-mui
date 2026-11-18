import type { MuiPickersAdapter, PickerValidDate } from '@mui/x-date-pickers/models';
import type { PickerRangeValue, RangePosition, RangeValueType } from './models.js';

type Adapter = MuiPickersAdapter;
type MaybeDate = PickerValidDate | null;

/** Text between the two endpoints of a single-input field. */
export const RANGE_SEPARATOR = ' – ';

export const EMPTY_RANGE: PickerRangeValue = [null, null];

export function positionIndex(position: RangePosition): 0 | 1 {
  return position === 'start' ? 0 : 1;
}

export function isValidDate(
  adapter: Adapter,
  date: MaybeDate | undefined,
): date is PickerValidDate {
  return date != null && adapter.isValid(date);
}

/** Equality that treats two `null`s, and two invalid dates, as equal. */
export function areDatesEqual(adapter: Adapter, a: MaybeDate, b: MaybeDate): boolean {
  if (a == null || b == null) {
    return a == null && b == null;
  }
  const aValid = adapter.isValid(a);
  const bValid = adapter.isValid(b);
  if (!aValid || !bValid) {
    return !aValid && !bValid;
  }
  return adapter.isEqual(a, b);
}

export function areRangesEqual(adapter: Adapter, a: PickerRangeValue, b: PickerRangeValue) {
  return areDatesEqual(adapter, a[0], b[0]) && areDatesEqual(adapter, a[1], b[1]);
}

/** Numeric key of the calendar day containing `date` (local start of day), or `null`. */
export function getDayKey(adapter: Adapter, date: MaybeDate | undefined): number | null {
  if (!isValidDate(adapter, date)) {
    return null;
  }
  return adapter.toJsDate(adapter.startOfDay(date)).getTime();
}

/** Copies the time of day of `source` onto `date`. */
export function copyTime(adapter: Adapter, date: PickerValidDate, source: PickerValidDate) {
  let result = adapter.setHours(date, adapter.getHours(source));
  result = adapter.setMinutes(result, adapter.getMinutes(source));
  result = adapter.setSeconds(result, adapter.getSeconds(source));
  return adapter.setMilliseconds(result, adapter.getMilliseconds(source));
}

/** Copies the calendar day of `source` onto `date`, keeping the time of `date`. */
export function copyDay(adapter: Adapter, date: PickerValidDate, source: PickerValidDate) {
  let result = adapter.setYear(date, adapter.getYear(source));
  result = adapter.setMonth(result, adapter.getMonth(source));
  return adapter.setDate(result, adapter.getDate(source));
}

export interface RangeChangeResult {
  nextRange: PickerRangeValue;
  nextPosition: RangePosition;
  /** Index of the endpoint that received the picked day. */
  changedIndex: 0 | 1;
}

/**
 * Applies a picked day to a range.
 *
 * - Editing the start: the day becomes the start; an existing end before it is dropped.
 * - Editing the end: the day becomes the end; a day before the start restarts the range from it.
 *
 * The edited endpoint keeps its previous time of day so date-time ranges are not reset.
 */
export function applyDayToRange(
  adapter: Adapter,
  range: PickerRangeValue,
  day: PickerValidDate,
  position: RangePosition,
): RangeChangeResult {
  const [start, end] = range;
  const withTime = (previous: MaybeDate) =>
    isValidDate(adapter, previous) ? copyTime(adapter, day, previous) : day;

  if (position === 'start') {
    if (isValidDate(adapter, end) && adapter.isAfterDay(day, end)) {
      return { nextRange: [withTime(start), null], nextPosition: 'end', changedIndex: 0 };
    }
    return { nextRange: [withTime(start), end], nextPosition: 'end', changedIndex: 0 };
  }
  if (isValidDate(adapter, start) && adapter.isBeforeDay(day, start)) {
    return { nextRange: [withTime(start), null], nextPosition: 'end', changedIndex: 0 };
  }
  return { nextRange: [start, withTime(end)], nextPosition: 'start', changedIndex: 1 };
}

export function isRangeComplete(adapter: Adapter, range: PickerRangeValue) {
  return isValidDate(adapter, range[0]) && isValidDate(adapter, range[1]);
}

/** Default display/parse format for a value type. */
export function getDefaultRangeFormat(adapter: Adapter, valueType: RangeValueType, ampm: boolean) {
  if (valueType === 'date') {
    return adapter.formats.keyboardDate;
  }
  if (valueType === 'time') {
    return ampm ? adapter.formats.fullTime12h : adapter.formats.fullTime24h;
  }
  return ampm ? adapter.formats.keyboardDateTime12h : adapter.formats.keyboardDateTime24h;
}

export function formatEndpoint(adapter: Adapter, date: MaybeDate, format: string) {
  return isValidDate(adapter, date) ? adapter.formatByString(date, format) : '';
}

export function formatRange(adapter: Adapter, range: PickerRangeValue, format: string) {
  const [start, end] = range;
  if (start == null && end == null) {
    return '';
  }
  return `${formatEndpoint(adapter, start, format)}${RANGE_SEPARATOR}${formatEndpoint(adapter, end, format)}`;
}

/** Splits typed text at the first range separator (en/em dash, or a hyphen surrounded by spaces). */
export function splitRangeText(text: string): [string, string] {
  const match = /\s*[–—]\s*|\s+-\s+/.exec(text);
  if (!match) {
    return [text.trim(), ''];
  }
  return [text.slice(0, match.index).trim(), text.slice(match.index + match[0].length).trim()];
}

/**
 * Parses typed text into a range. Empty parts become `null`; unparsable parts become an invalid
 * date (reported as `invalidDate` by validation), matching how the Community fields behave.
 */
export function parseRange(adapter: Adapter, text: string, format: string): PickerRangeValue {
  const parsePart = (part: string): MaybeDate => {
    if (part === '') {
      return null;
    }
    const parsed = adapter.parse(part, format);
    return parsed ?? adapter.date('invalid');
  };
  const [startText, endText] = splitRangeText(text);
  return [parsePart(startText), parsePart(endText)];
}

/** Human-readable placeholder for a format, e.g. `MM/DD/YYYY – MM/DD/YYYY`. */
export function getRangePlaceholder(adapter: Adapter, format: string) {
  const hint = adapter
    .expandFormat(format)
    .replace(/y+/g, (token) => 'Y'.repeat(token.length))
    .replace(/d+/g, (token) => 'D'.repeat(token.length))
    .replace(/a+/g, 'AM');
  return `${hint}${RANGE_SEPARATOR}${hint}`;
}
