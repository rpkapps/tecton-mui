import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';
import ChatMessageSources, { ChatMessageSource } from '@tecton-mui/ui/ChatMessageSources';

export default function SourceList() {
  return (
    <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 520 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Alpha-7 reads 334 bar, above the 320 bar limit set in the operating envelope.
      </Typography>
      <ChatMessageSources label="References">
        <ChatMessageSource index={1} href="#pressure-log" title="Pressure log, Alpha-7" />
        <ChatMessageSource index={2} href="#envelope" title="Operating envelope, rev. 4" />
        <ChatMessageSource index={3} href="#maintenance" />
      </ChatMessageSources>
    </Paper>
  );
}
