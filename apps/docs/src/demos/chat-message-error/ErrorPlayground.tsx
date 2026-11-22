import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ChatBox, { type ChatBoxProps } from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter, type ChatAdapter, type ChatUser } from '@tecton-mui/ui/ChatHeadless';
import {
  Playground,
  jsxElement,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

type Failure = 'first attempt' | 'every attempt' | 'never';

function createAdapter(failure: Failure, errorText: string): ChatAdapter {
  const echo = createEchoAdapter({ delayMs: 200, respond: (text) => `Delivered: "${text}".` });
  const attempted = new Set<string>();
  return {
    ...echo,
    async sendMessage(input) {
      const first = !attempted.has(input.message.id);
      attempted.add(input.message.id);
      if (failure === 'every attempt' || (failure === 'first attempt' && first)) {
        throw new Error(errorText || 'Unable to send the message.');
      }
      return echo.sendMessage(input);
    },
  };
}

const controls: PlaygroundControl[] = [
  {
    name: 'failure',
    label: 'sendMessage fails',
    kind: 'enum',
    options: ['first attempt', 'every attempt', 'never'],
    defaultValue: 'first attempt',
  },
  {
    name: 'errorText',
    label: 'error message',
    kind: 'text',
    defaultValue: 'The field server did not answer.',
  },
  {
    name: 'showError',
    label: 'messageError slot',
    kind: 'boolean',
    defaultValue: true,
    help: 'Off: slots.messageError = null, no error under the message.',
  },
];

const noError: ChatBoxProps['slots'] = { messageError: null };

function Preview({ values }: { values: PlaygroundValues }) {
  const failure = values.failure as Failure;
  const errorText = String(values.errorText);
  // A new backend (and thread) when the failure mode or text changes.
  const adapter = React.useMemo(() => createAdapter(failure, errorText), [failure, errorText]);
  return (
    <Box sx={{ width: '100%', height: 360 }}>
      <ChatBox
        key={`${failure}|${errorText}`}
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        suggestions={['Send the pressure log']}
        suggestionsAutoSubmit
        slots={values.showError ? undefined : noError}
        features={{ conversationHeader: false }}
        sx={{ height: '100%' }}
      />
    </Box>
  );
}

function code(values: PlaygroundValues) {
  return jsxElement('ChatBox', {
    adapter: raw('adapter'),
    currentUser: raw('currentUser'),
    slots: values.showError ? undefined : raw('{ messageError: null }'),
    onError: raw('(error) => reportError(error)'),
  });
}

export default function ErrorPlayground() {
  return (
    <Playground
      title="Send errors"
      description="Choose when the backend fails, then send the suggestion. A failed message shows the error and a Retry button."
      controls={controls}
      render={(values) => <Preview values={values} />}
      code={code}
      minHeight={360}
      panel="below"
    />
  );
}
