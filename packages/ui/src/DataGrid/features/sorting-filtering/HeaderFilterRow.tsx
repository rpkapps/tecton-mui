'use client';
// Dedicated header-filter row (rendered in Community's sticky top pinned-rows container, directly
// under the column headers). One input per filterable column, with an operator menu and a clear
// button. Each cell subscribes only to its own filter item, so typing re-renders one cell.
import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { useGridApiContext, type GridColDef, type GridFilterOperator } from '@mui/x-data-grid';
import Icon from '../../../Icon/Icon.js';
import { cssVar } from '../../../styles/tecton/index.js';
import { useStoreSelector } from '../../core/store.js';
import { useGridAdvanced, type DerivedState } from '../../core/context.js';
import { isActiveFilterItem } from './filtering.js';

export const HEADER_FILTER_DEBOUNCE_MS = 300;

const DEFAULT_OPERATOR: Record<string, string> = {
  string: 'contains',
  number: '=',
  date: 'is',
  dateTime: 'is',
  boolean: 'is',
  singleSelect: 'is',
};

/** Short operator glyphs shown on the operator button and next to each operator in its menu. */
const OPERATOR_GLYPH: Record<string, string> = {
  contains: '≈',
  doesNotContain: '≉',
  equals: '=',
  doesNotEqual: '≠',
  startsWith: 'a…',
  endsWith: '…z',
  is: '=',
  not: '≠',
  after: '>',
  onOrAfter: '≥',
  before: '<',
  onOrBefore: '≤',
  isEmpty: '∅',
  isNotEmpty: '∃',
  isAnyOf: '∈',
  '=': '=',
  '!=': '≠',
  '>': '>',
  '>=': '≥',
  '<': '<',
  '<=': '≤',
};

const ANY_OF = 'isAnyOf';

// Vendor-prefixed selectors, as MUI's InputBase uses: Emotion's prefixer crashes on `::placeholder`
// when the RTL stylis plugin is active.
const PLACEHOLDER = { color: cssVar('color-input-filled-text-placeholder'), opacity: 1 };
const PLACEHOLDER_SX = {
  '&::-webkit-input-placeholder': PLACEHOLDER,
  '&::-moz-placeholder': PLACEHOLDER,
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const FILTER_CONTROL = 'input, [role="combobox"], button';
// The value control of a cell: its text input or select (not the select's hidden native input).
const VALUE_CONTROL = 'input:not([disabled]):not([aria-hidden="true"]), [role="combobox"]';

/** Moves keyboard focus to the header filter of `field`. Returns false when it has none. */
export function focusHeaderFilter(root: Element, field: string): boolean {
  const cell = root.querySelector(
    `.TectonDataGrid-headerFilterCell[data-field="${field.replace(/["\\]/g, '\\$&')}"]`,
  );
  const control =
    cell?.querySelector<HTMLElement>(VALUE_CONTROL) ?? cell?.querySelector<HTMLElement>('button');
  if (!control) return false;
  control.focus();
  control.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  return true;
}

/** Whether the caret of a text input sits at the edge the arrow key moves towards. */
function caretAtEdge(target: EventTarget, key: 'ArrowLeft' | 'ArrowRight', rtl: boolean): boolean {
  if (!(target instanceof HTMLInputElement)) return true;
  // Date and time inputs use the arrow keys for their own segments.
  if (/^(date|datetime-local|time|month|week)$/.test(target.type)) return false;
  const { selectionStart: start, selectionEnd: end, value } = target;
  if (start === null || end === null) return true; // number inputs expose no caret
  const towardsStart = (key === 'ArrowLeft') !== rtl;
  return towardsStart ? start === 0 && end === 0 : start === value.length && end === value.length;
}

type Col = GridColDef & { computedWidth?: number };

export function HeaderFilterRow({ columns, height }: { columns: Col[]; height: number }) {
  return (
    <div
      role="row"
      aria-label="Column filters"
      className="MuiDataGrid-row TectonDataGrid-headerFilterRow"
      style={{ display: 'flex', height, minHeight: height, minWidth: 'var(--DataGrid-rowWidth)' }}
    >
      {columns.map((col) => (
        <HeaderFilterCell key={col.field} col={col} height={height} />
      ))}
      {/* Rest of the row and the vertical scrollbar lane, as the header row's fillers. */}
      <div
        aria-hidden
        className="TectonDataGrid-headerFilterFiller"
        style={{
          flex: '1 0 auto',
          minWidth: 'calc(var(--DataGrid-hasScrollY) * var(--DataGrid-scrollbarSize))',
        }}
      />
    </div>
  );
}

const HeaderFilterCell = React.memo(function HeaderFilterCell({
  col,
  height,
}: {
  col: Col;
  height: number;
}) {
  const pinnedClass = typeof col.cellClassName === 'string' ? col.cellClassName : '';
  const width = col.computedWidth ?? col.width ?? 100;
  const filterable =
    !col.field.startsWith('__') &&
    col.filterable !== false &&
    (col.filterOperators?.length ?? 0) > 0 &&
    col.type !== 'actions';
  return (
    <div
      role="columnheader"
      className={`MuiDataGrid-cell TectonDataGrid-headerFilterCell ${pinnedClass}`}
      data-field={col.field}
      style={{ width, minWidth: width, maxWidth: width, height }}
    >
      {filterable ? <HeaderFilterInput col={col} /> : null}
    </div>
  );
});

function HeaderFilterInput({ col }: { col: Col }) {
  const { derived, actions } = useGridAdvanced();
  const apiRef = useGridApiContext();
  const field = col.field;
  // The header filter shows and edits the column's first condition, wherever it was made (here, in
  // the filter panel or through the API), so the row and the panel stay in step.
  const selectItem = React.useCallback(
    (s: DerivedState) => s.filterModel.items.find((i) => i.field === field),
    [field],
  );
  const item = useStoreSelector(derived, selectItem);
  const type = col.type ?? 'string';
  const operators = col.filterOperators ?? [];
  const isOperator = (value: string | null | undefined): value is string =>
    !!value && operators.some((op) => op.value === value);
  const defaultOperator = isOperator(DEFAULT_OPERATOR[type])
    ? DEFAULT_OPERATOR[type]
    : (operators[0]?.value ?? 'contains');
  // The operator picked here. It applies once there is a value, and stays when the value is
  // cleared; the header adds no condition to the model until it filters.
  const [chosenOperator, setChosenOperator] = React.useState<string | null>(null);
  const operator =
    item?.operator ?? (isOperator(chosenOperator) ? chosenOperator : defaultOperator);
  const operatorDef = operators.find((op) => op.value === operator);
  const needsValue = operatorDef?.requiresFilterValue !== false;
  const toText = (value: unknown): string =>
    value == null
      ? ''
      : Array.isArray(value)
        ? value.map(toText).join(', ')
        : value instanceof Date
          ? toDateInput(value, type === 'dateTime')
          : String(value);
  const committed = toText(item?.value);

  // Local draft so typing is instant; commits are debounced.
  const [draft, setDraft] = React.useState(committed);
  const [lastCommitted, setLastCommitted] = React.useState(committed);
  if (lastCommitted !== committed) {
    setLastCommitted(committed);
    // Keep the text as typed when it stands for the committed value ("1, 2," for [1, 2]).
    if (toText(parseValue(draft, type, operator)) !== committed) setDraft(committed);
  }
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const upsert = (nextOperator: string, value: unknown) => {
    setChosenOperator(nextOperator);
    const opDef = operators.find((op) => op.value === nextOperator);
    const filters = value !== undefined || opDef?.requiresFilterValue === false;
    actions.updateHeaderFilter(field, (current) => {
      if (filters) return { ...current, field, operator: nextOperator, value: value ?? null };
      // No value: a condition that was filtering goes; one still being set up (added in the filter
      // panel, no value yet) stays and takes the new operator.
      if (!current) return null;
      return isActiveFilterItem(current, col) ? null : { ...current, operator: nextOperator };
    });
  };
  const commit = (nextOperator: string, raw: string) => {
    clearTimeout(timer.current);
    upsert(nextOperator, parseValue(raw, type, nextOperator));
  };
  const onChange = (raw: string) => {
    setDraft(raw);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(operator, raw), HEADER_FILTER_DEBOUNCE_MS);
  };

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const label = col.headerName ?? field;
  const t = (key: string) => {
    try {
      return (apiRef.current?.getLocaleText(key as never) as string) || key;
    } catch {
      return key;
    }
  };
  const operatorLabel = (op: GridFilterOperator | undefined, value: string) => {
    if (op?.headerLabel) return op.headerLabel;
    const headerKey = `headerFilterOperator${capitalize(value)}`;
    const headerText = t(headerKey);
    if (headerText !== headerKey) return headerText;
    return capitalize(op?.label ?? t(`filterOperator${capitalize(value)}`));
  };
  const currentOperatorLabel = operatorLabel(operatorDef, operator);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  // Arrow keys move between the header filter row, the column headers and the rows, as in the
  // rest of the grid: Up to this column's header, Down to its first row, Left/Right to the
  // neighbouring filter once the caret is at the edge of the text.
  const onControlKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    // The operator menu and the value list are portaled out of the cell, but React still bubbles
    // their key events through here: their arrow keys belong to the list.
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const api = apiRef.current;
    if (!api) return;
    const colIndex = api.getColumnIndex(field);
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      api.scrollToIndexes({ colIndex });
      api.setColumnHeaderFocus(field);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const id = api.getRowIdFromRowIndex(0);
      if (id === undefined || id === null) return;
      api.scrollToIndexes({ rowIndex: 0, colIndex });
      api.setCellFocus(id, field);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const cell = event.currentTarget.closest('.TectonDataGrid-headerFilterCell');
      const rtl = !!cell && getComputedStyle(cell).direction === 'rtl';
      if (event.target instanceof HTMLButtonElement || !caretAtEdge(event.target, event.key, rtl))
        return;
      const towardsStart = (event.key === 'ArrowLeft') !== rtl;
      let sibling = towardsStart ? cell?.previousElementSibling : cell?.nextElementSibling;
      while (sibling && !sibling.querySelector(FILTER_CONTROL)) {
        sibling = towardsStart ? sibling.previousElementSibling : sibling.nextElementSibling;
      }
      const nextField = (sibling as HTMLElement | null)?.dataset.field;
      const root = cell?.closest('.MuiDataGrid-root');
      if (!nextField || !root) return;
      event.preventDefault();
      api.scrollToIndexes({ colIndex: api.getColumnIndex(nextField) });
      focusHeaderFilter(root, nextField);
    }
  };

  const isSelect = type === 'boolean' || type === 'singleSelect';
  const multiple = operator === ANY_OF;
  const options = isSelect ? selectOptions(col, type, t) : [];
  const keyOf = (value: unknown) => {
    const option = options.find((o) => o.value === value || o.key === String(value));
    return option ? option.key : String(value);
  };
  const selectedKeys =
    item?.value == null || item.value === ''
      ? []
      : (Array.isArray(item.value) ? item.value : [item.value]).map(keyOf);
  const commitKeys = (nextOperator: string, keys: string[]) => {
    const values = keys.map((key) => options.find((o) => o.key === key)?.value ?? key);
    upsert(
      nextOperator,
      nextOperator === ANY_OF ? (values.length ? values : undefined) : values[0],
    );
  };
  const changeOperator = (nextOperator: string) => {
    if (isSelect) commitKeys(nextOperator, selectedKeys);
    else commit(nextOperator, draft);
  };

  let input: React.ReactNode;
  if (isSelect) {
    const labelOf = (key: string) => options.find((o) => o.key === key)?.label ?? key;
    input = (
      <Select<string | string[]>
        multiple={multiple}
        displayEmpty
        disabled={!needsValue}
        value={multiple ? selectedKeys : (selectedKeys[0] ?? '')}
        open={selectOpen}
        onOpen={() => setSelectOpen(true)}
        onClose={() => setSelectOpen(false)}
        onChange={(event: SelectChangeEvent<string | string[]>) => {
          const value = event.target.value;
          commitKeys(operator, Array.isArray(value) ? value : value === '' ? [] : [value]);
        }}
        renderValue={(value) => {
          const keys = Array.isArray(value) ? value : value === '' ? [] : [value];
          if (keys.length === 0)
            return (
              <span className="TectonDataGrid-headerFilterPlaceholder">
                {capitalize(t('filterValueAny'))}
              </span>
            );
          return keys.map(labelOf).join(', ');
        }}
        input={
          <InputBase
            className="TectonDataGrid-headerFilterInput"
            sx={{ flex: 1, minWidth: 0, fontSize: 'inherit' }}
          />
        }
        inputProps={{ 'aria-label': `Filter ${label}` }}
        // Arrow Up/Down keep moving through the grid (see onControlKeyDown); Enter, Space or
        // Alt+Arrow open the list, Escape clears the value.
        SelectDisplayProps={
          {
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              const opens =
                event.key === 'Enter' ||
                event.key === ' ' ||
                (event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp'));
              if (opens) {
                event.preventDefault();
                event.stopPropagation();
                setSelectOpen(true);
              } else if (event.key === 'Escape' && selectedKeys.length) {
                event.stopPropagation();
                commitKeys(operator, []);
              }
            },
          } as React.HTMLAttributes<HTMLDivElement>
        }
      >
        {multiple ? null : (
          <MenuItem value="">
            <ListItemText>{capitalize(t('filterValueAny'))}</ListItemText>
          </MenuItem>
        )}
        {options.map((o) => (
          <MenuItem key={o.key} value={o.key}>
            {multiple ? (
              // The option itself carries aria-selected; the box is only its picture.
              <Checkbox
                size="small"
                tabIndex={-1}
                checked={selectedKeys.includes(o.key)}
                slotProps={{ input: { 'aria-hidden': true } as never }}
              />
            ) : null}
            <ListItemText>{o.label}</ListItemText>
          </MenuItem>
        ))}
      </Select>
    );
  } else {
    const textOnly = multiple || !needsValue;
    input = (
      <InputBase
        value={needsValue ? draft : ''}
        disabled={!needsValue}
        type={
          textOnly
            ? 'text'
            : type === 'number'
              ? 'number'
              : type === 'date'
                ? 'date'
                : type === 'dateTime'
                  ? 'datetime-local'
                  : 'text'
        }
        placeholder={
          !needsValue
            ? ''
            : multiple
              ? 'Values, comma-separated'
              : `${t('filterPanelInputPlaceholder')}…`.replace('……', '…')
        }
        inputProps={{ 'aria-label': `Filter ${label}` }}
        slotProps={{ input: { sx: PLACEHOLDER_SX } as never }}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && draft) {
            setDraft('');
            commit(operator, '');
          }
          if (e.key === 'Enter') commit(operator, draft);
        }}
        className="TectonDataGrid-headerFilterInput"
        sx={{ flex: 1, minWidth: 0, fontSize: 'inherit' }}
      />
    );
  }

  const hasValue = isSelect ? selectedKeys.length > 0 : draft !== '';
  return (
    <div
      className="TectonDataGrid-headerFilterControl"
      onClick={stop}
      onMouseDown={stop}
      onKeyDown={onControlKeyDown}
    >
      {operators.length > 1 ? (
        <>
          <Tooltip title={currentOperatorLabel}>
            <IconButton
              size="small"
              className="TectonDataGrid-headerFilterOperator"
              aria-label={`${label} filter operator: ${currentOperatorLabel}`}
              aria-haspopup="menu"
              aria-expanded={menuAnchor ? 'true' : undefined}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <span aria-hidden>{OPERATOR_GLYPH[operator] ?? '≈'}</span>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
            slotProps={{ list: { 'aria-label': `${label} filter operator` } }}
          >
            {operators.map((op) => (
              <MenuItem
                key={op.value}
                selected={op.value === operator}
                onClick={() => {
                  setMenuAnchor(null);
                  changeOperator(op.value);
                }}
              >
                <ListItemIcon className="TectonDataGrid-operatorGlyph" aria-hidden>
                  {OPERATOR_GLYPH[op.value] ?? ''}
                </ListItemIcon>
                <ListItemText>{operatorLabel(op, op.value)}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : null}
      {input}
      {item && (hasValue || !needsValue) ? (
        <IconButton
          size="small"
          aria-label={`Clear ${label} filter`}
          className="TectonDataGrid-headerFilterClear"
          onClick={() => {
            clearTimeout(timer.current);
            setDraft('');
            setChosenOperator(null);
            actions.updateHeaderFilter(field, () => null);
          }}
        >
          <Icon name="close-small" />
        </IconButton>
      ) : null}
    </div>
  );
}

interface SelectOption {
  /** String form used by the Select. */
  key: string;
  /** The value written to the filter model (the option's own value, so `is` compares it as is). */
  value: unknown;
  label: string;
}

function selectOptions(col: Col, type: string, t: (key: string) => string): SelectOption[] {
  if (type === 'boolean')
    return [
      { key: 'true', value: 'true', label: capitalize(t('filterValueTrue')) },
      { key: 'false', value: 'false', label: capitalize(t('filterValueFalse')) },
    ];
  const def = col as Col & {
    valueOptions?: unknown;
    getOptionValue?: (option: unknown) => unknown;
    getOptionLabel?: (option: unknown) => string;
  };
  const raw =
    typeof def.valueOptions === 'function'
      ? (def.valueOptions as (params: { field: string }) => unknown)({ field: col.field })
      : def.valueOptions;
  if (!Array.isArray(raw)) return [];
  const isObject = (o: unknown): o is { value?: unknown; label?: unknown } =>
    typeof o === 'object' && o !== null;
  return raw.map((option) => {
    const value = def.getOptionValue
      ? def.getOptionValue(option)
      : isObject(option)
        ? option.value
        : option;
    const label = def.getOptionLabel
      ? def.getOptionLabel(option)
      : isObject(option)
        ? (option.label ?? option.value)
        : option;
    return { key: String(value), value, label: String(label) };
  });
}

/**
 * Formats a Date for a native `date` / `datetime-local` input in the user's local time zone
 * (`toISOString()` would show the UTC calendar day and has no `datetime-local` form).
 */
export function toDateInput(d: Date, withTime = false): string {
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${String(d.getFullYear()).padStart(4, '0')}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

/** Text input -> filter value. `isAnyOf` takes comma-separated values. */
function parseValue(raw: string, type: string, operator: string): unknown {
  if (operator === ANY_OF) {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const values = type === 'number' ? parts.map(Number).filter((n) => !Number.isNaN(n)) : parts;
    return values.length ? values : undefined;
  }
  if (raw === '') return undefined;
  if (type === 'number') {
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }
  return raw;
}
