import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import Box from '@tecton-mui/ui/Box';
import TextField from '@tecton-mui/ui/TextField';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import Icon from '@tecton-mui/ui/Icon';
import { categories, pagesInCategory } from '../../data/catalog';
import { PageHeader } from '../../components/PageHeader';
import { RouterLink } from '../../components/links';
import { SectionHeading } from '../../components/mdx';

function ComponentsIndex() {
  const [filter, setFilter] = React.useState('');
  const query = filter.trim().toLowerCase();
  const sections = categories
    .map((category) => ({
      category,
      pages: pagesInCategory(category.id)
        .filter(
          (p) =>
            !query ||
            p.title.toLowerCase().includes(query) ||
            p.summary.toLowerCase().includes(query),
        )
        .sort((a, b) =>
          a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === 'authored' ? -1 : 1,
        ),
    }))
    .filter((s) => s.pages.length > 0);

  return (
    <>
      <PageHeader
        title="Components"
        description="Every component exported by @tecton-mui/ui, grouped by purpose. Guides with live demos come first in each group; the other pages are generated from the package types."
        crumbs={[{ title: 'Components' }]}
      />
      <TextField
        size="small"
        placeholder="Filter components"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 } }}
        slotProps={{
          htmlInput: { 'aria-label': 'Filter components', type: 'search' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="filter" size="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {sections.length === 0 && (
        <Typography color="text.secondary" sx={{ my: 4 }}>
          No component matches “{filter.trim()}”.
        </Typography>
      )}
      {sections.map(({ category, pages }) => (
        <Box component="section" key={category.id} sx={{ mb: 2 }}>
          <SectionHeading level={2} id={category.id} sx={{ mt: 5, mb: 0.5 }}>
            {category.title}
          </SectionHeading>
          <Typography color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            {category.description}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1.5,
            }}
          >
            {pages.map((p) => (
              <RouterLink
                key={p.slug}
                to="/components/$slug"
                params={{ slug: p.slug }}
                underline="none"
                sx={{
                  display: 'block',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid var(--tecton-color-divider-subtle)',
                  bgcolor: p.kind === 'authored' ? 'background.paper' : 'transparent',
                  color: 'text.primary',
                  transition: 'border-color 120ms',
                  '&:hover': { borderColor: 'var(--docs-accent)' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle2" component="h3" noWrap>
                    {p.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      flexShrink: 0,
                      color: p.kind === 'authored' ? 'var(--docs-accent)' : 'text.secondary',
                    }}
                  >
                    {p.status === 'integration-pending'
                      ? 'In progress'
                      : p.kind === 'authored'
                        ? 'Guide + demos'
                        : 'API'}
                  </Typography>
                </Box>
                {p.summary && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.5 }}
                  >
                    {p.summary}
                  </Typography>
                )}
              </RouterLink>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
}

export const Route = createFileRoute('/components/')({
  component: ComponentsIndex,
});
