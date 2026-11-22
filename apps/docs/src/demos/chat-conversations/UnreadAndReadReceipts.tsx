import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatAdapter,
  type ChatConversation,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };

const initial: ChatConversation[] = [
  { id: 'rig', title: 'Rig move', subtitle: 'Sam Weber', unreadCount: 0 },
  { id: 'shift', title: 'Shift handover', subtitle: 'Operations desk', unreadCount: 3 },
  { id: 'logs', title: 'Log review', subtitle: 'Geology team', unreadCount: 1 },
].map((conversation) => ({ ...conversation, participants: [you] }));

export default function UnreadAndReadReceipts() {
  const [conversations, setConversations] = React.useState(initial);
  const [log, setLog] = React.useState<string[]>([]);
  const [adapter] = React.useState<ChatAdapter>(() => ({
    ...createEchoAdapter(),
    // Tells the backend what the user has read; it updates the other people's read receipts.
    async markRead({ conversationId }) {
      setLog((entries) => [`markRead("${conversationId}")`, ...entries].slice(0, 4));
    },
  }));

  // Opening a conversation reads it: clear its badge and report it to the backend.
  const open = (id: string | undefined) => {
    if (!id) return;
    setConversations((current) =>
      current.map((c) => (c.id === id ? { ...c, unreadCount: 0, readState: 'read' } : c)),
    );
    void adapter.markRead?.({ conversationId: id });
  };
  const newMessage = () =>
    setConversations((current) =>
      current.map((c) =>
        c.id === 'logs' ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1, readState: 'unread' } : c,
      ),
    );

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Button size="small" variant="outlined" onClick={newMessage}>
          New message in Log review
        </Button>
        <Typography variant="caption" color="text.secondary" role="status">
          {log.length ? log.join(' · ') : 'Open a conversation with a badge.'}
        </Typography>
      </Stack>
      <ChatBox
        adapter={adapter}
        currentUser={you}
        members={[you]}
        conversations={conversations}
        onConversationsChange={setConversations}
        initialActiveConversationId="rig"
        onActiveConversationChange={open}
        features={{ conversationList: true }}
        layoutMode="standard"
        sx={{ height: 320 }}
      />
    </Stack>
  );
}
