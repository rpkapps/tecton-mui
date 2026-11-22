import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const initialMessages: ChatMessage[] = [
  {
    id: 'q1',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'Which wells are above the pressure limit?' }],
  },
  {
    id: 'a1',
    role: 'assistant',
    author: assistant,
    parts: [
      {
        type: 'text',
        text: 'Two wells are above **320 bar**:\n\n- Alpha-7 (334 bar)\n- Brent-2 (327 bar)\n\n```sql\nSELECT well, pressure FROM readings WHERE pressure > 320;\n```',
      },
    ],
  },
];

export default function BasicChat() {
  // Create the adapter once: a new adapter on every render would restart the chat runtime.
  const [adapter] = React.useState(() =>
    createEchoAdapter({ respond: (text) => `You asked: "${text}". Connect a real backend here.` }),
  );
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={initialMessages}
      features={{ conversationHeader: false }}
      sx={{ height: 440, width: '100%' }}
    />
  );
}
