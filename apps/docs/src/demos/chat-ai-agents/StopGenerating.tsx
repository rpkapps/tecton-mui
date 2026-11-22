import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import LinearProgress from '@tecton-mui/ui/LinearProgress';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  useChat,
  type ChatAdapter,
  type ChatMessageChunk,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Report agent', role: 'assistant' };

const REPORT =
  'Shift report, North platform. Pump 3 tripped at 02:10 on high vibration and was restarted at 06:40 ' +
  'after the bearing check. Pressure on Alpha-7 stayed above the 320 bar limit for most of the night, ' +
  'peaking at 334 bar at 04:15. The crane inspection was signed off. Wind rose to 18 knots by 07:30. ' +
  'Open actions: replace the pump 3 bearing within the week, review the Alpha-7 limit with engineering.';

// A slow, word-by-word answer that stops as soon as the request is aborted.
const slowAdapter: ChatAdapter = {
  async sendMessage({ message, signal }) {
    const messageId = `report-${message.id}`;
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        controller.enqueue({ type: 'start', messageId, author: agent });
        controller.enqueue({ type: 'text-start', id: 'report' });
        for (const word of REPORT.split(' ')) {
          if (signal.aborted) {
            controller.enqueue({ type: 'abort', messageId });
            controller.close();
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 120));
          controller.enqueue({ type: 'text-delta', id: 'report', delta: `${word} ` });
        }
        controller.enqueue({ type: 'text-end', id: 'report' });
        controller.enqueue({ type: 'finish', messageId });
        controller.close();
      },
    });
  },
};

// Children of ChatBox render inside the chat, so they can use the chat hooks.
function StreamingBar() {
  const { isStreaming, stopStreaming } = useChat();
  if (!isStreaming) return null;
  return (
    <Stack spacing={0.5} sx={{ px: 1.5, pb: 1.5 }}>
      <LinearProgress aria-label="Writing the answer" />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Writing the report…
        </Typography>
        <Button size="small" variant="outlined" onClick={stopStreaming}>
          Stop
        </Button>
      </Stack>
    </Stack>
  );
}

export default function StopGenerating() {
  return (
    <ChatBox
      adapter={slowAdapter}
      members={[you, agent]}
      currentUser={you}
      suggestions={['Write the shift report']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 420, width: '100%' }}
    >
      <StreamingBar />
    </ChatBox>
  );
}
