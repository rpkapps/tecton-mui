import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import MenuItem from '@tecton-mui/ui/MenuItem';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
  ActionBarTool,
  ActionBarToolMenu,
} from '@tecton-mui/ui/ActionBar';

export default function RightAlignedActionBar() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 300,
        borderRadius: 1,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <ActionBar
        aria-label="Map tools"
        alignment="right"
        defaultValue="select"
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <ActionBarGroup>
          <ActionBarSelect aria-label="Base map" defaultValue="terrain">
            <MenuItem value="terrain">Terrain</MenuItem>
            <MenuItem value="satellite">Satellite</MenuItem>
            <MenuItem value="none">None</MenuItem>
          </ActionBarSelect>
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
          <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
          <ActionBarToolMenu label="Markers">
            <ActionBarTool value="pin" label="Pin" icon={<Icon name="pin" />} />
            <ActionBarTool value="target" label="Target" icon={<Icon name="target" />} />
            <ActionBarTool value="well" label="Well" icon={<Icon name="well" />} />
          </ActionBarToolMenu>
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton label="Layers" icon={<Icon name="layers" />} />
        </ActionBarGroup>
      </ActionBar>
    </Box>
  );
}
