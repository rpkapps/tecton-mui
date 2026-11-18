import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDateRangePicker from '@tecton-mui/ui/StaticDateRangePicker';
import type { PickersShortcutsItem, DateRange } from '@tecton-mui/ui/DateRangePicker';

const today = new Date(2026, 10, 18);
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);

const shortcuts: PickersShortcutsItem<DateRange<Date>>[] = [
  { label: 'Last 7 days', getValue: () => [daysAgo(6), today] },
  { label: 'Last 30 days', getValue: () => [daysAgo(29), today] },
  {
    label: 'This month',
    getValue: () => [new Date(2026, 10, 1), new Date(2026, 10, 30)],
  },
  { label: 'Reset', getValue: () => [null, null] },
];

export default function StaticRangeWithShortcuts() {
  return (
    <LocalizationProvider>
      <StaticDateRangePicker
        displayStaticWrapperAs="desktop"
        defaultValue={[daysAgo(6), today]}
        referenceDate={today}
        maxDate={today}
        slotProps={{ shortcuts: { items: shortcuts } }}
      />
    </LocalizationProvider>
  );
}
