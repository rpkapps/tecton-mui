import * as React from 'react';
import Chip from '@tecton-mui/ui/Chip';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatComposer from '@tecton-mui/ui/ChatComposer';
import ChatMessageList from '@tecton-mui/ui/ChatMessageList';
import {
  ChatProvider,
  createEchoAdapter,
  useChat,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

// Any component inside the provider can read the chat state with the hooks.
function PanelHeader() {
  const { messages, isStreaming } = useChat();
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
    >
      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
        Field assistant
      </Typography>
      <Chip size="small" label={`${messages.length} messages`} />
      {isStreaming ? <Chip size="small" color="primary" label="Answering" /> : null}
    </Stack>
  );
}

export default function CustomLayout() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatProvider adapter={adapter} members={[you, assistant]} currentUser={you}>
      <Paper
        variant="outlined"
        sx={{ display: 'flex', flexDirection: 'column', height: 380, width: '100%' }}
      >
        <PanelHeader />
        <ChatMessageList sx={{ flexGrow: 1, minHeight: 0 }} />
        <ChatComposer />
      </Paper>
    </ChatProvider>
  );
}
