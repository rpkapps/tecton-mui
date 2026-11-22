import Paper from '@tecton-mui/ui/Paper';
import ChatMessageSources, { ChatMessageSource } from '@tecton-mui/ui/ChatMessageSources';
import {
  Playground,
  jsxElement,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const SOURCES = [
  { href: '#pressure-log', title: 'Pressure log, Alpha-7' },
  { href: '#envelope', title: 'Operating envelope, rev. 4' },
  { href: '#integrity', title: 'Well integrity plan' },
  { href: '#memo', title: 'Engineering memo 2026-14' },
  { href: '#maintenance', title: '' },
];

const controls: PlaygroundControl[] = [
  { name: 'label', kind: 'text', defaultValue: 'Sources' },
  { name: 'count', label: 'sources', kind: 'number', min: 1, max: 5, defaultValue: 3 },
  {
    name: 'index',
    kind: 'boolean',
    defaultValue: true,
    help: 'Number badge on each ChatMessageSource.',
  },
];

function code(values: PlaygroundValues) {
  const items = SOURCES.slice(0, Number(values.count))
    .map((source, i) =>
      jsxElement('ChatMessageSource', {
        index: values.index ? i + 1 : undefined,
        href: source.href,
        title: source.title || undefined,
      }),
    )
    .join('\n');
  return jsxElement(
    'ChatMessageSources',
    { label: values.label === 'Sources' ? undefined : values.label },
    items,
  );
}

export default function SourcesPlayground() {
  return (
    <Playground
      title="ChatMessageSources"
      description="Change the label, the number of sources and their number badges. A source without a title shows its link."
      controls={controls}
      render={(values) => (
        <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          <ChatMessageSources label={String(values.label)}>
            {SOURCES.slice(0, Number(values.count)).map((source, i) => (
              <ChatMessageSource
                key={source.href}
                index={values.index ? i + 1 : undefined}
                href={source.href}
                title={source.title || undefined}
              />
            ))}
          </ChatMessageSources>
        </Paper>
      )}
      code={code}
      minHeight={240}
    />
  );
}
