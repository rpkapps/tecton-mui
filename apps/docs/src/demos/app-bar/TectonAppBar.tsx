import * as React from 'react';
import AppBar, { type AppBarTab } from '@tecton-mui/ui/AppBar';
import IconButton from '@tecton-mui/ui/IconButton';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

const FIXED_TABS = [{ id: 'home', icon: 'home', label: 'Home' }];

export default function TectonAppBar() {
  const [tabs, setTabs] = React.useState<AppBarTab[]>([
    { id: 'well-a12', label: 'Well A-12', icon: 'project' },
    { id: 'well-b04', label: 'Well B-04', icon: 'project', tags: ['review'] },
  ]);
  const [activeTab, setActiveTab] = React.useState('well-a12');
  const added = React.useRef(0);

  const handleClose = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const next = tabs.filter((tab) => tab.id !== id);
    setTabs(next);
    if (activeTab === id) setActiveTab(next[Math.max(0, index - 1)]?.id ?? 'home');
  };
  const handleAdd = () => {
    added.current += 1;
    const id = `new-${added.current}`;
    setTabs([...tabs, { id, label: `New well ${added.current}`, icon: 'project' }]);
    setActiveTab(id);
  };

  return (
    <AppBar
      appName="Field Planner"
      fixedTabs={FIXED_TABS}
      tabs={tabs}
      activeTab={activeTab}
      maxTabs={6}
      onTabSelect={setActiveTab}
      onTabClose={handleClose}
      onTabAdd={handleAdd}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', height: '100%' }}>
        <IconButton aria-label="Notifications">
          <Icon name="notifications" />
        </IconButton>
        <IconButton aria-label="Account">
          <Icon name="person" />
        </IconButton>
      </Stack>
    </AppBar>
  );
}
