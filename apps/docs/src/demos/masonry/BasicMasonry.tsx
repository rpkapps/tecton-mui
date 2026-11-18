import Masonry from '@tecton-mui/ui/Masonry';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

const heights = [80, 140, 100, 60, 120, 90, 150, 70, 110];

export default function BasicMasonry() {
  return (
    <Masonry columns={{ xs: 2, sm: 3 }} spacing={2} sx={{ width: '100%', m: 0 }}>
      {heights.map((height, index) => (
        <Paper key={index} variant="outlined" sx={{ height, p: 1 }}>
          <Typography variant="caption">Note {index + 1}</Typography>
        </Paper>
      ))}
    </Masonry>
  );
}
