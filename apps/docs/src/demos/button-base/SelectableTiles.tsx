import * as React from 'react';
import ButtonBase from '@tecton-mui/ui/ButtonBase';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';

const layers: { id: string; label: string; icon: IconName }[] = [
  { id: 'wells', label: 'Wells', icon: 'well' },
  { id: 'seismic', label: 'Seismic', icon: 'seismic' },
  { id: 'horizons', label: 'Horizons', icon: 'horizon' },
];

export default function SelectableTiles() {
  const [visible, setVisible] = React.useState<string[]>(['wells']);
  const toggle = (id: string) =>
    setVisible((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  return (
    <Stack direction="row" spacing={2} role="group" aria-label="Map layers">
      {layers.map((layer) => {
        const on = visible.includes(layer.id);
        return (
          <ButtonBase
            key={layer.id}
            focusRipple
            aria-pressed={on}
            onClick={() => toggle(layer.id)}
            sx={(theme) => ({
              flexDirection: 'column',
              gap: 1,
              width: 104,
              py: 2,
              borderRadius: `${theme.shape.borderRadius}px`,
              border: 1,
              borderColor: on ? 'primary.main' : 'divider',
              bgcolor: on ? 'primary.main' : 'background.paper',
              color: on ? 'primary.contrastText' : 'text.primary',
              '&:hover': { bgcolor: on ? 'primary.dark' : 'action.hover' },
              '&.Mui-focusVisible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            })}
          >
            <Icon name={layer.icon} size="large" />
            <Typography variant="body2">{layer.label}</Typography>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
