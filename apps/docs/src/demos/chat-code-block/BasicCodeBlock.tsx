import Box from '@tecton-mui/ui/Box';
import ChatCodeBlock from '@tecton-mui/ui/ChatCodeBlock';

const query = `SELECT well, pressure, read_at
FROM readings
WHERE pressure > 320
ORDER BY read_at DESC;`;

export default function BasicCodeBlock() {
  return (
    <Box sx={{ width: '100%', maxWidth: 520 }}>
      <ChatCodeBlock language="sql">{query}</ChatCodeBlock>
    </Box>
  );
}
