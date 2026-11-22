import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatDensity,
  type ChatMessage,
  type ChatMessageStatus,
  type ChatUser,
  type ChatVariant,
} from '@tecton-mui/ui/ChatHeadless';
import {
  Playground,
  jsxElement,
  objectSource,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };

function thread(status: ChatMessageStatus): ChatMessage[] {
  const say = (id: string, author: ChatUser, at: string, text: string): ChatMessage => ({
    id,
    role: 'user',
    author,
    createdAt: at,
    parts: [{ type: 'text', text }],
  });
  return [
    say('1', sam, '2026-11-17T15:00:00.000Z', 'Is the crane booked for tomorrow?'),
    { ...say('2', you, '2026-11-17T15:05:00.000Z', 'Yes, 08:00 to 14:00.'), status: 'read' },
    say('3', sam, '2026-11-18T07:45:00.000Z', 'Wind is picking up.'),
    say('4', sam, '2026-11-18T07:46:00.000Z', 'Let us decide at 09:00.'),
    { ...say('5', you, '2026-11-18T07:50:00.000Z', 'Agreed, I will check the forecast.'), status },
  ];
}

const controls: PlaygroundControl[] = [
  { name: 'variant', kind: 'enum', options: ['default', 'compact'], defaultValue: 'default' },
  {
    name: 'density',
    kind: 'enum',
    options: ['compact', 'standard', 'comfortable'],
    defaultValue: 'standard',
  },
  {
    name: 'status',
    label: 'status (last message)',
    kind: 'enum',
    options: ['sending', 'sent', 'read'],
    defaultValue: 'sent',
    help: 'The check marks after the time of your own messages.',
  },
  {
    name: 'avatars',
    kind: 'boolean',
    defaultValue: true,
    help: 'slots.messageAvatar = null hides them.',
  },
  { name: 'dateDivider', kind: 'boolean', defaultValue: true },
];

const noAvatars: ChatBoxProps['slots'] = { messageAvatar: null };

function Preview({ values }: { values: PlaygroundValues }) {
  const [adapter] = React.useState(() => createEchoAdapter());
  const status = values.status as ChatMessageStatus;
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ChatBox
        // A new thread when the status changes: `initialMessages` is read once.
        key={status}
        adapter={adapter}
        members={[you, sam]}
        currentUser={you}
        initialMessages={thread(status)}
        variant={values.variant as ChatVariant}
        density={values.density as ChatDensity}
        slots={values.avatars ? undefined : noAvatars}
        features={{ conversationHeader: false, dateDivider: Boolean(values.dateDivider) }}
        sx={{ height: '100%' }}
      />
    </Box>
  );
}

function code(values: PlaygroundValues) {
  return jsxElement('ChatBox', {
    adapter: raw('adapter'),
    currentUser: raw('currentUser'),
    initialMessages: raw('messages'),
    variant: values.variant === 'default' ? undefined : values.variant,
    density: values.density === 'standard' ? undefined : values.density,
    slots: values.avatars ? undefined : raw('{ messageAvatar: null }'),
    features: raw(
      objectSource({
        conversationHeader: false,
        dateDivider: values.dateDivider ? true : undefined,
      })!,
    ),
  });
}

export default function MessagePlayground() {
  return (
    <Playground
      title="Messages"
      description="How messages look: layout, spacing, delivery status, avatars and date dividers."
      controls={controls}
      render={(values) => <Preview values={values} />}
      code={code}
      minHeight={400}
      panel="below"
    />
  );
}
