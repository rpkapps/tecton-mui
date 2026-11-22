import * as React from 'react';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatMessage, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Feldassistent', role: 'assistant' };

const messages: ChatMessage[] = [
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [{ type: 'text', text: 'Guten Morgen. Wie kann ich helfen?' }],
  },
];

// Only the texts you pass change; the others keep their English defaults.
const localeText: ChatBoxProps['localeText'] = {
  composerInputPlaceholder: 'Nachricht schreiben',
  composerInputAriaLabel: 'Nachricht',
  composerSendButtonLabel: 'Senden',
  composerAttachButtonLabel: 'Datei anhängen',
  scrollToBottomLabel: 'Zum Ende scrollen',
  messageListLabel: 'Nachrichtenverlauf',
  retryButtonLabel: 'Erneut versuchen',
};

export default function Localization() {
  const [adapter] = React.useState(() =>
    createEchoAdapter({ respond: (text) => `Sie schrieben: "${text}"` }),
  );
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={messages}
      localeText={localeText}
      features={{ conversationHeader: false }}
      sx={{ height: 320, width: '100%' }}
    />
  );
}
