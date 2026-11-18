import Autocomplete from '@tecton-mui/ui/Autocomplete';
import TextField from '@tecton-mui/ui/TextField';

const basins = [
  { label: 'Anadarko', country: 'United States' },
  { label: 'Campos', country: 'Brazil' },
  { label: 'Permian', country: 'United States' },
  { label: 'Santos', country: 'Brazil' },
  { label: 'Viking Graben', country: 'Norway' },
  { label: 'Western Canada', country: 'Canada' },
];

export default function ComboBox() {
  return (
    <Autocomplete
      options={basins}
      groupBy={(option) => option.country}
      sx={{ width: 320 }}
      renderInput={(params) => <TextField {...params} label="Basin" />}
    />
  );
}
