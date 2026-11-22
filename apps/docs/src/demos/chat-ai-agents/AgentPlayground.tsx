import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatMessageChunk, ChatUser } from '@tecton-mui/ui/ChatHeadless';
import {
  Playground,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Well agent', role: 'assistant' };

const TOOLS = [
  { name: 'readPressure', input: { well: 'Alpha-7' }, output: { bar: 334 } },
  { name: 'readWind', input: { site: 'North platform' }, output: { knots: 18 } },
  { name: 'checkPermits', input: { job: 'rig move' }, output: { open: 0 } },
];

/** The chunks an agent run streams for the chosen options, in order. */
function agentRun(values: PlaygroundValues, messageId: string): ChatMessageChunk[] {
  const chunks: ChatMessageChunk[] = [{ type: 'start', messageId, author: agent }];
  if (values.reasoning) {
    chunks.push(
      { type: 'reasoning-start', id: 'think' },
      { type: 'reasoning-delta', id: 'think', delta: 'Before the rig move I need pressure, ' },
      { type: 'reasoning-delta', id: 'think', delta: 'wind and open permits.' },
      { type: 'reasoning-end', id: 'think' },
    );
  }
  TOOLS.slice(0, Number(values.tools)).forEach((tool, index) => {
    const id = `call-${index + 1}`;
    const fails = values.failLastTool && index === Number(values.tools) - 1;
    if (values.steps) chunks.push({ type: 'start-step' });
    chunks.push(
      { type: 'tool-input-start', toolCallId: id, toolName: tool.name },
      { type: 'tool-input-available', toolCallId: id, toolName: tool.name, input: tool.input },
      fails
        ? { type: 'tool-output-error', toolCallId: id, errorText: 'Sensor offline' }
        : { type: 'tool-output-available', toolCallId: id, output: tool.output },
    );
    if (values.steps) chunks.push({ type: 'finish-step' });
  });
  if (values.steps) chunks.push({ type: 'start-step' });
  chunks.push(
    { type: 'text-start', id: 'answer' },
    { type: 'text-delta', id: 'answer', delta: 'Pressure is **334 bar** and the wind is ' },
    { type: 'text-delta', id: 'answer', delta: '18 knots, within crane limits. ' },
    { type: 'text-delta', id: 'answer', delta: 'You can start the rig move.' },
    { type: 'text-end', id: 'answer' },
  );
  if (values.sources) {
    chunks.push({
      type: 'source-url',
      sourceId: 'envelope',
      url: '#envelope',
      title: 'Operating envelope',
    });
  }
  if (values.steps) chunks.push({ type: 'finish-step' });
  chunks.push({ type: 'finish', messageId });
  return chunks;
}

const DELAY = { slow: 600, normal: 250, fast: 60 } as const;

// An adapter that streams one kind of run; the playground makes a new one when an option changes.
function createAgentAdapter(values: PlaygroundValues): ChatAdapter {
  return {
    async sendMessage({ message, signal }) {
      const delay = DELAY[values.speed as keyof typeof DELAY];
      const chunks = agentRun(values, `run-${message.id}`);
      return new ReadableStream<ChatMessageChunk>({
        async start(controller) {
          for (const chunk of chunks) {
            if (signal.aborted) {
              controller.enqueue({ type: 'abort', messageId: `run-${message.id}` });
              break;
            }
            controller.enqueue(chunk);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
          controller.close();
        },
      });
    },
  };
}

function AgentChat({ values }: { values: PlaygroundValues }) {
  // The thread stays; the next run uses the new adapter.
  const adapter = React.useMemo(() => createAgentAdapter(values), [values]);
  return (
    <Box sx={{ width: '100%', height: 520 }}>
      <ChatBox
        adapter={adapter}
        members={[you, agent]}
        currentUser={you}
        suggestions={['Can we start the rig move?']}
        suggestionsAutoSubmit
        features={{ conversationHeader: false }}
        sx={{ height: '100%' }}
      />
    </Box>
  );
}

const controls: PlaygroundControl[] = [
  { name: 'reasoning', kind: 'boolean', defaultValue: true, help: 'reasoning-* chunks.' },
  {
    name: 'tools',
    label: 'tool calls',
    kind: 'number',
    min: 0,
    max: 3,
    defaultValue: 2,
    help: 'tool-input-* and tool-output-* chunks.',
  },
  { name: 'failLastTool', label: 'last tool fails', kind: 'boolean', defaultValue: false },
  {
    name: 'steps',
    kind: 'boolean',
    defaultValue: true,
    help: 'start-step / finish-step around each round.',
  },
  { name: 'sources', kind: 'boolean', defaultValue: true, help: 'A source-url chunk.' },
  { name: 'speed', kind: 'enum', options: ['slow', 'normal', 'fast'], defaultValue: 'normal' },
];

// The adapter code for the chosen run: the chunks, streamed one by one.
function code(values: PlaygroundValues) {
  const chunks = agentRun(values, 'messageId')
    .map((chunk) =>
      JSON.stringify(chunk)
        .replace(/"([a-zA-Z]+)":/g, '$1: ')
        .replace(/,(?=[a-zA-Z]+: )/g, ', ')
        .replace(/"messageId"/g, 'messageId')
        .replace(/^\{/, '{ ')
        .replace(/\}$/, ' }'),
    )
    .map((line) => `  ${line},`)
    .join('\n');
  return `const chunks = (messageId: string): ChatMessageChunk[] => [\n${chunks}\n];

const agentAdapter: ChatAdapter = {
  async sendMessage({ message, signal }) {
    const messageId = \`run-\${message.id}\`;
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        for (const chunk of chunks(messageId)) {
          if (signal.aborted) break;
          controller.enqueue(chunk); // in a real agent, as the model produces it
        }
        controller.close();
      },
    });
  },
};`;
}

export default function AgentPlayground() {
  return (
    <Playground
      title="Agent run"
      description="Choose what the agent streams, then click the suggestion. The code is the adapter that streams this run."
      controls={controls}
      render={(values) => <AgentChat values={values} />}
      code={code}
      minHeight={520}
      panel="below"
    />
  );
}
