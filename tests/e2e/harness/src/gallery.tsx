// Self-contained component gallery (single-file build for sharing previews; see gallery.config.ts).
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@tecton-mui/ui/styles/fonts.css';
import '@tecton-mui/ui/styles/icons.css';
import '@tecton-mui/ui/styles/tokens.css';
import { initTecton, ThemeProvider, useTectonMode } from '@tecton-mui/ui/styles';
import { AppBar, Box, Button, CssBaseline, Tab, Tabs, Toolbar, Typography } from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';
import { Showcase } from './App.js';
import { GridScenarios } from './GridScenarios.js';
import { PickerScenarios, TreeScenarios } from './AdvancedScenarios.js';

const VIEWS = [
  { id: 'components', label: 'Components' },
  { id: 'data-grid', label: 'Data Grid' },
  { id: 'pickers', label: 'Range pickers' },
  { id: 'tree-view', label: 'Tree View' },
] as const;
type ViewId = (typeof VIEWS)[number]['id'];

const viewFromHash = (): ViewId => {
  const id = window.location.hash.slice(1);
  return (VIEWS.find((v) => v.id === id)?.id ?? 'components') as ViewId;
};

// Follow the viewer's explicit theme if the host set one, otherwise the OS preference.
const hostTheme = document.documentElement.getAttribute('data-theme');
const manager = initTecton();
manager?.setPreference(hostTheme === 'dark' || hostTheme === 'light' ? hostTheme : 'system');

function Gallery() {
  const [view, setView] = React.useState<ViewId>(viewFromHash);
  const [rtl, setRtl] = React.useState(false);
  const { mode, toggleMode } = useTectonMode();
  React.useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const select = (next: ViewId) => {
    setView(next);
    try {
      window.location.hash = next;
    } catch {
      /* hash routing is a convenience only */
    }
  };
  return (
    <ThemeProvider direction={rtl ? 'rtl' : 'ltr'}>
      <CssBaseline />
      <div dir={rtl ? 'rtl' : 'ltr'}>
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
          <Toolbar
            sx={{
              gap: 2,
              flexWrap: 'wrap',
              pl: 'max(16px, env(safe-area-inset-left, 0px))',
              pr: 'max(16px, env(safe-area-inset-right, 0px))',
            }}
          >
            <Typography variant="h6" component="h1" sx={{ flexShrink: 0 }}>
              Tecton MUI
            </Typography>
            <Tabs
              value={view}
              onChange={(_, next: ViewId) => select(next)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ flex: '1 1 320px', minWidth: 0 }}
              aria-label="Gallery sections"
            >
              {VIEWS.map((v) => (
                <Tab key={v.id} value={v.id} label={v.label} />
              ))}
            </Tabs>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                color="tertiary"
                onClick={() => setRtl((r) => !r)}
                aria-pressed={rtl}
              >
                {rtl ? 'RTL' : 'LTR'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Icon name={mode === 'dark' ? 'light-mode' : 'dark-mode'} />}
                onClick={toggleMode}
              >
                {mode === 'dark' ? 'Light mode' : 'Dark mode'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ maxWidth: 1440, mx: 'auto' }}>
          {view === 'components' && <Showcase />}
          {view === 'data-grid' && <GridScenarios which="all" />}
          {view === 'pickers' && <PickerScenarios />}
          {view === 'tree-view' && <TreeScenarios />}
        </Box>
      </div>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Gallery />);
