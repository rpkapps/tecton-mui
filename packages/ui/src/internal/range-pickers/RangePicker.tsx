'use client';
import * as React from 'react';
import useControlled from '@mui/utils/useControlled';
import useEventCallback from '@mui/utils/useEventCallback';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useTheme } from '@mui/material/styles';
import { usePickerAdapter, usePickerTranslations } from '@mui/x-date-pickers/hooks';
import { CalendarIcon, ClockIcon } from '@mui/x-date-pickers/icons';
import clsx from 'clsx';
import { DateRangeCalendar } from './DateRangeCalendar.js';
import { DateTimeRangeView } from './DateTimeRangeView.js';
import { RangeFieldPickerContext, type RangeFieldPickerContextValue } from './fields/fieldTypes.js';
import {
  SingleInputDateRangeField,
  SingleInputDateTimeRangeField,
  SingleInputTimeRangeField,
} from './fields/instances.js';
import type {
  PickerRangeValue,
  PickersRangeActionBarAction,
  PickersShortcutsItem,
  RangePosition,
  RangeSelectionState,
  RangeValueType,
} from './models.js';
import type {
  BaseRangePickerProps,
  DesktopDateTimeRangePickerProps,
  StaticProps,
} from './pickerTypes.js';
import {
  RangePickerActionBar,
  RangePickerLayoutRoot,
  rangePickerLayoutClasses,
  RangePickerShortcuts,
  RangePickerToolbar,
} from './RangePickerParts.js';
import { TimeRangeView } from './TimeRangeView.js';
import { areRangesEqual, EMPTY_RANGE, getDefaultRangeFormat } from './utils.js';
import {
  areErrorsEqual,
  hasRangeError,
  NO_RANGE_ERROR,
  validateRange,
  type RangeError,
} from './validation.js';

const DEFAULT_FIELDS = {
  date: SingleInputDateRangeField,
  time: SingleInputTimeRangeField,
  'date-time': SingleInputDateTimeRangeField,
} as const;

const NO_SHORTCUTS: PickersShortcutsItem[] = [];

/** Every prop of every range picker; each public component exposes its own subset. */
export type RangePickerEngineProps = BaseRangePickerProps<RangeError> &
  Omit<Partial<DesktopDateTimeRangePickerProps>, keyof BaseRangePickerProps<RangeError>> &
  StaticProps & {
    valueType: RangeValueType;
    variant: 'desktop' | 'mobile' | 'static';
    desktopModeMediaQuery?: string;
  };

interface SetValueOptions {
  selectionState?: RangeSelectionState;
  shortcut?: PickersShortcutsItem;
}

function themeOpenIcon(theme: unknown, valueType: RangeValueType): React.ElementType | undefined {
  const components = (theme as { components?: Record<string, unknown> }).components;
  const key = valueType === 'time' ? 'MuiTimePicker' : 'MuiDatePicker';
  const entry = components?.[key] as
    { defaultProps?: { slots?: { openPickerIcon?: React.ElementType } } } | undefined;
  return entry?.defaultProps?.slots?.openPickerIcon;
}

/**
 * Engine shared by the range pickers: value lifecycle (change / accept / cancel), validation,
 * open state and the desktop popper, mobile dialog or static layout around the view.
 */
export const RangePicker = React.forwardRef<HTMLDivElement, RangePickerEngineProps>(
  function RangePicker(props, ref) {
    const {
      valueType,
      variant,
      value: valueProp,
      defaultValue,
      onChange,
      onAccept,
      onError,
      open: openProp,
      onOpen,
      onClose,
      label,
      localeText,
      format: formatProp,
      disabled = false,
      readOnly = false,
      closeOnSelect: closeOnSelectProp,
      name,
      className,
      sx,
      inputRef,
      autoFocus,
      referenceDate,
      rangePosition: rangePositionProp,
      defaultRangePosition = 'start',
      onRangePositionChange,
      slots,
      slotProps,
      displayStaticWrapperAs = 'mobile',
      desktopModeMediaQuery: _desktopModeMediaQuery,
      calendars,
      ampm: ampmProp,
      ...viewProps
    } = props;
    const {
      minDate,
      maxDate,
      disablePast,
      disableFuture,
      shouldDisableDate,
      minTime,
      maxTime,
      minDateTime,
      maxDateTime,
      minutesStep,
      shouldDisableTime,
      disableIgnoringDatePartForTimeValidation,
    } = viewProps;
    const adapter = usePickerAdapter();
    const translations = usePickerTranslations();
    const theme = useTheme();
    const layoutVariant = variant === 'static' ? displayStaticWrapperAs : variant;
    const ampm = ampmProp ?? adapter.is12HourCycleInCurrentLocale();
    const format = formatProp ?? getDefaultRangeFormat(adapter, valueType, ampm);
    const closeOnSelect =
      closeOnSelectProp ?? (variant === 'static' || layoutVariant === 'desktop');
    const popupId = `${React.useId()}-range-picker`;
    const titleId = `${popupId}-title`;

    // ---- Value -----------------------------------------------------------------------------
    const [value, setValueState] = useControlled<PickerRangeValue>({
      controlled: valueProp,
      default: defaultValue ?? EMPTY_RANGE,
      name: 'RangePicker',
      state: 'value',
    });
    const valueRef = React.useRef(value);
    useEnhancedEffect(() => {
      valueRef.current = value;
    });
    const lastAcceptedRef = React.useRef(value);
    const valueAtOpenRef = React.useRef(value);

    const validationProps = {
      minDate,
      maxDate,
      disablePast,
      disableFuture,
      shouldDisableDate,
      minTime,
      maxTime,
      minDateTime,
      maxDateTime,
      minutesStep,
      shouldDisableTime,
      disableIgnoringDatePartForTimeValidation,
    };
    const validate = (candidate: PickerRangeValue) =>
      validateRange(adapter, candidate, valueType, validationProps);
    const validationError = validate(value);

    const lastErrorRef = React.useRef(NO_RANGE_ERROR);
    React.useEffect(() => {
      if (!areErrorsEqual(lastErrorRef.current, validationError)) {
        lastErrorRef.current = validationError;
        onError?.(validationError, value);
      }
    });

    // ---- Open state ------------------------------------------------------------------------
    const [isOpen, setOpenState] = useControlled<boolean>({
      controlled: openProp,
      default: false,
      name: 'RangePicker',
      state: 'open',
    });
    const [rangePosition, setRangePositionState] = useControlled<RangePosition>({
      controlled: rangePositionProp,
      default: defaultRangePosition,
      name: 'RangePicker',
      state: 'rangePosition',
    });
    const setRangePosition = useEventCallback((position: RangePosition) => {
      if (position !== rangePosition) {
        setRangePositionState(position);
        onRangePositionChange?.(position);
      }
    });

    const anchorRef = React.useRef<HTMLDivElement | null>(null);
    const openButtonRef = React.useRef<HTMLButtonElement | null>(null);
    const fieldRef = useForkRef(anchorRef, variant === 'static' ? null : ref);
    const getAnchor = React.useCallback(() => anchorRef.current as HTMLElement, []);

    const accept = useEventCallback(
      (accepted: PickerRangeValue = valueRef.current, shortcut?: PickersShortcutsItem) => {
        if (areRangesEqual(adapter, accepted, lastAcceptedRef.current)) {
          return;
        }
        lastAcceptedRef.current = accepted;
        onAccept?.(accepted, { validationError: validate(accepted), shortcut });
      },
    );

    const openPicker = useEventCallback((position: RangePosition = 'start') => {
      if (disabled || readOnly || isOpen) {
        return;
      }
      valueAtOpenRef.current = valueRef.current;
      setRangePosition(position);
      setOpenState(true);
      onOpen?.();
    });

    const closePicker = useEventCallback((restoreFocus = true) => {
      if (variant === 'static' || !isOpen) {
        return;
      }
      setOpenState(false);
      onClose?.();
      if (restoreFocus && layoutVariant === 'desktop') {
        openButtonRef.current?.focus();
      }
    });

    const setValue = useEventCallback((next: PickerRangeValue, options: SetValueOptions = {}) => {
      if (!areRangesEqual(adapter, next, valueRef.current)) {
        valueRef.current = next;
        setValueState(next);
        onChange?.(next, { validationError: validate(next), shortcut: options.shortcut });
      }
      if (options.selectionState === 'finish' && closeOnSelect) {
        accept(next, options.shortcut);
        closePicker();
      }
    });

    const cancel = useEventCallback(() => {
      setValue(valueAtOpenRef.current);
      closePicker();
    });

    /** Escape, click-away or the dialog backdrop: commit on desktop, revert on mobile. */
    const dismiss = useEventCallback((restoreFocus: boolean) => {
      if (layoutVariant === 'mobile') {
        cancel();
        return;
      }
      accept();
      closePicker(restoreFocus);
    });

    const handleAction = useEventCallback((action: PickersRangeActionBarAction) => {
      if (action === 'cancel') {
        cancel();
        return;
      }
      let next = valueRef.current;
      if (action === 'clear') {
        next = EMPTY_RANGE;
      } else if (action === 'today') {
        const now = adapter.date();
        next =
          valueType === 'date' ? [adapter.startOfDay(now), adapter.startOfDay(now)] : [now, now];
      }
      setValue(next);
      accept(next);
      closePicker();
    });

    const handleViewChange = useEventCallback(
      (next: PickerRangeValue, selectionState: RangeSelectionState) =>
        setValue(next, { selectionState }),
    );
    const handleFieldChange = useEventCallback((next: PickerRangeValue) => setValue(next));
    const handleShortcut = useEventCallback(
      (next: PickerRangeValue, item: PickersShortcutsItem) => {
        setValue(next, { shortcut: item });
        accept(next, item);
        closePicker();
      },
    );
    const isShortcutValid = useEventCallback(
      (candidate: PickerRangeValue) => !hasRangeError(validate(candidate)),
    );

    // ---- View ------------------------------------------------------------------------------
    const viewAutoFocus = variant === 'static' ? autoFocus : true;
    const labels = {
      start: localeText?.start ?? translations.start,
      end: localeText?.end ?? translations.end,
    };
    let view: React.ReactNode;
    if (valueType === 'date') {
      view = (
        <DateRangeCalendar
          {...viewProps}
          calendars={calendars ?? (layoutVariant === 'desktop' ? 2 : 1)}
          value={value}
          onChange={handleViewChange}
          rangePosition={rangePosition}
          onRangePositionChange={setRangePosition}
          referenceDate={referenceDate}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={viewAutoFocus}
          slots={slots?.day ? { day: slots.day } : undefined}
          slotProps={slotProps?.day ? { day: slotProps.day } : undefined}
        />
      );
    } else if (valueType === 'time') {
      view = (
        <TimeRangeView
          {...viewProps}
          ampm={ampm}
          value={value}
          onChange={handleViewChange}
          rangePosition={rangePosition}
          onRangePositionChange={setRangePosition}
          variant={layoutVariant}
          referenceDate={referenceDate}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={viewAutoFocus}
          localeText={localeText}
        />
      );
    } else {
      view = (
        <DateTimeRangeView
          {...viewProps}
          ampm={ampm}
          calendars={calendars ?? 1}
          value={value}
          onChange={handleViewChange}
          rangePosition={rangePosition}
          onRangePositionChange={setRangePosition}
          variant={layoutVariant}
          referenceDate={referenceDate}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={viewAutoFocus}
          localeText={localeText}
          slots={slots?.day ? { day: slots.day } : undefined}
          slotProps={slotProps?.day ? { day: slotProps.day } : undefined}
        />
      );
    }

    const defaultActions: PickersRangeActionBarAction[] =
      variant === 'static'
        ? []
        : layoutVariant === 'mobile'
          ? ['cancel', 'accept']
          : valueType === 'date'
            ? []
            : ['accept'];
    const actions = slotProps?.actionBar?.actions ?? defaultActions;
    const showToolbar =
      !slotProps?.toolbar?.hidden && (layoutVariant === 'mobile' || valueType === 'date-time');
    const title =
      localeText?.toolbarTitle ??
      (valueType === 'date'
        ? translations.dateRangePickerToolbarTitle
        : valueType === 'time'
          ? translations.timeRangePickerToolbarTitle
          : translations.dateTimePickerToolbarTitle);

    const layout = (
      <RangePickerLayoutRoot
        ref={variant === 'static' ? ref : undefined}
        className={clsx(
          rangePickerLayoutClasses.root,
          slotProps?.layout?.className,
          variant === 'static' && className,
        )}
        sx={variant === 'static' ? sx : slotProps?.layout?.sx}
        role={variant === 'static' ? 'group' : undefined}
        aria-labelledby={variant === 'static' && showToolbar ? titleId : undefined}
        aria-label={variant === 'static' && !showToolbar ? title : undefined}
      >
        {showToolbar ? (
          <RangePickerToolbar
            value={value}
            rangePosition={rangePosition}
            onRangePositionChange={setRangePosition}
            format={format}
            title={title}
            titleId={titleId}
            labels={labels}
          />
        ) : null}
        <div className={rangePickerLayoutClasses.contentWrapper}>
          <RangePickerShortcuts
            items={slotProps?.shortcuts?.items ?? NO_SHORTCUTS}
            isValid={isShortcutValid}
            onSelect={handleShortcut}
            disabled={disabled || readOnly}
          />
          {view}
        </div>
        <RangePickerActionBar
          actions={actions}
          onAction={handleAction}
          labels={{
            accept: localeText?.okButtonLabel ?? translations.okButtonLabel,
            cancel: localeText?.cancelButtonLabel ?? translations.cancelButtonLabel,
            clear: localeText?.clearButtonLabel ?? translations.clearButtonLabel,
            today: localeText?.todayButtonLabel ?? translations.todayButtonLabel,
          }}
        />
      </RangePickerLayoutRoot>
    );

    if (variant === 'static') {
      return layout;
    }

    // ---- Field + popup ---------------------------------------------------------------------
    const OpenPickerIcon =
      slots?.openPickerIcon ??
      themeOpenIcon(theme, valueType) ??
      (valueType === 'time' ? ClockIcon : CalendarIcon);
    const fieldContext: RangeFieldPickerContextValue = {
      open: isOpen,
      onOpen: openPicker,
      triggerOnly: layoutVariant === 'mobile',
      openButtonRef,
      OpenPickerIcon,
      openButtonProps: slotProps?.openPickerButton,
      popupId,
    };
    const Field = (slots?.field ?? DEFAULT_FIELDS[valueType]) as React.ElementType;
    const fieldProps: Record<string, unknown> = { ...slotProps?.field };
    const ownFieldProps: Record<string, unknown> = {
      ...validationProps,
      ref: fieldRef,
      value,
      onChange: handleFieldChange,
      format,
      ampm,
      label,
      localeText,
      disabled,
      readOnly,
      error: hasRangeError(validationError),
      name,
      className,
      sx,
      inputRef,
      autoFocus,
      slotProps: slotProps?.textField ? { textField: slotProps.textField } : undefined,
    };
    for (const [key, propValue] of Object.entries(ownFieldProps)) {
      if (propValue !== undefined) {
        fieldProps[key] = propValue;
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        dismiss(true);
      }
    };

    return (
      <RangeFieldPickerContext.Provider value={fieldContext}>
        <Field {...fieldProps} />
        {layoutVariant === 'desktop' ? (
          <Popper
            placement="bottom-start"
            {...slotProps?.popper}
            open={isOpen}
            anchorEl={getAnchor}
            role="dialog"
            id={popupId}
            aria-label={typeof label === 'string' ? label : title}
            sx={[{ zIndex: theme.zIndex.modal }]}
          >
            <ClickAwayListener onClickAway={() => dismiss(false)}>
              <Paper elevation={8} {...slotProps?.desktopPaper} onKeyDown={handleKeyDown}>
                {layout}
              </Paper>
            </ClickAwayListener>
          </Popper>
        ) : (
          <Dialog
            {...slotProps?.dialog}
            open={isOpen}
            onClose={() => dismiss(false)}
            slotProps={{
              ...slotProps?.dialog?.slotProps,
              paper: {
                ...(slotProps?.dialog?.slotProps?.paper as object | undefined),
                id: popupId,
              },
            }}
            aria-labelledby={showToolbar ? titleId : undefined}
            aria-label={showToolbar ? undefined : title}
          >
            {layout}
          </Dialog>
        )}
      </RangeFieldPickerContext.Provider>
    );
  },
);
