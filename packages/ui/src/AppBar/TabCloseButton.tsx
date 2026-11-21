'use client';
// The active tab's close button. The drop-in renders it inside the tab, which nests a button in a
// `role="tab"` element (axe `nested-interactive`: assistive technologies cannot reach a control
// inside a tab reliably). Here the tab keeps an empty slot of the button's size, so the tab looks and
// measures the same, and the button is rendered next to the tab list, inside the Tabs scroller, laid
// over that slot. Inside the scroller it scrolls and clips with the tabs.
//
// It is mounted through the Tabs `indicator` slot, the one element MUI renders inside the scroller
// next to the list (the Tecton theme hides the app bar's indicator). Before Tabs has mounted, MUI
// renders the indicator inside the selected tab: the button stays out until it sits in the scroller.
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import { cssVar } from '../styles/tecton/index.js';

/** Marks the empty slot, inside the active tab, that the close button is laid over. */
export const CLOSE_SLOT_ATTRIBUTE = 'data-close-slot';

export interface TabCloseContextValue {
  /** `id` of the active tab when it shows a close button, else `null`. */
  closeableId: string | null;
  /** Closes a tab (stable identity). */
  onClose: (event: React.SyntheticEvent, id: string) => void;
}

export const TabCloseContext = React.createContext<TabCloseContextValue>({
  closeableId: null,
  onClose: () => {},
});

const useEnhancedEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// Same padding as the theme gives an IconButton inside an app bar tab (`.MuiTab-root
// .MuiIconButton-root`), which no longer matches now that the button sits next to the tab.
const buttonSx = { position: 'absolute', padding: cssVar('space-50') } as const;
const anchorStyle = { display: 'none' } as const;

interface Position {
  left: number;
  top: number;
}

/** Places the button over the slot, in the scroller's scrolled content coordinates. */
function measure(scroller: HTMLElement): Position | null {
  const slot = scroller.querySelector<HTMLElement>(
    `[role="tab"][aria-selected="true"] [${CLOSE_SLOT_ATTRIBUTE}]`,
  );
  if (!slot) return null;
  const s = slot.getBoundingClientRect();
  const c = scroller.getBoundingClientRect();
  return {
    left: s.left - c.left - scroller.clientLeft + scroller.scrollLeft,
    top: s.top - c.top - scroller.clientTop + scroller.scrollTop,
  };
}

/** `slots.indicator` of the app bar's Tabs: renders the active tab's close button. */
export function TabCloseButton() {
  const { closeableId, onClose } = React.useContext(TabCloseContext);
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const [position, setPosition] = React.useState<Position | null>(null);

  useEnhancedEffect(() => {
    const anchor = anchorRef.current;
    const scroller = anchor?.parentElement;
    // Pre-mount, MUI renders the indicator inside the selected tab: render no button there.
    if (!anchor || !scroller || anchor.closest('[role="tab"]') || closeableId == null) {
      setPosition(null);
      return undefined;
    }
    const update = () => {
      const next = measure(scroller);
      setPosition((prev) =>
        prev && next && prev.left === next.left && prev.top === next.top ? prev : next,
      );
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    // Tab widths change with fonts, labels and tags; any of them moves the slot.
    const observer = new ResizeObserver(update);
    Array.from(scroller.querySelectorAll('[role="tablist"], [role="tab"]')).forEach((el) =>
      observer.observe(el),
    );
    return () => observer.disconnect();
  });

  return (
    <>
      <span ref={anchorRef} style={anchorStyle} />
      {closeableId != null && position && (
        <IconButton
          // A new button per tab, so it leaves with its tab (and focus returns to the tab list).
          key={closeableId}
          aria-label="close tab"
          size="small"
          onClick={(event) => onClose(event, closeableId)}
          sx={buttonSx}
          style={{ left: position.left, top: position.top }}
        >
          <span className="tecton-close-outline tecton-appbar-icon" aria-hidden />
        </IconButton>
      )}
    </>
  );
}
