import * as React from 'react';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatConversationList from '@tecton-mui/ui/ChatConversationList';
import {
  ChatProvider,
  createEchoAdapter,
  useChat,
  type ChatConversation,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';
import {
  Playground,
  jsxElement,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };

const ALL: ChatConversation[] = [
  { title: 'Rig move', subtitle: 'Crane is ready.', lastMessageAt: '2026-11-18T09:40:00.000Z' },
  {
    title: 'Shift handover',
    subtitle: 'Pump 3 restarted.',
    lastMessageAt: '2026-11-18T07:00:00.000Z',
  },
  {
    title: 'Log review',
    subtitle: 'GR curve normalised.',
    lastMessageAt: '2026-11-17T16:30:00.000Z',
  },
  {
    title: 'Permits',
    subtitle: 'Hot-work permit approved.',
    lastMessageAt: '2026-11-16T12:00:00.000Z',
  },
  {
    title: 'Safety',
    subtitle: 'Toolbox talk at 08:00.',
    lastMessageAt: '2026-11-15T08:00:00.000Z',
  },
  {
    title: 'Procurement',
    subtitle: 'Bearings ordered.',
    lastMessageAt: '2026-11-14T10:00:00.000Z',
  },
].map((conversation, i) => ({ ...conversation, id: `c${i}`, participants: [you] }));

const controls: PlaygroundControl[] = [
  { name: 'variant', kind: 'enum', options: ['default', 'compact'], defaultValue: 'default' },
  { name: 'count', label: 'conversations', kind: 'number', min: 1, max: 6, defaultValue: 4 },
  {
    name: 'unread',
    kind: 'boolean',
    defaultValue: true,
    help: 'unreadCount on the first two conversations.',
  },
];

function OpenConversation() {
  const { activeConversationId, conversations } = useChat();
  const open = conversations.find((c) => c.id === activeConversationId);
  return (
    <Typography variant="body2" color="text.secondary" role="status">
      Open: {open?.title ?? 'none'}
    </Typography>
  );
}

function Preview({ values }: { values: PlaygroundValues }) {
  const [adapter] = React.useState(() => createEchoAdapter());
  const conversations = ALL.slice(0, Number(values.count)).map((conversation, i) => ({
    ...conversation,
    unreadCount: values.unread && i < 2 ? i + 2 : 0,
  }));
  return (
    // A new provider when the data changes: `initialConversations` is read once.
    <ChatProvider
      key={`${String(values.count)}-${String(values.unread)}`}
      adapter={adapter}
      currentUser={you}
      initialConversations={conversations}
      initialActiveConversationId="c0"
    >
      <Stack spacing={1} sx={{ width: '100%', maxWidth: 360, alignSelf: 'center' }}>
        <Paper variant="outlined" sx={{ height: 300, overflow: 'hidden' }}>
          <ChatConversationList variant={values.variant as 'default' | 'compact'} />
        </Paper>
        <OpenConversation />
      </Stack>
    </ChatProvider>
  );
}

function code(values: PlaygroundValues) {
  return [
    jsxElement(
      'ChatProvider',
      {
        adapter: { raw: 'adapter' },
        initialConversations: { raw: 'conversations' },
      },
      jsxElement('ChatConversationList', {
        variant: values.variant === 'default' ? undefined : values.variant,
      }),
    ),
  ].join('\n');
}

export default function ConversationListPlayground() {
  return (
    <Playground
      title="ChatConversationList"
      description="Change the variant, the number of conversations and the unread badges, then pick a conversation."
      controls={controls}
      render={(values) => <Preview values={values} />}
      code={code}
      minHeight={340}
    />
  );
}
