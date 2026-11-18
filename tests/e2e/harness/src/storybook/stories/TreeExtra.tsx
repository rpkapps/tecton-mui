// RichTreeView reproductions of the Storybook "Organisms/Tree View" Standard and Multi select
// stories (which use SimpleTreeView). Items come from `items`; the rich labels are rendered by a
// custom `slots.item` (module-level, so its identity is stable), the documented MUI pattern.
// Captions are the stories' own, so these renders compare 1:1 with the Storybook stories.
import * as React from 'react';
import { Stack, TreeItem, Typography, type TreeItemProps } from '@tecton-mui/ui';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import { ColorTag, FolderIcon, TreeLabel } from './TreeView.js';

interface Item {
  id: string;
  label: string;
  folder?: boolean;
  tag?: string;
  hidden?: boolean;
  children?: Item[];
}

const leaf = (id: string, label: string, hidden = false): Item => ({
  id,
  label,
  tag: 'Person',
  hidden,
});

const STANDARD: Item[] = [
  {
    id: 'folder-root',
    label: 'Folder',
    folder: true,
    children: [
      {
        id: 'k70-1',
        label: 'K70: Spekk fm top',
        folder: true,
        children: [
          { id: 'regional', label: 'Regional', folder: true, tag: 'Person' },
          {
            id: 'local-survey-2',
            label: 'Local - Survey 2',
            folder: true,
            tag: 'Person',
            children: [
              leaf('item-1', 'Item'),
              leaf('item-2', 'Item'),
              leaf('item-3', 'Item', true),
              leaf('item-4', 'Item', true),
              leaf('item-5', 'Item', true),
            ],
          },
        ],
      },
    ],
  },
  { id: 'k70-hidden', label: 'K70: Spekk fm top', folder: true, hidden: true },
];

const MULTI: Item[] = [
  {
    id: 'folder-root',
    label: 'Folder',
    folder: true,
    children: [
      {
        id: 'local-survey',
        label: 'Local - Survey',
        folder: true,
        tag: 'Person',
        children: [1, 2, 3, 4].map((n) => leaf(`item-${n}`, `Item ${n}`)),
      },
    ],
  },
];

const byId = new Map<string, Item>();
const index = (items: Item[]) =>
  items.forEach((item) => {
    byId.set(`${item.id}:${item.label}`, item);
    byId.set(item.id, byId.get(item.id) ?? item);
    if (item.children) index(item.children);
  });
index(STANDARD);
index(MULTI);

const LabeledItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  function LabeledItem(props, ref) {
    const item = byId.get(`${props.itemId}:${String(props.label)}`) ?? byId.get(props.itemId);
    const label = item ? (
      <TreeLabel
        icon={item.folder ? <FolderIcon /> : <ColorTag dimmed={item.hidden} />}
        label={item.label}
        tag={item.tag}
        hidden={item.hidden}
      />
    ) : (
      props.label
    );
    return <TreeItem {...props} ref={ref} label={label} />;
  },
);
const SLOTS = { item: LabeledItem };

export const meta = { title: 'Extra/Tree View' };
export const stories = {
  'extra-tree--rich-standard': {
    render: () => (
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Canonical Figma tree with Folder root, one expanded folder with 5 leaf items (first two
          visible, remaining three hidden), and a hidden variant of the same K70 folder below.
          Selection shows on the first “Item.”
        </Typography>
        <RichTreeView
          items={STANDARD}
          slots={SLOTS}
          defaultExpandedItems={['folder-root', 'k70-1', 'local-survey-2']}
          defaultSelectedItems="item-1"
          aria-label="Inventory"
          sx={{ width: 369, p: 0 }}
        />
      </Stack>
    ),
  },
  'extra-tree--rich-multi-select': {
    render: () => (
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Multi select tree with two items pre selected. Users can add or remove selections with
          click, Space, or Ctrl+click.
        </Typography>
        <RichTreeView
          items={MULTI}
          slots={SLOTS}
          multiSelect
          defaultExpandedItems={['folder-root', 'local-survey']}
          defaultSelectedItems={['item-1', 'item-3']}
          aria-label="Multi select inventory"
          sx={{ width: 369, p: 2 }}
        />
      </Stack>
    ),
  },
};
