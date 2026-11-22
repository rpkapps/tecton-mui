import * as React from 'react';
import AppBar, { AppBarActions, AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import IconButton from '@tecton-mui/ui/IconButton';
import Icon from '@tecton-mui/ui/Icon';

interface Well {
  id: string;
  name: string;
  tags?: string[];
}

export default function TectonAppBar() {
  const [wells, setWells] = React.useState<Well[]>([
    { id: 'well-a12', name: 'Well A-12' },
    { id: 'well-b04', name: 'Well B-04', tags: ['review'] },
  ]);
  const [tab, setTab] = React.useState('well-a12');
  const added = React.useRef(0);

  const handleClose = (id: string) => {
    const index = wells.findIndex((well) => well.id === id);
    const next = wells.filter((well) => well.id !== id);
    setWells(next);
    if (tab === id) setTab(next[Math.max(0, index - 1)]?.id ?? 'home');
  };
  const handleAdd = () => {
    added.current += 1;
    const id = `new-${added.current}`;
    setWells([...wells, { id, name: `New well ${added.current}` }]);
    setTab(id);
  };

  return (
    <AppBar>
      <AppBarBrand>Field Planner</AppBarBrand>
      <AppBarTabs
        value={tab}
        onChange={(_event, value) => setTab(String(value))}
        // No more tabs once six wells are open.
        onAdd={wells.length < 6 ? handleAdd : undefined}
      >
        <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
        {wells.map((well) => (
          <AppBarTab
            key={well.id}
            value={well.id}
            icon={<Icon name="project" />}
            label={well.name}
            tags={well.tags}
            onClose={() => handleClose(well.id)}
          />
        ))}
      </AppBarTabs>
      <AppBarActions>
        <IconButton aria-label="Notifications">
          <Icon name="notifications" />
        </IconButton>
        <IconButton aria-label="Account">
          <Icon name="person" />
        </IconButton>
      </AppBarActions>
    </AppBar>
  );
}
