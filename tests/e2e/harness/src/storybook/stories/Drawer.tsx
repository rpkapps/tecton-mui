// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText as ListItemText_a,
  ListSubheader,
  Stack,
  Typography,
} from '@tecton-mui/ui';

const Ne = 268;
function DrawerListItem({ index: e }) {
  return (
    <ListItem
      key={e}
      disablePadding
      secondaryAction={
        <IconButton color="textOnly" aria-label={`Item ${e + 1} action`}>
          <span className="tecton-icon-md tecton-cube-outline" aria-hidden />
        </IconButton>
      }
    >
      <ListItemButton>
        <ListItemIcon>
          <span className="tecton-icon-md tecton-cube-outline" aria-hidden />
        </ListItemIcon>
        <ListItemText_a primary="List item" secondary="Secondary" />
      </ListItemButton>
    </ListItem>
  );
}
function CV({ dense: e = false, itemCount: t = 12 }) {
  return (
    <Box sx={{ width: Ne }}>
      <List
        disablePadding
        dense={e}
        subheader={<ListSubheader component="div">Subheader</ListSubheader>}
      >
        {Array.from({ length: t }).map((n, o) => (
          <DrawerListItem key={o} index={o} />
        ))}
      </List>
    </Box>
  );
}
function DrawerStage({ label: e, children: t, height: n = 620, width: o = 320 }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {e}
      </Typography>
      <Box sx={{ position: 'relative', contain: 'layout', width: o, height: n }}>{t}</Box>
    </Stack>
  );
}
const j = { position: 'absolute', height: '100%', overflowX: 'hidden !important' };
function TemporaryCanvas() {
  const [e, t] = React.useState(false);
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Temporary drawer</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Modal variant: portals to body, renders a backdrop, traps focus, and closes on outside click
        or Escape. Click the trigger below to open.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => t(true)}>
          Open drawer
        </Button>
      </Stack>
      <Drawer anchor="right" open={e} onClose={() => t(false)}>
        <CV itemCount={12} />
      </Drawer>
    </Stack>
  );
}
function PersistentCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Persistent drawer</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Figma authors Drawer as a single component (no axis matrix): Paper 300×553 with a Subheader
        row and 12 rich list items. Only ~6 items fit inside the 553px paper.
      </Typography>
      <DrawerStage label="Persistent drawer with 12 list items">
        <Drawer
          variant="persistent"
          open
          anchor="left"
          hideBackdrop
          slotProps={{ paper: { sx: j } }}
        >
          <CV itemCount={12} />
        </Drawer>
      </DrawerStage>
    </Stack>
  );
}
function MiniCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Mini (dense) drawer</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Compact composition: List `dense`, rows collapse from 62px to 52px. Matches Figma sticker
        17114:15045.
      </Typography>
      <DrawerStage label="Persistent drawer with dense rows (52px height)">
        <Drawer
          variant="persistent"
          open
          anchor="left"
          hideBackdrop
          slotProps={{ paper: { sx: j } }}
        >
          <CV dense itemCount={12} />
        </Drawer>
      </DrawerStage>
    </Stack>
  );
}
function AnchorsCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Anchor positions</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        `anchor` accepts `left` (default), `right`, `top`, or `bottom`. Each stage below contains
        its own persistent drawer at the named edge.
      </Typography>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }} rowGap={4}>
        <DrawerStage label="Anchor left" height={480}>
          <Drawer
            variant="persistent"
            open
            anchor="left"
            hideBackdrop
            slotProps={{ paper: { sx: j } }}
          >
            <CV itemCount={6} />
          </Drawer>
        </DrawerStage>
        <DrawerStage label="Anchor right" height={480}>
          <Drawer
            variant="persistent"
            open
            anchor="right"
            hideBackdrop
            slotProps={{ paper: { sx: j } }}
          >
            <CV itemCount={6} />
          </Drawer>
        </DrawerStage>
        <DrawerStage label="Anchor top" height={280} width={360}>
          <Drawer
            variant="persistent"
            open
            anchor="top"
            hideBackdrop
            slotProps={{
              paper: {
                sx: { position: 'absolute', width: '100%', overflowX: 'hidden !important' },
              },
            }}
          >
            <CV dense itemCount={3} />
          </Drawer>
        </DrawerStage>
        <DrawerStage label="Anchor bottom" height={280} width={360}>
          <Drawer
            variant="persistent"
            open
            anchor="bottom"
            hideBackdrop
            slotProps={{
              paper: {
                sx: { position: 'absolute', width: '100%', overflowX: 'hidden !important' },
              },
            }}
          >
            <CV dense itemCount={3} />
          </Drawer>
        </DrawerStage>
      </Stack>
    </Stack>
  );
}
function Cr() {
  const [e, t] = React.useState(false);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Interactive trigger: click to open a temporary drawer
      </Typography>
      <Button variant="contained" onClick={() => t(true)}>
        Open drawer
      </Button>
      <Drawer anchor="right" open={e} onClose={() => t(false)}>
        <CV itemCount={6} />
      </Drawer>
    </Stack>
  );
}
function CompositionCanvas() {
  return (
    <Stack spacing={5}>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }} rowGap={5}>
        <DrawerStage label="Compact list (dense rows, 52px height)">
          <Drawer
            variant="persistent"
            open
            anchor="left"
            hideBackdrop
            slotProps={{ paper: { sx: j } }}
          >
            <CV dense itemCount={12} />
          </Drawer>
        </DrawerStage>
        <DrawerStage label="Regular list (medium rows, 62px height)">
          <Drawer
            variant="persistent"
            open
            anchor="left"
            hideBackdrop
            slotProps={{ paper: { sx: j } }}
          >
            <CV itemCount={12} />
          </Drawer>
        </DrawerStage>
      </Stack>
      <Cr />
    </Stack>
  );
}
const yt = { title: 'Molecules/Drawer', component: Drawer };
const Story_Mini = { name: 'Mini', render: () => <MiniCanvas /> };
const Story_Temporary = { name: 'Temporary', render: () => <TemporaryCanvas /> };
const Story_Persistent = { name: 'Persistent', render: () => <PersistentCanvas /> };
const Story_Anchors = { name: 'Anchors', render: () => <AnchorsCanvas /> };
const Story_Composition = { name: 'Composition', render: () => <CompositionCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: { open: true, anchor: 'left', variant: 'persistent', showSubheader: true },
  render: function StoryRender(e) {
    const t = (
      <Box sx={{ width: Ne }}>
        <List
          disablePadding
          subheader={
            e.showSubheader ? <ListSubheader component="div">Subheader</ListSubheader> : undefined
          }
        >
          {Array.from({ length: 6 }).map((a, c) => (
            <DrawerListItem key={c} index={c} />
          ))}
        </List>
      </Box>
    );
    if (e.variant === 'temporary')
      return (
        <Drawer variant="temporary" anchor={e.anchor} open={e.open} onClose={() => {}}>
          {t}
        </Drawer>
      );
    const n =
        e.anchor === 'top' || e.anchor === 'bottom'
          ? { position: 'absolute', width: '100%', overflowX: 'hidden !important' }
          : j,
      o = e.anchor === 'top' || e.anchor === 'bottom' ? 280 : 480,
      i = e.anchor === 'top' || e.anchor === 'bottom' ? 360 : 320;
    return (
      <DrawerStage label={`${e.variant} drawer, anchor ${e.anchor}`} height={o} width={i}>
        <Drawer
          variant={e.variant}
          anchor={e.anchor}
          open={e.open}
          hideBackdrop={e.variant === 'persistent'}
          slotProps={{ paper: { sx: n } }}
        >
          {t}
        </Drawer>
      </DrawerStage>
    );
  },
};

export const meta = yt;
export const stories = {
  'molecules-drawer--anchors': Story_Anchors,
  'molecules-drawer--composition': Story_Composition,
  'molecules-drawer--mini': Story_Mini,
  'molecules-drawer--persistent': Story_Persistent,
  'molecules-drawer--playground': Story_Playground,
  'molecules-drawer--temporary': Story_Temporary,
};
