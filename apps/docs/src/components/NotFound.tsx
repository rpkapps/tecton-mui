import Typography from '@tecton-mui/ui/Typography';
import { DocumentHead } from '../lib/head';
import { RouterLink } from './links';

export function NotFound() {
  return (
    <div data-pagefind-ignore="all">
      <DocumentHead title="Page not found" />
      <Typography variant="h3" component="h1" gutterBottom>
        Page not found
      </Typography>
      <Typography sx={{ mb: 2 }}>
        The page you requested does not exist in this version of the documentation.
      </Typography>
      <RouterLink to="/">Go to the documentation home</RouterLink>
    </div>
  );
}
