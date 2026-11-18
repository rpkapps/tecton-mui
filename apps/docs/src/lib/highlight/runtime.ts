// Runtime fallback highlighter for code that only exists as a string at render time (code passed
// to <CodeBlock code=…> without pre-highlighted markup).
// This module is always loaded with a dynamic import: during the prerender it runs in Node, so the
// static HTML is highlighted; in the browser it is fetched only when a block has no prerendered
// markup (client-side navigation). Fine-grained bundle: core + JavaScript regex engine (no WASM);
// each grammar is fetched on first use.
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import {
  CODE_THEME_NAME,
  innerCodeHtml,
  resolveLanguage,
  tectonCodeTheme,
  type CodeLanguage,
} from './theme';

const grammars: Record<CodeLanguage, () => Promise<unknown>> = {
  tsx: () => import('shiki/langs/tsx.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  json: () => import('shiki/langs/json.mjs'),
};

let highlighter: Promise<HighlighterCore> | undefined;
const loaded = new Map<CodeLanguage, Promise<void>>();

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [tectonCodeTheme],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Highlighted line markup (content of `<code>`), or `null` for unsupported languages. */
export async function highlight(code: string, language: string | undefined) {
  const lang = resolveLanguage(language);
  if (!lang) return null;
  const hl = await getHighlighter();
  let ready = loaded.get(lang);
  if (!ready) {
    ready = grammars[lang]().then((mod) =>
      hl.loadLanguage((mod as { default: Parameters<HighlighterCore['loadLanguage']>[0] }).default),
    );
    loaded.set(lang, ready);
  }
  await ready;
  return innerCodeHtml(hl.codeToHtml(code, { lang, theme: CODE_THEME_NAME }));
}
