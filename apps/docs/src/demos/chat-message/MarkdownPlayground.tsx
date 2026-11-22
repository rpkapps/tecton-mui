import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';
import {
  Playground,
  jsxElement,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const SAMPLE = `### Pressure check

Alpha-7 reads **334 bar**, *above* the limit. ~~Brent-2~~ is back to normal.

1. Close the choke
2. Inform the shift lead

- [x] Sensors checked
- [ ] Permit requested

| Well | Pressure |
| --- | ---: |
| Alpha-7 | 334 bar |
| Brent-2 | 318 bar |

> Limits are set in the operating envelope.

See the [pressure log](#pressure-log) or run \`readings.tail()\`.

\`\`\`sql
SELECT well, pressure FROM readings;
\`\`\`

<b>Raw HTML</b> is shown as text, never rendered.`;

const controls: PlaygroundControl[] = [
  { name: 'text', label: 'message text', kind: 'text', multiline: true, defaultValue: SAMPLE },
  {
    name: 'renderer',
    kind: 'enum',
    options: ['markdown', 'plain'],
    defaultValue: 'markdown',
    help: 'plain: partProps.text.renderText shows the text as written.',
  },
];

// Module-level constant: a stable slot configuration for the plain-text renderer.
const plainText: ChatBoxProps['slotProps'] = {
  messageContent: {
    partProps: {
      text: {
        renderText: (text) => <Box sx={{ whiteSpace: 'pre-wrap', m: 0 }}>{text}</Box>,
      },
    },
  },
};

function Preview({ values }: { values: PlaygroundValues }) {
  const [adapter] = React.useState(() => createEchoAdapter());
  // Controlled messages: the assistant's answer follows the text you type.
  const messages = React.useMemo<ChatMessage[]>(
    () => [
      {
        id: 'q',
        role: 'user',
        author: you,
        parts: [{ type: 'text', text: 'Status of Alpha-7?' }],
      },
      {
        id: 'a',
        role: 'assistant',
        author: assistant,
        parts: [{ type: 'text', text: String(values.text) }],
      },
    ],
    [values.text],
  );
  return (
    <Box sx={{ width: '100%', height: 560 }}>
      <ChatBox
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        messages={messages}
        slotProps={values.renderer === 'plain' ? plainText : undefined}
        features={{ conversationHeader: false }}
        sx={{ height: '100%' }}
      />
    </Box>
  );
}

function code(values: PlaygroundValues) {
  const part = `{ type: 'text', text: ${JSON.stringify(String(values.text).slice(0, 60))}${
    String(values.text).length > 60 ? ' + …' : ''
  } }`;
  return [
    `// A message part; the chat renders its text as Markdown.`,
    `const part = ${part};`,
    '',
    jsxElement('ChatBox', {
      adapter: raw('adapter'),
      initialMessages: raw('messages'),
      slotProps:
        values.renderer === 'plain'
          ? raw('{ messageContent: { partProps: { text: { renderText: (text) => text } } } }')
          : undefined,
    }),
  ].join('\n');
}

export default function MarkdownPlayground() {
  return (
    <Playground
      title="Text and Markdown"
      description="Edit the assistant's answer. Text parts are Markdown: emphasis, lists, task lists, tables, quotes, links, inline code and code blocks."
      controls={controls}
      render={(values) => <Preview values={values} />}
      code={code}
      minHeight={560}
      panel="below"
    />
  );
}
