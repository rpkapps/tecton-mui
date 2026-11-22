import * as React from 'react';
import AppBar, { AppBarActions, AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Avatar from '@tecton-mui/ui/Avatar';
import Button from '@tecton-mui/ui/Button';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import ListItemIcon from '@tecton-mui/ui/ListItemIcon';
import Menu from '@tecton-mui/ui/Menu';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Stack from '@tecton-mui/ui/Stack';

export default function AppBarActionsDemo() {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  return (
    <AppBar>
      <AppBarBrand>APP</AppBarBrand>
      <AppBarTabs value="report">
        <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
        <AppBarTab value="report" icon={<Icon name="project" />} label="Q3 report" />
      </AppBarTabs>
      {/* The actions region at the right end of the bar. */}
      <AppBarActions sx={{ gap: 2 }}>
        <Stack direction="row" spacing={1}>
          <IconButton color="tertiary" aria-label="Search">
            <Icon name="search" />
          </IconButton>
          <IconButton color="tertiary" aria-label="Notifications">
            <Icon name="notifications" />
          </IconButton>
        </Stack>
        <Button size="small" variant="contained" color="secondary">
          Share
        </Button>
        <IconButton
          aria-label="Account"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? 'app-bar-account-menu' : undefined}
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{ p: 0 }}
        >
          <Avatar size="xsmall">JD</Avatar>
        </IconButton>
      </AppBarActions>
      <Menu
        id="app-bar-account-menu"
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => setAnchor(null)}>
          <ListItemIcon>
            <Icon name="person" size="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => setAnchor(null)}>
          <ListItemIcon>
            <Icon name="settings" size="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
