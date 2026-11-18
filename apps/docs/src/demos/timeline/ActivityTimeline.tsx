import Timeline from '@tecton-mui/ui/Timeline';
import TimelineItem from '@tecton-mui/ui/TimelineItem';
import TimelineSeparator from '@tecton-mui/ui/TimelineSeparator';
import TimelineConnector from '@tecton-mui/ui/TimelineConnector';
import TimelineContent from '@tecton-mui/ui/TimelineContent';
import TimelineDot from '@tecton-mui/ui/TimelineDot';
import TimelineOppositeContent from '@tecton-mui/ui/TimelineOppositeContent';
import Typography from '@tecton-mui/ui/Typography';

const events = [
  { time: '09:30', title: 'Survey uploaded', color: 'primary' as const },
  { time: '11:05', title: 'Interpretation started', color: 'secondary' as const },
  { time: '14:20', title: 'Quality check passed', color: 'success' as const },
  { time: '16:45', title: 'Published to team', color: 'grey' as const },
];

export default function ActivityTimeline() {
  return (
    <Timeline position="right" sx={{ width: '100%' }}>
      {events.map((event, index) => (
        <TimelineItem key={event.title}>
          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.25 }}>
            {event.time}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={event.color} />
            {index < events.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2">{event.title}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
