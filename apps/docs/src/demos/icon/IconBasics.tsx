import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';

export default function IconBasics() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Icon name="star" size="xsmall" />
        <Icon name="star" size="small" />
        <Icon name="star" size="medium" />
        <Icon name="star" size="large" />
        <Icon name="star" variant="filled" size="large" />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', color: 'error.main' }}>
        <Icon name="error" variant="filled" size="large" title="Error" />
        <Icon name="warning" size="large" sx={{ color: 'warning.main' }} title="Warning" />
        <Icon name="check-circle" size="large" sx={{ color: 'success.main' }} title="Done" />
      </Stack>
    </Stack>
  );
}
