import * as React from 'react';
import AppBar, { type AppBarTab } from '@tecton-mui/ui/AppBar';
import IconButton from '@tecton-mui/ui/IconButton';
import Icon from '@tecton-mui/ui/Icon';

const FIXED_TABS = [{ id: 'home', icon: 'home', label: 'Home' }];
const INITIAL_TABS: AppBarTab[] = Array.from({ length: 14 }, (_, i) => ({
  id: `well-${i + 1}`,
  label: `Well ${String.fromCharCode(65 + (i % 26))}-${10 + i}`,
  icon: 'project',
}));

export default function ManyTabsAppBar() {
  const [tabs, setTabs] = React.useState(INITIAL_TABS);
  const [activeTab, setActiveTab] = React.useState('well-1');

  const handleClose = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (activeTab === id) setActiveTab(remaining[Math.max(0, index - 1)]?.id ?? 'home');
  };

  return (
    <AppBar
      appName="APP"
      fixedTabs={FIXED_TABS}
      tabs={tabs}
      activeTab={activeTab}
      disableTabAdd
      onTabSelect={setActiveTab}
      onTabClose={handleClose}
    >
      <IconButton aria-label="Notifications">
        <Icon name="notifications" />
      </IconButton>
    </AppBar>
  );
}
