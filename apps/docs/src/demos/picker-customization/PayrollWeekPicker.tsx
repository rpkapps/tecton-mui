import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import type { PickerDayOwnerState } from '@tecton-mui/ui/PickerDay';

// Payroll weeks run Sunday to Saturday, like the rows of the en-US calendar.
function weekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

const band = { borderRadius: 0, bgcolor: 'action.selected', color: 'text.primary' };
const bandStart = { ...band, borderTopLeftRadius: '50%', borderBottomLeftRadius: '50%' };
const bandEnd = { ...band, borderTopRightRadius: '50%', borderBottomRightRadius: '50%' };

const format = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function PayrollWeekPicker() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 10, 18));
  // Kept as a number so that the memoized slot props depend on a primitive.
  const startTime = value ? weekStart(value).getTime() : null;

  // `slotProps.day` can be a function of the day's owner state. Memoized on the week so the
  // calendar only receives new props when the selected week changes.
  const slotProps = React.useMemo(
    () => ({
      day: ({ day }: PickerDayOwnerState) => {
        if (startTime == null || weekStart(day).getTime() !== startTime) return {};
        const weekday = day.getDay();
        return { sx: weekday === 0 ? bandStart : weekday === 6 ? bandEnd : band };
      },
    }),
    [startTime],
  );

  const start = startTime == null ? null : new Date(startTime);
  const end = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6) : null;

  return (
    <LocalizationProvider>
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <DateCalendar
          aria-label="Payroll week"
          value={value}
          onChange={setValue}
          showDaysOutsideCurrentMonth
          displayWeekNumber
          slotProps={slotProps}
        />
        <Typography variant="body2" role="status">
          {start && end
            ? `Payroll week ${format(start)} – ${format(end)}`
            : 'Pick any day of a week'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
