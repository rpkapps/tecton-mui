import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import PickersActionBar, { type PickersActionBarProps } from '@tecton-mui/ui/PickersActionBar';
import Box from '@tecton-mui/ui/Box';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

// Wraps the built-in action bar to add a policy notice. The layout places the slot by its
// `className`, so it goes on the wrapper; the buttons keep their default behavior.
function NoticeBar({ className, sx, ...other }: PickersActionBarProps) {
  return (
    <Box
      className={className}
      sx={[
        { display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
        Leave starting within 5 working days needs manager approval.
      </Typography>
      <PickersActionBar {...other} sx={{ p: 0 }} />
    </Box>
  );
}

const slots = { actionBar: NoticeBar };

export default function NoticeActionBar() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <StaticDatePicker
          defaultValue={new Date(2026, 11, 21)}
          localeText={{ toolbarTitle: 'First day of leave' }}
          slots={slots}
          slotProps={{ actionBar: { actions: ['cancel', 'accept'] } }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
