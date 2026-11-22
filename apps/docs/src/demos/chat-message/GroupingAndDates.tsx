import * as React from 'react';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  createTimeWindowGroupKey,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };

const say = (id: string, author: ChatUser, at: string, text: string): ChatMessage => ({
  id,
  role: 'user',
  author,
  createdAt: at,
  parts: [{ type: 'text', text }],
});
// Sam writes three times: two messages a minute apart, then one 20 minutes later.
const messages: ChatMessage[] = [
  say('1', sam, '2026-11-17T15:00:00.000Z', 'Crane booked for tomorrow.'),
  say('2', sam, '2026-11-17T15:01:00.000Z', 'From 08:00 to 14:00.'),
  say('3', sam, '2026-11-17T15:21:00.000Z', 'Forecast says 15 knots.'),
  say('4', you, '2026-11-18T07:30:00.000Z', 'Wind is at 12 knots now, we go.'),
];

const weekday = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

// Module-level constant: a stable slot configuration.
const slotProps: ChatBoxProps['slotProps'] = {
  // Consecutive messages of one author form a group only within 5 minutes of each other.
  messageGroup: { groupKey: createTimeWindowGroupKey(5 * 60_000) },
  // The day line between messages of different days, in your own format.
  dateDivider: { formatDate: (date) => weekday.format(date) },
};

export default function GroupingAndDates() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      members={[you, sam]}
      currentUser={you}
      initialMessages={messages}
      slotProps={slotProps}
      features={{ conversationHeader: false, dateDivider: true }}
      sx={{ height: 420, width: '100%' }}
    />
  );
}
