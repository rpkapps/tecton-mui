import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import ChatMessageSkeleton from '@tecton-mui/ui/ChatMessageSkeleton';

export default function SkeletonLines() {
  return (
    <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 480 }}>
      <Stack spacing={2}>
        <ChatMessageSkeleton lines={1} />
        <ChatMessageSkeleton lines={2} />
        <ChatMessageSkeleton />
      </Stack>
    </Paper>
  );
}
