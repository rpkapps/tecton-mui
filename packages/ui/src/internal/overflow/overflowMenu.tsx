'use client';
// The menu that the heading's overflow (⋮) button opens, as the Tecton drop-in heading draws it:
// the folded actions as menu items, in the order of the row. Icon buttons and buttons are items
// (an icon and a label), each select is a group of radio items under its label, a toggle button
// group the same under its name, and a search an item that opens it. Groups are separated by
// dividers, as are the actions that a divider separates in the row.
//
// The items come from the actions themselves (their props: `aria-label`, `startIcon`, `onClick`,
// a select's `MenuItem` children and `onChange`, ...), so the page composes the row with MUI
// components and the menu follows. An element the menu cannot read is shown as it is.
import * as React from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import isMuiElement from '@mui/utils/isMuiElement';
import { cssVar } from '../../styles/tecton/index.js';
import type { ActionKind } from './collapse.js';

type Props = Record<string, unknown>;
type AnyElement = React.ReactElement<Props>;

/** A component whose elements the menu shows as a search item (`HeadingSearch`). */
export interface OverflowSearchMarker {
  overflowPriority?: 'late';
}

const isElement = (node: React.ReactNode): node is AnyElement => React.isValidElement(node);

/** Marks the icon button that `iconOnly` makes of the primary action. */
const PRIMARY = 'data-overflow-primary';

/** What an action is, from its element type (see `foldOrder` in collapse.ts). */
export function actionKind(node: React.ReactNode): ActionKind {
  if (!isElement(node)) return 'button';
  const type = node.type as unknown;
  if (type === Divider) return 'separator';
  // The primary action shown as an icon button (`iconOnly`) is still the primary action.
  if (node.props[PRIMARY] !== undefined) return 'primary';
  if ((type as OverflowSearchMarker | null)?.overflowPriority === 'late') return 'search';
  if (type === IconButton) return 'icon';
  if (type === ToggleButtonGroup) return 'toggle';
  if (type === FormControl || type === TextField || isMuiElement(node, ['Select'])) return 'select';
  if (type === Button) {
    const { variant, color } = node.props as { variant?: string; color?: string };
    if (variant === 'contained' && (color === undefined || color === 'primary')) return 'primary';
  }
  return 'button';
}

/** The text of a node: its strings and numbers, and those of the elements in it. */
export function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isElement(node)) return textOf(node.props.children as React.ReactNode);
  return '';
}

/** The select element of a select action: the `Select` itself, or the one in a `FormControl`. */
function findSelect(node: AnyElement): AnyElement | null {
  if (isMuiElement(node, ['Select'])) return node;
  if (node.type === TextField && node.props.select) return node;
  let found: AnyElement | null = null;
  React.Children.forEach(node.props.children as React.ReactNode, (child) => {
    if (!found && isElement(child)) found = findSelect(child);
  });
  return found;
}

/** A select's name in the menu: the text in front of its value (without a colon), or its label. */
function selectLabel(select: AnyElement) {
  const { startAdornment, inputProps, label, name, slotProps } = select.props as {
    startAdornment?: React.ReactNode;
    inputProps?: Props;
    label?: React.ReactNode;
    name?: string;
    slotProps?: { input?: { startAdornment?: React.ReactNode } };
  };
  const text =
    textOf(startAdornment ?? slotProps?.input?.startAdornment) ||
    String(inputProps?.['aria-label'] ?? '') ||
    textOf(label) ||
    name ||
    '';
  return text.replace(/:\s*$/, '');
}

/**
 * Calls a select's `onChange` as MUI's `Select` does: with a copy of the event whose `target` holds
 * the new value and the select's name, and the option's element.
 */
function changeSelect(select: AnyElement, event: React.SyntheticEvent, option: AnyElement) {
  const onChange = select.props.onChange as
    ((event: unknown, child: React.ReactNode) => void) | undefined;
  if (!onChange) return;
  const native = event.nativeEvent as Event;
  const Constructor = native.constructor as new (type: string, init: Event) => Event;
  const copy = new Constructor(native.type, native);
  Object.defineProperty(copy, 'target', {
    writable: true,
    value: { value: option.props.value, name: select.props.name },
  });
  onChange(copy, option);
}

// The icons of the menu items have the size of the menu's own glyphs (the drop-in's 20px).
const ItemIcon = styled(ListItemIcon, { name: 'TectonOverflow', slot: 'MenuIcon' })({
  fontSize: cssVar('icon-size-150'),
  '& [class*="tecton-"]': { fontSize: cssVar('icon-size-150') },
});

/** An element the menu cannot read, in a row of its own. */
const AsIs = styled('li', { name: 'TectonOverflow', slot: 'MenuAsIs' })({
  display: 'flex',
  alignItems: 'center',
  padding: `${cssVar('space-75')} ${cssVar('space-200')}`,
});

export interface OverflowMenuItem {
  node: React.ReactNode;
  key: string;
  /** A divider stands before it in the row. */
  afterSeparator: boolean;
}

export interface OverflowMenuHandlers {
  /** Closes the menu (before an item's action runs). */
  close: () => void;
  /** Brings a folded item back to the row, active (an opening search). */
  activate: (key: string, event: React.SyntheticEvent) => void;
}

/** The items of one folded action, and whether it takes a group of its own (a radio group). */
function itemsOf(
  { node, key }: OverflowMenuItem,
  { close, activate }: OverflowMenuHandlers,
): { group: boolean; items: React.ReactNode[] } {
  if (!isElement(node)) return { group: false, items: [] };
  const props = node.props as Props & {
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
    href?: string;
    children?: React.ReactNode;
  };
  const kind = actionKind(node);
  const run =
    (action?: (event: React.MouseEvent<HTMLElement>) => void) =>
    (event: React.MouseEvent<HTMLElement>) => {
      close();
      action?.(event);
    };
  const link = props.href ? { component: 'a', href: props.href } : {};

  if (kind === 'search') {
    const label = String(props.label ?? 'Search');
    return {
      group: false,
      items: [
        <MenuItem key={key} onClick={(event) => (close(), activate(key, event))}>
          <ItemIcon>
            <span className="tecton-search-outline" aria-hidden />
          </ItemIcon>
          <ListItemText>{label}</ListItemText>
        </MenuItem>,
      ],
    };
  }

  if (kind === 'icon') {
    const label = String(props['aria-label'] ?? props.title ?? textOf(props.children));
    return {
      group: false,
      items: [
        <MenuItem key={key} disabled={props.disabled} onClick={run(props.onClick)} {...link}>
          <ItemIcon>{props.children}</ItemIcon>
          <ListItemText>{label}</ListItemText>
        </MenuItem>,
      ],
    };
  }

  if (kind === 'toggle') {
    const {
      value: current,
      exclusive,
      onChange,
    } = props as {
      value?: unknown;
      exclusive?: boolean;
      onChange?: (event: React.MouseEvent<HTMLElement>, value: unknown) => void;
    };
    const options = React.Children.toArray(props.children).filter(isElement);
    const checked = (value: unknown) =>
      exclusive ? value === current : Array.isArray(current) && current.includes(value);
    return {
      group: true,
      items: [
        <ListSubheader key={`${key}:label`} role="presentation">
          {String(props['aria-label'] ?? '')}
        </ListSubheader>,
        ...options.map((option, index) => {
          const { value, children, disabled } = option.props as {
            value?: unknown;
            children?: React.ReactNode;
            disabled?: boolean;
          };
          const parts = React.Children.toArray(children);
          const icon = parts.filter(isElement);
          const label = textOf(parts.filter((part) => !isElement(part))) || textOf(children);
          return (
            <MenuItem
              key={`${key}:${String(value ?? index)}`}
              role="menuitemradio"
              aria-checked={checked(value)}
              selected={checked(value)}
              disabled={disabled}
              onClick={run((event) => {
                if (exclusive) {
                  if (value !== current) onChange?.(event, value);
                  return;
                }
                const list = Array.isArray(current) ? current : [];
                onChange?.(
                  event,
                  list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
                );
              })}
            >
              {icon.length > 0 ? <ItemIcon>{icon}</ItemIcon> : null}
              <ListItemText>{label || String(option.props['aria-label'] ?? '')}</ListItemText>
            </MenuItem>
          );
        }),
      ],
    };
  }

  if (kind === 'select') {
    const select = findSelect(node);
    if (select) {
      const current = select.props.value;
      const options = React.Children.toArray(select.props.children as React.ReactNode).filter(
        (child): child is AnyElement => isElement(child) && child.props.value !== undefined,
      );
      return {
        group: true,
        items: [
          <ListSubheader key={`${key}:label`} role="presentation">
            {selectLabel(select)}
          </ListSubheader>,
          ...options.map((option) => (
            <MenuItem
              key={`${key}:${String(option.props.value)}`}
              role="menuitemradio"
              aria-checked={option.props.value === current}
              selected={option.props.value === current}
              disabled={Boolean(option.props.disabled)}
              onClick={(event) => {
                close();
                if (option.props.value !== current) changeSelect(select, event, option);
              }}
            >
              {option.props.children as React.ReactNode}
            </MenuItem>
          )),
        ],
      };
    }
  }

  if (node.type === Button) {
    const icon = (props.startIcon ?? props.endIcon) as React.ReactNode;
    return {
      group: false,
      items: [
        <MenuItem key={key} disabled={props.disabled} onClick={run(props.onClick)} {...link}>
          {icon ? (
            <>
              <ItemIcon>{icon}</ItemIcon>
              <ListItemText>{props.children}</ListItemText>
            </>
          ) : (
            props.children
          )}
        </MenuItem>,
      ],
    };
  }

  return { group: false, items: [<AsIs key={key}>{node}</AsIs>] };
}

/**
 * The menu's content for the folded actions, in row order: consecutive icon buttons and buttons
 * share a group; a select or a toggle button group, and a divider in the row, start a new one.
 */
export function overflowMenuItems(folded: OverflowMenuItem[], handlers: OverflowMenuHandlers) {
  const groups: React.ReactNode[][] = [];
  let open = false;
  folded.forEach((item) => {
    const { group, items } = itemsOf(item, handlers);
    if (items.length === 0) return;
    if (group || !open || item.afterSeparator) groups.push([]);
    groups[groups.length - 1]!.push(...items);
    open = !group;
  });
  return groups.flatMap((group, index) =>
    index === 0 ? group : [<Divider key={`divider:${index}`} />, ...group],
  );
}

/**
 * A button as an icon button, as the drop-in heading shows its primary action at narrow widths: its
 * icon only, named by its label.
 */
export function iconOnly(node: React.ReactNode): React.ReactNode {
  if (!isElement(node) || node.type !== Button) return node;
  const {
    children,
    startIcon,
    endIcon,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    disableElevation: _disableElevation,
    loadingPosition: _loadingPosition,
    sx: _sx,
    color,
    ...other
  } = node.props as Props & { children?: React.ReactNode };
  const icon = (startIcon ?? endIcon) as React.ReactNode;
  if (!icon) return node;
  const label = textOf(children);
  return (
    <IconButton
      key={node.key ?? undefined}
      color={(color as 'primary' | undefined) ?? 'primary'}
      variant="square"
      aria-label={label}
      title={label}
      {...other}
      {...{ [PRIMARY]: '' }}
    >
      {icon}
    </IconButton>
  );
}
