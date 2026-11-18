import IconButton from '@tecton-mui/ui/IconButton';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function IconButtons() {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <IconButton aria-label="Edit">
        <Icon name="edit-square" />
      </IconButton>
      <IconButton aria-label="Delete" color="error">
        <Icon name="delete" />
      </IconButton>
      <IconButton aria-label="Settings" color="outlined">
        <Icon name="settings" />
      </IconButton>
      <IconButton aria-label="Filter" variant="square">
        <Icon name="filter" />
      </IconButton>
      <IconButton aria-label="Pin" activated>
        <Icon name="pin" />
      </IconButton>
      <IconButton aria-label="Download" disabled>
        <Icon name="download" />
      </IconButton>
    </Stack>
  );
}
