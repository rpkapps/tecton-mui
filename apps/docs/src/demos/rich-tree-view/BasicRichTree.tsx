import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';

const items = [
  {
    id: 'assets',
    label: 'Assets',
    children: [
      {
        id: 'north-sea',
        label: 'North Sea',
        children: [
          { id: 'alpha-7', label: 'Alpha-7' },
          { id: 'bravo-2', label: 'Bravo-2' },
        ],
      },
      { id: 'gulf', label: 'Gulf of Mexico', children: [{ id: 'delta-1', label: 'Delta-1' }] },
    ],
  },
  { id: 'reports', label: 'Reports', children: [{ id: 'q3', label: 'Q3 production' }] },
  { id: 'settings', label: 'Settings' },
];

export default function BasicRichTree() {
  return (
    <Box sx={{ minWidth: 300 }}>
      <RichTreeView
        aria-label="Asset hierarchy"
        items={items}
        defaultExpandedItems={['assets', 'north-sea']}
        checkboxSelection
        multiSelect
      />
    </Box>
  );
}
