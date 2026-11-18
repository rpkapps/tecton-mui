import { Fragment } from 'react';
import IconButton from '@tecton-mui/ui/IconButton';
import List from '@tecton-mui/ui/List';
import ListItem from '@tecton-mui/ui/ListItem';
import ListItemText from '@tecton-mui/ui/ListItemText';
import Divider from '@tecton-mui/ui/Divider';
import Paper from '@tecton-mui/ui/Paper';
import Icon from '@tecton-mui/ui/Icon';

const files = ['survey-2025.segy', 'tops.csv', 'logs-well-17.las'];

export default function ListWithActions() {
  return (
    <Paper variant="outlined" sx={{ width: 360 }}>
      <List dense aria-label="Uploaded files">
        {files.map((file, index) => (
          <Fragment key={file}>
            {index > 0 && <Divider component="li" />}
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label={`Remove ${file}`}>
                  <Icon name="delete" size="small" />
                </IconButton>
              }
            >
              <ListItemText primary={file} />
            </ListItem>
          </Fragment>
        ))}
      </List>
    </Paper>
  );
}
