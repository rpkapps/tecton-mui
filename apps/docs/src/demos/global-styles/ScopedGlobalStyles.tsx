import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import GlobalStyles from '@tecton-mui/ui/GlobalStyles';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';

// A stable, module-level styles object: the rules are inserted once while the component is
// mounted. The selector is scoped to an attribute so the demo does not restyle the portal.
const styles = {
  '[data-release-notes] h4': { margin: '0 0 8px', fontSize: '1rem' },
  '[data-release-notes] ul': { margin: 0, paddingInlineStart: 20 },
  '[data-release-notes] li + li': { marginTop: 4 },
  '[data-release-notes] code': { fontFamily: 'monospace', fontWeight: 600 },
};

export default function ScopedGlobalStyles() {
  const [enabled, setEnabled] = React.useState(true);
  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 480 }}>
      <FormControlLabel
        control={
          <Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        }
        label="Mount GlobalStyles"
      />
      {enabled && <GlobalStyles styles={styles} />}
      {/* Plain HTML, as rendered from CMS content that cannot take sx or className props. */}
      <Box data-release-notes="" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <h4>Release notes</h4>
        <ul>
          <li>
            New <code>depthUnit</code> setting
          </li>
          <li>Faster horizon loading</li>
        </ul>
      </Box>
    </Stack>
  );
}
