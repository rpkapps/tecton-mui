import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type {
  ChatAdapter,
  ChatMessage,
  ChatMessageChunk,
  ChatRealtimeEvent,
  ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Well agent', role: 'assistant' };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// An agent that must ask before it closes a valve. The run stops at `tool-approval-request`; the
// user's answer reaches `addToolApprovalResponse`, and the backend finishes the run, here by pushing
// the updated answer through `subscribe` (a real backend would push it over its WebSocket or SSE).
function createApprovalAdapter(): ChatAdapter {
  // One listener per subscription, so ending one subscription never silences another.
  const listeners = new Set<(event: ChatRealtimeEvent) => void>();
  const push = (event: ChatRealtimeEvent) => listeners.forEach((listener) => listener(event));
  const pending = new Map<string, ChatMessage>();
  return {
    subscribe({ onEvent }) {
      const listener = (event: ChatRealtimeEvent) => onEvent(event);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async sendMessage({ message }) {
      const messageId = `run-${message.id}`;
      const toolCallId = `close-${message.id}`;
      const input = { valve: 'Alpha-7 choke', position: 'closed' };
      // What the run looks like once it waits for approval, kept to finish it later.
      pending.set(toolCallId, {
        id: messageId,
        role: 'assistant',
        author: agent,
        parts: [
          { type: 'text', text: 'Closing the choke stops the flow from Alpha-7.' },
          {
            type: 'tool',
            toolInvocation: { toolCallId, toolName: 'setValve', input, state: 'input-available' },
          },
        ],
      });
      const chunks: ChatMessageChunk[] = [
        { type: 'start', messageId, author: agent },
        { type: 'text-start', id: 'why' },
        { type: 'text-delta', id: 'why', delta: 'Closing the choke stops the flow from Alpha-7.' },
        { type: 'text-end', id: 'why' },
        { type: 'tool-approval-request', toolCallId, toolName: 'setValve', input },
        { type: 'finish', messageId },
      ];
      return new ReadableStream<ChatMessageChunk>({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
            await wait(250);
          }
          controller.close();
        },
      });
    },
    async addToolApprovalResponse({ id, approved }) {
      const run = pending.get(id);
      if (!run) return;
      pending.delete(id);
      await wait(600);
      const [intro, tool] = run.parts;
      if (tool?.type !== 'tool') return;
      push({
        type: 'message-updated',
        message: {
          ...run,
          parts: [
            intro!,
            {
              ...tool,
              toolInvocation: approved
                ? { ...tool.toolInvocation, state: 'output-available', output: { done: true } }
                : {
                    ...tool.toolInvocation,
                    state: 'output-denied',
                    approval: { approved: false },
                  },
            },
            {
              type: 'text',
              text: approved
                ? 'The choke on Alpha-7 is **closed**. Flow has stopped.'
                : 'Understood, I left the choke **open**.',
            },
          ],
        },
      });
    },
  };
}

export default function ToolApproval() {
  const [adapter] = React.useState(createApprovalAdapter);
  return (
    <ChatBox
      adapter={adapter}
      members={[you, agent]}
      currentUser={you}
      suggestions={['Close the choke on Alpha-7']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 440, width: '100%' }}
    />
  );
}
