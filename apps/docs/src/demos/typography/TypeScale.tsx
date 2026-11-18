import Typography from '@tecton-mui/ui/Typography';
import Stack from '@tecton-mui/ui/Stack';

const variants = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
] as const;

export default function TypeScale() {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {variants.map((variant) => (
        <Typography key={variant} variant={variant} component="div" noWrap>
          {variant}: Reservoir summary
        </Typography>
      ))}
      <Typography variant="data" component="div">
        data: 12,480.50 m · 3,214 bbl/d
      </Typography>
    </Stack>
  );
}
