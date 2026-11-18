import Breadcrumbs from '@tecton-mui/ui/Breadcrumbs';
import Link from '@tecton-mui/ui/Link';
import Typography from '@tecton-mui/ui/Typography';

const path = ['Home', 'Assets', 'Europe', 'Norway', 'North Sea', 'Block 15'];

export default function CollapsedBreadcrumbs() {
  return (
    <Breadcrumbs aria-label="Breadcrumb" maxItems={4}>
      {path.map((item) => (
        <Link key={item} underline="hover" color="inherit" href={`#${item.toLowerCase()}`}>
          {item}
        </Link>
      ))}
      <Typography color="text.primary" aria-current="page">
        Well 15/9-F-12
      </Typography>
    </Breadcrumbs>
  );
}
