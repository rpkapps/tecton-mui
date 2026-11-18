import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimePicker from '@tecton-mui/ui/TimePicker';
import Stack from '@tecton-mui/ui/Stack';

const value = new Date(2026, 0, 12, 21, 15);

export default function LocalizedTimePicker() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <LocalizationProvider adapterLocale={de}>
        <TimePicker label="Uhrzeit (de)" defaultValue={value} />
      </LocalizationProvider>
      <LocalizationProvider adapterLocale={enGB}>
        <TimePicker label="Time (en-GB)" defaultValue={value} />
      </LocalizationProvider>
      <LocalizationProvider>
        <TimePicker label="Time (en-US)" defaultValue={value} />
      </LocalizationProvider>
    </Stack>
  );
}
