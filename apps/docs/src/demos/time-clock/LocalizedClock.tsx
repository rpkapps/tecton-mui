import { fr } from 'date-fns/locale/fr';
import { ja } from 'date-fns/locale/ja';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DigitalClock from '@tecton-mui/ui/DigitalClock';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const value = new Date(2026, 0, 12, 13, 0);

export default function LocalizedClock() {
  return (
    <Stack
      direction="row"
      spacing={3}
      useFlexGap
      sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {[
        { locale: fr, label: 'Français (24 h)' },
        { locale: ja, label: '日本語' },
      ].map(({ locale, label }) => (
        <LocalizationProvider key={label} adapterLocale={locale}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Paper variant="outlined" sx={{ width: 160 }}>
              <DigitalClock aria-label={label} defaultValue={value} sx={{ maxHeight: 220 }} />
            </Paper>
          </Stack>
        </LocalizationProvider>
      ))}
    </Stack>
  );
}
