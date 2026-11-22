'use client';
// Community slot implementations that render the wrapper's multi-model state. They subscribe to
// narrow store slices so a sort/filter/page change re-renders only the affected header widgets.
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import {
  GridColumnHeaderFilterIconButton,
  GridColumnHeaderSortIcon,
  GridColumnMenu,
  GridFilterForm,
  GridPanel,
  type GridPanelProps,
  type GridLogicOperator,
  GridRow,
  GridRowCount,
  gridVisibleColumnDefinitionsSelector,
  gridDimensionsSelector,
  useGridApiContext,
  useGridSelector,
  type GridColDef,
  type GridColumnMenuProps,
  type GridFilterItem,
  type GridRowProps,
} from '@mui/x-data-grid';
import { styled, ThemeProvider, useTheme, type Theme } from '@mui/material/styles';
import Icon from '../../Icon/Icon.js';
import { cssVar } from '../../styles/tecton/index.js';
import { useStoreSelector } from '../core/store.js';
import { useGridAdvanced, type DerivedState, type UiState } from '../core/context.js';
import { isExpandedFromMeta } from '../core/expansion.js';
import { getCellValue, getFormattedValue } from '../core/columns.js';
import { availableAggregationFunctions } from '../features/grouping-aggregation/aggregation.js';
import { visuallyHidden } from './cells.js';
import { HeaderFilterRow } from '../features/sorting-filtering/HeaderFilterRow.js';

type SortIconProps = React.ComponentProps<typeof GridColumnHeaderSortIcon> & { field: string };

/** Multi-sort aware header sort icon (direction + priority badge + screen-reader text). */
export function SortIconSlot(props: SortIconProps) {
  const { derived } = useGridAdvanced();
  const key = useStoreSelector(
    derived,
    React.useCallback(
      (s: DerivedState) => {
        const index = s.sortModel.findIndex((i) => i.field === props.field);
        return index < 0 ? '' : `${s.sortModel[index].sort}|${index}|${s.sortModel.length}`;
      },
      [props.field],
    ),
  );
  const [dir, indexStr, countStr] = key.split('|');
  const direction = (dir || null) as SortIconProps['direction'];
  const count = Number(countStr) || 0;
  const index = count > 1 ? Number(indexStr) + 1 : undefined;
  return (
    <>
      <GridColumnHeaderSortIcon {...props} direction={direction} index={index} />
      {direction ? (
        <span
          className="TectonDataGrid-headerMarker TectonDataGrid-sortedMarker"
          style={visuallyHidden}
        >
          {count > 1
            ? `sorted ${direction === 'asc' ? 'ascending' : 'descending'}, priority ${index}`
            : ''}
        </span>
      ) : null}
    </>
  );
}

type FilterIconProps = React.ComponentProps<typeof GridColumnHeaderFilterIconButton> & {
  field: string;
};

export function FilterIconSlot(props: FilterIconProps) {
  const { derived } = useGridAdvanced();
  const counter = useStoreSelector(
    derived,
    React.useCallback((s: DerivedState) => s.filterCounts[props.field] ?? 0, [props.field]),
  );
  return (
    <>
      <GridColumnHeaderFilterIconButton {...props} counter={counter} />
      {counter > 0 ? <span className="TectonDataGrid-headerMarker" style={visuallyHidden} /> : null}
    </>
  );
}

let newFilterId = 0;

// The filter form gives each value input `slotProps.root.size: 'small'`, applied after the grid's
// slot props, so the md size of the Tecton drop-in filter menu is set per condition here. An
// operator's own `InputComponentProps.slotProps` (a size included) is kept.
const MD_VALUE_INPUT = { InputComponentProps: { slotProps: { root: { size: 'medium' } } } };
function mdValueInput(columns: readonly GridColDef[], item: GridFilterItem) {
  const operator = columns
    .find((c) => c.field === item.field)
    ?.filterOperators?.find((o) => o.value === item.operator);
  const own = operator?.InputComponentProps?.slotProps as
    { root?: Record<string, unknown> } | undefined;
  if (!own) return MD_VALUE_INPUT;
  return {
    InputComponentProps: { slotProps: { ...own, root: { size: 'medium', ...own.root } } },
  };
}

// The Tecton theme makes TextField `filled` by default, and the Community grid takes its panel
// inputs' variant from that default. The Tecton drop-in filter and column menus use outlined
// inputs, so the panels (filter panel, columns panel) default to `outlined`. The nested theme is
// built once per outer theme.
const panelThemes = new WeakMap<Theme, Theme>();
const buildPanelTheme = (outer: Theme): Theme => ({
  ...outer,
  components: {
    ...outer.components,
    MuiTextField: {
      ...outer.components?.MuiTextField,
      defaultProps: { ...outer.components?.MuiTextField?.defaultProps, variant: 'outlined' },
    },
    // The grid forces its panel labels to `shrink`, which notches the outline. Tecton labels sit
    // above the field, so keep the border closed (as `notched={false}` would).
    MuiOutlinedInput: {
      ...outer.components?.MuiOutlinedInput,
      styleOverrides: {
        ...outer.components?.MuiOutlinedInput?.styleOverrides,
        notchedOutline: { '& legend': { maxWidth: '0.01px' } },
      },
    },
  },
});

/** Community `GridPanel` with outlined inputs, as in the Tecton drop-in menus. */
export const PanelSlot = React.forwardRef<HTMLDivElement, GridPanelProps>(
  function PanelSlot(props, ref) {
    const outer = useTheme();
    let theme = panelThemes.get(outer);
    if (!theme) {
      theme = buildPanelTheme(outer);
      panelThemes.set(outer, theme);
    }
    return (
      <ThemeProvider theme={theme}>
        <GridPanel ref={ref} {...props} />
      </ThemeProvider>
    );
  },
);

/**
 * Shown in a filter value input while its debounced value is being applied. Community's default is
 * Material's static "sync" icon; a small Tecton progress indicator says the same thing.
 */
export function FilterApplyingIcon() {
  return <CircularProgress size={16} aria-label="Applying filter" sx={{ flexShrink: 0 }} />;
}

/** Multi-item filter panel built from Community's public GridFilterForm. */
export function MultiFilterPanel() {
  const { derived, actions, features } = useGridAdvanced();
  const apiRef = useGridApiContext();
  const model = useStoreSelector(derived, selectFilterModel);
  const columns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const filterable = React.useMemo(
    () => columns.filter((c) => c.filterable !== false && c.filterOperators?.length),
    [columns],
  );
  // Every condition, including the ones set in the header filter row: both edit the same model
  // (a header filter shows its column's first condition).
  const items = model.items;
  const lastRef = React.useRef<HTMLElement>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  // Focus the last condition when the panel opens and after "Add filter", but not when a
  // condition arrives from elsewhere (a header filter) while the panel is open.
  const focusLast = React.useRef(true);

  const setItems = (next: GridFilterItem[]) => actions.setFilterModel({ ...model, items: next });
  const addFilter = () => {
    const used = new Set(items.map((i) => i.field));
    const col = filterable.find((c) => !used.has(c.field)) ?? filterable[0];
    if (!col) return;
    focusLast.current = true;
    setItems([
      ...items,
      { id: `filter-${++newFilterId}`, field: col.field, operator: col.filterOperators![0].value },
    ]);
  };
  React.useEffect(() => {
    if (items.length === 0) addFilter();
    // Only when the panel opens with an empty model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Move the focus into the panel when it opens and to the new condition when one is added, as
  // the Community filter panel does (keyboard users otherwise stay on the toolbar button).
  React.useEffect(() => {
    if (items.length === 0 || !focusLast.current) return undefined;
    // The popper is placed after mount; focus once it is in position (no scroll jump).
    const frame = requestAnimationFrame(() => {
      focusLast.current = false;
      lastRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [items.length]);
  // When the last condition goes (its delete button, or "Remove all", which is then disabled),
  // the focused control is gone: keep the keyboard in the panel, on "Add filter".
  const empty = items.length === 0;
  const wasEmpty = React.useRef(empty);
  React.useEffect(() => {
    if (empty && !wasEmpty.current) {
      const active = document.activeElement;
      if (!active || active === document.body || panelRef.current?.contains(active))
        addRef.current?.focus();
    }
    wasEmpty.current = empty;
  }, [empty]);

  return (
    <Box
      ref={panelRef}
      className="TectonDataGrid-filterPanel"
      sx={{ display: 'flex', flexDirection: 'column', minWidth: 'min(720px, 90vw)' }}
    >
      {/* No conditions: no empty, padded list above the actions. */}
      {empty ? null : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1.5,
            overflow: 'auto',
            // The And/Or selector's label is empty and collapses, and the delete button has none:
            // give the empty label one line of text height and move the button down by the label
            // block (Tecton's static label: small line height + space-50 below) so every control
            // lines up on the inputs, also when a multi-value input grows taller.
            '& .MuiDataGrid-filterForm': { alignItems: 'flex-start' },
            // The value input takes the rest of the row (Community fixes it at 190px), so a few
            // "is any of" values fit on one line next to the clear and popup buttons.
            '& .MuiDataGrid-filterFormValueInput': {
              width: 'auto',
              flex: '1 1 190px',
              minWidth: 190,
            },
            '& .MuiDataGrid-filterForm .MuiInputLabel-root:empty::before': { content: '"\\200B"' },
            // The button is centred on the md (32px) inputs beside it.
            '& .MuiDataGrid-filterFormDeleteIcon': {
              marginTop: `calc(${cssVar('line-height-small')} + ${cssVar('space-50')})`,
              height: cssVar('space-400'),
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {items.map((item, index) => (
            <GridFilterForm
              key={item.id ?? index}
              item={item}
              hasMultipleFilters={items.length > 1}
              showMultiFilterOperators={index > 0}
              disableMultiFilterOperator={index !== 1}
              focusElementRef={index === items.length - 1 ? lastRef : undefined}
              valueInputProps={mdValueInput(columns, item)}
              applyFilterChanges={(changed: GridFilterItem) =>
                setItems(items.map((i) => (i.id === changed.id ? changed : i)))
              }
              applyMultiFilterOperatorChanges={(logicOperator: GridLogicOperator) =>
                actions.setFilterModel({ ...model, logicOperator })
              }
              deleteFilter={(removed: GridFilterItem) =>
                setItems(items.filter((i) => i.id !== removed.id))
              }
            />
          ))}
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          ...(empty ? null : { borderTop: 1, borderColor: 'divider' }),
        }}
      >
        {/* With one condition allowed, "Add filter" still adds the first. */}
        {features.multiFilter || empty ? (
          <Button ref={addRef} startIcon={<Icon name="add" />} onClick={addFilter}>
            Add filter
          </Button>
        ) : (
          <span />
        )}
        {/* The Tecton drop-in filter menu's Remove All uses the filled trash bin. */}
        <Button
          startIcon={<Icon name="delete" variant="filled" />}
          onClick={() => setItems([])}
          disabled={items.length === 0}
        >
          Remove all
        </Button>
      </Box>
    </Box>
  );
}
const selectFilterModel = (s: DerivedState) => s.filterModel;

const selectPagination = (s: DerivedState) => `${s.page}|${s.pageSize}|${s.rowCount}`;
const selectPageSizeOptions = (s: DerivedState) => s.pageSizeOptions;

/** Pagination over the wrapper's processed rows (no Community 100-row page-size limit). */
export function PaginationSlot() {
  const { derived, actions } = useGridAdvanced();
  const apiRef = useGridApiContext();
  const [page, pageSize, rowCount] = useStoreSelector(derived, selectPagination)
    .split('|')
    .map(Number);
  const options = useStoreSelector(derived, selectPageSizeOptions);
  const lastPage = Math.max(0, Math.ceil(rowCount / Math.max(pageSize, 1)) - 1);
  return (
    <TablePagination
      component="div"
      className="MuiDataGrid-pagination TectonDataGrid-pagination"
      count={rowCount}
      page={Math.min(page, lastPage)}
      rowsPerPage={pageSize}
      rowsPerPageOptions={options as Array<number | { value: number; label: string }>}
      onPageChange={(_, next) => actions.setPage(next)}
      onRowsPerPageChange={(event) => actions.setPageSize(Number(event.target.value))}
      labelRowsPerPage={apiRef.current?.getLocaleText('paginationRowsPerPage')}
      sx={{ overflow: 'visible' }}
    />
  );
}

const selectRowCount = (s: DerivedState) => s.rowCount;

/**
 * Footer content without pagination (`pagination={false}`, lazy loading): the total row count, as
 * the MUI grid shows when it does not paginate. `hideFooterRowCount` hides it.
 */
export function TotalRowCountSlot({ hideRowCount }: { hideRowCount?: boolean }) {
  const { derived } = useGridAdvanced();
  const rowCount = useStoreSelector(derived, selectRowCount);
  if (hideRowCount || rowCount < 0) return null;
  return <GridRowCount rowCount={rowCount} visibleRowCount={rowCount} />;
}

const selectPinnedTop = (s: DerivedState) => s.pinnedTop;
const selectPinnedBottom = (s: DerivedState) => s.pinnedBottom;

/** Pinned (top/bottom) rows rendered in Community's sticky pinned-row containers. */
export function PinnedRowsSlot({ position }: { position: 'top' | 'bottom' }) {
  const { derived, actions } = useGridAdvanced();
  const rows = useStoreSelector(derived, position === 'top' ? selectPinnedTop : selectPinnedBottom);
  const headerFilters = useStoreSelector(derived, selectHeaderFilters) && position === 'top';
  const apiRef = useGridApiContext();
  const columns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const dimensions = useGridSelector(apiRef, gridDimensionsSelector);
  const ref = React.useRef<HTMLDivElement>(null);
  // Community offsets rows by the header height only and sizes its scroll range without these
  // sections. Each section reports its height: the top one as a CSS variable so rows start below
  // it (applied before paint), both to the grid, which adds them to the scroll range.
  useEnhancedEffect(() => {
    const el = ref.current;
    const root = el?.closest<HTMLElement>('.MuiDataGrid-root') ?? null;
    const publish = () => {
      const height = el?.offsetHeight ?? 0;
      if (position === 'top') root?.style.setProperty('--tdg-pinned-top', `${height}px`);
      actions.setPinnedExtent(position, height);
    };
    publish();
    const observer =
      el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null;
    if (el) observer?.observe(el);
    return () => {
      observer?.disconnect();
      if (position === 'top') root?.style.removeProperty('--tdg-pinned-top');
      actions.setPinnedExtent(position, 0);
    };
  }, [position, rows.length, headerFilters, actions]);
  if (rows.length === 0 && !headerFilters) return null;
  return (
    <div
      ref={ref}
      role="presentation"
      className={`MuiDataGrid-pinnedRows MuiDataGrid-pinnedRows--${position} TectonDataGrid-pinnedRows TectonDataGrid-pinnedRows--${position}`}
    >
      {headerFilters ? <HeaderFilterRow columns={columns} height={dimensions.rowHeight} /> : null}
      {rows.map((row, index) => (
        <StaticRow
          key={index}
          row={row as Record<string, unknown>}
          columns={columns}
          height={dimensions.rowHeight}
          isAggregate={(row as { __tectonAggregate?: boolean }).__tectonAggregate === true}
        />
      ))}
    </div>
  );
}
const selectHeaderFilters = (s: DerivedState) => s.headerFilters;

const StaticRow = React.memo(function StaticRow({
  row,
  columns,
  height,
  isAggregate,
}: {
  row: Record<string, unknown>;
  columns: Array<GridColDef & { computedWidth?: number }>;
  height: number;
  isAggregate: boolean;
}) {
  const apiRef = useGridApiContext();
  const { derived } = useGridAdvanced();
  const labels = useStoreSelector(derived, selectAggregationLabels);
  return (
    <div
      role="row"
      className={`MuiDataGrid-row TectonDataGrid-pinnedRow${isAggregate ? ' TectonDataGrid-aggregationRow' : ''}`}
      style={{ display: 'flex', height, minHeight: height, width: 'var(--DataGrid-rowWidth)' }}
    >
      {columns.map((col) => {
        const pinnedClass = (typeof col.cellClassName === 'string' ? col.cellClassName : '') || '';
        const raw = isAggregate ? row[col.field] : getCellValue(row, col, apiRef);
        let content: React.ReactNode = null;
        if (isAggregate) {
          if (raw !== undefined) content = String(raw);
        } else if (col.field.startsWith('__')) {
          content = null;
        } else if (col.renderCell) {
          content = col.renderCell({
            id: (row.id as string) ?? '',
            field: col.field,
            row,
            value: raw,
            formattedValue: getFormattedValue(row, col, apiRef, raw),
            colDef: col,
            api: apiRef.current,
            rowNode: { id: row.id, depth: 0, type: 'pinnedRow' },
            hasFocus: false,
            tabIndex: -1,
            cellMode: 'view',
            isEditable: false,
          } as never);
        } else {
          const formatted = getFormattedValue(row, col, apiRef, raw);
          content = formatted == null ? null : String(formatted);
        }
        return (
          <div
            key={col.field}
            role="gridcell"
            className={`MuiDataGrid-cell MuiDataGrid-cell--text${col.align ? `${col.align === 'right' ? 'Right' : col.align === 'center' ? 'Center' : 'Left'}` : 'Left'} ${pinnedClass}`}
            data-field={col.field}
            style={{
              width: col.computedWidth,
              minWidth: col.computedWidth,
              maxWidth: col.computedWidth,
              height,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isAggregate && labels[col.field] && content != null ? (
              <span title={labels[col.field]}>{content}</span>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
});
const selectAggregationLabels = (s: DerivedState) => s.aggregationLabels;

/** Column menu with sort (multi-aware), pinning, grouping, aggregation and move items. */
// Community puts a divider after every menu section, also after one that renders nothing for
// the column (not sortable, not pinnable, a system column ...). Hide the dividers that would then
// touch, start or end the list, and give the rest the theme's menu spacing.
const StyledColumnMenu = styled(GridColumnMenu, { name: 'TectonDataGrid', slot: 'ColumnMenu' })({
  '&& > .MuiDivider-root': { marginBlock: cssVar('space-50') },
  '& > .MuiDivider-root + .MuiDivider-root, & > .MuiDivider-root:first-child, & > .MuiDivider-root:last-child':
    { display: 'none' },
});

export function ColumnMenuSlot(props: GridColumnMenuProps) {
  return (
    <StyledColumnMenu
      {...props}
      slots={{
        columnMenuSortItem: SortMenuItems,
        columnMenuPinningItem: PositionMenuItems,
        columnMenuGroupingItem: GroupingAggregationMenuItems,
        ...props.slots,
      }}
      slotProps={{
        columnMenuPinningItem: { displayOrder: 15 },
        columnMenuGroupingItem: { displayOrder: 25 },
        ...props.slotProps,
      }}
    />
  );
}

interface MenuItemProps {
  colDef: GridColDef;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

function Item({
  icon,
  label,
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon>
        <Icon name={icon} size="small" />
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
}

function SortMenuItems({ colDef, onClick }: MenuItemProps) {
  const { derived, actions, features } = useGridAdvanced();
  const apiRef = useGridApiContext();
  const sortModel = useStoreSelector(derived, selectSortModel);
  if (colDef.sortable === false) return null;
  const current = sortModel.find((i) => i.field === colDef.field)?.sort ?? null;
  const set = (sort: 'asc' | 'desc' | null) => (event: React.MouseEvent<HTMLElement>) => {
    const others = features.multiSort ? sortModel.filter((i) => i.field !== colDef.field) : [];
    actions.setSortModel(sort ? [...others, { field: colDef.field, sort }] : others);
    onClick(event);
  };
  const t = (key: 'columnMenuSortAsc' | 'columnMenuSortDesc' | 'columnMenuUnsort') =>
    apiRef.current?.getLocaleText(key) as string;
  return (
    <>
      {current !== 'asc' && (
        <Item icon="arrow-up" label={t('columnMenuSortAsc')} onClick={set('asc')} />
      )}
      {current !== 'desc' && (
        <Item icon="arrow-down" label={t('columnMenuSortDesc')} onClick={set('desc')} />
      )}
      {current !== null && (
        <Item icon="sort-enabled" label={t('columnMenuUnsort')} onClick={set(null)} />
      )}
    </>
  );
}
const selectSortModel = (s: DerivedState) => s.sortModel;
const selectPinnedColumns = (s: DerivedState) => s.pinnedColumns;

/** Pinning and keyboard-accessible column moves in one menu block. */
function PositionMenuItems(props: MenuItemProps) {
  return (
    <>
      <PinMenuItems {...props} />
      <MoveMenuItems {...props} />
    </>
  );
}

/** Row grouping and aggregation in one menu block. */
function GroupingAggregationMenuItems(props: MenuItemProps) {
  return (
    <>
      <GroupingMenuItem {...props} />
      <AggregationMenuItems {...props} />
    </>
  );
}

function PinMenuItems({ colDef, onClick }: MenuItemProps) {
  const { derived, actions, features } = useGridAdvanced();
  const pinned = useStoreSelector(derived, selectPinnedColumns);
  if (!features.columnPinning || (colDef as { pinnable?: boolean }).pinnable === false) return null;
  const side = pinned.left?.includes(colDef.field)
    ? 'left'
    : pinned.right?.includes(colDef.field)
      ? 'right'
      : null;
  const pin = (next: 'left' | 'right' | null) => (event: React.MouseEvent<HTMLElement>) => {
    actions.pinColumn(colDef.field, next);
    onClick(event);
  };
  return (
    <>
      {side !== 'left' && <Item icon="pin" label="Pin to left" onClick={pin('left')} />}
      {side !== 'right' && <Item icon="pin" label="Pin to right" onClick={pin('right')} />}
      {side !== null && <Item icon="unpin" label="Unpin" onClick={pin(null)} />}
    </>
  );
}

const selectGroupingModel = (s: DerivedState) => s.rowGroupingModel;

function GroupingMenuItem({ colDef, onClick }: MenuItemProps) {
  const { derived, actions, features } = useGridAdvanced();
  const model = useStoreSelector(derived, selectGroupingModel);
  if (
    !features.rowGrouping ||
    colDef.field.startsWith('__') ||
    (colDef as { groupable?: boolean }).groupable === false
  ) {
    return null;
  }
  const grouped = model.includes(colDef.field);
  return (
    <Item
      icon={grouped ? 'remove-circle' : 'layers'}
      label={
        grouped
          ? `Stop grouping by ${colDef.headerName ?? colDef.field}`
          : `Group by ${colDef.headerName ?? colDef.field}`
      }
      onClick={(event) => {
        actions.toggleRowGrouping(colDef.field);
        onClick(event);
      }}
    />
  );
}

const selectAggregationModel = (s: DerivedState) => s.aggregationModel;

function AggregationMenuItems({ colDef, onClick }: MenuItemProps) {
  const { derived, actions, features } = useGridAdvanced();
  const model = useStoreSelector(derived, selectAggregationModel);
  if (!features.aggregation || colDef.field.startsWith('__')) return null;
  const names = availableAggregationFunctions(colDef, features.aggregationFunctions);
  if (names.length === 0) return null;
  const current = model[colDef.field];
  return (
    <Box role="group" aria-label="Aggregation">
      <ListSubheader disableSticky className="TectonDataGrid-menuSubheader">
        Aggregation
      </ListSubheader>
      {names.map((name) => (
        <MenuItem
          key={name}
          selected={current === name}
          onClick={(event) => {
            actions.setAggregation(colDef.field, current === name ? null : name);
            onClick(event);
          }}
        >
          <ListItemIcon>
            {current === name ? <Icon name="check" size="small" /> : null}
          </ListItemIcon>
          <ListItemText>{features.aggregationFunctions[name].label ?? name}</ListItemText>
        </MenuItem>
      ))}
    </Box>
  );
}

function MoveMenuItems({ colDef, onClick }: MenuItemProps) {
  const { actions, features } = useGridAdvanced();
  if (!features.columnReorder || colDef.field.startsWith('__') || colDef.disableReorder)
    return null;
  return (
    <>
      <Item
        icon="arrow-left"
        label="Move left"
        onClick={(e) => {
          actions.moveColumn(colDef.field, -1);
          onClick(e);
        }}
      />
      <Item
        icon="arrow-right"
        label="Move right"
        onClick={(e) => {
          actions.moveColumn(colDef.field, 1);
          onClick(e);
        }}
      />
    </>
  );
}

/** Row slot adding treegrid semantics (aria-level/aria-expanded) for hierarchical rows. */
export const HierarchyRowSlot = React.forwardRef<HTMLDivElement, GridRowProps>(
  function HierarchyRowSlot(props, ref) {
    const { ui, derived } = useGridAdvanced();
    const id = props.rowId;
    const metaKey = useStoreSelector(
      derived,
      React.useCallback(
        (s: DerivedState) => {
          const m = s.meta.get(id);
          return m ? `${m.depth}|${m.isGroup ? 1 : 0}` : '';
        },
        [id],
      ),
    );
    const meta = derived.getState().meta.get(id);
    const expanded = useStoreSelector(
      ui,
      React.useCallback((s: UiState) => isExpandedFromMeta(id, meta, s), [id, meta]),
    );
    const [depth, isGroup] = metaKey.split('|');
    const aria = metaKey
      ? {
          'aria-level': Number(depth) + 1,
          ...(isGroup === '1' ? { 'aria-expanded': expanded } : null),
        }
      : null;
    return <GridRow ref={ref} {...props} {...aria} />;
  },
);
