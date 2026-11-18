import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';
import Box from '@tecton-mui/ui/Box';

export default function MultiSelectTree() {
  return (
    <Box sx={{ width: 320, maxWidth: '100%' }}>
      <SimpleTreeView
        aria-label="Horizons to export"
        multiSelect
        defaultExpandedItems={['north', 'south']}
        defaultSelectedItems={['top-brent', 'top-statfjord']}
      >
        <TreeItem itemId="north" label="North block">
          <TreeItem itemId="top-brent" label="Top Brent" />
          <TreeItem itemId="top-dunlin" label="Top Dunlin" />
        </TreeItem>
        <TreeItem itemId="south" label="South block">
          <TreeItem itemId="top-statfjord" label="Top Statfjord" />
          <TreeItem itemId="base-cretaceous" label="Base Cretaceous" />
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
