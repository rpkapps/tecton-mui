import Grid from '@tecton-mui/ui/Grid';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

const metrics = ['Wells', 'Fields', 'Surveys', 'Reports', 'Users', 'Alerts'];

export default function ResponsiveGrid() {
  return (
    <Grid container spacing={2} sx={{ width: '100%' }}>
      {metrics.map((metric, index) => (
        <Grid key={metric} size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline">{metric}</Typography>
            <Typography variant="data" component="p">
              {(index + 1) * 137}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
