import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatMessageChunk, ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Well agent', role: 'assistant' };

function createAdapter(fail: boolean): ChatAdapter {
  return {
    async sendMessage({ message }) {
      if (fail) throw new Error('Model endpoint returned 502.');
      const messageId = `run-${message.id}`;
      const chunks: ChatMessageChunk[] = [
        { type: 'start', messageId, author: agent },
        { type: 'tool-input-start', toolCallId: 't1', toolName: 'readPressure' },
        {
          type: 'tool-input-available',
          toolCallId: 't1',
          toolName: 'readPressure',
          input: { well: 'Alpha-7' },
        },
        { type: 'tool-output-available', toolCallId: 't1', output: { bar: 334 } },
        // A data part: structured data for your app, here a chart series.
        { type: 'data-series', data: { well: 'Alpha-7', points: [330, 332, 334] } },
        { type: 'text-start', id: 'x' },
        { type: 'text-delta', id: 'x', delta: 'Alpha-7 reads 334 bar.' },
        { type: 'text-end', id: 'x' },
        { type: 'finish', messageId, finishReason: 'stop' },
      ];
      return new ReadableStream<ChatMessageChunk>({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
          controller.close();
        },
      });
    },
  };
}

export default function CallbacksLog() {
  const [log, setLog] = React.useState<string[]>([]);
  const [fail, setFail] = React.useState(false);
  // A new adapter when the switch changes; the thread stays.
  const adapter = React.useMemo(() => createAdapter(fail), [fail]);
  const add = React.useCallback(
    (entry: string) => setLog((entries) => [entry, ...entries].slice(0, 8)),
    [],
  );
  const callbacks = React.useMemo<
    Pick<ChatBoxProps, 'onToolCall' | 'onData' | 'onFinish' | 'onError'>
  >(
    () => ({
      onToolCall: ({ toolCall }) => add(`onToolCall: ${toolCall.toolName} (${toolCall.state})`),
      onData: (part) => add(`onData: ${part.type}`),
      onFinish: ({ message }) => add(`onFinish: ${message?.id ?? '—'}`),
      onError: (error) => add(`onError: ${error.code} ${error.message}`),
    }),
    [add],
  );
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        width: '100%',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 260px' },
      }}
    >
      <ChatBox
        adapter={adapter}
        members={[you, agent]}
        currentUser={you}
        suggestions={['Read Alpha-7']}
        suggestionsAutoSubmit
        features={{ conversationHeader: false }}
        sx={{ height: 360 }}
        {...callbacks}
      />
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">Callback log</Typography>
          <FormControlLabel
            control={
              <Switch size="small" checked={fail} onChange={(e) => setFail(e.target.checked)} />
            }
            label="Fail next"
            sx={{ mr: 0 }}
          />
        </Stack>
        <Box component="ol" sx={{ m: 0, pl: 2.5, typography: 'caption', fontFamily: 'monospace' }}>
          {log.length === 0 ? <li>Send the suggestion.</li> : null}
          {log.map((entry, i) => (
            <li key={`${i}-${entry}`}>{entry}</li>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
