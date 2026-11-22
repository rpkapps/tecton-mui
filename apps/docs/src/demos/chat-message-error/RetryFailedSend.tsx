import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatAdapter, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

// A backend that drops the first attempt of every message, like a flaky field connection.
function createFlakyAdapter(): ChatAdapter {
  const echo = createEchoAdapter({ respond: (text) => `Received on the second try: "${text}".` });
  const attempted = new Set<string>();
  return {
    ...echo,
    async sendMessage(input) {
      if (!attempted.has(input.message.id)) {
        attempted.add(input.message.id);
        throw new Error('The field server did not answer.');
      }
      return echo.sendMessage(input);
    },
  };
}

export default function RetryFailedSend() {
  const [adapter] = React.useState(createFlakyAdapter);
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      suggestions={['Send the pressure log']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 360, width: '100%' }}
    />
  );
}
