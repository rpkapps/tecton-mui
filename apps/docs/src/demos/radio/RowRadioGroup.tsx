import * as React from 'react';
import FormControl from '@tecton-mui/ui/FormControl';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import FormLabel from '@tecton-mui/ui/FormLabel';
import Radio from '@tecton-mui/ui/Radio';
import RadioGroup from '@tecton-mui/ui/RadioGroup';
import Typography from '@tecton-mui/ui/Typography';

export default function RowRadioGroup() {
  const [view, setView] = React.useState('map');
  return (
    <FormControl>
      <FormLabel id="view-label">Default view</FormLabel>
      <RadioGroup
        row
        aria-labelledby="view-label"
        name="view"
        value={view}
        onChange={(event) => setView(event.target.value)}
      >
        <FormControlLabel value="map" control={<Radio />} label="Map" />
        <FormControlLabel value="table" control={<Radio />} label="Table" />
        <FormControlLabel value="chart" control={<Radio />} label="Chart" />
      </RadioGroup>
      <Typography variant="body2" color="text.secondary">
        Selected: {view}
      </Typography>
    </FormControl>
  );
}
