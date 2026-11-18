import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import type { PickersActionBarProps } from '@tecton-mui/ui/PickersActionBar';
import DialogActions from '@tecton-mui/ui/DialogActions';
import Button from '@tecton-mui/ui/Button';
import { usePickerContext } from '@tecton-mui/ui';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

function previousWorkingDay(from: Date) {
  const day = startOfDay(from);
  do day.setDate(day.getDate() - 1);
  while (day.getDay() === 0 || day.getDay() === 6);
  return day;
}

// A custom action bar reads the picker through `usePickerContext` and commits a value with
// `setValue(…, { changeImportance: 'accept' })`, which also closes the popup.
function ReportActionBar({ className, sx }: PickersActionBarProps) {
  const picker = usePickerContext<Date | null>();
  const today = startOfDay(new Date());
  return (
    <DialogActions className={className} sx={sx}>
      <Button
        onClick={() => picker.setValue(previousWorkingDay(today), { changeImportance: 'accept' })}
      >
        Last working day
      </Button>
      <Button onClick={() => picker.setValue(today, { changeImportance: 'accept' })}>Today</Button>
      <Button onClick={() => picker.setOpen(false)}>Close</Button>
    </DialogActions>
  );
}

const slots = { actionBar: ReportActionBar };

export default function CustomActionBar() {
  return (
    <LocalizationProvider>
      <DatePicker
        label="Production report"
        disableFuture
        slots={slots}
        slotProps={{ textField: { helperText: 'Open the calendar for quick picks' } }}
      />
    </LocalizationProvider>
  );
}
