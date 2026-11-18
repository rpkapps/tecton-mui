import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import RichTreeView from '@tecton-mui/ui/RichTreeView';

const items = [
  {
    id: 'backlog',
    label: 'Backlog',
    children: [
      { id: 'survey', label: 'Review survey' },
      { id: 'horizons', label: 'Pick horizons' },
    ],
  },
  {
    id: 'doing',
    label: 'In progress',
    children: [{ id: 'velocity', label: 'Velocity model' }],
  },
  { id: 'done', label: 'Done', children: [] },
];

export default function ReorderingTree() {
  const [message, setMessage] = React.useState('');
  return (
    <Box sx={{ minWidth: 320 }}>
      <RichTreeView
        aria-label="Tasks"
        items={items}
        defaultExpandedItems={['backlog', 'doing', 'done']}
        itemsReordering
        isItemReorderable={(itemId) => !['backlog', 'doing', 'done'].includes(itemId)}
        onItemPositionChange={({ itemId, newPosition }) =>
          setMessage(`${itemId} moved to ${newPosition.parentId ?? 'the root'}`)
        }
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} aria-live="polite">
        {message || 'Drag a task, or focus it and press Alt+Shift+Arrow keys.'}
      </Typography>
    </Box>
  );
}
