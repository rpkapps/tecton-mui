import * as React from 'react';
import FormControl from '@tecton-mui/ui/FormControl';
import FormHelperText from '@tecton-mui/ui/FormHelperText';
import IconButton from '@tecton-mui/ui/IconButton';
import Input from '@tecton-mui/ui/Input';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import InputLabel from '@tecton-mui/ui/InputLabel';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function InputWithAdornments() {
  const [query, setQuery] = React.useState('');
  return (
    <Stack spacing={3} sx={{ width: 320 }}>
      <FormControl variant="standard">
        <InputLabel htmlFor="input-depth">Measured depth</InputLabel>
        <Input
          id="input-depth"
          type="number"
          defaultValue={2450}
          endAdornment={<InputAdornment position="end">m</InputAdornment>}
          aria-describedby="input-depth-helper"
        />
        <FormHelperText id="input-depth-helper">Along the well path</FormHelperText>
      </FormControl>
      <FormControl variant="standard">
        <InputLabel htmlFor="input-search">Search wells</InputLabel>
        <Input
          id="input-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <Icon name="search" size="small" />
            </InputAdornment>
          }
          endAdornment={
            query ? (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')}>
                  <Icon name="close-small" size="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }
        />
      </FormControl>
    </Stack>
  );
}
