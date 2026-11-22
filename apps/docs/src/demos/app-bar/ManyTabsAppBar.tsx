import * as React from 'react';
import AppBar, { AppBarActions, AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import IconButton from '@tecton-mui/ui/IconButton';
import Icon from '@tecton-mui/ui/Icon';

const INITIAL_WELLS = Array.from({ length: 14 }, (_, i) => ({
  id: `well-${i + 1}`,
  name: `Well ${String.fromCharCode(65 + (i % 26))}-${10 + i}`,
}));

export default function ManyTabsAppBar() {
  const [wells, setWells] = React.useState(INITIAL_WELLS);
  const [tab, setTab] = React.useState('well-1');

  const handleClose = (id: string) => {
    const index = wells.findIndex((well) => well.id === id);
    const remaining = wells.filter((well) => well.id !== id);
    setWells(remaining);
    if (tab === id) setTab(remaining[Math.max(0, index - 1)]?.id ?? 'home');
  };

  return (
    <AppBar>
      <AppBarBrand>APP</AppBarBrand>
      <AppBarTabs value={tab} onChange={(_event, value) => setTab(String(value))}>
        <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
        {wells.map((well) => (
          <AppBarTab
            key={well.id}
            value={well.id}
            icon={<Icon name="project" />}
            label={well.name}
            onClose={() => handleClose(well.id)}
          />
        ))}
      </AppBarTabs>
      <AppBarActions>
        <IconButton aria-label="Notifications">
          <Icon name="notifications" />
        </IconButton>
      </AppBarActions>
    </AppBar>
  );
}
