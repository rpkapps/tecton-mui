import * as React from 'react';
import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';
import Box from '@tecton-mui/ui/Box';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Switch from '@tecton-mui/ui/Switch';

export default function DisabledItems() {
  const [focusable, setFocusable] = React.useState(false);
  return (
    <Box sx={{ width: 320, maxWidth: '100%' }}>
      <FormControlLabel
        control={<Switch checked={focusable} onChange={(e) => setFocusable(e.target.checked)} />}
        label="Disabled items focusable"
      />
      <SimpleTreeView
        aria-label="Log curves"
        defaultExpandedItems={['logs']}
        disabledItemsFocusable={focusable}
      >
        <TreeItem itemId="logs" label="Wireline logs">
          <TreeItem itemId="gr" label="Gamma ray (GR)" />
          <TreeItem itemId="rhob" label="Bulk density (RHOB) · licence expired" disabled />
          <TreeItem itemId="nphi" label="Neutron porosity (NPHI)" />
          <TreeItem itemId="dt" label="Sonic (DT) · processing" disabled />
        </TreeItem>
        <TreeItem itemId="core" label="Core photos" disabled>
          <TreeItem itemId="core-1" label="Core 1" />
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
