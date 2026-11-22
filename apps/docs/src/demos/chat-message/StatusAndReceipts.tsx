import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const lead: ChatUser = { id: 'lead', displayName: 'Sam Weber', role: 'user' };

const text = (
  id: string,
  author: ChatUser,
  body: string,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  role: 'user',
  author,
  createdAt: '2026-11-18T08:00:00.000Z',
  parts: [{ type: 'text', text: body }],
  ...extra,
});

const messages: ChatMessage[] = [
  text('m1', lead, 'Can you check the crane inspection report?'),
  // Read by the other side: two checks.
  text('m2', you, 'Done, it was signed off yesterday.', { status: 'read' }),
  // Delivered but not read yet: one check.
  text('m3', you, 'I attached it to the ticket.', { status: 'sent' }),
  // Changed after sending.
  text('m4', you, 'The ticket number is MNT-2041.', {
    status: 'sent',
    editedAt: '2026-11-18T08:03:00.000Z',
  }),
];

export default function StatusAndReceipts() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      members={[you, lead]}
      currentUser={you}
      initialMessages={messages}
      features={{ conversationHeader: false }}
      sx={{ height: 380, width: '100%' }}
    />
  );
}
