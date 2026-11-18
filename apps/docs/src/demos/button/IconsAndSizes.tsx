import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function IconsAndSizes() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<Icon name="add" />}>
          New project
        </Button>
        <Button variant="outlined" endIcon={<Icon name="download" />}>
          Export
        </Button>
        <Button variant="outlined" loading>
          Saving
        </Button>
        <Button variant="outlined" activated>
          Activated
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Button variant="contained" size="small">
          Small
        </Button>
        <Button variant="contained" size="medium">
          Medium
        </Button>
        <Button variant="contained" size="large">
          Large
        </Button>
      </Stack>
    </Stack>
  );
}
