import * as React from 'react';
import { Box, Stack, Typography } from '@tecton-mui/ui';
import AppBar, { AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';

const VIEWS: { id: string; label: string; icon: IconName }[] = [
  { id: 'geologic', label: 'Geologic Background', icon: 'grid-view' },
  { id: 'framework', label: 'Framework Model', icon: 'view-module' },
  { id: 'wells', label: 'Well Paths', icon: 'node' },
];

/** A bar with attached tabs over the content it opens into. */
function Example({
  label,
  tier,
  surface,
  barColor,
}: {
  label: string;
  tier: 'primary' | 'secondary';
  surface?: string;
  barColor?: string;
}) {
  const [active, setActive] = React.useState<string | false>('framework');
  const [views, setViews] = React.useState(VIEWS);
  return (
    <Box data-testid={`example-${label}`}>
      <AppBar aria-label={label} tier={tier} sx={barColor ? { bgcolor: barColor } : undefined}>
        {tier === 'primary' && <AppBarBrand>DSG</AppBarBrand>}
        <AppBarTabs
          value={active}
          onChange={(_event, id) => setActive(String(id))}
          attached={surface ?? true}
        >
          {views.map((view) => (
            <AppBarTab
              key={view.id}
              value={view.id}
              label={view.label}
              icon={<Icon name={view.icon} />}
              onClose={() => {
                const next = views.filter((v) => v.id !== view.id);
                setViews(next);
                setActive(next[0]?.id ?? false);
              }}
            />
          ))}
        </AppBarTabs>
      </AppBar>
      <Box
        data-testid={`content-${label}`}
        sx={{ height: 64, p: 2, bgcolor: surface ?? 'background.default' }}
      >
        <Typography variant="body2" color="text.secondary">
          {views.find((v) => v.id === active)?.label}
        </Typography>
      </Box>
    </Box>
  );
}

export function AppBarAttachedScenario() {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Example label="primary" tier="primary" />
      <Example label="secondary" tier="secondary" />
      {/* The pattern frame: a lighter bar over a darker view. */}
      <Example
        label="surface"
        tier="secondary"
        surface="background.paper"
        barColor="background.default"
      />
    </Stack>
  );
}
