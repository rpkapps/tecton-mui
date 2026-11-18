// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import { Backdrop, Button, CircularProgress } from '@tecton-mui/ui';

const L = { title: 'Atoms/Backdrop', component: Backdrop };
const Story_BackdropExample = {
  name: 'Backdrop',
  render: function StoryRender() {
    const [a, e] = React.useState(false);
    return (
      <React.Fragment>
        <Button variant="contained" onClick={() => e(true)}>
          Show backdrop
        </Button>
        <Backdrop
          sx={{
            color: 'var(--tecton-color-action-primary-adornment)',
            zIndex: (c) => c.zIndex.drawer + 1,
          }}
          open={a}
          onClick={() => e(false)}
        >
          <CircularProgress color="inherit" size="medium" />
        </Backdrop>
      </React.Fragment>
    );
  },
};

export const meta = L;
export const stories = {
  'atoms-backdrop--backdrop-example': Story_BackdropExample,
};
