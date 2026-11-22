'use client';
// ChatBox: the MUI X ChatBox with a third variant, `variant="assistant"`. MUI X Chat draws every
// message in a bubble (`default`) or none at all (`compact`); AI assistants such as Claude or
// Copilot answer across the full width of the thread instead, with only the user's messages in
// bubbles and no names or avatars. MUI has no such variant, so ChatBox renders MUI's `default`
// variant with the slots of assistantVariant.tsx. Every other variant passes through unchanged.
//
// The `variant` values extend MUI's (`ChatVariant`), against the rule to keep MUI value types
// (AGENTS.md section 4): a separate prop was the alternative, and `variant` was chosen as the more
// discoverable API. Inside the chat, `useChatVariant()` reports `default` for this variant, and
// MUI types `MuiChatBox.defaultProps.variant` as `ChatVariant`, so the theme cannot set it
// without a cast (it still works at runtime).
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { ChatBox as MuiChatBox, type ChatBoxProps as MuiChatBoxProps } from '@mui/x-chat/ChatBox';
import type { ChatVariant } from '@mui/x-chat/headless';
import { assistantVariantSlotProps, assistantVariantSlots } from './assistantVariant.js';

/** The ChatBox variants: MUI's `default` and `compact`, and Tecton's `assistant`. */
export type ChatBoxVariant = ChatVariant | 'assistant';

export interface ChatBoxProps<Cursor = string> extends Omit<MuiChatBoxProps<Cursor>, 'variant'> {
  /**
   * The look of the thread:
   * - `'default'`: every message in a bubble, with avatars and author names (MUI).
   * - `'compact'`: no bubbles or avatars, the author and time above each group (MUI).
   * - `'assistant'`: as in AI assistants such as Claude or Copilot. The assistant's answers have
   *   no bubble and span the full width of the thread; the other messages keep their bubbles, at
   *   most 70% of the thread's width, and only they show the time. No avatars or author names:
   *   set `slots.messageAvatar` or `slots.messageAuthorName` to show them (`undefined` gives
   *   Chat's default). A Tecton variant, built on MUI's `default`.
   * @default 'default'
   */
  variant?: ChatBoxVariant;
}

type ChatBoxComponent = (<Cursor = string>(
  props: ChatBoxProps<Cursor> & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { displayName?: string };

function ChatBoxWithVariant<Cursor = string>(
  props: ChatBoxProps<Cursor>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const theme = useTheme();
  // The variant can also come from the theme (`MuiChatBox.defaultProps.variant`).
  const themeVariant = theme.components?.MuiChatBox?.defaultProps?.variant as
    ChatBoxVariant | undefined;
  const isAssistant = (props.variant ?? themeVariant) === 'assistant';
  const { slots, slotProps } = props;
  const resolvedSlots = React.useMemo(
    () => (isAssistant ? { ...assistantVariantSlots, ...slots } : slots),
    [isAssistant, slots],
  );
  // A message row's inline padding in Chat: where the assistant's answer starts.
  const rowInset = theme.spacing(2);
  const resolvedSlotProps = React.useMemo(
    () => (isAssistant ? assistantVariantSlotProps(slotProps, rowInset) : slotProps),
    [isAssistant, slotProps, rowInset],
  );
  // MUI only knows its own variants: `assistant` is MUI's `default` with the slots above.
  const variant = isAssistant ? 'default' : (props.variant as ChatVariant | undefined);
  return (
    <MuiChatBox<Cursor>
      ref={ref}
      {...props}
      variant={variant}
      slots={resolvedSlots}
      slotProps={resolvedSlotProps}
    />
  );
}

/**
 * The MUI X ChatBox (a complete chat: thread, composer and conversation list) with Tecton's
 * `variant="assistant"`: the assistant's answers span the full width of the thread without a
 * bubble, as in AI assistants such as Claude or Copilot.
 *
 * Demos: [Chat](/components/chat), [AI and Agents](/components/chat-ai-agents)
 */
const ChatBox = React.forwardRef(ChatBoxWithVariant) as ChatBoxComponent;
ChatBox.displayName = 'ChatBox';

export { ChatBox };
export default ChatBox;
