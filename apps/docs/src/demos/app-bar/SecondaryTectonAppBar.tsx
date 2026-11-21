import * as React from 'react';
import AppBar from '@tecton-mui/ui/AppBar';

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'history', label: 'History', closeable: false },
  { id: 'permissions', label: 'Permissions', closeable: false },
];

export default function SecondaryTectonAppBar() {
  const [activeTab, setActiveTab] = React.useState('details');
  return (
    <AppBar
      tier="secondary"
      tabs={TABS}
      activeTab={activeTab}
      disableTabAdd
      onTabSelect={setActiveTab}
    />
  );
}
