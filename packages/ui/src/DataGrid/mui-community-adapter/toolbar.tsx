'use client';
// Toolbar pieces that read the wrapper's filter model. The wrapper filters rows itself and hands
// the Community grid an empty filter model (the MIT grid accepts one condition at most), so
// Community's own active-filter count is always 0. `FilterPanelTrigger` (exported under the
// Community name) passes the real count to its `render` / `className` functions, and the default
// toolbar (`showToolbar`) is rebuilt from the public toolbar parts around it, matching the
// structure of the Community default toolbar.
import * as React from 'react';
import useId from '@mui/utils/useId';
import Divider from '@mui/material/Divider';
import {
  ColumnsPanelTrigger,
  ExportCsv,
  ExportPrint,
  FilterPanelTrigger as CommunityFilterPanelTrigger,
  GridMenu,
  GridToolbarQuickFilter,
  Toolbar,
  ToolbarButton,
  useGridApiContext,
  useGridRootProps,
  type FilterPanelState,
  type FilterPanelTriggerProps,
  type GridCsvExportOptions,
  type GridPrintExportOptions,
  type GridToolbarQuickFilterProps,
  type ToolbarProps,
} from '@mui/x-data-grid';
import { GridAdvancedContext, type DerivedState } from '../core/context.js';
import { useStoreSelector, Store } from '../core/store.js';

const EMPTY_STORE = new Store<DerivedState | null>(null);
const selectCount = (s: DerivedState | null) =>
  s ? Object.values(s.filterCounts).reduce((sum, n) => sum + n, 0) : -1;

/** Active filter conditions of the wrapper's model (header filters included); -1 outside it. */
function useActiveFilterCount(): number {
  const ctx = React.useContext(GridAdvancedContext);
  return useStoreSelector((ctx?.derived ?? EMPTY_STORE) as Store<DerivedState | null>, selectCount);
}

/**
 * Opens the filter panel. Same props as the Community `FilterPanelTrigger`; its `render` and
 * `className` functions receive the number of active filter conditions in `filterCount`.
 */
/** Props the `render` function receives: spread them on the button it renders. */
export type FilterPanelTriggerRenderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> & { ref?: React.Ref<HTMLButtonElement> };

export type TectonFilterPanelTriggerProps = Omit<FilterPanelTriggerProps, 'render'> & {
  /** An element to render, or a function of the trigger props and the panel state. */
  render?:
    | React.ReactElement
    | ((props: FilterPanelTriggerRenderProps, state: FilterPanelState) => React.ReactElement);
};

export const FilterPanelTrigger = React.forwardRef<
  HTMLButtonElement,
  TectonFilterPanelTriggerProps
>(function FilterPanelTrigger({ render, className, ...other }, ref) {
  const count = useActiveFilterCount();
  const withCount = (state: FilterPanelState): FilterPanelState =>
    count < 0 ? state : { ...state, filterCount: count };
  return (
    <CommunityFilterPanelTrigger
      ref={ref}
      {...other}
      render={
        (typeof render === 'function'
          ? (props: object, state: FilterPanelState) =>
              render(props as FilterPanelTriggerRenderProps, withCount(state))
          : render) as FilterPanelTriggerProps['render']
      }
      className={
        typeof className === 'function' ? (state) => className(withCount(state)) : className
      }
    />
  );
});

export interface DefaultToolbarProps extends Omit<ToolbarProps, 'children'> {
  /** @default true */
  showQuickFilter?: boolean;
  quickFilterProps?: GridToolbarQuickFilterProps;
  csvOptions?: GridCsvExportOptions & { disableToolbarButton?: boolean };
  printOptions?: GridPrintExportOptions & { disableToolbarButton?: boolean };
  /** Extra items for the export menu; receives a function that closes the menu. */
  additionalExportMenuItems?: (onMenuItemClick: () => void) => React.ReactNode;
  /** Replaces the columns and filters buttons. */
  mainControls?: React.ReactNode;
}

/** The toolbar `showToolbar` renders (same controls and `slotProps.toolbar` as Community's). */
export function DefaultToolbar(props: DefaultToolbarProps) {
  const {
    showQuickFilter = true,
    quickFilterProps,
    csvOptions,
    printOptions,
    additionalExportMenuItems,
    mainControls,
    ...other
  } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const slots = rootProps.slots;
  const [exportOpen, setExportOpen] = React.useState(false);
  const exportTriggerRef = React.useRef<HTMLButtonElement>(null);
  const exportMenuId = useId();
  const exportTriggerId = useId();
  const t = (key: string) => apiRef.current.getLocaleText(key as never) as string;
  const showExport =
    !csvOptions?.disableToolbarButton ||
    !printOptions?.disableToolbarButton ||
    !!additionalExportMenuItems;
  const closeExport = () => setExportOpen(false);
  const divider = (
    <Divider
      orientation="vertical"
      className="MuiDataGrid-toolbarDivider"
      sx={{ height: '50%', mx: 0.5 }}
    />
  );
  return (
    <Toolbar {...other}>
      {rootProps.label ? (
        <span
          className="MuiDataGrid-toolbarLabel"
          style={{
            flex: 1,
            margin: '0 4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rootProps.label}
        </span>
      ) : null}
      {mainControls ?? (
        <>
          {!rootProps.disableColumnSelector && (
            <slots.baseTooltip title={t('toolbarColumns')}>
              <ColumnsPanelTrigger render={<ToolbarButton />}>
                <slots.columnSelectorIcon fontSize="small" />
              </ColumnsPanelTrigger>
            </slots.baseTooltip>
          )}
          {!rootProps.disableColumnFilter && (
            <slots.baseTooltip title={t('toolbarFilters')}>
              <FilterPanelTrigger
                render={(triggerProps, state) => (
                  // Tecton paints a `primary` icon button as a filled circle; the dot badge alone
                  // marks active filters.
                  <ToolbarButton {...triggerProps}>
                    <slots.baseBadge badgeContent={state.filterCount} color="primary" variant="dot">
                      <slots.openFilterButtonIcon fontSize="small" />
                    </slots.baseBadge>
                  </ToolbarButton>
                )}
              />
            </slots.baseTooltip>
          )}
        </>
      )}
      {showExport && (!rootProps.disableColumnFilter || !rootProps.disableColumnSelector)
        ? divider
        : null}
      {showExport ? (
        <>
          <slots.baseTooltip title={t('toolbarExport')} disableInteractive={exportOpen}>
            <ToolbarButton
              ref={exportTriggerRef}
              id={exportTriggerId}
              aria-controls={exportMenuId}
              aria-haspopup="true"
              aria-expanded={exportOpen ? 'true' : undefined}
              onClick={() => setExportOpen(!exportOpen)}
            >
              <slots.exportIcon fontSize="small" />
            </ToolbarButton>
          </slots.baseTooltip>
          <GridMenu
            target={exportTriggerRef.current}
            open={exportOpen}
            onClose={closeExport}
            position="bottom-end"
          >
            <slots.baseMenuList
              id={exportMenuId}
              aria-labelledby={exportTriggerId}
              autoFocusItem
              {...rootProps.slotProps?.baseMenuList}
            >
              {!printOptions?.disableToolbarButton && (
                <ExportPrint
                  render={<slots.baseMenuItem {...rootProps.slotProps?.baseMenuItem} />}
                  options={printOptions}
                  onClick={closeExport}
                >
                  {t('toolbarExportPrint')}
                </ExportPrint>
              )}
              {!csvOptions?.disableToolbarButton && (
                <ExportCsv
                  render={<slots.baseMenuItem {...rootProps.slotProps?.baseMenuItem} />}
                  options={csvOptions}
                  onClick={closeExport}
                >
                  {t('toolbarExportCSV')}
                </ExportCsv>
              )}
              {additionalExportMenuItems?.(closeExport)}
            </slots.baseMenuList>
          </GridMenu>
        </>
      ) : null}
      {showQuickFilter ? (
        <>
          {divider}
          <GridToolbarQuickFilter {...quickFilterProps} />
        </>
      ) : null}
    </Toolbar>
  );
}
