'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import {
  useCollapsingItems,
  type OverflowSlotProps,
} from '../internal/overflow/useCollapsingItems.js';
import { headingClasses } from './Heading.js';
import { useHeadingPart } from './HeadingContext.js';

export interface HeadingActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The actions: buttons, icon buttons, a `HeadingSearch`, selects, a toggle button group, and
   * vertical `Divider`s (`orientation="vertical" flexItem emphasis="subtle"`) between groups of
   * them. Put the primary action last: when the heading is too narrow, the actions collapse into
   * the overflow button first to last, and the last one stays the longest.
   */
  children?: React.ReactNode;
  /** Props for the overflow button and its tray. */
  slotProps?: OverflowSlotProps;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const ActionsRoot = styled('div', { name: 'TectonHeading', slot: 'Actions' })({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  // Figma: the heading's actions sit space-200 apart.
  gap: cssVar('space-200'),
  // At the end of the row, whatever comes before it.
  marginLeft: 'auto',
});

const overflowClasses = {
  overflowButton: headingClasses.overflowButton,
  overflowTray: headingClasses.overflowTray,
};

/**
 * The heading's actions, at the end of its row. In a `Heading` that is too narrow, they collapse
 * into an overflow (⋮) button, first to last; its tray shows them as they are.
 */
const HeadingActions = React.forwardRef<HTMLDivElement, HeadingActionsProps>(
  function HeadingActions(props, ref) {
    const { children, slotProps, className, ...other } = props;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(rootRef, ref);

    // The heading measures the actions (after render, through the overflow row's `measure`) and
    // says how many collapse.
    const heading = useHeadingPart('actions', rootRef, () => overflow.measure());
    const measuring = heading?.layout.measuring ?? false;
    const overflow = useCollapsingItems({
      children,
      collapsed: heading && !measuring ? heading.layout.actions : 0,
      measuring,
      rootRef,
      slotProps,
      classes: overflowClasses,
    });

    // An action pinned or unpinned changes what can collapse: share the row again.
    const requestMeasure = heading?.requestMeasure;
    useEnhancedEffect(() => {
      requestMeasure?.();
    }, [overflow.pinnedKeys, requestMeasure]);

    return (
      <ActionsRoot
        ref={handleRef}
        data-heading-part="actions"
        className={clsx(headingClasses.actions, className)}
        {...other}
      >
        {overflow.content}
      </ActionsRoot>
    );
  },
);

export default HeadingActions;
