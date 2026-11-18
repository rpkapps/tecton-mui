import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import Typography from '@tecton-mui/ui/Typography';

const items = [
  {
    id: 'north-sea',
    label: 'North Sea',
    children: [
      {
        id: 'volve',
        label: 'Volve',
        children: [
          { id: 'f-11', label: 'F-11' },
          { id: 'f-12', label: 'F-12' },
        ],
      },
      {
        id: 'sleipner',
        label: 'Sleipner',
        children: [
          { id: 'a-1', label: 'A-1' },
          { id: 'a-4', label: 'A-4' },
        ],
      },
    ],
  },
  { id: 'barents', label: 'Barents Sea', children: [{ id: 'snohvit', label: 'Snøhvit' }] },
];

// Selecting a parent selects its descendants; selecting every child selects the parent.
const propagation = { parents: true, descendants: true };

export default function SelectionPropagation() {
  const [selected, setSelected] = React.useState<string[]>(['volve', 'f-11', 'f-12']);
  return (
    <Box sx={{ width: 340, maxWidth: '100%' }}>
      <RichTreeView
        aria-label="Wells to include in the report"
        items={items}
        multiSelect
        checkboxSelection
        selectionPropagation={propagation}
        selectedItems={selected}
        onSelectedItemsChange={(_, ids) => setSelected(ids)}
        defaultExpandedItems={['north-sea', 'volve', 'sleipner']}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} aria-live="polite">
        {selected.length} selected: {selected.join(', ') || 'none'}
      </Typography>
    </Box>
  );
}
