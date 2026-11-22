import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const messages: ChatMessage[] = [
  {
    id: 'q',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'Summarise the night shift.' }],
  },
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [
      {
        type: 'text',
        text: 'Pump 3 tripped at 02:10 and was restarted at 06:40. No other alarms.',
      },
    ],
  },
];

const textOf = (message: ChatMessage | null) =>
  message?.parts.map((part) => (part.type === 'text' ? part.text : '')).join('') ?? '';

export default function MessageActions() {
  const [adapter] = React.useState(() => createEchoAdapter());
  const [feedback, setFeedback] = React.useState('No feedback yet.');
  // Actions only on the assistant's answers. The object is memoized so that the
  // message list does not re-render on every render of this component.
  const slotProps = React.useMemo<ChatBoxProps['slotProps']>(
    () => ({
      messageActions: ({ role }) =>
        role === 'assistant'
          ? {
              extraActions: [
                {
                  id: 'copy',
                  label: 'Copy answer',
                  icon: <Icon name="copy" size="small" />,
                  onClick: (_event, { message }) => {
                    void navigator.clipboard?.writeText(textOf(message));
                    setFeedback('Answer copied.');
                  },
                },
                {
                  id: 'good',
                  label: 'Good answer',
                  icon: <Icon name="thumbs-up" size="small" />,
                  onClick: () => setFeedback('Marked as a good answer.'),
                },
                {
                  id: 'bad',
                  label: 'Bad answer',
                  icon: <Icon name="thumbs-down" size="small" />,
                  onClick: () => setFeedback('Marked as a bad answer.'),
                },
              ],
            }
          : {},
    }),
    [],
  );
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <ChatBox
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        initialMessages={messages}
        slotProps={slotProps}
        features={{ conversationHeader: false }}
        sx={{ height: 360 }}
      />
      <Typography variant="body2" role="status">
        {feedback}
      </Typography>
    </Stack>
  );
}
