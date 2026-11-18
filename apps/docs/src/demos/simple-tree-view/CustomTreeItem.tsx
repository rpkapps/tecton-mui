import * as React from 'react';
import Avatar from '@tecton-mui/ui/Avatar';
import Box from '@tecton-mui/ui/Box';
import Chip from '@tecton-mui/ui/Chip';
import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import Typography from '@tecton-mui/ui/Typography';
import {
  TreeItemContent,
  TreeItemGroupTransition,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemRoot,
  treeItemClasses,
} from '@tecton-mui/ui/TreeItem';
import TreeItemIcon from '@tecton-mui/ui/TreeItemIcon';
import TreeItemProvider from '@tecton-mui/ui/TreeItemProvider';
import { useTreeItem, type UseTreeItemParameters } from '@tecton-mui/ui/useTreeItem';

interface PersonItemProps
  extends
    Omit<UseTreeItemParameters, 'rootRef' | 'label'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus' | 'id' | 'children'> {
  name: string;
  jobTitle: string;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

// A tree item assembled from the same parts as `TreeItem`: `useTreeItem` provides the props and
// state, `TreeItemProvider` registers the item with the tree, and `TreeItemIcon` picks the
// expand / collapse icon from the item status and the tree's icon slots.
const PersonItem = React.forwardRef(function PersonItem(
  props: PersonItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, name, jobTitle, disabled, children, ...other } = props;
  const {
    getContextProviderProps,
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem({ id, itemId, label: name, disabled, children, rootRef: ref });
  const reports = React.Children.count(children);

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <TreeItemRoot {...getRootProps({ ...other, className: treeItemClasses.root })}>
        <TreeItemContent
          {...getContentProps({ className: treeItemClasses.content })}
          status={status}
        >
          <TreeItemIconContainer
            {...getIconContainerProps({ className: treeItemClasses.iconContainer })}
          >
            <TreeItemIcon status={status} />
          </TreeItemIconContainer>
          <Avatar size="small" aria-hidden>
            {initials(name)}
          </Avatar>
          <TreeItemLabel
            {...getLabelProps({ className: treeItemClasses.label })}
            sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}
          >
            <span>{name}</span>
            <Typography component="span" variant="body2" color="text.secondary" noWrap>
              {jobTitle}
            </Typography>
          </TreeItemLabel>
          {reports > 0 && (
            <Chip size="small" label={`${reports} ${reports === 1 ? 'report' : 'reports'}`} />
          )}
        </TreeItemContent>
        {children && <TreeItemGroupTransition {...getGroupTransitionProps()} />}
      </TreeItemRoot>
    </TreeItemProvider>
  );
});

export default function CustomTreeItem() {
  return (
    <Box sx={{ width: 480, maxWidth: '100%' }}>
      <SimpleTreeView aria-label="Organisation chart" defaultExpandedItems={['ops', 'drilling']}>
        <PersonItem itemId="ops" name="Ines Okafor" jobTitle="VP Operations">
          <PersonItem itemId="drilling" name="Tomas Lindqvist" jobTitle="Drilling manager">
            <PersonItem itemId="planner" name="Mei Chen" jobTitle="Well planner" />
            <PersonItem itemId="supervisor" name="Rafael Duarte" jobTitle="Rig supervisor" />
          </PersonItem>
          <PersonItem itemId="subsurface" name="Amara Nwosu" jobTitle="Subsurface lead">
            <PersonItem itemId="geologist" name="Jonas Weber" jobTitle="Geologist" />
          </PersonItem>
          <PersonItem itemId="hse" name="Priya Raman" jobTitle="HSE advisor" />
        </PersonItem>
      </SimpleTreeView>
    </Box>
  );
}
