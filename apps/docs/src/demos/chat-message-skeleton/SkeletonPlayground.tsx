import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import ChatMessageSkeleton from '@tecton-mui/ui/ChatMessageSkeleton';
import {
  Playground,
  jsxElement,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const controls: PlaygroundControl[] = [
  {
    name: 'lines',
    kind: 'number',
    min: 1,
    max: 8,
    defaultValue: 3,
    help: 'Shimmer lines per row.',
  },
  {
    name: 'rows',
    kind: 'number',
    min: 1,
    max: 5,
    defaultValue: 2,
    help: 'Placeholder messages in this example (not a prop).',
  },
];

function code(values: PlaygroundValues) {
  return jsxElement('ChatMessageSkeleton', {
    lines: values.lines === 3 ? undefined : values.lines,
  });
}

export default function SkeletonPlayground() {
  return (
    <Playground
      title="ChatMessageSkeleton"
      description="Set how many lines each placeholder row has."
      controls={controls}
      render={(values) => (
        <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          <Stack spacing={2}>
            {Array.from({ length: Number(values.rows) }, (_, index) => (
              <ChatMessageSkeleton key={index} lines={Number(values.lines)} />
            ))}
          </Stack>
        </Paper>
      )}
      code={code}
      minHeight={240}
    />
  );
}
