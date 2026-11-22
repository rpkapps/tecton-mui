import * as React from 'react';
import Chip from '@tecton-mui/ui/Chip';
import CircularProgress from '@tecton-mui/ui/CircularProgress';
import Icon from '@tecton-mui/ui/Icon';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type {
  ChatAdapter,
  ChatMessageChunk,
  ChatPartRendererMap,
  ChatToolMessagePart,
  ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Well agent', role: 'assistant' };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const agentAdapter: ChatAdapter = {
  async sendMessage({ message }) {
    const messageId = `run-${message.id}`;
    const call = `pressure-${message.id}`;
    const chunks: ChatMessageChunk[] = [
      { type: 'start', messageId, author: agent },
      { type: 'tool-input-start', toolCallId: call, toolName: 'readPressure' },
      {
        type: 'tool-input-available',
        toolCallId: call,
        toolName: 'readPressure',
        input: { well: 'Alpha-7' },
      },
      { type: 'tool-output-available', toolCallId: call, output: { bar: 334, limit: 320 } },
      { type: 'text-start', id: 'answer' },
      { type: 'text-delta', id: 'answer', delta: 'Alpha-7 is **14 bar** over its limit.' },
      { type: 'text-end', id: 'answer' },
      { type: 'finish', messageId },
    ];
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
          // Hold on the running tool so its "running" state is visible.
          await wait(chunk.type === 'tool-input-available' ? 1500 : 200);
        }
        controller.close();
      },
    });
  },
};

const STATE_LABEL: Record<string, { label: string; color: 'default' | 'success' | 'error' }> = {
  'input-streaming': { label: 'Preparing', color: 'default' },
  'input-available': { label: 'Running', color: 'default' },
  'output-available': { label: 'Done', color: 'success' },
  'output-error': { label: 'Failed', color: 'error' },
};

// A card for every `tool` part, in place of the default collapsible row.
function ToolCard({ part }: { part: ChatToolMessagePart }) {
  const { toolName, state, input, output, errorText } = part.toolInvocation;
  const status = STATE_LABEL[state] ?? { label: state, color: 'default' as const };
  const running = state === 'input-streaming' || state === 'input-available';
  const reading = output as { bar: number; limit: number } | undefined;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, my: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Icon name="log-curve" size="small" />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {toolName === 'readPressure' ? 'Pressure reading' : toolName}
        </Typography>
        {running ? <CircularProgress size={16} aria-label="Running" /> : null}
        <Chip size="small" label={status.label} color={status.color} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Well {(input as { well?: string } | undefined)?.well ?? '…'}
        {reading ? ` · ${reading.bar} bar (limit ${reading.limit})` : ''}
        {errorText ? ` · ${errorText}` : ''}
      </Typography>
    </Paper>
  );
}

// Module-level constant: renderers keep a stable identity.
const partRenderers: ChatPartRendererMap = {
  tool: ({ part }) => <ToolCard part={part} />,
};

export default function ToolCards() {
  return (
    <ChatBox
      adapter={agentAdapter}
      members={[you, agent]}
      currentUser={you}
      partRenderers={partRenderers}
      suggestions={['How is Alpha-7 doing?']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 400, width: '100%' }}
    />
  );
}
