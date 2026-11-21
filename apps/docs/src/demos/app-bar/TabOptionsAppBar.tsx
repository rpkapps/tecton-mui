import * as React from 'react';
import AppBar, { type AppBarTab } from '@tecton-mui/ui/AppBar';

const FIXED_TABS = [{ id: 'home', icon: 'home', label: 'Home' }];
const TABS: AppBarTab[] = [
  // `tags` adds small chips after the label.
  { id: 'well-a12', label: 'Well A-12', icon: 'project', tags: ['draft'] },
  // `closeable: false` keeps the tab open: no close button.
  { id: 'overview', label: 'Overview', icon: 'grid-view', closeable: false },
  // `disabled` greys the tab out and blocks selection.
  { id: 'archive', label: 'Archive', icon: 'cube', disabled: true },
];

export default function TabOptionsAppBar() {
  const [activeTab, setActiveTab] = React.useState('well-a12');
  return (
    <AppBar
      appName="APP"
      fixedTabs={FIXED_TABS}
      tabs={TABS}
      activeTab={activeTab}
      disableTabAdd
      onTabSelect={setActiveTab}
    />
  );
}
