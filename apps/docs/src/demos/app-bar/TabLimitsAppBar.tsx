import * as React from 'react';
import AppBar, { type AppBarTab } from '@tecton-mui/ui/AppBar';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const FIXED_TABS = [{ id: 'home', icon: 'home', label: 'Home' }];
const MAX_TABS = 3;

export default function TabLimitsAppBar() {
  const [tabs, setTabs] = React.useState<AppBarTab[]>([
    { id: 'tab-1', label: 'Tab 1', icon: 'project' },
  ]);
  const [activeTab, setActiveTab] = React.useState('tab-1');
  const next = React.useRef(2);

  const handleAdd = () => {
    const id = `tab-${next.current}`;
    setTabs((current) => [...current, { id, label: `Tab ${next.current}`, icon: 'project' }]);
    setActiveTab(id);
    next.current += 1;
  };
  const handleClose = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (activeTab === id) setActiveTab(remaining[Math.max(0, index - 1)]?.id ?? 'home');
  };

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {`maxTabs={${MAX_TABS}}: ${tabs.length} of ${MAX_TABS} tabs open`}
      </Typography>
      <AppBar
        appName="APP"
        fixedTabs={FIXED_TABS}
        tabs={tabs}
        activeTab={activeTab}
        maxTabs={MAX_TABS}
        onTabSelect={setActiveTab}
        onTabAdd={handleAdd}
        onTabClose={handleClose}
      />
    </Stack>
  );
}
