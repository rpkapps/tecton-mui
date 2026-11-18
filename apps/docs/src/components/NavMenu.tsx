import * as React from 'react';
import { useRouterState } from '@tanstack/react-router';
import List from '@tecton-mui/ui/List';
import ListItemButton from '@tecton-mui/ui/ListItemButton';
import ListItemText from '@tecton-mui/ui/ListItemText';
import ListSubheader from '@tecton-mui/ui/ListSubheader';
import Collapse from '@tecton-mui/ui/Collapse';
import Icon from '@tecton-mui/ui/Icon';
import { navSections, type NavGroup, type NavLink } from '../data/nav';
import { getComponentPage } from '../data/catalog';
import { ListItemLink } from './links';

function NavItem({
  item,
  nested,
  onNavigate,
}: {
  item: NavLink;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ListItemLink
      to={item.to}
      hash={item.hash}
      onClick={onNavigate}
      activeOptions={{ exact: true, includeHash: Boolean(item.hash) }}
      activeProps={{ selected: true, 'aria-current': 'page' }}
      dense
      sx={{ pl: nested ? 4 : 2, borderRadius: 1, mx: 1 }}
    >
      <ListItemText primary={item.title} slotProps={{ primary: { variant: 'body2' } }} />
    </ListItemLink>
  );
}

function Group({
  group,
  open,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const id = `nav-group-${group.id}`;
  return (
    <>
      <ListItemButton
        dense
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        sx={{ borderRadius: 1, mx: 1 }}
      >
        <ListItemText
          primary={group.title}
          slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
        />
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size="small" />
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit id={id}>
        <List disablePadding>
          {group.items.map((item) => (
            <NavItem key={item.to + (item.hash ?? '')} item={item} nested onNavigate={onNavigate} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

/** Portal navigation following the consumer information architecture. */
export function NavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentCategory = React.useMemo(() => {
    const match = /\/components\/([^/]+)/.exec(pathname);
    return match ? getComponentPage(match[1])?.category : undefined;
  }, [pathname]);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const isOpen = (id: string) => openGroups[id] ?? id === currentCategory;

  return (
    <nav aria-label="Documentation">
      {navSections.map((section) => (
        <List
          key={section.title}
          dense
          subheader={
            <ListSubheader component="div" disableSticky sx={{ bgcolor: 'transparent' }}>
              {section.title}
            </ListSubheader>
          }
        >
          {section.items.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
          {section.groups?.map((group) => (
            <Group
              key={group.id}
              group={group}
              open={isOpen(group.id)}
              onToggle={() => setOpenGroups((s) => ({ ...s, [group.id]: !isOpen(group.id) }))}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      ))}
    </nav>
  );
}
