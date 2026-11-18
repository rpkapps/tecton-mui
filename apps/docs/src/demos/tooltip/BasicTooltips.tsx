import Tooltip from '@tecton-mui/ui/Tooltip';
import IconButton from '@tecton-mui/ui/IconButton';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function BasicTooltips() {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Tooltip title="Delete">
        <IconButton aria-label="Delete">
          <Icon name="delete" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Exports the visible rows as CSV" placement="top" arrow>
        <Button variant="outlined">Export</Button>
      </Tooltip>
      <Tooltip title="You need edit rights to publish">
        {/* Disabled elements do not fire events; wrap them so the tooltip still works. */}
        <span>
          <Button variant="contained" disabled>
            Publish
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
