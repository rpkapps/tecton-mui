import * as React from 'react';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const suggestions = [
  'Summarise the last shift',
  { value: 'List the wells above the pressure limit', label: 'Wells over the limit' },
  'Show open maintenance tickets',
];

export default function Suggestions() {
  const [adapter] = React.useState(() => createEchoAdapter());
  return (
    <ChatBox
      adapter={adapter}
      members={[you, assistant]}
      currentUser={you}
      suggestions={suggestions}
      features={{ conversationHeader: false }}
      sx={{ height: 360, width: '100%' }}
    />
  );
}
