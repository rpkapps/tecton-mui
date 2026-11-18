import { createFileRoute } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Box from '@tecton-mui/ui/Box';
import { apiEntries, categories, componentCategory } from '../../data/catalog';
import { PageHeader } from '../../components/PageHeader';
import { RouterLink } from '../../components/links';
import { DocsTable, SectionHeading } from '../../components/mdx';
import { toSlug } from '../../lib/slug';

function ApiIndex() {
  return (
    <>
      <PageHeader
        title="API Reference"
        description="Props, events and slots generated from the TypeScript declarations of @tecton-mui/ui."
        crumbs={[{ title: 'API Reference' }]}
      />
      <Typography sx={{ mb: 3, lineHeight: 1.7 }}>
        Tables list the props a component declares itself. Standard HTML attributes, ARIA attributes
        and DOM event handlers are accepted as well and are summarised under each table. Types are
        shown as declared; follow the import path to inspect them in your editor.
      </Typography>
      {categories.map((category) => {
        const entries = apiEntries.filter(
          (e) => (componentCategory[e.name] ?? 'utilities') === category.id,
        );
        if (!entries.length) return null;
        return (
          <Box component="section" key={category.id} sx={{ mb: 4 }}>
            <SectionHeading level={2} id={category.id} sx={{ mt: 5, mb: 0 }}>
              {category.title}
            </SectionHeading>
            <DocsTable label={`${category.title} APIs`}>
              <TableHead>
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell>Import path</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell align="right">Own props</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.name}>
                    <TableCell>
                      <RouterLink to="/api/$slug" params={{ slug: toSlug(e.name) }}>
                        {e.name}
                      </RouterLink>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'var(--tecton-font-family-mono)', fontSize: 13 }}>
                      @tecton-mui/ui/{e.name}
                    </TableCell>
                    <TableCell>{e.package}</TableCell>
                    <TableCell align="right">{e.propCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DocsTable>
          </Box>
        );
      })}
    </>
  );
}

export const Route = createFileRoute('/api/')({
  component: ApiIndex,
});
