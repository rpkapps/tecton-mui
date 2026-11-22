import * as React from 'react';
import List from '@tecton-mui/ui/List';
import ListItemButton from '@tecton-mui/ui/ListItemButton';
import Collapse from '@tecton-mui/ui/Collapse';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';
import { navSections, locate, type NavGroup, type NavLink } from '../data/nav';
import { ListItemLink, usePathname } from './links';

const STORAGE_KEY = 'tecton-docs-nav-groups';

type OpenState = Record<string, boolean>;

function readOpenState(): OpenState {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as OpenState) : {};
  } catch {
    return {};
  }
}

const itemSx = {
  borderRadius: 1,
  minHeight: 32,
  py: 0.5,
  px: 1.5,
  mb: 0.25,
  typography: 'body2',
  lineHeight: 1.4,
  color: 'text.secondary',
  '&:hover': { color: 'text.primary' },
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'var(--docs-accent)',
    fontWeight: 600,
    bgcolor: 'var(--tecton-color-content-bg-active)',
  },
} as const;

const NavItem = React.memo(function NavItem({
  item,
  onNavigate,
}: {
  item: NavLink;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <ListItemLink
        to={item.to}
        hash={item.hash}
        onClick={onNavigate}
        activeOptions={{ exact: true, includeHash: Boolean(item.hash) }}
        activeProps={{ selected: true, 'aria-current': 'page' }}
        sx={itemSx}
      >
        {item.title}
      </ListItemLink>
    </li>
  );
});

function Group({
  group,
  open,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  onNavigate?: () => void;
}) {
  const id = `nav-group-${group.id}`;
  return (
    <li>
      <ListItemButton
        onClick={() => onToggle(group.id, !open)}
        aria-expanded={open}
        aria-controls={id}
        sx={{
          ...itemSx,
          color: 'text.primary',
          fontWeight: 500,
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <span>{group.title}</span>
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}
        >
          <Typography component="span" variant="caption" sx={{ color: 'inherit' }}>
            {group.items.length}
          </Typography>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              transition: 'transform 150ms',
              transform: open ? 'rotate(90deg)' : 'none',
              '[dir=rtl] &': { transform: open ? 'rotate(90deg)' : 'scaleX(-1)' },
            }}
          >
            <Icon name="chevron-right" size="small" />
          </Box>
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit id={id}>
        <List
          disablePadding
          sx={{
            marginInlineStart: (t) => t.spacing(2.25),
            paddingInlineStart: (t) => t.spacing(1),
            borderInlineStart: '1px solid var(--tecton-color-divider-subtle)',
            mt: 0.25,
            mb: 1,
          }}
        >
          {group.items.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </List>
      </Collapse>
    </li>
  );
}

/**
 * Portal navigation following the consumer information architecture. Every component page is
 * listed under its category. Category groups are collapsible; their state is remembered in
 * localStorage and the group of the current page is always opened.
 */
export function NavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const currentGroup = locate(pathname).group?.id;
  const [state, setState] = React.useState(() => ({
    open: readOpenState(),
    forGroup: currentGroup,
  }));
  // Open the group of the page being viewed (derived during render, no effect needed).
  if (state.forGroup !== currentGroup) {
    setState({
      forGroup: currentGroup,
      open: currentGroup ? { ...state.open, [currentGroup]: true } : state.open,
    });
  }
  const isOpen = (id: string) => state.open[id] ?? id === currentGroup;
  const onToggle = React.useCallback((id: string, open: boolean) => {
    setState((s) => {
      const next = { ...s.open, [id]: open };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable: the state lasts for this page view only.
      }
      return { ...s, open: next };
    });
  }, []);

  const navRef = React.useRef<HTMLElement>(null);
  // Keep the active item visible inside the scrolling sidebar.
  React.useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    const scroller = nav?.closest<HTMLElement>('[data-nav-scroll]');
    if (!active || !scroller) return;
    const a = active.getBoundingClientRect();
    const s = scroller.getBoundingClientRect();
    if (a.top < s.top + 48 || a.bottom > s.bottom - 48) {
      scroller.scrollTop += a.top - s.top - s.height / 3;
    }
  }, [pathname]);

  return (
    <Box component="nav" aria-label="Documentation" ref={navRef} sx={{ px: 1.5, py: 2 }}>
      {navSections.map((section) => (
        <Box key={section.id} sx={{ mb: 2.5 }}>
          <Typography
            component="h2"
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              mb: 0.75,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'text.primary',
            }}
          >
            <Box component="span" sx={{ display: 'inline-flex', color: 'var(--docs-accent)' }}>
              <Icon name={section.icon} size="small" />
            </Box>
            {section.title}
          </Typography>
          <List disablePadding>
            {section.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
            {section.groups?.map((group) => (
              <Group
                key={group.id}
                group={group}
                open={isOpen(group.id)}
                onToggle={onToggle}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}
