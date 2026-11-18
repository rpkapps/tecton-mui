// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Alert, AlertTitle, Box, Button, IconButton, Stack, Typography } from '@tecton-mui/ui';

function CU({
  severity: e,
  variant: a,
  title: n = 'Title',
  description: t = 'Description',
  action: o = 'label',
  close: l = true,
}) {
  const r = o || l;
  return (
    <Alert
      severity={e}
      variant={a}
      action={
        r ? (
          <React.Fragment>
            {o === 'label' && (
              <Typography
                variant="body2"
                sx={{ color: 'inherit', alignSelf: 'center', paddingInline: 1 }}
              >
                Label
              </Typography>
            )}
            {o === 'button' && (
              <Button size="small" variant="text" color="inherit" sx={{ color: 'inherit' }}>
                Button
              </Button>
            )}
            {l && (
              <IconButton size="small" color="inherit" aria-label="Close" sx={{ color: 'inherit' }}>
                <span className="tecton-icon-md tecton-close-outline" aria-hidden />
              </IconButton>
            )}
          </React.Fragment>
        ) : undefined
      }
    >
      {n ? <AlertTitle>{n}</AlertTitle> : null}
      {t || null}
    </Alert>
  );
}
const be = ['error', 'warning', 'info', 'success'];
function FilledCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Filled
      </Typography>
      {be.map((e) => (
        <CU key={e} severity={e} variant="filled" action="button" />
      ))}
    </Stack>
  );
}
function OutlinedCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Outlined
      </Typography>
      {be.map((e) => (
        <CU key={e} severity={e} variant="outlined" action="label" />
      ))}
    </Stack>
  );
}
function TitleOnlyCanvas() {
  return <CU severity="info" variant="filled" description={false} action={false} close={false} />;
}
function WithCloseCanvas() {
  return <CU severity="info" variant="filled" description={false} action={false} close />;
}
function WithButtonCanvas() {
  return <CU severity="info" variant="filled" description={false} action="button" close={false} />;
}
function ButtonAndCloseCanvas() {
  return <CU severity="info" variant="filled" description={false} action="button" close />;
}
function WithDescriptionCanvas() {
  return <CU severity="info" variant="filled" action={false} close={false} />;
}
function FullRowCanvas() {
  return <CU severity="info" variant="filled" action="label" close />;
}
const _t = { title: 'Molecules/Alert', component: Alert };
const Story_Filled = { name: 'Filled', render: () => <FilledCanvas /> };
const Story_Outlined = { name: 'Outlined', render: () => <OutlinedCanvas /> };
const Story_TitleOnly = { name: 'Title only', render: () => <TitleOnlyCanvas /> };
const Story_WithClose = { name: 'With close', render: () => <WithCloseCanvas /> };
const Story_WithButton = { name: 'With button', render: () => <WithButtonCanvas /> };
const Story_ButtonAndClose = { name: 'Button and close', render: () => <ButtonAndCloseCanvas /> };
const Story_WithDescription = { name: 'With description', render: () => <WithDescriptionCanvas /> };
const Story_FullRow = { name: 'Full row', render: () => <FullRowCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    severity: 'info',
    variant: 'filled',
    title: 'Title',
    children: 'Description',
    closable: true,
  },
  render: (e) => (
    <Box sx={{ p: 3 }}>
      <Alert severity={e.severity} variant={e.variant} onClose={e.closable ? () => {} : undefined}>
        {e.title ? <AlertTitle>{e.title}</AlertTitle> : null}
        {e.children ? e.children : null}
      </Alert>
    </Box>
  ),
};

export const meta = _t;
export const stories = {
  'molecules-alert--button-and-close': Story_ButtonAndClose,
  'molecules-alert--filled': Story_Filled,
  'molecules-alert--full-row': Story_FullRow,
  'molecules-alert--outlined': Story_Outlined,
  'molecules-alert--playground': Story_Playground,
  'molecules-alert--title-only': Story_TitleOnly,
  'molecules-alert--with-button': Story_WithButton,
  'molecules-alert--with-close': Story_WithClose,
  'molecules-alert--with-description': Story_WithDescription,
};
