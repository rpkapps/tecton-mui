import Autocomplete from '@tecton-mui/ui/Autocomplete';
import TextField from '@tecton-mui/ui/TextField';

const tags = ['Exploration', 'Production', 'Drilling', 'Geology', 'Reservoir', 'Seismic'];

export default function MultipleTags() {
  return (
    <Autocomplete
      multiple
      options={tags}
      defaultValue={['Geology']}
      filterSelectedOptions
      sx={{ width: 360 }}
      renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add a tag" />}
    />
  );
}
