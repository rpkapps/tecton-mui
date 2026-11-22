import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import ChatConfirmation from '@tecton-mui/ui/ChatConfirmation';
import {
  createEchoAdapter,
  useChat,
  type ChatMessage,
  type ChatPartRendererMap,
  type ChatPartRendererProps,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

interface ConfirmData {
  question: string;
  action: string;
}

const messages: ChatMessage[] = [
  {
    id: 'q',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'Close the choke on Alpha-7.' }],
  },
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [
      { type: 'text', text: 'This stops the flow from Alpha-7.' },
      // A custom data part: the assistant asks before it acts.
      {
        type: 'data-confirm',
        data: { question: 'Close the choke on Alpha-7 now?', action: 'Close the choke' },
      },
    ],
  },
];

// Renders `data-confirm` parts. The answer is sent as the user's next message.
function ConfirmPart({ part }: ChatPartRendererProps) {
  const { sendMessage } = useChat();
  const [answered, setAnswered] = React.useState(false);
  const data = (part as { data: ConfirmData }).data;
  if (answered) return null;
  const answer = (text: string) => {
    setAnswered(true);
    void sendMessage({ parts: [{ type: 'text', text }] });
  };
  return (
    <ChatConfirmation
      message={data.question}
      confirmLabel={data.action}
      cancelLabel="Not now"
      onConfirm={() => answer(`Yes: ${data.action.toLowerCase()}.`)}
      onCancel={() => answer('No, leave it open.')}
    />
  );
}
// Module-level constant: renderers keep a stable identity.
const partRenderers: ChatPartRendererMap = {
  'data-confirm': (props) => <ConfirmPart {...props} />,
};

export default function ConfirmationInMessage() {
  const [adapter] = React.useState(() =>
    createEchoAdapter({ respond: (text) => `Noted: "${text}"` }),
  );
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={messages}
      partRenderers={partRenderers}
      features={{ conversationHeader: false }}
      sx={{ height: 420, width: '100%' }}
    />
  );
}
