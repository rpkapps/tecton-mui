import { categories, componentPages, type CategoryId } from './catalog';

export interface NavLink {
  title: string;
  /** Router path without the base path. */
  to: string;
  hash?: string;
}

export interface NavGroup {
  id: CategoryId;
  title: string;
  items: NavLink[];
}

export interface NavSection {
  title: string;
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

export const componentGroups: NavGroup[] = categories.map((category) => {
  const pages = componentPages.filter((p) => p.category === category.id);
  const authored = pages.filter((p) => p.kind === 'authored');
  const items: NavLink[] = authored.map((p) => ({
    title: p.title,
    to: `/components/${p.slug}`,
  }));
  const more = pages.length - authored.length;
  if (more > 0) {
    items.push({ title: `More ${category.title} (${more})`, to: '/components', hash: category.id });
  }
  return { id: category.id, title: category.title, items };
});

export const navSections: NavSection[] = [
  { title: 'Getting Started', items: gettingStarted },
  {
    title: 'Components',
    items: [{ title: 'All components', to: '/components' }],
    groups: componentGroups,
  },
  { title: 'API Reference', items: [{ title: 'All component APIs', to: '/api' }] },
  { title: 'Guides', items: guides },
  { title: 'Releases', items: releases },
];
