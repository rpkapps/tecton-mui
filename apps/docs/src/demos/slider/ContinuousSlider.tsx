import * as React from 'react';
import Slider from '@tecton-mui/ui/Slider';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';

export default function ContinuousSlider() {
  const [opacity, setOpacity] = React.useState(60);
  return (
    <Stack spacing={1} sx={{ width: 320 }}>
      <Typography id="opacity-label" variant="body2">
        Layer opacity: {opacity}%
      </Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Icon name="visibility-off" size="small" />
        <Slider
          aria-labelledby="opacity-label"
          value={opacity}
          onChange={(_, value) => setOpacity(value)}
        />
        <Icon name="visibility" size="small" />
      </Stack>
    </Stack>
  );
}
