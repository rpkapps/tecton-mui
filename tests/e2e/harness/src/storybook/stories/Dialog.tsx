// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent as DialogContent_b,
  DialogTitle,
  Stack,
  Typography,
} from '@tecton-mui/ui';

const Ne = { title: 'Molecules/Dialog', component: Dialog };
function CB({ label: t, width: o, height: a, children: n }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {t}
      </Typography>
      <Box sx={{ position: 'relative', contain: 'layout', width: o, height: a }}>{n}</Box>
    </Stack>
  );
}
const ae = [
  { key: 'xs', label: 'Extra small · 444px', figmaWidth: 444, stageWidth: 508 },
  { key: 'sm', label: 'Small · 600px', figmaWidth: 600, stageWidth: 664 },
  { key: 'md', label: 'Medium · 900px', figmaWidth: 900, stageWidth: 964 },
  { key: 'lg', label: 'Large · 1200px', figmaWidth: 1200, stageWidth: 1264 },
  { key: 'xl', label: 'Extra large · 1536px', figmaWidth: 1536, stageWidth: 1600 },
];
function StandardCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="h6">All 5 width sizes</Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Column = Max Width axis. Height and internal layout are constant across sizes.
      </Typography>
      {ae.map((t) => (
        <CB key={t.key} label={t.label} width={t.stageWidth} height={260}>
          <Dialog
            open
            disablePortal
            disableScrollLock
            hideBackdrop
            maxWidth={t.key}
            fullWidth
            slotProps={{
              paper: {
                sx: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' },
              },
            }}
          >
            <DialogTitle>Title</DialogTitle>
            <DialogContent_b>
              <Typography variant="caption" component="div" sx={{ py: 0.5, px: 3 }}>
                Instance Slot
              </Typography>
            </DialogContent_b>
            <DialogActions>
              <Button variant="text" color="textOnly" size="medium">
                Action
              </Button>
              <Button variant="text" color="textOnly" size="medium">
                Action
              </Button>
            </DialogActions>
          </Dialog>
        </CB>
      ))}
    </Stack>
  );
}
function ConfirmCanvas() {
  return (
    <CB
      label="Confirm composition: title question, explanatory body, destructive primary action"
      width={640}
      height={240}
    >
      <Dialog
        open
        disablePortal
        disableScrollLock
        hideBackdrop
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' },
          },
        }}
      >
        <DialogTitle>Delete workspace?</DialogTitle>
        <DialogContent_b>
          This will permanently remove the workspace and all its contents. This action cannot be
          undone.
        </DialogContent_b>
        <DialogActions>
          <Button variant="text">Cancel</Button>
          <Button variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </CB>
  );
}
function FullscreenCanvas() {
  return (
    <CB
      label="Fullscreen: paper fills the viewport (stage stands in for the viewport here)"
      width={640}
      height={360}
    >
      <Dialog
        open
        disablePortal
        disableScrollLock
        hideBackdrop
        fullScreen
        slotProps={{
          paper: {
            sx: {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              maxWidth: 'none',
              maxHeight: 'none',
              borderRadius: 0,
            },
          },
        }}
      >
        <DialogTitle>Title</DialogTitle>
        <DialogContent_b>Instance Slot</DialogContent_b>
        <DialogActions>
          <Button variant="text" size="small">
            Action
          </Button>
          <Button variant="text" size="small">
            Action
          </Button>
        </DialogActions>
      </Dialog>
    </CB>
  );
}
function ScrollBodyCanvas() {
  return (
    <CB
      label={'scroll="body": paper grows to content height; document scrolls (not the paper)'}
      width={640}
      height={360}
    >
      <Dialog
        open
        disablePortal
        disableScrollLock
        hideBackdrop
        maxWidth="sm"
        fullWidth
        scroll="body"
        slotProps={{
          paper: {
            sx: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' },
          },
        }}
      >
        <DialogTitle>Title</DialogTitle>
        <DialogContent_b>
          <Stack spacing={1}>
            {Array.from({ length: 8 }).map((t, o) => (
              <Typography key={o} variant="body2">
                {'Paragraph '}
                {o + 1}. Instance Slot content that continues past the paper's natural height so the
                document scroll strategy becomes visible.
              </Typography>
            ))}
          </Stack>
        </DialogContent_b>
        <DialogActions>
          <Button variant="text" size="small">
            Action
          </Button>
          <Button variant="text" size="small">
            Action
          </Button>
        </DialogActions>
      </Dialog>
    </CB>
  );
}
function CUe() {
  const [t, o] = React.useState(false);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Interactive trigger: click to open a confirm dialog
      </Typography>
      <Button variant="contained" onClick={() => o(true)}>
        Delete workspace
      </Button>
      <Dialog open={t} onClose={() => o(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete workspace?</DialogTitle>
        <DialogContent_b>
          This will permanently remove the workspace and all its contents. This action cannot be
          undone.
        </DialogContent_b>
        <DialogActions>
          <Button variant="text" onClick={() => o(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => o(false)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={5}>
      <CB label="Figma sticker: title, placeholder content, two actions" width={640} height={220}>
        <Dialog
          open
          disablePortal
          disableScrollLock
          hideBackdrop
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' },
            },
          }}
        >
          <DialogTitle>Title</DialogTitle>
          <DialogContent_b>Instance Slot</DialogContent_b>
          <DialogActions>
            <Button variant="text" size="small">
              Action
            </Button>
            <Button variant="text" size="small">
              Action
            </Button>
          </DialogActions>
        </Dialog>
      </CB>
      <CUe />
    </Stack>
  );
}
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Confirm = { name: 'Confirm', render: () => <ConfirmCanvas /> };
const Story_Fullscreen = { name: 'Fullscreen', render: () => <FullscreenCanvas /> };
const Story_ScrollBody = { name: 'Scroll body', render: () => <ScrollBodyCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
function DialogPlaygroundRender(t) {
  const [o, a] = React.useState(t.open);
  return (
    <Stack direction="row" spacing={2} sx={{ p: 3, alignItems: 'flex-start' }}>
      <Button variant="contained" onClick={() => a(true)}>
        Open dialog
      </Button>
      <Dialog open={o} onClose={() => a(false)} maxWidth={t.maxWidth} fullWidth={t.fullWidth}>
        <DialogTitle>{t.title}</DialogTitle>
        <DialogContent_b>{t.description}</DialogContent_b>
        <DialogActions>
          <Button variant="text" onClick={() => a(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => a(false)}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
const Story_Playground = {
  name: 'Playground',
  args: {
    open: false,
    maxWidth: 'md',
    fullWidth: true,
    title: 'Delete workspace?',
    description:
      'This will permanently remove the workspace and all its contents. This action cannot be undone.',
  },
  render: (t) => <DialogPlaygroundRender key={String(t.open)} {...t} />,
};

export const meta = Ne;
export const stories = {
  'molecules-dialog--confirm': Story_Confirm,
  'molecules-dialog--examples': Story_Examples,
  'molecules-dialog--fullscreen': Story_Fullscreen,
  'molecules-dialog--playground': Story_Playground,
  'molecules-dialog--scroll-body': Story_ScrollBody,
  'molecules-dialog--standard': Story_Standard,
};
