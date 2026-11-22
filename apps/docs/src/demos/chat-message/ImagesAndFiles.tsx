import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Chip from '@tecton-mui/ui/Chip';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';
import ChatBox from '@tecton-mui/ui/ChatBox';
import {
  createEchoAdapter,
  type ChatFileMessagePart,
  type ChatMessage,
  type ChatPartRendererMap,
  type ChatUser,
} from '@tecton-mui/ui/ChatHeadless';
// File URLs must be http(s), a path on this site or a same-origin blob: URL; data: URLs are
// blocked. Here the image is a file of the docs site.
import chartUrl from './alpha-7-pressure.svg?no-inline';

const you: ChatUser = { id: 'you', displayName: 'Dana Ortiz', role: 'user' };
const assistant: ChatUser = { id: 'assistant', displayName: 'Field assistant', role: 'assistant' };

const messages: ChatMessage[] = [
  {
    id: 'q',
    role: 'user',
    author: you,
    parts: [{ type: 'text', text: 'Show me the pressure trend for Alpha-7.' }],
  },
  {
    id: 'a',
    role: 'assistant',
    author: assistant,
    parts: [
      { type: 'text', text: 'Here is the last 24 hours. The raw data is attached.' },
      { type: 'file', mediaType: 'image/svg+xml', url: chartUrl, filename: 'alpha-7-pressure.svg' },
      {
        type: 'file',
        mediaType: 'text/csv',
        url: '#alpha-7.csv',
        filename: 'alpha-7-pressure.csv',
      },
    ],
  },
];

// Images as pictures, other files as Tecton chips that open the file.
function FileView({ part }: { part: ChatFileMessagePart }) {
  if (part.mediaType.startsWith('image/')) {
    return (
      <Box
        component="a"
        href={part.url}
        target="_blank"
        rel="noreferrer noopener"
        sx={{ display: 'block', my: 1 }}
      >
        <Box
          component="img"
          src={part.url}
          alt={part.filename ?? 'Image'}
          sx={{ display: 'block', maxWidth: '100%', width: 320, borderRadius: 1 }}
        />
      </Box>
    );
  }
  return (
    <Chip
      component="a"
      href={part.url}
      clickable
      size="small"
      variant="outlined"
      icon={<Icon name="attach-file" size="small" />}
      label={part.filename ?? part.url}
      sx={{ my: 0.5 }}
    />
  );
}
// Module-level constant: renderers keep a stable identity.
const partRenderers: ChatPartRendererMap = {
  file: ({ part }) => <FileView part={part} />,
};

export default function ImagesAndFiles() {
  const [adapter] = React.useState(() => createEchoAdapter());
  const [pictures, setPictures] = React.useState(true);
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <FormControlLabel
        control={
          <Switch checked={pictures} onChange={(event) => setPictures(event.target.checked)} />
        }
        label="Show images as pictures (partRenderers.file)"
      />
      <ChatBox
        adapter={adapter}
        members={[you, assistant]}
        currentUser={you}
        initialMessages={messages}
        partRenderers={pictures ? partRenderers : undefined}
        features={{ conversationHeader: false }}
        sx={{ height: 460 }}
      />
    </Stack>
  );
}
