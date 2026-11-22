import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import Box from '@tecton-mui/ui/Box';
import Stack from '@tecton-mui/ui/Stack';
import Paper from '@tecton-mui/ui/Paper';
import TextField from '@tecton-mui/ui/TextField';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Chip from '@tecton-mui/ui/Chip';
import Slider from '@tecton-mui/ui/Slider';
import Switch from '@tecton-mui/ui/Switch';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Button from '@tecton-mui/ui/Button';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import LinearProgress from '@tecton-mui/ui/LinearProgress';
import Divider from '@tecton-mui/ui/Divider';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';
import { TECTON_VERSION } from '@tecton-mui/ui/styles';
import { DocumentHead } from '../lib/head';
import { ButtonLink, RouterLink } from '../components/links';
import { CodeBlock } from '../components/CodeBlock';
import { InlineCode } from '../components/mdx';
import { categories, componentPages, muiVersions, type CategoryId } from '../data/catalog';

const CATEGORY_ICON: Record<CategoryId, IconName> = {
  inputs: 'edit-square',
  'data-display': 'view-module',
  feedback: 'notifications',
  surfaces: 'layers',
  navigation: 'map',
  layout: 'grid-view',
  utilities: 'settings',
  lab: 'discovery',
  'data-grid': 'view-column',
  'date-time-pickers': 'calendar',
  'tree-view': 'folder-open',
  chat: 'chat',
};

const pillars: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'code',
    title: 'The MUI API you know',
    text: 'Same component names, props, slots, refs and theme keys as Material UI, MUI Lab and MUI X Community. Root and per-component imports both work.',
  },
  {
    icon: 'design',
    title: 'Tecton by default',
    text: 'Tecton tokens, Figtree and IBM Plex Mono, the Tecton icon set and a light/dark mode shared by every React root, with no theme setup.',
  },
  {
    icon: 'controls',
    title: 'Advanced features, no keys',
    text: 'Grouping, pinning, tree data and undo in the DataGrid, range pickers and a reorderable RichTreeView, built independently and switched on by props.',
  },
];

const minimalApp = `import '@tecton-mui/ui/styles/global.css';
import CssBaseline from '@tecton-mui/ui/CssBaseline';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { Button, Stack, TextField } from '@tecton-mui/ui';

export function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Stack direction="row" spacing={2}>
        <TextField label="Well name" size="small" />
        <Button variant="contained">Save</Button>
      </Stack>
    </ThemeProvider>
  );
}`;

/** A small live composition of real components; everything in it is interactive. */
function Showcase() {
  const [field, setField] = React.useState('volve');
  const [type, setType] = React.useState<string | null>('producer');
  const [inclination, setInclination] = React.useState<number[]>([12, 48]);
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        borderColor: 'var(--tecton-color-divider-subtle)',
        bgcolor: 'background.paper',
        boxShadow: '0 24px 48px -24px var(--tecton-color-backdrop-fill)',
      }}
      aria-label="Live example built with Tecton MUI components"
      component="section"
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'var(--tecton-color-content-bg-active)',
            color: 'var(--docs-accent)',
          }}
        >
          <Icon name="well" size="medium" />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle1" component="h2" noWrap>
            NO 15/9-F-12
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p">
            Well plan · revision 4
          </Typography>
        </Box>
        <Chip size="small" color="success" label="Approved" />
      </Stack>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Field"
            select
            size="small"
            fullWidth
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            <MenuItem value="volve">Volve</MenuItem>
            <MenuItem value="sleipner">Sleipner</MenuItem>
            <MenuItem value="johan-sverdrup">Johan Sverdrup</MenuItem>
          </TextField>
          <TextField label="Target depth" size="small" fullWidth defaultValue="3 520 m MD" />
        </Stack>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={type}
          onChange={(_, v: string | null) => v && setType(v)}
          aria-label="Well type"
          fullWidth
        >
          <ToggleButton value="producer">Producer</ToggleButton>
          <ToggleButton value="injector">Injector</ToggleButton>
          <ToggleButton value="observation">Observation</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ px: 1 }}>
          <Typography variant="caption" color="text.secondary" id="home-inclination">
            Inclination window: {inclination[0]}° – {inclination[1]}°
          </Typography>
          <Slider
            value={inclination}
            onChange={(_, v) => setInclination(v as number[])}
            min={0}
            max={90}
            aria-labelledby="home-inclination"
            getAriaValueText={(v) => `${v} degrees`}
          />
        </Box>
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              Drilling progress
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'var(--tecton-font-family-mono)' }}>
              2 310 / 3 520 m
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={66} aria-label="Drilling progress" />
        </Box>
        <Divider sx={{ borderColor: 'var(--tecton-color-divider-subtle)' }} />
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <FormControlLabel control={<Switch defaultChecked />} label="Notify crew" />
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" size="small">
            Discard
          </Button>
          <Button variant="contained" size="small" startIcon={<Icon name="check" size="small" />}>
            Save plan
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function Home() {
  const counts = new Map<CategoryId, number>();
  for (const p of componentPages) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return (
    <>
      <DocumentHead description="Documentation for @tecton-mui/ui: MUI-compatible React components preconfigured with the Tecton design system." />

      {/* Hero */}
      <Box
        component="header"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(0, 1fr)' },
          gap: { xs: 5, lg: 8 },
          alignItems: 'center',
          py: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            variant="outlined"
            icon={<Icon name="layers" size="small" />}
            label={`Tecton ${TECTON_VERSION} · Material UI ${muiVersions['@mui/material'] ?? ''}`}
            sx={{ mb: 3 }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 36, sm: 44, md: 52 },
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              mb: 2.5,
            }}
          >
            MUI components,{' '}
            <Box component="span" sx={{ color: 'var(--docs-accent)' }}>
              Tecton inside.
            </Box>
          </Typography>
          <Typography
            component="p"
            color="text.secondary"
            sx={{ fontSize: { xs: 17, md: 19 }, lineHeight: 1.6, maxWidth: 600, mb: 4 }}
          >
            <InlineCode>@tecton-mui/ui</InlineCode> gives React applications the familiar MUI API
            with the Tecton design system already applied: tokens, typography, icons and a shared
            light/dark mode, plus a DataGrid, pickers and tree views for engineering data.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4 }}>
            <ButtonLink
              to="/getting-started/installation"
              variant="contained"
              size="large"
              endIcon={<Icon name="arrow-right" size="small" />}
            >
              Get started
            </ButtonLink>
            <ButtonLink to="/components" variant="outlined" size="large">
              Browse components
            </ButtonLink>
          </Stack>
          <Box sx={{ maxWidth: 440 }}>
            <CodeBlock code="pnpm add @tecton-mui/ui" language="bash" title="Install" />
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Showcase />
        </Box>
      </Box>

      {/* Pillars */}
      <Box
        component="section"
        aria-label="Highlights"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 3, md: 4 },
          py: { xs: 4, md: 6 },
          borderTop: '1px solid var(--tecton-color-divider-subtle)',
        }}
      >
        {pillars.map((p) => (
          <Box key={p.title}>
            <Box sx={{ color: 'var(--docs-accent)', mb: 1.5, display: 'inline-flex' }}>
              <Icon name={p.icon} size="large" />
            </Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              {p.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              {p.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Component families */}
      <Box component="section" sx={{ py: { xs: 4, md: 6 } }} aria-labelledby="home-families">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 3 }}
        >
          <Box>
            <Typography variant="h4" component="h2" id="home-families" sx={{ mb: 1 }}>
              Component families
            </Typography>
            <Typography color="text.secondary">
              {componentPages.length} component pages, grouped the way MUI groups them.
            </Typography>
          </Box>
          <RouterLink to="/components" sx={{ whiteSpace: 'nowrap', typography: 'body2' }}>
            All components →
          </RouterLink>
        </Stack>
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
          {categories.map((c) => (
            <RouterLink
              key={c.id}
              to="/components"
              hash={c.id}
              underline="none"
              sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: '1px solid var(--tecton-color-divider-subtle)',
                bgcolor: 'background.paper',
                color: 'text.primary',
                transition: 'border-color 120ms, transform 120ms',
                '&:hover': { borderColor: 'var(--docs-accent)' },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'var(--tecton-color-content-bg-hover)',
                  color: 'var(--docs-accent)',
                }}
              >
                <Icon name={CATEGORY_ICON[c.id]} size="medium" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" component="h3" sx={{ mb: 0.25 }}>
                  {c.title}{' '}
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                    · {counts.get(c.id) ?? 0}
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {c.description}
                </Typography>
              </Box>
            </RouterLink>
          ))}
        </Box>
      </Box>

      {/* Minimal app */}
      <Box
        component="section"
        aria-labelledby="home-minimal"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.8fr) minmax(0, 1.2fr)' },
          gap: { xs: 2, md: 6 },
          alignItems: 'start',
          py: { xs: 4, md: 6 },
          borderTop: '1px solid var(--tecton-color-divider-subtle)',
        }}
      >
        <Box>
          <Typography variant="h4" component="h2" id="home-minimal" sx={{ mb: 1.5 }}>
            Three steps to a Tecton app
          </Typography>
          <Box
            component="ol"
            sx={{ pl: 2.5, m: 0, color: 'text.secondary', '& li': { mb: 1.25, lineHeight: 1.6 } }}
          >
            <li>Load the Tecton fonts, icons and tokens once with the global stylesheet.</li>
            <li>
              Wrap the app in <InlineCode>ThemeProvider</InlineCode>; it reads the shared light/dark
              mode.
            </li>
            <li>Import components from the package root or from per-component subpaths.</li>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
            <RouterLink to="/getting-started/quick-start" sx={{ typography: 'body2' }}>
              Quick start →
            </RouterLink>
            <RouterLink to="/getting-started/migration-from-mui" sx={{ typography: 'body2' }}>
              Migrating from MUI →
            </RouterLink>
          </Stack>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <CodeBlock code={minimalApp} language="tsx" title="App.tsx" />
        </Box>
      </Box>
    </>
  );
}

export const Route = createFileRoute('/')({
  component: Home,
});
