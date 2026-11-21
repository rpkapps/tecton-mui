import Icon from '@tecton-mui/ui/Icon';
import MenuItem from '@tecton-mui/ui/MenuItem';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
} from '@tecton-mui/ui/ActionBar';

export default function ActionBarSelects() {
  return (
    <ActionBar aria-label="View settings">
      <ActionBarGroup>
        <ActionBarSelect aria-label="Vertical exaggeration" defaultValue="1">
          <MenuItem value="1">1×</MenuItem>
          <MenuItem value="2">2×</MenuItem>
          <MenuItem value="5">5×</MenuItem>
        </ActionBarSelect>
      </ActionBarGroup>
      <ActionBarGroup>
        <ActionBarSelect aria-label="Color map" variant="filled" defaultValue="seismic">
          <MenuItem value="seismic">Seismic</MenuItem>
          <MenuItem value="grey">Grey</MenuItem>
          <MenuItem value="rainbow">Rainbow</MenuItem>
        </ActionBarSelect>
      </ActionBarGroup>
      <ActionBarGroup>
        <ActionBarButton label="Settings" icon={<Icon name="settings" />} />
      </ActionBarGroup>
    </ActionBar>
  );
}
