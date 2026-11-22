import * as React from 'react';
import AppBar, { AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';

export default function SecondaryTectonAppBar() {
  const [showDetails, setShowDetails] = React.useState(true);
  const [tab, setTab] = React.useState('details');
  return (
    <AppBar tier="secondary" aria-label="Sections">
      <AppBarTabs value={tab} onChange={(_event, value) => setTab(String(value))}>
        {showDetails && (
          <AppBarTab
            value="details"
            label="Details"
            onClose={() => {
              setShowDetails(false);
              setTab('history');
            }}
          />
        )}
        <AppBarTab value="history" label="History" />
        <AppBarTab value="permissions" label="Permissions" />
      </AppBarTabs>
    </AppBar>
  );
}
