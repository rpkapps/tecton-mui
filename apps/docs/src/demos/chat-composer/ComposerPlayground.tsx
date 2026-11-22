import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import Typography from '@tecton-mui/ui/Typography';
import ChatComposer, {
  ChatComposerAttachButton,
  ChatComposerAttachmentList,
  ChatComposerHelperText,
  ChatComposerSendButton,
  ChatComposerTextArea,
  ChatComposerToolbar,
} from '@tecton-mui/ui/ChatComposer';
import {
  ChatProvider,
  createEchoAdapter,
  useChat,
  type ChatUser,
  type ChatVariant,
} from '@tecton-mui/ui/ChatHeadless';
import {
  Playground,
  jsxElement,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };

const controls: PlaygroundControl[] = [
  { name: 'variant', kind: 'enum', options: ['default', 'compact'], defaultValue: 'default' },
  { name: 'disabled', kind: 'boolean', defaultValue: false },
  {
    name: 'attachments',
    kind: 'boolean',
    defaultValue: true,
    help: 'The attach button and file list.',
  },
  { name: 'placeholder', kind: 'text', defaultValue: 'Ask about a well' },
  {
    name: 'helperText',
    label: 'helper text',
    kind: 'text',
    defaultValue: 'Enter sends, Shift+Enter adds a line.',
  },
];

function LastSent() {
  const { messages } = useChat();
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const text = last?.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
  return (
    <Typography variant="body2" color="text.secondary" role="status" sx={{ mb: 1 }}>
      {text ? `Sent: "${text}"` : 'Nothing sent yet.'}
    </Typography>
  );
}

function Preview({ values }: { values: PlaygroundValues }) {
  const [adapter] = React.useState(() => createEchoAdapter({ delayMs: 0 }));
  return (
    <ChatProvider adapter={adapter} currentUser={you} members={[you]}>
      <Box sx={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <LastSent />
        {/* The composer is built from its parts, so every part can be configured. */}
        <ChatComposer
          variant={values.variant as ChatVariant}
          disabled={Boolean(values.disabled)}
          features={{ attachments: Boolean(values.attachments) }}
          sx={{ m: 0 }}
        >
          {values.attachments ? <ChatComposerAttachmentList /> : null}
          <ChatComposerTextArea placeholder={String(values.placeholder)} />
          {values.helperText ? (
            <ChatComposerHelperText>{String(values.helperText)}</ChatComposerHelperText>
          ) : null}
          <ChatComposerToolbar>
            {values.attachments ? (
              <ChatComposerAttachButton aria-label="Attach a file">
                <Icon name="attach-file" />
              </ChatComposerAttachButton>
            ) : null}
            <ChatComposerSendButton aria-label="Send">
              <Icon name="arrow-up" />
            </ChatComposerSendButton>
          </ChatComposerToolbar>
        </ChatComposer>
      </Box>
    </ChatProvider>
  );
}

function code(values: PlaygroundValues) {
  const parts = [
    values.attachments ? '<ChatComposerAttachmentList />' : null,
    jsxElement('ChatComposerTextArea', { placeholder: String(values.placeholder) }),
    values.helperText
      ? `<ChatComposerHelperText>${String(values.helperText)}</ChatComposerHelperText>`
      : null,
    [
      '<ChatComposerToolbar>',
      values.attachments
        ? '  <ChatComposerAttachButton aria-label="Attach a file">\n    <Icon name="attach-file" />\n  </ChatComposerAttachButton>'
        : null,
      '  <ChatComposerSendButton aria-label="Send">\n    <Icon name="arrow-up" />\n  </ChatComposerSendButton>',
      '</ChatComposerToolbar>',
    ]
      .filter(Boolean)
      .join('\n'),
  ].filter(Boolean);
  return jsxElement(
    'ChatComposer',
    {
      variant: values.variant === 'default' ? undefined : values.variant,
      disabled: values.disabled ? true : undefined,
      features: values.attachments ? undefined : raw('{ attachments: false }'),
    },
    parts.join('\n'),
  );
}

export default function ComposerPlayground() {
  return (
    <Playground
      title="ChatComposer"
      description="A composer assembled from its parts inside a ChatProvider. Type and press Enter to send."
      controls={controls}
      render={(values) => <Preview values={values} />}
      code={code}
      minHeight={240}
    />
  );
}
