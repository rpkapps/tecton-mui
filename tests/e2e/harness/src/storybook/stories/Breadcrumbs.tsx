// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Breadcrumbs, Button, Link, Menu, MenuItem, Stack, Typography } from '@tecton-mui/ui';

const Rn = { title: 'Atoms/Breadcrumbs', component: Breadcrumbs };
function CZ({ onExpand: n }) {
  return (
    <Typography
      component="span"
      onClick={n}
      sx={{
        color: 'var(--tecton-color-action-text-only-text)',
        fontSize: 'var(--tecton-font-size-medium)',
        lineHeight: 'var(--tecton-line-height-medium)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      …
    </Typography>
  );
}
const R = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.25,
  padding: 0,
  minWidth: 0,
  background: 'none',
  border: 'none',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  textDecoration: 'underline',
  textDecorationColor: 'transparent',
  '&:hover': { textDecorationColor: 'inherit' },
};
function Ne({ label: n, items: t }) {
  const [r, s] = React.useState(null);
  return (
    <React.Fragment>
      <Button disableRipple sx={R} onClick={(a) => s(a.currentTarget)}>
        {n} <span className="tecton-chevron-down-outline" style={{ fontSize: 16 }} aria-hidden />
      </Button>
      <Menu anchorEl={r} open={!!r} onClose={() => s(null)}>
        {t.map((a) => (
          <MenuItem key={a} onClick={() => s(null)}>
            {a}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
}
function le(n, t) {
  const s = [...['Parent', 'Section', 'Subsection', 'Category'].slice(0, n - 1), 'Current'],
    a = { display: 'inline-flex', alignItems: 'center', gap: 1 },
    o = ['Option A', 'Option B', 'Option C'];
  return s.map((i) =>
    t === 'with-icons' ? (
      <Link key={i} href="#" sx={a}>
        <span className="tecton-cube-outline" style={{ fontSize: 16 }} aria-hidden />
        {i}
      </Link>
    ) : t === 'menus' ? (
      <Ne key={i} label={i} items={o} />
    ) : (
      <Link key={i} href="#">
        {i}
      </Link>
    ),
  );
}
function Oe({ count: n, icons: t, overflow: r }) {
  const [s, a] = React.useState(() => new Set()),
    o = le(n, t);
  if (r === 'overflow' && n > 2) {
    const i = o[0],
      m = o[o.length - 1],
      B = o.slice(1, -1);
    return (
      <Breadcrumbs>
        {i}
        {B.map((w, d) =>
          s.has(d) ? (
            React.cloneElement(w, { key: `middle-${d}` })
          ) : (
            <CZ
              key={`ellipsis-${d}`}
              onExpand={() =>
                a((b) => {
                  const h = new Set(b);
                  return (h.add(d), h);
                })
              }
            />
          ),
        )}
        {m}
      </Breadcrumbs>
    );
  }
  return <Breadcrumbs>{o}</Breadcrumbs>;
}
const ce = [2, 3, 4];
const Re = [
  { key: 'no-overflow', label: 'without overflow' },
  { key: 'overflow', label: 'with overflow' },
];
function D({ icons: n, title: t }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t}</Typography>
      {ce.flatMap((r) =>
        Re.map((s) => (
          <Stack key={`${n}-${r}-${s.key}`} direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" sx={{ width: 280, fontWeight: 600, flexShrink: 0 }}>
              {'Breadcrumbs '}
              {r}
              {' · '}
              {s.label}
            </Typography>
            <Oe count={r} icons={n} overflow={s.key} />
          </Stack>
        )),
      )}
    </Stack>
  );
}
function IconsCanvas() {
  return <D icons="with-icons" title="Icons: true" />;
}
function NoIconsCanvas() {
  return <D icons="no-icons" title="Icons: false" />;
}
function MenuCanvas() {
  return <D icons="menus" title="Menus (chevron dropdown per item)" />;
}
function ExamplesCanvas() {
  const [n, t] = React.useState(null),
    [r, s] = React.useState(null);
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Menus
        </Typography>
        <Breadcrumbs>
          <Button disableRipple sx={R} onClick={(a) => t(a.currentTarget)}>
            {'Parent '}
            <span className="tecton-chevron-down-outline" style={{ fontSize: 16 }} aria-hidden />
          </Button>
          <Button disableRipple sx={R} onClick={(a) => s(a.currentTarget)}>
            {'Section '}
            <span className="tecton-chevron-down-outline" style={{ fontSize: 16 }} aria-hidden />
          </Button>
          <Link href="#">Current</Link>
        </Breadcrumbs>
        <Menu anchorEl={n} open={!!n} onClose={() => t(null)}>
          <MenuItem onClick={() => t(null)}>Section A</MenuItem>
          <MenuItem onClick={() => t(null)}>Section B</MenuItem>
          <MenuItem onClick={() => t(null)}>Section C</MenuItem>
        </Menu>
        <Menu anchorEl={r} open={!!r} onClose={() => s(null)}>
          <MenuItem onClick={() => s(null)}>Subsection A</MenuItem>
          <MenuItem onClick={() => s(null)}>Subsection B</MenuItem>
          <MenuItem onClick={() => s(null)}>Subsection C</MenuItem>
        </Menu>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Leading Icons
        </Typography>
        <Breadcrumbs>
          <Link href="#" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <span className="tecton-cube-outline" style={{ fontSize: 16 }} aria-hidden />
            Parent
          </Link>
          <Link href="#">Section</Link>
          <Link href="#">Current</Link>
        </Breadcrumbs>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Default
        </Typography>
        <Breadcrumbs>
          <Link href="#">Parent</Link>
          <Link href="#">Section</Link>
          <Link href="#">Current</Link>
        </Breadcrumbs>
      </Stack>
      <Fe />
    </Stack>
  );
}
function Fe() {
  const [n, t] = React.useState(false);
  return (
    <Stack spacing={1}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Overflow: 1-item ellipsis (Breadcrumbs=3, Overflow=true)
      </Typography>
      {n ? (
        <Breadcrumbs>
          <Link href="#">Parent</Link>
          <Link href="#">Section</Link>
          <Link href="#">Current</Link>
        </Breadcrumbs>
      ) : (
        <Breadcrumbs>
          <Link href="#">Parent</Link>
          <CZ onExpand={() => t(true)} />
          <Link href="#">Current</Link>
        </Breadcrumbs>
      )}
    </Stack>
  );
}
const Story_Icons = { name: 'Icons', render: () => <IconsCanvas /> };
const Story_NoIcons = { name: 'No icons', render: () => <NoIconsCanvas /> };
const Story_MenuVariant = { name: 'Menu', render: () => <MenuCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { maxItems: 4, showIcons: false, itemCount: 4 },
  render: (n) => <PlaygroundBreadcrumbs args={n} />,
};
function PlaygroundBreadcrumbs({ args: n }) {
  const t = le(n.itemCount, n.showIcons ? 'with-icons' : 'no-icons'),
    [r, s] = React.useState(() => new Set()),
    a = n.maxItems < t.length && t.length > 2;
  let o;
  if (!a) o = t;
  else {
    const i = t[0],
      m = t[t.length - 1],
      B = t.slice(1, -1);
    o = [
      i,
      ...B.map((w, d) =>
        r.has(d) ? (
          React.cloneElement(w, { key: `middle-${d}` })
        ) : (
          <CZ
            key={`ellipsis-${d}`}
            onExpand={() =>
              s((b) => {
                const h = new Set(b);
                return (h.add(d), h);
              })
            }
          />
        ),
      ),
      m,
    ];
  }
  return (
    <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
      <Breadcrumbs>{o}</Breadcrumbs>
    </Stack>
  );
}

export const meta = Rn;
export const stories = {
  'atoms-breadcrumbs--examples': Story_Examples,
  'atoms-breadcrumbs--icons': Story_Icons,
  'atoms-breadcrumbs--menu-variant': Story_MenuVariant,
  'atoms-breadcrumbs--no-icons': Story_NoIcons,
  'atoms-breadcrumbs--playground': Story_Playground,
};
