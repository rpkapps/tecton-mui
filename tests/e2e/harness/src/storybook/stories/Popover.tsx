// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
/* eslint-disable react-hooks/refs -- verbatim story code */
import * as React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
} from '@tecton-mui/ui';

function HTMLButtonElement({ label: t, width: r, height: o, children: n }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {t}
      </Typography>
      <Box sx={{ position: 'relative', contain: 'layout', width: r, height: o }}>{n}</Box>
    </Stack>
  );
}
function StickersCanvas() {
  return (
    <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
      <HTMLButtonElement label="Content panel with action buttons" width={420} height={190}>
        <Popover
          open
          disablePortal
          disableScrollLock
          anchorReference="anchorPosition"
          anchorPosition={{ top: 8, left: 8 }}
          slotProps={{ paper: { sx: { width: 400 } } }}
        >
          <Stack sx={{ padding: 'var(--tecton-space-200)' }} spacing={2}>
            <Typography variant="h5">Append to design</Typography>
            <Typography variant="body1">
              This is the content of the popover. This is the content of the popover. This is the
              content of the popover.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" size="small">
                Accept
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                sx={{ color: 'var(--tecton-color-action-tertiary-text)' }}
              >
                Reject
              </Button>
            </Stack>
          </Stack>
        </Popover>
      </HTMLButtonElement>
      <HTMLButtonElement label="Profile with quick-action icon row" width={260} height={190}>
        <Popover
          open
          disablePortal
          disableScrollLock
          anchorReference="anchorPosition"
          anchorPosition={{ top: 8, left: 8 }}
          slotProps={{ paper: { sx: { width: 239 } } }}
        >
          <Stack sx={{ padding: 'var(--tecton-space-200)' }} spacing={2}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
                sx={{
                  '& .MuiBadge-badge': {
                    width: 12,
                    height: 12,
                    minWidth: 12,
                    padding: 0,
                    borderRadius: '50%',
                    border: '2px solid var(--tecton-color-surface-elevation-2-bg)',
                    boxSizing: 'border-box',
                  },
                }}
              >
                <Avatar
                  size="large"
                  sx={{
                    backgroundColor: 'var(--tecton-color-accent-lilac-main)',
                    color: 'var(--tecton-color-text-primary)',
                  }}
                >
                  <span className="tecton-person-filled tecton-icon-lg" aria-hidden />
                </Avatar>
              </Badge>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Mark Smith</Typography>
                <Typography variant="body1">Admin</Typography>
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <IconButton aria-label="Notifications">
                <span className="tecton-notifications-outline tecton-icon-md" aria-hidden />
              </IconButton>
              <IconButton aria-label="Add">
                <span className="tecton-add-circle-outline tecton-icon-md" aria-hidden />
              </IconButton>
              <IconButton aria-label="Projects">
                <span className="tecton-project-outline tecton-icon-md" aria-hidden />
              </IconButton>
            </Stack>
          </Stack>
        </Popover>
      </HTMLButtonElement>
    </Stack>
  );
}
const fe = { title: 'Molecules/Popover', component: Popover };
const Story_Stickers = { name: 'Stickers', render: () => <StickersCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    open: true,
    anchorVertical: 'bottom',
    anchorHorizontal: 'left',
    title: 'Append to design',
    description: 'This is the content of the popover.',
  },
  render: function StoryRender(t) {
    const Typography2 = () => {
      const o = React.useRef(null);
      return (
        <HTMLButtonElement label="Playground" width={420} height={260}>
          <Box sx={{ padding: 'var(--tecton-space-100)' }}>
            <Button ref={o} variant="contained" color="primary">
              Anchor
            </Button>
          </Box>
          <Popover
            open={t.open}
            anchorEl={o.current}
            disablePortal
            disableScrollLock
            anchorOrigin={{ vertical: t.anchorVertical, horizontal: t.anchorHorizontal }}
            slotProps={{ paper: { sx: { width: 340 } } }}
          >
            <Stack sx={{ padding: 'var(--tecton-space-200)' }} spacing={2}>
              <Typography variant="h5">{t.title}</Typography>
              <Typography variant="body1">{t.description}</Typography>
            </Stack>
          </Popover>
        </HTMLButtonElement>
      );
    };
    return <Typography2 />;
  },
};

export const meta = fe;
export const stories = {
  'molecules-popover--playground': Story_Playground,
  'molecules-popover--stickers': Story_Stickers,
};
