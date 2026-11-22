import * as React from 'react';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

// A picture for the assistant (any image URL works); people without one get their initials.
const rigPicture = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#2f5d7c"/><path d="M20 7 12 33h4l1.5-5h5L24 33h4L20 7Zm-1.6 17L20 18l1.6 6h-3.2Z" fill="#fff"/></svg>',
)}`;

const assistant: ChatUser = {
  id: 'assistant',
  displayName: 'Rig assistant',
  role: 'assistant',
  avatarUrl: rigPicture,
};
const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };

const say = (id: string, author: ChatUser, text: string): ChatMessage => ({
  id,
  role: author.role ?? 'user',
  author,
  parts: [{ type: 'text', text }],
});
const messages: ChatMessage[] = [
  say('1', sam, 'Morning. The rig move starts at 10:00.'),
  say('2', you, 'Thanks, I will be on site at 09:30.'),
  say('3', assistant, 'Wind forecast for 10:00: 18 knots, within crane limits.'),
];

// Module-level constant: a stable `slots` object.
const noAvatars: ChatBoxProps['slots'] = { messageAvatar: null };

export default function Avatars() {
  const [adapter] = React.useState(() => createEchoAdapter());
  const [showAvatars, setShowAvatars] = React.useState(true);
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <FormControlLabel
        control={
          <Switch
            checked={showAvatars}
            onChange={(event) => setShowAvatars(event.target.checked)}
          />
        }
        label="Show avatars"
      />
      <ChatBox
        adapter={adapter}
        members={[you, sam, assistant]}
        currentUser={you}
        initialMessages={messages}
        slots={showAvatars ? undefined : noAvatars}
        features={{ conversationHeader: false }}
        sx={{ height: 340 }}
      />
    </Stack>
  );
}
