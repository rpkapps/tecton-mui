import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Chip from '@tecton-mui/ui/Chip';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatMessageChunk, ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Map agent', role: 'assistant' };
const WELLS = ['Alpha-7', 'Brent-2', 'Cormorant-4', 'Dunlin-1'];

// The model asks the application to highlight wells on its map: a tool that runs in the browser.
const mapAdapter: ChatAdapter = {
  async sendMessage({ message }) {
    const question = message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
    const wells = WELLS.filter((well) => question.toLowerCase().includes(well.toLowerCase()));
    const shown = wells.length > 0 ? wells : ['Alpha-7', 'Brent-2'];
    const messageId = `run-${message.id}`;
    const chunks: ChatMessageChunk[] = [
      { type: 'start', messageId, author: agent },
      { type: 'tool-input-start', toolCallId: `map-${message.id}`, toolName: 'highlightWells' },
      {
        type: 'tool-input-available',
        toolCallId: `map-${message.id}`,
        toolName: 'highlightWells',
        input: { wells: shown },
      },
      { type: 'text-start', id: 'answer' },
      {
        type: 'text-delta',
        id: 'answer',
        delta: `I highlighted ${shown.join(' and ')} on the map.`,
      },
      { type: 'text-end', id: 'answer' },
      { type: 'finish', messageId },
    ];
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        controller.close();
      },
    });
  },
};

export default function AppTools() {
  const [highlighted, setHighlighted] = React.useState<string[]>([]);
  // Called for every update of a tool call; act once its input is complete.
  const onToolCall = React.useCallback<NonNullable<ChatBoxProps['onToolCall']>>(({ toolCall }) => {
    if (toolCall.toolName === 'highlightWells' && toolCall.state === 'input-available') {
      setHighlighted((toolCall.input as { wells: string[] }).wells);
    }
  }, []);
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        width: '100%',
        gridTemplateColumns: { xs: '1fr', sm: '180px minmax(0, 1fr)' },
      }}
    >
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Map
        </Typography>
        <Stack spacing={1} role="list" aria-label="Wells">
          {WELLS.map((well) => (
            <Chip
              key={well}
              role="listitem"
              label={well}
              color={highlighted.includes(well) ? 'primary' : 'default'}
              variant={highlighted.includes(well) ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Paper>
      <ChatBox
        adapter={mapAdapter}
        members={[you, agent]}
        currentUser={you}
        onToolCall={onToolCall}
        suggestions={['Show Cormorant-4 and Dunlin-1', 'Where are the high-pressure wells?']}
        suggestionsAutoSubmit
        features={{ conversationHeader: false }}
        sx={{ height: 380 }}
      />
    </Box>
  );
}
