import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';
import Typography from '@tecton-mui/ui/Typography';

export default function ControlledSelection() {
  const [selected, setSelected] = React.useState<string[]>(['faults']);
  return (
    <Box sx={{ minWidth: 300 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Visible layers: {selected.join(', ') || 'none'}
      </Typography>
      <SimpleTreeView
        aria-label="Map layers"
        multiSelect
        checkboxSelection
        selectedItems={selected}
        onSelectedItemsChange={(_, items) => setSelected(items)}
        defaultExpandedItems={['geology']}
      >
        <TreeItem itemId="geology" label="Geology">
          <TreeItem itemId="faults" label="Faults" />
          <TreeItem itemId="horizons" label="Horizons" />
        </TreeItem>
        <TreeItem itemId="infrastructure" label="Infrastructure">
          <TreeItem itemId="pipelines" label="Pipelines" />
          <TreeItem itemId="platforms" label="Platforms" />
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
