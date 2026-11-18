import { createFileRoute } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Paper from '@tecton-mui/ui/Paper';
import Box from '@tecton-mui/ui/Box';
import { apiEntries, categories, componentCategory } from '../../data/catalog';
import { PageHeader } from '../../components/PageHeader';
import { RouterLink } from '../../components/links';
import { toSlug } from '../../lib/slug';

function ApiIndex() {
  return (
    <>
      <PageHeader
        title="API Reference"
        description="Props, events and slots generated from the TypeScript declarations of @tecton-mui/ui."
      />
      <Typography sx={{ mb: 3 }}>
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
            <Typography variant="h5" component="h2" id={category.id} sx={{ mb: 1 }}>
              {category.title}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" aria-label={`${category.title} APIs`}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Component</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Import path</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Own props
                    </TableCell>
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
                      <TableCell sx={{ typography: 'data', fontSize: 13 }}>
                        @tecton-mui/ui/{e.name}
                      </TableCell>
                      <TableCell>{e.package}</TableCell>
                      <TableCell align="right">{e.propCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
      <Typography variant="body2" color="text.secondary">
        Data Grid, range pickers and the unified Rich Tree View are being integrated; their API
        tables will appear here once they ship.
      </Typography>
    </>
  );
}

export const Route = createFileRoute('/api/')({
  component: ApiIndex,
});
