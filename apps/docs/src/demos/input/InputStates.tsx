import Input from '@tecton-mui/ui/Input';
import Stack from '@tecton-mui/ui/Stack';

export default function InputStates() {
  return (
    <Stack spacing={3} sx={{ width: 320 }}>
      <Input placeholder="Placeholder" slotProps={{ input: { 'aria-label': 'Placeholder' } }} />
      <Input
        defaultValue="Read only"
        readOnly
        slotProps={{ input: { 'aria-label': 'Read only' } }}
      />
      <Input defaultValue="Disabled" disabled slotProps={{ input: { 'aria-label': 'Disabled' } }} />
      <Input
        defaultValue="Invalid value"
        error
        slotProps={{ input: { 'aria-label': 'Invalid value' } }}
      />
      <Input
        multiline
        minRows={2}
        defaultValue={'Multiline input\nthat grows with its content'}
        slotProps={{ input: { 'aria-label': 'Multiline' } }}
      />
    </Stack>
  );
}
