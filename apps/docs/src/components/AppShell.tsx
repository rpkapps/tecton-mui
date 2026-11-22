import * as React from 'react';
import { Outlet } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import IconButton from '@tecton-mui/ui/IconButton';
import ButtonBase from '@tecton-mui/ui/ButtonBase';
import Drawer from '@tecton-mui/ui/Drawer';
import Box from '@tecton-mui/ui/Box';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Divider from '@tecton-mui/ui/Divider';
import Link from '@tecton-mui/ui/Link';
import Chip from '@tecton-mui/ui/Chip';
import Icon from '@tecton-mui/ui/Icon';
import { useTectonMode, TECTON_VERSION } from '@tecton-mui/ui/styles';
import { NavMenu } from './NavMenu';
import { SearchDialog } from './SearchDialog';
import { TableOfContents } from './TableOfContents';
import { RouterLink, usePathname } from './links';
import { useDocsSettings } from './settings';
import { muiVersions } from '../data/catalog';
import { readingOrder } from '../data/nav';

const SIDEBAR_WIDTH = 280;
export const HEADER_HEIGHT = 64;
/** Full-width pages without the "On this page" column. */
const WIDE_PAGES = new Set(['/', '/icons']);

/** Product mark: Tecton-colored tile with the layers glyph. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Icon name="layers" size="small" />
    </Box>
  );
}

function SearchTrigger({ onSearch }: { onSearch: () => void }) {
  return (
    <>
      <ButtonBase
        onClick={onSearch}
        aria-label="Search the documentation"
        aria-keyshortcuts="Control+K Meta+K"
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          alignItems: 'center',
          gap: 1,
          width: { sm: 200, md: 240 },
          height: 36,
          px: 1.25,
          borderRadius: 1.5,
          border: '1px solid var(--tecton-color-divider-subtle)',
          bgcolor: 'var(--tecton-color-bg-default)',
          color: 'text.secondary',
          typography: 'body2',
          justifyContent: 'flex-start',
          transition: 'border-color 120ms',
          '&:hover': { borderColor: 'var(--tecton-color-divider-strong)' },
          '&.Mui-focusVisible': { outline: '2px solid var(--tecton-color-focus-ring)' },
        }}
      >
        <Icon name="search" size="small" />
        <Box component="span" sx={{ flexGrow: 1, textAlign: 'start' }}>
          Search docs
        </Box>
        <Box
          component="kbd"
          sx={{
            fontFamily: 'var(--tecton-font-family-mono), monospace',
            fontSize: 11,
            px: 0.75,
            py: 0.125,
            borderRadius: 0.75,
            border: '1px solid var(--tecton-color-divider-subtle)',
            bgcolor: 'background.paper',
          }}
        >
          Ctrl K
        </Box>
      </ButtonBase>
      <Tooltip title="Search">
        <IconButton
          onClick={onSearch}
          aria-label="Search the documentation"
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        >
          <Icon name="search" size="medium" />
        </IconButton>
      </Tooltip>
    </>
  );
}

function HeaderActions() {
  const { mode, toggleMode } = useTectonMode();
  const { direction, toggleDirection } = useDocsSettings();
  const nextMode = mode === 'dark' ? 'light' : 'dark';
  const nextDir = direction === 'rtl' ? 'left-to-right' : 'right-to-left';
  return (
    <>
      <Tooltip title={`Switch to ${nextDir} (now ${direction.toUpperCase()})`}>
        <IconButton onClick={toggleDirection} aria-label={`Switch to ${nextDir}`}>
          <Icon name="swap" size="medium" />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Switch to ${nextMode} mode`}>
        <IconButton onClick={toggleMode} aria-label={`Switch to ${nextMode} mode`}>
          <Icon name={mode === 'dark' ? 'light-mode' : 'dark-mode'} size="medium" />
        </IconButton>
      </Tooltip>
    </>
  );
}

function Header({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        height: HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: { xs: 1, sm: 2, md: 3 },
        bgcolor: 'var(--tecton-color-component-top-nav-solid-background)',
        color: 'text.primary',
        borderBottom: '1px solid var(--tecton-color-divider-subtle)',
      }}
    >
      <IconButton aria-label="Open navigation" onClick={onMenu} sx={{ display: { md: 'none' } }}>
        <Icon name="menu" size="medium" />
      </IconButton>
      <RouterLink
        to="/"
        underline="none"
        color="inherit"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, mr: 1, minWidth: 0 }}
        aria-label="Tecton MUI documentation home"
      >
        <Logo />
        <Typography
          component="span"
          variant="subtitle1"
          noWrap
          sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          Tecton MUI
        </Typography>
      </RouterLink>
      <Chip
        size="small"
        variant="outlined"
        label={`Tecton ${TECTON_VERSION}`}
        sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
      />
      <Box sx={{ flexGrow: 1 }} />
      <SearchTrigger onSearch={onSearch} />
      <HeaderActions />
    </Box>
  );
}

function PrevNext({ pathname }: { pathname: string }) {
  const index = readingOrder.findIndex((l) => l.to === pathname);
  if (index === -1) return null;
  const prev = readingOrder[index - 1];
  const next = readingOrder[index + 1];
  const card = (link: typeof prev, label: string, align: 'start' | 'end') => (
    <RouterLink
      to={link.to as '/'}
      underline="none"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'end' ? 'flex-end' : 'flex-start',
        textAlign: align,
        gap: 0.25,
        p: 2,
        borderRadius: 2,
        border: '1px solid var(--tecton-color-divider-subtle)',
        color: 'text.primary',
        transition: 'border-color 120ms, background-color 120ms',
        '&:hover': {
          borderColor: 'var(--docs-accent)',
          bgcolor: 'var(--tecton-color-content-bg-hover)',
        },
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" component="span" sx={{ color: 'var(--docs-accent)' }}>
        {link.title}
      </Typography>
    </RouterLink>
  );
  return (
    <Box
      component="nav"
      aria-label="Previous and next pages"
      data-pagefind-ignore="all"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mt: 8,
      }}
    >
      {prev ? card(prev, 'Previous', 'start') : <Box sx={{ flex: 1 }} />}
      {next ? card(next, 'Next', 'end') : <Box sx={{ flex: 1 }} />}
    </Box>
  );
}

function Footer() {
  const versions = Object.entries(muiVersions)
    .map(([name, v]) => `${name} ${v}`)
    .join(' · ');
  return (
    <Box component="footer" sx={{ mt: 6, pb: 5 }} data-pagefind-ignore="all">
      <Divider sx={{ mb: 3, borderColor: 'var(--tecton-color-divider-subtle)' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, mb: 1 }}>
        <Logo size={22} />
        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          Tecton MUI
        </Typography>
        <Typography variant="body2" color="text.secondary">
          · Tecton {TECTON_VERSION}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" component="p">
        Built on {versions}
      </Typography>
    </Box>
  );
}

const scrollColumn = {
  position: 'sticky',
  top: HEADER_HEIGHT,
  height: `calc(100vh - ${HEADER_HEIGHT}px)`,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
} as const;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isHome = pathname === '/';
  const isWide = WIDE_PAGES.has(pathname);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Link
        href="#main-content"
        sx={{
          position: 'absolute',
          insetInlineStart: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip,
          bgcolor: 'background.paper',
          p: 1,
          '&:focus': { top: 8 },
        }}
      >
        Skip to content
      </Link>
      <Header onMenu={() => setMobileOpen(true)} onSearch={() => setSearchOpen(true)} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box
          component="aside"
          data-nav-scroll=""
          data-pagefind-ignore="all"
          sx={{
            ...scrollColumn,
            display: { xs: 'none', md: 'block' },
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderInlineEnd: '1px solid var(--tecton-color-divider-subtle)',
          }}
        >
          <NavMenu />
        </Box>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobile}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              maxWidth: '85vw',
              bgcolor: 'background.default',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2.5,
              height: HEADER_HEIGHT,
              flexShrink: 0,
              borderBottom: '1px solid var(--tecton-color-divider-subtle)',
            }}
          >
            <Logo />
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600, flexGrow: 1 }}>
              Tecton MUI
            </Typography>
            <IconButton aria-label="Close navigation" onClick={closeMobile} edge="end">
              <Icon name="close" size="medium" />
            </IconButton>
          </Box>
          <Box data-nav-scroll="" sx={{ overflowY: 'auto', flexGrow: 1 }}>
            <NavMenu onNavigate={closeMobile} />
          </Box>
        </Drawer>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flexGrow: 1, minWidth: 0, outline: 'none' }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 6,
              maxWidth: isWide ? 1280 : 1180,
              mx: 'auto',
              px: { xs: 2, sm: 4, lg: 6 },
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                maxWidth: isWide ? 'none' : 900,
                pt: { xs: 3, md: isHome ? 0 : 5 },
              }}
            >
              <div data-pagefind-body ref={contentRef}>
                <Outlet />
              </div>
              {!isHome && <PrevNext pathname={pathname} />}
              <Footer />
            </Box>
            {!isWide && (
              <Box
                component="aside"
                sx={{
                  ...scrollColumn,
                  display: { xs: 'none', lg: 'block' },
                  width: 220,
                  flexShrink: 0,
                  pt: 5,
                  pb: 4,
                }}
              >
                <TableOfContents contentRef={contentRef} pathname={pathname} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
