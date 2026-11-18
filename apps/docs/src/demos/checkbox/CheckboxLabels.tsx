import Checkbox from '@tecton-mui/ui/Checkbox';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import FormGroup from '@tecton-mui/ui/FormGroup';

export default function CheckboxLabels() {
  return (
    <FormGroup>
      <FormControlLabel control={<Checkbox defaultChecked />} label="Email notifications" />
      <FormControlLabel control={<Checkbox />} label="Weekly summary" />
      <FormControlLabel control={<Checkbox />} label="Beta features" disabled />
    </FormGroup>
  );
}
