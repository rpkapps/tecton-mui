import * as React from 'react';
import Chip from '@tecton-mui/ui/Chip';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatConversation,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };

type WellStatus = 'Alarm' | 'Watch' | 'Normal';
const COLORS = { Alarm: 'error', Watch: 'warning', Normal: 'success' } as const;

// One conversation per well; `metadata` carries data of your own.
const conversations: ChatConversation[] = [
  { id: 'a7', title: 'Alpha-7', subtitle: 'Pressure 334 bar', metadata: { status: 'Alarm' } },
  { id: 'b2', title: 'Brent-2', subtitle: 'Pressure 318 bar', metadata: { status: 'Watch' } },
  { id: 'c4', title: 'Cormorant-4', subtitle: 'Pressure 290 bar', metadata: { status: 'Normal' } },
].map((conversation) => ({ ...conversation, participants: [you] }));

interface PreviewProps {
  conversation: ChatConversation;
  className?: string;
}

// The `preview` slot: the second line of each item. Here the subtitle and the well's status.
function StatusPreview({ conversation, className }: PreviewProps) {
  const status = (conversation.metadata as { status?: WellStatus } | undefined)?.status;
  return (
    <Stack direction="row" spacing={1} className={className} sx={{ alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary" noWrap sx={{ flexGrow: 1 }}>
        {conversation.subtitle}
      </Typography>
      {status ? <Chip size="small" label={status} color={COLORS[status]} /> : null}
    </Stack>
  );
}

// Module-level constant: a stable slot configuration.
const slotProps: ChatBoxProps['slotProps'] = {
  conversationList: { slots: { preview: StatusPreview } },
};

export default function CustomListItems() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      currentUser={you}
      members={[you]}
      initialConversations={conversations}
      initialActiveConversationId="a7"
      features={{ conversationList: true }}
      slotProps={slotProps}
      layoutMode="standard"
      sx={{ height: 360, width: '100%' }}
    />
  );
}
