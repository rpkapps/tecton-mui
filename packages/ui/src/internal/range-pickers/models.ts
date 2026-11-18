import type {
  DateTimeValidationError,
  DateValidationError,
  PickerValidDate,
  TimeValidationError,
} from '@mui/x-date-pickers/models';

/**
 * A range of two dates. Either endpoint may be `null` while the range is being entered.
 * With the default `AdapterDateFns`, `TDate` is the native `Date`.
 */
export type DateRange<TDate extends PickerValidDate = PickerValidDate> = [
  TDate | null,
  TDate | null,
];

/** Value type of every range picker, range calendar and range field. */
export type PickerRangeValue = DateRange<PickerValidDate>;

/** A range whose two endpoints are set. */
export type NonEmptyDateRange<TDate extends PickerValidDate = PickerValidDate> = [TDate, TDate];

/** The endpoint that the next interaction edits. */
export type RangePosition = 'start' | 'end';

/** What a range component edits: calendar days, times of day, or both. */
export type RangeValueType = 'date' | 'time' | 'date-time';

/**
 * Importance of a change: `partial` (more input expected), `shallow` (transient, e.g. dragging a
 * clock hand) or `finish` (the range is complete).
 */
export type RangeSelectionState = 'partial' | 'shallow' | 'finish';

/** Per-endpoint validation error. `invalidRange` means the start is after the end. */
export type RangeValidationError<TError> = [
  TError | 'invalidRange' | null,
  TError | 'invalidRange' | null,
];

export type DateRangeValidationError = RangeValidationError<DateValidationError>;
export type TimeRangeValidationError = RangeValidationError<TimeValidationError>;
export type DateTimeRangeValidationError = RangeValidationError<DateTimeValidationError>;

/** Item rendered by the shortcuts slot. */
export interface PickersShortcutsItem<TValue = PickerRangeValue> {
  label: string;
  /** Returns the range to apply. `isValid` checks a candidate against the validation props. */
  getValue: (params: { isValid: (value: TValue) => boolean }) => TValue;
  /** Optional stable key, defaults to `label`. */
  id?: string;
}

/** Context passed as the second argument of `onChange` and `onAccept`. */
export interface PickerRangeChangeContext<TError = DateRangeValidationError> {
  validationError: TError;
  /** The shortcut that produced the value, if any. */
  shortcut?: PickersShortcutsItem;
}

/** Actions the action bar can render. */
export type PickersRangeActionBarAction = 'clear' | 'cancel' | 'accept' | 'today';

/** Text overrides specific to range components (merged over the LocalizationProvider texts). */
export interface RangePickerLocaleText {
  /** Label of the start endpoint (field label, toolbar and tabs). */
  start?: string;
  /** Label of the end endpoint (field label, toolbar and tabs). */
  end?: string;
  /** Title shown in the toolbar (mobile and static variants). */
  toolbarTitle?: string;
  cancelButtonLabel?: string;
  okButtonLabel?: string;
  clearButtonLabel?: string;
  todayButtonLabel?: string;
}

/** State of one day cell, handed to a custom `slots.day` component as the `rangeState` prop. */
export interface RangeDayState {
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isPreviewStart: boolean;
  isPreviewEnd: boolean;
  isInPreview: boolean;
}
