// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText as ListItemText_a,
  ListSubheader,
  Stack,
} from '@tecton-mui/ui';

function CR({ disableGutters: n = false, primary: s = 'List item', secondary: i = 'Secondary' }) {
  return (
    <ListItem
      disablePadding
      disableGutters={n}
      secondaryAction={
        <IconButton color="textOnly" aria-label={`${s} action`} sx={n ? { right: 0 } : undefined}>
          <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
        </IconButton>
      }
    >
      <ListItemButton
        disableGutters={n}
        sx={{ ...(n ? { paddingLeft: 0, paddingRight: 'var(--tecton-space-500)' } : {}) }}
      >
        <ListItemIcon>
          <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
        </ListItemIcon>
        <ListItemText_a primary={s} secondary={i} />
      </ListItemButton>
    </ListItem>
  );
}
function CG({ primary: n = 'List item', secondary: s = 'Secondary', selected: i = false }) {
  return (
    <ListItem disablePadding>
      <ListItemButton selected={i}>
        <ListItemText_a primary={n} secondary={s} />
        <span
          className="tecton-chevron-right-outline"
          style={{ fontSize: 'var(--tecton-icon-size-100)' }}
          aria-hidden
        />
      </ListItemButton>
    </ListItem>
  );
}
function ListPanel({ width: n = 260, children: s }) {
  return (
    <Box
      sx={{
        width: n,
        backgroundColor: 'var(--tecton-color-bg-paper)',
        border: '1px solid var(--tecton-color-divider-subtle)',
        borderRadius: 'var(--tecton-radius-50)',
        overflow: 'hidden',
      }}
    >
      {s}
    </Box>
  );
}
function RegularCanvas() {
  return (
    <ListPanel>
      <List disablePadding>
        <CR />
        <CR />
        <CR />
      </List>
    </ListPanel>
  );
}
function DenseCanvas() {
  return (
    <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
      <ListPanel>
        <List disablePadding dense>
          <CR />
          <CR />
          <CR />
        </List>
      </ListPanel>
      <ListPanel>
        <List disablePadding dense>
          <CR disableGutters />
          <CR disableGutters />
          <CR disableGutters />
        </List>
      </ListPanel>
    </Stack>
  );
}
function GuttersOnCanvas() {
  return (
    <ListPanel>
      <List disablePadding>
        <CR />
        <CR />
        <CR />
      </List>
    </ListPanel>
  );
}
function GuttersOffCanvas() {
  return (
    <ListPanel>
      <List disablePadding>
        <CR disableGutters />
        <CR disableGutters />
        <CR disableGutters />
      </List>
    </ListPanel>
  );
}
function StatesCanvas() {
  return (
    <ListPanel>
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
            </ListItemIcon>
            <ListItemText_a primary="Enabled" secondary="Interactive row" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon>
              <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
            </ListItemIcon>
            <ListItemText_a primary="Activated" secondary="Selected row" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton disabled>
            <ListItemIcon>
              <span className="tecton-cube-outline tecton-icon-md" aria-hidden />
            </ListItemIcon>
            <ListItemText_a primary="Disabled" secondary="Non-interactive row" />
          </ListItemButton>
        </ListItem>
      </List>
    </ListPanel>
  );
}
function RegularSubheaderCanvas() {
  return (
    <ListPanel>
      <List
        disablePadding
        subheader={
          <ListSubheader
            component="div"
            sx={{
              backgroundColor: 'transparent',
              color: 'var(--tecton-color-text-primary)',
              fontSize: 14,
              lineHeight: '18px',
              fontWeight: 500,
              paddingBlock: 'var(--tecton-space-150)',
              paddingInline: 'var(--tecton-space-200)',
              position: 'static',
            }}
          >
            Subheader
          </ListSubheader>
        }
      >
        <CR />
        <CR />
        <CR />
        <CG selected />
        <CG />
        <CG />
      </List>
    </ListPanel>
  );
}
function CompactSubheaderCanvas() {
  return (
    <ListPanel>
      <List
        disablePadding
        dense
        subheader={
          <ListSubheader
            component="div"
            sx={{
              backgroundColor: 'transparent',
              color: 'var(--tecton-color-text-primary)',
              fontSize: 14,
              lineHeight: '18px',
              fontWeight: 500,
              paddingBlock: 'var(--tecton-space-150)',
              paddingInline: 'var(--tecton-space-200)',
              position: 'static',
            }}
          >
            Subheader
          </ListSubheader>
        }
      >
        <CR />
        <CR />
        <CR />
        <CG selected />
        <CG />
        <CG />
      </List>
    </ListPanel>
  );
}
const Fe = { title: 'Molecules/List', component: List };
const Story_States = { name: 'States', render: () => <StatesCanvas /> };
const Story_Regular = { name: 'Regular', render: () => <RegularCanvas /> };
const Story_Dense = { name: 'Dense', render: () => <DenseCanvas /> };
const Story_GuttersOn = { name: 'Gutters on', render: () => <GuttersOnCanvas /> };
const Story_GuttersOff = { name: 'Gutters off', render: () => <GuttersOffCanvas /> };
const Story_RegularSubheader = {
  name: 'Regular subheader',
  render: () => <RegularSubheaderCanvas />,
};
const Story_CompactSubheader = {
  name: 'Compact subheader',
  render: () => <CompactSubheaderCanvas />,
};
const P = ['Inbox', 'Starred', 'Drafts', 'Sent', 'Archive'];
const Story_Playground = {
  name: 'Playground',
  args: {
    dense: false,
    disablePadding: true,
    disableGutters: false,
    showSubheader: false,
    subheaderText: 'Subheader',
    itemCount: 3,
  },
  render: function StoryRender(n) {
    const s = P.slice(0, n.itemCount);
    return (
      <ListPanel>
        <List
          dense={n.dense}
          disablePadding={n.disablePadding}
          subheader={
            n.showSubheader ? (
              <ListSubheader
                component="div"
                sx={{
                  backgroundColor: 'transparent',
                  color: 'var(--tecton-color-text-primary)',
                  fontSize: 14,
                  lineHeight: '18px',
                  fontWeight: 500,
                  paddingBlock: 'var(--tecton-space-150)',
                  paddingInline: 'var(--tecton-space-200)',
                  position: 'static',
                }}
              >
                {n.subheaderText}
              </ListSubheader>
            ) : undefined
          }
        >
          {s.map((i) => (
            <ListItem key={i} disablePadding disableGutters={n.disableGutters}>
              <ListItemButton disableGutters={n.disableGutters}>
                <ListItemText_a primary={i} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </ListPanel>
    );
  },
};

export const meta = Fe;
export const stories = {
  'molecules-list--compact-subheader': Story_CompactSubheader,
  'molecules-list--dense': Story_Dense,
  'molecules-list--gutters-off': Story_GuttersOff,
  'molecules-list--gutters-on': Story_GuttersOn,
  'molecules-list--playground': Story_Playground,
  'molecules-list--regular': Story_Regular,
  'molecules-list--regular-subheader': Story_RegularSubheader,
  'molecules-list--states': Story_States,
};
