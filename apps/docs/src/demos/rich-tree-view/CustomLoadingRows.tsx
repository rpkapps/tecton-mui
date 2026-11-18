import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import RichTreeView, { type RichTreeViewPublicAPI } from '@tecton-mui/ui/RichTreeView';
import Skeleton from '@tecton-mui/ui/Skeleton';
import TreeItemLoader, {
  treeItemLoaderClasses,
  type TreeItemLoaderProps,
} from '@tecton-mui/ui/TreeItemLoader';

interface Entry {
  id: string;
  label: string;
  /** Number of direct members; `0` for a person. */
  size: number;
}

// A fake directory service. Departments know their headcount, so the tree renders exactly that
// many loading rows while the members are fetched.
const directory: Record<string, Entry[]> = {
  root: [
    { id: 'drilling', label: 'Drilling', size: 3 },
    { id: 'subsurface', label: 'Subsurface', size: 2 },
    { id: 'hse', label: 'Health, safety & environment', size: 1 },
  ],
  drilling: [
    { id: 'tomas', label: 'Tomas Lindqvist, drilling manager', size: 0 },
    { id: 'mei', label: 'Mei Chen, well planner', size: 0 },
    { id: 'rafael', label: 'Rafael Duarte, rig supervisor', size: 0 },
  ],
  subsurface: [
    { id: 'amara', label: 'Amara Nwosu, subsurface lead', size: 0 },
    { id: 'jonas', label: 'Jonas Weber, geologist', size: 0 },
  ],
  hse: [{ id: 'priya', label: 'Priya Raman, HSE advisor', size: 0 }],
};

const dataSource = {
  getChildrenCount: (entry: Entry) => entry.size,
  getTreeItems: (parentId?: string) =>
    new Promise<Entry[]>((resolve) => {
      window.setTimeout(() => resolve(directory[parentId ?? 'root'] ?? []), 1200);
    }),
};

// Each loading row keeps the `li`, role, indentation and height of `TreeItemLoader` and only
// replaces the placeholder content with the shape of a directory entry: a name and a job title.
function EntryLoader(props: TreeItemLoaderProps) {
  const odd = (props.ownerState?.index ?? 0) % 2 === 1;
  return (
    <TreeItemLoader {...props}>
      <span className={treeItemLoaderClasses.iconContainer} />
      <Skeleton width={odd ? 96 : 120} />
      <Skeleton width={odd ? 72 : 104} sx={{ opacity: 0.6 }} />
    </TreeItemLoader>
  );
}

const slots = { itemLoader: EntryLoader };

export default function CustomLoadingRows() {
  const apiRef = React.useRef<Partial<RichTreeViewPublicAPI<Entry>> | undefined>(undefined);
  return (
    <Box sx={{ width: 400, maxWidth: '100%' }}>
      <Button
        size="small"
        variant="outlined"
        sx={{ mb: 1 }}
        onClick={() => apiRef.current?.updateItemChildren?.(null)}
      >
        Reload directory
      </Button>
      <RichTreeView<Entry>
        aria-label="Company directory"
        apiRef={apiRef}
        items={[]}
        dataSource={dataSource}
        slots={slots}
      />
    </Box>
  );
}
