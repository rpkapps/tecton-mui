import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatComposer from '@tecton-mui/ui/ChatComposer';
import ChatMessageList from '@tecton-mui/ui/ChatMessageList';
import ChatMessageSkeleton from '@tecton-mui/ui/ChatMessageSkeleton';
import {
  ChatProvider,
  createEchoAdapter,
  useChat,
  type ChatAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };
const conversations: ChatConversation[] = [{ id: 'log', title: 'Shift log' }];
const history: ChatMessage[] = [
  {
    id: 'h1',
    conversationId: 'log',
    role: 'user',
    author: sam,
    parts: [{ type: 'text', text: 'Pump 3 restarted at 06:40.' }],
  },
  {
    id: 'h2',
    conversationId: 'log',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'Thanks, logged.' }],
  },
];

// History that takes two seconds to arrive.
function createSlowAdapter(): ChatAdapter {
  return {
    ...createEchoAdapter(),
    async listMessages() {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { messages: history, hasMore: false };
    },
  };
}

function Thread() {
  const { historyStatus, reloadMessages } = useChat();
  const loading = historyStatus === 'loading';
  return (
    <>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Shift log
        </Typography>
        <Button size="small" disabled={loading} onClick={() => void reloadMessages()}>
          Reload
        </Button>
      </Stack>
      {loading ? (
        // Placeholder rows while the history loads.
        <Stack
          spacing={2}
          sx={{ flexGrow: 1, p: 2 }}
          aria-busy="true"
          aria-label="Loading messages"
        >
          <ChatMessageSkeleton lines={2} />
          <ChatMessageSkeleton lines={1} />
          <ChatMessageSkeleton lines={3} />
        </Stack>
      ) : (
        <ChatMessageList sx={{ flexGrow: 1, minHeight: 0 }} />
      )}
      <ChatComposer />
    </>
  );
}

export default function LoadingHistory() {
  const [adapter] = React.useState(createSlowAdapter);
  return (
    <ChatProvider
      adapter={adapter}
      members={[you, sam]}
      currentUser={you}
      initialConversations={conversations}
      initialActiveConversationId="log"
    >
      <Paper
        variant="outlined"
        sx={{ display: 'flex', flexDirection: 'column', height: 360, width: '100%' }}
      >
        <Thread />
      </Paper>
    </ChatProvider>
  );
}
