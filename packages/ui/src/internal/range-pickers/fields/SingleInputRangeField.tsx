'use client';
import * as React from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { usePickerTranslations } from '@mui/x-date-pickers/hooks';
import type { PickerValidDate } from '@mui/x-date-pickers/models';
import type { PickerRangeValue, RangeValueType } from '../models.js';
import {
  areRangesEqual,
  copyTime,
  formatRange,
  getRangePlaceholder,
  isValidDate,
  parseRange,
} from '../utils.js';
import { RangeFieldPickerContext, type RangeFieldProps } from './fieldTypes.js';
import { useRangeFieldValue } from './useRangeFieldValue.js';

export type SingleInputRangeFieldProps = RangeFieldProps;

/**
 * One text input holding both endpoints (`start – end`). Text is parsed with the adapter on each
 * keystroke; unparsable parts become invalid dates and are reported by validation. Inside a
 * picker it renders the open button (desktop) or acts as the dialog trigger (mobile).
 */
export function createSingleInputRangeField(valueType: RangeValueType, displayName: string) {
  const Field = React.forwardRef<HTMLDivElement, SingleInputRangeFieldProps>(
    function SingleInputRangeField(props, ref) {
      const {
        label,
        disabled,
        readOnly,
        required,
        name,
        id,
        className,
        sx,
        fullWidth,
        size,
        helperText,
        placeholder,
        autoFocus,
        inputRef,
        slotProps,
      } = props;
      const translations = usePickerTranslations();
      const picker = React.useContext(RangeFieldPickerContext);
      const { adapter, value, setValue, format, hasError } = useRangeFieldValue(props, valueType);
      const [text, setText] = React.useState(() => formatRange(adapter, value, format));

      // Re-format when the value changes from outside (picker, parent) — not while typing.
      React.useEffect(() => {
        setText((current) =>
          areRangesEqual(adapter, parseRange(adapter, current, format), value)
            ? current
            : formatRange(adapter, value, format),
        );
      }, [adapter, value, format]);

      const mergeTime = (parsed: PickerRangeValue): PickerRangeValue => {
        if (valueType !== 'time') {
          return parsed;
        }
        // A typed time keeps the calendar day the endpoint already had.
        const keepDay = (next: PickerValidDate | null, previous: PickerValidDate | null) =>
          isValidDate(adapter, next) && isValidDate(adapter, previous)
            ? copyTime(adapter, previous, next)
            : next;
        return [keepDay(parsed[0], value[0]), keepDay(parsed[1], value[1])];
      };

      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextText = event.target.value;
        setText(nextText);
        setValue(mergeTime(parseRange(adapter, nextText, format)));
      };

      const handleBlur = () => {
        if (!hasError) {
          setText(formatRange(adapter, value, format));
        }
      };

      const triggerOnly = Boolean(picker?.triggerOnly);
      const canOpen = picker != null && !disabled && !readOnly;
      const openPicker = () => {
        if (canOpen) {
          picker.onOpen('start');
        }
      };
      const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      };

      const formatted = formatRange(adapter, value, format);
      const OpenIcon = picker?.OpenPickerIcon;
      const endAdornment =
        picker && !triggerOnly && OpenIcon ? (
          <InputAdornment position="end">
            <IconButton
              ref={picker.openButtonRef}
              edge="end"
              disabled={!canOpen}
              aria-label={translations.openRangePickerDialogue(formatted || null)}
              aria-haspopup="dialog"
              aria-expanded={picker.open}
              aria-controls={picker.open ? picker.popupId : undefined}
              onClick={openPicker}
              {...picker.openButtonProps}
            >
              <OpenIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined;

      const userTextField =
        typeof slotProps?.textField === 'function'
          ? slotProps.textField('start')
          : slotProps?.textField;
      const userSlotProps = (userTextField?.slotProps ?? {}) as NonNullable<
        TextFieldProps['slotProps']
      > & { input?: object; htmlInput?: object };

      return (
        <TextField
          {...userTextField}
          ref={ref}
          label={label ?? userTextField?.label}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          error={hasError}
          required={required}
          name={name}
          id={id}
          className={className}
          sx={sx}
          fullWidth={fullWidth}
          size={size}
          helperText={helperText ?? userTextField?.helperText}
          placeholder={placeholder ?? getRangePlaceholder(adapter, format)}
          autoFocus={autoFocus}
          inputRef={inputRef}
          slotProps={{
            ...userSlotProps,
            input: {
              ...userSlotProps.input,
              readOnly: readOnly || triggerOnly,
              endAdornment,
            },
            htmlInput: {
              ...userSlotProps.htmlInput,
              'aria-label':
                label == null && userTextField?.label == null
                  ? translations.openRangePickerDialogue(null)
                  : undefined,
              ...(triggerOnly
                ? {
                    onClick: openPicker,
                    onKeyDown: handleTriggerKeyDown,
                    'aria-haspopup': 'dialog',
                  }
                : null),
            },
          }}
        />
      );
    },
  );
  Field.displayName = displayName;
  return Field;
}
