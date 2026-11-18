import SimpleTreeView from '@tecton-mui/ui/SimpleTreeView';
import TreeItem from '@tecton-mui/ui/TreeItem';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';

// Slot components are module-level constants, so their identity is stable between renders.
function ExpandIcon() {
  return <Icon name="folder" size="small" />;
}
function CollapseIcon() {
  return <Icon name="folder-open" size="small" />;
}
function LeafIcon() {
  return <Icon name="log-curve" size="small" />;
}
const slots = { expandIcon: ExpandIcon, collapseIcon: CollapseIcon, endIcon: LeafIcon };

export default function CustomIcons() {
  return (
    <Box sx={{ width: 320, maxWidth: '100%' }}>
      <SimpleTreeView
        aria-label="Petrophysics project"
        defaultExpandedItems={['inputs']}
        slots={slots}
      >
        <TreeItem itemId="inputs" label="Inputs">
          <TreeItem itemId="gr" label="GR_normalised" />
          <TreeItem itemId="rt" label="RT_deep" />
        </TreeItem>
        <TreeItem itemId="results" label="Interpretation">
          <TreeItem itemId="vsh" label="VSH" />
          <TreeItem itemId="phie" label="PHIE" />
          <TreeItem itemId="sw" label="SW" />
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
