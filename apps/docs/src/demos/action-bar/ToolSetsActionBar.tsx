import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarTool,
  ActionBarToolMenu,
  type ActionBarValue,
} from '@tecton-mui/ui/ActionBar';

const labels: Record<string, string> = {
  select: 'Select',
  line: 'Line',
  polyline: 'Polyline',
  freehand: 'Freehand',
  ruler: 'Distance',
  area: 'Area',
};

export default function ToolSetsActionBar() {
  const [tool, setTool] = React.useState<ActionBarValue | null>('select');
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
      <ActionBar
        aria-label="Drawing tools"
        value={tool}
        onChange={(_event, value) => setTool(value)}
      >
        <ActionBarGroup>
          <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
          <ActionBarToolMenu label="Draw">
            <ActionBarTool value="line" label="Line" icon={<Icon name="line-weight" />} />
            <ActionBarTool value="polyline" label="Polyline" icon={<Icon name="trend" />} />
            <ActionBarTool value="freehand" label="Freehand" icon={<Icon name="edit-square" />} />
          </ActionBarToolMenu>
          <ActionBarToolMenu label="Measure" defaultValue="area">
            <ActionBarTool value="ruler" label="Distance" icon={<Icon name="ruler" />} />
            <ActionBarTool value="area" label="Area" icon={<Icon name="slice" />} />
          </ActionBarToolMenu>
        </ActionBarGroup>
      </ActionBar>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="body2">
          Current tool: {tool === null ? 'none' : labels[String(tool)]}
        </Typography>
        <Button variant="outlined" size="small" onClick={() => setTool('polyline')}>
          Use Polyline
        </Button>
        <Button variant="text" size="small" onClick={() => setTool(null)}>
          Clear tool
        </Button>
      </Stack>
    </Stack>
  );
}
