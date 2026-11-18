import * as React from 'react';
import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';

const PARENTS = ['volve', 'volve-wells', 'sleipner', 'sleipner-wells'];

export default function ExpansionControl() {
  const [expanded, setExpanded] = React.useState<string[]>(['volve']);
  return (
    <Box sx={{ width: 320, maxWidth: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button size="small" variant="outlined" onClick={() => setExpanded(PARENTS)}>
          Expand all
        </Button>
        <Button size="small" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </Stack>
      <SimpleTreeView
        aria-label="Fields and wells"
        expandedItems={expanded}
        onExpandedItemsChange={(_, items) => setExpanded(items)}
      >
        <TreeItem itemId="volve" label="Volve">
          <TreeItem itemId="volve-wells" label="Wells">
            <TreeItem itemId="f-11" label="15/9-F-11" />
            <TreeItem itemId="f-12" label="15/9-F-12" />
            <TreeItem itemId="f-14" label="15/9-F-14" />
          </TreeItem>
          <TreeItem itemId="volve-seismic" label="Seismic 2010" />
        </TreeItem>
        <TreeItem itemId="sleipner" label="Sleipner">
          <TreeItem itemId="sleipner-wells" label="Wells">
            <TreeItem itemId="a-1" label="15/9-A-1" />
          </TreeItem>
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
