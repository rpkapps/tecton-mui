import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Heading, { HeadingActions, HeadingSearch, HeadingTitle } from '@tecton-mui/ui/Heading';
import Icon from '@tecton-mui/ui/Icon';
import List from '@tecton-mui/ui/List';
import ListItem from '@tecton-mui/ui/ListItem';
import ListItemText from '@tecton-mui/ui/ListItemText';
import Typography from '@tecton-mui/ui/Typography';

const WELLS = [
  { name: 'Alder 12-4H', field: 'Permian' },
  { name: 'Birch 3-1', field: 'Gulf Coast' },
  { name: 'Cedar 7-22H', field: 'Permian' },
  { name: 'Dogwood 2', field: 'North Sea' },
  { name: 'Elm 15-9', field: 'Gulf Coast' },
];

export default function SearchHeading() {
  const [query, setQuery] = React.useState('');
  const wells = WELLS.filter((well) =>
    `${well.name} ${well.field}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Heading>
        <HeadingTitle>Wells</HeadingTitle>
        <HeadingActions>
          <HeadingSearch
            label="Search wells"
            placeholder="Well or field"
            value={query}
            onChange={(_event, next) => setQuery(next)}
          />
          <Button variant="contained" startIcon={<Icon name="add" />}>
            New Well
          </Button>
        </HeadingActions>
      </Heading>
      <Box sx={{ px: { xs: 2, md: 9 }, pb: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} aria-live="polite">
          {query ? `${wells.length} of ${WELLS.length} wells match “${query}”` : 'All wells'}
        </Typography>
        <List dense>
          {wells.map((well) => (
            <ListItem key={well.name} disableGutters>
              <ListItemText primary={well.name} secondary={well.field} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
