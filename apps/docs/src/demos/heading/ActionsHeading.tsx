import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Divider from '@tecton-mui/ui/Divider';
import FormControl from '@tecton-mui/ui/FormControl';
import Heading, { HeadingActions, HeadingTitle } from '@tecton-mui/ui/Heading';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Select from '@tecton-mui/ui/Select';
import Typography from '@tecton-mui/ui/Typography';

/** A compact select with its label inside, before the value ("Sort: Recent"). */
function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <FormControl size="small" variant="filled">
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ 'aria-label': label }}
        startAdornment={
          <InputAdornment position="start">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {label}:
            </Typography>
          </InputAdornment>
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function ActionsHeading() {
  const [view, setView] = React.useState('by well');
  const [sort, setSort] = React.useState('Recent');

  return (
    <Box sx={{ width: '100%' }}>
      <Heading>
        <HeadingTitle>Wells</HeadingTitle>
        <HeadingActions>
          <IconButton aria-label="Search">
            <Icon name="search" />
          </IconButton>
          <IconButton aria-label="Filter">
            <Icon name="filter" />
          </IconButton>
          <Divider orientation="vertical" flexItem emphasis="subtle" />
          <LabeledSelect
            label="View"
            value={view}
            options={['by well', 'by field']}
            onChange={setView}
          />
          <LabeledSelect
            label="Sort"
            value={sort}
            options={['Recent', 'Name']}
            onChange={setSort}
          />
          <Divider orientation="vertical" flexItem emphasis="subtle" />
          <Button variant="contained" startIcon={<Icon name="add" />}>
            New Well
          </Button>
        </HeadingActions>
      </Heading>
    </Box>
  );
}
