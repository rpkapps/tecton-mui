import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ColorSwatchControl from '@tecton-mui/ui/ColorSwatchControl';

export default function BasicColorSwatch() {
  const [fill, setFill] = React.useState('#218585');
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Typography component="label" htmlFor="horizon-fill" variant="body2">
        Horizon fill
      </Typography>
      <ColorSwatchControl
        id="horizon-fill"
        value={fill}
        onChange={(_event, value) => setFill(value)}
      />
    </Stack>
  );
}
