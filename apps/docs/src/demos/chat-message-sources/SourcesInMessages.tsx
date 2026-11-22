import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const messages: ChatMessage[] = [
  {
    id: 'q',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'Where does the 320 bar limit come from?' }],
  },
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [
      {
        type: 'text',
        text: 'The limit is set in the operating envelope and repeated in the well integrity plan.',
      },
      // `source-url` parts are listed as links under the answer.
      { type: 'source-url', sourceId: 'env', url: '#envelope', title: 'Operating envelope' },
      { type: 'source-url', sourceId: 'wip', url: '#integrity', title: 'Well integrity plan' },
      // `source-document` parts cite a document without a link.
      {
        type: 'source-document',
        sourceId: 'memo',
        title: 'Engineering memo 2026-14',
        text: 'Raises the alarm threshold to 320 bar.',
      },
    ],
  },
];

export default function SourcesInMessages() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={messages}
      features={{ conversationHeader: false }}
      sx={{ height: 400, width: '100%' }}
    />
  );
}
