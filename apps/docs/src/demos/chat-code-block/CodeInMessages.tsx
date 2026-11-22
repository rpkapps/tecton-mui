import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { shikiHighlighter } from '../../lib/highlight/chatCode';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const messages: ChatMessage[] = [
  {
    id: 'q',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'How do I list the wells above the limit in Python?' }],
  },
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [
      {
        type: 'text',
        text: [
          'Filter the readings with pandas:',
          '',
          '```python',
          'high = readings[readings["pressure"] > 320]',
          'print(high[["well", "pressure"]])',
          '```',
          '',
          'The same in TypeScript:',
          '',
          '```ts',
          'const high = readings.filter((r) => r.pressure > 320);',
          '```',
          '',
          'Inline code such as `readings.head()` keeps the text font size.',
        ].join('\n'),
      },
    ],
  },
];

// Set in the theme, the highlighter applies to every code block that Markdown messages render,
// in the language of its fence.
const themeOptions = {
  components: { MuiChatCodeBlock: { defaultProps: { highlighter: shikiHighlighter } } },
};

export default function CodeInMessages() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ThemeProvider themeOptions={themeOptions}>
      <ChatBox
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        initialMessages={messages}
        features={{ conversationHeader: false }}
        sx={{ height: 400, width: '100%' }}
      />
    </ThemeProvider>
  );
}
