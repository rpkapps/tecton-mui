---
'@tecton-mui/ui': minor
---

Add MUI X Chat (`@mui/x-chat` 9.0.0-alpha.22, MIT). `ChatBox` and its parts (`ChatMessageList`,
`ChatComposer`, `ChatConversation`, `ChatConversationList`, `ChatSuggestions`, `ChatMessage`,
`ChatCodeBlock` and the others) are passthrough exports at `@tecton-mui/ui/<Name>` and in the root
barrel. The headless runtime (`ChatProvider`, `useChat` and the other hooks, `createEchoAdapter`,
`createAiSdkAdapter`, the `ChatAdapter` and message types) is `@tecton-mui/ui/ChatHeadless`, the
counterpart of `@mui/x-chat/headless`. Import the `ChatMessage` and `ChatConversation` types from
there; the root names belong to the components.

The upstream Chat API is alpha and will change when the pin is upgraded.

The theme styles Chat for Tecton:

- Tecton icons for every icon the chat draws (send uses the up arrow; Tecton has no send icon).
- Tecton `Avatar`s for message authors and conversations: the picture, or the initials in
  Tecton's colour for that name (upstream showed an empty circle).
- Tecton's keyboard focus ring on buttons, messages and conversations.
- Every colour from a Tecton token: Chat's Material greys, hover/selected/disabled states and
  tints are replaced. Links, sources, dates, times and the compact author name use Tecton colours
  that meet 4.5:1 in both modes (they were 2.2:1 in places).
- IBM Plex Mono for code, a Tecton fill for other people's messages, and timestamps that meet
  4.5:1 contrast.
- A visible divider between the steps of an agent run, and spacing around a `ChatConfirmation`
  inside a message.
- Markdown in messages is laid out: tables get row lines and cell padding, quotes a side bar,
  lists and headings spacing, and task lists their checkboxes in place of bullets.
- The conversation list is named "Conversations". `MuiChat*` theme keys are typed in `createTheme`.
