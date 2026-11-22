/*
 * Playground: a live component with a property inspector and the JSX for the current values.
 * Pages use it through a demo module rendered with `<Demo name="…" playground />`, so the
 * playground brings its own toolbar (reset, show code, copy).
 *
 *   <Playground
 *     title="ChatBox"
 *     controls={[{ name: 'variant', kind: 'enum', options: ['default', 'compact'], defaultValue: 'default' }]}
 *     render={(values) => <ChatBox variant={values.variant as ChatVariant} … />}
 *     code={(values) => jsxElement('ChatBox', { variant: values.variant }, …)}
 *   />
 */
import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import MenuItem from '@tecton-mui/ui/MenuItem';
import Select from '@tecton-mui/ui/Select';
import Slider from '@tecton-mui/ui/Slider';
import Switch from '@tecton-mui/ui/Switch';
import TextField from '@tecton-mui/ui/TextField';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import Tooltip from '@tecton-mui/ui/Tooltip';
import Typography from '@tecton-mui/ui/Typography';
import { CodeBlock, CopyButton } from './CodeBlock';

interface ControlBase {
  /** Key in the values object; shown as the prop name. */
  name: string;
  /** Label when it differs from `name`. */
  label?: string;
  /** Section heading the control is listed under. */
  group?: string;
  /** One short line of help under the name. */
  help?: string;
}
export type PlaygroundControl =
  | (ControlBase & { kind: 'enum'; options: readonly string[]; defaultValue: string })
  | (ControlBase & { kind: 'boolean'; defaultValue: boolean })
  | (ControlBase & {
      kind: 'number';
      defaultValue: number;
      min: number;
      max: number;
      step?: number;
    })
  | (ControlBase & { kind: 'text'; defaultValue: string; multiline?: boolean });

export type PlaygroundValues = Record<string, string | number | boolean>;

export interface PlaygroundProps {
  title: string;
  description?: React.ReactNode;
  controls: readonly PlaygroundControl[];
  /** Renders the component for the current values. Remounted when the playground is reset. */
  render: (values: PlaygroundValues) => React.ReactNode;
  /** The JSX for the current values, shown and copied. */
  code: (values: PlaygroundValues) => string;
  /** Minimum height of the preview stage. */
  minHeight?: number;
  /**
   * Where the inspector goes: beside the preview when the playground is wide enough (`auto`), or
   * always below it (`below`), for components that need the full width.
   */
  panel?: 'auto' | 'below';
}

// Width of the playground from which the inspector sits beside the preview.
const SIDE_BY_SIDE = '@container (min-width: 720px)';

const propName = {
  fontFamily: 'var(--tecton-font-family-mono), monospace',
  fontSize: '0.8125rem',
  lineHeight: '1.25rem',
  fontWeight: 500,
  color: 'text.primary',
  overflowWrap: 'anywhere',
} as const;

const defaultsOf = (controls: readonly PlaygroundControl[]) =>
  Object.fromEntries(controls.map((c) => [c.name, c.defaultValue])) as PlaygroundValues;

/** Toggle buttons when every option fits on one short row; a select otherwise. */
const fitsToggle = (options: readonly string[]) =>
  options.length <= 3 && options.join('').length <= 16;

function ControlRow({
  control,
  value,
  onChange,
}: {
  control: PlaygroundControl;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const helpId = control.help ? `${id}-help` : undefined;
  const label = control.label ?? control.name;
  // Text fields use the full row width under the name; the other controls sit on its right.
  const stacked = control.kind === 'text' || control.kind === 'number';

  let field: React.ReactNode;
  if (control.kind === 'boolean') {
    field = (
      <Switch
        size="small"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        slotProps={{ input: { 'aria-labelledby': labelId, 'aria-describedby': helpId } }}
      />
    );
  } else if (control.kind === 'enum' && fitsToggle(control.options)) {
    field = (
      <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        onChange={(_, next: string | null) => next != null && onChange(next)}
        aria-labelledby={labelId}
        aria-describedby={helpId}
      >
        {control.options.map((option) => (
          <ToggleButton key={option} value={option} sx={{ textTransform: 'none', px: 1.25 }}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  } else if (control.kind === 'enum') {
    field = (
      <Select
        size="small"
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ 'aria-labelledby': labelId, 'aria-describedby': helpId }}
        sx={{ minWidth: 136 }}
      >
        {control.options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    );
  } else if (control.kind === 'number') {
    field = (
      <Slider
        size="small"
        value={Number(value)}
        min={control.min}
        max={control.max}
        step={control.step ?? 1}
        marks
        valueLabelDisplay="auto"
        onChange={(_, next) => onChange(next as number)}
        slotProps={{ input: { 'aria-labelledby': labelId, 'aria-describedby': helpId } }}
        sx={{ mx: 1, width: 'calc(100% - 16px)' }}
      />
    );
  } else {
    field = (
      <TextField
        size="small"
        fullWidth
        multiline={control.multiline}
        minRows={control.multiline ? 3 : undefined}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{ htmlInput: { 'aria-labelledby': labelId, 'aria-describedby': helpId } }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto',
        alignItems: 'center',
        columnGap: 2,
        rowGap: 0.75,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'var(--tecton-color-divider-subtle)',
        breakInside: 'avoid',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography id={labelId} component="span" sx={{ ...propName, display: 'block' }}>
          {control.kind === 'number' ? `${label}: ${String(value)}` : label}
        </Typography>
        {control.help ? (
          <Typography
            id={helpId}
            variant="caption"
            color="text.secondary"
            component="span"
            sx={{ display: 'block', lineHeight: 1.4 }}
          >
            {control.help}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ minWidth: 0, justifySelf: stacked ? 'stretch' : 'end' }}>{field}</Box>
    </Box>
  );
}

export function Playground({
  title,
  description,
  controls,
  render,
  code,
  minHeight = 320,
  panel = 'auto',
}: PlaygroundProps) {
  const side = panel === 'auto';
  const sideOnly = (styles: object) => (side ? { [SIDE_BY_SIDE]: styles } : null);
  const [values, setValues] = React.useState(() => defaultsOf(controls));
  const [instance, setInstance] = React.useState(0);
  const [showCode, setShowCode] = React.useState(false);
  const codeId = React.useId();
  const source = code(values);
  const groups = [...new Set(controls.map((c) => c.group ?? ''))];
  const reset = () => {
    setValues(defaultsOf(controls));
    setInstance((i) => i + 1);
  };
  return (
    <Box
      className="docs-demo"
      component="section"
      aria-label={`${title} playground`}
      sx={{ my: 3, containerType: 'inline-size' }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" component="p" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          ...sideOnly({ gridTemplateColumns: 'minmax(0, 1fr) 280px' }),
        }}
      >
        <Box
          className="docs-demo-preview"
          data-demo-preview=""
          sx={{ minHeight, alignItems: 'stretch', justifyContent: 'center', p: '24px !important' }}
        >
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <React.Fragment key={instance}>{render(values)}</React.Fragment>
          </Box>
        </Box>
        <Box
          component="aside"
          aria-label={`${title} props`}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            ...sideOnly({ borderTop: 0, borderLeft: 1, borderColor: 'divider' }),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pl: 2,
              pr: 1,
              py: 0.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" component="p">
              Props
            </Typography>
            <Tooltip title="Reset the props and the example">
              <IconButton size="small" aria-label="Reset the props and the example" onClick={reset}>
                <Icon name="retry" size="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            className="docs-scroll"
            sx={{
              px: 2,
              pb: 1.5,
              // Below the preview, the rows flow into balanced columns; beside it, one scrolling
              // column as tall as the preview.
              columnWidth: '300px',
              columnGap: 4,
              // `columns: auto` turns multi-column off: a height-limited single column would
              // otherwise overflow sideways into extra columns.
              ...sideOnly({
                flex: 1,
                overflowY: 'auto',
                columns: 'auto',
                maxHeight: minHeight + 48,
              }),
            }}
          >
            {groups.map((group, index) => (
              <Box
                key={group}
                role={group ? 'group' : undefined}
                aria-labelledby={group ? `${codeId}-group-${index}` : undefined}
                sx={{ minWidth: 0, '& + &': { mt: 1.5 } }}
              >
                {group ? (
                  <Typography
                    id={`${codeId}-group-${index}`}
                    variant="caption"
                    color="text.secondary"
                    component="p"
                    sx={{
                      pt: 1.5,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      breakAfter: 'avoid',
                    }}
                  >
                    {group}
                  </Typography>
                ) : null}
                {controls
                  .filter((c) => (c.group ?? '') === group)
                  .map((control) => (
                    <ControlRow
                      key={control.name}
                      control={control}
                      value={values[control.name]!}
                      onChange={(value) =>
                        setValues((current) => ({ ...current, [control.name]: value }))
                      }
                    />
                  ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <div className="docs-demo-toolbar">
        <Typography variant="caption" color="text.secondary" className="docs-demo-title">
          The code follows your changes.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowCode((open) => !open)}
            aria-expanded={showCode}
            aria-controls={codeId}
            startIcon={<Icon name="code" size="small" />}
          >
            {showCode ? 'Hide code' : 'Show code'}
          </Button>
          <CopyButton text={source} label="Copy the code" />
        </Box>
      </div>
      <div id={codeId} hidden={!showCode} className="docs-demo-code" data-pagefind-ignore="all">
        {showCode && <CodeBlock code={source} language="tsx" bare />}
      </div>
    </Box>
  );
}

/** A JSX prop value as source: strings quoted, `true` as a bare prop, the rest in braces. */
function propSource(name: string, value: unknown): string {
  if (value === true) return name;
  if (typeof value === 'string') return `${name}=${JSON.stringify(value)}`;
  if (typeof value === 'object' && value && 'raw' in value) return `${name}={${String(value.raw)}}`;
  return `${name}={${JSON.stringify(value)}}`;
}

/** Wraps source text that should be printed as-is (`raw('adapter')`). */
export const raw = (source: string) => ({ raw: source });

/**
 * JSX for an element. `undefined` props are left out, so callers drop props that keep their
 * default value.
 */
export function jsxElement(
  component: string,
  props: Record<string, unknown>,
  children?: string,
): string {
  const entries = Object.entries(props).filter(([, value]) => value !== undefined);
  const attrs = entries.map(([name, value]) => propSource(name, value));
  const oneLine = `<${component}${attrs.map((a) => ` ${a}`).join('')}`;
  const open =
    oneLine.length <= 80 && !attrs.some((a) => a.includes('\n'))
      ? oneLine
      : `<${component}\n${attrs.map((a) => `  ${a.replace(/\n/g, '\n  ')}`).join('\n')}\n`;
  if (children == null) return `${open}${open.endsWith('\n') ? '' : ' '}/>`;
  return `${open}>\n  ${children.replace(/\n/g, '\n  ')}\n</${component}>`;
}

/** An object literal for a prop, without its default entries: `{ dateDivider: true }`. */
export function objectSource(entries: Record<string, unknown>): string | undefined {
  const kept = Object.entries(entries).filter(([, value]) => value !== undefined);
  if (kept.length === 0) return undefined;
  return `{ ${kept.map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(', ')} }`;
}
