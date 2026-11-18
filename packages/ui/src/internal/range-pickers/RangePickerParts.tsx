'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import type {
  PickerRangeValue,
  PickersRangeActionBarAction,
  PickersShortcutsItem,
  RangePosition,
} from './models.js';
import { formatEndpoint, positionIndex } from './utils.js';

export const rangePickerLayoutClasses = {
  root: 'TectonRangePickerLayout-root',
  toolbar: 'TectonRangePickerLayout-toolbar',
  contentWrapper: 'TectonRangePickerLayout-contentWrapper',
  shortcuts: 'TectonRangePickerLayout-shortcuts',
  actionBar: 'TectonRangePickerLayout-actionBar',
} as const;

export const RangePickerLayoutRoot = styled('div', {
  name: 'TectonRangePickerLayout',
  slot: 'Root',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  [`& .${rangePickerLayoutClasses.contentWrapper}`]: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    // Center the view in a wide layout, like the Community picker views (`margin: 0 auto`).
    '& > :last-child': { marginLeft: 'auto', marginRight: 'auto' },
  },
}));

// Same geometry as the Community picker toolbar (MuiPickersToolbar): 16px 24px padding, an
// overline title in `text.secondary` above the value row.
const ToolbarRoot = styled('div', { name: 'TectonRangePickerToolbar', slot: 'Root' })(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 3),
  }),
);

const ToolbarContent = styled('div', { name: 'TectonRangePickerToolbar', slot: 'Content' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  width: '100%',
  flex: 1,
});

// Endpoint buttons look like the Community toolbar values: plain text in `text.secondary`, the
// endpoint being edited in `text.primary`.
const ToolbarButton = styled(Button, { name: 'TectonRangePickerToolbar', slot: 'Button' })(
  ({ theme }) => ({
    // Doubled class: wins over the theme's Button size rules (Tecton sets a fixed button height).
    '&&': { padding: 0, minWidth: 16, minHeight: 0, height: 'auto' },
    textTransform: 'none',
    color: (theme.vars || theme).palette.text.secondary,
    '&[aria-pressed="true"]': { color: (theme.vars || theme).palette.text.primary },
  }),
);

// ---- Toolbar --------------------------------------------------------------------------------

export interface RangePickerToolbarProps {
  value: PickerRangeValue;
  rangePosition: RangePosition;
  onRangePositionChange: (position: RangePosition) => void;
  format: string;
  title: string;
  titleId: string;
  labels: { start: string; end: string };
  /** Typography variant of the endpoint values: `h4` (date ranges, as the date toolbar) or smaller. */
  valueVariant?: 'h4' | 'h5' | 'h6';
}

/** Title plus one button per endpoint; the pressed button is the endpoint being edited. */
export function RangePickerToolbar(props: RangePickerToolbarProps) {
  const {
    value,
    rangePosition,
    onRangePositionChange,
    format,
    title,
    titleId,
    labels,
    valueVariant = 'h4',
  } = props;
  const adapter = usePickerAdapter();
  const renderEndpoint = (position: RangePosition) => {
    const formatted = formatEndpoint(adapter, value[positionIndex(position)], format);
    return (
      <ToolbarButton
        variant="text"
        aria-pressed={rangePosition === position}
        aria-label={formatted ? `${labels[position]}: ${formatted}` : labels[position]}
        onClick={() => onRangePositionChange(position)}
      >
        <Typography variant={valueVariant} component="span" color="inherit">
          {formatted || labels[position]}
        </Typography>
      </ToolbarButton>
    );
  };
  return (
    <ToolbarRoot className={rangePickerLayoutClasses.toolbar}>
      <Typography variant="overline" component="h2" id={titleId} sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <ToolbarContent>
        {renderEndpoint('start')}
        <Typography variant={valueVariant} component="span" aria-hidden sx={{ mx: 1 }}>
          –
        </Typography>
        {renderEndpoint('end')}
      </ToolbarContent>
    </ToolbarRoot>
  );
}

// ---- Action bar -----------------------------------------------------------------------------

export interface RangePickerActionBarProps {
  actions: readonly PickersRangeActionBarAction[];
  onAction: (action: PickersRangeActionBarAction) => void;
  labels: Record<PickersRangeActionBarAction, string>;
}

export function RangePickerActionBar(props: RangePickerActionBarProps) {
  const { actions, onAction, labels } = props;
  if (actions.length === 0) {
    return null;
  }
  return (
    <DialogActions className={rangePickerLayoutClasses.actionBar}>
      {actions.map((action) => (
        <Button key={action} onClick={() => onAction(action)}>
          {labels[action]}
        </Button>
      ))}
    </DialogActions>
  );
}

// ---- Shortcuts ------------------------------------------------------------------------------

export interface RangePickerShortcutsProps {
  items: readonly PickersShortcutsItem[];
  isValid: (value: PickerRangeValue) => boolean;
  onSelect: (value: PickerRangeValue, item: PickersShortcutsItem) => void;
  disabled?: boolean;
}

/** Vertical list of chips; a chip is disabled when its range fails validation. */
export function RangePickerShortcuts(props: RangePickerShortcutsProps) {
  const { items, isValid, onSelect, disabled } = props;
  if (items.length === 0) {
    return null;
  }
  return (
    <List
      dense
      className={rangePickerLayoutClasses.shortcuts}
      sx={{ px: 1, py: 1.5, maxHeight: 336, overflow: 'auto', flexShrink: 0 }}
    >
      {items.map((item) => {
        const itemValue = item.getValue({ isValid });
        return (
          <ListItem key={item.id ?? item.label} disablePadding sx={{ py: 0.5 }}>
            <Chip
              label={item.label}
              clickable
              disabled={disabled || !isValid(itemValue)}
              onClick={() => onSelect(itemValue, item)}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
