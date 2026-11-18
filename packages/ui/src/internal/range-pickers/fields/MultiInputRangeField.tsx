'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DateField } from '@mui/x-date-pickers/DateField';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { usePickerTranslations } from '@mui/x-date-pickers/hooks';
import type { PickerValidDate, TimeView } from '@mui/x-date-pickers/models';
import type { RangePosition, RangeValueType } from '../models.js';
import { formatRange, positionIndex } from '../utils.js';
import { RangeFieldPickerContext, type RangeFieldProps } from './fieldTypes.js';
import { useRangeFieldValue } from './useRangeFieldValue.js';

export type MultiInputRangeFieldProps = RangeFieldProps & {
  /** Separator rendered between the two inputs. @default '–' */
  separator?: React.ReactNode;
};

const FIELDS = { date: DateField, time: TimeField, 'date-time': DateTimeField } as const;

/**
 * Two Community fields (`DateField`, `TimeField` or `DateTimeField`) side by side, one per
 * endpoint, so each keeps the Community section-based keyboard editing.
 */
export function createMultiInputRangeField(valueType: RangeValueType, displayName: string) {
  const Field = React.forwardRef<HTMLDivElement, MultiInputRangeFieldProps>(
    function MultiInputRangeField(props, ref) {
      const {
        label,
        localeText,
        disabled,
        readOnly,
        required,
        name,
        id,
        className,
        sx,
        fullWidth,
        size,
        autoFocus,
        inputRef,
        slotProps,
        separator = '–',
        minDate,
        maxDate,
        disablePast,
        disableFuture,
        shouldDisableDate,
        minTime,
        maxTime,
        minutesStep,
        shouldDisableTime,
      } = props;
      const translations = usePickerTranslations();
      const picker = React.useContext(RangeFieldPickerContext);
      const { adapter, value, setValue, format, ampm, validationError } = useRangeFieldValue(
        props,
        valueType,
      );
      const triggerOnly = Boolean(picker?.triggerOnly);
      const canOpen = picker != null && !disabled && !readOnly;
      const InnerField = FIELDS[valueType] as React.ElementType;

      const renderField = (position: RangePosition) => {
        const index = positionIndex(position);
        const userTextField =
          typeof slotProps?.textField === 'function'
            ? slotProps.textField(position)
            : slotProps?.textField;
        const open = () => {
          if (canOpen) {
            picker.onOpen(position);
          }
        };
        // `undefined` lets the Community field add its own partial-input error on blur.
        const endpointError = props.error ?? (validationError[index] != null ? true : undefined);
        const fieldProps: Record<string, unknown> = {
          ...userTextField,
          label:
            (position === 'start' ? localeText?.start : localeText?.end) ??
            (position === 'start' ? translations.start : translations.end),
          value: value[index],
          onChange: (date: PickerValidDate | null) =>
            setValue(position === 'start' ? [date, value[1]] : [value[0], date]),
          format,
          disabled,
          readOnly: readOnly || triggerOnly,
          required,
          error: endpointError,
          name: name ? `${name}-${position}` : undefined,
          id: id ? `${id}-${position}` : undefined,
          size,
          fullWidth,
          autoFocus: autoFocus && position === 'start',
          inputRef: position === 'start' ? inputRef : undefined,
          onClick: triggerOnly ? open : undefined,
        };
        if (valueType !== 'time') {
          Object.assign(fieldProps, {
            minDate,
            maxDate,
            disablePast,
            disableFuture,
            shouldDisableDate: shouldDisableDate
              ? (day: PickerValidDate) => shouldDisableDate(day, position)
              : undefined,
          });
        } else {
          Object.assign(fieldProps, { disablePast, disableFuture });
        }
        if (valueType !== 'date') {
          Object.assign(fieldProps, {
            ampm,
            minTime,
            maxTime,
            minutesStep,
            shouldDisableTime: shouldDisableTime
              ? (time: PickerValidDate, view: TimeView) => shouldDisableTime(time, view, position)
              : undefined,
          });
        }
        return <InnerField {...fieldProps} />;
      };

      const OpenIcon = picker?.OpenPickerIcon;
      return (
        <Stack
          ref={ref}
          direction="row"
          spacing={1}
          role="group"
          aria-label={typeof label === 'string' ? label : undefined}
          className={className}
          sx={[{ alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {renderField('start')}
          <Typography component="span" aria-hidden>
            {separator}
          </Typography>
          {renderField('end')}
          {picker && !triggerOnly && OpenIcon ? (
            <IconButton
              ref={picker.openButtonRef}
              disabled={!canOpen}
              aria-label={translations.openRangePickerDialogue(
                formatRange(adapter, value, format) || null,
              )}
              aria-haspopup="dialog"
              aria-expanded={picker.open}
              aria-controls={picker.open ? picker.popupId : undefined}
              onClick={() => picker.onOpen('start')}
              {...picker.openButtonProps}
            >
              <OpenIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      );
    },
  );
  Field.displayName = displayName;
  return Field;
}
