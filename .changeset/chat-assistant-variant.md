---
'@tecton-mui/ui': minor
---

`ChatBox` takes `variant="assistant"`, the layout of AI assistants such as Claude or Copilot: the
assistant's answers have no bubble and span the full width of the thread, and only the other
messages are in bubbles, at most 70% of the thread's width, and only they show the time. There are
no avatars or author names (set `slots.messageAvatar` or `slots.messageAuthorName` to show them;
the assistant's name then lines up with its answer), and the dots shown before an answer starts sit
where it will begin. Your own `slots` and `slotProps` still apply.

The `assistant` variant is a Tecton addition to MUI's `default` and `compact` (`ChatBoxVariant`).
ChatBox draws it as MUI's `default` variant with its own slots, so `useChatVariant()` reports
`default` inside the chat, and the theme's `MuiChatBox.defaultProps.variant` stays typed as MUI's
variants: set `variant="assistant"` on the component.

`ChatBox` is now a Tecton module built on the MUI X ChatBox (`@tecton-mui/ui/ChatBox` and the root
export); its other props, classes and types are unchanged.

Fixes in the chat theme:

- Code blocks in messages had no padding (the code touched the border); they now have 8px, and the
  language label lines up with the code. Code blocks on their own use 8px too (MUI: 12px).
- The Markdown table styles no longer restyle a `Table` component that a custom message part draws.
- In the compact variant, other people's messages no longer get a tight filled box behind the text.
