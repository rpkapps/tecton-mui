import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const greeting: ChatMessage[] = [
  {
    id: 'hello',
    role: 'assistant',
    author: assistant,
    parts: [{ type: 'text', text: 'Hello. Ask me about any well.' }],
  },
];

export default function ControlledState() {
  const [adapter] = React.useState(() => createEchoAdapter());
  // The application owns the messages (for example to save them) and the draft.
  const [messages, setMessages] = React.useState<ChatMessage[]>(greeting);
  const [draft, setDraft] = React.useState('');
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {messages.length} messages, draft: {draft ? `"${draft}"` : 'empty'}
        </Typography>
        <Button size="small" variant="outlined" onClick={() => setDraft('Status of Alpha-7?')}>
          Insert question
        </Button>
        <Button size="small" variant="text" onClick={() => setMessages(greeting)}>
          Clear thread
        </Button>
      </Stack>
      <ChatBox
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        messages={messages}
        onMessagesChange={setMessages}
        composerValue={draft}
        onComposerValueChange={setDraft}
        features={{ conversationHeader: false }}
        sx={{ height: 340 }}
      />
    </Stack>
  );
}
