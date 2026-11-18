import * as React from 'react';
import DateField from '@tecton-mui/ui/DateField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';

const minDate = new Date(1970, 0, 1);
const maxDate = new Date(2026, 11, 31);

export default function FieldValidation() {
  const [error, setError] = React.useState<string | null>(null);
  return (
    <LocalizationProvider>
      <DateField
        label="Well completion date"
        defaultValue={new Date(1965, 4, 1)}
        minDate={minDate}
        maxDate={maxDate}
        onError={(reason) => setError(reason)}
        helperText={
          error === 'minDate'
            ? 'Records before 1970 are kept in the archive system.'
            : error === 'maxDate'
              ? 'The date cannot be after 2026.'
              : 'Between 1970 and 2026.'
        }
        sx={{ width: 300 }}
      />
    </LocalizationProvider>
  );
}
