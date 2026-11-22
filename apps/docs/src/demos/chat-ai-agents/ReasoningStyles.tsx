import * as React from 'react';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatMessageChunk, ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Well agent', role: 'assistant' };

const THOUGHTS = [
  'The user asks whether to open the choke. ',
  'Pressure is 334 bar, above the limit, so opening it is risky. ',
  'I should recommend waiting for the engineering review.',
];

const thinkingAdapter: ChatAdapter = {
  async sendMessage({ message }) {
    const messageId = `run-${message.id}`;
    const chunks: ChatMessageChunk[] = [
      { type: 'start', messageId, author: agent },
      { type: 'reasoning-start', id: 'r' },
      ...THOUGHTS.map((delta): ChatMessageChunk => ({ type: 'reasoning-delta', id: 'r', delta })),
      { type: 'reasoning-end', id: 'r' },
      { type: 'text-start', id: 't' },
      { type: 'text-delta', id: 't', delta: 'Wait for the engineering review before opening it.' },
      { type: 'text-end', id: 't' },
      { type: 'finish', messageId },
    ];
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 700));
        }
        controller.close();
      },
    });
  },
};

interface SummaryProps extends React.HTMLAttributes<HTMLElement> {
  ownerState?: { streaming: boolean };
}

// The reasoning `summary` slot: the line users click to open the reasoning. It knows whether the
// model is still thinking.
function ReasoningSummary({ ownerState, children: _label, ...props }: SummaryProps) {
  return (
    <summary {...props} style={{ cursor: 'pointer', fontStyle: 'italic' }}>
      {ownerState?.streaming ? 'Thinking…' : 'Show how the answer was reached'}
    </summary>
  );
}

// Module-level constant: a stable slot configuration.
const slotProps: ChatBoxProps['slotProps'] = {
  messageContent: { partProps: { reasoning: { slots: { summary: ReasoningSummary } } } },
};

export default function ReasoningStyles() {
  return (
    <ChatBox
      adapter={thinkingAdapter}
      members={[you, agent]}
      currentUser={you}
      slotProps={slotProps}
      suggestions={['Should we open the choke on Alpha-7?']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 380, width: '100%' }}
    />
  );
}
