import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import DatePicker from '@tecton-mui/ui/DatePicker';
import Stack from '@tecton-mui/ui/Stack';
import PickerDay, { type PickerDayProps } from '@tecton-mui/ui/PickerDay';

// Days of September 2026 that have a daily drilling report.
const REPORT_DAYS = new Set([2, 3, 4, 8, 9, 15, 16, 17, 22, 29]);

const reportDot = {
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 3,
    left: '50%',
    width: 5,
    height: 5,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    bgcolor: 'success.main',
  },
} as const;

// Slot components are module-level constants (stable identity, no remounts).
function ReportDay(props: PickerDayProps) {
  const { day, outsideCurrentMonth } = props;
  const hasReport =
    !outsideCurrentMonth &&
    day.getFullYear() === 2026 &&
    day.getMonth() === 8 &&
    REPORT_DAYS.has(day.getDate());
  return (
    <PickerDay
      {...props}
      title={hasReport ? 'Report available' : undefined}
      sx={hasReport ? [reportDot, ...(Array.isArray(props.sx) ? props.sx : [props.sx])] : props.sx}
    />
  );
}

export default function ReportDaysPicker() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {/* The same slot works on the picker's popup and on an inline calendar. */}
        <DatePicker
          label="Daily drilling report"
          defaultValue={new Date(2026, 8, 16)}
          slots={{ day: ReportDay }}
          slotProps={{ textField: { helperText: 'Dots mark days with a report' } }}
        />
        <DateCalendar
          aria-label="Days with drilling reports"
          defaultValue={new Date(2026, 8, 16)}
          slots={{ day: ReportDay }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
