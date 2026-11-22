import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimeField from '@tecton-mui/ui/DateTimeField';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';
import PickersTextField, { type PickersTextFieldProps } from '@tecton-mui/ui/PickersTextField';
import Stack from '@tecton-mui/ui/Stack';

// One text field for every time input of the incident form: filled and with a reminder
// that times are recorded in UTC. Defined at module level so its identity is stable.
function UtcTextField(props: PickersTextFieldProps) {
  return (
    <PickersTextField
      {...props}
      variant="filled"
      helperText={props.helperText ?? 'Recorded in UTC'}
    />
  );
}

const slots = { textField: UtcTextField };

export default function CustomTextFieldSlot() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        <DateTimeField
          label="Alarm raised"
          ampm={false}
          defaultValue={new Date(2026, 10, 14, 3, 12)}
          slots={slots}
        />
        <DateTimePicker
          label="Alarm cleared"
          ampm={false}
          defaultValue={new Date(2026, 10, 14, 4, 5)}
          slots={slots}
          slotProps={{ textField: { helperText: 'Recorded in UTC, pick or type' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
