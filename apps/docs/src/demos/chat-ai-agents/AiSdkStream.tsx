import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createAiSdkAdapter, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

// What a Vercel AI SDK route sends: `result.toUIMessageStreamResponse()` answers with server-sent
// events, one JSON chunk per `data:` line. Here the bytes are produced in the browser to keep the
// example self-contained; in an app they are `response.body` of a fetch to that route.
function fakeAiSdkRoute(question: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const events = [
    { type: 'start', messageId: `ai-${Date.now()}` },
    { type: 'text-start', id: 't' },
    ...`You asked "${question}". This answer arrived as AI SDK server-sent events.`
      .split(' ')
      .map((word) => ({ type: 'text-delta', id: 't', delta: `${word} ` })),
    { type: 'text-end', id: 't' },
    { type: 'finish' },
  ];
  return new ReadableStream({
    async start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// In an app:
//   createAiSdkAdapter({
//     stream: async ({ messages, signal }) =>
//       (await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }), signal })).body!,
//   })
const adapter = createAiSdkAdapter({
  stream: ({ message }) =>
    fakeAiSdkRoute(message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('')),
});

export default function AiSdkStream() {
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      suggestions={['What is the pressure limit?']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 340, width: '100%' }}
    />
  );
}
