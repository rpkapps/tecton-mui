import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ButtonBase from '@tecton-mui/ui/ButtonBase';
import IconButton from '@tecton-mui/ui/IconButton';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import Snackbar from '@tecton-mui/ui/Snackbar';
import TextField from '@tecton-mui/ui/TextField';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Typography from '@tecton-mui/ui/Typography';
import Icon, { type IconName, type IconVariant } from '@tecton-mui/ui/Icon';
import { RouterLink } from '../links';
import { ICON_NAMES, iconVariants, isMulticolor, searchIcons } from './iconSearch';
import { ICON_IMPORT, copyText, iconJsx, readIconSvg } from './iconSnippets';

export interface IconBrowserState {
  query: string;
  selected: IconName | null;
  variant: IconVariant;
}

export interface IconBrowserProps extends IconBrowserState {
  /** Called with the part of the state that changed (the route stores it in the URL). */
  onChange: (patch: Partial<IconBrowserState>) => void;
  /** Offset of the sticky toolbar from the top of the viewport (the docs header height). */
  stickyTop?: number;
}

const TOOLBAR_HEIGHT = 64;

const mono = {
  fontFamily: 'var(--tecton-font-family-mono), monospace',
  fontSize: 12.5,
} as const;

type Toast = { key: number; message: string; error?: boolean };

/** Arrow-key target in a CSS grid of tiles: columns are counted from the rendered layout. */
function nextIndex(tiles: HTMLElement[], index: number, key: string, rtl: boolean): number | null {
  const last = tiles.length - 1;
  const top = tiles[0]?.offsetTop;
  const wrapped = tiles.findIndex((t) => t.offsetTop !== top);
  const columns = wrapped === -1 ? tiles.length : Math.max(1, wrapped);
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
  const back = rtl ? 'ArrowRight' : 'ArrowLeft';
  switch (key) {
    case forward:
      return Math.min(last, index + 1);
    case back:
      return Math.max(0, index - 1);
    case 'ArrowDown':
      return Math.min(last, index + columns);
    case 'ArrowUp':
      return index - columns < 0 ? null : index - columns;
    case 'Home':
      return 0;
    case 'End':
      return last;
    default:
      return null;
  }
}

const IconTile = React.memo(function IconTile({
  name,
  variant,
  selected,
  tabbable,
  onActivate,
}: {
  name: IconName;
  variant: IconVariant;
  selected: boolean;
  tabbable: boolean;
  onActivate: (name: IconName) => void;
}) {
  return (
    <li>
      <ButtonBase
        data-icon={name}
        tabIndex={tabbable ? 0 : -1}
        aria-current={selected || undefined}
        aria-label={`${name}, copy JSX`}
        onClick={() => onActivate(name)}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 92,
          flexDirection: 'column',
          // Top-aligned so icons line up across a row when some names wrap to two lines.
          justifyContent: 'flex-start',
          gap: 1,
          p: 1.25,
          pt: 2.75,
          borderRadius: 1.5,
          border: '1px solid var(--tecton-color-divider-subtle)',
          color: 'text.primary',
          transition: 'border-color 120ms, background-color 120ms',
          '&:hover': { bgcolor: 'var(--tecton-color-content-bg-hover)' },
          '&.Mui-focusVisible': { outline: '2px solid var(--tecton-color-focus-ring)' },
          '&[aria-current="true"]': {
            borderColor: 'var(--docs-accent)',
            bgcolor: 'var(--tecton-color-content-bg-active)',
          },
        }}
      >
        <Icon name={name} variant={variant} size="large" />
        <Typography
          component="span"
          variant="caption"
          sx={{ textAlign: 'center', overflowWrap: 'anywhere', lineHeight: 1.3 }}
        >
          {name}
        </Typography>
      </ButtonBase>
    </li>
  );
});

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.5,
        borderTop: '1px solid var(--tecton-color-divider-subtle)',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ width: 48, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box
        component="code"
        title={value}
        sx={{
          ...mono,
          flexGrow: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
      <Tooltip title={`Copy ${label}`}>
        <IconButton size="small" aria-label={`Copy ${label}`} onClick={onCopy}>
          <Icon name="copy" size="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function IconDetails({
  name,
  variant,
  copy,
}: {
  name: IconName;
  variant: IconVariant;
  copy: (text: string | null, what: string) => void;
}) {
  const preview = React.useRef<HTMLSpanElement>(null);
  const variants = iconVariants(name);
  const multicolor = isMulticolor(name);
  const jsx = iconJsx(name, variant);
  return (
    <Box
      component="section"
      aria-label={`Icon ${name}`}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid var(--tecton-color-divider-subtle)',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            bgcolor: 'var(--tecton-color-bg-default)',
            fontSize: 48,
          }}
        >
          <Icon ref={preview} name={name} variant={variant} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
            variant="subtitle1"
            sx={{ ...mono, fontSize: 15, fontWeight: 600, overflowWrap: 'anywhere' }}
          >
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p">
            {multicolor
              ? 'Multicolor brand mark (fixed colors, no variants)'
              : variants.length === 2
                ? 'Outline and filled'
                : `${variants[0] === 'filled' ? 'Filled' : 'Outline'} only`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
        {(
          [
            ['xsmall', 12],
            ['small', 16],
            ['medium', 20],
            ['large', 24],
          ] as const
        ).map(([size, px]) => (
          <Box
            key={size}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}
          >
            <Icon name={name} variant={variant} size={size} />
            <Typography variant="caption" color="text.secondary">
              {size} · {px}
            </Typography>
          </Box>
        ))}
      </Box>

      <CopyRow label="JSX" value={jsx} onCopy={() => copy(jsx, jsx)} />
      <CopyRow label="Name" value={name} onCopy={() => copy(name, `“${name}”`)} />
      <CopyRow label="Import" value={ICON_IMPORT} onCopy={() => copy(ICON_IMPORT, 'the import')} />
      <CopyRow
        label="SVG"
        value={multicolor ? '<svg> with its brand colors' : '<svg> tinted with currentColor'}
        onCopy={() =>
          copy(preview.current ? readIconSvg(preview.current) : null, `the ${name} SVG`)
        }
      />
      <Typography variant="body2" sx={{ mt: 1.5 }}>
        <RouterLink to="/components/$slug" params={{ slug: 'icon' }}>
          Icon component: sizes, color and accessibility
        </RouterLink>
      </Typography>
    </Box>
  );
}

function DetailsPlaceholder() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px dashed var(--tecton-color-divider-subtle)',
        color: 'text.secondary',
      }}
    >
      <Typography variant="subtitle2" component="h2" sx={{ color: 'text.primary', mb: 1 }}>
        Select an icon
      </Typography>
      <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2.5, lineHeight: 1.7 }}>
        <li>Click an icon to copy its JSX and see its sizes and other copy formats.</li>
        <li>Search by name or by meaning: “trash”, “gear”, “pencil”.</li>
        <li>
          Press <kbd>Enter</kbd> in the search field to copy the best match; <kbd>/</kbd> focuses
          the search; arrow keys move between icons.
        </li>
      </Typography>
    </Box>
  );
}

/** Searchable grid of every Tecton icon with copy-to-clipboard (JSX, name, import, SVG). */
export function IconBrowser({
  query,
  selected,
  variant,
  onChange,
  stickyTop = 0,
}: IconBrowserProps) {
  // The field keeps its own text so typing never waits for the URL round trip. While it is not
  // focused, it follows the `query` prop (links from the site search, back/forward navigation).
  const [text, setText] = React.useState(query);
  const [focused, setFocused] = React.useState(false);
  if (!focused && text !== query) setText(query);

  const [toast, setToast] = React.useState<Toast | null>(null);
  const [focusName, setFocusName] = React.useState<IconName | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const gridRef = React.useRef<HTMLUListElement>(null);

  const results = React.useMemo(() => searchIcons(text), [text]);
  const tabbable =
    (focusName && results.includes(focusName) && focusName) ||
    (selected && results.includes(selected) && selected) ||
    results[0];

  const copy = React.useCallback(async (value: string | null, what: string) => {
    const ok = value !== null && (await copyText(value));
    setToast({
      key: Date.now(),
      message: ok ? `Copied ${what}` : 'Could not copy. Select the text and copy it manually.',
      error: !ok,
    });
  }, []);

  const activate = React.useCallback(
    (name: IconName) => {
      setFocusName(name);
      onChange({ selected: name });
      void copy(iconJsx(name, variant), iconJsx(name, variant));
    },
    [copy, onChange, variant],
  );

  const focusTile = (name: IconName | undefined) => {
    if (!name) return;
    setFocusName(name);
    gridRef.current?.querySelector<HTMLElement>(`[data-icon="${name}"]`)?.focus();
  };

  // "/" focuses the search field (unless the user is typing somewhere).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const tiles = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-icon]')];
    const index = tiles.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = nextIndex(tiles, index, e.key, rtl);
    if (next === null) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      return;
    }
    e.preventDefault();
    focusTile(tiles[next].dataset.icon as IconName);
  };

  const trimmed = text.trim();

  return (
    <Box>
      <Box
        role="search"
        sx={{
          position: 'sticky',
          top: stickyTop,
          zIndex: 2,
          minHeight: TOOLBAR_HEIGHT,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          py: 1.5,
          mb: 1,
          bgcolor: 'background.default',
        }}
      >
        <TextField
          inputRef={inputRef}
          size="small"
          placeholder="Search icons (trash, gear, chevron…)"
          value={text}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            setText(e.target.value);
            onChange({ query: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) {
              e.preventDefault();
              activate(results[0]);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              focusTile(tabbable);
            } else if (e.key === 'Escape' && text) {
              e.preventDefault();
              setText('');
              onChange({ query: '' });
            }
          }}
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 280px' },
            maxWidth: { sm: 420 },
            // The field has its own clear button.
            '& input::-webkit-search-cancel-button': { display: 'none' },
          }}
          slotProps={{
            htmlInput: {
              'aria-label': 'Search icons',
              'aria-keyshortcuts': '/',
              'aria-controls': 'icon-results',
              type: 'search',
              autoComplete: 'off',
              spellCheck: false,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Icon name="search" size="small" />
                </InputAdornment>
              ),
              endAdornment: text ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Clear search"
                    onClick={() => {
                      setText('');
                      onChange({ query: '' });
                      inputRef.current?.focus();
                    }}
                  >
                    <Icon name="close-small" size="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={variant}
          onChange={(_, v: IconVariant | null) => v && onChange({ variant: v })}
          aria-label="Icon variant"
        >
          <ToggleButton value="outline">Outline</ToggleButton>
          <ToggleButton value="filled">Filled</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ ml: 'auto' }}>
          {trimmed
            ? `${results.length} of ${ICON_NAMES.length} icons`
            : `${ICON_NAMES.length} icons`}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 300px' },
          gridTemplateAreas: { xs: '"details" "grid"', md: '"grid details"' },
          columnGap: 3,
          rowGap: 2,
          alignItems: 'start',
        }}
      >
        <Box
          component="aside"
          sx={{
            gridArea: 'details',
            display: { xs: selected ? 'block' : 'none', md: 'block' },
            position: { md: 'sticky' },
            top: { md: stickyTop + TOOLBAR_HEIGHT + 16 },
          }}
        >
          {selected ? (
            <IconDetails name={selected} variant={variant} copy={copy} />
          ) : (
            <DetailsPlaceholder />
          )}
        </Box>

        <Box sx={{ gridArea: 'grid', minWidth: 0 }}>
          {results.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4 }}>
              No icon matches “{trimmed}”. Try a shorter word or what the icon shows (for example
              “arrow” or “user”).
            </Typography>
          ) : (
            <Box
              component="ul"
              id="icon-results"
              ref={gridRef}
              aria-label="Icons"
              onKeyDown={onGridKeyDown}
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
                gap: 1,
              }}
            >
              {results.map((name) => (
                <IconTile
                  key={name}
                  name={name}
                  variant={variant}
                  selected={name === selected}
                  tabbable={name === tabbable}
                  onActivate={activate}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        key={toast?.key}
        open={toast !== null}
        autoHideDuration={toast?.error ? 6000 : 2500}
        onClose={(_, reason) => reason !== 'clickaway' && setToast(null)}
        message={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Icon name={toast?.error ? 'error' : 'check-circle'} size="small" />
            <span>{toast?.message}</span>
          </Box>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
