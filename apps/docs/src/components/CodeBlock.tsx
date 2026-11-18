/*
 * CodeBlock: syntax-highlighted, copyable code (Shiki, Tecton-token colors in both modes).
 *
 * Props (all backward compatible with the earlier `{ code, language, bare }` signature):
 *   code       string   Source text (required). Copied verbatim by the copy button.
 *   language   string?  Fence language: tsx | jsx | ts | typescript | js | bash | sh | css | json …
 *                       Unknown or missing languages render as plain text.
 *   bare       boolean? No border, radius, margins or header (used inside <Demo>).
 *   html       string?  Pre-highlighted line markup (the content of Shiki's `<code>`), e.g. from
 *                       `import src from './Demo.tsx?highlight'` (`src.html`) or MDX fences. Without
 *                       it, the block is highlighted at prerender time and by a lazily loaded
 *                       runtime highlighter on client-side navigation.
 *   title      string?  Label in the header (e.g. a file name) instead of the language.
 *   maxLines   number?  Collapse blocks longer than this many lines behind an "Expand" button.
 *
 * Long lines never wrap: the block scrolls horizontally with a thin themed scrollbar.
 */
import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import IconButton from '@tecton-mui/ui/IconButton';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Icon from '@tecton-mui/ui/Icon';
import { codeKey, languageLabel, resolveLanguage } from '../lib/highlight/theme';

export function CopyButton({
  text,
  label = 'Copy code',
  showLabel = false,
}: {
  text: string;
  label?: string;
  /** Render a text button ("Copy") instead of an icon button. */
  showLabel?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);
  const onClick = () => {
    void navigator.clipboard?.writeText(text).then(() => setCopied(true));
  };
  const icon = <Icon name={copied ? 'check' : 'copy'} size="small" />;
  if (showLabel) {
    return (
      <Button
        size="small"
        color="inherit"
        onClick={onClick}
        startIcon={icon}
        aria-label={label}
        className="docs-code-copy"
      >
        <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      </Button>
    );
  }
  return (
    <Tooltip title={copied ? 'Copied' : label}>
      <IconButton size="small" aria-label={label} onClick={onClick} className="docs-code-copy">
        {icon}
      </IconButton>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------------------------
// Runtime highlighting for blocks without pre-highlighted markup.

const cache = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

function highlightCached(code: string, language: string | undefined, key: string) {
  let p = pending.get(key);
  if (!p) {
    p = import('../lib/highlight/runtime').then(({ highlight }) => highlight(code, language));
    p.then((html) => html != null && cache.set(key, html)).catch(() => {});
    pending.set(key, p);
  }
  return p;
}

/**
 * Copies the highlighted markup of the prerendered page into the cache before the first client
 * render, so code blocks (including ones in lazily rendered sections, which mount after the
 * prerendered DOM is replaced) reuse it instead of loading the runtime highlighter.
 */
export function primeHighlightCache(root: ParentNode = document) {
  for (const el of root.querySelectorAll<HTMLElement>('code[data-code-key][data-highlighted]')) {
    const key = el.dataset.codeKey;
    if (key && !cache.has(key)) cache.set(key, el.innerHTML);
  }
}

type CodeProps = { code: string; language?: string; html?: string };

/** Prerender: waits for the highlighter so the static HTML is highlighted. */
function ServerCode({ code, language, html }: CodeProps) {
  const key = codeKey(code, language);
  const highlighted =
    html ?? (resolveLanguage(language) ? React.use(highlightCached(code, language, key)) : null);
  return highlighted ? (
    <code
      data-code-key={key}
      data-highlighted=""
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  ) : (
    <code>{code}</code>
  );
}

/** Browser: reuses prerendered markup, else highlights after a plain-text first paint. */
function ClientCode({ code, language, html }: CodeProps) {
  const key = codeKey(code, language);
  const supported = resolveLanguage(language) != null;
  const [state, setState] = React.useState(() => ({
    key,
    html: html ?? cache.get(key),
  }));
  const current = state.key === key ? state.html : (html ?? cache.get(key));
  React.useEffect(() => {
    if (current != null || !supported) return;
    let live = true;
    void highlightCached(code, language, key).then((h) => {
      if (live && h != null) setState({ key, html: h });
    });
    return () => {
      live = false;
    };
  }, [code, language, key, current, supported]);
  return current != null ? (
    <code data-code-key={key} data-highlighted="" dangerouslySetInnerHTML={{ __html: current }} />
  ) : (
    <code>{code}</code>
  );
}

const Code = import.meta.env.SSR ? ServerCode : ClientCode;

// ---------------------------------------------------------------------------------------------

export interface CodeBlockProps {
  code: string;
  language?: string;
  bare?: boolean;
  html?: string;
  title?: string;
  maxLines?: number;
}

export function CodeBlock({ code, language, bare, html, title, maxLines }: CodeBlockProps) {
  const text = code.replace(/\n+$/, '');
  const lines = text.split('\n').length;
  const collapsible = maxLines != null && lines > maxLines + 2;
  const [expanded, setExpanded] = React.useState(false);
  const id = React.useId();
  const collapsed = collapsible && !expanded;
  return (
    <Box
      // Code is always left-to-right; logical properties keep the chrome correct in RTL pages.
      dir="ltr"
      className={`docs-code${bare ? ' docs-code--bare' : ''}`}
      data-language={languageLabel(language)}
      sx={{ my: bare ? 0 : 2.5 }}
    >
      {!bare && (
        <div className="docs-code-header">
          <span className="docs-code-label">{title ?? languageLabel(language)}</span>
          <CopyButton text={text} />
        </div>
      )}
      <Box
        component="pre"
        id={id}
        className="docs-code-pre docs-scroll"
        tabIndex={0}
        aria-label={title ?? `${languageLabel(language)} code`}
        sx={collapsed ? { maxHeight: `calc(${maxLines} * 1.7em + 32px)`, overflowY: 'hidden' } : {}}
      >
        <Code code={text} language={language} html={html} />
      </Box>
      {collapsible && (
        <div className={`docs-code-expand${collapsed ? ' is-collapsed' : ''}`}>
          <Button
            size="small"
            color="inherit"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setExpanded((e) => !e)}
            endIcon={<Icon name={expanded ? 'chevron-up' : 'chevron-down'} size="small" />}
          >
            {expanded ? 'Collapse code' : `Expand code (${lines} lines)`}
          </Button>
        </div>
      )}
    </Box>
  );
}
