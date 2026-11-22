import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };

// Two unread messages: the "new messages" marker sits above the first of them.
const conversations: ChatConversation[] = [
  { id: 'rig', title: 'Rig move', participants: [you, sam], unreadCount: 2 },
];

const say = (id: string, author: ChatUser, createdAt: string, text: string): ChatMessage => ({
  id,
  conversationId: 'rig',
  role: 'user',
  author,
  createdAt,
  parts: [{ type: 'text', text }],
});
const messages: ChatMessage[] = [
  say('1', sam, '2026-11-17T15:00:00.000Z', 'Is the crane booked for tomorrow?'),
  say('2', you, '2026-11-17T15:05:00.000Z', 'Yes, from 08:00 to 14:00.'),
  say('3', sam, '2026-11-18T07:45:00.000Z', 'Wind is picking up.'),
  say('4', sam, '2026-11-18T07:46:00.000Z', 'Let us decide at 09:00.'),
];

export default function DateDividers() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      members={[you, sam]}
      currentUser={you}
      initialConversations={conversations}
      initialActiveConversationId="rig"
      initialMessages={messages}
      features={{ dateDivider: true, unreadMarker: true }}
      sx={{ height: 440, width: '100%' }}
    />
  );
}
