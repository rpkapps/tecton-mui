import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ColorSwatchControl from '@tecton-mui/ui/ColorSwatchControl';

export default function CommittedColorSwatch() {
  const [color, setColor] = React.useState('#6D28D9');
  const [history, setHistory] = React.useState<string[]>([]);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <ColorSwatchControl
        aria-label="Well marker color"
        value={color}
        onChange={(_event, value) => setColor(value)}
        onChangeCommitted={(_event, value) =>
          setHistory((colors) => [value, ...colors].slice(0, 5))
        }
      />
      <Typography variant="body2" color="text.secondary">
        Live: {color} · Committed: {history.length ? history.join(', ') : 'none yet'}
      </Typography>
    </Stack>
  );
}
