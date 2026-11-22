import * as React from 'react';
import { Box, Paper, Typography } from '@tecton-mui/ui';
import ChatBox from '@tecton-mui/ui/ChatBox';
import ChatConfirmation from '@tecton-mui/ui/ChatConfirmation';
import ChatMessageSkeleton from '@tecton-mui/ui/ChatMessageSkeleton';
import ChatMessageSources, { ChatMessageSource } from '@tecton-mui/ui/ChatMessageSources';
import {
  createEchoAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };
const members = [you, assistant];

const thread: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    author: you,
    createdAt: '2026-11-18T09:12:00.000Z',
    parts: [
      { type: 'text', text: 'Which wells in the North Sea block are above the pressure limit?' },
    ],
  },
  {
    id: 'm2',
    role: 'assistant',
    author: assistant,
    createdAt: '2026-11-18T09:12:04.000Z',
    parts: [
      {
        type: 'text',
        text: 'Two wells are above **320 bar**:\n\n- Alpha-7 (334 bar)\n- Brent-2 (327 bar)\n\nQuery used:\n\n```sql\nSELECT well, pressure FROM readings WHERE pressure > 320;\n```',
      },
    ],
  },
];

const conversations: ChatConversation[] = [
  { id: 'ops', title: 'Operations', subtitle: 'Shift handover', participants: members },
  { id: 'logs', title: 'Log review', subtitle: 'Petrophysics', participants: members },
];
const inbox: ChatMessage[] = [
  {
    id: 'o1',
    conversationId: 'ops',
    role: 'user',
    author: you,
    createdAt: '2026-11-18T07:00:00.000Z',
    parts: [{ type: 'text', text: 'Pump 3 is back online.' }],
  },
  {
    id: 'o2',
    conversationId: 'ops',
    role: 'assistant',
    author: assistant,
    createdAt: '2026-11-18T07:01:00.000Z',
    parts: [{ type: 'text', text: 'Noted. I updated the shift report.' }],
  },
];

const suggestions = ['Summarise the last shift', 'List wells above the pressure limit'];

// An assistant answer with every built-in part that draws an icon: reasoning, tool calls (done,
// failed, waiting for approval), a file and a source link. Many messages, so the thread scrolls.
const tool = (id: string, state: 'output-available' | 'output-error' | 'approval-requested') => ({
  type: 'tool' as const,
  toolInvocation: {
    toolCallId: id,
    toolName: 'readPressure',
    state,
    input: { well: 'Alpha-7' },
    ...(state === 'output-available' ? { output: { bar: 334 } } : {}),
    ...(state === 'output-error' ? { errorText: 'Sensor offline' } : {}),
    ...(state === 'approval-requested' ? { approvalId: `${id}-approval` } : {}),
  },
});
const partsThread: ChatMessage[] = [
  ...Array.from({ length: 6 }, (_, i): ChatMessage => ({
    id: `p-older-${i}`,
    role: i % 2 ? 'assistant' : 'user',
    author: i % 2 ? assistant : you,
    status: 'read',
    parts: [{ type: 'text', text: `Earlier message ${i + 1}` }],
  })),
  {
    id: 'p1',
    role: 'assistant',
    author: assistant,
    parts: [
      { type: 'reasoning', text: 'The user wants the latest pressure for Alpha-7.', state: 'done' },
      tool('t1', 'output-available'),
      tool('t2', 'output-error'),
      tool('t3', 'approval-requested'),
      { type: 'file', mediaType: 'application/pdf', url: '#report', filename: 'shift-report.pdf' },
      { type: 'source-url', sourceId: 's1', url: '#source', title: 'Pressure log' },
      { type: 'text', text: 'Alpha-7 reads **334 bar**.' },
    ],
  },
];

// Every coloured surface of a message, for the contrast checks: inline code, links and a cited
// document on both bubble kinds, an unread marker, and a failing backend for the error card.
const colorConversation: ChatConversation[] = [
  { id: 'colors', title: 'Colours', participants: members, unreadCount: 1 },
];
const colorThread: ChatMessage[] = [
  {
    id: 'c1',
    conversationId: 'colors',
    role: 'user',
    author: you,
    createdAt: '2026-11-17T08:00:00.000Z',
    status: 'read',
    parts: [{ type: 'text', text: 'Run `SELECT 1` and see [the guide](#guide).' }],
  },
  {
    id: 'c2',
    conversationId: 'colors',
    role: 'assistant',
    author: assistant,
    createdAt: '2026-11-18T08:00:00.000Z',
    parts: [
      { type: 'text', text: 'Use `readings.head()`; details in [the manual](#manual).' },
      { type: 'source-url', sourceId: 'u', url: '#log', title: 'Pressure log' },
      {
        type: 'source-document',
        sourceId: 'd',
        title: 'Engineering memo',
        text: 'Raises the threshold to 320 bar.',
      },
    ],
  },
];
const failingAdapter = {
  async sendMessage(): Promise<never> {
    throw new Error('The field server did not answer.');
  },
};

export function ChatScenario() {
  // One adapter per chat, created once: the adapter identity must be stable between renders.
  const [threadAdapter] = React.useState(() =>
    createEchoAdapter({ delayMs: 50, respond: (text) => `Echo: ${text}` }),
  );
  const [emptyAdapter] = React.useState(() => createEchoAdapter({ delayMs: 50 }));
  const [inboxAdapter] = React.useState(() => createEchoAdapter({ delayMs: 50 }));
  const [partsAdapter] = React.useState(() => createEchoAdapter({ delayMs: 50 }));
  const [narrowAdapter] = React.useState(() => createEchoAdapter({ delayMs: 50 }));
  const [plainAdapter] = React.useState(() => createEchoAdapter({ delayMs: 50 }));
  const [colorAdapter] = React.useState(() => createEchoAdapter({ delayMs: 50 }));
  return (
    <Box
      sx={{
        p: 3,
        display: 'grid',
        gap: 3,
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(420px, 100%), 1fr))',
      }}
    >
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-thread">
        <Typography variant="h5" gutterBottom>
          Assistant thread
        </Typography>
        <ChatBox
          adapter={threadAdapter}
          members={members}
          currentUser={you}
          initialMessages={thread}
          sx={{ height: 480 }}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-empty">
        <Typography variant="h5" gutterBottom>
          Empty state with suggestions
        </Typography>
        <ChatBox
          adapter={emptyAdapter}
          members={members}
          currentUser={you}
          suggestions={suggestions}
          sx={{ height: 480 }}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, gridColumn: '1 / -1' }} data-testid="chat-inbox">
        <Typography variant="h5" gutterBottom>
          Conversations
        </Typography>
        <ChatBox
          adapter={inboxAdapter}
          members={members}
          currentUser={you}
          initialConversations={conversations}
          initialActiveConversationId="ops"
          initialMessages={inbox}
          features={{ conversationList: true }}
          sx={{ height: 480 }}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-parts">
        <Typography variant="h5" gutterBottom>
          Message parts
        </Typography>
        <ChatBox
          adapter={partsAdapter}
          members={members}
          currentUser={you}
          initialMessages={partsThread}
          features={{ conversationHeader: false }}
          sx={{ height: 480 }}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-narrow">
        <Typography variant="h5" gutterBottom>
          Narrow layout
        </Typography>
        <ChatBox
          adapter={narrowAdapter}
          members={members}
          currentUser={you}
          initialConversations={conversations}
          initialActiveConversationId="ops"
          initialMessages={inbox}
          features={{ conversationList: true }}
          layoutMode="overlay"
          sx={{ height: 360, maxWidth: 360 }}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-plain">
        <Typography variant="h5" gutterBottom>
          Empty state and confirmation
        </Typography>
        <ChatBox
          adapter={plainAdapter}
          members={members}
          currentUser={you}
          features={{ conversationHeader: false }}
          sx={{ height: 240 }}
        />
        <ChatConfirmation
          message="Delete the shift report?"
          confirmLabel="Delete"
          cancelLabel="Keep"
          sx={{ mt: 2 }}
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-colors">
        <Typography variant="h5" gutterBottom>
          Colours
        </Typography>
        <ChatBox
          adapter={colorAdapter}
          members={members}
          currentUser={you}
          initialConversations={colorConversation}
          initialActiveConversationId="colors"
          initialMessages={colorThread}
          features={{ dateDivider: true, unreadMarker: true }}
          sx={{ height: 420 }}
        />
        <ChatMessageSources label="Sources" sx={{ mt: 2 }}>
          <ChatMessageSource index={1} href="#a" title="Pressure log" />
          <ChatMessageSource index={2} href="#b" />
        </ChatMessageSources>
        <ChatMessageSkeleton lines={2} sx={{ mt: 2 }} />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }} data-testid="chat-compact">
        <Typography variant="h5" gutterBottom>
          Compact, with a failing backend
        </Typography>
        <ChatBox
          adapter={failingAdapter}
          members={members}
          currentUser={you}
          initialMessages={colorThread.map(({ conversationId: _c, ...m }) => m)}
          variant="compact"
          features={{ conversationHeader: false }}
          sx={{ height: 360 }}
        />
      </Paper>
    </Box>
  );
}
