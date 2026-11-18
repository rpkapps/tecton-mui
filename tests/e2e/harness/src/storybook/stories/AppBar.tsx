// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
/* eslint-disable @typescript-eslint/no-unused-expressions -- verbatim story code */
import * as React from 'react';
import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@tecton-mui/ui';

function Y(e) {
  return e.endsWith('-outline') ? e.replace(/-outline$/, '-filled') : e;
}
const ea = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  flexShrink: 0,
  px: 1.5,
  borderRight: '1px solid var(--tecton-color-divider-subtle)',
};
const fe = { title: 'Organisms/App Bar', id: 'organisms-appbar', component: AppBar };
const Story_Primary = {
  name: 'Primary',
  render: function StoryRender() {
    const n = [
        { label: 'Tab 1', iconName: 'project-outline' },
        { label: 'Tab 2', iconName: 'project-outline' },
      ],
      [t, o] = React.useState(n),
      [r, u] = React.useState(0),
      [l, d] = React.useState(0),
      w = React.useCallback((b) => {
        (o((i) => i.filter((c, g) => g !== b)),
          u((i) => (i === 'home' ? i : b === i ? 'home' : b < i ? i - 1 : i)));
      }, []),
      f = React.useCallback(() => {
        const b = l + 1;
        (o((i) => {
          const c = [...i, { label: `New tab ${b}`, hasCloseButton: true }];
          return (u(c.length - 1), c);
        }),
          d(b));
      }, [l]);
    return (
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Primary top-nav. Home cell acts as the default active section; click any tab to activate
          it, click the close (X) icon to remove a tab, click the + to append a new tab. Adding a
          tab makes it the active section immediately.
        </Typography>
        <AppBar position="static" tier="primary">
          <Toolbar disableGutters variant="dense">
            <Box className="tecton-appbar-product" sx={ea}>
              <Stack
                direction="row"
                spacing={0.25}
                sx={{ alignItems: 'center', p: 0.75, borderRadius: '100px' }}
              >
                <span
                  className="tecton-generic-placeholder-symbol tecton-appbar-icon"
                  aria-hidden
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'inherit', whiteSpace: 'nowrap' }}>
                    APP
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Tabs
              value={r}
              onChange={(b, i) => u(i)}
              variant="scrollable"
              scrollButtons={false}
              sx={{ height: '100%', minHeight: 0 }}
            >
              <Tab
                value="home"
                aria-label="home"
                disableRipple
                component="div"
                icon={
                  <span
                    className={`tecton-${r === 'home' ? 'home-filled' : 'home-outline'} tecton-appbar-icon`}
                    aria-hidden
                  />
                }
                sx={{ minWidth: 48, width: 48, px: 0 }}
              />
              {t.map((b, i) => {
                const c = r === i,
                  g = b.iconName ?? 'project-outline',
                  S = c ? Y(g) : g;
                return (
                  <Tab
                    key={i}
                    value={i}
                    disableRipple
                    component="div"
                    sx={{ pl: 1.5, pr: 1, flexDirection: 'row' }}
                    label={
                      <React.Fragment>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', color: 'inherit', pr: 1 }}
                        >
                          <span className={`tecton-${S} tecton-appbar-icon`} aria-hidden />
                          <Typography
                            variant="caption"
                            sx={{ color: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            {b.label}
                          </Typography>
                          {b.chip ? <Chip label={b.chip} size="small" /> : null}
                        </Stack>
                        {(b.hasCloseButton ?? true) && c ? (
                          <IconButton
                            size="small"
                            aria-label={`close ${b.label}`}
                            onClick={(A) => {
                              (A.stopPropagation(), w(i));
                            }}
                          >
                            <span className="tecton-close-outline tecton-appbar-icon" aria-hidden />
                          </IconButton>
                        ) : null}
                      </React.Fragment>
                    }
                  />
                );
              })}
            </Tabs>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                px: 0.5,
                flexShrink: 0,
              }}
            >
              <IconButton aria-label="add tab" onClick={f} sx={{ opacity: 0.6 }}>
                <span className="tecton-add-outline" aria-hidden />
              </IconButton>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', px: 2, flexShrink: 0, marginLeft: 'auto' }}
            >
              <IconButton aria-label="layers">
                <span className="tecton-layers-outline" aria-hidden />
              </IconButton>
              <IconButton aria-label="notifications">
                <span className="tecton-notifications-outline" aria-hidden />
              </IconButton>
              <IconButton aria-label="apps">
                <span className="tecton-apps-outline" aria-hidden />
              </IconButton>
              <IconButton aria-label="account">
                <span className="tecton-person-outline" aria-hidden />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>
      </Stack>
    );
  },
};
const Story_Secondary = {
  name: 'Secondary',
  render: function StoryRender() {
    const n = [{ label: 'Name' }, { label: 'Name', hasCloseButton: true }, { label: 'Name' }],
      [t, o] = React.useState(n),
      [r, u] = React.useState(1),
      [l, d] = React.useState(0),
      w = React.useCallback((i) => {
        (o((c) => c.filter((g, S) => S !== i)),
          u((c) => (i === c ? Math.max(0, c - 1) : i < c ? c - 1 : c)));
      }, []),
      f = React.useCallback(() => {
        const i = l + 1;
        (o((c) => {
          const g = [...c, { label: `New tab ${i}`, hasCloseButton: true }];
          return (u(g.length - 1), g);
        }),
          d(i));
      }, [l]),
      b = t.length === 0 ? false : Math.min(r, t.length - 1);
    return (
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Secondary in-page nav. Same interaction model: tabs activate on click, close removes, add
          appends.
        </Typography>
        <AppBar position="static" tier="secondary">
          <Toolbar disableGutters variant="dense">
            <Tabs
              value={b}
              onChange={(i, c) => u(c)}
              variant="scrollable"
              scrollButtons={false}
              sx={{ height: '100%', minHeight: 0 }}
            >
              {t.map((i, c) => {
                const g = c === r,
                  S = i.iconName ?? 'grid-view-outline',
                  A = g ? Y(S) : S;
                return (
                  <Tab
                    key={c}
                    value={c}
                    disableRipple
                    component="div"
                    sx={{ pl: 1.5, pr: 1 }}
                    label={
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', color: 'inherit' }}
                      >
                        <span className={`tecton-${A} tecton-appbar-icon`} aria-hidden />
                        <Typography
                          variant="caption"
                          sx={{ color: 'inherit', whiteSpace: 'nowrap' }}
                        >
                          {i.label}
                        </Typography>
                        {(i.hasCloseButton ?? true) && g ? (
                          <IconButton
                            size="small"
                            aria-label={`close ${i.label}`}
                            onClick={(L) => {
                              (L.stopPropagation(), w(c));
                            }}
                          >
                            <span className="tecton-close-outline tecton-appbar-icon" aria-hidden />
                          </IconButton>
                        ) : null}
                      </Stack>
                    }
                  />
                );
              })}
            </Tabs>
            <IconButton size="small" aria-label="add secondary tab" onClick={f}>
              <span className="tecton-add-outline tecton-appbar-icon" aria-hidden />
            </IconButton>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', marginLeft: 'auto', px: 1, flexShrink: 0 }}
            >
              <Button
                size="small"
                variant="text"
                startIcon={
                  <span className="tecton-export-upload-outline tecton-appbar-icon" aria-hidden />
                }
              >
                Review and Publish
              </Button>
              <Button size="small" variant="contained">
                Share
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
      </Stack>
    );
  },
};
const Story_Examples = {
  name: 'Examples',
  render: function StoryRender() {
    function Box2(i) {
      const {
          productLabel: c,
          productIcon: g,
          initialTabs: S,
          initialActive: A,
          productColor: L,
          showAdd: z = true,
          wrap820: $ = false,
        } = i,
        [H, P] = React.useState(S),
        [M, E] = React.useState(A),
        [G, Q] = React.useState(0),
        Z = React.useCallback((p) => {
          (P((h) => h.filter((k, D) => D !== p)),
            E((h) => (h === 'home' ? h : p === h ? 'home' : p < h ? h - 1 : h)));
        }, []),
        W = React.useCallback(() => {
          const p = G + 1;
          (P((h) => {
            const k = [...h, { label: `New tab ${p}`, hasCloseButton: true }];
            return (E(k.length - 1), k);
          }),
            Q(p));
        }, [G]),
        B = (
          <AppBar position="static" tier="primary" productColor={L}>
            <Toolbar disableGutters variant="dense">
              <Box className="tecton-appbar-product" sx={ea}>
                <Stack
                  direction="row"
                  spacing={0.25}
                  sx={{ alignItems: 'center', p: 0.75, borderRadius: '100px' }}
                >
                  <span className={`tecton-${g} tecton-appbar-icon`} aria-hidden />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'inherit', whiteSpace: 'nowrap' }}>
                      {c}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Tabs
                value={M}
                onChange={(p, h) => E(h)}
                variant="scrollable"
                scrollButtons={false}
                sx={{ height: '100%', minHeight: 0 }}
              >
                <Tab
                  value="home"
                  aria-label="home"
                  disableRipple
                  component="div"
                  icon={
                    <span
                      className={`tecton-${M === 'home' ? 'home-filled' : 'home-outline'} tecton-appbar-icon`}
                      aria-hidden
                    />
                  }
                  sx={{ minWidth: 48, width: 48, px: 0 }}
                />
                {H.map((p, h) => {
                  const k = M === h,
                    D = p.iconName ?? 'project-outline',
                    aa = k ? Y(D) : D;
                  return (
                    <Tab
                      key={h}
                      value={h}
                      disableRipple
                      component="div"
                      sx={{ pl: 1.5, pr: 1, flexDirection: 'row' }}
                      label={
                        <React.Fragment>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', color: 'inherit', pr: 1 }}
                          >
                            <span className={`tecton-${aa} tecton-appbar-icon`} aria-hidden />
                            <Typography
                              variant="caption"
                              sx={{ color: 'inherit', whiteSpace: 'nowrap' }}
                            >
                              {p.label}
                            </Typography>
                            {p.chip ? <Chip label={p.chip} size="small" /> : null}
                          </Stack>
                          {(p.hasCloseButton ?? true) && k ? (
                            <IconButton
                              size="small"
                              aria-label={`close ${p.label}`}
                              onClick={(Sa) => {
                                (Sa.stopPropagation(), Z(h));
                              }}
                            >
                              <span
                                className="tecton-close-outline tecton-appbar-icon"
                                aria-hidden
                              />
                            </IconButton>
                          ) : null}
                        </React.Fragment>
                      }
                    />
                  );
                })}
              </Tabs>
              {z ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    px: 0.5,
                    flexShrink: 0,
                  }}
                >
                  <IconButton aria-label="add tab" onClick={W} sx={{ opacity: 0.6 }}>
                    <span className="tecton-add-outline" aria-hidden />
                  </IconButton>
                </Box>
              ) : null}
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', px: 2, flexShrink: 0, marginLeft: 'auto' }}
              >
                <IconButton aria-label="layers">
                  <span className="tecton-layers-outline" aria-hidden />
                </IconButton>
                <IconButton aria-label="notifications">
                  <span className="tecton-notifications-outline" aria-hidden />
                </IconButton>
                <IconButton aria-label="apps">
                  <span className="tecton-apps-outline" aria-hidden />
                </IconButton>
                <IconButton aria-label="account">
                  <span className="tecton-person-outline" aria-hidden />
                </IconButton>
              </Stack>
            </Toolbar>
          </AppBar>
        );
      return $ ? <Box sx={{ width: 820 }}>{B}</Box> : B;
    }
    function PrimaryHomeOrionVariant(i) {
      const {
          initialTabs: c,
          initialActiveIndex: g,
          showAdd: S = true,
          action: A = { kind: 'none' },
          wrap820: L = false,
        } = i,
        [z, $] = React.useState(c),
        [H, P] = React.useState(g),
        [M, E] = React.useState(0),
        G = React.useCallback((B) => {
          ($((p) => p.filter((h, k) => k !== B)),
            P((p) => (B === p ? Math.max(0, p - 1) : B < p ? p - 1 : p)));
        }, []),
        Q = React.useCallback(() => {
          const B = M + 1;
          ($((p) => {
            const h = [...p, { label: `New tab ${B}`, hasCloseButton: true }];
            return (P(h.length - 1), h);
          }),
            E(B));
        }, [M]),
        Z = z.length === 0 ? false : Math.min(H, z.length - 1),
        W = (
          <AppBar position="static" tier="secondary">
            <Toolbar disableGutters variant="dense">
              <Tabs
                value={Z}
                onChange={(B, p) => P(p)}
                variant="scrollable"
                scrollButtons={false}
                sx={{ height: '100%', minHeight: 0 }}
              >
                {z.map((B, p) => {
                  const h = p === H,
                    k = B.iconName ?? 'grid-view-outline',
                    D = h ? Y(k) : k;
                  return (
                    <Tab
                      key={p}
                      value={p}
                      disableRipple
                      component="div"
                      sx={{ pl: 1.5, pr: 1 }}
                      label={
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', color: 'inherit' }}
                        >
                          <span className={`tecton-${D} tecton-appbar-icon`} aria-hidden />
                          <Typography
                            variant="caption"
                            sx={{ color: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            {B.label}
                          </Typography>
                          {(B.hasCloseButton ?? true) && h ? (
                            <IconButton
                              size="small"
                              aria-label={`close ${B.label}`}
                              onClick={(aa) => {
                                (aa.stopPropagation(), G(p));
                              }}
                            >
                              <span
                                className="tecton-close-outline tecton-appbar-icon"
                                aria-hidden
                              />
                            </IconButton>
                          ) : null}
                        </Stack>
                      }
                    />
                  );
                })}
              </Tabs>
              {S ? (
                <IconButton size="small" aria-label="add secondary tab" onClick={Q}>
                  <span className="tecton-add-outline tecton-appbar-icon" aria-hidden />
                </IconButton>
              ) : null}
              {A.kind === 'buttons' ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', marginLeft: 'auto', px: 1, flexShrink: 0 }}
                >
                  <Button
                    size="small"
                    variant="text"
                    startIcon={
                      A.primaryIcon ? (
                        <span
                          className={`tecton-${A.primaryIcon} tecton-appbar-icon`}
                          aria-hidden
                        />
                      ) : undefined
                    }
                  >
                    {A.primary}
                  </Button>
                  <Button size="small" variant="contained">
                    {A.secondaryText}
                  </Button>
                </Stack>
              ) : A.kind === 'icons' ? (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: 'center', marginLeft: 'auto', px: 1, flexShrink: 0 }}
                >
                  {A.icons.map((B, p) => (
                    <IconButton key={p} size="small" aria-label={B}>
                      <span className={`tecton-${B} tecton-appbar-icon`} aria-hidden />
                    </IconButton>
                  ))}
                </Stack>
              ) : null}
            </Toolbar>
          </AppBar>
        );
      return L ? <Box sx={{ width: 820 }}>{W}</Box> : W;
    }
    function Typography2() {
      return (
        <Box2
          productLabel="APP"
          productIcon="generic-placeholder-symbol"
          initialTabs={[]}
          initialActive="home"
        />
      );
    }
    function Typography3() {
      return (
        <Box2
          productLabel="APP"
          productIcon="generic-placeholder-symbol"
          initialTabs={[{ label: 'Orion' }]}
          initialActive={0}
        />
      );
    }
    function SecondaryTabsWithButtonsVariant() {
      return (
        <Box2
          productLabel="AAM"
          productIcon="aam-symbol"
          productColor="app1"
          initialTabs={[]}
          initialActive="home"
        />
      );
    }
    function SecondaryTabsWithIconsVariant() {
      return (
        <Box2
          productLabel="UEM"
          productIcon="uem-symbol"
          productColor="app3"
          initialTabs={[]}
          initialActive="home"
        />
      );
    }
    function SecondaryWideAddedLinerVariant() {
      return (
        <Box2
          productLabel="DWP"
          productIcon="dwp-symbol"
          productColor="app4"
          initialTabs={[]}
          initialActive="home"
        />
      );
    }
    function CW() {
      return (
        <PrimaryHomeOrionVariant
          initialTabs={[
            { label: 'Name' },
            { label: 'Name', hasCloseButton: true },
            { label: 'Name' },
          ]}
          initialActiveIndex={1}
          action={{
            kind: 'buttons',
            primary: 'Review and Publish',
            secondaryText: 'Share',
            primaryIcon: 'export-upload-outline',
          }}
        />
      );
    }
    function CF() {
      return (
        <PrimaryHomeOrionVariant
          initialTabs={[{ label: 'Name' }, { label: 'Name' }, { label: 'Name' }]}
          initialActiveIndex={1}
          showAdd={false}
          action={{ kind: 'icons', icons: ['search-outline', 'add-outline', 'panel-outline'] }}
        />
      );
    }
    function CB() {
      return (
        <PrimaryHomeOrionVariant
          initialTabs={[
            { label: 'Name' },
            { label: 'Added Liner', iconName: 'add-outline' },
            { label: 'Name' },
          ]}
          initialActiveIndex={1}
          action={{ kind: 'none' }}
          wrap820
        />
      );
    }
    return (
      <Stack spacing={4}>
        <Stack spacing={2}>
          <Typography variant="h6">Primary top-nav</Typography>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              APP + Home + add (no closeable tabs)
            </Typography>
            <Typography2 />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              APP + Home + Orion tab + add
            </Typography>
            <Typography3 />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              AAM + Home + add (no closeable tabs)
            </Typography>
            <SecondaryTabsWithButtonsVariant />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              UEM + Home + add (no closeable tabs)
            </Typography>
            <SecondaryTabsWithIconsVariant />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              DWP + Home + add (no closeable tabs)
            </Typography>
            <SecondaryWideAddedLinerVariant />
          </Box>
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Secondary in-page nav</Typography>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              3 Name tabs + add + Review-and-Publish / Share buttons
            </Typography>
            <CW />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              3 Name tabs + search / add / panel icon cluster (add-tab suppressed)
            </Typography>
            <CF />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              Wide (820) with 3 tabs, Added Liner active, no right actions
            </Typography>
            <CB />
          </Box>
        </Stack>
      </Stack>
    );
  },
};
const Oa = {
  notifications: 'tecton-notifications-outline',
  settings: 'tecton-settings-outline',
  account: 'tecton-person-outline',
};
function ProductMarkBar({
  label: e,
  productColor: n,
  icon: t,
  homeTab: o = false,
  tabLabels: r = [],
  actionIcons: u = [],
  actionsBeforeTabs: l = false,
  trailingButtonLabel: d,
}) {
  const w = o || r.length > 0,
    [f, b] = React.useState(o ? 'home' : 0),
    i =
      u.length > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, marginLeft: l ? 0 : 'auto' }}>
          {u.map((c) => (
            <IconButton key={c} size="small" aria-label={`${e} ${c}`}>
              <span className={`${Oa[c]} tecton-appbar-icon`} aria-hidden />
            </IconButton>
          ))}
        </Box>
      ) : null;
  return (
    <AppBar position="static" tier="primary" productColor={n}>
      <Toolbar disableGutters variant="dense">
        <Box className="tecton-appbar-product" sx={ea}>
          <Stack
            direction="row"
            spacing={0.25}
            sx={{ alignItems: 'center', p: 0.75, borderRadius: '100px' }}
          >
            {t ? (
              <span className={`tecton-${t} tecton-appbar-icon`} aria-hidden />
            ) : (
              <Box
                aria-hidden
                sx={{
                  width: 'var(--tecton-icon-size-100)',
                  height: 'var(--tecton-icon-size-100)',
                  borderRadius: 'var(--tecton-radius-25)',
                  backgroundColor: 'currentColor',
                  flexShrink: 0,
                }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, minWidth: 32 }}>
              <Typography variant="caption" sx={{ color: 'inherit', whiteSpace: 'nowrap' }}>
                {e}
              </Typography>
            </Box>
          </Stack>
        </Box>
        {l ? i : null}
        {w ? (
          <Tabs value={f} onChange={(c, g) => b(g)} variant="scrollable">
            {o ? (
              <Tab
                value="home"
                component="div"
                aria-label={`${e} home`}
                icon={<span className="tecton-home-outline tecton-appbar-icon" aria-hidden />}
                sx={{ minWidth: 48, width: 48 }}
              />
            ) : null}
            {r.map((c, g) => (
              <Tab key={c} value={g} component="div" label={c} />
            ))}
          </Tabs>
        ) : null}
        {d ? (
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, marginLeft: 'auto' }}>
            <Button size="small" variant="outlined" color="inherit">
              {d}
            </Button>
          </Box>
        ) : null}
        {l ? null : i}
      </Toolbar>
    </AppBar>
  );
}
const Story_ProductLogo = {
  name: 'Product logo',
  render: () => (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Product logo swatches, coloured by productColor token
      </Typography>
      <ProductMarkBar label="APP 1" productColor="app1" homeTab actionIcons={['notifications']} />
      <ProductMarkBar label="APP 2" productColor="app2" tabLabels={['Projects', 'Reports']} />
      <ProductMarkBar
        label="APP 3"
        productColor="app3"
        homeTab
        tabLabels={['Projects', 'Reports']}
      />
      <ProductMarkBar
        label="APP 4"
        productColor="app4"
        actionIcons={['notifications', 'settings', 'account']}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', pt: 2 }}>
        Product icon marks: glyph colour is baked into each SVG, and productColor brands the label
        beside it. Token order follows Figma appColors, so app1=AAM, app2=DSG, app3=UEM, app4=DWP.
      </Typography>
      <ProductMarkBar
        label="AAM"
        icon="aam-symbol"
        productColor="app1"
        actionIcons={['account']}
        actionsBeforeTabs
      />
      <ProductMarkBar
        label="DSG"
        icon="dsg-symbol"
        productColor="app2"
        homeTab
        tabLabels={['Projects', 'Reports']}
        actionIcons={['settings']}
      />
      <ProductMarkBar
        label="UEM"
        icon="uem-symbol"
        productColor="app3"
        trailingButtonLabel="Upgrade"
      />
      <ProductMarkBar label="DWP" icon="dwp-symbol" productColor="app4" tabLabels={['Settings']} />
    </Stack>
  ),
};
const Story_Playground = {
  name: 'Playground',
  args: { position: 'static', variant: 'regular', productColor: 'app1' },
  render: function StoryRender(n) {
    return (
      <AppBar position={n.position} tier="primary" productColor={n.productColor}>
        <Toolbar variant={n.variant}>
          <Box
            className="tecton-appbar-product"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 'var(--tecton-icon-size-100)',
                height: 'var(--tecton-icon-size-100)',
                borderRadius: 'var(--tecton-radius-25)',
                backgroundColor: 'currentColor',
                flexShrink: 0,
              }}
            />
            <Typography variant="h6">APP</Typography>
          </Box>
          <Button color="inherit">Home</Button>
          <Button color="inherit">Projects</Button>
          <Button color="inherit">Reports</Button>
          <IconButton color="inherit" aria-label="settings">
            <span className="tecton-settings-outline" aria-hidden />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  },
};

export const meta = fe;
export const stories = {
  'organisms-appbar--examples': Story_Examples,
  'organisms-appbar--playground': Story_Playground,
  'organisms-appbar--primary': Story_Primary,
  'organisms-appbar--product-logo': Story_ProductLogo,
  'organisms-appbar--secondary': Story_Secondary,
};
