import { createFileRoute } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import Grid from '@tecton-mui/ui/Grid';
import Card from '@tecton-mui/ui/Card';
import CardActionArea, { type CardActionAreaProps } from '@tecton-mui/ui/CardActionArea';
import CardContent from '@tecton-mui/ui/CardContent';
import Chip from '@tecton-mui/ui/Chip';
import Box from '@tecton-mui/ui/Box';
import { createLink } from '@tanstack/react-router';
import * as React from 'react';
import { categories, pagesInCategory } from '../../data/catalog';
import { PageHeader } from '../../components/PageHeader';

const CardLinkBase = React.forwardRef<HTMLAnchorElement, CardActionAreaProps<'a'>>(
  function CardLinkBase(props, ref) {
    return <CardActionArea component="a" ref={ref} {...props} />;
  },
);
const CardLink = createLink(CardLinkBase);

function ComponentsIndex() {
  return (
    <>
      <PageHeader
        title="Components"
        description="Every component exported by @tecton-mui/ui, grouped by purpose. Pages with a guide include live demos; the others are generated from the package types."
      />
      {categories.map((category) => {
        const pages = pagesInCategory(category.id);
        return (
          <Box component="section" key={category.id} sx={{ mb: 5 }}>
            <Typography variant="h5" component="h2" id={category.id} sx={{ scrollMarginTop: 80 }}>
              {category.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {category.description}
            </Typography>
            <Grid container spacing={2}>
              {pages.map((p) => (
                <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardLink
                      to="/components/$slug"
                      params={{ slug: p.slug }}
                      sx={{ height: '100%' }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" component="h3">
                          {p.title}
                        </Typography>
                        {p.summary && (
                          <Typography variant="body2" color="text.secondary">
                            {p.summary}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1 }}>
                          {p.kind === 'authored' && p.status !== 'integration-pending' && (
                            <Chip
                              size="small"
                              label="Guide + demos"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {p.status === 'integration-pending' && (
                            <Chip size="small" label="Integration in progress" variant="outlined" />
                          )}
                          {p.kind === 'auto' && (
                            <Chip size="small" label="API" variant="outlined" />
                          )}
                        </Box>
                      </CardContent>
                    </CardLink>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </>
  );
}

export const Route = createFileRoute('/components/')({
  component: ComponentsIndex,
});
