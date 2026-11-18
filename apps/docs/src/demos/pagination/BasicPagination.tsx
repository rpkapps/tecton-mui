import * as React from 'react';
import Pagination from '@tecton-mui/ui/Pagination';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

export default function BasicPagination() {
  const [page, setPage] = React.useState(3);
  return (
    <Stack spacing={2}>
      <Typography variant="body2">Page {page} of 12</Typography>
      <Pagination count={12} page={page} onChange={(_, value) => setPage(value)} />
      <Pagination
        count={12}
        page={page}
        onChange={(_, value) => setPage(value)}
        variant="outlined"
        shape="rounded"
        size="small"
      />
    </Stack>
  );
}
