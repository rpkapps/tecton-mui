import Box from '@tecton-mui/ui/Box';
import ChatCodeBlock from '@tecton-mui/ui/ChatCodeBlock';
import { shikiHighlighter } from '../../lib/highlight/chatCode';
import {
  Playground,
  jsxElement,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const SAMPLES: Record<string, string> = {
  typescript: `interface Reading {
  well: string;
  pressure: number; // bar
}

export function overLimit(readings: Reading[], limit = 320): string[] {
  return readings.filter((r) => r.pressure > limit).map((r) => r.well);
}`,
  python: `def over_limit(readings, limit=320):
    """Wells whose pressure is above the limit."""
    return [r["well"] for r in readings if r["pressure"] > limit]  # bar`,
  sql: `SELECT well, pressure
FROM readings
WHERE pressure > 320 AND basin = 'North'
ORDER BY pressure DESC;`,
  json: `{ "well": "Alpha-7", "pressure": 334, "alarm": true }`,
};

const controls: PlaygroundControl[] = [
  {
    name: 'language',
    kind: 'enum',
    options: ['typescript', 'python', 'sql', 'json'],
    defaultValue: 'typescript',
    help: 'Picks the sample and the grammar the highlighter uses.',
  },
  {
    name: 'highlighter',
    kind: 'boolean',
    defaultValue: true,
    help: 'Shiki with the Tecton code theme.',
  },
];

function code(values: PlaygroundValues) {
  return jsxElement(
    'ChatCodeBlock',
    {
      language: values.language,
      highlighter: values.highlighter ? raw('shikiHighlighter') : undefined,
    },
    '{code}',
  );
}

export default function CodeBlockPlayground() {
  return (
    <Playground
      title="ChatCodeBlock"
      description="Pick a language and switch the highlighter. The copy button copies the code."
      controls={controls}
      render={(values) => (
        <Box sx={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <ChatCodeBlock
            language={String(values.language)}
            highlighter={values.highlighter ? shikiHighlighter : undefined}
          >
            {SAMPLES[String(values.language)]!}
          </ChatCodeBlock>
        </Box>
      )}
      code={code}
      minHeight={260}
    />
  );
}
