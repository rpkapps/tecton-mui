import Button from '@tecton-mui/ui/Button';
import Heading, { HeadingActions, HeadingTitle } from '@tecton-mui/ui/Heading';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

export default function SectionHeading() {
  return (
    <Paper sx={{ width: '100%', px: 3, pb: 3 }}>
      {/* The paper has its own padding: no gutters, a smaller h2 title. */}
      <Heading component="section" disableGutters sx={{ py: 2 }} aria-labelledby="team-title">
        <HeadingTitle slotProps={{ title: { component: 'h2', variant: 'h5', id: 'team-title' } }}>
          Team
        </HeadingTitle>
        <HeadingActions>
          <Button variant="outlined">Invite</Button>
        </HeadingActions>
      </Heading>
      <Typography sx={{ color: 'text.secondary' }}>Five people work on this portfolio.</Typography>
    </Paper>
  );
}
