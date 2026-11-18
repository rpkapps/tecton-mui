import AppBar from '@tecton-mui/ui/AppBar';
import Toolbar from '@tecton-mui/ui/Toolbar';
import Typography from '@tecton-mui/ui/Typography';
import IconButton from '@tecton-mui/ui/IconButton';
import Button from '@tecton-mui/ui/Button';
import Avatar from '@tecton-mui/ui/Avatar';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function ProductAppBar() {
  return (
    <Stack spacing={0} sx={{ width: '100%' }}>
      <AppBar position="static" productColor="app1">
        <Toolbar sx={{ gap: 1 }}>
          <IconButton color="inherit" edge="start" aria-label="Open navigation">
            <Icon name="menu" />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Field Planner
          </Typography>
          <IconButton color="inherit" aria-label="Notifications">
            <Icon name="notifications" />
          </IconButton>
          <Avatar size="small">JD</Avatar>
        </Toolbar>
      </AppBar>
      <AppBar position="static" tier="secondary" color="default">
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Button color="inherit" size="small">
            Overview
          </Button>
          <Button color="inherit" size="small">
            Wells
          </Button>
          <Button color="inherit" size="small">
            Reports
          </Button>
        </Toolbar>
      </AppBar>
    </Stack>
  );
}
