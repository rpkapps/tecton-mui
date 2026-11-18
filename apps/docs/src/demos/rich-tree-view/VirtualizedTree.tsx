import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';

// 50 fields with 100 wells each: 5,050 items, of which only the visible rows are mounted.
const items = Array.from({ length: 50 }, (_, f) => ({
  id: `field-${f + 1}`,
  label: `Field ${f + 1}`,
  children: Array.from({ length: 100 }, (_, w) => ({
    id: `field-${f + 1}-well-${w + 1}`,
    label: `Well ${f + 1}-${w + 1}`,
  })),
}));

export default function VirtualizedTree() {
  return (
    <Box sx={{ height: 320, width: 320 }}>
      <RichTreeView
        aria-label="Fields and wells"
        items={items}
        defaultExpandedItems={['field-1', 'field-2']}
        virtualization
      />
    </Box>
  );
}
