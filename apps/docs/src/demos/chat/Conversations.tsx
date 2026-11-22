import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const ops: ChatUser = { id: 'ops', displayName: 'Operations desk' };
const geo: ChatUser = { id: 'geo', displayName: 'Geology team' };

const conversations: ChatConversation[] = [
  { id: 'shift', title: 'Shift handover', subtitle: 'Operations desk', participants: [you, ops] },
  { id: 'logs', title: 'Log review', subtitle: 'Geology team', participants: [you, geo] },
];

const text = (id: string, conversationId: string, author: ChatUser, body: string): ChatMessage => ({
  id,
  conversationId,
  // People are `user`s; the author decides which side of the thread a message is on.
  role: 'user',
  author,
  parts: [{ type: 'text', text: body }],
});

// Server-side history, keyed by conversation.
const history: Record<string, ChatMessage[]> = {
  shift: [
    text('s1', 'shift', ops, 'Pump 3 was restarted at 06:40.'),
    text('s2', 'shift', you, 'Thanks. Any alarms since then?'),
    text('s3', 'shift', ops, 'None. Pressure is stable at 290 bar.'),
  ],
  logs: [
    text('l1', 'logs', geo, 'The gamma-ray curve for Alpha-7 is normalised.'),
    text('l2', 'logs', you, 'Great, I will run the shale volume model next.'),
  ],
};

function createInboxAdapter(): ChatAdapter {
  const echo = createEchoAdapter({ respond: () => 'Received. We will get back to you shortly.' });
  return {
    ...echo,
    // Called when a conversation without messages in the store becomes active.
    async listMessages({ conversationId }) {
      return { messages: history[conversationId] ?? [], hasMore: false };
    },
  };
}

export default function Conversations() {
  const [adapter] = React.useState(createInboxAdapter);
  return (
    <ChatBox
      adapter={adapter}
      currentUser={you}
      members={[you, ops, geo]}
      initialConversations={conversations}
      initialActiveConversationId="shift"
      features={{ conversationList: true }}
      sx={{ height: 460, width: '100%' }}
    />
  );
}
