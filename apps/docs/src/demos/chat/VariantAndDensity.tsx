import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import ChatBox, { type ChatBoxVariant } from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatDensity,
  type ChatMessage,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const lead: ChatUser = { id: 'lead', displayName: 'Drilling lead' };

const messages: ChatMessage[] = [
  {
    id: 'v1',
    role: 'assistant',
    author: lead,
    createdAt: '2026-11-18T08:00:00.000Z',
    parts: [{ type: 'text', text: 'Morning. The rig move starts at 10:00.' }],
  },
  {
    id: 'v2',
    role: 'assistant',
    author: lead,
    createdAt: '2026-11-18T08:01:00.000Z',
    parts: [{ type: 'text', text: 'Please confirm the crane inspection is done.' }],
  },
  {
    id: 'v3',
    role: 'user',
    author: you,
    createdAt: '2026-11-18T08:05:00.000Z',
    parts: [{ type: 'text', text: 'Confirmed, signed off yesterday.' }],
  },
];

export default function VariantAndDensity() {
  const [adapter] = React.useState(() => createEchoAdapter());
  const [variant, setVariant] = React.useState<ChatBoxVariant>('default');
  const [density, setDensity] = React.useState<ChatDensity>('standard');
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={variant}
          onChange={(_, value: ChatBoxVariant | null) => value && setVariant(value)}
          aria-label="Variant"
        >
          <ToggleButton value="default">Default</ToggleButton>
          <ToggleButton value="compact">Compact</ToggleButton>
          <ToggleButton value="assistant">Assistant</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={density}
          onChange={(_, value: ChatDensity | null) => value && setDensity(value)}
          aria-label="Density"
        >
          <ToggleButton value="compact">Compact</ToggleButton>
          <ToggleButton value="standard">Standard</ToggleButton>
          <ToggleButton value="comfortable">Comfortable</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <ChatBox
        adapter={adapter}
        currentUser={you}
        members={[you, lead]}
        initialMessages={messages}
        variant={variant}
        density={density}
        features={{ conversationHeader: false }}
        sx={{ height: 360 }}
      />
    </Stack>
  );
}
