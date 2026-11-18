import Avatar from '@tecton-mui/ui/Avatar';
import AvatarGroup from '@tecton-mui/ui/AvatarGroup';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function Avatars() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar size="xsmall">AK</Avatar>
        <Avatar size="small">BL</Avatar>
        <Avatar size="medium">CM</Avatar>
        <Avatar size="large">DN</Avatar>
        <Avatar size="large" aria-label="Robot account">
          <Icon name="robot-2" />
        </Avatar>
        <Avatar size="large" disabled>
          EO
        </Avatar>
      </Stack>
      <AvatarGroup max={4} size="medium">
        <Avatar>FP</Avatar>
        <Avatar>GQ</Avatar>
        <Avatar>HR</Avatar>
        <Avatar>IS</Avatar>
        <Avatar>JT</Avatar>
        <Avatar>KU</Avatar>
      </AvatarGroup>
    </Stack>
  );
}
