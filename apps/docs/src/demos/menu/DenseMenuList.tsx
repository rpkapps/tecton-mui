import MenuItem from '@tecton-mui/ui/MenuItem';
import MenuList from '@tecton-mui/ui/MenuList';
import Paper from '@tecton-mui/ui/Paper';

export default function DenseMenuList() {
  return (
    <Paper variant="outlined" sx={{ width: 220 }}>
      <MenuList aria-label="Sort by">
        <MenuItem size="small" selected>
          Name
        </MenuItem>
        <MenuItem size="small">Date modified</MenuItem>
        <MenuItem size="small">Owner</MenuItem>
      </MenuList>
    </Paper>
  );
}
