import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { ChatTypingIndicator } from '@tecton-mui/ui/ChatIndicators';
import {
  createEchoAdapter,
  type ChatAdapter,
  type ChatConversation,
  type ChatRealtimeEvent,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };
const conversations: ChatConversation[] = [
  { id: 'rig', title: 'Rig move', subtitle: 'Sam Weber', participants: [you, sam] },
];

const REPLIES = ['Crane is ready.', 'Wind is down to 12 knots.', 'Starting the move now.'];

// A backend that pushes events: in a real app they arrive over a WebSocket or server-sent events.
function createRealtimeBackend() {
  const listeners = new Set<(event: ChatRealtimeEvent) => void>();
  const emit = (event: ChatRealtimeEvent) => listeners.forEach((listener) => listener(event));
  const adapter: ChatAdapter = {
    ...createEchoAdapter({ respond: () => 'Delivered.' }),
    // Called when the chat mounts; the returned function ends the subscription.
    subscribe({ onEvent }) {
      const listener = (event: ChatRealtimeEvent) => onEvent(event);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return { adapter, emit };
}

export default function RealtimeUpdates() {
  const [backend] = React.useState(createRealtimeBackend);
  const [count, setCount] = React.useState(0);
  const typing = (isTyping: boolean) =>
    backend.emit({ type: 'typing', conversationId: 'rig', userId: 'sam', isTyping });
  const reply = () => {
    typing(false);
    backend.emit({
      type: 'message-added',
      message: {
        id: `sam-${count}`,
        conversationId: 'rig',
        role: 'user',
        author: sam,
        createdAt: new Date().toISOString(),
        parts: [{ type: 'text', text: REPLIES[count % REPLIES.length]! }],
      },
    });
    setCount((c) => c + 1);
  };
  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={() => typing(true)}>
          Sam starts typing
        </Button>
        <Button size="small" variant="outlined" onClick={() => typing(false)}>
          Sam stops typing
        </Button>
        <Button size="small" variant="contained" onClick={reply}>
          Sam sends a message
        </Button>
      </Stack>
      <ChatBox
        adapter={backend.adapter}
        members={[you, sam]}
        currentUser={you}
        initialConversations={conversations}
        initialActiveConversationId="rig"
        sx={{ height: 360 }}
      >
        {/* Shows who is typing in the open conversation; renders nothing otherwise. */}
        <ChatTypingIndicator />
      </ChatBox>
    </Stack>
  );
}
