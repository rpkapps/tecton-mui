import * as React from 'react';
import FormGroup from '@tecton-mui/ui/FormGroup';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Switch from '@tecton-mui/ui/Switch';

export default function SwitchLabels() {
  const [autoSave, setAutoSave] = React.useState(true);
  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />}
        label={`Auto-save ${autoSave ? 'on' : 'off'}`}
      />
      <FormControlLabel control={<Switch size="small" />} label="Compact rows" />
      <FormControlLabel control={<Switch disabled defaultChecked />} label="Managed by policy" />
    </FormGroup>
  );
}
