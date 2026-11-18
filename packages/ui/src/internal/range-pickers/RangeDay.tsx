'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import type { PickerValidDate } from '@mui/x-date-pickers/models';
import { RangeDayContext, useRequiredContext } from './contexts.js';
import { DAY_FLAG, useDayFlags } from './highlightStore.js';
import type { RangeDayState } from './models.js';

export const dateRangePickerDayClasses = {
  root: 'TectonDateRangePickerDay-root',
  rangeStart: 'TectonDateRangePickerDay-rangeStart',
  rangeEnd: 'TectonDateRangePickerDay-rangeEnd',
  inRange: 'TectonDateRangePickerDay-inRange',
  startBand: 'TectonDateRangePickerDay-startBand',
  endBand: 'TectonDateRangePickerDay-endBand',
  previewStart: 'TectonDateRangePickerDay-previewStart',
  previewEnd: 'TectonDateRangePickerDay-previewEnd',
  inPreview: 'TectonDateRangePickerDay-inPreview',
  previewStartBand: 'TectonDateRangePickerDay-previewStartBand',
  previewEndBand: 'TectonDateRangePickerDay-previewEndBand',
  rowStart: 'TectonDateRangePickerDay-rowStart',
  rowEnd: 'TectonDateRangePickerDay-rowEnd',
} as const;

const c = dateRangePickerDayClasses;
const PILL = '9999px';

/** Selector for a flag on the first (or last) cell of a week row, plus its pseudo-element. */
function rowStart(flag: string, pseudo: string) {
  return `&.${c.rowStart}.${flag}::${pseudo}, &:first-of-type.${flag}::${pseudo}`;
}
function rowEnd(flag: string, pseudo: string) {
  return `&.${c.rowEnd}.${flag}::${pseudo}, &:last-of-type.${flag}::${pseudo}`;
}

const RangeDayRoot = styled('div', { name: 'TectonDateRangePickerDay', slot: 'Root' })(({
  theme,
}) => {
  const palette = (theme.vars || theme).palette;
  const band = theme.alpha(palette.primary.main, palette.action.selectedOpacity);
  const dashed = `2px dashed ${palette.divider}`;
  const bleed = 'calc(-1 * var(--TectonDateRangePickerDay-bleed, 0px))';
  return {
    position: 'relative',
    display: 'flex',
    '& > *': { position: 'relative', zIndex: 1 },
    '&::before, &::after': {
      content: '""',
      display: 'none',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: bleed,
      right: bleed,
      boxSizing: 'border-box',
      pointerEvents: 'none',
    },
    // Selected range band.
    [`&.${c.inRange}::before, &.${c.startBand}::before, &.${c.endBand}::before`]: {
      display: 'block',
      backgroundColor: band,
    },
    [`&.${c.startBand}::before`]: { left: '50%' },
    [`&.${c.endBand}::before`]: { right: '50%' },
    [`${rowStart(c.inRange, 'before')}, ${rowStart(c.endBand, 'before')}`]: {
      left: 0,
      borderTopLeftRadius: PILL,
      borderBottomLeftRadius: PILL,
    },
    [`${rowEnd(c.inRange, 'before')}, ${rowEnd(c.startBand, 'before')}`]: {
      right: 0,
      borderTopRightRadius: PILL,
      borderBottomRightRadius: PILL,
    },
    // Hover preview outline.
    [`&.${c.inPreview}::after, &.${c.previewStart}::after, &.${c.previewEnd}::after`]: {
      display: 'block',
      borderTop: dashed,
      borderBottom: dashed,
    },
    [`&.${c.previewStart}::after`]: {
      left: 0,
      borderLeft: dashed,
      borderTopLeftRadius: PILL,
      borderBottomLeftRadius: PILL,
    },
    [`&.${c.previewEnd}::after`]: {
      right: 0,
      borderRight: dashed,
      borderTopRightRadius: PILL,
      borderBottomRightRadius: PILL,
    },
    [`${rowStart(c.inPreview, 'after')}, ${rowStart(c.previewEnd, 'after')}`]: {
      left: 0,
      borderLeft: dashed,
      borderTopLeftRadius: PILL,
      borderBottomLeftRadius: PILL,
    },
    [`${rowEnd(c.inPreview, 'after')}, ${rowEnd(c.previewStart, 'after')}`]: {
      right: 0,
      borderRight: dashed,
      borderTopRightRadius: PILL,
      borderBottomRightRadius: PILL,
    },
  };
});

function has(flags: number, flag: number) {
  return (flags & flag) !== 0;
}

/**
 * Day slot of the range calendar. It wraps the Community `PickerDay` (so theme overrides for
 * `MuiPickerDay` apply) and reads its range highlight from the external store, so a hover only
 * re-renders the cells whose highlight changes. Memoized: DayCalendar passes stable callbacks and
 * primitive props, so parent re-renders do not reach unchanged days.
 */
function RangeDayComponent(props: PickerDayProps) {
  const ctx = useRequiredContext(RangeDayContext, 'RangeDay');
  const {
    day,
    outsideCurrentMonth,
    showDaysOutsideCurrentMonth,
    isFirstVisibleCell,
    isLastVisibleCell,
    onMouseEnter,
    onFocus,
  } = props;
  const isFiller = Boolean(outsideCurrentMonth && !showDaysOutsideCurrentMonth);
  const key = React.useMemo(() => (isFiller ? null : ctx.getKey(day)), [ctx, day, isFiller]);
  const flags = useDayFlags(ctx.store, key);

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, hovered: PickerValidDate) => {
      ctx.onHover(hovered);
      onMouseEnter?.(event, hovered);
    },
    [ctx, onMouseEnter],
  );
  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLButtonElement>, focused: PickerValidDate) => {
      ctx.onHover(focused);
      onFocus?.(event, focused);
    },
    [ctx, onFocus],
  );

  const isStart = has(flags, DAY_FLAG.start);
  const isEnd = has(flags, DAY_FLAG.end);
  const isInRange = has(flags, DAY_FLAG.inRange);
  const rangeState = React.useMemo<RangeDayState>(
    () => ({
      isStart,
      isEnd,
      isInRange,
      isPreviewStart: has(flags, DAY_FLAG.previewStart),
      isPreviewEnd: has(flags, DAY_FLAG.previewEnd),
      isInPreview: has(flags, DAY_FLAG.inPreview),
    }),
    [flags, isStart, isEnd, isInRange],
  );

  const Day = (ctx.Day ?? PickerDay) as React.ElementType;
  const custom = ctx.Day ? { rangeState } : undefined;

  return (
    <RangeDayRoot
      role="presentation"
      className={clsx(c.root, {
        [c.rangeStart]: isStart,
        [c.rangeEnd]: isEnd,
        [c.inRange]: isInRange,
        [c.startBand]: has(flags, DAY_FLAG.startBand),
        [c.endBand]: has(flags, DAY_FLAG.endBand),
        [c.previewStart]: rangeState.isPreviewStart,
        [c.previewEnd]: rangeState.isPreviewEnd,
        [c.inPreview]: rangeState.isInPreview,
        [c.previewStartBand]: has(flags, DAY_FLAG.previewStartBand),
        [c.previewEndBand]: has(flags, DAY_FLAG.previewEndBand),
        [c.rowStart]: isFirstVisibleCell,
        [c.rowEnd]: isLastVisibleCell,
      })}
    >
      <Day
        {...ctx.dayProps}
        {...props}
        {...custom}
        selected={isStart || isEnd}
        aria-selected={isStart || isEnd || isInRange}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
      />
    </RangeDayRoot>
  );
}

export const RangeDay = React.memo(RangeDayComponent);
