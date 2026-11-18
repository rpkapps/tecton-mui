// Syntax-highlighting theme shared by the build-time (MDX fences, demo sources) and the runtime
// fallback highlighter. Every color is a CSS variable (`--docs-code-*`, defined in
// `src/styles/docs.css` from Tecton tokens), so one theme follows Tecton's light/dark mode through
// the `data-theme` attribute without re-highlighting.
import type { ThemeRegistration } from 'shiki/core';

const v = (name: string) => `var(--docs-code-${name})`;

export const CODE_THEME_NAME = 'tecton-docs';

export const tectonCodeTheme: ThemeRegistration = {
  name: CODE_THEME_NAME,
  type: 'light',
  fg: v('fg'),
  bg: v('bg'),
  colors: { 'editor.foreground': v('fg'), 'editor.background': v('bg') },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.quoted.docstring'],
      settings: { foreground: v('comment'), fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'keyword.operator.type',
        'variable.language',
      ],
      settings: { foreground: v('keyword') },
    },
    {
      scope: ['keyword.operator', 'punctuation', 'meta.brace', 'punctuation.definition.tag'],
      settings: { foreground: v('punctuation') },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
        'markup.inline.raw',
      ],
      settings: { foreground: v('string') },
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character',
        'constant.other',
        'support.constant',
        'keyword.other.unit',
      ],
      settings: { foreground: v('constant') },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'],
      settings: { foreground: v('function') },
    },
    { scope: ['entity.name.tag'], settings: { foreground: v('tag') } },
    {
      scope: ['support.class.component', 'entity.name.tag.custom'],
      settings: { foreground: v('component') },
    },
    {
      scope: [
        'entity.other.attribute-name',
        'support.type.property-name',
        'meta.object-literal.key',
        'variable.other.property',
        'variable.other.object.property',
      ],
      settings: { foreground: v('attribute') },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.other.inherited-class',
        'support.type',
        'support.class',
        'entity.name.namespace',
      ],
      settings: { foreground: v('type') },
    },
    {
      scope: ['meta.template.expression', 'variable.parameter', 'variable.other.readwrite'],
      settings: { foreground: v('fg') },
    },
    { scope: ['markup.inserted'], settings: { foreground: v('string') } },
    { scope: ['markup.deleted'], settings: { foreground: v('keyword') } },
  ],
};

/** Languages the portal highlights, and the fence names that map to them. */
export const CODE_LANGUAGES = ['tsx', 'typescript', 'bash', 'css', 'json'] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

const ALIASES: Record<string, CodeLanguage> = {
  tsx: 'tsx',
  jsx: 'tsx',
  js: 'tsx',
  javascript: 'tsx',
  mjs: 'tsx',
  ts: 'typescript',
  typescript: 'typescript',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  shellscript: 'bash',
  zsh: 'bash',
  console: 'bash',
  css: 'css',
  json: 'json',
  jsonc: 'json',
};

/** Resolves a fence/label language to a supported grammar, or `null` for plain text. */
export function resolveLanguage(language: string | undefined): CodeLanguage | null {
  return language ? (ALIASES[language.toLowerCase()] ?? null) : null;
}

/** Short label shown in a code block's toolbar. */
export function languageLabel(language: string | undefined): string {
  if (!language) return 'text';
  const l = language.toLowerCase();
  if (l === 'typescript') return 'ts';
  if (l === 'shellscript' || l === 'shell' || l === 'sh' || l === 'zsh') return 'bash';
  return l;
}

/** Extracts the line markup inside Shiki's `<pre><code>…</code></pre>` output. */
export function innerCodeHtml(html: string): string {
  const start = html.indexOf('<code>');
  const end = html.lastIndexOf('</code>');
  return start === -1 || end === -1 ? html : html.slice(start + '<code>'.length, end);
}

/** Small stable hash (FNV-1a) used to match prerendered code blocks on the client. */
export function codeKey(code: string, language: string | undefined): string {
  const text = `${language ?? ''}\n${code}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
