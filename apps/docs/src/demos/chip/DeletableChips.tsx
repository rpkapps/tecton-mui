import * as React from 'react';
import Chip from '@tecton-mui/ui/Chip';
import Stack from '@tecton-mui/ui/Stack';

export default function DeletableChips() {
  const [filters, setFilters] = React.useState([
    'Region: North Sea',
    'Status: Producing',
    'Year: 2025',
  ]);
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {filters.map((filter) => (
        <Chip
          key={filter}
          label={filter}
          onDelete={() => setFilters((current) => current.filter((f) => f !== filter))}
        />
      ))}
      {filters.length === 0 && (
        <Chip
          label="Reset filters"
          variant="outlined"
          onClick={() => setFilters(['Region: North Sea', 'Status: Producing', 'Year: 2025'])}
        />
      )}
    </Stack>
  );
}
