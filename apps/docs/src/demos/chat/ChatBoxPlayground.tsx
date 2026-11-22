import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ChatBox, {
  type ChatBoxVariant,
  type ChatBoxLayoutMode,
  type ChatBoxProps,
} from '@tecton-mui/ui/ChatBox';
import type {
  ChatAdapter,
  ChatConversation,
  ChatDensity,
  ChatMessage,
  ChatMessageChunk,
  ChatUser,
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
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };

const conversations: ChatConversation[] = [
  {
    id: 'pressure',
    title: 'Pressure check',
    subtitle: 'Field assistant',
    participants: [you, assistant],
    lastMessageAt: '2026-11-18T09:12:00.000Z',
  },
  {
    id: 'rig',
    title: 'Rig move',
    subtitle: 'Sam Weber',
    participants: [you, sam],
    unreadCount: 2,
    lastMessageAt: '2026-11-18T07:46:00.000Z',
  },
  {
    id: 'logs',
    title: 'Log review',
    subtitle: 'Field assistant',
    participants: [you, assistant],
    lastMessageAt: '2026-11-17T16:30:00.000Z',
  },
];

const say = (
  id: string,
  conversationId: string,
  author: ChatUser,
  createdAt: string,
  text: string,
): ChatMessage => ({
  id,
  conversationId,
  role: author.role ?? 'user',
  author,
  createdAt,
  status: author === you ? 'read' : undefined,
  parts: [{ type: 'text', text }],
});

const history: Record<string, ChatMessage[]> = {
  pressure: [
    say('p1', 'pressure', you, '2026-11-17T17:00:00.000Z', 'Which wells are above the limit?'),
    say(
      'p2',
      'pressure',
      assistant,
      '2026-11-17T17:00:05.000Z',
      'Two wells are above **320 bar**:\n\n- Alpha-7 (334 bar)\n- Brent-2 (327 bar)',
    ),
    say('p3', 'pressure', you, '2026-11-18T09:11:00.000Z', 'Show me the query you used.'),
    say(
      'p4',
      'pressure',
      assistant,
      '2026-11-18T09:12:00.000Z',
      '```sql\nSELECT well, pressure FROM readings WHERE pressure > 320;\n```',
    ),
  ],
  rig: [
    say('r1', 'rig', you, '2026-11-17T15:05:00.000Z', 'The crane is booked for 08:00.'),
    say('r2', 'rig', sam, '2026-11-18T07:45:00.000Z', 'Wind is picking up.'),
    say('r3', 'rig', sam, '2026-11-18T07:46:00.000Z', 'Let us decide at 09:00.'),
  ],
  logs: [
    say(
      'l1',
      'logs',
      assistant,
      '2026-11-17T16:30:00.000Z',
      'The GR curve for Alpha-7 is normalised.',
    ),
  ],
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A backend that streams its answers word by word and serves the history above.
function createPlaygroundAdapter(): ChatAdapter {
  return {
    async listMessages({ conversationId }) {
      return { messages: history[conversationId] ?? [], hasMore: false };
    },
    async sendMessage({ message, signal }) {
      const question = message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
      const messageId = `reply-${message.id}`;
      const textId = `${messageId}-text`;
      const answer = `You asked: "${question}". In a real app your backend answers here, streamed as it is generated.`;
      return new ReadableStream<ChatMessageChunk>({
        async start(controller) {
          controller.enqueue({ type: 'start', messageId, author: assistant });
          controller.enqueue({ type: 'text-start', id: textId });
          for (const word of answer.split(' ')) {
            if (signal.aborted) break;
            await wait(40);
            controller.enqueue({ type: 'text-delta', id: textId, delta: `${word} ` });
          }
          controller.enqueue({ type: 'text-end', id: textId });
          controller.enqueue({ type: 'finish', messageId });
          controller.close();
        },
      });
    },
  };
}

const suggestionList = ['Summarise the last shift', 'Which wells need a visit?'];

const controls: PlaygroundControl[] = [
  {
    name: 'variant',
    kind: 'enum',
    group: 'Appearance',
    options: ['default', 'compact', 'assistant'],
    defaultValue: 'default',
    help: 'assistant: full-width answers, as in AI assistants.',
  },
  {
    name: 'density',
    kind: 'enum',
    group: 'Appearance',
    options: ['compact', 'standard', 'comfortable'],
    defaultValue: 'standard',
  },
  {
    name: 'layoutMode',
    kind: 'enum',
    group: 'Appearance',
    options: ['auto', 'standard', 'overlay', 'split'],
    defaultValue: 'auto',
    help: 'auto follows the width of the chat.',
  },
  { name: 'conversationList', kind: 'boolean', group: 'Features', defaultValue: true },
  { name: 'conversationHeader', kind: 'boolean', group: 'Features', defaultValue: true },
  {
    name: 'attachments',
    kind: 'boolean',
    group: 'Features',
    defaultValue: true,
    help: 'Attach button, drag and drop, paste.',
  },
  {
    name: 'suggestions',
    kind: 'boolean',
    group: 'Features',
    defaultValue: true,
    help: 'Prompt chips above the composer.',
  },
  { name: 'scrollToBottom', kind: 'boolean', group: 'Features', defaultValue: true },
  { name: 'autoScroll', kind: 'boolean', group: 'Features', defaultValue: true },
  { name: 'dateDivider', kind: 'boolean', group: 'Features', defaultValue: false },
  {
    name: 'unreadMarker',
    kind: 'boolean',
    group: 'Features',
    defaultValue: false,
    help: 'Open "Rig move" to see it.',
  },
  { name: 'helperText', kind: 'boolean', group: 'Features', defaultValue: true },
  {
    name: 'helperTextContent',
    label: 'helper text',
    kind: 'text',
    group: 'Composer',
    defaultValue: 'Answers can be wrong. Check critical values.',
  },
  {
    name: 'suggestionsAutoSubmit',
    kind: 'boolean',
    group: 'Composer',
    defaultValue: false,
    help: 'A suggestion sends at once instead of filling the composer.',
  },
];

const DEFAULT_FEATURES = {
  conversationList: false,
  conversationHeader: true,
  attachments: true,
  suggestions: true,
  scrollToBottom: true,
  autoScroll: true,
  dateDivider: false,
  unreadMarker: false,
  helperText: true,
} as const;
type FeatureName = keyof typeof DEFAULT_FEATURES;

/** The feature flags that differ from ChatBox's defaults. */
function changedFeatures(values: PlaygroundValues) {
  return Object.fromEntries(
    (Object.keys(DEFAULT_FEATURES) as FeatureName[])
      .filter((name) => values[name] !== DEFAULT_FEATURES[name])
      .map((name) => [name, values[name]]),
  ) as ChatBoxProps['features'] & Record<string, boolean>;
}

function PlaygroundChat({ values }: { values: PlaygroundValues }) {
  const [adapter] = React.useState(createPlaygroundAdapter);
  const features = changedFeatures(values);
  const layoutMode = values.layoutMode === 'auto' ? undefined : values.layoutMode;
  return (
    <Box sx={{ width: '100%', height: 480 }}>
      <ChatBox
        adapter={adapter}
        currentUser={you}
        members={[you, assistant, sam]}
        initialConversations={conversations}
        initialActiveConversationId="pressure"
        variant={values.variant as ChatBoxVariant}
        density={values.density as ChatDensity}
        layoutMode={layoutMode as ChatBoxLayoutMode | undefined}
        features={features}
        suggestions={suggestionList}
        suggestionsAutoSubmit={Boolean(values.suggestionsAutoSubmit)}
        slotProps={{ composerHelperText: { children: String(values.helperTextContent) } }}
        sx={{ height: '100%' }}
      />
    </Box>
  );
}

function code(values: PlaygroundValues) {
  const helper = String(values.helperTextContent);
  return jsxElement('ChatBox', {
    adapter: raw('adapter'),
    currentUser: raw('currentUser'),
    initialConversations: raw('conversations'),
    variant: values.variant === 'default' ? undefined : values.variant,
    density: values.density === 'standard' ? undefined : values.density,
    layoutMode: values.layoutMode === 'auto' ? undefined : values.layoutMode,
    features: (() => {
      const source = objectSource(changedFeatures(values));
      return source ? raw(source) : undefined;
    })(),
    suggestions: raw(JSON.stringify(suggestionList)),
    suggestionsAutoSubmit: values.suggestionsAutoSubmit ? true : undefined,
    slotProps:
      values.helperText && helper
        ? raw(`{ composerHelperText: { children: ${JSON.stringify(helper)} } }`)
        : undefined,
    sx: raw('{ height: 480 }'),
  });
}

export default function ChatBoxPlayground() {
  return (
    <Playground
      title="ChatBox"
      description="Change the props and features of a complete chat. Send a message to see a streamed answer."
      controls={controls}
      render={(values) => <PlaygroundChat values={values} />}
      code={code}
      minHeight={480}
      // The chat needs the full width for its conversation list (below 600px it becomes an overlay).
      panel="below"
    />
  );
}
