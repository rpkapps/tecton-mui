import * as React from 'react';
import { useRouter } from '@tanstack/react-router';
import Dialog from '@tecton-mui/ui/Dialog';
import InputBase from '@tecton-mui/ui/InputBase';
import List from '@tecton-mui/ui/List';
import ListItemButton from '@tecton-mui/ui/ListItemButton';
import ListItemText from '@tecton-mui/ui/ListItemText';
import Typography from '@tecton-mui/ui/Typography';
import LinearProgress from '@tecton-mui/ui/LinearProgress';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import { visuallyHidden } from '@tecton-mui/ui';
import { RouterLink } from './links';
import { searchIcons } from './icons/iconSearch';

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: { title?: string };
}
interface PagefindApi {
  options(options: Record<string, unknown>): Promise<void>;
  init(): Promise<void>;
  debouncedSearch(
    query: string,
    options?: Record<string, unknown>,
    ms?: number,
  ): Promise<{ results: { id: string; data(): Promise<PagefindResultData> }[] } | null>;
}

const BASE = import.meta.env.BASE_URL;

let pagefindPromise: Promise<PagefindApi | null> | null = null;

/** Lazily loads the Pagefind runtime generated next to the built site (`<base>pagefind/`). */
function loadPagefind(): Promise<PagefindApi | null> {
  pagefindPromise ??= import(/* @vite-ignore */ `${BASE}pagefind/pagefind.js`)
    .then(async (pagefind: PagefindApi) => {
      await pagefind.options({ baseUrl: BASE });
      await pagefind.init();
      return pagefind;
    })
    .catch(() => null);
  return pagefindPromise;
}

type Status = 'idle' | 'loading' | 'ready' | 'unavailable';

const iconHitSx = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
  width: 88,
  minHeight: 64,
  p: 1,
  borderRadius: 1.5,
  color: 'text.primary',
  textAlign: 'center',
  overflowWrap: 'anywhere',
  '&:hover, &:focus-visible': { bgcolor: 'var(--tecton-color-content-bg-hover)' },
} as const;

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [results, setResults] = React.useState<PagefindResultData[]>([]);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const term = query.trim();
  const iconHits = React.useMemo(() => (term ? searchIcons(term).slice(0, 8) : []), [term]);

  const latest = React.useRef(0);

  const search = (term: string) => {
    const token = ++latest.current;
    if (!term) {
      setResults([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    void loadPagefind().then(async (pagefind) => {
      if (token !== latest.current) return; // superseded by a newer query
      if (!pagefind) {
        setStatus('unavailable');
        return;
      }
      const found = await pagefind.debouncedSearch(term, {}, 200);
      if (!found || token !== latest.current) return;
      const data = await Promise.all(found.results.slice(0, 12).map((r) => r.data()));
      if (token !== latest.current) return;
      setResults(data);
      setStatus('ready');
    });
  };

  const go = (url: string) => {
    onClose();
    // Pagefind URLs end with "/" (directory pages); the router uses slash-less paths.
    router.history.push(url.length > BASE.length ? url.replace(/\/$/, '') : url);
  };

  const focusResult = (delta: number) => {
    const items = [...(resultsRef.current?.querySelectorAll<HTMLElement>('a') ?? [])];
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    items[Math.min(items.length - 1, Math.max(0, index + delta))]?.focus();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="docs-search-label"
      slotProps={{
        paper: {
          sx: {
            alignSelf: 'flex-start',
            mt: { xs: 2, sm: 10 },
            mx: { xs: 2, sm: 4 },
            width: { xs: 'calc(100% - 32px)', sm: undefined },
            borderRadius: 3,
            border: '1px solid var(--tecton-color-divider-subtle)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Typography id="docs-search-label" component="h2" sx={visuallyHidden}>
        Search the documentation
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          borderBottom: '1px solid var(--tecton-color-divider-subtle)',
          color: 'text.secondary',
        }}
      >
        <Icon name="search" size="medium" />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search components, guides, props…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              focusResult(0);
            }
          }}
          inputProps={{ 'aria-label': 'Search query', type: 'search' }}
          sx={{ height: 56, typography: 'body1', color: 'text.primary' }}
        />
        <Box
          component="kbd"
          onClick={onClose}
          sx={{
            fontFamily: 'var(--tecton-font-family-mono), monospace',
            fontSize: 11,
            px: 0.75,
            py: 0.25,
            borderRadius: 0.75,
            border: '1px solid var(--tecton-color-divider-subtle)',
            cursor: 'pointer',
          }}
        >
          Esc
        </Box>
      </Box>
      <Box sx={{ height: 2 }}>{status === 'loading' && <LinearProgress />}</Box>
      <Box
        ref={resultsRef}
        className="docs-scroll"
        sx={{ maxHeight: { xs: '65vh', sm: 480 }, overflowY: 'auto', px: 1, pb: 1 }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            focusResult(e.key === 'ArrowDown' ? 1 : -1);
          }
        }}
      >
        {status === 'idle' && !query.trim() && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 1.5, py: 3, textAlign: 'center' }}
          >
            Type to search every page, prop, guide and icon.
          </Typography>
        )}
        {status === 'unavailable' && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 3 }}>
            The search index is generated by the production build. Run the docs build and preview
            the output to search.
          </Typography>
        )}
        {status === 'ready' && results.length === 0 && iconHits.length === 0 && term && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 1.5, py: 3, textAlign: 'center' }}
          >
            No results for “{query.trim()}”.
          </Typography>
        )}
        {iconHits.length > 0 && (
          <Box component="section" aria-labelledby="docs-search-icons" sx={{ px: 1, pt: 1.5 }}>
            <Typography
              id="docs-search-icons"
              variant="caption"
              color="text.secondary"
              component="h3"
              sx={{ mb: 0.75, fontWeight: 600 }}
            >
              Icons
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {iconHits.map((name) => (
                <RouterLink
                  key={name}
                  to="/icons"
                  search={{ q: term, icon: name }}
                  onClick={onClose}
                  underline="none"
                  aria-label={`${name} icon`}
                  sx={iconHitSx}
                >
                  <Icon name={name} size="medium" />
                  <Box component="span" sx={{ typography: 'caption' }}>
                    {name}
                  </Box>
                </RouterLink>
              ))}
              <RouterLink
                to="/icons"
                search={{ q: term }}
                onClick={onClose}
                underline="none"
                sx={{ ...iconHitSx, color: 'var(--docs-accent)' }}
              >
                <Icon name="grid-view" size="medium" />
                <Box component="span" sx={{ typography: 'caption' }}>
                  All matches
                </Box>
              </RouterLink>
            </Box>
          </Box>
        )}
        <List aria-label="Search results" sx={{ py: 0.5 }}>
          {results.map((r) => (
            <li key={r.url}>
              <ListItemButton
                component="a"
                href={r.url}
                onClick={(e: React.MouseEvent) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                  e.preventDefault();
                  go(r.url);
                }}
                sx={{
                  borderRadius: 1.5,
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1,
                  '&:focus-visible, &:hover': { bgcolor: 'var(--tecton-color-content-bg-hover)' },
                }}
              >
                <Box sx={{ color: 'var(--docs-accent)', mt: 0.25, display: 'inline-flex' }}>
                  <Icon name={r.url.includes('/api/') ? 'code' : 'project'} size="small" />
                </Box>
                <ListItemText
                  sx={{ m: 0 }}
                  primary={r.meta.title ?? r.url}
                  slotProps={{
                    primary: { variant: 'subtitle2' },
                    secondary: { variant: 'body2', sx: { lineHeight: 1.5, mt: 0.25 } },
                  }}
                  secondary={
                    <span
                      className="docs-search-excerpt"
                      // Excerpts come from our own prerendered pages; Pagefind marks hits with <mark>.
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                  }
                />
              </ListItemButton>
            </li>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          gap: 2,
          px: 2,
          py: 1,
          borderTop: '1px solid var(--tecton-color-divider-subtle)',
          bgcolor: 'var(--tecton-color-bg-default)',
          color: 'text.secondary',
          typography: 'caption',
        }}
      >
        <span>↑ ↓ to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </Box>
    </Dialog>
  );
}
