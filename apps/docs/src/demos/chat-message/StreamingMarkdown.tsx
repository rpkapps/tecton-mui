import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatMessageChunk, ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const ANSWER = [
  'Two wells need attention **today**:',
  '',
  '| Well | Pressure | Action |',
  '| --- | ---: | --- |',
  '| Alpha-7 | 334 bar | Close the choke |',
  '| Brent-2 | 327 bar | Watch |',
  '',
  'Details are in the [pressure log](#pressure-log). Run `check_limits()` again after **14:00**.',
].join('\n');

// Streams the Markdown in 3-character pieces, so most deltas end in the middle of `**bold**`,
// a table row or a link. The chat repairs the half-written syntax while it streams.
const markdownAdapter: ChatAdapter = {
  async sendMessage({ message, signal }) {
    const messageId = `md-${message.id}`;
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        controller.enqueue({ type: 'start', messageId, author: assistant });
        controller.enqueue({ type: 'text-start', id: 'md' });
        for (let i = 0; i < ANSWER.length; i += 3) {
          if (signal.aborted) break;
          controller.enqueue({ type: 'text-delta', id: 'md', delta: ANSWER.slice(i, i + 3) });
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        controller.enqueue({ type: 'text-end', id: 'md' });
        controller.enqueue({ type: 'finish', messageId });
        controller.close();
      },
    });
  },
};

export default function StreamingMarkdown() {
  return (
    <ChatBox
      adapter={markdownAdapter}
      members={[you, assistant]}
      currentUser={you}
      suggestions={['Which wells need attention?']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 400, width: '100%' }}
    />
  );
}
