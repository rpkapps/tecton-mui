import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import PickerDay, { type PickerDayProps } from '@tecton-mui/ui/PickerDay';
import Box from '@tecton-mui/ui/Box';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import { visuallyHidden } from '@tecton-mui/ui';

type Shift = 'early' | 'late' | 'off';

// A four-week rotation: five early shifts, two days off, five late shifts, two days off …
const ROTATION: Shift[] = ['early', 'early', 'early', 'early', 'early', 'off', 'off'];
const LATE_WEEKS = new Set([1, 3]);
const ROTATION_START = new Date(2026, 10, 30).getTime();

function shiftOf(day: Date): Shift {
  const index = Math.round((day.getTime() - ROTATION_START) / 86_400_000);
  const week = Math.floor(index / 7);
  const shift = ROTATION[((index % 7) + 7) % 7];
  return shift === 'early' && LATE_WEEKS.has(((week % 4) + 4) % 4) ? 'late' : shift;
}

const SHIFT_STYLE = {
  early: { border: 2, borderColor: 'info.main' },
  late: { bgcolor: 'warning.light', color: 'warning.contrastText' },
  off: {},
} as const;

const LABEL = { early: 'early shift', late: 'late shift', off: 'day off' };

// Built on PickerDay so selection, focus and keyboard behavior are unchanged. The shift is also
// given as text for screen readers, not only as a color.
function RosterDay(props: PickerDayProps) {
  const { day, outsideCurrentMonth, selected } = props;
  if (outsideCurrentMonth) return <PickerDay {...props} />;
  const shift = shiftOf(day);
  return (
    <PickerDay {...props} sx={selected ? props.sx : [SHIFT_STYLE[shift], props.sx ?? {}]}>
      {day.getDate()}
      <Box component="span" sx={visuallyHidden}>
        , {LABEL[shift]}
      </Box>
    </PickerDay>
  );
}

const slots = { day: RosterDay };

function Legend({ shift }: { shift: Shift }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={[
          { width: 14, height: 14, borderRadius: '50%', border: 1, borderColor: 'divider' },
          SHIFT_STYLE[shift],
        ]}
      />
      <Typography variant="body2">{LABEL[shift]}</Typography>
    </Stack>
  );
}

export default function ShiftRosterDays() {
  return (
    <LocalizationProvider>
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <DateCalendar
          aria-label="Shift roster for crew B"
          defaultValue={new Date(2026, 11, 7)}
          slots={slots}
        />
        <Stack direction="row" spacing={2}>
          <Legend shift="early" />
          <Legend shift="late" />
          <Legend shift="off" />
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
}
