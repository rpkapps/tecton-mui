import * as React from 'react';
import AppBar, { AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const MAX_TABS = 3;

export default function TabLimitsAppBar() {
  const [tabs, setTabs] = React.useState([{ id: 'tab-1', label: 'Tab 1' }]);
  const [tab, setTab] = React.useState('tab-1');
  const next = React.useRef(2);

  const handleAdd = () => {
    const id = `tab-${next.current}`;
    setTabs((current) => [...current, { id, label: `Tab ${next.current}` }]);
    setTab(id);
    next.current += 1;
  };
  const handleClose = (id: string) => {
    const index = tabs.findIndex((t) => t.id === id);
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (tab === id) setTab(remaining[Math.max(0, index - 1)]?.id ?? 'home');
  };

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {`${tabs.length} of ${MAX_TABS} tabs open`}
      </Typography>
      <AppBar>
        <AppBarBrand>APP</AppBarBrand>
        <AppBarTabs
          value={tab}
          onChange={(_event, value) => setTab(String(value))}
          // The add button goes away at the cap: leave `onAdd` out.
          onAdd={tabs.length < MAX_TABS ? handleAdd : undefined}
        >
          <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
          {tabs.map((t) => (
            <AppBarTab
              key={t.id}
              value={t.id}
              icon={<Icon name="project" />}
              label={t.label}
              onClose={() => handleClose(t.id)}
            />
          ))}
        </AppBarTabs>
      </AppBar>
    </Stack>
  );
}
