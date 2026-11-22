import * as React from 'react';
import LinearProgress from '@tecton-mui/ui/LinearProgress';
import Typography from '@tecton-mui/ui/Typography';
import Box from '@tecton-mui/ui/Box';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  useChat,
  type ChatAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const log: ChatUser = { id: 'log', displayName: 'Shift log', role: 'user' };
const conversations: ChatConversation[] = [
  { id: 'log', title: 'Shift log', participants: [you, log] },
];

// 60 hourly log entries on the server, oldest first.
const start = Date.parse('2026-11-16T00:00:00.000Z');
const history: ChatMessage[] = Array.from({ length: 60 }, (_, i) => ({
  id: `entry-${i}`,
  conversationId: 'log',
  role: 'user',
  author: i % 4 === 3 ? you : log,
  createdAt: new Date(start + i * 3_600_000).toISOString(),
  parts: [{ type: 'text', text: `Entry ${i + 1}: pressure ${300 + ((i * 7) % 40)} bar.` }],
}));
const PAGE = 12;

// Pages through the history from the newest end. The cursor is the index where the next (older)
// page ends; `hasMore` tells the chat whether scrolling to the top should load another page.
function createPagedAdapter(): ChatAdapter {
  return {
    ...createEchoAdapter({ respond: () => 'Logged.' }),
    async listMessages({ cursor }) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const end = cursor ? Number(cursor) : history.length;
      const begin = Math.max(0, end - PAGE);
      return {
        messages: history.slice(begin, end),
        cursor: String(begin),
        hasMore: begin > 0,
      };
    },
  };
}

function HistoryStatus() {
  const { messages, isLoadingHistory, hasMoreHistory } = useChat();
  return (
    <Box sx={{ px: 1.5, pb: 1 }} role="status">
      {isLoadingHistory ? <LinearProgress aria-label="Loading older messages" /> : null}
      <Typography variant="caption" color="text.secondary">
        {messages.length} of {history.length} entries loaded
        {hasMoreHistory ? '. Scroll to the top for older ones.' : '. All loaded.'}
      </Typography>
    </Box>
  );
}

export default function HistoryPaging() {
  const [adapter] = React.useState(createPagedAdapter);
  return (
    <ChatBox
      adapter={adapter}
      members={[you, log]}
      currentUser={you}
      initialConversations={conversations}
      initialActiveConversationId="log"
      features={{ dateDivider: true }}
      sx={{ height: 420, width: '100%' }}
    >
      <HistoryStatus />
    </ChatBox>
  );
}
