import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatMessageChunk, ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function answer(question: string) {
  return `Checking the latest readings for "${question}". All pumps on the platform report normal pressure, and the next inspection is scheduled for Monday.`;
}

// A backend that streams its answer word by word. A real adapter would read the chunks from a
// fetch() response or a WebSocket; the chunk protocol is the same.
const streamingAdapter: ChatAdapter = {
  async sendMessage({ message, signal }) {
    const question = message.parts.map((part) => (part.type === 'text' ? part.text : '')).join('');
    const messageId = `reply-${message.id}`;
    const textId = `${messageId}-text`;
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        controller.enqueue({ type: 'start', messageId });
        controller.enqueue({ type: 'text-start', id: textId });
        for (const word of answer(question).split(' ')) {
          // Stop streaming when the chat aborts the request (`stopStreaming()` from `useChat()`).
          if (signal.aborted) {
            controller.enqueue({ type: 'abort', messageId });
            controller.close();
            return;
          }
          await wait(60);
          controller.enqueue({ type: 'text-delta', id: textId, delta: `${word} ` });
        }
        controller.enqueue({ type: 'text-end', id: textId });
        controller.enqueue({ type: 'finish', messageId });
        controller.close();
      },
    });
  },
};

export default function StreamingAdapter() {
  return (
    <ChatBox
      adapter={streamingAdapter}
      members={[you, assistant]}
      currentUser={you}
      suggestions={['Is pump 3 running normally?']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 400, width: '100%' }}
    />
  );
}
