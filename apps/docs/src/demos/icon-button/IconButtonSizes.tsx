import IconButton from '@tecton-mui/ui/IconButton';
import Stack from '@tecton-mui/ui/Stack';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Icon from '@tecton-mui/ui/Icon';

export default function IconButtonSizes() {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Tooltip title="Refresh (small)">
        <IconButton size="small" aria-label="Refresh">
          <Icon name="retry" size="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Refresh (medium)">
        <IconButton aria-label="Refresh">
          <Icon name="retry" size="medium" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Refresh (large)">
        <IconButton size="large" aria-label="Refresh">
          <Icon name="retry" size="large" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
