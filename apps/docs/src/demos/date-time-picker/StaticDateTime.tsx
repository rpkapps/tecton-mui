import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDateTimePicker from '@tecton-mui/ui/StaticDateTimePicker';
import Paper from '@tecton-mui/ui/Paper';

export default function StaticDateTime() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'hidden', maxWidth: '100%' }}>
        <StaticDateTimePicker
          ampm={false}
          defaultValue={new Date(2026, 4, 20, 10, 0)}
          slotProps={{ actionBar: { actions: ['today', 'accept'] } }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
