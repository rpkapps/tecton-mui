import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import MenuItem from '@tecton-mui/ui/MenuItem';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
} from '@tecton-mui/ui/ActionBar';

export default function TwoSelectsActionBar() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 260,
        borderRadius: 1,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <ActionBar
        aria-label="Map tools"
        defaultValue="select"
        sx={{ position: 'absolute', top: 8, left: 8 }}
      >
        <ActionBarGroup orientation="horizontal" aria-label="Map view">
          <ActionBarSelect aria-label="Base map" variant="filled" defaultValue="terrain">
            <MenuItem value="terrain">Terrain</MenuItem>
            <MenuItem value="satellite">Satellite</MenuItem>
            <MenuItem value="street">Street</MenuItem>
          </ActionBarSelect>
          <ActionBarSelect aria-label="Scale" variant="filled" defaultValue="25000">
            <MenuItem value="10000">1:10,000</MenuItem>
            <MenuItem value="25000">1:25,000</MenuItem>
            <MenuItem value="50000">1:50,000</MenuItem>
          </ActionBarSelect>
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
          <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
          <ActionBarButton value="measure" label="Measure" icon={<Icon name="ruler" />} />
        </ActionBarGroup>
      </ActionBar>
    </Box>
  );
}
