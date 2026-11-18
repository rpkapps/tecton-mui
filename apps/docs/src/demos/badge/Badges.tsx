import Badge from '@tecton-mui/ui/Badge';
import IconButton from '@tecton-mui/ui/IconButton';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function Badges() {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <IconButton aria-label="Notifications, 4 unread">
        <Badge badgeContent={4} color="primary">
          <Icon name="notifications" />
        </Badge>
      </IconButton>
      <IconButton aria-label="Messages, more than 99 unread">
        <Badge badgeContent={120} max={99} color="error">
          <Icon name="chat" />
        </Badge>
      </IconButton>
      <IconButton aria-label="Reports, new items">
        <Badge variant="dot" color="success">
          <Icon name="reports-analytics" />
        </Badge>
      </IconButton>
      <Badge badgeContent="New" color="secondary" shape="rectangle">
        <Icon name="layers" size="large" />
      </Badge>
    </Stack>
  );
}
