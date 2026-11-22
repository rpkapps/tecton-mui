/*
 * Demo: a live example (real @tecton-mui/ui components) in a bordered preview frame, with a
 * toolbar (show/hide code, copy, reset) and its syntax-highlighted source.
 *
 * Two ways to use it (both supported, backward compatible):
 *
 * 1. Page demos by name (MDX content pages): `<Demo name="BasicButtons" />` renders
 *    `src/demos/<page>/BasicButtons.tsx`, loaded with the page through `DemosContext`.
 *
 * 2. Direct: pass the rendered element and its source.
 *      <Demo code={source} title="Basic usage"><BasicButtons /></Demo>
 *    or `element={<BasicButtons />}` instead of children.
 *
 * Props:
 *   name       string?     Demo file name in `src/demos/<page>/` (mode 1).
 *   children   ReactNode?  Rendered demo (mode 2). `element` is an alias.
 *   code       string?     Source shown under the preview and copied (mode 2; mode 1 reads the file).
 *   html       string?     Pre-highlighted source markup (`import s from './X.tsx?highlight'` gives
 *                          `{ code, html }`). Optional: plain `code` is highlighted automatically.
 *   language   string?     Source language (default `tsx`).
 *   title      string?     Short caption shown in the toolbar.
 *   showCode   boolean?    Start with the source expanded (default false).
 *   align      'center' | 'start' | 'stretch'?  Preview alignment (default 'center').
 */
import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import IconButton from '@tecton-mui/ui/IconButton';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';
import { CodeBlock, CopyButton } from './CodeBlock';

export interface LoadedDemo {
  Component: React.ComponentType;
  code: string;
  /** Build-time highlighted source markup. */
  html?: string;
}

/** Demos of the current page, loaded with the page (see `lib/content.ts`). */
export const DemosContext = React.createContext<Record<string, LoadedDemo>>({});

export interface DemoProps {
  name?: string;
  children?: React.ReactNode;
  element?: React.ReactNode;
  code?: string;
  html?: string;
  language?: string;
  title?: string;
  showCode?: boolean;
  align?: 'center' | 'start' | 'stretch';
  /** The demo is a `<Playground>` with its own frame, toolbar and generated code. */
  playground?: boolean;
}

const JUSTIFY = { center: 'center', start: 'flex-start', stretch: 'stretch' } as const;

export function Demo({
  name,
  children,
  element,
  code: codeProp,
  html: htmlProp,
  language = 'tsx',
  title,
  showCode = false,
  align = 'center',
  playground = false,
}: DemoProps) {
  const demos = React.useContext(DemosContext);
  const loaded = name != null ? demos[name] : undefined;
  if (name != null && !loaded) {
    throw new Error(`Demo "${name}" not found for this page`);
  }
  const [open, setOpen] = React.useState(showCode);
  const [instance, setInstance] = React.useState(0);
  const codeId = React.useId();
  if (playground && loaded) {
    return <loaded.Component />;
  }
  const code = loaded?.code ?? codeProp ?? '';
  const html = loaded?.html ?? htmlProp;
  const Component = loaded?.Component;
  const preview = Component ? <Component /> : (children ?? element);

  return (
    <Box className="docs-demo" sx={{ my: 3 }}>
      <Box
        data-demo-preview=""
        className="docs-demo-preview docs-scroll"
        sx={{
          justifyContent: JUSTIFY[align],
          alignItems: align === 'stretch' ? 'stretch' : 'center',
        }}
      >
        <React.Fragment key={instance}>{preview}</React.Fragment>
      </Box>
      <div className="docs-demo-toolbar">
        {title ? (
          <Typography variant="caption" color="text.secondary" className="docs-demo-title">
            {title}
          </Typography>
        ) : (
          <span />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {code && (
            <Button
              size="small"
              color="inherit"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={codeId}
              startIcon={<Icon name="code" size="small" />}
            >
              {open ? 'Hide code' : 'Show code'}
            </Button>
          )}
          {code && <CopyButton text={code} label="Copy the source" />}
          <Tooltip title="Reset the demo">
            <IconButton
              size="small"
              aria-label="Reset the demo"
              onClick={() => setInstance((i) => i + 1)}
            >
              <Icon name="retry" size="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
      {code && (
        <div id={codeId} hidden={!open} className="docs-demo-code" data-pagefind-ignore="all">
          {open && <CodeBlock code={code} language={language} html={html} bare />}
        </div>
      )}
    </Box>
  );
}
