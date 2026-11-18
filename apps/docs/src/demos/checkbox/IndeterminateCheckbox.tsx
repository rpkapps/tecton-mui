import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Checkbox from '@tecton-mui/ui/Checkbox';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';

const layers = ['Wells', 'Faults', 'Horizons'];

export default function IndeterminateCheckbox() {
  const [checked, setChecked] = React.useState([true, false, true]);
  const all = checked.every(Boolean);
  const some = checked.some(Boolean) && !all;
  return (
    <div>
      <FormControlLabel
        label="All layers"
        control={
          <Checkbox
            checked={all}
            indeterminate={some}
            onChange={(event) => setChecked(checked.map(() => event.target.checked))}
          />
        }
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
        {layers.map((layer, index) => (
          <FormControlLabel
            key={layer}
            label={layer}
            control={
              <Checkbox
                checked={checked[index]}
                onChange={(event) =>
                  setChecked(checked.map((c, i) => (i === index ? event.target.checked : c)))
                }
              />
            }
          />
        ))}
      </Box>
    </div>
  );
}
