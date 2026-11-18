'use client';
// Dedicated header-filter row (rendered in Community's sticky top pinned-rows container, directly
// under the column headers). One input per filterable column, with an operator menu and a clear
// button. Each cell subscribes only to its own filter item, so typing re-renders one cell.
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import NativeSelect from '@mui/material/NativeSelect';
import Tooltip from '@mui/material/Tooltip';
import { useGridApiContext, type GridColDef, type GridFilterItem } from '@mui/x-data-grid';
import Icon from '../../../Icon/Icon.js';
import { useStoreSelector } from '../../core/store.js';
import { useGridAdvanced, type DerivedState } from '../../core/context.js';

export const HEADER_FILTER_DEBOUNCE_MS = 300;
export const HEADER_FILTER_ID_PREFIX = 'header-filter-';

const DEFAULT_OPERATOR: Record<string, string> = {
  string: 'contains',
  number: '=',
  date: 'is',
  dateTime: 'is',
  boolean: 'is',
  singleSelect: 'is',
};

/** Short operator glyphs shown on the operator button. */
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Col = GridColDef & { computedWidth?: number };

export function HeaderFilterRow({ columns, height }: { columns: Col[]; height: number }) {
  return (
    <div
      role="row"
      aria-label="Column filters"
      className="MuiDataGrid-row TectonDataGrid-headerFilterRow"
      style={{ display: 'flex', height, minHeight: height, width: 'var(--DataGrid-rowWidth)' }}
    >
      {columns.map((col) => (
        <HeaderFilterCell key={col.field} col={col} height={height} />
      ))}
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
  const id = `${HEADER_FILTER_ID_PREFIX}${field}`;
  const selectItem = React.useCallback(
    (s: DerivedState) => s.filterModel.items.find((i) => i.id === id),
    [id],
  );
  const item = useStoreSelector(derived, selectItem);
  const type = col.type ?? 'string';
  const operators = col.filterOperators ?? [];
  const operator = item?.operator ?? DEFAULT_OPERATOR[type] ?? operators[0]?.value ?? 'contains';
  const operatorDef = operators.find((op) => op.value === operator);
  const needsValue = operatorDef?.requiresFilterValue !== false;
  const committed =
    item?.value == null
      ? ''
      : item.value instanceof Date
        ? toDateInput(item.value)
        : String(item.value);

  // Local draft so typing is instant; commits are debounced.
  const [draft, setDraft] = React.useState(committed);
  const [lastCommitted, setLastCommitted] = React.useState(committed);
  if (lastCommitted !== committed) {
    setLastCommitted(committed);
    setDraft(committed);
  }
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (nextOperator: string, raw: string) => {
    const value = parseValue(raw, type);
    const opDef = operators.find((op) => op.value === nextOperator);
    const keep = value !== undefined || opDef?.requiresFilterValue === false;
    actions.upsertHeaderFilter(field, nextOperator, keep ? (value ?? null) : undefined);
  };
  const onChange = (raw: string) => {
    setDraft(raw);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(operator, raw), HEADER_FILTER_DEBOUNCE_MS);
  };

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const label = col.headerName ?? field;
  const t = (key: string) => {
    try {
      return (apiRef.current?.getLocaleText(key as never) as string) || key;
    } catch {
      return key;
    }
  };
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  let input: React.ReactNode;
  if (type === 'boolean' || type === 'singleSelect') {
    const options =
      type === 'boolean'
        ? [
            { value: 'true', label: t('filterValueTrue') },
            { value: 'false', label: t('filterValueFalse') },
          ]
        : normalizeOptions((col as { valueOptions?: unknown }).valueOptions);
    input = (
      <NativeSelect
        value={draft}
        disableUnderline
        onChange={(e) => {
          setDraft(e.target.value);
          commit(operator, e.target.value);
        }}
        inputProps={{ 'aria-label': `Filter ${label}` }}
        className="TectonDataGrid-headerFilterInput"
        sx={{ flex: 1, minWidth: 0, fontSize: 'inherit' }}
      >
        <option value="">{t('filterValueAny')}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
    );
  } else {
    input = (
      <InputBase
        value={needsValue ? draft : ''}
        disabled={!needsValue}
        type={
          type === 'number'
            ? 'number'
            : type === 'date'
              ? 'date'
              : type === 'dateTime'
                ? 'datetime-local'
                : 'text'
        }
        placeholder={needsValue ? `${t('filterPanelInputPlaceholder')}…`.replace('……', '…') : ''}
        inputProps={{ 'aria-label': `Filter ${label}` }}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape' && draft) {
            setDraft('');
            commit(operator, '');
          }
          if (e.key === 'Enter') {
            clearTimeout(timer.current);
            commit(operator, draft);
          }
        }}
        className="TectonDataGrid-headerFilterInput"
        sx={{ flex: 1, minWidth: 0, fontSize: 'inherit' }}
      />
    );
  }

  return (
    <div
      className="TectonDataGrid-headerFilterControl"
      onClick={stop}
      onMouseDown={stop}
      onKeyDown={stop}
    >
      {operators.length > 1 ? (
        <>
          <Tooltip title={t(`filterOperator${capitalize(operator)}`)}>
            <IconButton
              size="small"
              className="TectonDataGrid-headerFilterOperator"
              aria-label={`${label} filter operator: ${t(`filterOperator${capitalize(operator)}`)}`}
              aria-haspopup="menu"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <span aria-hidden>{OPERATOR_GLYPH[operator] ?? '≈'}</span>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            {operators.map((op) => (
              <MenuItem
                key={op.value}
                selected={op.value === operator}
                onClick={() => {
                  setMenuAnchor(null);
                  commit(op.value, draft);
                }}
              >
                <span className="TectonDataGrid-operatorGlyph" aria-hidden>
                  {OPERATOR_GLYPH[op.value] ?? ''}
                </span>
                <ListItemText>
                  {op.label ?? t(`filterOperator${capitalize(op.value)}`)}
                </ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : null}
      {input}
      {item && (draft !== '' || !needsValue) ? (
        <IconButton
          size="small"
          aria-label={`Clear ${label} filter`}
          className="TectonDataGrid-headerFilterClear"
          onClick={() => {
            setDraft('');
            actions.upsertHeaderFilter(field, DEFAULT_OPERATOR[type] ?? operator, undefined);
          }}
        >
          <Icon name="close-small" />
        </IconButton>
      ) : null}
    </div>
  );
}

function normalizeOptions(options: unknown): Array<{ value: string; label: string }> {
  if (!Array.isArray(options)) return [];
  return options.map((o) =>
    typeof o === 'object' && o !== null
      ? {
          value: String((o as { value: unknown }).value),
          label: String((o as { label?: unknown }).label ?? (o as { value: unknown }).value),
        }
      : { value: String(o), label: String(o) },
  );
}

function toDateInput(d: Date): string {
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function parseValue(raw: string, type: string): unknown {
  if (raw === '') return undefined;
  switch (type) {
    case 'number': {
      const n = Number(raw);
      return Number.isNaN(n) ? undefined : n;
    }
    case 'date':
    case 'dateTime':
      return raw;
    default:
      return raw;
  }
}

/** Header filter items have the reserved id prefix. */
export const isHeaderFilterItem = (item: GridFilterItem) =>
  String(item.id ?? '').startsWith(HEADER_FILTER_ID_PREFIX);
