// Live-demo wrapper for synced MUI examples. Each demo gets a module-level frame component (stable
// identity) and an error boundary, so one failing example never takes the page down.
import * as React from 'react';
import Alert from '@tecton-mui/ui/Alert';
import Box from '@tecton-mui/ui/Box';
import type { SxProps, Theme } from '@tecton-mui/ui/styles';
import type { LoadedDemo } from '../../components/Demo';

export interface DemoOptions {
  /** Upstream renders the demo in an iframe (full-page layouts with fixed app bars, drawers). */
  iframe?: boolean;
  /** Upstream `bg: "inline"`: no padding around the example. */
  bg?: string | boolean;
  maxWidth?: number | string;
  height?: number | string;
}

class DemoErrorBoundary extends React.Component<
  { name: string; children?: React.ReactNode },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error) {
    console.error(`[mui-docs] demo "${this.props.name}" failed to render`, error);
  }

  override render() {
    if (this.state.error) {
      return (
        <Alert severity="error" data-mui-demo-error={this.props.name} sx={{ width: '100%' }}>
          This example failed to render: {this.state.error.message}
        </Alert>
      );
    }
    return this.props.children;
  }
}

const INLINE_SX = {
  width: '100%',
  minWidth: 0,
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
} as const;

// Full-page demos: a transformed box becomes the containing block of `position: fixed` children,
// so app bars and drawers stay inside the example instead of covering the portal.
const IFRAME_SX = {
  width: '100%',
  minWidth: 0,
  position: 'relative',
  transform: 'translateZ(0)',
  overflow: 'auto',
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
} as const;

/** Demo source text; `html` is optional pre-highlighted markup (else `CodeBlock` highlights lazily). */
export interface DemoSource {
  code: string;
  html?: string;
}

/**
 * Removes the generated license header (a leading block comment) from a demo source, so the shown
 * and copied code starts with the upstream source. The highlighted markup has one line per source
 * line, so the same number of lines is dropped from it.
 */
export function stripHeader({ code, html }: DemoSource): DemoSource {
  const header = /^\/\*[\s\S]*?\*\/\n/.exec(code);
  if (!header) return { code, html };
  const lines = header[0].split('\n').length - 1;
  const htmlLines = html?.split('\n');
  return {
    code: code.slice(header[0].length),
    html:
      htmlLines && htmlLines.length === code.replace(/\n$/, '').split('\n').length
        ? htmlLines.slice(lines).join('\n')
        : undefined,
  };
}

/** Builds the `<Demo>` entry of a synced example. Call at module level only. */
export function defineDemo(
  name: string,
  Component: React.ComponentType,
  source: DemoSource,
  options: DemoOptions = {},
): LoadedDemo {
  const sx: SxProps<Theme> = options.iframe
    ? { ...IFRAME_SX, height: options.height ?? 400 }
    : { ...INLINE_SX, ...(options.maxWidth ? { maxWidth: options.maxWidth, mx: 'auto' } : null) };
  function SyncedDemo() {
    return (
      <DemoErrorBoundary name={name}>
        <Box data-mui-demo={name} sx={sx}>
          <Component />
        </Box>
      </DemoErrorBoundary>
    );
  }
  SyncedDemo.displayName = `SyncedDemo(${name})`;
  return { Component: SyncedDemo, ...stripHeader(source) };
}
