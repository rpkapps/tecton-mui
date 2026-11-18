'use client';
import { SingleInputDateRangeField as Field } from '../internal/range-pickers/fields/instances.js';
import type { SingleInputRangeFieldProps } from '../internal/range-pickers/fields/SingleInputRangeField.js';

export type SingleInputDateRangeFieldProps = SingleInputRangeFieldProps;

/** Single text input holding a date range, e.g. `01/05/2026 – 01/09/2026`. */
export const SingleInputDateRangeField = Field;

export default SingleInputDateRangeField;
