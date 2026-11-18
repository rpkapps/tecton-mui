import type * as React from 'react';
import Typography from '@tecton-mui/ui/Typography';
import Breadcrumbs from '@tecton-mui/ui/Breadcrumbs';
import Box from '@tecton-mui/ui/Box';
import { DocumentHead } from '../lib/head';
import { RouterLink } from './links';

export interface Crumb {
  title: string;
  to?: string;
}

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
    <Box component="header" sx={{ mb: 3 }}>
      <DocumentHead title={title} description={description} />
      {crumbs.length > 0 && (
        <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1 }} data-pagefind-ignore="all">
          {crumbs.map((c) =>
            c.to ? (
              <RouterLink key={c.title} to={c.to as '/'} color="inherit" variant="body2">
                {c.title}
              </RouterLink>
            ) : (
              <Typography key={c.title} variant="body2" color="text.secondary">
                {c.title}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        data-pagefind-weight={searchWeight ?? 10}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="subtitle1" color="text.secondary">
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}
