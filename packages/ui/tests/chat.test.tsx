import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ChatBox as UpstreamChatBox,
  ChatMessageContent as UpstreamChatMessageContent,
  chatBoxClasses as upstreamChatBoxClasses,
} from '@mui/x-chat';
import { useChat as upstreamUseChat } from '@mui/x-chat/headless';
import ChatBox, {
  ChatBox as ChatBoxNamed,
  chatBoxClasses,
  type ChatBoxProps,
} from '../src/ChatBox/index.js';
import { ChatMessageAvatar } from '../src/ChatMessage/index.js';
import ChatComposer from '../src/ChatComposer/index.js';
import ChatMessageList from '../src/ChatMessageList/index.js';
import {
  ChatProvider,
  createEchoAdapter,
  useChat,
  useChatVariant,
  type ChatAdapter,
  type ChatConversation,
  type ChatMessage,
  type ChatUser,
} from '../src/ChatHeadless/index.js';
import * as root from '../src/index.js';
import { ThemeProvider, createTheme, type ThemeOptions } from '../src/styles/index.js';
import { chatInitials } from '../src/styles/tecton/compatChat.js';
import { chatMarkdownStyleOverrides } from '../src/styles/tecton/compatChatMarkdown.js';
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
  it('re-exports MUI X Chat from subpaths and the root, with Tecton’s ChatBox', () => {
    // ChatBox adds `variant="assistant"`; the rest of @mui/x-chat/ChatBox passes through.
    expect(ChatBox).not.toBe(UpstreamChatBox);
    expect(ChatBoxNamed).toBe(ChatBox);
    expect(root.ChatBox).toBe(ChatBox);
    expect(chatBoxClasses).toBe(upstreamChatBoxClasses);
    expect(root.ChatMessageContent).toBe(UpstreamChatMessageContent);
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

  it('leaves compact content without a fill', () => {
    // Compact content has no bubble; the fill used to paint a tight box behind the text.
    const compact = overrides.bubble({ ownerState: { isOwnMessage: false, variant: 'compact' } });
    expect(compact['&&']).toBeUndefined();
    expect(compact['&& code, && pre']).toEqual({
      background: expect.stringContaining('--tecton-color-content-bg-active'),
    });
  });

  it('pads code blocks 8px, in messages too, with the language label in line', () => {
    // Chat's bubble set the padding of a code block's `pre` to 0 in every variant.
    for (const variant of ['default', 'compact']) {
      const bubble = overrides.bubble({ ownerState: { isOwnMessage: false, variant } });
      expect(bubble['&& .MuiChatCodeBlock-root pre']).toEqual({
        padding: expect.stringContaining('--tecton-space-100'),
      });
    }
    const codeBlock = theme.components?.MuiChatCodeBlock?.styleOverrides as Record<
      string,
      Record<string, string>
    >;
    expect(codeBlock.pre.padding).toContain('--tecton-space-100');
    expect(codeBlock.header.paddingInlineStart).toContain('--tecton-space-100');
  });

  it('styles Markdown tables only, not a Table component in a message', () => {
    const content = chatMarkdownStyleOverrides.content as Record<string, unknown>;
    expect(Object.keys(content)).toEqual(
      expect.arrayContaining([
        '& table:not(.MuiTable-root)',
        '& :is(th, td):not(.MuiTableCell-root)',
        '& th:not(.MuiTableCell-root)',
      ]),
    );
    expect(content).not.toHaveProperty('& table');
    expect(content).not.toHaveProperty('& th, & td');
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

describe('ChatBox variant="assistant"', () => {
  // MUI types the theme's variant as its own variants, so a theme default needs a cast.
  const assistantTheme = {
    components: { MuiChatBox: { defaultProps: { variant: 'assistant' } } },
  } as unknown as ThemeOptions;
  function renderChat(props: Partial<ChatBoxProps> = {}, themeOptions?: ThemeOptions) {
    return render(
      <ThemeProvider themeOptions={themeOptions}>
        <ChatBox
          adapter={createEchoAdapter({ delayMs: 0 })}
          members={[you, assistant]}
          currentUser={you}
          initialMessages={messages}
          features={{ conversationHeader: false }}
          sx={{ height: 400 }}
          {...props}
        />
      </ThemeProvider>,
    );
  }
  const bubble = (container: HTMLElement, id: string) =>
    container.querySelector<HTMLElement>(`[data-message-id="${id}"] .MuiChatMessage-bubble`)!;
  const avatarCount = (container: HTMLElement) =>
    container.querySelectorAll('.MuiChatMessage-root .MuiAvatar-root').length;

  it('keeps every message in a bubble by default', () => {
    const { container } = renderChat();
    expect(getComputedStyle(bubble(container, 'm2')).paddingTop).toBe('8px');
    expect(bubble(container, 'm2').style.alignSelf).toBe('');
    expect(avatarCount(container)).toBe(2);
  });

  it('lays the answer out without a bubble, across the row, and keeps the user’s bubble', () => {
    const { container } = renderChat({ variant: 'assistant' });
    const answer = bubble(container, 'm2');
    const question = bubble(container, 'm1');
    // The answer is drawn as compact content (no padding), stretched to the row.
    expect(getComputedStyle(answer).paddingTop).toBe('0px');
    expect(answer.style.alignSelf).toBe('stretch');
    expect(answer.style.position).toBe('relative');
    // Only the answer is full width: the user's bubble stays a bubble, at most 70% of the row.
    expect(getComputedStyle(question).paddingTop).toBe('8px');
    expect(question.style.alignSelf).toBe('');
    expect(question.style.maxWidth).toBe('70%');
    expect(answer.style.maxWidth).toBe('');
    // No avatars (and no space reserved for them) and no author names, as in AI assistants.
    expect(avatarCount(container)).toBe(0);
    for (const row of container.querySelectorAll('.MuiChatMessage-root')) {
      expect(row).toHaveClass('MuiChatMessage-noAvatar');
    }
    expect(screen.queryByText('Assistant')).toBeNull();
    expect(screen.queryByText('You')).toBeNull();
    // Each message is still named after its author.
    expect(screen.getByRole('article', { name: /Assistant/ })).toContainElement(answer);
    expect(screen.getByRole('article', { name: /You/ })).toContainElement(question);
  });

  it('applies from the theme default too, and leaves the other variants to MUI', () => {
    const fromTheme = renderChat({}, assistantTheme);
    expect(bubble(fromTheme.container, 'm2').style.alignSelf).toBe('stretch');
    expect(avatarCount(fromTheme.container)).toBe(0);
    fromTheme.unmount();
    const compact = renderChat({ variant: 'compact' });
    expect(bubble(compact.container, 'm2').style.alignSelf).toBe('');
    expect(avatarCount(compact.container)).toBe(2);
  });

  it('shows the time on the user’s messages only', () => {
    const timed = messages.map((message) => ({ ...message, createdAt: '2026-11-18T09:12:00Z' }));
    const { container } = renderChat({ variant: 'assistant', initialMessages: timed });
    const answer = container.querySelector('[data-message-id="m2"]')!;
    const question = bubble(container, 'm1');
    expect(question.querySelector('.MuiChatMessage-inlineMeta')).not.toBeNull();
    for (const meta of ['inlineMeta', 'inlineMetaSpacer', 'meta']) {
      expect(answer.querySelector(`.MuiChatMessage-${meta}`)).toBeNull();
    }
  });

  it('is MUI’s default variant inside the chat', () => {
    function Variant() {
      return <output aria-label="variant">{useChatVariant()}</output>;
    }
    renderChat({ variant: 'assistant', children: <Variant /> });
    expect(screen.getByLabelText('variant')).toHaveTextContent('default');
  });

  it('lets the consumer’s slots and slot props apply', () => {
    const { container } = renderChat({
      variant: 'assistant',
      // An explicit `undefined` brings back Chat's default author name.
      slots: { messageAvatar: ChatMessageAvatar, messageAuthorName: undefined },
      slotProps: {
        messageContent: { slotProps: { bubble: { style: { outlineStyle: 'dashed' } } } },
        messageAuthorName: (ownerState) => ({
          'data-testid': `author-${ownerState.authorRole}`,
        }),
      },
    });
    expect(avatarCount(container)).toBe(2);
    const answer = bubble(container, 'm2');
    expect(answer.style.alignSelf).toBe('stretch');
    expect(answer.style.outlineStyle).toBe('dashed');
    // Shown again, the assistant's name starts at the row's padding, where the answer starts.
    expect(screen.getByTestId('author-assistant')).toHaveTextContent('Assistant');
    expect(screen.getByTestId('author-assistant').getAttribute('style')).toContain(
      `padding-inline-start: ${createTheme().spacing(2)}`,
    );
    expect(screen.getByTestId('author-user')).not.toHaveAttribute('style');
  });

  it('shows the dots before an answer starts without a bubble', async () => {
    const user = userEvent.setup();
    const { container } = renderChat({
      variant: 'assistant',
      adapter: createEchoAdapter({ delayMs: 300, respond: (text) => `Echo: ${text}` }),
    });
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Pressure?{Enter}');
    await waitFor(() =>
      expect(container.querySelector('.MuiChatStreamingIndicator-root')).not.toBeNull(),
    );
    // Chat's own waiting row, which draws the dots in a bubble, is replaced.
    expect(container.querySelector('.MuiChatStreamingIndicator-row')).toBeNull();
    expect(container.querySelector('.MuiChatStreamingIndicator-bubble')).toBeNull();
    expect(await screen.findByText('Echo: Pressure?')).toBeInTheDocument();
  });
});
