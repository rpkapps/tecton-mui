// Self-contained component gallery (single-file build for sharing previews; see gallery.config.ts).
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@tecton-mui/ui/styles/fonts.css';
import '@tecton-mui/ui/styles/icons.css';
import '@tecton-mui/ui/styles/tokens.css';
import { initTecton, ThemeProvider, useTectonMode } from '@tecton-mui/ui/styles';
import { AppBar, Box, Button, CssBaseline } from '@tecton-mui/ui';
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
const GALLERY_TABS = VIEWS.map((v) => ({ id: v.id, label: v.label, closeable: false }));

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
          appName="Tecton MUI"
          tabs={GALLERY_TABS}
          activeTab={view}
          disableTabAdd
          onTabSelect={(next) => select(next as ViewId)}
          sx={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
          <Button
            variant="text"
            color="tertiary"
            size="small"
            onClick={() => setRtl((r) => !r)}
            aria-pressed={rtl}
          >
            {rtl ? 'RTL' : 'LTR'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon name={mode === 'dark' ? 'light-mode' : 'dark-mode'} />}
            onClick={toggleMode}
          >
            {mode === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
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
