import Breadcrumbs from '@tecton-mui/ui/Breadcrumbs';
import Link from '@tecton-mui/ui/Link';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';

export default function BasicBreadcrumbs() {
  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      separator={<Icon name="chevron-right-small" size="small" />}
    >
      <Link underline="hover" color="inherit" href="#projects">
        Projects
      </Link>
      <Link underline="hover" color="inherit" href="#northern-field">
        Northern field
      </Link>
      <Typography color="text.primary" aria-current="page">
        Well A-12
      </Typography>
    </Breadcrumbs>
  );
}
