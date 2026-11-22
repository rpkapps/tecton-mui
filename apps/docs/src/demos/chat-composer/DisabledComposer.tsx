import * as React from 'react';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };
const messages: ChatMessage[] = [
  {
    id: 'closed',
    role: 'user',
    author: sam,
    parts: [{ type: 'text', text: 'Incident closed. This channel is now read-only.' }],
  },
];

export default function DisabledComposer() {
  const [adapter] = React.useState(() => createEchoAdapter());
  const [readOnly, setReadOnly] = React.useState(true);
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <FormControlLabel
        control={
          <Switch checked={readOnly} onChange={(event) => setReadOnly(event.target.checked)} />
        }
        label="Read-only channel"
      />
      <ChatBox
        adapter={adapter}
        members={[you, sam]}
        currentUser={you}
        initialMessages={messages}
        features={{ conversationHeader: false, attachments: !readOnly }}
        slotProps={{
          composerRoot: { disabled: readOnly },
          composerInput: {
            placeholder: readOnly ? 'This channel is read-only' : 'Type a message',
          },
        }}
        sx={{ height: 300 }}
      />
    </Stack>
  );
}
