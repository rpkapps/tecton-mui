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
    parts: [{ type: 'text', text: 'What is the current pressure on Alpha-7?' }],
  },
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [
      // Collapsible reasoning, shown before the answer.
      {
        type: 'reasoning',
        text: 'The user asks for a live value, so I query the pressure sensor of the well.',
        state: 'done',
      },
      // A tool call that returned a result, and one that failed.
      {
        type: 'tool',
        toolInvocation: {
          toolCallId: 'call-1',
          toolName: 'readPressure',
          state: 'output-available',
          input: { well: 'Alpha-7' },
          output: { bar: 334, at: '09:12' },
        },
      },
      {
        type: 'tool',
        toolInvocation: {
          toolCallId: 'call-2',
          toolName: 'readTemperature',
          state: 'output-error',
          input: { well: 'Alpha-7' },
          errorText: 'Sensor offline',
        },
      },
      // Markdown text.
      {
        type: 'text',
        text: 'Alpha-7 reads **334 bar**, above the 320 bar limit. The temperature sensor is offline.',
      },
      // A file and a source link.
      {
        type: 'file',
        mediaType: 'application/pdf',
        url: '#pressure-report',
        filename: 'pressure-report.pdf',
      },
      { type: 'source-url', sourceId: 'log', url: '#pressure-log', title: 'Pressure log' },
    ],
  },
];

export default function MessageParts() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={messages}
      features={{ conversationHeader: false }}
      sx={{ height: 520, width: '100%' }}
    />
  );
}
