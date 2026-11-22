import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBox as UpstreamChatBox } from '@mui/x-chat';
import { useChat as upstreamUseChat } from '@mui/x-chat/headless';
import ChatBox, { ChatBox as ChatBoxNamed } from '../src/ChatBox/index.js';
import ChatComposer from '../src/ChatComposer/index.js';
import ChatMessageList from '../src/ChatMessageList/index.js';
import {
  ChatProvider,
  createEchoAdapter,
  useChat,
  type ChatAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '../src/ChatHeadless/index.js';
import * as root from '../src/index.js';
import { ThemeProvider, createTheme } from '../src/styles/index.js';
import { chatInitials } from '../src/styles/tecton/compatChat.js';
import {
  iconArrowUpOutline,
  iconAttachFileOutline,
} from '../src/styles/tecton/generated/iconUrls.js';

const you: ChatUser = { id: 'you', displayName: 'You', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Assistant', role: 'assistant' };
const messages: ChatMessage[] = [
  { id: 'm1', role: 'user', author: you, parts: [{ type: 'text', text: 'Status of pump 3?' }] },
  { id: 'm2', role: 'assistant', author: assistant, parts: [{ type: 'text', text: 'Running.' }] },
];

describe('Chat exports', () => {
  it('re-exports MUI X Chat unchanged from subpaths and the root', () => {
    expect(ChatBox).toBe(UpstreamChatBox);
    expect(ChatBoxNamed).toBe(UpstreamChatBox);
    expect(root.ChatBox).toBe(UpstreamChatBox);
    expect(useChat).toBe(upstreamUseChat);
    // The headless runtime is also in the root barrel, except names the components own.
    expect(root.useChat).toBe(upstreamUseChat);
    expect(root.createEchoAdapter).toBe(createEchoAdapter);
    expect(root.ChatMessage).not.toBe(undefined);
  });

  it('types the MuiChat* theme keys in createTheme', () => {
    const theme = createTheme({
      components: {
        MuiChatBox: { defaultProps: { variant: 'compact' } },
        MuiChatMessage: { styleOverrides: { bubble: { borderRadius: 0 } } },
      },
    });
    expect(theme.components?.MuiChatBox?.defaultProps?.variant).toBe('compact');
    // Consumer overrides merge with the Tecton corrections instead of replacing the component key.
    expect(theme.components?.MuiChatMessage?.styleOverrides).toHaveProperty('inlineMeta');
  });
});

describe('Chat theme corrections', () => {
  const theme = createTheme();
  type Resolver = (props: object) => Record<string, Record<string, unknown>>;
  const overrides = theme.components?.MuiChatMessage?.styleOverrides as unknown as Record<
    string,
    Resolver
  >;

  it('draws timestamps in the bubble text colours', () => {
    const own = overrides.inlineMeta({ ownerState: { isOwnMessage: true }, theme });
    const other = overrides.inlineMeta({ ownerState: { isOwnMessage: false }, theme });
    expect(own['&&'].color).toBe(theme.palette.primary.contrastText);
    expect(other['&&'].color).toContain('--tecton-color-text-secondary');
  });

  it('gives other people’s bubbles a Tecton fill and keeps own bubbles on primary', () => {
    const own = overrides.bubble({ ownerState: { isOwnMessage: true }, theme });
    const other = overrides.bubble({ ownerState: { isOwnMessage: false }, theme });
    expect(own['&&']).toBeUndefined();
    expect(other['&&'].backgroundColor).toContain(
      '--tecton-color-component-input-filled-background',
    );
    expect(own['& code, & pre']).toEqual({
      fontFamily: expect.stringContaining('font-family-mono'),
    });
  });

  it('uses the Tecton focus ring on the composer buttons', () => {
    const composer = theme.components?.MuiChatComposer?.styleOverrides as Record<
      string,
      Record<string, Record<string, string>>
    >;
    expect(composer.sendButton['&:focus-visible'].outline).toContain('--tecton-color-focus-ring');
    expect(composer.attachButton['&:focus-visible'].outline).toContain('--tecton-color-focus-ring');
  });

  it('paints the composer icons with Tecton glyphs', () => {
    const root = (
      theme.components?.MuiChatComposer?.styleOverrides as Record<
        string,
        Record<string, Record<string, unknown>>
      >
    ).root;
    // The send icon (upstream paper plane) becomes Tecton's up arrow, drawn through a mask.
    const send = root['& svg:has(> path[d^="M2.01 21L23 12"])'];
    expect(send.maskImage).toBe(iconArrowUpOutline);
    expect(send.backgroundColor).toBe('currentColor');
    expect(send['& > *']).toEqual({ display: 'none' });
    expect(root['& svg:has(> path[d^="M16.5 6v11.5"])'].maskImage).toBe(iconAttachFileOutline);
  });
});

describe('Chat avatars', () => {
  it('makes up to two initials from a name', () => {
    expect(chatInitials('Field assistant')).toBe('FA');
    expect(chatInitials('  dana  ortiz  weber ')).toBe('DO');
    expect(chatInitials('Sam')).toBe('S');
    expect(chatInitials('')).toBeUndefined();
    expect(chatInitials(undefined)).toBeUndefined();
  });

  it('shows Tecton avatars with initials for messages and conversations', async () => {
    const sam: ChatUser = { id: 'sam', displayName: 'Sam Weber', role: 'user' };
    const { container } = render(
      <ThemeProvider>
        <ChatBox
          adapter={createEchoAdapter({ delayMs: 0 })}
          currentUser={you}
          members={[you, sam]}
          initialConversations={[{ id: 'c', title: 'Rig move', participants: [you, sam] }]}
          initialActiveConversationId="c"
          initialMessages={[
            {
              id: 'm',
              conversationId: 'c',
              role: 'user',
              author: sam,
              parts: [{ type: 'text', text: 'Wind is picking up.' }],
            },
          ]}
          features={{ conversationList: true }}
          layoutMode="standard"
          sx={{ height: 400 }}
        />
      </ThemeProvider>,
    );
    await screen.findByText('Wind is picking up.');
    const avatars = Array.from(container.querySelectorAll('.MuiAvatar-root'));
    const texts = avatars.map((avatar) => avatar.textContent);
    // The message author and the conversation (its title) get their initials.
    expect(texts).toContain('SW');
    expect(texts).toContain('RM');
    // Decorative: the author is already the message's accessible name.
    for (const avatar of avatars) expect(avatar).toHaveAttribute('aria-hidden', 'true');
    // Chat's own (empty) avatar discs are gone.
    expect(container.querySelector('.MuiChatMessage-avatar:empty')).toBeNull();
  });
});

describe('ChatBox with the Tecton theme', () => {
  it('names the conversation list and switches conversations', async () => {
    const user = userEvent.setup();
    const conversations: ChatConversation[] = [
      { id: 'a', title: 'Shift handover' },
      { id: 'b', title: 'Log review' },
    ];
    const adapter: ChatAdapter = {
      ...createEchoAdapter({ delayMs: 0 }),
      listMessages: async ({ conversationId }) => ({
        messages: [
          {
            id: `${conversationId}-1`,
            conversationId,
            role: 'user',
            author: you,
            parts: [{ type: 'text', text: `History of ${conversationId}` }],
          },
        ],
      }),
    };
    render(
      <ThemeProvider>
        <ChatBox
          adapter={adapter}
          currentUser={you}
          initialConversations={conversations}
          initialActiveConversationId="a"
          features={{ conversationList: true }}
          layoutMode="standard"
          sx={{ height: 400 }}
        />
      </ThemeProvider>,
    );
    const list = screen.getByRole('listbox', { name: 'Conversations' });
    expect(list).toBeInTheDocument();
    expect(await screen.findByText('History of a')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Log review/ }));
    expect(await screen.findByText('History of b')).toBeInTheDocument();
  });

  it('sends a message and renders the streamed reply', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ChatBox
          adapter={createEchoAdapter({ delayMs: 0, respond: (text) => `Echo: ${text}` })}
          members={[you, assistant]}
          currentUser={you}
          initialMessages={messages}
          sx={{ height: 400 }}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('Running.')).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Message' });
    await user.type(input, 'Pressure?{Enter}');
    await waitFor(() => expect(screen.getByText('Echo: Pressure?')).toBeInTheDocument());
    expect(input).toHaveValue('');
  });

  it('composes the parts inside a ChatProvider', async () => {
    const user = userEvent.setup();
    function Count() {
      return <output aria-label="count">{useChat().messages.length}</output>;
    }
    render(
      <ThemeProvider>
        <ChatProvider
          adapter={createEchoAdapter({ delayMs: 0 })}
          members={[you, assistant]}
          currentUser={you}
          initialMessages={messages}
        >
          <Count />
          <ChatMessageList />
          <ChatComposer />
        </ChatProvider>
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('count')).toHaveTextContent('2');
    await user.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await waitFor(() => expect(screen.getByLabelText('count')).toHaveTextContent('4'));
  });
});
