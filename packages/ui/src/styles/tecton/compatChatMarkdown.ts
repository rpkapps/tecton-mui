// Layout of a message's body: its parts and its Markdown (part of the compat layer, see compat.ts
// and compatChat.ts). Chat stacks the parts of a message in plain block flow and spaces them
// unevenly: reasoning and tool rows had 4px, a paragraph after them 0px, and file and source chips
// none at all, so a chip touched the text above it and the chip beside it. Every part now gets the
// same space-100 above it. Its Markdown is styled
// little: tables had no borders and 1px cells, quotes only the browser's 40px indent, lists no
// spacing and task lists the browser's bullets. Text keeps the bubble's colour (so contrast stays
// what the bubble gives); lines are drawn in that colour at reduced strength, so they suit both
// other people's bubbles and your own on the primary colour.
import type { CSSObject } from '@mui/material/styles';
import { cssVar } from './generated/core/index.js';

const line = (percent: number) =>
  `${cssVar('border-width-100')} solid color-mix(in srgb, currentColor ${percent}%, transparent)`;

// Direct children of the bubble: paragraphs, lists, tables, code blocks, reasoning and tool rows,
// file and source chips. The inline timestamp is a child too and keeps its own place.
const part = '& .MuiChatMessage-bubble > :not([class*="inlineMeta"])';
const chip = '[class*="MuiChatMessage-fileRoot"], [class*="MuiChatMessage-sourceUrlRoot"]';

const body: CSSObject = {
  // One rhythm between parts: space-100 above every part but the first, nothing below.
  [part]: { marginBottom: 0 },
  [`${part}:not(:first-child)`]: { marginTop: cssVar('space-100') },
  // A heading starts a new section: more room above it.
  [`${part}:is(h1, h2, h3, h4, h5, h6):not(:first-child)`]: { marginTop: cssVar('space-150') },
  // File and source chips line up in a row below the text, with a gap between them; a chip that
  // wraps to the next line keeps the same rhythm.
  [`& .MuiChatMessage-bubble > :is(${chip})`]: {
    marginInlineEnd: cssVar('space-100'),
    verticalAlign: 'middle',
  },

  // Markdown.
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: `${cssVar('space-150')} 0 0`,
    fontSize: '1em',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  '& h1, & h2': { fontSize: '1.125em' },
  '& :is(h1, h2, h3, h4, h5, h6):first-child': { marginTop: 0 },
  '& ul, & ol': { paddingInlineStart: cssVar('space-300') },
  '& li + li': { marginTop: cssVar('space-25') },
  // Task lists (`- [x] done`): no bullet, the checkbox in its place.
  '& li:has(> input[type="checkbox"])': {
    listStyle: 'none',
    marginInlineStart: `calc(-1 * ${cssVar('space-200')})`,
  },
  '& input[type="checkbox"]': {
    accentColor: 'currentColor',
    margin: 0,
    marginInlineEnd: cssVar('space-75'),
    verticalAlign: 'middle',
  },
  '& blockquote': {
    marginInline: 0,
    paddingInlineStart: cssVar('space-150'),
    borderInlineStart: `${cssVar('border-width-200')} solid color-mix(in srgb, currentColor 45%, transparent)`,
  },
  // Wide tables scroll inside the bubble instead of stretching it.
  '& table': {
    display: 'block',
    maxWidth: '100%',
    overflowX: 'auto',
    borderCollapse: 'collapse',
  },
  '& th, & td': {
    padding: `${cssVar('space-50')} ${cssVar('space-150')} ${cssVar('space-50')} 0`,
    borderBottom: line(25),
    textAlign: 'start',
  },
  '& th': { fontWeight: 600, borderBottom: line(55) },
  '& hr': { border: 0, borderTop: line(30), marginInline: 0 },
};

/** Style overrides for `MuiChatMessage`, merged with the other Chat corrections in compat.ts. */
export const chatMarkdownStyleOverrides = {
  content: body,
  // The "Tool called" / "Tool result" rows inside an open tool call: Chat draws their chevron as a
  // 5px rotated square right before the label, and its 4px gap read as none ("›Tool called").
  toolSectionSummary: { '&::before': { marginInlineEnd: cssVar('space-50') } },
};
