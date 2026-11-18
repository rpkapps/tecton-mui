import type { IconName } from '@tecton-mui/ui/Icon';
import { categories, componentPages, type CategoryId } from './catalog';

export interface NavLink {
  title: string;
  /** Router path without the base path. */
  to: string;
  hash?: string;
  /** API-only (generated) page, shown with less emphasis than guide pages. */
  generated?: boolean;
}

export interface NavGroup {
  id: CategoryId;
  title: string;
  items: NavLink[];
}

export interface NavSection {
  id: string;
  title: string;
  icon: IconName;
  items: NavLink[];
  groups?: NavGroup[];
}

export const gettingStarted: NavLink[] = [
  { title: 'Installation', to: '/getting-started/installation' },
  { title: 'Quick Start', to: '/getting-started/quick-start' },
  { title: 'Shell Integration', to: '/getting-started/shell-integration' },
  { title: 'MFE / Standalone Integration', to: '/getting-started/mfe-standalone' },
  { title: 'SSR Setup', to: '/getting-started/ssr' },
  { title: 'Migration from MUI', to: '/getting-started/migration-from-mui' },
];

export const guides: NavLink[] = [
  { title: 'ThemeProvider and light/dark mode', to: '/guides/theming' },
  { title: 'LocalizationProvider and locales', to: '/guides/localization' },
  { title: 'Fonts, icons and style entry points', to: '/guides/styles-and-icons' },
  { title: 'Compatibility and accessibility', to: '/guides/compatibility' },
  { title: 'Licensing and provenance', to: '/guides/licensing' },
];

export const releases: NavLink[] = [
  { title: 'Changelog', to: '/releases/changelog' },
  { title: 'Consumer migration guides', to: '/releases/migration-guides' },
];

const byTitle = (a: NavLink, b: NavLink) =>
  a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });

/** Every component page, grouped by category and sorted by title. */
export const componentGroups: NavGroup[] = categories.map((category) => ({
  id: category.id,
  title: category.title,
  items: componentPages
    .filter((p) => p.category === category.id)
    .map((p) => ({ title: p.title, to: `/components/${p.slug}`, generated: p.kind === 'auto' }))
    .sort(byTitle),
}));

export const navSections: NavSection[] = [
  { id: 'getting-started', title: 'Getting Started', icon: 'home', items: gettingStarted },
  {
    id: 'components',
    title: 'Components',
    icon: 'grid-view',
    items: [{ title: 'All components', to: '/components' }],
    groups: componentGroups,
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: 'code',
    items: [{ title: 'All component APIs', to: '/api' }],
  },
  { id: 'guides', title: 'Guides', icon: 'discovery', items: guides },
  { id: 'releases', title: 'Releases', icon: 'history', items: releases },
];

/** Reading order of the portal (previous/next links at the bottom of each page). */
export const readingOrder: NavLink[] = navSections.flatMap((s) => [
  ...s.items,
  ...(s.groups?.flatMap((g) => g.items) ?? []),
]);

/** Section (and component category) of a path, for the page eyebrow and the open nav group. */
export function locate(pathname: string): { section?: NavSection; group?: NavGroup } {
  for (const section of navSections) {
    for (const group of section.groups ?? []) {
      if (group.items.some((i) => i.to === pathname)) return { section, group };
    }
    if (section.items.some((i) => i.to === pathname)) return { section };
  }
  if (pathname.startsWith('/api')) return { section: navSections.find((s) => s.id === 'api') };
  return {};
}
