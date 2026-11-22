// Theme corrections for MUI X Chat (alpha). Tecton 0.11.2 has no chat styles, and the Chat
// components hard-code colors that assume Material's default blue palette. Part of the documented
// compat layer (see compat.ts). Only the theme is used: nothing here imports `@mui/x-chat`, so the
// theme stays small for applications that do not use Chat.
import * as React from 'react';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import { cssVar } from './generated/core/index.js';
import {
  iconAddOutline,
  iconArrowDownOutline,
  iconArrowLeftOutline,
  iconArrowUpOutline,
  iconAttachFileOutline,
  iconCancelCircleOutline,
  iconChatOutline,
  iconCheckCircleOutline,
  iconCheckOutline,
  iconCloseOutline,
  iconCodeOutline,
  iconCopyOutline,
  iconMemoryBrainOutline,
  iconMenuOutline,
  iconMoreVertOutline,
  iconOpenInNewOutline,
  iconSettingsOutline,
  iconWarningOutline,
} from './generated/iconUrls.js';

interface ChatOwnerState {
  ownerState?: { isOwnMessage?: boolean };
}

// Tecton's keyboard focus ring (`theme.focusVisible` in compat.ts): 2px focus-ring colour after a
// 1px gap. Chat draws its own rings in `primary.main` with a 2px gap; Tecton's primary is the same
// colour as the filled send button, so the ring of a focused send button was invisible against it.
const focusRing = {
  '&:focus-visible': {
    outline: `${cssVar('border-width-200')} solid ${cssVar('color-focus-ring')}`,
    outlineOffset: '1px',
  },
};
// Inside a scrolling list an outer ring is clipped: draw it inside the element.
const insetFocusRing = {
  '&:focus-visible': {
    outline: `${cssVar('border-width-200')} solid ${cssVar('color-focus-ring')}`,
    outlineOffset: `calc(-1 * ${cssVar('border-width-200')})`,
  },
};
const mono = { fontFamily: cssVar('font-family-mono') };

// Avatars. Chat draws an avatar as an empty grey disc unless the author has an `avatarUrl`: no
// initials, no fallback icon. The avatar slots render the Tecton `Avatar` instead: the picture when
// there is one, otherwise the initials of the name in Tecton's colour for that name, otherwise
// Tecton's person icon. The author's name is already the message's accessible name, so the avatar is
// decorative (`aria-hidden`).
interface ChatPerson {
  displayName?: string;
  avatarUrl?: string;
  role?: string;
}
/** Up to two initials: "Field assistant" -> "FA". */
export function chatInitials(name: string | undefined): string | undefined {
  const letters = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]!.toUpperCase())
    .join('');
  return letters || undefined;
}
function tectonAvatar(
  person: ChatPerson | undefined,
  name: string | undefined,
  props: Record<string, unknown>,
  ref: React.ForwardedRef<HTMLDivElement>,
  sx: object,
) {
  return React.createElement(
    Avatar,
    { ...props, ref, src: person?.avatarUrl, alt: '', 'aria-hidden': true, sx },
    chatInitials(name),
  );
}

interface MessageAvatarSlotProps {
  ownerState?: { resolvedAuthor?: ChatPerson | null; variant?: string };
  children?: React.ReactNode;
}
// Keeps the grid placement and size of Chat's own message avatar.
const messageAvatarSx = (compact: boolean) => (theme: Theme) => ({
  gridArea: 'avatar',
  width: 'var(--MuiChatMessage-avatarSize, 36px)',
  height: 'var(--MuiChatMessage-avatarSize, 36px)',
  alignSelf: 'flex-start',
  flexShrink: 0,
  fontSize: theme.typography.caption.fontSize,
  ...(compact ? { gridRow: '1 / 3', marginTop: theme.spacing(0.25) } : null),
});
const ChatMessageAvatarSlot = React.forwardRef<HTMLDivElement, MessageAvatarSlotProps>(
  function ChatMessageAvatarSlot({ ownerState, children: _image, ...props }, ref) {
    const author = ownerState?.resolvedAuthor ?? undefined;
    return tectonAvatar(
      author,
      author?.displayName,
      props,
      ref,
      messageAvatarSx(ownerState?.variant === 'compact'),
    );
  },
);

interface ConversationAvatarSlotProps {
  conversation?: ChatPerson & { title?: string; participants?: ChatPerson[] };
  selected?: boolean;
  unread?: boolean;
  focused?: boolean;
  ownerState?: unknown;
}
const conversationAvatarSx = { width: 40, height: 40, flexShrink: 0 };
const ChatConversationAvatarSlot = React.forwardRef<HTMLDivElement, ConversationAvatarSlotProps>(
  function ChatConversationAvatarSlot(
    { conversation, selected: _s, unread: _u, focused: _f, ownerState: _o, ...props },
    ref,
  ) {
    // The same person Chat shows: the first participant who is not the local user.
    const participant =
      conversation?.participants?.find((p) => p.role !== 'user') ?? conversation?.participants?.[0];
    const picture = { avatarUrl: conversation?.avatarUrl ?? participant?.avatarUrl };
    return tectonAvatar(
      picture,
      conversation?.title ?? participant?.displayName,
      props,
      ref,
      conversationAvatarSx,
    );
  },
);

// Tecton icons. Chat draws its icons as inline SVGs (Material glyphs, or its own) with no slot the
// theme could fill, so each SVG is recognised by its shape and repainted: its own shapes are hidden
// and its box is filled with the text colour through the Tecton glyph's mask, the way the Tecton
// icon classes draw. Size, colour, `aria-hidden` and position stay the SVG's own. The streaming
// spinner is a progress arc, not an icon, and is left as it is. The e2e test fails when an
// upgrade brings an SVG that no rule below matches.
function glyph(url: string, extra?: object) {
  return {
    backgroundColor: 'currentColor',
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    '& > *': { display: 'none' },
    ...extra,
  };
}
/** An inline SVG whose first shape is a path starting with `prefix`. */
const svgPath = (prefix: string) => `& svg:has(> path[d^="${prefix}"])`;

// Upstream shapes (`@mui/x-chat` 9.0.0-alpha.22) -> Tecton glyphs.
const sendIcon = { [svgPath('M2.01 21L23 12')]: glyph(iconArrowUpOutline) }; // Tecton has no send glyph
const attachIcon = { [svgPath('M16.5 6v11.5')]: glyph(iconAttachFileOutline) };
const closeIcon = { [svgPath('M19 6.41L17.59 5')]: glyph(iconCloseOutline) };
const fileIcons = {
  [svgPath('M14 2H6c-1.1 0-1.99')]: glyph(iconAttachFileOutline), // attachment chip
  [svgPath('M6 2h8l4 4v16H6V2Z')]: glyph(iconAttachFileOutline), // file part of a message
};
const copyIcons = {
  [svgPath('M16 1H4c-1.1')]: glyph(iconCopyOutline),
  [svgPath('M9 16.2 4.8 12')]: glyph(iconCheckOutline), // copied (also "sent")
  [svgPath('M9 16.17L4.83 12')]: glyph(iconCheckOutline),
};
const messageIcons = {
  ...copyIcons,
  ...fileIcons,
  [svgPath('m18 7-1.41-1.41')]: glyph(iconCheckCircleOutline), // "read": Tecton has no double check
  [svgPath('M14.7 6.3a4')]: glyph(iconCodeOutline), // tool call
  [svgPath('M12 5a3 3 0 0 0-5.5')]: glyph(iconMemoryBrainOutline), // reasoning
  '& svg:has(> polyline[points="4 12 10 18 20 6"])': glyph(iconCheckCircleOutline), // tool done
  '& svg:has(> line)': glyph(iconCancelCircleOutline), // tool failed
  [svgPath('M10.3 3.9')]: glyph(iconWarningOutline), // tool needs attention
  [svgPath('M14 3h7v7h-2V6.41')]: glyph(iconOpenInNewOutline), // source link
};
const chatBoxIcons = {
  ...closeIcon, // conversation drawer
  [svgPath('M20 11H7.83')]: glyph(iconArrowLeftOutline, {
    '[dir="rtl"] &': { transform: 'scaleX(-1)' },
  }), // back to the conversation list
  [svgPath('M3 18h18v-2H3v2z')]: glyph(iconMenuOutline),
  [svgPath('M21 15a2 2 0 0 1-2 2H7l-4 4V5')]: glyph(iconChatOutline), // empty state
  [svgPath('M14 2H6c-1.1 0-2 .9-2 2v16')]: glyph(iconAddOutline), // new chat
  [svgPath('M19.14 12.94')]: glyph(iconSettingsOutline),
};

// Colours. Tecton's theme defines primary, secondary, the status colours, text, background and
// divider, but not `palette.grey`, `palette.common` or the `palette.action` states, so everything
// Chat draws with those (and its `alpha()` / `rgba()` tints) is mapped to Tecton tokens here.
// Text pairs were checked against WCAG 1.4.3 in both modes (the lowest pair is noted).
const token = (name: string) => cssVar(name);
const hoverBg = token('color-content-bg-hover'); // was action.hover
const selectedBg = token('color-content-bg-active'); // was action.selected
const otherBubbleBg = token('color-component-input-filled-background'); // was grey[100] / grey[800]
// Links on bubbles, sources and code: primary.main is ~2:1 on dark bubbles; the Tecton text-button
// colour is >= 5.37:1 (light, on the filled bubble) and >= 7.47:1 (dark).
const linkColor = token('color-action-tertiary-text');
const disabled = {
  backgroundColor: token('color-disabled-filled-bg'),
  color: token('color-disabled-filled-text'),
  // Tecton's disabled tokens already read as disabled; MUI's 0.38 opacity would fade them twice.
  opacity: 1,
};

// The bubble and timestamp rules repeat Chat's dark-mode rules, which are nested selectors that
// would otherwise win: `&&` keeps the correction one class more specific in both modes.
export const chatCompatOverrides = {
  MuiChatBox: {
    styleOverrides: {
      root: {
        ...chatBoxIcons,
        // The header's back, menu and drawer close buttons: default-colour icon buttons, which
        // Tecton leaves on MUI's black at 54%. Buttons with a `color` prop keep theirs.
        '& .MuiIconButton-root:not([class*="MuiIconButton-color"])': {
          color: token('color-text-secondary'),
        },
      },
      // Was action.disabled (a black/white alpha); a decorative icon in Tecton's subtlest text.
      emptyStateIcon: { color: token('color-text-subtlest') },
      // Was text.disabled (2.2:1).
      emptyStateHelper: { color: token('color-text-secondary') },
      // Was action.disabledBackground.
      conversationOverlayBackdrop: { backgroundColor: token('color-backdrop-fill') },
    },
  },
  MuiChatMessageList: { styleOverrides: { root: messageIcons } },
  MuiChatMessageAvatar: { defaultProps: { slots: { avatar: ChatMessageAvatarSlot } } },
  MuiChatMessage: {
    styleOverrides: {
      root: insetFocusRing,
      bubble: ({ ownerState }: ChatOwnerState & { ownerState?: { variant?: string } }) => ({
        // Code in messages uses Tecton's monospace font, not the browser default.
        '& code, & pre': mono,
        '& button': focusRing,
        // Inline code and code blocks: Chat tints them with action.hover, or with white at 15% on
        // own messages. Other people's bubbles: Tecton's paper colour, a step away from the bubble
        // in both modes (text-primary on it >= 14:1). Own bubbles have no Tecton "on primary"
        // surface, so the code keeps the bubble colour inside a Tecton divider outline. Compact
        // messages have no bubble: the selected-content fill.
        '&& code, && pre': ownerState?.isOwnMessage
          ? {
              background: 'transparent',
              boxShadow: `inset 0 0 0 ${token('border-width-100')} ${token('color-divider')}`,
            }
          : {
              background:
                (ownerState as { variant?: string } | undefined)?.variant === 'compact'
                  ? selectedBg
                  : token('color-bg-paper'),
            },
        '&& pre code, && .MuiChatCodeBlock-root code, && .MuiChatCodeBlock-root pre': {
          background: 'none',
          boxShadow: 'none',
        },
        // Links in Markdown and source links: Tecton's text-button colour (see linkColor). On own
        // messages, the bubble's text colour, underlined.
        '&& a': ownerState?.isOwnMessage
          ? { color: 'inherit', textDecoration: 'underline' }
          : { color: linkColor },
        // Agent steps (`step-start` parts): Chat renders an empty, unstyled separator, so the
        // rounds of a run were not told apart. Draw Tecton's subtle divider; none before the first.
        '& [role="separator"]': {
          borderTop: `${cssVar('border-width-100')} solid ${cssVar('color-divider-subtle')}`,
          margin: `${cssVar('space-100')} 0`,
        },
        '& [role="separator"]:first-child': { display: 'none' },
        // Other people's and the assistant's messages: Chat uses Material's `grey[100]` /
        // `grey[800]`, on which Tecton's secondary text fails contrast in dark mode. Use Tecton's
        // filled container fill. Own messages keep `primary.main`.
        ...(ownerState?.isOwnMessage ? null : { '&&': { backgroundColor: otherBubbleBg } }),
      }),
      // Small text Chat draws in text.disabled (2.2:1) or primary.main (2.2:1 on dark surfaces):
      // dates, times, the compact author name. Tecton secondary text is >= 5.84:1 on every chat
      // surface; the author name keeps a brand tone with the text-button colour.
      dateDivider: { '&&': { color: token('color-text-secondary') } },
      dateDividerLabel: { '&&': { color: token('color-text-secondary') } },
      meta: { '&&': { color: token('color-text-secondary') } },
      groupTimestamp: { '&&': { color: token('color-text-secondary') } },
      groupAuthorName: { '&&': { color: linkColor } },
      sourceUrlLink: { '&&': { color: linkColor } },
      // Tool status icons: Tecton status colours instead of palette[*].main.
      toolState: ({ ownerState }: { ownerState?: { state?: string } }) => {
        const status: Record<string, string> = {
          'input-streaming': 'warning',
          'approval-requested': 'warning',
          'output-available': 'success',
          'output-error': 'error',
          'output-denied': 'error',
          'input-available': 'info',
          'approval-responded': 'info',
        };
        const name = status[ownerState?.state ?? ''];
        return { '&&': { color: token(name ? `color-status-${name}` : 'color-text-secondary') } };
      },
      // Tool rows: the copy button of a tool section and the Deny button hovered with action.hover.
      toolSectionContent: { '& button:hover': { backgroundColor: hoverBg } },
      toolDenyButton: { '&&:hover': { backgroundColor: hoverBg } },
      // Chat draws the timestamp in white or black at 45-65% opacity, chosen for Material's blue
      // primary. On Tecton's bubbles that fell to 1.97:1-4.27:1 (WCAG 1.4.3). Use the bubble's own
      // text colours instead: primary.contrastText on own messages, secondary text otherwise.
      inlineMeta: ({ ownerState, theme }: ChatOwnerState & { theme: Theme }) => ({
        '&&': {
          color: ownerState?.isOwnMessage
            ? theme.palette.primary.contrastText
            : cssVar('color-text-secondary'),
        },
      }),
    },
  },
  MuiChatCodeBlock: {
    styleOverrides: {
      root: copyIcons,
      // Was action.hover; the label (text-secondary) stays >= 6.10:1 on it.
      header: { backgroundColor: hoverBg },
      languageLabel: mono,
      pre: mono,
      code: mono,
      copyButton: { ...focusRing, '&:hover': { backgroundColor: selectedBg } },
    },
  },
  MuiChatComposer: {
    styleOverrides: {
      root: {
        ...sendIcon,
        ...attachIcon,
        ...closeIcon,
        ...fileIcons,
        // Borders like a Tecton outlined input: divider -> input border, primary.main focus ->
        // the input focus border (both variants).
        '&&': { borderColor: token('color-input-outlined-border') },
        '&&:hover': { borderColor: token('color-input-outlined-border-hover') },
        '&&:focus-within:not([data-disabled])': {
          borderColor: token('color-input-outlined-border-focus'),
          boxShadow: `0 0 0 ${token('border-width-100')} ${token('color-input-outlined-border-focus')}`,
        },
        // Was action.disabledBackground at 0.38 opacity.
        '&&[data-disabled]': {
          backgroundColor: token('color-disabled-outline-bg'),
          borderColor: token('color-disabled-outline-border'),
          opacity: 1,
        },
      },
      sendButton: { ...focusRing, '&:disabled': disabled },
      attachButton: {
        ...focusRing,
        '&:hover': { backgroundColor: hoverBg },
        '&:disabled': { color: token('color-disabled-text-only-adornment') },
      },
      attachmentRemoveButton: {
        color: token('color-text-secondary'),
        '&:hover': { backgroundColor: hoverBg },
      },
      attachmentFileIcon: { color: token('color-text-secondary') },
      // Was text.disabled for the placeholder and the disabled text.
      textArea: {
        '&::placeholder': { color: token('color-text-placeholder'), opacity: 1 },
        '&:disabled': { color: token('color-disabled-outline-text') },
      },
    },
  },
  MuiChatStreamingIndicator: {
    // The bubble that holds the dots while an answer starts: was grey[100] / grey[800].
    styleOverrides: { bubble: { '&&': { backgroundColor: otherBubbleBg } } },
  },
  MuiChatMessageError: {
    styleOverrides: {
      // Was error.main on an 8% / 16% error tint. Tecton's outlined error status: text >= 5.05:1
      // on the dark filled bubble.
      root: {
        '&&': {
          color: token('color-status-error-outline-text'),
          borderColor: token('color-status-error-outline-border'),
          backgroundColor: token('color-status-error-outline-bg'),
        },
      },
    },
  },
  MuiChatMessageSkeleton: {
    styleOverrides: {
      // The shimmer: was action.hover / action.selected.
      line: {
        background: `linear-gradient(90deg, ${hoverBg} 25%, ${selectedBg} 37%, ${hoverBg} 63%)`,
        backgroundSize: '400% 100%',
      },
    },
  },
  MuiChatMessageSource: {
    styleOverrides: {
      // The number badge was text.disabled (below 4.5:1); the link was primary.main.
      index: { color: token('color-text-secondary') },
      link: { color: linkColor },
    },
  },
  MuiChatUnreadMarker: {
    // Was text-secondary on action.selected; Tecton's active surface keeps it >= 5.84:1.
    styleOverrides: { label: { backgroundColor: token('color-surface-base-bg-active') } },
  },
  MuiChatScrollToBottomAffordance: {
    styleOverrides: {
      root: {
        [svgPath('M20 12l-1.41-1.41')]: glyph(iconArrowDownOutline),
        // Was MUI's default icon-button colour (black at 54%), which Tecton leaves unset.
        '&&': { color: token('color-text-secondary') },
      },
    },
  },
  MuiChatConversationList: {
    // The conversation list is a `listbox` without an accessible name (WCAG 4.1.2); only the
    // navigation landmark around it is labelled. Name it like that landmark's default en-US label.
    // Localized apps override it with `slotProps.conversationList['aria-label']` or in the theme.
    defaultProps: {
      'aria-label': 'Conversations',
      slots: { itemAvatar: ChatConversationAvatarSlot },
    },
    styleOverrides: {
      // Item actions: Tecton's vertical "more" glyph on its side (Tecton has no horizontal one).
      root: {
        '& svg:has(> circle[cx="6"])': glyph(iconMoreVertOutline, { transform: 'rotate(90deg)' }),
      },
      // Was action.hover / action.selected.
      item: {
        ...insetFocusRing,
        '&&:hover': { backgroundColor: hoverBg },
        '&&.MuiChatConversationList-itemSelected': { backgroundColor: selectedBg },
      },
      // Was text.disabled (2.2:1).
      itemTimestamp: { '&&': { color: token('color-text-secondary') } },
    },
  },
  MuiChatSuggestions: {
    styleOverrides: { item: { ...focusRing, '&:hover': { backgroundColor: hoverBg } } },
  },
  MuiChatConfirmation: {
    styleOverrides: {
      root: {
        [svgPath('M1 21h22L12 2')]: glyph(iconWarningOutline),
        // Chat gives the confirmation no margin, so in a message it touched the text before and
        // after it. Space it like a paragraph inside a bubble.
        '.MuiChatMessage-bubble &': { marginBlock: cssVar('space-150') },
        '.MuiChatMessage-bubble &:first-child': { marginBlockStart: 0 },
      },
      confirmButton: focusRing,
      cancelButton: { ...focusRing, '&:hover': { backgroundColor: hoverBg } },
    },
  },
} as Record<string, object> as NonNullable<ThemeOptions['components']>;
