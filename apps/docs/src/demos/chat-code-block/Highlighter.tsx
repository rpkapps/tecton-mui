import Stack from '@tecton-mui/ui/Stack';
import ChatCodeBlock from '@tecton-mui/ui/ChatCodeBlock';
// Shiki behind a small adapter: tokens for the block's language, coloured by the Tecton code theme.
import { shikiHighlighter } from '../../lib/highlight/chatCode';

const ts = `export async function readPressure(well: string): Promise<number> {
  const res = await fetch(\`/api/wells/\${well}/pressure\`);
  return (await res.json()).bar; // bar
}`;

const py = `import pandas as pd

def high_wells(path: str, limit: int = 320) -> pd.DataFrame:
    readings = pd.read_csv(path)  # one row per reading
    return readings[readings["pressure"] > limit]`;

export default function Highlighter() {
  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 560 }}>
      <ChatCodeBlock language="typescript" highlighter={shikiHighlighter}>
        {ts}
      </ChatCodeBlock>
      <ChatCodeBlock language="python" highlighter={shikiHighlighter}>
        {py}
      </ChatCodeBlock>
    </Stack>
  );
}
