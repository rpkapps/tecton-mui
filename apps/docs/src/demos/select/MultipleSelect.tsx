import * as React from 'react';
import Chip from '@tecton-mui/ui/Chip';
import FormControl from '@tecton-mui/ui/FormControl';
import InputLabel from '@tecton-mui/ui/InputLabel';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Select from '@tecton-mui/ui/Select';
import Stack from '@tecton-mui/ui/Stack';

const regions = ['North Sea', 'Gulf of Mexico', 'Permian', 'Campos', 'Barents Sea'];

export default function MultipleSelect() {
  const [selected, setSelected] = React.useState<string[]>(['Permian']);
  return (
    <FormControl sx={{ width: 320 }}>
      <InputLabel id="regions-label">Regions</InputLabel>
      <Select
        multiple
        labelId="regions-label"
        label="Regions"
        value={selected}
        onChange={(event) => {
          const value = event.target.value;
          setSelected(typeof value === 'string' ? value.split(',') : value);
        }}
        renderValue={(values) => (
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {values.map((v) => (
              <Chip key={v} label={v} size="small" />
            ))}
          </Stack>
        )}
      >
        {regions.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
