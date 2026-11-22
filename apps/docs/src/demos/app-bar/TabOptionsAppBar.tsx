import * as React from 'react';
import AppBar, { AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Icon from '@tecton-mui/ui/Icon';

export default function TabOptionsAppBar() {
  const [tab, setTab] = React.useState('well-a12');
  return (
    <AppBar>
      <AppBarBrand>APP</AppBarBrand>
      <AppBarTabs value={tab} onChange={(_event, value) => setTab(String(value))}>
        <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
        {/* `tags` adds small chips after the label; `onClose` gives the tab a close button. */}
        <AppBarTab
          value="well-a12"
          icon={<Icon name="project" />}
          label="Well A-12"
          tags={['draft']}
          onClose={() => {}}
        />
        {/* Without `onClose`, the tab stays open. */}
        <AppBarTab value="overview" icon={<Icon name="grid-view" />} label="Overview" />
        {/* `disabled` greys the tab out and blocks selection. */}
        <AppBarTab value="archive" icon={<Icon name="cube" />} label="Archive" disabled />
      </AppBarTabs>
    </AppBar>
  );
}
