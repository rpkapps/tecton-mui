import type * as React from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { DialogProps } from '@mui/material/Dialog';
import type { IconButtonProps } from '@mui/material/IconButton';
import type { PaperProps } from '@mui/material/Paper';
import type { PopperProps } from '@mui/material/Popper';
import type { PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import type { PickerValidDate } from '@mui/x-date-pickers/models';
import type { DateRangeCalendarProps, DateRangeCalendarSlots } from './DateRangeCalendar.js';
import type { RangeFieldProps } from './fields/fieldTypes.js';
import type {
  DateRangeValidationError,
  DateTimeRangeValidationError,
  PickerRangeChangeContext,
  PickerRangeValue,
  PickersRangeActionBarAction,
  PickersShortcutsItem,
  RangePickerLocaleText,
  RangePosition,
  TimeRangeValidationError,
} from './models.js';
import type { TimeRangeViewOptions } from './TimeRangeView.js';

export interface RangePickerSlots {
  /** Field rendered by the picker. Defaults to the single-input field of the value type. */
  field?: React.ElementType<RangeFieldProps>;
  /** Icon of the open button. Defaults to the theme's `MuiDatePicker`/`MuiTimePicker` icon. */
  openPickerIcon?: React.ElementType;
  /** Day cell of the calendar (date and date-time ranges). */
  day?: DateRangeCalendarSlots['day'];
}

export interface RangePickerSlotProps {
  field?: Partial<RangeFieldProps>;
  textField?: NonNullable<RangeFieldProps['slotProps']>['textField'];
  openPickerButton?: Partial<IconButtonProps>;
  popper?: Partial<Omit<PopperProps, 'open' | 'children'>>;
  desktopPaper?: Partial<PaperProps>;
  dialog?: Partial<Omit<DialogProps, 'open' | 'children'>>;
  actionBar?: { actions?: PickersRangeActionBarAction[] };
  shortcuts?: { items?: PickersShortcutsItem[] };
  toolbar?: { hidden?: boolean };
  day?: Partial<PickerDayProps>;
  layout?: { className?: string; sx?: SxProps<Theme> };
}

/** Props shared by every range picker. */
export interface BaseRangePickerProps<TError> {
  value?: PickerRangeValue;
  defaultValue?: PickerRangeValue;
  /** Fired on every change (field typing, view selection, shortcut, cancel). */
  onChange?: (value: PickerRangeValue, context: PickerRangeChangeContext<TError>) => void;
  /** Fired when a value is committed and differs from the last committed one. */
  onAccept?: (value: PickerRangeValue, context: PickerRangeChangeContext<TError>) => void;
  /** Fired when the validation error changes. */
  onError?: (error: TError, value: PickerRangeValue) => void;
  /** Control the popup. */
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  label?: React.ReactNode;
  localeText?: RangePickerLocaleText;
  /** Field format in the adapter's tokens. */
  format?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * Commit (and close) once the range is complete.
   * Default: `true` on desktop and static variants, `false` on mobile (which has an OK button).
   */
  closeOnSelect?: boolean;
  name?: string;
  className?: string;
  sx?: SxProps<Theme>;
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
  /** Date used for the initial month and the default time of new endpoints. */
  referenceDate?: PickerValidDate;
  rangePosition?: RangePosition;
  defaultRangePosition?: RangePosition;
  onRangePositionChange?: (position: RangePosition) => void;
  slots?: RangePickerSlots;
  slotProps?: RangePickerSlotProps;
}

/** Calendar props accepted by the date and date-time range pickers. */
export type RangePickerCalendarProps = Omit<
  DateRangeCalendarProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'rangePosition'
  | 'defaultRangePosition'
  | 'onRangePositionChange'
  | 'className'
  | 'sx'
  | 'autoFocus'
  | 'slots'
  | 'slotProps'
  | 'disabled'
  | 'readOnly'
  | 'referenceDate'
>;

export interface DesktopDateRangePickerProps
  extends BaseRangePickerProps<DateRangeValidationError>, RangePickerCalendarProps {}

export type MobileDateRangePickerProps = DesktopDateRangePickerProps;

export interface ResponsiveProps {
  /** Media query that selects the desktop variant. @default '@media (pointer: fine)' */
  desktopModeMediaQuery?: string;
}

export interface DateRangePickerProps extends DesktopDateRangePickerProps, ResponsiveProps {}

export interface StaticProps {
  /** Layout to imitate. @default 'mobile' */
  displayStaticWrapperAs?: 'desktop' | 'mobile';
}

type StaticOmit = 'open' | 'onOpen' | 'onClose' | 'label' | 'name' | 'inputRef';

export interface StaticDateRangePickerProps
  extends Omit<DesktopDateRangePickerProps, StaticOmit>, StaticProps {}

export interface DesktopTimeRangePickerProps
  extends BaseRangePickerProps<TimeRangeValidationError>, TimeRangeViewOptions {}

export type MobileTimeRangePickerProps = DesktopTimeRangePickerProps;

export interface TimeRangePickerProps extends DesktopTimeRangePickerProps, ResponsiveProps {}

export interface StaticTimeRangePickerProps
  extends Omit<DesktopTimeRangePickerProps, StaticOmit>, StaticProps {}

export interface DesktopDateTimeRangePickerProps
  extends
    BaseRangePickerProps<DateTimeRangeValidationError>,
    Omit<RangePickerCalendarProps, 'calendars'>,
    TimeRangeViewOptions {
  /** Months shown on desktop. @default 1 */
  calendars?: 1 | 2 | 3;
  minDateTime?: PickerValidDate;
  maxDateTime?: PickerValidDate;
}

export type MobileDateTimeRangePickerProps = DesktopDateTimeRangePickerProps;

export interface DateTimeRangePickerProps
  extends DesktopDateTimeRangePickerProps, ResponsiveProps {}

export interface StaticDateTimeRangePickerProps
  extends Omit<DesktopDateTimeRangePickerProps, StaticOmit>, StaticProps {}
