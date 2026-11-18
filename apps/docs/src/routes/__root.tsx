import * as React from 'react';
import { createRootRoute } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import CssBaseline from '@tecton-mui/ui/CssBaseline';
import { AppShell } from '../components/AppShell';
import { DocsSettingsProvider, useDocsSettings } from '../components/settings';
import { mdxComponents } from '../components/mdx';
import { NotFound } from '../components/NotFound';

function ThemedApp() {
  const { direction } = useDocsSettings();
  React.useEffect(() => {
    // Lets the pre-paint style (see entry-server) know the client render has taken over.
    document.documentElement.setAttribute('data-docs-ready', '');
  }, []);
  return (
    <ThemeProvider direction={direction}>
      <CssBaseline />
      <MDXProvider components={mdxComponents}>
        <AppShell />
      </MDXProvider>
    </ThemeProvider>
  );
}

function RootComponent() {
  return (
    <DocsSettingsProvider>
      <ThemedApp />
    </DocsSettingsProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
