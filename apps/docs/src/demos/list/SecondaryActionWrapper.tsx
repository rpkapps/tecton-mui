import * as React from 'react';
import List from '@tecton-mui/ui/List';
import ListItem from '@tecton-mui/ui/ListItem';
import ListItemIcon from '@tecton-mui/ui/ListItemIcon';
import ListItemSecondaryAction from '@tecton-mui/ui/ListItemSecondaryAction';
import ListItemText from '@tecton-mui/ui/ListItemText';
import Paper from '@tecton-mui/ui/Paper';
import Switch from '@tecton-mui/ui/Switch';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';

const settings: { id: string; label: string; icon: IconName }[] = [
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'sync', label: 'Background sync', icon: 'retry' },
];

export default function SecondaryActionWrapper() {
  const [on, setOn] = React.useState<string[]>(['notifications']);
  return (
    <Paper variant="outlined" sx={{ width: 360 }}>
      <List aria-label="Settings">
        {settings.map((item) => (
          // The wrapper positions the control at the end of the row; the ListItem reserves room
          // for it.
          <ListItem key={item.id} sx={{ pr: 10 }}>
            <ListItemIcon>
              <Icon name={item.icon} />
            </ListItemIcon>
            <ListItemText id={`secondary-action-${item.id}`} primary={item.label} />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={on.includes(item.id)}
                onChange={(event) =>
                  setOn((current) =>
                    event.target.checked
                      ? [...current, item.id]
                      : current.filter((id) => id !== item.id),
                  )
                }
                slotProps={{ input: { 'aria-labelledby': `secondary-action-${item.id}` } }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
