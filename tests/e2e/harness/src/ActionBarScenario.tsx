import * as React from 'react';
import { Box, MenuItem, Typography } from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
  ActionBarTool,
  ActionBarToolMenu,
  type ActionBarValue,
} from '@tecton-mui/ui/ActionBar';

export function ActionBarScenario() {
  const [tool, setTool] = React.useState<ActionBarValue>('select');
  const [zoom, setZoom] = React.useState('fit');
  const [last, setLast] = React.useState('none');
  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: 560 }}>
      <ActionBar
        aria-label="Canvas tools"
        value={tool}
        onChange={(_event, value) => setTool(value)}
      >
        <ActionBarGroup>
          <ActionBarSelect
            aria-label="Zoom level"
            value={zoom}
            onChange={(event) => setZoom(event.target.value)}
          >
            <MenuItem value="fit">Fit</MenuItem>
            <MenuItem value="100">100%</MenuItem>
          </ActionBarSelect>
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
          <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
          <ActionBarToolMenu label="Measure">
            <ActionBarTool value="ruler" label="Ruler" icon={<Icon name="ruler" />} />
            <ActionBarTool value="area" label="Area" icon={<Icon name="slice" />} />
          </ActionBarToolMenu>
        </ActionBarGroup>
        <ActionBarGroup>
          <ActionBarButton
            label="Undo"
            icon={<Icon name="undo" />}
            onClick={() => setLast('Undo')}
          />
          <ActionBarButton label="Redo" icon={<Icon name="redo" />} disabled />
        </ActionBarGroup>
      </ActionBar>
      <Typography data-testid="action-bar-state" sx={{ mt: 2 }}>
        tool={String(tool)} zoom={zoom} last={last}
      </Typography>
      <ActionBar
        aria-label="Map tools"
        alignment="right"
        defaultValue="pin"
        sx={{ position: 'absolute', top: 24, right: 24 }}
      >
        <ActionBarGroup>
          <ActionBarToolMenu label="Markers">
            <ActionBarTool value="pin" label="Pin" icon={<Icon name="pin" />} />
            <ActionBarTool value="target" label="Target" icon={<Icon name="target" />} />
          </ActionBarToolMenu>
        </ActionBarGroup>
      </ActionBar>
      {/* Figma's double dropdown, with its "Value" placeholder text: two selects in one row. */}
      <ActionBar aria-label="View tools" sx={{ position: 'absolute', top: 24, left: 240 }}>
        <ActionBarGroup orientation="horizontal" aria-label="View">
          <ActionBarSelect aria-label="Layer" defaultValue="value">
            <MenuItem value="value">Value</MenuItem>
            <MenuItem value="new">New Value</MenuItem>
          </ActionBarSelect>
          <ActionBarSelect aria-label="Style" variant="filled" defaultValue="value">
            <MenuItem value="value">Value</MenuItem>
            <MenuItem value="new">New Value</MenuItem>
          </ActionBarSelect>
        </ActionBarGroup>
      </ActionBar>
    </Box>
  );
}
