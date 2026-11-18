import Card from '@tecton-mui/ui/Card';
import CardHeader from '@tecton-mui/ui/CardHeader';
import CardContent from '@tecton-mui/ui/CardContent';
import CardActions from '@tecton-mui/ui/CardActions';
import Avatar from '@tecton-mui/ui/Avatar';
import Button from '@tecton-mui/ui/Button';
import IconButton from '@tecton-mui/ui/IconButton';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';

export default function ProjectCard() {
  return (
    <Card sx={{ width: 340 }}>
      <CardHeader
        avatar={<Avatar>NF</Avatar>}
        action={
          <IconButton aria-label="Project options">
            <Icon name="more-vert" />
          </IconButton>
        }
        title="Northern field study"
        subheader="Updated 3 days ago"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Structural interpretation of the northern block with 42 wells and two seismic surveys.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Open</Button>
        <Button size="small">Share</Button>
      </CardActions>
    </Card>
  );
}
