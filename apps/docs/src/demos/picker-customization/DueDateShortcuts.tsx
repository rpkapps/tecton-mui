import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import Paper from '@tecton-mui/ui/Paper';
import type { PickersShortcutsItem } from '@tecton-mui/ui/PickersShortcuts';

// The demo works relative to a fixed "today" so that its output is stable.
const today = new Date(2026, 10, 18);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// `isValid` lets a shortcut skip dates that the picker would reject (here: weekends).
function nextValid(from: Date, isValid: (date: Date) => boolean) {
  let date = from;
  while (!isValid(date)) date = addDays(date, 1);
  return date;
}

const shortcuts: PickersShortcutsItem<Date | null>[] = [
  { label: 'Next working day', getValue: ({ isValid }) => nextValid(addDays(today, 1), isValid) },
  { label: 'In one week', getValue: ({ isValid }) => nextValid(addDays(today, 7), isValid) },
  { label: 'In 30 days', getValue: ({ isValid }) => nextValid(addDays(today, 30), isValid) },
  {
    label: 'End of month',
    // The last calendar day can fall on a weekend; such a shortcut is shown as disabled.
    getValue: () => new Date(today.getFullYear(), today.getMonth() + 1, 0),
  },
  { label: 'No due date', getValue: () => null },
];

export default function DueDateShortcuts() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <StaticDatePicker
          orientation="landscape"
          defaultValue={addDays(today, 7)}
          referenceDate={today}
          minDate={today}
          shouldDisableDate={isWeekend}
          localeText={{ toolbarTitle: 'Payment due' }}
          slotProps={{
            shortcuts: { items: shortcuts },
            actionBar: { actions: ['accept'] },
          }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
