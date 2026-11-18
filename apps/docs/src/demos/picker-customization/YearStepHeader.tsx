import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import type { PickersCalendarHeaderProps } from '@tecton-mui/ui/PickersCalendarHeader';
import IconButton from '@tecton-mui/ui/IconButton';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

// A header written from scratch: it receives the displayed month and `onMonthChange`, and keeps
// `labelId` on the title so the day grid stays labelled by it.
function YearStepper({
  currentMonth,
  onMonthChange,
  labelId,
  disabled,
}: PickersCalendarHeaderProps) {
  const go = (months: number) =>
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + months, 1));
  return (
    <Stack direction="row" sx={{ alignItems: 'center', px: 1, py: 1 }}>
      <IconButton aria-label="Previous year" disabled={disabled} onClick={() => go(-12)}>
        <Icon name="arrow-left" size="small" />
      </IconButton>
      <IconButton aria-label="Previous month" disabled={disabled} onClick={() => go(-1)}>
        <Icon name="chevron-left" size="small" />
      </IconButton>
      <Typography
        id={labelId}
        aria-live="polite"
        variant="subtitle1"
        sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}
      >
        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Typography>
      <IconButton aria-label="Next month" disabled={disabled} onClick={() => go(1)}>
        <Icon name="chevron-right" size="small" />
      </IconButton>
      <IconButton aria-label="Next year" disabled={disabled} onClick={() => go(12)}>
        <Icon name="arrow-right" size="small" />
      </IconButton>
    </Stack>
  );
}

const slots = { calendarHeader: YearStepper };

export default function YearStepHeader() {
  return (
    <LocalizationProvider>
      <DateCalendar
        aria-label="Pump commissioning date"
        defaultValue={new Date(2019, 4, 14)}
        slots={slots}
      />
    </LocalizationProvider>
  );
}
