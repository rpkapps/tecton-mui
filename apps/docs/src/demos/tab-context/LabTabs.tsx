import * as React from 'react';
import TabContext from '@tecton-mui/ui/TabContext';
import TabList from '@tecton-mui/ui/TabList';
import TabPanel from '@tecton-mui/ui/TabPanel';
import Tab from '@tecton-mui/ui/Tab';
import Box from '@tecton-mui/ui/Box';

export default function LabTabs() {
  const [value, setValue] = React.useState('logs');
  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={value}>
        <TabList onChange={(_, next: string) => setValue(next)} aria-label="Well data">
          <Tab label="Logs" value="logs" />
          <Tab label="Tops" value="tops" />
          <Tab label="Deviation" value="deviation" />
        </TabList>
        <TabPanel value="logs">Gamma ray, resistivity and density logs.</TabPanel>
        <TabPanel value="tops">Formation tops picked by the geology team.</TabPanel>
        <TabPanel value="deviation">Survey stations and calculated trajectory.</TabPanel>
      </TabContext>
    </Box>
  );
}
