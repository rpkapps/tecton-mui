import * as React from 'react';
import List from '@tecton-mui/ui/List';
import ListItemButton from '@tecton-mui/ui/ListItemButton';
import ListItemIcon from '@tecton-mui/ui/ListItemIcon';
import ListItemText from '@tecton-mui/ui/ListItemText';
import ListSubheader from '@tecton-mui/ui/ListSubheader';
import Paper from '@tecton-mui/ui/Paper';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';

const items: { icon: IconName; label: string; secondary: string }[] = [
  { icon: 'home', label: 'Overview', secondary: 'Key figures' },
  { icon: 'map', label: 'Map', secondary: 'Wells and fields' },
  { icon: 'reports-analytics', label: 'Reports', secondary: '12 scheduled' },
  { icon: 'settings', label: 'Settings', secondary: 'Project defaults' },
];

export default function NavigationList() {
  const [selected, setSelected] = React.useState(0);
  return (
    <Paper variant="outlined" sx={{ width: 320 }}>
      <List subheader={<ListSubheader component="div">Project</ListSubheader>}>
        {items.map((item, index) => (
          <ListItemButton
            key={item.label}
            selected={selected === index}
            onClick={() => setSelected(index)}
          >
            <ListItemIcon>
              <Icon name={item.icon} size="medium" />
            </ListItemIcon>
            <ListItemText primary={item.label} secondary={item.secondary} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
