import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import Paper from '@tecton-mui/ui/Paper';

export default function LandscapeLayout() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <StaticDatePicker
          orientation="landscape"
          defaultValue={new Date(2027, 0, 11)}
          localeText={{ toolbarTitle: 'Course start' }}
          slotProps={{ actionBar: { actions: ['clear', 'accept'] } }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
