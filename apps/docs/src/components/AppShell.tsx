import * as React from 'react';
import { Outlet } from '@tanstack/react-router';
import AppBar from '@tecton-mui/ui/AppBar';
import Toolbar from '@tecton-mui/ui/Toolbar';
import Typography from '@tecton-mui/ui/Typography';
import IconButton from '@tecton-mui/ui/IconButton';
import Button from '@tecton-mui/ui/Button';
import Drawer from '@tecton-mui/ui/Drawer';
import Box from '@tecton-mui/ui/Box';
import Container from '@tecton-mui/ui/Container';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Divider from '@tecton-mui/ui/Divider';
import Link from '@tecton-mui/ui/Link';
import Icon from '@tecton-mui/ui/Icon';
import { useTectonMode, TECTON_VERSION } from '@tecton-mui/ui/styles';
import { NavMenu } from './NavMenu';
import { SearchDialog } from './SearchDialog';
import { RouterLink } from './links';
import { useDocsSettings } from './settings';
import { muiVersions } from '../data/catalog';

const DRAWER_WIDTH = 288;

function HeaderActions({ onSearch }: { onSearch: () => void }) {
  const { mode, toggleMode } = useTectonMode();
  const { direction, toggleDirection } = useDocsSettings();
  const nextMode = mode === 'dark' ? 'light' : 'dark';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        color="inherit"
        variant="outlined"
        size="small"
        onClick={onSearch}
        startIcon={<Icon name="search" size="small" />}
        aria-keyshortcuts="Control+K Meta+K"
      >
        Search
      </Button>
      <Tooltip title={`Text direction: ${direction.toUpperCase()} (switch)`}>
        <Button
          color="inherit"
          size="small"
          onClick={toggleDirection}
          aria-label={`Switch to ${direction === 'rtl' ? 'left-to-right' : 'right-to-left'}`}
          startIcon={<Icon name="swap" size="small" />}
        >
          {direction === 'rtl' ? 'RTL' : 'LTR'}
        </Button>
      </Tooltip>
      <Tooltip title={`Switch to ${nextMode} mode`}>
        <IconButton color="inherit" onClick={toggleMode} aria-label={`Switch to ${nextMode} mode`}>
          <Icon name={mode === 'dark' ? 'light-mode' : 'dark-mode'} size="medium" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function Footer() {
  const versions = Object.entries(muiVersions)
    .map(([name, v]) => `${name} ${v}`)
    .join(' · ');
  return (
    <Box component="footer" sx={{ mt: 8, pb: 4 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary">
        Tecton MUI component library documentation · Tecton {TECTON_VERSION}.{' '}
        <RouterLink to="/guides/licensing">Licensing and provenance</RouterLink>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Built on {versions}
      </Typography>
    </Box>
  );
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const drawerContent = (
    <Box sx={{ overflowY: 'auto', pb: 4 }}>
      <NavMenu onNavigate={() => setMobileOpen(false)} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Link
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip,
          bgcolor: 'background.paper',
          p: 1,
          '&:focus': { top: 8 },
        }}
      >
        Skip to content
      </Link>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <Icon name="menu" size="medium" />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
            <RouterLink to="/" color="inherit" underline="none">
              Tecton MUI
            </RouterLink>
          </Typography>
          <HeaderActions onSearch={() => setSearchOpen(true)} />
        </Toolbar>
      </AppBar>

      <Box component="aside" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: false }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, outline: 'none' }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <div data-pagefind-body>
            <Outlet />
          </div>
          <Footer />
        </Container>
      </Box>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
