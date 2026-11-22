import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatConfirmation from '@tecton-mui/ui/ChatConfirmation';

export default function BasicConfirmation() {
  const [answer, setAnswer] = React.useState<string | null>(null);
  if (answer) {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography role="status">{answer}</Typography>
        <Button size="small" variant="text" onClick={() => setAnswer(null)}>
          Ask again
        </Button>
      </Stack>
    );
  }
  return (
    <ChatConfirmation
      message="Shut in well Alpha-7? Production stops until it is reopened."
      confirmLabel="Shut in"
      cancelLabel="Keep producing"
      onConfirm={() => setAnswer('Alpha-7 is shut in.')}
      onCancel={() => setAnswer('Alpha-7 keeps producing.')}
      sx={{ width: '100%', maxWidth: 520 }}
    />
  );
}
