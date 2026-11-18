import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import TextField from '@tecton-mui/ui/TextField';
import Typography from '@tecton-mui/ui/Typography';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import Tooltip from '@tecton-mui/ui/Tooltip';
import ButtonBase from '@tecton-mui/ui/ButtonBase';
import Stack from '@tecton-mui/ui/Stack';
import Icon, { type IconName, type IconVariant } from '@tecton-mui/ui/Icon';
import { tectonIconVariants } from '../../../../packages/ui/src/styles/tecton/generated/icons';

// The variant table is read from the UI package's generated icon manifest (same data the Icon
// component uses), so the gallery always lists exactly the icons of the pinned Tecton version.
const ALL = Object.keys(tectonIconVariants).sort() as IconName[];

/** Every Tecton icon; click one to copy its JSX. */
export function IconGallery() {
  const [filter, setFilter] = React.useState('');
  const [variant, setVariant] = React.useState<IconVariant>('outline');
  const [copied, setCopied] = React.useState<string | null>(null);
  const shown = ALL.filter((n) => n.includes(filter.trim().toLowerCase()));

  const copy = (name: IconName) => {
    const multicolor = tectonIconVariants[name].length === 0;
    const jsx =
      multicolor || variant === 'outline'
        ? `<Icon name="${name}" />`
        : `<Icon name="${name}" variant="filled" />`;
    void navigator.clipboard?.writeText(jsx).then(() => setCopied(name));
  };

  return (
    <Box sx={{ my: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, alignItems: { sm: 'center' } }}
      >
        <TextField
          size="small"
          label="Filter icons"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={variant}
          onChange={(_, v: IconVariant | null) => v && setVariant(v)}
          aria-label="Icon variant"
        >
          <ToggleButton value="outline">Outline</ToggleButton>
          <ToggleButton value="filled">Filled</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {shown.length} of {ALL.length} icons{copied ? ` · copied ${copied}` : ''}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          gap: 1,
        }}
      >
        {shown.map((name) => (
          <Tooltip key={name} title={`Copy <Icon name="${name}" />`}>
            <ButtonBase
              onClick={() => copy(name)}
              aria-label={`Copy ${name} icon`}
              sx={{
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Icon name={name} variant={variant} size="large" />
              <Typography variant="caption" sx={{ wordBreak: 'break-all', textAlign: 'center' }}>
                {name}
              </Typography>
            </ButtonBase>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
