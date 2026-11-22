import * as React from 'react';
import AppBar from '@tecton-mui/ui/AppBar';
import Avatar from '@tecton-mui/ui/Avatar';
import Button from '@tecton-mui/ui/Button';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import ListItemIcon from '@tecton-mui/ui/ListItemIcon';
import Menu from '@tecton-mui/ui/Menu';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Stack from '@tecton-mui/ui/Stack';

const FIXED_TABS = [{ id: 'home', icon: 'home', label: 'Home' }];
const TABS = [{ id: 'report', label: 'Q3 report', icon: 'project', closeable: false }];

export default function AppBarActions() {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  return (
    <AppBar appName="APP" fixedTabs={FIXED_TABS} tabs={TABS} activeTab="report" disableTabAdd>
      {/* `children` fill the actions region at the right end of the bar. */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
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
      </Stack>
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
