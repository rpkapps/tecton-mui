import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Icon, { type IconName } from '@tecton-mui/ui/Icon';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Typography from '@tecton-mui/ui/Typography';
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarSelect,
  ActionBarTool,
  ActionBarToolMenu,
  type ActionBarElevation,
  type ActionBarValue,
} from '@tecton-mui/ui/ActionBar';
import {
  Playground,
  jsxElement,
  raw,
  type PlaygroundControl,
  type PlaygroundValues,
} from '../../components/Playground';

const controls: PlaygroundControl[] = [
  {
    name: 'elevation',
    kind: 'enum',
    group: 'Appearance',
    options: ['0', '1', '2'],
    defaultValue: '1',
    help: 'Group background: 0 page, 1 Paper (default), 2 raised (white in light mode, black in dark mode).',
  },
  {
    name: 'alignment',
    kind: 'enum',
    group: 'Appearance',
    options: ['left', 'right'],
    defaultValue: 'left',
    help: 'Edge the bar sits on; tooltips and menus open on the other side.',
  },
  {
    name: 'zoomSelect',
    label: 'zoom select',
    kind: 'boolean',
    group: 'Content',
    defaultValue: true,
    help: 'An ActionBarSelect in its own group.',
  },
  {
    name: 'selectVariant',
    label: 'select variant',
    kind: 'enum',
    group: 'Content',
    options: ['standard', 'filled'],
    defaultValue: 'standard',
  },
  {
    name: 'toolSets',
    label: 'tool sets',
    kind: 'boolean',
    group: 'Content',
    defaultValue: true,
    help: 'ActionBarToolMenus: hold, right-click or press → for more tools.',
  },
  {
    name: 'actions',
    kind: 'boolean',
    group: 'Content',
    defaultValue: true,
    help: 'Undo and Redo: plain buttons without a value.',
  },
  {
    name: 'redoDisabled',
    label: 'Redo disabled',
    kind: 'boolean',
    group: 'Content',
    defaultValue: true,
    help: 'Disabled controls are skipped by the arrow keys.',
  },
];

interface ToolSpec {
  value: string;
  label: string;
  icon: IconName;
}

const ZOOM_OPTIONS = [
  ['fit', 'Fit'],
  ['50', '50%'],
  ['100', '100%'],
  ['200', '200%'],
] as const;
const DRAW_TOOLS: ToolSpec[] = [
  { value: 'line', label: 'Line', icon: 'line-weight' },
  { value: 'polyline', label: 'Polyline', icon: 'trend' },
  { value: 'freehand', label: 'Freehand', icon: 'edit-square' },
];
const MEASURE_TOOLS: ToolSpec[] = [
  { value: 'ruler', label: 'Distance', icon: 'ruler' },
  { value: 'area', label: 'Area', icon: 'slice' },
];
const LABELS: Record<string, string> = Object.fromEntries(
  [
    { value: 'select', label: 'Select' },
    { value: 'pan', label: 'Pan' },
    ...DRAW_TOOLS,
    ...MEASURE_TOOLS,
  ].map((tool) => [tool.value, tool.label]),
);

const elevationOf = (values: PlaygroundValues) => Number(values.elevation) as ActionBarElevation;

function PlaygroundBar({ values }: { values: PlaygroundValues }) {
  const [tool, setTool] = React.useState<ActionBarValue>('select');
  const [zoom, setZoom] = React.useState('fit');
  const [lastAction, setLastAction] = React.useState('none');
  const right = values.alignment === 'right';
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 400,
        borderRadius: 1,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <ActionBar
        aria-label="Canvas tools"
        alignment={right ? 'right' : 'left'}
        elevation={elevationOf(values)}
        value={tool}
        onChange={(_event, value) => setTool(value)}
        sx={{ position: 'absolute', top: 8, ...(right ? { right: 8 } : { left: 8 }) }}
      >
        {values.zoomSelect ? (
          <ActionBarGroup>
            <ActionBarSelect
              aria-label="Zoom level"
              variant={values.selectVariant as 'standard' | 'filled'}
              value={zoom}
              onChange={(event) => setZoom(String(event.target.value))}
            >
              {ZOOM_OPTIONS.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </ActionBarSelect>
          </ActionBarGroup>
        ) : null}
        <ActionBarGroup>
          <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
          <ActionBarButton value="pan" label="Pan" icon={<Icon name="pan-tool" />} />
          {values.toolSets ? (
            <>
              <ActionBarToolMenu label="Draw">
                {DRAW_TOOLS.map((t) => (
                  <ActionBarTool
                    key={t.value}
                    value={t.value}
                    label={t.label}
                    icon={<Icon name={t.icon} />}
                  />
                ))}
              </ActionBarToolMenu>
              <ActionBarToolMenu label="Measure">
                {MEASURE_TOOLS.map((t) => (
                  <ActionBarTool
                    key={t.value}
                    value={t.value}
                    label={t.label}
                    icon={<Icon name={t.icon} />}
                  />
                ))}
              </ActionBarToolMenu>
            </>
          ) : null}
        </ActionBarGroup>
        {values.actions ? (
          <ActionBarGroup>
            <ActionBarButton
              label="Undo"
              icon={<Icon name="undo" />}
              onClick={() => setLastAction('Undo')}
            />
            <ActionBarButton
              label="Redo"
              icon={<Icon name="redo" />}
              disabled={Boolean(values.redoDisabled)}
              onClick={() => setLastAction('Redo')}
            />
          </ActionBarGroup>
        ) : null}
      </ActionBar>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          right: 16,
          textAlign: right ? 'left' : 'right',
        }}
      >
        Tool: {LABELS[String(tool)] ?? String(tool)} · {values.zoomSelect ? `Zoom: ${zoom} · ` : ''}
        Last action: {lastAction}
      </Typography>
    </Box>
  );
}

const icon = (name: string) => raw(`<Icon name=${JSON.stringify(name)} />`);

function toolMenuSource(label: string, tools: ToolSpec[]) {
  return jsxElement(
    'ActionBarToolMenu',
    { label },
    tools
      .map((t) =>
        jsxElement('ActionBarTool', { value: t.value, label: t.label, icon: icon(t.icon) }),
      )
      .join('\n'),
  );
}

function code(values: PlaygroundValues) {
  const groups: string[] = [];
  if (values.zoomSelect) {
    groups.push(
      jsxElement(
        'ActionBarGroup',
        {},
        jsxElement(
          'ActionBarSelect',
          {
            'aria-label': 'Zoom level',
            variant: values.selectVariant === 'standard' ? undefined : values.selectVariant,
            value: raw('zoom'),
            onChange: raw('(event) => setZoom(event.target.value)'),
          },
          ZOOM_OPTIONS.map(
            ([value, label]) => `<MenuItem value="${value}">${label}</MenuItem>`,
          ).join('\n'),
        ),
      ),
    );
  }
  const tools = [
    jsxElement('ActionBarButton', {
      value: 'select',
      label: 'Select',
      icon: icon('select-cursor'),
    }),
    jsxElement('ActionBarButton', { value: 'pan', label: 'Pan', icon: icon('pan-tool') }),
  ];
  if (values.toolSets) {
    tools.push(toolMenuSource('Draw', DRAW_TOOLS), toolMenuSource('Measure', MEASURE_TOOLS));
  }
  groups.push(jsxElement('ActionBarGroup', {}, tools.join('\n')));
  if (values.actions) {
    groups.push(
      jsxElement(
        'ActionBarGroup',
        {},
        [
          jsxElement('ActionBarButton', {
            label: 'Undo',
            icon: icon('undo'),
            onClick: raw('undo'),
          }),
          jsxElement('ActionBarButton', {
            label: 'Redo',
            icon: icon('redo'),
            disabled: values.redoDisabled ? true : undefined,
            onClick: raw('redo'),
          }),
        ].join('\n'),
      ),
    );
  }
  return jsxElement(
    'ActionBar',
    {
      'aria-label': 'Canvas tools',
      alignment: values.alignment === 'left' ? undefined : values.alignment,
      elevation: values.elevation === '1' ? undefined : elevationOf(values),
      value: raw('tool'),
      onChange: raw('(event, value) => setTool(value)'),
    },
    groups.join('\n'),
  );
}

export default function ActionBarPlayground() {
  return (
    <Playground
      title="ActionBar"
      description="Change the props and the content of a tool palette. Pick tools, open the tool sets and switch the page between light and dark mode."
      controls={controls}
      render={(values) => <PlaygroundBar values={values} />}
      code={code}
      minHeight={400}
    />
  );
}
