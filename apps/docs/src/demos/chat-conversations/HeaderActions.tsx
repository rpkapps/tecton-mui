import * as React from 'react';
import IconButton from '@tecton-mui/ui/IconButton';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Tooltip from '@tecton-mui/ui/Tooltip';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  useChat,
  type ChatConversation,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };

const initial: ChatConversation[] = [
  { id: 'rig', title: 'Rig move', subtitle: 'Sam Weber' },
  { id: 'shift', title: 'Shift handover', subtitle: 'Operations desk' },
  { id: 'logs', title: 'Log review', subtitle: 'Geology team' },
].map((conversation) => ({ ...conversation, participants: [you] }));

interface Flags {
  pinned?: boolean;
  muted?: boolean;
}
const flagsOf = (conversation: ChatConversation | undefined) =>
  (conversation?.metadata ?? {}) as Flags;

// The `conversationHeaderActions` slot: buttons on the trailing side of the header. It renders
// inside the chat, so it reads the open conversation with `useChat()`.
const ActionsContext = React.createContext<(id: string, flag: keyof Flags) => void>(() => {});

function HeaderActions() {
  const { activeConversationId, conversations } = useChat();
  const toggle = React.useContext(ActionsContext);
  const flags = flagsOf(conversations.find((c) => c.id === activeConversationId));
  if (!activeConversationId) return null;
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title={flags.pinned ? 'Unpin' : 'Pin to the top'}>
        <IconButton
          size="small"
          aria-label={flags.pinned ? 'Unpin' : 'Pin to the top'}
          aria-pressed={Boolean(flags.pinned)}
          onClick={() => toggle(activeConversationId, 'pinned')}
        >
          <Icon name={flags.pinned ? 'unpin' : 'pin'} />
        </IconButton>
      </Tooltip>
      <Tooltip title={flags.muted ? 'Unmute' : 'Mute notifications'}>
        <IconButton
          size="small"
          aria-label={flags.muted ? 'Unmute' : 'Mute notifications'}
          aria-pressed={Boolean(flags.muted)}
          onClick={() => toggle(activeConversationId, 'muted')}
        >
          <Icon name="notifications" variant={flags.muted ? 'filled' : 'outline'} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

const slots: ChatBoxProps['slots'] = { conversationHeaderActions: HeaderActions };

export default function HeaderActionsDemo() {
  const [adapter] = React.useState(() => createEchoAdapter());
  // The application owns the conversations, so header actions can change them.
  const [conversations, setConversations] = React.useState(initial);
  const toggle = React.useCallback((id: string, flag: keyof Flags) => {
    setConversations((current) =>
      current
        .map((c) => {
          if (c.id !== id) return c;
          const flags = { ...flagsOf(c), [flag]: !flagsOf(c)[flag] };
          return {
            ...c,
            metadata: flags,
            subtitle: `${initial.find((i) => i.id === id)!.subtitle}${flags.muted ? ' · muted' : ''}`,
          };
        })
        // Pinned conversations first.
        .sort((a, b) => Number(Boolean(flagsOf(b).pinned)) - Number(Boolean(flagsOf(a).pinned))),
    );
  }, []);
  return (
    <ActionsContext.Provider value={toggle}>
      <ChatBox
        adapter={adapter}
        currentUser={you}
        members={[you]}
        conversations={conversations}
        onConversationsChange={setConversations}
        initialActiveConversationId="rig"
        features={{ conversationList: true }}
        slots={slots}
        layoutMode="standard"
        sx={{ height: 340, width: '100%' }}
      />
    </ActionsContext.Provider>
  );
}
