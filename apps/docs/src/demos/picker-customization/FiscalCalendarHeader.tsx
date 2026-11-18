import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import DatePicker from '@tecton-mui/ui/DatePicker';
import PickersCalendarHeader, {
  type PickersCalendarHeaderProps,
} from '@tecton-mui/ui/PickersCalendarHeader';
import Box from '@tecton-mui/ui/Box';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

// The fiscal year starts on 1 October: October is period 1 of the next fiscal year.
function fiscalPeriod(month: Date) {
  const period = ((month.getMonth() + 3) % 12) + 1;
  const year = month.getMonth() >= 9 ? month.getFullYear() + 1 : month.getFullYear();
  return `Fiscal period ${period} of FY${year}`;
}

// Keeps the built-in header (month label, view switch, arrows) and adds a caption below it.
function FiscalHeader(props: PickersCalendarHeaderProps) {
  return (
    <Box>
      <PickersCalendarHeader {...props} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', px: 3, mt: -0.5, mb: 1 }}
      >
        {fiscalPeriod(props.currentMonth)}
      </Typography>
    </Box>
  );
}

const slots = { calendarHeader: FiscalHeader };

export default function FiscalCalendarHeader() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}
      >
        <DateCalendar
          aria-label="Journal posting date"
          defaultValue={new Date(2026, 9, 5)}
          slots={slots}
        />
        <DatePicker label="Accrual date" defaultValue={new Date(2027, 2, 31)} slots={slots} />
      </Stack>
    </LocalizationProvider>
  );
}
