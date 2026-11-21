import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TECTON_VERSION } from '@tecton-mui/ui/styles';
import type { IconName } from '@tecton-mui/ui/Icon';
import { PageHeader } from '../components/PageHeader';
import { HEADER_HEIGHT } from '../components/AppShell';
import { IconBrowser, type IconBrowserState } from '../components/icons/IconBrowser';
import { ICON_NAMES } from '../components/icons/iconSearch';

export interface IconsSearch {
  /** Search text. */
  q?: string;
  /** Selected icon. */
  icon?: IconName;
  /** Only `filled` is stored; outline is the default. */
  variant?: 'filled';
}

const isIconName = (value: unknown): value is IconName =>
  typeof value === 'string' && (ICON_NAMES as string[]).includes(value);

function IconsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const onChange = React.useCallback(
    (patch: Partial<IconBrowserState>) => {
      void navigate({
        replace: true,
        resetScroll: false,
        search: (prev) => {
          const next: IconsSearch = { ...prev };
          if ('query' in patch) next.q = patch.query || undefined;
          if ('selected' in patch) next.icon = patch.selected ?? undefined;
          if ('variant' in patch) next.variant = patch.variant === 'filled' ? 'filled' : undefined;
          return next;
        },
      });
    },
    [navigate],
  );

  return (
    <>
      <PageHeader
        title="Icons"
        description={`All ${ICON_NAMES.length} icons of Tecton ${TECTON_VERSION}. Search by name or by what an icon shows, then copy it as JSX, a name, the import or SVG markup.`}
        crumbs={[{ title: 'Icons' }]}
      />
      <IconBrowser
        query={search.q ?? ''}
        selected={search.icon ?? null}
        variant={search.variant ?? 'outline'}
        onChange={onChange}
        stickyTop={HEADER_HEIGHT}
      />
    </>
  );
}

export const Route = createFileRoute('/icons')({
  validateSearch: (raw: Record<string, unknown>): IconsSearch => ({
    // The router JSON-parses values, so `?q=3` arrives as a number.
    q:
      typeof raw.q === 'string' || typeof raw.q === 'number'
        ? String(raw.q) || undefined
        : undefined,
    icon: isIconName(raw.icon) ? raw.icon : undefined,
    variant: raw.variant === 'filled' ? 'filled' : undefined,
  }),
  component: IconsPage,
});
