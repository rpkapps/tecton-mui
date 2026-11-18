import { createMultiInputRangeField } from './MultiInputRangeField.js';
import { createSingleInputRangeField } from './SingleInputRangeField.js';

export const SingleInputDateRangeField = createSingleInputRangeField(
  'date',
  'SingleInputDateRangeField',
);
export const SingleInputTimeRangeField = createSingleInputRangeField(
  'time',
  'SingleInputTimeRangeField',
);
export const SingleInputDateTimeRangeField = createSingleInputRangeField(
  'date-time',
  'SingleInputDateTimeRangeField',
);
export const MultiInputDateRangeField = createMultiInputRangeField(
  'date',
  'MultiInputDateRangeField',
);
