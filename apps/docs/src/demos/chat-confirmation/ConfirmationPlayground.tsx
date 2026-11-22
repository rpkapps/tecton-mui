import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatConfirmation from '@tecton-mui/ui/ChatConfirmation';
import {
  Playground,
  jsxElement,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const controls: PlaygroundControl[] = [
  {
    name: 'message',
    kind: 'text',
    multiline: true,
    defaultValue: 'Restart pump 3? The line pressure drops for about two minutes.',
  },
  { name: 'confirmLabel', kind: 'text', defaultValue: 'Restart' },
  { name: 'cancelLabel', kind: 'text', defaultValue: 'Cancel' },
];

function Preview({ values }: { values: PlaygroundValues }) {
  const [last, setLast] = React.useState('No answer yet.');
  return (
    <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 520, alignSelf: 'center' }}>
      <ChatConfirmation
        message={String(values.message)}
        confirmLabel={String(values.confirmLabel) || undefined}
        cancelLabel={String(values.cancelLabel) || undefined}
        onConfirm={() => setLast(`onConfirm: ${String(values.confirmLabel) || 'Confirm'}`)}
        onCancel={() => setLast(`onCancel: ${String(values.cancelLabel) || 'Cancel'}`)}
      />
      <Typography variant="body2" color="text.secondary" role="status">
        {last}
      </Typography>
    </Stack>
  );
}

function code(values: PlaygroundValues) {
  return jsxElement('ChatConfirmation', {
    message: String(values.message),
    confirmLabel: String(values.confirmLabel) || undefined,
    cancelLabel: String(values.cancelLabel) || undefined,
    onConfirm: raw('handleConfirm'),
    onCancel: raw('handleCancel'),
  });
}

export default function ConfirmationPlayground() {
  return (
    <Playground
      title="ChatConfirmation"
      description="Write the question and the button labels, then answer it."
      controls={controls}
      render={(values) => <Preview values={values} />}
      code={code}
      minHeight={220}
    />
  );
}
