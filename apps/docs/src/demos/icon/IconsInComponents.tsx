import Button from '@tecton-mui/ui/Button';
import Chip from '@tecton-mui/ui/Chip';
import IconButton from '@tecton-mui/ui/IconButton';
import Stack from '@tecton-mui/ui/Stack';
import TextField from '@tecton-mui/ui/TextField';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import Icon from '@tecton-mui/ui/Icon';

export default function IconsInComponents() {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="contained" startIcon={<Icon name="add" />}>
        Add well
      </Button>
      <IconButton aria-label="More options">
        <Icon name="more-vert" />
      </IconButton>
      <Chip icon={<Icon name="map" size="small" />} label="Map layer" />
      <TextField
        label="Find"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="search" size="small" />
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  );
}
