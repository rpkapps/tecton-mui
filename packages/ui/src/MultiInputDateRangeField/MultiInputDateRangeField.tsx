'use client';
import { MultiInputDateRangeField as Field } from '../internal/range-pickers/fields/instances.js';
import type { MultiInputRangeFieldProps } from '../internal/range-pickers/fields/MultiInputRangeField.js';

export type MultiInputDateRangeFieldProps = MultiInputRangeFieldProps;

/** Two Community `DateField`s, one per endpoint. */
export const MultiInputDateRangeField = Field;

export default MultiInputDateRangeField;
