import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Chip from '@tecton-mui/ui/Chip';
import Icon from '@tecton-mui/ui/Icon';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ChatBox from '@tecton-mui/ui/ChatBox';
import type {
  ChatAdapter,
  ChatMessage,
  ChatMessageChunk,
  ChatPartRendererMap,
  ChatUser,
} from '@tecton-mui/ui/ChatHeadless';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = {
  id: 'assistant',
  displayName: 'Maintenance agent',
  role: 'assistant',
};

interface WorkOrder {
  number: string;
  title: string;
  status: 'Open' | 'In progress' | 'Done';
  assignee: string;
  due: string;
}

// Data parts come from your server: check their shape before you render them.
function isWorkOrder(data: unknown): data is WorkOrder {
  const value = data as Partial<WorkOrder> | null;
  return typeof value?.number === 'string' && typeof value.title === 'string';
}

const STATUS_COLOR = { Open: 'info', 'In progress': 'warning', Done: 'success' } as const;

function WorkOrderCard({ order }: { order: WorkOrder }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, my: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Icon name="engineering" size="small" />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {order.number} · {order.title}
        </Typography>
        <Chip size="small" label={order.status} color={STATUS_COLOR[order.status]} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {order.assignee} · due {order.due}
      </Typography>
      <Button size="small" sx={{ mt: 1 }} href={`#${order.number}`}>
        Open work order
      </Button>
    </Paper>
  );
}

// One renderer per custom part type. Module-level constant: a stable identity.
const partRenderers: ChatPartRendererMap = {
  'data-work-order': ({ part }) => {
    const data = 'data' in part ? part.data : undefined;
    return isWorkOrder(data) ? <WorkOrderCard order={data} /> : null;
  },
};

// An earlier answer with a work order part.
const messages: ChatMessage[] = [
  {
    id: 'a0',
    role: 'assistant',
    author: assistant,
    parts: [
      { type: 'text', text: 'Yesterday I opened this one for the crane:' },
      {
        type: 'data-work-order',
        data: {
          number: 'WO-2040',
          title: 'Crane inspection',
          status: 'Done',
          assignee: 'Sam Weber',
          due: 'Nov 17',
        },
      },
    ],
  },
];

// The backend sends a `data-*` chunk; the chat adds it to the answer as a part of that type.
const maintenanceAdapter: ChatAdapter = {
  async sendMessage({ message }) {
    const messageId = `wo-${message.id}`;
    const order: WorkOrder = {
      number: 'WO-2041',
      title: 'Replace pump 3 bearing',
      status: 'Open',
      assignee: 'Dana Ortiz',
      due: 'Nov 21',
    };
    const chunks: ChatMessageChunk[] = [
      { type: 'start', messageId, author: assistant },
      { type: 'text-start', id: 'a' },
      { type: 'text-delta', id: 'a', delta: 'I created a work order:' },
      { type: 'text-end', id: 'a' },
      { type: 'data-work-order', data: order },
      { type: 'text-start', id: 'b' },
      { type: 'text-delta', id: 'b', delta: 'You will get a reminder the day before it is due.' },
      { type: 'text-end', id: 'b' },
      { type: 'finish', messageId },
    ];
    return new ReadableStream<ChatMessageChunk>({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        controller.close();
      },
    });
  },
};

export default function CustomParts() {
  return (
    <ChatBox
      adapter={maintenanceAdapter}
      members={[you, assistant]}
      currentUser={you}
      initialMessages={messages}
      partRenderers={partRenderers}
      suggestions={['Open a work order for the pump 3 bearing']}
      suggestionsAutoSubmit
      features={{ conversationHeader: false }}
      sx={{ height: 460, width: '100%' }}
    />
  );
}
