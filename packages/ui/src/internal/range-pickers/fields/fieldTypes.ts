import * as React from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material/TextField';
import type { IconButtonProps } from '@mui/material/IconButton';
import type { PickerRangeChangeContext, PickerRangeValue, RangePosition } from '../models.js';
import type { RangeEndpointError, RangeValidationProps } from '../validation.js';

export type RangeFieldValidationError = [RangeEndpointError, RangeEndpointError];

/** Props shared by every range field (single and multi input). */
export interface RangeFieldProps extends RangeValidationProps {
  value?: PickerRangeValue;
  defaultValue?: PickerRangeValue;
  onChange?: (
    value: PickerRangeValue,
    context: PickerRangeChangeContext<RangeFieldValidationError>,
  ) => void;
  onError?: (error: RangeFieldValidationError, value: PickerRangeValue) => void;
  /** Display and parse format, in the adapter's format tokens. */
  format?: string;
  /** Use a 12-hour clock in the default time format. Defaults to the locale's cycle. */
  ampm?: boolean;
  label?: React.ReactNode;
  localeText?: { start?: string; end?: string };
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Forces the error state; by default it comes from validation. */
  error?: boolean;
  name?: string;
  id?: string;
  className?: string;
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  helperText?: React.ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  slotProps?: {
    /** Props of the MUI `TextField` (single input) or of both Community fields (multi input). */
    textField?: Partial<TextFieldProps> | ((position: RangePosition) => Partial<TextFieldProps>);
  };
}

/** What a picker tells the field it renders. `null` when the field is used on its own. */
export interface RangeFieldPickerContextValue {
  open: boolean;
  onOpen: (position: RangePosition) => void;
  /** Mobile variants: the input is read-only and a click opens the dialog. */
  triggerOnly: boolean;
  openButtonRef: React.Ref<HTMLButtonElement>;
  OpenPickerIcon: React.ElementType;
  openButtonProps?: Partial<IconButtonProps>;
  popupId: string;
}

export const RangeFieldPickerContext = React.createContext<RangeFieldPickerContextValue | null>(
  null,
);
