import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import Typography from '@tecton-mui/ui/Typography';

interface Folder {
  id: string;
  label: string;
  locked?: boolean;
  children?: Folder[];
}

const initialItems: Folder[] = [
  {
    id: 'interpretation',
    label: 'Interpretation',
    locked: true,
    children: [
      { id: 'run-1', label: 'Facies model, run 1' },
      { id: 'run-2', label: 'Facies model, run 2' },
    ],
  },
  { id: 'scratch', label: 'Scratch' },
];

const isEditable = (item: Folder) => !item.locked;

export default function LabelEditing() {
  const [log, setLog] = React.useState('Double-click a run or press Enter on it to rename.');
  return (
    <Box sx={{ width: 340, maxWidth: '100%' }}>
      <RichTreeView
        aria-label="Project folders"
        items={initialItems}
        defaultExpandedItems={['interpretation']}
        isItemEditable={isEditable}
        onItemLabelChange={(itemId, label) => setLog(`Renamed ${itemId} to “${label}”`)}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} aria-live="polite">
        {log}
      </Typography>
    </Box>
  );
}
