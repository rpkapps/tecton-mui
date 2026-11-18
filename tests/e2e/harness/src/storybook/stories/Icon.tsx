// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
/* eslint-disable @typescript-eslint/no-unused-expressions -- verbatim story code */
import * as React from 'react';
import iconsCss from '../../../../../../packages/ui/assets/tecton/icons.css?raw';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary as AccordionSummary_a,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@tecton-mui/ui';

// The Storybook fetches the CDN icons.css (window.__TECTON_ICONS_CSS_URL__); we read the same
// stylesheet as packaged by @tecton-mui/ui.
function Q() {
  const t = new Set<string>(),
    s = /^\.tecton-([a-z0-9-]+) \{ --tecton-icon-url:/gm;
  let o;
  for (; (o = s.exec(iconsCss));) t.add(o[1]);
  return [...t].sort();
}
const h = Q();
const X = new Set([
  'drill-bit',
  'fault',
  'geobodies',
  'geostructure',
  'horizon',
  'layers',
  'log-curve',
  'oil-rig-offshore',
  'rock-formations',
  'seismic',
  'slice',
  'strata',
  'surface',
  'trajectory',
  'velocity-model',
  'well',
  'well-pick',
  'well-plan',
]);
function Y(n) {
  if (/(-letters|-symbol|-placeholder-symbol)$/.test(n))
    return { category: 'app', variant: null, baseName: n };
  const a = /^(.+)-(filled|outline)$/.exec(n);
  if (!a) return { category: 'general', variant: null, baseName: n };
  const [, t, s] = a;
  return { category: X.has(t) ? 'subsurface' : 'general', variant: s, baseName: t };
}
function r(n, a) {
  const t = [`tecton-${n}`];
  return (a && t.unshift(`tecton-icon-${a}`), t.join(' '));
}
const Z = [
  { key: 'lg', label: 'Large', px: 24 },
  { key: 'md', label: 'Medium', px: 20 },
  { key: 'sm', label: 'Small', px: 16 },
  { key: 'xs', label: 'Tiny', px: 12 },
];
function P({ keys: n }) {
  return n.length === 0 ? (
    <Typography variant="caption" sx={{ opacity: 0.7, py: 2 }}>
      No matches.
    </Typography>
  ) : (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
        gap: 2,
        width: '100%',
      }}
    >
      {n.map((a) => (
        <Box
          key={a}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1.5,
            padding: 2,
            minHeight: 96,
            border: '1px solid var(--tecton-color-divider-default)',
            borderRadius: 1.5,
            backgroundColor: 'var(--tecton-color-surface-base-background)',
            minWidth: 0,
            textAlign: 'center',
            transition: 'background-color 120ms, border-color 120ms',
            '&:hover': {
              borderColor: 'var(--tecton-color-action-outlined-border-hover)',
              backgroundColor: 'var(--tecton-color-action-tertiary-bg-hover)',
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className={r(a, 'lg')} aria-hidden />
          </Box>
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              wordBreak: 'break-word',
              fontSize: 11,
              lineHeight: 1.4,
              width: '100%',
              opacity: 0.85,
            }}
          >
            {a}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
function V(n) {
  const a = { outline: [], filled: [], plain: [] },
    t = { outline: [], filled: [], plain: [] },
    s = [];
  for (const o of n) {
    const l = Y(o);
    if (l.category === 'app') {
      s.push(o);
      continue;
    }
    const d = l.category === 'general' ? a : t;
    l.variant === 'outline'
      ? d.outline.push(o)
      : l.variant === 'filled'
        ? d.filled.push(o)
        : d.plain.push(o);
  }
  return { general: a, subsurface: t, app: s };
}
function CU({ title: n, keys: a }) {
  return (
    <Stack spacing={2}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          fontSize: 11,
          opacity: 0.8,
        }}
      >
        {n}
        {' · '}
        {a.length}
      </Typography>
      <P keys={a} />
    </Stack>
  );
}
const k = {
  borderRadius: 1.5,
  '&:before': { display: 'none' },
  '& .MuiAccordionSummary-root': { paddingLeft: 3, paddingRight: 3 },
  '& .MuiAccordionDetails-root': { padding: 3, paddingTop: 2 },
};
const E = 5;
function SizesCanvas() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Sizes
      </Typography>
      <Stack direction="row" spacing={6} alignItems="flex-start">
        {Z.map((n) => (
          <Stack key={n.key} alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--tecton-color-divider-default)',
                borderRadius: 1,
                backgroundColor: 'var(--tecton-color-surface-base-background)',
              }}
            >
              <span
                className={r('cube-outline', n.key)}
                role="img"
                aria-label={`Cube ${n.label}`}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}
            >
              {n.label}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, textAlign: 'center', lineHeight: 1 }}>
              {n.px}px
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
function RecolorableCanvas() {
  const [n, a] = React.useState(''),
    t = React.useMemo(() => {
      const d = n.trim().toLowerCase(),
        U = d ? h.filter((K) => K.toLowerCase().includes(d)) : h;
      return V(U);
    }, [n]),
    s = t.general.outline.length + t.general.filled.length + t.general.plain.length,
    o = t.subsurface.outline.length + t.subsurface.filled.length + t.subsurface.plain.length,
    l = s + o;
  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2.5,
          width: '100%',
          flexWrap: 'wrap',
          rowGap: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recolorable icons (currentColor)
        </Typography>
        <TextField
          size="small"
          placeholder="Search by name (e.g. chevron, notifications)"
          value={n}
          onChange={(d) => a(d.target.value)}
          sx={{ minWidth: 340 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span className={r('search-outline', 'sm')} aria-hidden />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {'Showing '}
          {l}
        </Typography>
      </Box>
      <Box sx={{ mt: E }}>
        <Accordion defaultExpanded disableGutters sx={k}>
          <AccordionSummary_a
            expandIcon={<span className={r('chevron-down-outline', 'sm')} aria-hidden />}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {'General '}
              <Box component="span" sx={{ opacity: 0.6, fontWeight: 400 }}>
                ({s})
              </Box>
            </Typography>
          </AccordionSummary_a>
          <AccordionDetails>
            <Stack spacing={4}>
              <CU title="Outline" keys={t.general.outline} />
              <CU title="Filled" keys={t.general.filled} />
              {t.general.plain.length > 0 && <CU title="Other" keys={t.general.plain} />}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ mt: E }}>
        <Accordion disableGutters sx={k}>
          <AccordionSummary_a
            expandIcon={<span className={r('chevron-down-outline', 'sm')} aria-hidden />}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {'Subsurface '}
              <Box component="span" sx={{ opacity: 0.6, fontWeight: 400 }}>
                ({o})
              </Box>
            </Typography>
          </AccordionSummary_a>
          <AccordionDetails>
            <Stack spacing={4}>
              <CU title="Outline" keys={t.subsurface.outline} />
              <CU title="Filled" keys={t.subsurface.filled} />
              {t.subsurface.plain.length > 0 && <CU title="Other" keys={t.subsurface.plain} />}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  );
}
function ColorCanvas() {
  const [n, a] = React.useState(''),
    t = React.useMemo(() => {
      const s = n.trim().toLowerCase(),
        o = s ? h.filter((l) => l.toLowerCase().includes(s)) : h;
      return V(o);
    }, [n]);
  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2.5,
          width: '100%',
          flexWrap: 'wrap',
          rowGap: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Color brand marks (App)
        </Typography>
        <TextField
          size="small"
          placeholder="Search by name (e.g. openworks, decisionspace)"
          value={n}
          onChange={(s) => a(s.target.value)}
          sx={{ minWidth: 340 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span className={r('search-outline', 'sm')} aria-hidden />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {'Showing '}
          {t.app.length}
        </Typography>
      </Box>
      <Box sx={{ mt: E }}>
        <Accordion defaultExpanded disableGutters sx={k}>
          <AccordionSummary_a
            expandIcon={<span className={r('chevron-down-outline', 'sm')} aria-hidden />}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {'App '}
              <Box component="span" sx={{ opacity: 0.6, fontWeight: 400 }}>
                ({t.app.length})
              </Box>
            </Typography>
          </AccordionSummary_a>
          <AccordionDetails>
            <P keys={t.app} />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h6">Inside a Button</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            startIcon={<span className={r('add-outline')} aria-hidden />}
          >
            New
          </Button>
          <Button
            variant="outlined"
            endIcon={<span className={r('chevron-right-outline')} aria-hidden />}
          >
            Next
          </Button>
          <Button
            variant="text"
            color="tertiary"
            startIcon={<span className={r('export-upload-outline')} aria-hidden />}
          >
            Publish
          </Button>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Inside an IconButton</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton color="primary" aria-label="Add">
            <span className={r('add-outline')} aria-hidden />
          </IconButton>
          <IconButton color="secondary" aria-label="Edit">
            <span className={r('edit-square-outline')} aria-hidden />
          </IconButton>
          <IconButton color="tertiary" aria-label="More">
            <span className={r('more-vert-outline')} aria-hidden />
          </IconButton>
          <IconButton color="tertiary" variant="square" aria-label="Filter">
            <span className={r('filter-outline')} aria-hidden />
          </IconButton>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Inside a Chip</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label="Draft" icon={<span className={r('edit-square-outline')} aria-hidden />} />
          <Chip
            label="Done"
            icon={<span className={r('check-circle-filled')} aria-hidden />}
            color="primary"
          />
          <Chip label="Warning" icon={<span className={r('warning-filled')} aria-hidden />} />
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Inside a TextField adornment</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <span className={r('search-outline')} aria-hidden />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            placeholder="Location"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <span className={r('pin-filled')} aria-hidden />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Inline with text (inherits font-size)</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>
            Ready to launch{' '}
            <span
              className={r('check-circle-filled')}
              style={{ verticalAlign: 'middle' }}
              aria-hidden
            />
          </Typography>
          <Typography variant="body2">
            Learn more{' '}
            <span
              className={r('open-in-new-outline', 'sm')}
              style={{ verticalAlign: 'middle' }}
              aria-hidden
            />
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="h6">Semantic colors (icons follow currentColor)</Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <span
            className={r('check-circle-filled', 'lg')}
            style={{ color: 'var(--tecton-color-status-success-filled-bg)' }}
            aria-hidden
          />
          <span
            className={r('warning-filled', 'lg')}
            style={{ color: 'var(--tecton-color-status-warning-filled-bg)' }}
            aria-hidden
          />
          <span
            className={r('error-filled', 'lg')}
            style={{ color: 'var(--tecton-color-status-error-filled-bg)' }}
            aria-hidden
          />
          <span
            className={r('info-filled', 'lg')}
            style={{ color: 'var(--tecton-color-status-info-filled-bg)' }}
            aria-hidden
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
const rn = { title: 'Atoms/Icon' };
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_Recolorable = { name: 'Recolorable', render: () => <RecolorableCanvas /> };
const Story_Color = { name: 'Color', render: () => <ColorCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };

export const meta = rn;
export const stories = {
  'atoms-icon--color': Story_Color,
  'atoms-icon--examples': Story_Examples,
  'atoms-icon--recolorable': Story_Recolorable,
  'atoms-icon--sizes': Story_Sizes,
};
