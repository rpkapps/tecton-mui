// Build-time syntax highlighting (Shiki) for the portal. Used by vite.config.ts only, so Shiki and
// its grammars never reach the browser bundles for these code paths:
//   - `rehypeHighlightCode`: MDX/Markdown code fences -> highlighted markup in `data-html`, which the
//     MDX `pre` mapping hands to <CodeBlock html=…>.
//   - `docsHighlight()` Vite plugin: `import source from './Demo.tsx?highlight'` (or
//     `import.meta.glob(…, { query: '?highlight' })`) returns `{ code, html, language }` for any
//     source file, so demo source is highlighted in the prerendered HTML.
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { createHighlighter, type Highlighter } from 'shiki';
import type { Plugin } from 'vite';
import {
  CODE_LANGUAGES,
  CODE_THEME_NAME,
  innerCodeHtml,
  resolveLanguage,
  tectonCodeTheme,
} from '../src/lib/highlight/theme.ts';

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: [tectonCodeTheme], langs: [...CODE_LANGUAGES] });
  return highlighter;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Highlighted line markup (the content of `<code>`), or escaped plain lines for unknown languages. */
export async function highlightToHtml(code: string, language: string | undefined) {
  const text = code.replace(/\n+$/, '');
  const lang = resolveLanguage(language);
  if (!lang) {
    return text
      .split('\n')
      .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
      .join('\n');
  }
  const hl = await getHighlighter();
  return innerCodeHtml(hl.codeToHtml(text, { lang, theme: CODE_THEME_NAME }));
}

// Minimal hast shapes (avoids a dependency on @types/hast).
interface HastText {
  type: 'text';
  value: string;
}
interface HastElement {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}
type HastNode = HastText | HastElement | { type: string; children?: HastNode[] };

const textContent = (node: HastNode): string =>
  node.type === 'text'
    ? (node as HastText).value
    : 'children' in node && node.children
      ? node.children.map(textContent).join('')
      : '';

/** Rehype plugin: highlights fenced code blocks at build time. */
export function rehypeHighlightCode() {
  return async (tree: HastNode) => {
    const jobs: Promise<void>[] = [];
    const visit = (node: HastNode) => {
      if (node.type === 'element' && (node as HastElement).tagName === 'pre') {
        const pre = node as HastElement;
        const code = pre.children.find(
          (c): c is HastElement => c.type === 'element' && (c as HastElement).tagName === 'code',
        );
        if (code) {
          const classes = code.properties?.className;
          const list = Array.isArray(classes) ? classes.map(String) : [];
          const language = list.find((c) => c.startsWith('language-'))?.slice('language-'.length);
          const raw = textContent(code);
          jobs.push(
            highlightToHtml(raw, language).then((html) => {
              pre.properties = { ...pre.properties, dataHtml: html, dataLanguage: language ?? '' };
            }),
          );
        }
        return;
      }
      if ('children' in node && node.children) node.children.forEach(visit);
    };
    visit(tree);
    await Promise.all(jobs);
  };
}

const QUERY = '?highlight';
const PREFIX = '\0docs-highlight:';

/** Vite plugin: `<file>?highlight` -> `export default { code, html, language }`. */
export function docsHighlight(): Plugin {
  return {
    name: 'docs-highlight',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith(QUERY)) return null;
      const resolved = await this.resolve(source.slice(0, -QUERY.length), importer, {
        skipSelf: true,
      });
      return resolved ? PREFIX + resolved.id : null;
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const file = id.slice(PREFIX.length);
      this.addWatchFile(file);
      const code = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n').replace(/\n+$/, '\n');
      const language = extname(file).slice(1);
      const html = await highlightToHtml(code, language);
      return `export default ${JSON.stringify({ code, html, language })};`;
    },
  };
}
