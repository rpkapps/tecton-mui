import Box from '@tecton-mui/ui/Box';
import RichTreeView from '@tecton-mui/ui/RichTreeView';

type Node = { id: string; label: string; childrenCount: number };

// A fake server: each level has four children, three levels deep.
function fetchChildren(parentId?: string): Promise<Node[]> {
  const depth = parentId ? parentId.split('/').length : 0;
  const nodes = Array.from({ length: 4 }, (_, i) => {
    const id = parentId ? `${parentId}/${i + 1}` : `${i + 1}`;
    return { id, label: `Folder ${id}`, childrenCount: depth < 2 ? 4 : 0 };
  });
  return new Promise((resolve) => window.setTimeout(() => resolve(nodes), 500));
}

export default function LazyLoadingTree() {
  return (
    <Box sx={{ minWidth: 300 }}>
      <RichTreeView<Node>
        aria-label="Remote folders"
        items={[]}
        dataSource={{
          getChildrenCount: (item) => item.childrenCount,
          getTreeItems: fetchChildren,
        }}
      />
    </Box>
  );
}
