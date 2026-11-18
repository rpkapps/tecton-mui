import * as React from 'react';
import LinearProgress from '@tecton-mui/ui/LinearProgress';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

export default function LinearIndicators() {
  const [progress, setProgress] = React.useState(10);
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 10 : p + 10));
    }, 800);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <Stack spacing={2} sx={{ width: 360 }}>
      <LinearProgress aria-label="Synchronising" />
      <div>
        <Typography id="upload-label" variant="body2" gutterBottom>
          Uploading survey… {progress}%
        </Typography>
        <LinearProgress variant="determinate" value={progress} aria-labelledby="upload-label" />
      </div>
      <LinearProgress variant="buffer" value={40} valueBuffer={60} aria-label="Streaming" />
    </Stack>
  );
}
