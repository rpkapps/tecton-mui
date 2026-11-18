import FormControl from '@tecton-mui/ui/FormControl';
import FormHelperText from '@tecton-mui/ui/FormHelperText';
import InputLabel from '@tecton-mui/ui/InputLabel';
import NativeSelect from '@tecton-mui/ui/NativeSelect';

export default function GroupedNativeSelect() {
  return (
    <FormControl variant="standard" sx={{ width: 280 }}>
      <InputLabel variant="standard" htmlFor="native-select-unit">
        Unit
      </InputLabel>
      <NativeSelect
        defaultValue="m"
        inputProps={{ id: 'native-select-unit', 'aria-describedby': 'native-select-unit-helper' }}
      >
        <optgroup label="Length">
          <option value="m">Metres</option>
          <option value="ft">Feet</option>
        </optgroup>
        <optgroup label="Time">
          <option value="ms">Milliseconds</option>
          <option value="s">Seconds</option>
        </optgroup>
      </NativeSelect>
      <FormHelperText id="native-select-unit-helper">
        Option groups use the native optgroup element
      </FormHelperText>
    </FormControl>
  );
}
