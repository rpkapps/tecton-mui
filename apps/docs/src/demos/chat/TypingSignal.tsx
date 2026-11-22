import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatAdapter,
  type ChatConversation,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };
const conversations: ChatConversation[] = [
  { id: 'rig', title: 'Rig move', subtitle: 'Sam Weber', participants: [you, sam] },
];

export default function TypingSignal() {
  const [sent, setSent] = React.useState<string[]>([]);
  const [adapter] = React.useState<ChatAdapter>(() => ({
    ...createEchoAdapter({ respond: () => 'Got it.' }),
    // With `features.typingSignal`, the chat calls this when the draft becomes non-empty and when
    // it is emptied or sent. Forward it to the other participants.
    async setTyping({ conversationId, isTyping }) {
      setSent((entries) =>
        [`setTyping("${conversationId}", ${String(isTyping)})`, ...entries].slice(0, 3),
      );
    },
  }));
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" role="status">
        {sent.length ? `Sent to the backend: ${sent.join(' · ')}` : 'Start typing in the composer.'}
      </Typography>
      <ChatBox
        adapter={adapter}
        members={[you, sam]}
        currentUser={you}
        initialConversations={conversations}
        initialActiveConversationId="rig"
        features={{ typingSignal: true }}
        sx={{ height: 280 }}
      />
    </Stack>
  );
}
