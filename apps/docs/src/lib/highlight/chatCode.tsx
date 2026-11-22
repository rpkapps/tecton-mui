// A `ChatCodeBlock` highlighter backed by Shiki and the portal's Tecton code theme (colours are CSS
// variables, so light and dark mode need no re-highlighting). `ChatCodeBlock` calls the
// highlighter synchronously, so it returns a component that shows plain code first and swaps in
// the tokens once the grammar has loaded. Grammars load on first use.
import * as React from 'react';
import { createHighlighterCore, type HighlighterCore, type ThemedToken } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { CODE_THEME_NAME, tectonCodeTheme } from './theme';

const grammars = {
  typescript: () => import('shiki/langs/typescript.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
} as const;
type Grammar = keyof typeof grammars;

const ALIASES: Record<string, Grammar> = {
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'tsx',
  py: 'python',
  python: 'python',
  sql: 'sql',
  json: 'json',
  sh: 'bash',
  bash: 'bash',
  shell: 'bash',
};

let core: Promise<HighlighterCore> | undefined;
const loaded = new Map<Grammar, Promise<void>>();

async function tokensFor(code: string, grammar: Grammar): Promise<ThemedToken[][]> {
  core ??= createHighlighterCore({
    themes: [tectonCodeTheme],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  const hl = await core;
  let ready = loaded.get(grammar);
  if (!ready) {
    ready = grammars[grammar]().then((mod) =>
      hl.loadLanguage((mod as { default: Parameters<HighlighterCore['loadLanguage']>[0] }).default),
    );
    loaded.set(grammar, ready);
  }
  await ready;
  return hl.codeToTokens(code, { lang: grammar, theme: CODE_THEME_NAME }).tokens;
}

function ShikiCode({ code, grammar }: { code: string; grammar: Grammar }) {
  const [lines, setLines] = React.useState<ThemedToken[][] | null>(null);
  React.useEffect(() => {
    let current = true;
    tokensFor(code, grammar).then(
      (tokens) => current && setLines(tokens),
      () => {},
    );
    return () => {
      current = false;
    };
  }, [code, grammar]);
  if (!lines) return code;
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 ? '\n' : null}
      {line.map((token, j) => (
        <span
          key={j}
          style={{
            color: token.color,
            fontStyle: token.fontStyle && token.fontStyle & 1 ? 'italic' : undefined,
          }}
        >
          {token.content}
        </span>
      ))}
    </React.Fragment>
  ));
}

/** `highlighter` for `ChatCodeBlock`: highlights by the block's language; unknown ones stay plain. */
export function shikiHighlighter(code: string, language: string): React.ReactNode {
  const grammar = ALIASES[language.toLowerCase()];
  return grammar ? <ShikiCode code={code} grammar={grammar} /> : code;
}
