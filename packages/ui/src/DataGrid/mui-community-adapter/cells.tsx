'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { GridRowId } from '@mui/x-data-grid';
import Icon from '../../Icon/Icon.js';
import { useStoreSelector } from '../core/store.js';
import { useGridAdvanced, type DerivedState, type UiState } from '../core/context.js';
import { isExpandedFromMeta } from '../core/expansion.js';
import muiVisuallyHidden from '@mui/utils/visuallyHidden';

// MUI's own screen-reader-only style (includes margin/padding/border resets).
const visuallyHidden = muiVisuallyHidden as React.CSSProperties;

/** Indentation + expand toggle + label + child count for group rows and tree-data rows. */
export const GroupingCell = React.memo(function GroupingCell({
  id,
  label,
  showOnlyForField,
}: {
  id: GridRowId;
  label: React.ReactNode;
  /** Multiple grouping columns: only render the toggle for groups of this field. */
  showOnlyForField?: string;
}) {
  const { ui, derived, actions } = useGridAdvanced();
  const metaKey = useStoreSelector(
    derived,
    React.useCallback(
      (s: DerivedState) => {
        const m = s.meta.get(id);
        return m
          ? `${m.depth}|${m.childrenCount}|${m.isGroup ? 1 : 0}|${m.groupingField ?? ''}`
          : '';
      },
      [id],
    ),
  );
  const [depthStr, countStr, isGroupStr, groupingField] = metaKey.split('|');
  const depth = Number(depthStr) || 0;
  const isGroup = isGroupStr === '1';
  const metaRef = derived.getState().meta.get(id);
  const expanded = useStoreSelector(
    ui,
    React.useCallback((s: UiState) => isExpandedFromMeta(id, metaRef, s), [id, metaRef]),
  );
  if (showOnlyForField !== undefined && (!isGroup || groupingField !== showOnlyForField)) {
    return null;
  }
  const onToggle = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    actions.toggleExpansion(id);
  };
  return (
    <Box
      className="TectonDataGrid-groupingCell"
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        gap: 0.5,
        pl: showOnlyForField !== undefined ? 0 : depth * 2,
      }}
    >
      {isGroup ? (
        <IconButton
          size="small"
          tabIndex={-1}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
          onClick={onToggle}
          className="TectonDataGrid-groupingToggle"
        >
          <Icon name={expanded ? 'chevron-down-small' : 'chevron-right-small'} />
        </IconButton>
      ) : (
        <Box component="span" sx={{ width: 28, flexShrink: 0 }} />
      )}
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {label}
      </Box>
      {isGroup && Number(countStr) > 0 ? (
        <Box component="span" sx={{ color: 'text.secondary', flexShrink: 0 }}>
          ({countStr})
        </Box>
      ) : null}
    </Box>
  );
});

export const DetailPanelToggleCell = React.memo(function DetailPanelToggleCell({
  id,
}: {
  id: GridRowId;
}) {
  const { ui, actions } = useGridAdvanced();
  const expanded = useStoreSelector(
    ui,
    React.useCallback((s: UiState) => s.detailExpanded.has(id), [id]),
  );
  return (
    <IconButton
      size="small"
      tabIndex={-1}
      aria-label={expanded ? 'Hide details' : 'Show details'}
      aria-expanded={expanded}
      onClick={(event) => {
        event.stopPropagation();
        actions.toggleDetailPanel(id);
      }}
      className="TectonDataGrid-detailPanelToggle"
    >
      <Icon name={expanded ? 'chevron-up-small' : 'chevron-down-small'} />
    </IconButton>
  );
});

/** Content of a detail row; it spans every column and stays aligned to the viewport. */
export const DetailPanelContent = React.memo(function DetailPanelContent({
  masterId,
  row,
}: {
  masterId: GridRowId;
  row: object;
}) {
  const { actions } = useGridAdvanced();
  return (
    <Box
      className="TectonDataGrid-detailPanel"
      role="region"
      aria-label="Row details"
      sx={{
        position: 'sticky',
        left: 0,
        flex: '1 1 auto',
        textAlign: 'start',
        width: '100%',
        minWidth: 0,
        alignSelf: 'stretch',
        overflow: 'auto',
        py: 1,
      }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {actions.getDetailPanelContent(masterId, row)}
    </Box>
  );
});

export const RowReorderHandle = React.memo(function RowReorderHandle({ id }: { id: GridRowId }) {
  const { derived, actions } = useGridAdvanced();
  const disabled = useStoreSelector(derived, selectReorderDisabled);
  return (
    <IconButton
      size="small"
      disabled={disabled}
      className="TectonDataGrid-rowReorderHandle"
      data-row-reorder-handle={String(id)}
      aria-label="Reorder row (Alt+Arrow keys)"
      sx={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
      onKeyDown={(event) => {
        if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault();
          event.stopPropagation();
          actions.moveRow(id, event.key === 'ArrowUp' ? -1 : 1);
        }
      }}
    >
      <Icon name="drag-indicator" />
    </IconButton>
  );
});
const selectReorderDisabled = (s: DerivedState) => s.sortingDisabledForReorder;

/** Title with the aggregation function label underneath (aggregated columns). */
export function AggregatedHeader({ title, fn }: { title: React.ReactNode; fn: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
      <Box
        className="MuiDataGrid-columnHeaderTitle"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {title}
      </Box>
      <Box component="span" sx={{ fontSize: '0.75em', color: 'text.secondary' }}>
        {fn}
      </Box>
    </Box>
  );
}

export { visuallyHidden };
