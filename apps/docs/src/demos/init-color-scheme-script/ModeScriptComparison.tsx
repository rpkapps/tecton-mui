import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Box from '@tecton-mui/ui/Box';
import InitColorSchemeScript from '@tecton-mui/ui/InitColorSchemeScript';
import Stack from '@tecton-mui/ui/Stack';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import Typography from '@tecton-mui/ui/Typography';
import { TectonModeScript } from '@tecton-mui/ui/styles';

type Source = 'tecton' | 'mui';

const NOTES: Record<Source, string> = {
  tecton:
    'Reads the tecton-theme-mode preference and sets data-theme on <html>: the attribute the Tecton tokens and the shared theme manager use.',
  mui: 'Reads mui-mode / mui-color-scheme and sets data-mui-color-scheme: only a theme with CSS variables and colorSchemeSelector reacts to it. The Tecton theme does not.',
};

// Both components only emit their <script> in a server render, so render them the way the server
// does. The markup is shown as text and never inserted into this page.
const ELEMENTS: Record<Source, React.ReactElement> = {
  tecton: <TectonModeScript />,
  mui: <InitColorSchemeScript />,
};

export default function ModeScriptComparison() {
  const [source, setSource] = React.useState<Source>('tecton');
  const markup = React.useMemo(() => renderToStaticMarkup(ELEMENTS[source]), [source]);
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={source}
        onChange={(_, value: Source | null) => value && setSource(value)}
        aria-label="Inline script"
      >
        <ToggleButton value="tecton">TectonModeScript</ToggleButton>
        <ToggleButton value="mui">InitColorSchemeScript</ToggleButton>
      </ToggleButtonGroup>
      <Typography variant="body2">{NOTES[source]}</Typography>
      <Box
        component="pre"
        tabIndex={0}
        aria-label="Server-rendered markup"
        sx={{
          m: 0,
          p: 2,
          maxHeight: 220,
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          typography: 'caption',
          fontFamily: 'monospace',
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        {markup}
      </Box>
    </Stack>
  );
}
