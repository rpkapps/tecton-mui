import * as React from 'react';
import FormControl from '@tecton-mui/ui/FormControl';
import FormHelperText from '@tecton-mui/ui/FormHelperText';
import InputLabel from '@tecton-mui/ui/InputLabel';
import NativeSelect from '@tecton-mui/ui/NativeSelect';
import Stack from '@tecton-mui/ui/Stack';

export default function NativeSelectStates() {
  const [basin, setBasin] = React.useState('');
  const missing = basin === '';
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <FormControl variant="standard" required error={missing} sx={{ minWidth: 200 }}>
        <InputLabel variant="standard" htmlFor="native-select-basin">
          Basin
        </InputLabel>
        <NativeSelect
          value={basin}
          onChange={(event) => setBasin(event.target.value)}
          inputProps={{
            id: 'native-select-basin',
            'aria-describedby': 'native-select-basin-helper',
          }}
        >
          <option value="" disabled>
            Choose a basin
          </option>
          <option value="north-sea">North Sea</option>
          <option value="permian">Permian</option>
          <option value="santos">Santos</option>
        </NativeSelect>
        <FormHelperText id="native-select-basin-helper">
          {missing ? 'Select a basin to continue' : 'Required'}
        </FormHelperText>
      </FormControl>
      <FormControl variant="standard" disabled sx={{ minWidth: 200 }}>
        <InputLabel variant="standard" htmlFor="native-select-locked">
          Project
        </InputLabel>
        <NativeSelect defaultValue="alpha" inputProps={{ id: 'native-select-locked' }}>
          <option value="alpha">Alpha</option>
        </NativeSelect>
        <FormHelperText>Locked by an administrator</FormHelperText>
      </FormControl>
    </Stack>
  );
}
