import * as React from 'react';
import AppBar, { AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const VIEWS = [
  { id: 'geologic', label: 'Geologic Background', icon: 'grid-view' },
  { id: 'framework', label: 'Framework Model', icon: 'view-module' },
  { id: 'wells', label: 'Well Paths', icon: 'node' },
] as const;

const viewTabs = VIEWS.map((v) => (
  <AppBarTab key={v.id} value={v.id} icon={<Icon name={v.icon} />} label={v.label} />
));
const label = (id: string) => VIEWS.find((v) => v.id === id)?.label;

export default function AttachedTabsAppBar() {
  const [page, setPage] = React.useState<string>('framework');
  const [viewer, setViewer] = React.useState<string>('framework');
  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* Content on the page background: `attached` alone. */}
      <Box sx={{ border: 1, borderColor: 'divider' }}>
        <AppBar tier="secondary" aria-label="Page views">
          <AppBarTabs value={page} onChange={(_event, value) => setPage(String(value))} attached>
            {viewTabs}
          </AppBarTabs>
        </AppBar>
        <Box sx={{ height: 96, p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary">
            {label(page)}
          </Typography>
        </Box>
      </Box>
      {/* A viewer on another surface: `attached` takes its color, under a lighter bar. */}
      <Box sx={{ border: 1, borderColor: 'divider' }}>
        <AppBar tier="secondary" aria-label="Viewer views" sx={{ bgcolor: 'background.default' }}>
          <AppBarTabs
            value={viewer}
            onChange={(_event, value) => setViewer(String(value))}
            attached="background.paper"
          >
            {viewTabs}
          </AppBarTabs>
        </AppBar>
        <Box sx={{ height: 96, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary">
            {label(viewer)}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}
