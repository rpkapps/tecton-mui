import type * as React from 'react';
import Typography from '@tecton-mui/ui/Typography';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import { DocumentHead } from '../lib/head';
import { RouterLink } from './links';

export interface Crumb {
  title: string;
  to?: string;
}

/**
 * Page title block: eyebrow trail (section / category), title, lead paragraph and optional
 * metadata (chips) below.
 */
export function PageHeader({
  title,
  description,
  crumbs = [],
  searchWeight,
  children,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  /** Pagefind weight of the title (default heading weight 7); guides rank above generated pages. */
  searchWeight?: number;
  children?: React.ReactNode;
}) {
  return (
    <Box component="header" sx={{ mb: 5 }}>
      <DocumentHead title={title} description={description} />
      {crumbs.length > 0 && (
        <Box component="nav" aria-label="Breadcrumb" data-pagefind-ignore="all" sx={{ mb: 1.5 }}>
          <Box
            component="ol"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0.5,
              listStyle: 'none',
              m: 0,
              p: 0,
              typography: 'caption',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <Box
                  component="li"
                  key={c.title}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                >
                  {c.to ? (
                    <RouterLink
                      to={c.to as '/'}
                      underline="hover"
                      sx={{ color: last ? 'var(--docs-accent)' : 'text.secondary' }}
                    >
                      {c.title}
                    </RouterLink>
                  ) : (
                    <Box
                      component="span"
                      aria-current={last ? 'page' : undefined}
                      sx={{ color: last ? 'var(--docs-accent)' : 'text.secondary' }}
                    >
                      {c.title}
                    </Box>
                  )}
                  {!last && (
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        display: 'inline-flex',
                        color: 'text.disabled',
                        '[dir=rtl] &': { transform: 'scaleX(-1)' },
                      }}
                    >
                      <Icon name="chevron-right-small" size="small" />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      <Typography
        variant="h2"
        component="h1"
        data-pagefind-weight={searchWeight ?? 10}
        sx={{
          fontSize: { xs: 32, md: 40 },
          lineHeight: 1.2,
          letterSpacing: '-0.015em',
          mb: 1.5,
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          component="p"
          color="text.secondary"
          sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.6, maxWidth: 760 }}
        >
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}
