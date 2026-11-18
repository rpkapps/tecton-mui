import * as React from 'react';
import FormControl from '@tecton-mui/ui/FormControl';
import InputLabel from '@tecton-mui/ui/InputLabel';
import Select, { type SelectChangeEvent } from '@tecton-mui/ui/Select';
import MenuItem from '@tecton-mui/ui/MenuItem';
import FormHelperText from '@tecton-mui/ui/FormHelperText';

export default function BasicSelect() {
  const [unit, setUnit] = React.useState('m');
  return (
    <FormControl sx={{ minWidth: 220 }}>
      <InputLabel id="unit-label">Depth unit</InputLabel>
      <Select
        labelId="unit-label"
        label="Depth unit"
        value={unit}
        onChange={(event: SelectChangeEvent) => setUnit(event.target.value)}
      >
        <MenuItem value="m">Meters</MenuItem>
        <MenuItem value="ft">Feet</MenuItem>
        <MenuItem value="km">Kilometers</MenuItem>
      </Select>
      <FormHelperText>Applies to all charts.</FormHelperText>
    </FormControl>
  );
}
