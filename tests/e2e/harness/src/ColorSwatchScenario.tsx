import * as React from 'react';
import { Box, Stack, Typography } from '@tecton-mui/ui';
import ColorSwatchControl from '@tecton-mui/ui/ColorSwatchControl';

export function ColorSwatchScenario() {
  const [fill, setFill] = React.useState('#218585');
  const [committed, setCommitted] = React.useState('none');
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <button type="button">Start</button>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography component="label" htmlFor="fill" variant="body2">
            Fill
          </Typography>
          <ColorSwatchControl
            id="fill"
            value={fill}
            onChange={(_event, value) => setFill(value)}
            onChangeCommitted={(_event, value) => setCommitted(value)}
          />
        </Stack>
        <Typography data-testid="color-swatch-state">
          fill={fill} committed={committed}
        </Typography>
        <ColorSwatchControl aria-label="Stroke" size="small" defaultValue="#c2410c" />
        <ColorSwatchControl aria-label="Inherited fill" defaultValue="#218585" inherited />
        <ColorSwatchControl aria-label="Locked fill" defaultValue="#218585" disabled />
      </Stack>
    </Box>
  );
}
