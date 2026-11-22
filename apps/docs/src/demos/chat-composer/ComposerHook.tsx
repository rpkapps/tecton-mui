import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, useChatComposer, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const TEMPLATES = {
  'Daily report': 'Daily report for Alpha-7: pressure ___ bar, flow ___ m³/h, no incidents.',
  'Permit request': 'Request a hot-work permit for ___ on ___, from ___ to ___.',
};
const LIMIT = 160;

// Inside ChatBox, `useChatComposer` reads and drives the same composer the user types in.
function ComposerTools() {
  const { value, setValue, clear, submit, isSubmitting, attachments } = useChatComposer();
  const over = value.length > LIMIT;
  return (
    <Paper variant="outlined" sx={{ mx: 1.5, mb: 1.5, p: 1 }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {Object.entries(TEMPLATES).map(([label, text]) => (
          <Button key={label} size="small" variant="outlined" onClick={() => setValue(text)}>
            {label}
          </Button>
        ))}
        <Button size="small" variant="text" onClick={clear} disabled={!value}>
          Clear
        </Button>
        <Typography
          variant="caption"
          color={over ? 'error' : 'text.secondary'}
          sx={{ ml: 'auto' }}
          role="status"
        >
          {value.length}/{LIMIT} characters, {attachments.length} files
        </Typography>
        <Button
          size="small"
          variant="contained"
          disabled={!value || over || isSubmitting}
          onClick={() => void submit()}
        >
          Send report
        </Button>
      </Stack>
    </Paper>
  );
}

export default function ComposerHook() {
  const [adapter] = React.useState(() => createEchoAdapter({ respond: () => 'Report filed.' }));
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      features={{ conversationHeader: false }}
      sx={{ height: 400, width: '100%' }}
    >
      <ComposerTools />
    </ChatBox>
  );
}
