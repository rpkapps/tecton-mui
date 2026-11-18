import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Slider from '@tecton-mui/ui/Slider';
import Typography from '@tecton-mui/ui/Typography';

const marks = [0, 1000, 2000, 3000, 4000].map((value) => ({ value, label: `${value} m` }));

export default function RangeSlider() {
  const [range, setRange] = React.useState<number[]>([800, 2600]);
  return (
    <Box sx={{ width: 360, px: 2 }}>
      <Typography id="depth-range" variant="body2" gutterBottom>
        Depth interval
      </Typography>
      <Slider
        aria-labelledby="depth-range"
        value={range}
        onChange={(_, value) => setRange(value)}
        min={0}
        max={4000}
        step={100}
        marks={marks}
        valueLabelDisplay="auto"
        getAriaValueText={(value) => `${value} meters`}
        disableSwap
      />
    </Box>
  );
}
