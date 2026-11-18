import Chip from '@tecton-mui/ui/Chip';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function BasicChips() {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Chip label="Active" color="success" />
      <Chip label="Draft" variant="outlined" />
      <Chip label="Seismic" icon={<Icon name="seismic" size="small" />} />
      <Chip label="Rectangle" shape="rectangle" />
      <Chip label="Small" size="small" />
    </Stack>
  );
}
