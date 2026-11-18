import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import TreeItemLabelInput from '@tecton-mui/ui/TreeItemLabelInput';
import Typography from '@tecton-mui/ui/Typography';

interface Entry {
  id: string;
  label: string;
  children?: Entry[];
}

const items: Entry[] = [
  {
    id: 'reports',
    label: 'Reports',
    children: [
      { id: 'weekly', label: 'weekly-production.xlsx' },
      { id: 'summary', label: 'field-summary.v2.pdf' },
    ],
  },
  {
    id: 'logs',
    label: 'Well logs',
    children: [{ id: 'gr', label: 'alpha-7_gamma-ray.las' }],
  },
];

// Wraps `TreeItemLabelInput` so that renaming a file selects the name without its extension,
// as desktop file managers do. The tree's own props (value, change, Enter / Escape / blur
// handling) are passed through unchanged.
function FileNameInput(props: React.ComponentProps<typeof TreeItemLabelInput>) {
  const { onFocus, ...other } = props;
  return (
    <TreeItemLabelInput
      {...other}
      aria-label="Name"
      spellCheck={false}
      onFocus={(event) => {
        onFocus?.(event);
        const input = event.currentTarget;
        const dot = input.value.lastIndexOf('.');
        input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
      }}
    />
  );
}

// Module-level constant: a stable identity keeps the items from re-rendering.
const slotProps = { item: { slots: { labelInput: FileNameInput } } };

export default function CustomLabelInput() {
  const [log, setLog] = React.useState('Double-click a file or press Enter on it to rename it.');
  return (
    <Box sx={{ width: 360, maxWidth: '100%' }}>
      <RichTreeView
        aria-label="Shared drive"
        items={items}
        defaultExpandedItems={['reports', 'logs']}
        isItemEditable
        slotProps={slotProps}
        onItemLabelChange={(itemId, label) => setLog(`Renamed ${itemId} to “${label}”`)}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} aria-live="polite">
        {log}
      </Typography>
    </Box>
  );
}
