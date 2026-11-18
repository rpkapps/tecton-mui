// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Box, Button, IconButton, SnackbarContent, Stack, Typography } from '@tecton-mui/ui';

function SnackbarCloseButton() {
  return (
    <Button
      variant="text"
      size="medium"
      sx={{
        minHeight: '32px',
        paddingInline: 'var(--tecton-space-100)',
        paddingBlock: 'var(--tecton-space-75)',
        borderRadius: 'var(--tecton-radius-50)',
        fontSize: 'var(--tecton-font-size-small)',
        lineHeight: 'var(--tecton-line-height-small)',
        fontWeight: 500,
      }}
    >
      Action
    </Button>
  );
}
function N() {
  return (
    <IconButton
      aria-label="Close"
      size="small"
      sx={{ padding: 0, color: 'var(--tecton-color-text-primary)' }}
    >
      <span className="tecton-close-outline" style={{ fontSize: '20px' }} aria-hidden />
    </IconButton>
  );
}
function CU({ type: e, showAction: a, message: n = 'Message' }) {
  return (
    <SnackbarContent
      type={e}
      message={<Box>{n}</Box>}
      action={
        <React.Fragment>
          {a && <SnackbarCloseButton />}
          <N />
        </React.Fragment>
      }
    />
  );
}
function DefaultCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Type = Default (neutral grey)
      </Typography>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          With Action button + dismiss
        </Typography>
        <CU type="default" showAction />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          Dismiss only
        </Typography>
        <CU type="default" showAction={false} />
      </Box>
    </Stack>
  );
}
function SuccessCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Type = Success (deep green)
      </Typography>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          With Action button + dismiss
        </Typography>
        <CU type="success" showAction />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          Dismiss only
        </Typography>
        <CU type="success" showAction={false} />
      </Box>
    </Stack>
  );
}
function ErrorCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Type = Error (deep red)
      </Typography>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          With Action button + dismiss
        </Typography>
        <CU type="error" showAction />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          Dismiss only
        </Typography>
        <CU type="error" showAction={false} />
      </Box>
    </Stack>
  );
}
function AnchorsCanvas() {
  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="h6">3 authored Type variants (filled)</Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Type semantic: Default (neutral grey), Success (deep green), Error (deep red). Every type
          is a solid filled surface with a lighter-toned 1px border. Dark surface always, regardless
          of app theme.
        </Typography>
      </Stack>
      <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            With Action button + dismiss
          </Typography>
          {['default', 'success', 'error'].map((e) => (
            <Box key={e}>
              <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </Typography>
              <CU type={e} showAction />
            </Box>
          ))}
        </Stack>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Dismiss only (message-only)
          </Typography>
          {['default', 'success', 'error'].map((e) => (
            <Box key={e}>
              <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </Typography>
              <CU type={e} showAction={false} />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
const Et = { title: 'Molecules/Snackbar', component: SnackbarContent };
const Story_Default = { name: 'Default', render: () => <DefaultCanvas /> };
const Story_Success = { name: 'Success', render: () => <SuccessCanvas /> };
const Story_Error = { name: 'Error', render: () => <ErrorCanvas /> };
const Story_Anchors = { name: 'Anchors', render: () => <AnchorsCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    type: 'default',
    open: true,
    message: 'Message',
    anchorVertical: 'bottom',
    anchorHorizontal: 'left',
    autoHideDuration: 6e3,
    width: 'medium',
    customWidth: 320,
    fullWidth: false,
  },
  render: (e) => (
    <Box
      sx={{
        p: 3,
        minHeight: 220,
        display: 'flex',
        justifyContent:
          e.anchorHorizontal === 'left'
            ? 'flex-start'
            : e.anchorHorizontal === 'right'
              ? 'flex-end'
              : 'center',
        alignItems: e.anchorVertical === 'top' ? 'flex-start' : 'flex-end',
      }}
    >
      {e.open ? (
        <SnackbarContent
          type={e.type}
          {...(e.fullWidth
            ? { fullWidth: true }
            : e.width === 'custom'
              ? { width: e.customWidth }
              : e.width !== 'medium'
                ? { width: e.width }
                : {})}
          message={<Box>{e.message}</Box>}
          action={
            <React.Fragment>
              <SnackbarCloseButton />
              <N />
            </React.Fragment>
          }
        />
      ) : null}
    </Box>
  ),
};

export const meta = Et;
export const stories = {
  'molecules-snackbar--anchors': Story_Anchors,
  'molecules-snackbar--default': Story_Default,
  'molecules-snackbar--error': Story_Error,
  'molecules-snackbar--playground': Story_Playground,
  'molecules-snackbar--success': Story_Success,
};
