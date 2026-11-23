import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Divider from '@tecton-mui/ui/Divider';
import FormControl from '@tecton-mui/ui/FormControl';
import Heading, { HeadingActions, HeadingSearch, HeadingTitle } from '@tecton-mui/ui/Heading';
import Icon from '@tecton-mui/ui/Icon';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import List from '@tecton-mui/ui/List';
import ListItem from '@tecton-mui/ui/ListItem';
import ListItemText from '@tecton-mui/ui/ListItemText';
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

const WELLS = [
  { name: 'Cedar 7-22H', field: 'Permian', drilled: 2024 },
  { name: 'Alder 12-4H', field: 'Permian', drilled: 2026 },
  { name: 'Elm 15-9', field: 'Gulf Coast', drilled: 2025 },
  { name: 'Birch 3-1', field: 'Gulf Coast', drilled: 2023 },
];

export default function ActionsHeading() {
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState('by well');
  const [sort, setSort] = React.useState('Recent');
  const wells = WELLS.filter((well) =>
    well.name.toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => (sort === 'Name' ? a.name.localeCompare(b.name) : b.drilled - a.drilled));

  return (
    <Box sx={{ width: '100%' }}>
      <Heading>
        <HeadingTitle>Wells</HeadingTitle>
        <HeadingActions>
          <HeadingSearch
            label="Search wells"
            value={query}
            onChange={(_event, next) => setQuery(next)}
          />
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
      <List dense sx={{ px: { xs: 2, md: 9 } }}>
        {wells.map((well) => (
          <ListItem key={well.name} disableGutters>
            <ListItemText
              primary={view === 'by well' ? well.name : well.field}
              secondary={view === 'by well' ? `${well.field} · ${well.drilled}` : well.name}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
