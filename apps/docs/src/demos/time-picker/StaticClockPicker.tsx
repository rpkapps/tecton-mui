import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticTimePicker from '@tecton-mui/ui/StaticTimePicker';
import Paper from '@tecton-mui/ui/Paper';

export default function StaticClockPicker() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <StaticTimePicker
          defaultValue={new Date(2026, 0, 12, 15, 30)}
          slotProps={{ actionBar: { actions: ['cancel', 'accept'] } }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
