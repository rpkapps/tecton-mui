import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimeField from '@tecton-mui/ui/DateTimeField';
import { pickersSectionListClasses } from '@tecton-mui/ui/PickersSectionList';
import { pickersInputBaseClasses } from '@tecton-mui/ui/PickersTextField';

// Each section of the value is a separate element, so it can be styled on its own: here every
// section gets a tinted box, separators are muted and the focused section is highlighted.
const sectionStyles = {
  [`& .${pickersSectionListClasses.sectionContent}`]: {
    px: 0.5,
    borderRadius: 0.5,
    bgcolor: 'action.hover',
    fontVariantNumeric: 'tabular-nums',
    '&:focus': { bgcolor: 'primary.main', color: 'primary.contrastText', outline: 'none' },
  },
  [`& .${pickersInputBaseClasses.sectionAfter}`]: { color: 'text.secondary', px: 0.25 },
};

export default function SectionStyling() {
  return (
    <LocalizationProvider>
      <DateTimeField
        label="Log entry timestamp"
        format="yyyy-MM-dd HH:mm:ss"
        defaultValue={new Date(2026, 10, 14, 3, 12, 48)}
        sx={{ width: 300, ...sectionStyles }}
        helperText="Arrow keys move between sections"
      />
    </LocalizationProvider>
  );
}
