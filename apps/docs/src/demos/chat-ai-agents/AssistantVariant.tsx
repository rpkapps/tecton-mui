import Button from '@tecton-mui/ui/Button';
import Icon from '@tecton-mui/ui/Icon';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type {
  ChatAdapter,
  ChatMessage,
  ChatMessageChunk,
  ChatPartRendererMap,
  ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const agent: ChatUser = { id: 'agent', displayName: 'Well agent', role: 'assistant' };

interface Well {
  name: string;
  depth: string;
  confidence: number;
}

// Data parts come from your server: check their shape before you render them.
function isWells(data: unknown): data is Well[] {
  return Array.isArray(data) && data.every((well: Partial<Well>) => typeof well?.name === 'string');
}

const confidenceColor = (value: number) =>
  value >= 75 ? 'success.main' : value >= 40 ? 'warning.main' : 'error.main';

// The agent sends the wells as data (a `data-wells` part), drawn as a table, not as Markdown.
function WellTable({ wells }: { wells: Well[] }) {
  return (
    <div>
      <TableContainer>
        <Table size="small" aria-label="Matching wells">
          <TableHead>
            <TableRow>
              <TableCell>Well</TableCell>
              <TableCell>Depth interval</TableCell>
              <TableCell align="right">Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wells.map((well) => (
              <TableRow key={well.name}>
                <TableCell>{well.name}</TableCell>
                <TableCell>{well.depth}</TableCell>
                <TableCell align="right" sx={{ color: confidenceColor(well.confidence) }}>
                  {well.confidence}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button size="small" href="#wells" endIcon={<Icon name="chevron-right" />} sx={{ mt: 1 }}>
        View all wells
      </Button>
    </div>
  );
}

// One renderer per custom part type. Module-level constant: a stable identity.
const partRenderers: ChatPartRendererMap = {
  'data-wells': ({ part }) => {
    const data = 'data' in part ? part.data : undefined;
    return isWells(data) ? <WellTable wells={data} /> : null;
  },
};

const messages: ChatMessage[] = [
  {
    id: 'q1',
    role: 'user',
    author: you,
    parts: [
      {
        type: 'text',
        text: 'Find wells in the North Basin updated in the last 30 days with gamma ray, resistivity and density logs.',
      },
    ],
  },
  {
    id: 'a1',
    role: 'assistant',
    author: agent,
    parts: [
      {
        type: 'reasoning',
        state: 'done',
        text: 'Filter the North Basin wells to those updated in the last 30 days, then keep the ones with gamma ray, resistivity and density curves. Rank them by how much of the interval the three curves cover together.',
      },
      {
        type: 'text',
        text: '**38 matching wells** in the North Basin, updated in the last 30 days:',
      },
      {
        type: 'data-wells',
        data: [
          { name: 'NB-14-H-02', depth: '1260–1325 m', confidence: 42 },
          { name: 'NB-14-H-07', depth: '2140–2205 m', confidence: 89 },
          { name: 'NB-19-D-11', depth: '3010–3065 m', confidence: 76 },
          { name: 'NB-21-G-04', depth: '920–980 m', confidence: 21 },
        ],
      },
    ],
  },
];

const reasoning = [
  'The user wants the well whose three curves overlap the most. ',
  'NB-14-H-07 has the highest confidence and no gaps between 2140 m and 2205 m.',
];

const reply = [
  'NB-14-H-07 has the **best coverage**: all three curves run from 2140 m to 2205 m ',
  'without gaps. I can open it in the log viewer.',
];

// Waits before the answer starts (the dots show), then streams the reasoning and the answer.
const adapter: ChatAdapter = {
  async sendMessage({ message }) {
    const messageId = `answer-${message.id}`;
    const chunks: ChatMessageChunk[] = [
      { type: 'start', messageId, author: agent },
      { type: 'reasoning-start', id: 'think' },
      ...reasoning.map((delta): ChatMessageChunk => ({
        type: 'reasoning-delta',
        id: 'think',
        delta,
      })),
      { type: 'reasoning-end', id: 'think' },
      { type: 'text-start', id: 'text' },
      ...reply.map((delta): ChatMessageChunk => ({ type: 'text-delta', id: 'text', delta })),
      { type: 'text-end', id: 'text' },
      { type: 'finish', messageId },
    ];
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        for (const chunk of chunks) {
          controller.enqueue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        controller.close();
      },
    });
  },
};

export default function AssistantVariant() {
  return (
    <ChatBox
      adapter={adapter}
      currentUser={you}
      members={[you, agent]}
      initialMessages={messages}
      partRenderers={partRenderers}
      variant="assistant"
      suggestions={['Which well has the best coverage?']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ width: '100%', height: 520 }}
    />
  );
}
