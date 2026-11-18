'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
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
  },
}));

// ---- Toolbar --------------------------------------------------------------------------------

export interface RangePickerToolbarProps {
  value: PickerRangeValue;
  rangePosition: RangePosition;
  onRangePositionChange: (position: RangePosition) => void;
  format: string;
  title: string;
  titleId: string;
  labels: { start: string; end: string };
}

/** Title plus one button per endpoint; the pressed button is the endpoint being edited. */
export function RangePickerToolbar(props: RangePickerToolbarProps) {
  const { value, rangePosition, onRangePositionChange, format, title, titleId, labels } = props;
  const adapter = usePickerAdapter();
  const renderEndpoint = (position: RangePosition) => {
    const formatted = formatEndpoint(adapter, value[positionIndex(position)], format);
    return (
      <Button
        variant="text"
        size="small"
        aria-pressed={rangePosition === position}
        aria-label={formatted ? `${labels[position]}: ${formatted}` : labels[position]}
        onClick={() => onRangePositionChange(position)}
        sx={{ fontWeight: rangePosition === position ? 700 : 400, textTransform: 'none' }}
      >
        {formatted || labels[position]}
      </Button>
    );
  };
  return (
    <Box className={rangePickerLayoutClasses.toolbar} sx={{ px: 3, pt: 2, pb: 1 }}>
      <Typography variant="overline" component="h2" id={titleId} sx={{ display: 'block' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {renderEndpoint('start')}
        <Typography component="span" aria-hidden>
          –
        </Typography>
        {renderEndpoint('end')}
      </Box>
    </Box>
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
