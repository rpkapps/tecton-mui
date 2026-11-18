import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Tab from '@tecton-mui/ui/Tab';
import Tabs from '@tecton-mui/ui/Tabs';
import Icon from '@tecton-mui/ui/Icon';

export default function PillTabs() {
  const [view, setView] = React.useState('map');
  return (
    <Stack spacing={2}>
      <Tabs
        variant="pills"
        size="small"
        value={view}
        onChange={(_, next: string) => setView(next)}
        aria-label="View"
      >
        <Tab value="map" label="Map" icon={<Icon name="map" size="small" />} iconPosition="start" />
        <Tab
          value="table"
          label="Table"
          icon={<Icon name="list" size="small" />}
          iconPosition="start"
        />
        <Tab value="3d" label="3D" icon={<Icon name="3d" size="small" />} iconPosition="start" />
      </Tabs>
    </Stack>
  );
}
