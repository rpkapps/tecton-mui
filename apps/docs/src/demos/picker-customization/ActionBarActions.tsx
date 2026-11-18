import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import DesktopTimePicker from '@tecton-mui/ui/DesktopTimePicker';
import MobileDatePicker from '@tecton-mui/ui/MobileDatePicker';
import Stack from '@tecton-mui/ui/Stack';

export default function ActionBarActions() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        {/* Desktop date pickers close on selection, so they show no action bar by default. */}
        <DatePicker
          label="Invoice date"
          slotProps={{
            actionBar: { actions: ['today', 'clear'] },
            textField: { helperText: 'Today and Clear in the popup' },
          }}
        />
        {/* With Cancel and OK the user confirms the time explicitly. */}
        <DesktopTimePicker
          label="Meter reading time"
          closeOnSelect={false}
          slotProps={{
            actionBar: { actions: ['clear', 'cancel', 'accept'] },
            textField: { helperText: 'Clear, Cancel and OK' },
          }}
        />
        {/* `nextOrAccept` reads "Next" until the last view, then "OK". */}
        <MobileDatePicker
          label="Contract start"
          views={['year', 'month', 'day']}
          slotProps={{
            actionBar: { actions: ['cancel', 'nextOrAccept'] },
            textField: { helperText: 'Year, month, then day' },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
