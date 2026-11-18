import { SimpleTreeView } from '@tecton-mui/ui/SimpleTreeView';
import { TreeItem } from '@tecton-mui/ui/TreeItem';
import Box from '@tecton-mui/ui/Box';

export default function FileTree() {
  return (
    <Box sx={{ minWidth: 280 }}>
      <SimpleTreeView aria-label="Project files" defaultExpandedItems={['surveys']}>
        <TreeItem itemId="surveys" label="Surveys">
          <TreeItem itemId="north-2025" label="North 2025" />
          <TreeItem itemId="south-2024" label="South 2024" />
        </TreeItem>
        <TreeItem itemId="wells" label="Wells">
          <TreeItem itemId="a-12" label="A-12" />
          <TreeItem itemId="b-07" label="B-07" />
        </TreeItem>
        <TreeItem itemId="readme" label="README.md" />
      </SimpleTreeView>
    </Box>
  );
}
