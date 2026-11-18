import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import TreeItemDragAndDropOverlay, {
  type TreeItemDragAndDropOverlayProps,
} from '@tecton-mui/ui/TreeItemDragAndDropOverlay';
import Typography from '@tecton-mui/ui/Typography';

const groups = [
  {
    id: 'admins',
    label: 'Administrators',
    children: [{ id: 'ines', label: 'Ines Okafor' }],
  },
  {
    id: 'editors',
    label: 'Editors',
    children: [
      { id: 'mei', label: 'Mei Chen' },
      { id: 'jonas', label: 'Jonas Weber' },
    ],
  },
  {
    id: 'viewers',
    label: 'Viewers',
    children: [
      { id: 'rafael', label: 'Rafael Duarte' },
      { id: 'priya', label: 'Priya Raman' },
    ],
  },
];
const groupIds = new Set(groups.map((group) => group.id));
const labels = new Map(
  groups.flatMap((group) => [group, ...group.children]).map((item) => [item.id, item.label]),
);

type DropAction = NonNullable<TreeItemDragAndDropOverlayProps['action']>;
const hints: Record<DropAction, string> = {
  'make-child': 'Add to group',
  'reorder-above': 'Insert above',
  'reorder-below': 'Insert below',
  'move-to-parent': 'Move up a level',
};

// Keeps the stock indicator (line or highlight) and adds a short hint naming the drop action.
// The hint is decorative: the tree announces every move in a live region.
function DropHint(props: TreeItemDragAndDropOverlayProps) {
  if (props.action == null) {
    return null;
  }
  return (
    <React.Fragment>
      <TreeItemDragAndDropOverlay {...props} />
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          insetInlineEnd: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          px: 1,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          typography: 'caption',
        }}
      >
        {hints[props.action]}
      </Box>
    </React.Fragment>
  );
}

// Module-level constants keep stable identities. `slotProps.item.slots.dragAndDropOverlay`
// replaces the overlay of every item.
const slotProps = { item: { slots: { dragAndDropOverlay: DropHint } } };
const expandedGroups = [...groupIds];

export default function CustomDropIndicator() {
  const [message, setMessage] = React.useState('Drag a person onto another group.');
  return (
    <Box sx={{ width: 380, maxWidth: '100%' }}>
      <RichTreeView
        aria-label="Access groups"
        items={groups}
        defaultExpandedItems={expandedGroups}
        itemsReordering
        isItemReorderable={(itemId) => !groupIds.has(itemId)}
        // People always stay inside a group: no nesting under a person, no root level.
        canMoveItemToNewPosition={({ newPosition }) =>
          newPosition.parentId != null && groupIds.has(newPosition.parentId)
        }
        onItemPositionChange={({ itemId, newPosition }) =>
          setMessage(`${labels.get(itemId)} is now in ${labels.get(newPosition.parentId ?? '')}.`)
        }
        slotProps={slotProps}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {message}
      </Typography>
    </Box>
  );
}
