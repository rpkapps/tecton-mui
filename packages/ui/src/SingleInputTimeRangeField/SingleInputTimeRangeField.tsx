'use client';
import { SingleInputTimeRangeField as Field } from '../internal/range-pickers/fields/instances.js';
import type { SingleInputRangeFieldProps } from '../internal/range-pickers/fields/SingleInputRangeField.js';

export type SingleInputTimeRangeFieldProps = SingleInputRangeFieldProps;

/** Single text input holding a time range, e.g. `09:00 AM – 05:00 PM`. */
export const SingleInputTimeRangeField = Field;

export default SingleInputTimeRangeField;
