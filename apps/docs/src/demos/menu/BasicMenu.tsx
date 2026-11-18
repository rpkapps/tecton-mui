import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Menu from '@tecton-mui/ui/Menu';
import MenuItem from '@tecton-mui/ui/MenuItem';
import ListItemIcon from '@tecton-mui/ui/ListItemIcon';
import ListItemText from '@tecton-mui/ui/ListItemText';
import Divider from '@tecton-mui/ui/Divider';
import Icon from '@tecton-mui/ui/Icon';

export default function BasicMenu() {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  return (
    <>
      <Button
        id="actions-button"
        variant="outlined"
        aria-controls={open ? 'actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        endIcon={<Icon name="chevron-down" />}
      >
        Actions
      </Button>
      <Menu
        id="actions-menu"
        anchorEl={anchor}
        open={open}
        onClose={close}
        slotProps={{ list: { 'aria-labelledby': 'actions-button' } }}
      >
        <MenuItem heading>File</MenuItem>
        <MenuItem onClick={close}>
          <ListItemIcon>
            <Icon name="copy" size="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={close}>
          <ListItemIcon>
            <Icon name="download" size="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={close}>
          <ListItemIcon>
            <Icon name="delete" size="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
