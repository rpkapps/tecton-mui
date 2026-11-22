import * as React from 'react';
import Alert from '@tecton-mui/ui/Alert';
import Stack from '@tecton-mui/ui/Stack';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type { ChatAdapter, ChatError, ChatUser } from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };

// A backend that is down: every send fails.
const offlineAdapter: ChatAdapter = {
  async sendMessage() {
    throw new Error('Service unavailable (503).');
  },
};

export default function ErrorCallback() {
  const [error, setError] = React.useState<ChatError | null>(null);
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error.code}: {error.message}
        </Alert>
      ) : (
        <Alert severity="info">Send a message to see the error reported here.</Alert>
      )}
      <ChatBox
        adapter={offlineAdapter}
        currentUser={you}
        members={[you]}
        onError={setError}
        features={{ conversationHeader: false }}
        sx={{ height: 280 }}
      />
    </Stack>
  );
}
