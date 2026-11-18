import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import ListSubheader from '@tecton-mui/ui/ListSubheader';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import type { PickersShortcutsItem } from '@tecton-mui/ui/PickersShortcuts';

const today = new Date(2026, 10, 18);
const endOfMonth = (year: number, month: number) => new Date(year, month + 1, 0);

const shortcuts: PickersShortcutsItem<Date | null>[] = [
  { id: 'month', label: 'End of last month', getValue: () => endOfMonth(2026, 9) },
  { id: 'quarter', label: 'End of last quarter', getValue: () => endOfMonth(2026, 8) },
  { id: 'half', label: 'End of last half-year', getValue: () => endOfMonth(2026, 5) },
  { id: 'year', label: 'End of last year', getValue: () => endOfMonth(2025, 11) },
];

export default function ReportingShortcuts() {
  const [value, setValue] = React.useState<Date | null>(endOfMonth(2026, 9));
  const [source, setSource] = React.useState('End of last month');
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ width: 300 }}>
        <DatePicker
          label="Balance sheet as of"
          value={value}
          maxDate={today}
          onChange={(next, context) => {
            setValue(next);
            // `context.shortcut` tells which shortcut produced the value, if any.
            setSource(context.shortcut ? String(context.shortcut.label) : 'Picked by hand');
          }}
          slotProps={{
            shortcuts: {
              items: shortcuts,
              // 'set' updates the value but leaves the popup open until the user confirms.
              changeImportance: 'set',
              subheader: <ListSubheader component="div">Closing dates</ListSubheader>,
            },
            actionBar: { actions: ['cancel', 'accept'] },
          }}
        />
        <Typography variant="body2" color="text.secondary" role="status">
          Source: {source}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
