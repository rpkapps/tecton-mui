import FormControl from '@tecton-mui/ui/FormControl';
import FormLabel from '@tecton-mui/ui/FormLabel';
import RadioGroup from '@tecton-mui/ui/RadioGroup';
import Radio from '@tecton-mui/ui/Radio';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';

export default function RadioButtonsGroup() {
  return (
    <FormControl>
      <FormLabel id="interval-label">Sampling interval</FormLabel>
      <RadioGroup aria-labelledby="interval-label" defaultValue="hourly" name="interval">
        <FormControlLabel value="minute" control={<Radio />} label="Every minute" />
        <FormControlLabel value="hourly" control={<Radio />} label="Hourly" />
        <FormControlLabel value="daily" control={<Radio />} label="Daily" />
        <FormControlLabel value="custom" control={<Radio />} label="Custom" disabled />
      </RadioGroup>
    </FormControl>
  );
}
