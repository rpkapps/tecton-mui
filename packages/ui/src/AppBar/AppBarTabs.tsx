'use client';
// The app bar's tab strip: MUI `Tabs` with the Tecton behaviour of the `<wc-app-bar>` drop-in.
//
// - Scroll arrows that page by whole tabs and only show while the strip can scroll their way
//   (tabStrip.tsx, useScrollButtonCompensation.ts).
// - The selected tab's close button, rendered next to the tab list rather than inside the tab
//   (TabCloseButton.tsx), for the tabs that have `onClose`.
// - The add (+) button, when `onAdd` is set.
// - Focus stays in the bar when the focused tab, its close button or the add button goes away: it
//   moves to the newly selected tab instead of falling back to the body.
import * as React from 'react';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tabs, { type TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import { createSvgIcon } from '@mui/material/utils';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { sxList } from '../internal/sxList.js';
import { useScrollButtonCompensation } from '../internal/tab-strip/useScrollButtonCompensation.js';
import { TabStripContext, useTabStrip } from '../internal/tab-strip/tabStrip.js';
import { TabStripScrollButton } from './TabStripScrollButton.js';
import { TabCloseButton, TabCloseContext, type TabCloseContextValue } from './TabCloseButton.js';

export interface AppBarTabsProps extends Omit<
  TabsProps,
  | 'value'
  | 'onChange'
  | 'variant'
  | 'scrollButtons'
  | 'allowScrollButtonsMobile'
  | 'orientation'
  | 'centered'
  | 'visibleScrollbar'
  | 'indicatorColor'
  | 'textColor'
  | 'TabIndicatorProps'
  | 'TabScrollButtonProps'
  | 'ScrollButtonComponent'
  | 'size'
  | 'slots'
  | 'slotProps'
> {
  /** The tabs: `AppBarTab` elements. */
  children?: React.ReactNode;
  /** `value` of the selected `AppBarTab`, or `false` for none. */
  value: string | number | false;
  /** Called with the tab's `value` when a tab is selected. */
  onChange?: (event: React.SyntheticEvent, value: string | number) => void;
  /** Shows the add (+) button after the tabs and is called when it is clicked. */
  onAdd?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * The selected tab opens into the content below the bar: the bar's bottom line stops under it,
   * and the tab takes the content's color. `true` uses the page background
   * (`background.default`); a string is the content's color, as `sx`'s `bgcolor` takes it: a theme
   * palette path such as `'background.paper'` or any CSS color.
   * @default false
   */
  attached?: boolean | string;
  /** Props for the strip's own parts. */
  slotProps?: {
    /** Props of the add button (an `IconButton`), for example its `aria-label` (default "Add tab"). */
    addButton?: Partial<IconButtonProps>;
  };
}

// The drop-in's tab strip keeps MUI's own scroll arrows (the theme gives other Tabs Tecton chevrons).
// Same glyphs as MUI's built-in KeyboardArrowLeft / KeyboardArrowRight icons.
const ScrollLeftIcon = /*#__PURE__*/ createSvgIcon(
  <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />,
  'KeyboardArrowLeft',
);
const ScrollRightIcon = /*#__PURE__*/ createSvgIcon(
  <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />,
  'KeyboardArrowRight',
);
const tabsSlots = {
  startScrollButtonIcon: ScrollLeftIcon,
  endScrollButtonIcon: ScrollRightIcon,
  indicator: TabCloseButton,
  // Arrows follow the strip's scroll position, not MUI's IntersectionObserver (see tabStrip.tsx).
  scrollButtons: TabStripScrollButton,
};

// The strip and the add button, filling the bar between the branding and the actions.
const TabsRegion = styled('div', { name: 'TectonAppBarTabs', slot: 'Region' })({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  flexGrow: 1,
  minWidth: 0,
});

// `attached`: the tab strip reaches one border width below the bar, over the bar's bottom line, and
// the selected tab fills that row with the content's color, so the tab opens into the content. The
// other cells are transparent: the line still shows under them. The selectors outrank the theme's
// `<bar class> .MuiTabs-root` height and selected-tab rules whatever the insertion order (bars of
// different tiers share this class but not their root class, so a later bar's theme rules would win
// a tie). MUI's tab row is `.MuiTabs-list` (the theme still names the older
// `.MuiTabs-flexContainer`), so it is stretched here for the tabs to take the strip's full height.
// `bgcolor` resolves theme palette paths, as in any `sx`.
const attachedSx = (color: string) =>
  ({
    '&&&': {
      alignSelf: 'flex-start',
      height: `calc(100% + ${cssVar('border-width-100')})`,
    },
    '&& .MuiTabs-list': { height: '100%' },
    '&& .MuiTab-root.Mui-selected': { bgcolor: color },
  }) as const;

type PendingFocus = { kind: 'close'; key: string; index: number } | { kind: 'add'; count: number };

interface TabInfo {
  key: string;
  value: string | number;
  disabled: boolean;
  onClose?: (event: React.SyntheticEvent) => void;
}

/** The tabs' values and close handlers, read from the children as MUI `Tabs` reads them. */
function readTabs(children: React.ReactNode): TabInfo[] {
  const tabs: TabInfo[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<Record<string, unknown>>(child)) return;
    const { value, disabled, onClose } = child.props;
    if (typeof value !== 'string' && typeof value !== 'number') return;
    tabs.push({
      key: String(value),
      value,
      disabled: Boolean(disabled),
      onClose: onClose as TabInfo['onClose'],
    });
  });
  return tabs;
}

/**
 * The app bar's tab strip: the MUI `Tabs` props for `AppBarTab` children, plus `onAdd` for the add
 * button and `attached` for tabs that open into the content.
 */
const AppBarTabs = React.forwardRef<HTMLDivElement, AppBarTabsProps>(
  function AppBarTabs(props, ref) {
    const { value, onChange, onAdd, attached = false, slotProps, children, sx, ...other } = props;
    const tabs = readTabs(children);
    const selectedKey = value === false || value == null ? null : String(value);
    // One style object per color, so a re-render with the same color keeps its class.
    const attachedColor =
      attached === true ? 'background.default' : attached === false ? null : attached;
    const attachedStyle = React.useMemo(
      () => (attachedColor == null ? null : attachedSx(attachedColor)),
      [attachedColor],
    );

    const tabsRef = React.useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(tabsRef, ref);
    const strip = useTabStrip(tabsRef, selectedKey, tabs.length);
    useScrollButtonCompensation(tabsRef, strip);

    // Latest props, so the handlers below keep stable identities.
    const latest = React.useRef({ onChange, onAdd, tabs });
    React.useEffect(() => {
      latest.current = { onChange, onAdd, tabs };
    });

    const pendingFocus = React.useRef<PendingFocus | null>(null);
    const focusIsInside = () => {
      const root = tabsRef.current?.closest('[data-region="app-bar"]') ?? tabsRef.current;
      const active = root?.ownerDocument.activeElement;
      return !!root && !!active && root.contains(active);
    };

    const handleChange = React.useCallback((event: React.SyntheticEvent, next: string | number) => {
      latest.current.onChange?.(event, next);
    }, []);
    const handleAdd = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      pendingFocus.current = focusIsInside()
        ? { kind: 'add', count: latest.current.tabs.length }
        : null;
      latest.current.onAdd?.(event);
    }, []);
    const close = React.useCallback((event: React.SyntheticEvent, key: string) => {
      event.stopPropagation();
      const index = latest.current.tabs.findIndex((t) => t.key === key);
      pendingFocus.current = focusIsInside() ? { kind: 'close', key, index } : null;
      latest.current.tabs[index]?.onClose?.(event);
    }, []);

    const selected = tabs.find((t) => t.key === selectedKey);
    const closeableId = selected && selected.onClose && !selected.disabled ? selected.key : null;
    const closeContext = React.useMemo<TabCloseContextValue>(
      () => ({ closeableId, onClose: close }),
      [closeableId, close],
    );
    const showAdd = Boolean(onAdd);

    // Keep focus in the bar when the element that had it is removed by the page's update.
    React.useEffect(() => {
      const pending = pendingFocus.current;
      const list = tabsRef.current;
      if (!pending || !list) return;
      const done =
        pending.kind === 'close'
          ? !tabs.some((t) => t.key === pending.key)
          : tabs.length !== pending.count || !showAdd;
      if (!done) return;
      pendingFocus.current = null;
      const doc = list.ownerDocument;
      if (doc.activeElement && doc.activeElement !== doc.body) return;
      const all = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
      const enabled = all.filter((t) => t.getAttribute('aria-disabled') !== 'true');
      const target =
        all.find((t) => t.getAttribute('aria-selected') === 'true') ??
        (pending.kind === 'close'
          ? all[Math.min(Math.max(pending.index, 0), all.length - 1)]
          : undefined) ??
        enabled[0];
      (target && target.getAttribute('aria-disabled') !== 'true' ? target : enabled[0])?.focus();
    });

    const { onClick: onAddButtonClick, ...addButtonProps } = slotProps?.addButton ?? {};

    return (
      <TabStripContext.Provider value={strip}>
        <TabCloseContext.Provider value={closeContext}>
          <TabsRegion data-region="tab-strip">
            <Tabs
              ref={handleRef}
              value={value}
              variant="scrollable"
              scrollButtons
              data-region="tabs"
              onChange={handleChange}
              slots={tabsSlots}
              sx={attachedStyle ? [attachedStyle, ...sxList(sx)] : sx}
              {...other}
            >
              {children}
            </Tabs>
            {showAdd && (
              <IconButton
                aria-label="Add tab"
                {...addButtonProps}
                onClick={(event) => {
                  onAddButtonClick?.(event);
                  if (!event.defaultPrevented) handleAdd(event);
                }}
              >
                <span className="tecton-add-outline" aria-hidden />
              </IconButton>
            )}
          </TabsRegion>
        </TabCloseContext.Provider>
      </TabStripContext.Provider>
    );
  },
);

export default AppBarTabs;
