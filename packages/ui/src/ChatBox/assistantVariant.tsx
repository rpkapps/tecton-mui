'use client';
// The `variant="assistant"` look of ChatBox, as in AI assistants such as Claude or Copilot: the
// assistant answers across the full width of the thread, without a bubble, and the other messages
// keep narrower bubbles. MUI X Chat has no such variant: ChatBox renders MUI's default variant with
// these slots. It is built only from Chat's public slots and context; nothing here restyles Chat's
// own elements by class name.
//
// - Content: Chat already draws message content without a bubble, in its compact variant. The
//   assistant's content is rendered as compact content (the message context it reads says
//   `variant: 'compact'`), stretched to the width of the row. The rest of the row (meta, error,
//   actions) keeps the default layout, and the Tecton compat theme styles the content like other
//   compact content.
// - Avatars and author names: hidden, as in AI assistants (a conversation with one assistant needs
//   neither). `messageAvatar: null` also drops the space Chat reserves for avatars on both sides,
//   so the answer starts where the user's bubble ends. Each message stays an `article` named after
//   its author.
// - Times: only in the user's bubbles; the answers have none, as in AI assistants.
// - Streaming indicator: while an answer has not started, Chat shows the dots in a bubble of their
//   own. They sit where the answer will start instead.
// - Author name, when a consumer shows it again: Chat insets the name above a group by a column gap
//   past the message edge, which lines it up inside a bubble. The assistant's name starts where its
//   answer starts instead.
import * as React from 'react';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ChatBoxSlotProps, ChatBoxSlots } from '@mui/x-chat/ChatBox';
import {
  ChatStreamingIndicator,
  type ChatStreamingIndicatorProps,
} from '@mui/x-chat/ChatIndicators';
import {
  ChatMessageContent,
  ChatMessageInlineMeta,
  type ChatMessageContentProps,
  type ChatMessageInlineMetaProps,
} from '@mui/x-chat/ChatMessage';
import {
  MessageContextProvider,
  useChatDensity,
  useMessageContext,
  type ChatDensity,
  type MessageGroupOwnerState,
} from '@mui/x-chat/headless';

type BubbleSlotProps = NonNullable<ChatMessageContentProps['slotProps']>['bubble'];
type BubbleProps = Exclude<BubbleSlotProps, ((...args: never[]) => unknown) | undefined>;

// Inline styles, so they also hold for a consumer's own `bubble` slot element; the consumer's
// `style` still wins.
// - The answer: compact content shrinks to fit its text; a full-width answer takes the row, so
//   tables and custom parts can use the width. `position: relative`, as on a bubble, anchors an
//   inline timestamp if a consumer brings Chat's back (`slots.messageInlineMeta`).
// - Every other message keeps its bubble, at most 70% of the row: only the answer is full width.
//   (Without avatars, Chat would let a long message's bubble fill the row too.)
const answerStyle: React.CSSProperties = { alignSelf: 'stretch', position: 'relative' };
const bubbleStyle: React.CSSProperties = { maxWidth: '70%' };

/** Adds `style` to the consumer's `bubble` slot props, in either form. */
function withBubbleStyle(consumer: BubbleSlotProps, style: React.CSSProperties): BubbleSlotProps {
  const merge = (props: BubbleProps | null | undefined): BubbleProps => ({
    ...props,
    style: { ...style, ...props?.style },
  });
  if (typeof consumer === 'function') {
    return (ownerState) => merge(consumer(ownerState) as BubbleProps);
  }
  return merge(consumer);
}

/** Message content: the assistant's without a bubble, everyone else's in a narrower bubble. */
const AssistantMessageContent = React.forwardRef<HTMLDivElement, ChatMessageContentProps>(
  function AssistantMessageContent(props, ref) {
    const context = useMessageContext();
    const compactContext = React.useMemo(
      () => ({ ...context, variant: 'compact' as const }),
      [context],
    );
    const isAnswer = context.role === 'assistant';
    const content = (
      <ChatMessageContent
        ref={ref}
        {...props}
        slotProps={{
          ...props.slotProps,
          bubble: withBubbleStyle(props.slotProps?.bubble, isAnswer ? answerStyle : bubbleStyle),
        }}
      />
    );
    return isAnswer ? (
      <MessageContextProvider value={compactContext}>{content}</MessageContextProvider>
    ) : (
      content
    );
  },
);

/** The time and status: in the user's bubbles only, as in AI assistants; answers have none. */
function AssistantInlineMeta(props: ChatMessageInlineMetaProps) {
  const { role } = useMessageContext();
  return role === 'assistant' ? null : <ChatMessageInlineMeta {...props} />;
}

// The space Chat gives the waiting row: margin above and below by density, and the row's inline
// padding (spacing 2), which is also where the answer's text starts. The dots are centred on the
// first line of text (20px line, 14px dots).
const waitingSpacing: Record<ChatDensity, number> = { compact: 0.25, standard: 1, comfortable: 2 };
const waitingSx =
  (density: ChatDensity) =>
  (theme: Theme): CSSObject => ({
    display: 'flex',
    width: 'fit-content',
    marginInline: theme.spacing(2),
    marginBlock: theme.spacing(waitingSpacing[density]),
    paddingBlock: '3px',
  });

/** The streaming indicator: inside the answer as usual, and without a bubble while waiting. */
const AssistantStreamingIndicator = React.forwardRef<HTMLDivElement, ChatStreamingIndicatorProps>(
  function AssistantStreamingIndicator(props, ref) {
    const density = useChatDensity();
    // `message` is the streaming answer inside a message, and `null` on the waiting row.
    if (props.message !== null) {
      return <ChatStreamingIndicator ref={ref} {...props} />;
    }
    const { sx } = props;
    return (
      <ChatStreamingIndicator
        ref={ref}
        {...props}
        sx={[waitingSx(density), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);

/**
 * The slots `variant="assistant"` sets; the consumer's own `slots` take precedence (an
 * explicit `undefined` brings back Chat's default).
 */
export const assistantVariantSlots = {
  messageAvatar: null,
  messageAuthorName: null,
  messageContent: AssistantMessageContent,
  messageInlineMeta: AssistantInlineMeta,
  streamingIndicator: AssistantStreamingIndicator,
} satisfies Partial<ChatBoxSlots>;

type AuthorNameSlotProps = ChatBoxSlotProps['messageAuthorName'];
type AuthorNameProps = Exclude<AuthorNameSlotProps, ((...args: never[]) => unknown) | undefined>;

/**
 * The slot props `variant="assistant"` adds to the consumer's `slotProps`: the assistant's
 * author name starts at `inset`, the inline padding of a message row, where its answer starts.
 * The consumer's own `messageAuthorName` props (object or callback) still apply on top.
 */
export function assistantVariantSlotProps(
  slotProps: ChatBoxSlotProps | undefined,
  inset: string,
): ChatBoxSlotProps {
  const consumer = slotProps?.messageAuthorName;
  return {
    ...slotProps,
    messageAuthorName: (ownerState: MessageGroupOwnerState) => {
      const props = (typeof consumer === 'function' ? consumer(ownerState) : consumer) as
        AuthorNameProps | undefined;
      if (ownerState.authorRole !== 'assistant') {
        return props ?? {};
      }
      return { ...props, style: { paddingInlineStart: inset, ...props?.style } };
    },
  };
}
