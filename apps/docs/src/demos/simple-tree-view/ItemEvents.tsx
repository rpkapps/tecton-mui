import * as React from 'react';
import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';

export default function ItemEvents() {
  const [last, setLast] = React.useState<string>('Nothing yet');
  return (
    <Box sx={{ width: 320, maxWidth: '100%' }}>
      <SimpleTreeView
        aria-label="Facilities"
        defaultExpandedItems={['platform']}
        expansionTrigger="iconContainer"
        onItemClick={(_, itemId) => setLast(`Clicked ${itemId}`)}
        onItemExpansionToggle={(_, itemId, expanded) =>
          setLast(`${expanded ? 'Expanded' : 'Collapsed'} ${itemId}`)
        }
        onItemFocus={(_, itemId) => setLast(`Focused ${itemId}`)}
      >
        <TreeItem itemId="platform" label="Platform A">
          <TreeItem itemId="process" label="Process module" />
          <TreeItem itemId="utilities" label="Utilities module" />
        </TreeItem>
        <TreeItem itemId="subsea" label="Subsea template">
          <TreeItem itemId="manifold" label="Manifold" />
        </TreeItem>
      </SimpleTreeView>
      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ mt: 1.5, fontFamily: 'var(--tecton-font-family-mono)' }}
      >
        {last}
      </Typography>
    </Box>
  );
}
