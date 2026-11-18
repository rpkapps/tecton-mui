import { createFileRoute } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import Grid from '@tecton-mui/ui/Grid';
import Card from '@tecton-mui/ui/Card';
import CardContent from '@tecton-mui/ui/CardContent';
import CardActions from '@tecton-mui/ui/CardActions';
import Stack from '@tecton-mui/ui/Stack';
import Box from '@tecton-mui/ui/Box';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';
import { TECTON_VERSION } from '@tecton-mui/ui/styles';
import { DocumentHead } from '../lib/head';
import { ButtonLink } from '../components/links';
import { CodeBlock } from '../components/CodeBlock';
import { apiEntries, muiVersions } from '../data/catalog';

const tiles: { icon: IconName; title: string; text: string; to: string; cta: string }[] = [
  {
    icon: 'download',
    title: 'Getting started',
    text: 'Install the package, load the Tecton styles once and render your first components.',
    to: '/getting-started/installation',
    cta: 'Install',
  },
  {
    icon: 'grid-view',
    title: 'Components',
    text: `${apiEntries.length} components from MUI Core, Lab and MUI X Community, styled by Tecton.`,
    to: '/components',
    cta: 'Browse components',
  },
  {
    icon: 'dark-mode',
    title: 'Theme and modes',
    text: 'One ThemeProvider with Tecton defaults and a light/dark mode shared by every root.',
    to: '/guides/theming',
    cta: 'Read the guide',
  },
  {
    icon: 'reports-analytics',
    title: 'API reference',
    text: 'Props, events and slots generated from the TypeScript declarations you import.',
    to: '/api',
    cta: 'Open the API',
  },
];

const quick = `import '@tecton-mui/ui/styles/global.css';
import CssBaseline from '@tecton-mui/ui/CssBaseline';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { Button } from '@tecton-mui/ui';

export function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Button variant="contained">Save</Button>
    </ThemeProvider>
  );
}`;

function Home() {
  return (
    <>
      <DocumentHead description="Documentation for @tecton-mui/ui: MUI-compatible React components preconfigured with the Tecton design system." />
      <Box component="header" sx={{ py: { xs: 2, md: 4 } }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Tecton MUI
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: 720, mb: 3 }}>
          React components with the familiar MUI API, preconfigured with the Tecton design system
          (Tecton {TECTON_VERSION}). Import from <code>@tecton-mui/ui</code> and get Tecton tokens,
          typography, icons and light/dark mode without extra setup.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <ButtonLink to="/getting-started/quick-start" variant="contained">
            Quick start
          </ButtonLink>
          <ButtonLink to="/getting-started/migration-from-mui" variant="outlined">
            Migrating from MUI
          </ButtonLink>
        </Stack>
      </Box>
      <Grid container spacing={2} sx={{ my: 2 }}>
        {tiles.map((t) => (
          <Grid key={t.title} size={{ xs: 12, sm: 6 }}>
            <Card
              variant="outlined"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <Icon name={t.icon} size="large" />
                  <Typography variant="h6" component="h2">
                    {t.title}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t.text}
                </Typography>
              </CardContent>
              <CardActions>
                <ButtonLink to={t.to as '/'} size="small">
                  {t.cta}
                </ButtonLink>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" component="h2" sx={{ mt: 5 }}>
        A minimal application
      </Typography>
      <CodeBlock code={quick} language="tsx" />
      <Typography variant="body2" color="text.secondary">
        Built on{' '}
        {Object.entries(muiVersions)
          .map(([n, v]) => `${n} ${v}`)
          .join(', ')}
        .
      </Typography>
    </>
  );
}

export const Route = createFileRoute('/')({
  component: Home,
});
