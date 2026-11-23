'use client';
// The app bar's tab scroll arrows: MUI's scroll button as a cell as wide as the Home tab, driven by
// the shared tab strip (internal/tab-strip).
import * as React from 'react';
import TabScrollButton, { type TabScrollButtonProps } from '@mui/material/TabScrollButton';
import { cssVar } from '../styles/tecton/index.js';
import { useTabStripArrow } from '../internal/tab-strip/tabStrip.js';

/** Same width as the Home (fixed) tab cell, so the start arrow and Home take the same room. */
export const SCROLL_ARROW_WIDTH = 48;

const divider = `1px solid ${cssVar('color-divider-subtle')}`;

/**
 * An arrow's look: a cell as wide as the Home tab with a divider toward the tabs (written for LTR;
 * the RTL style cache mirrors it), or no room at all while it cannot scroll. It grows in over the
 * slide duration when it shows, and goes at once when it hides.
 */
export function arrowSx(shown: boolean, atStart: boolean, duration: number) {
  return {
    width: shown ? SCROLL_ARROW_WIDTH : 0,
    overflow: 'hidden',
    [atStart ? 'borderRight' : 'borderLeft']: shown ? divider : 'none',
    transition:
      shown && duration > 0
        ? `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        : 'none',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  } as const;
}

/**
 * `slots.scrollButtons` of the app bar's Tabs: MUI's scroll button, as wide as the Home tab, shown
 * while the strip can scroll its way (or is sliding to where it can) and taking no room otherwise. A
 * click slides one page, as MUI's does.
 */
export const TabStripScrollButton = React.forwardRef<HTMLButtonElement, TabScrollButtonProps>(
  function TabStripScrollButton(props, ref) {
    const direction = props.direction === 'left' ? 'left' : 'right';
    const { shown, atStart, duration, onClick } = useTabStripArrow(direction);
    const sx = React.useMemo(() => arrowSx(shown, atStart, duration), [shown, atStart, duration]);
    return <TabScrollButton ref={ref} {...props} sx={sx} disabled={!shown} onClick={onClick} />;
  },
);
