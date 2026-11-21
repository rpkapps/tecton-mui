import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Typography from '@tecton-mui/ui/Typography';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
  ActionBarTool,
  ActionBarToolMenu,
  type ActionBarValue,
} from '@tecton-mui/ui/ActionBar';

export default function BasicActionBar() {
  const [tool, setTool] = React.useState<ActionBarValue>('select');
  const [zoom, setZoom] = React.useState('fit');
  const [lastAction, setLastAction] = React.useState('none');
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 460,
        borderRadius: 1,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <ActionBar
        aria-label="Section tools"
        value={tool}
        onChange={(_event, value) => setTool(value)}
        sx={{ position: 'absolute', top: 8, left: 8 }}
      >
        <ActionBarGroup>
          <ActionBarSelect
            aria-label="Zoom level"
            value={zoom}
            onChange={(event) => setZoom(event.target.value)}
          >
            <MenuItem value="fit">Fit</MenuItem>
            <MenuItem value="50">50%</MenuItem>
            <MenuItem value="100">100%</MenuItem>
            <MenuItem value="200">200%</MenuItem>
          </ActionBarSelect>
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
          <ActionBarToolMenu label="Zoom tools">
            <ActionBarTool value="zoom-in" label="Zoom in" icon={<Icon name="zoom-in" />} />
            <ActionBarTool value="zoom-out" label="Zoom out" icon={<Icon name="zoom-out" />} />
          </ActionBarToolMenu>
          <ActionBarButton value="rotate" label="Rotate" icon={<Icon name="rotate" />} />
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarToolMenu label="Interpretation tools">
            <ActionBarTool value="horizon" label="Pick horizon" icon={<Icon name="horizon" />} />
            <ActionBarTool value="fault" label="Pick fault" icon={<Icon name="fault" />} />
            <ActionBarTool value="well-pick" label="Well pick" icon={<Icon name="well-pick" />} />
          </ActionBarToolMenu>
          <ActionBarButton value="annotate" label="Annotate" icon={<Icon name="annotate" />} />
          <ActionBarButton value="measure" label="Measure" icon={<Icon name="ruler" />} />
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton
            label="Undo"
            icon={<Icon name="undo" />}
            onClick={() => setLastAction('Undo')}
          />
          <ActionBarButton
            label="Redo"
            icon={<Icon name="redo" />}
            onClick={() => setLastAction('Redo')}
          />
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton
            label="More actions"
            icon={<Icon name="more-vert" />}
            onClick={() => setLastAction('More actions')}
          />
        </ActionBarGroup>
      </ActionBar>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ position: 'absolute', top: 16, left: 120 }}
      >
        Tool: {tool} · Zoom: {zoom} · Last action: {lastAction}
      </Typography>
    </Box>
  );
}
