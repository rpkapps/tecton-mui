import * as React from 'react';
import Alert from '@tecton-mui/ui/Alert';
import Stack from '@tecton-mui/ui/Stack';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatAttachmentRejection,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const REASONS: Record<ChatAttachmentRejection['reason'], string> = {
  'mime-type': 'is not a PDF or image',
  'file-size': 'is larger than 2 MB',
  'file-count': 'is over the limit of 3 files',
};

export default function Attachments() {
  const [adapter] = React.useState(() =>
    createEchoAdapter({ respond: () => 'Got your message and files.' }),
  );
  const [rejected, setRejected] = React.useState<string[]>([]);
  // Memoized: a new `features` object on every render would be a new configuration each time.
  const features = React.useMemo<ChatBoxProps['features']>(
    () => ({
      conversationHeader: false,
      attachments: {
        acceptedMimeTypes: ['application/pdf', 'image/*'],
        maxFileSize: 2 * 1024 * 1024,
        maxFileCount: 3,
        onAttachmentReject: (rejections) =>
          setRejected(rejections.map(({ file, reason }) => `${file.name} ${REASONS[reason]}.`)),
      },
    }),
    [],
  );
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {rejected.length > 0 ? (
        <Alert severity="warning" onClose={() => setRejected([])}>
          {rejected.join(' ')}
        </Alert>
      ) : null}
      <ChatBox
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        features={features}
        suggestions={['Attach the inspection photos with the paperclip, or drop files here']}
        sx={{ height: 360 }}
      />
    </Stack>
  );
}
