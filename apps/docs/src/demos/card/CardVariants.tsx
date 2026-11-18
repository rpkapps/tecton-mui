import Card from '@tecton-mui/ui/Card';
import CardContent from '@tecton-mui/ui/CardContent';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

export default function CardVariants() {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {(['outlined', 'elevated'] as const).map((variant) => (
        <Card key={variant} variant={variant} sx={{ width: 220 }}>
          <CardContent>
            <Typography variant="overline">{variant}</Typography>
            <Typography variant="h6" component="p">
              1,284
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active wells
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
