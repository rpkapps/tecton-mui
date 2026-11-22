import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatComposer from '@tecton-mui/ui/ChatComposer';
import {
  ChatProvider,
  createEchoAdapter,
  useChatStatus,
  useMessage,
  useMessageIds,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };
const initialMessages: ChatMessage[] = ['Pump 3 restarted.', 'Crane inspection done.'].map(
  (text, i) => ({
    id: `m${i}`,
    role: 'user',
    author: you,
    parts: [{ type: 'text', text }],
  }),
);

// Counts this row's renders after each commit and writes the number into the DOM, so counting does
// not cause another render.
function useRenderCount() {
  const label = React.useRef<HTMLSpanElement>(null);
  const count = React.useRef(0);
  React.useEffect(() => {
    count.current += 1;
    if (label.current) label.current.textContent = `rendered ${count.current}×`;
  });
  return label;
}

// One row per message: `useMessage(id)` subscribes to that message only, so a new or streaming
// message re-renders its own row and no other.
const MessageRow = React.memo(function MessageRow({ id }: { id: string }) {
  const message = useMessage(id);
  const renders = useRenderCount();
  const text = message?.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
  return (
    <Stack direction="row" spacing={1} sx={{ py: 0.5, alignItems: 'baseline' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
        {message?.author?.displayName ?? message?.role}
      </Typography>
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {text}
      </Typography>
      <Typography ref={renders} variant="caption" color="text.secondary" />
    </Stack>
  );
});

function Thread() {
  // Only the list of ids: it changes when a message is added, not when one streams.
  const ids = useMessageIds();
  const { isStreaming } = useChatStatus();
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1 }} role="log" aria-label="Messages">
      {ids.map((id) => (
        <MessageRow key={id} id={id} />
      ))}
      {isStreaming ? (
        <Typography variant="caption" color="text.secondary">
          Answering…
        </Typography>
      ) : null}
    </Box>
  );
}

export default function FineGrainedHooks() {
  const [adapter] = React.useState(() => createEchoAdapter({ delayMs: 200 }));
  return (
    <ChatProvider
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={initialMessages}
    >
      <Paper
        variant="outlined"
        sx={{ display: 'flex', flexDirection: 'column', height: 320, width: '100%' }}
      >
        <Thread />
        <ChatComposer />
      </Paper>
    </ChatProvider>
  );
}
