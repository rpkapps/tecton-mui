'use client';
// The Tecton app bar layout: branding, icon-only fixed tabs, closeable tabs, the add button and an
// actions region. React port of the Tecton drop-in `<wc-app-bar>` (Tecton Storybook, Drop-ins /
// App Bar): the same MUI components, props, regions and `data-*` markers, so the Tecton theme's
// `MuiAppBar` overrides style it exactly as they style the drop-in. The page owns the data: each
// interaction calls back, and the bar renders whatever `tabs` and `activeTab` it is given.
//
// Accessibility differences from the drop-in (looks and pointer behaviour are unchanged):
// - Delete or Backspace on the active closeable tab closes it, as its close button does
//   (`aria-keyshortcuts` announces it).
// - When the focused tab, its close button or the add button goes away (the tab was closed, or
//   `maxTabs` was reached), focus moves to the active tab instead of falling back to the body.
// - The close button is not nested in its tab (see TabCloseButton.tsx), and only the Tabs list has
//   `role="tablist"` (the drop-in also gives it to the Tabs root, around the list).
import * as React from 'react';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { createSvgIcon } from '@mui/material/utils';
import { cssVar } from '../styles/tecton/index.js';
import type { TectonIconName } from '../styles/tecton/index.js';
import { useScrollButtonCompensation } from './useScrollButtonCompensation.js';
import { TabStripContext, TabStripScrollButton, useTabStrip } from './tabStrip.js';
import {
  CLOSE_SLOT_ATTRIBUTE,
  TabCloseButton,
  TabCloseContext,
  type TabCloseContextValue,
} from './TabCloseButton.js';

/** A Tecton icon name without its `-outline` / `-filled` suffix, for example `project`. */
export type AppBarIconName = TectonIconName | (string & {});

/** An icon-only tab rendered before the closeable tabs (primary tier only), such as Home. */
export interface AppBarFixedTab {
  /** Identifier passed to `onTabSelect` and matched against `activeTab`. */
  id: string;
  /** Accessible name of the tab. Defaults to `id`. */
  label?: string;
  /** Tecton icon name without its suffix; the active tab shows the filled variant. */
  icon?: AppBarIconName;
  /** If `true`, the tab is greyed out and cannot be selected. */
  disabled?: boolean;
}

/** A tab with an icon, a label and optional tags. */
export interface AppBarTab {
  /** Identifier passed to the callbacks and matched against `activeTab`. */
  id: string;
  /** Text of the tab. */
  label?: string;
  /** Tecton icon name without its suffix; the active tab shows the filled variant. */
  icon?: AppBarIconName;
  /** If `false`, the tab has no close button. Default `true`. */
  closeable?: boolean;
  /** If `true`, the tab is greyed out and cannot be selected. */
  disabled?: boolean;
  /** Small chips shown after the label. */
  tags?: readonly string[];
}

/** The Tecton app bar's own props (the MUI AppBar root props apply as well). */
export interface AppBarNavigationProps {
  /**
   * Text shown next to the logo in the branding region (primary tier).
   * @default 'APP'
   */
  appName?: string;
  /**
   * Tecton icon for the branding region, including its suffix (for example `apps-filled`). Takes
   * precedence over `logoSrc`. With neither, a placeholder square shows.
   */
  logo?: string;
  /** Image URL for the branding region, used when `logo` is not set. */
  logoSrc?: string;
  /** Icon-only tabs rendered before the closeable tabs, in order. Primary tier only. */
  fixedTabs?: readonly AppBarFixedTab[];
  /** Tabs with an icon, a label and optional tags, in order. */
  tabs?: readonly AppBarTab[];
  /** `id` of the selected tab, fixed or not. */
  activeTab?: string | null;
  /** Hides the add button once `tabs.length` reaches this value. `0` always hides it. */
  maxTabs?: number | null;
  /**
   * If `true`, the add button is hidden.
   * @default false
   */
  disableTabAdd?: boolean;
  /** Called with the tab's `id` when a tab is selected. */
  onTabSelect?: (id: string, event: React.SyntheticEvent) => void;
  /**
   * Called with the tab's `id` when the active tab's close button is clicked, or when Delete or
   * Backspace is pressed on it.
   */
  onTabClose?: (id: string, event: React.SyntheticEvent) => void;
  /** Called when the add (+) button is clicked. */
  onTabAdd?: (event: React.SyntheticEvent) => void;
}

const EMPTY: readonly never[] = [];

interface AppBarRootElementProps extends React.HTMLAttributes<HTMLElement> {
  tier?: unknown;
  productColor?: unknown;
  /** The consumer's `component`, rendered in place of the default `header`. */
  rootComponent?: React.ElementType;
}

/**
 * The bar's root element. `tier` and `productColor` are Tecton props that the `MuiAppBar` theme
 * variants match, so they still go to the MUI AppBar, but the MUI AppBar passes every prop it does
 * not know on to its root element: `tier` would render there as an invalid attribute and React
 * would warn about `productColor`. They stop here, after the theme has matched them.
 */
const AppBarRootElement = React.forwardRef<HTMLElement, AppBarRootElementProps>(
  function AppBarRootElement(
    { tier: _tier, productColor: _productColor, rootComponent = 'header', ...other },
    ref,
  ) {
    const Root = rootComponent as React.ElementType;
    return <Root ref={ref} {...other} />;
  },
);

// Module-level styled parts (stable identities).
const BrandingRegion = styled(Box)({
  borderRight: `1px solid ${cssVar('color-divider-subtle')}`,
  color: cssVar('color-action-tertiary-text'),
});
const BrandingLockup = styled(Box)({ borderRadius: cssVar('radius-round') });
const LogoPlaceholder = styled(Box)({
  borderRadius: cssVar('radius-25'),
  backgroundColor: cssVar('color-accent-pink-fill'),
});
/** Room the close button takes on the active tab; inactive closeable tabs keep it empty. */
const CLOSE_SLOT_SIZE = `calc(${cssVar('icon-size-100')} + 2 * ${cssVar('space-50')})`;

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
const closeSlotProps = { [CLOSE_SLOT_ATTRIBUTE]: '' };

const toolbarSx = (primary: boolean) => ({
  '&&&': {
    paddingLeft: 0,
    paddingRight: 0,
    gap: primary ? cssVar('space-300') : cssVar('space-100'),
  },
});
const toolbarSxPrimary = toolbarSx(true);
const toolbarSxSecondary = toolbarSx(false);
const leftSx = {
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexGrow: 1,
  height: '100%',
  minWidth: 0,
} as const;
const brandingSx = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  flexShrink: 0,
  paddingLeft: cssVar('space-150'),
  paddingRight: cssVar('space-150'),
} as const;
const lockupSx = { display: 'flex', alignItems: 'center', padding: cssVar('space-75') } as const;
const brandingContainerSx = {
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-25'),
} as const;
const logoSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: cssVar('icon-size-150'),
  height: cssVar('icon-size-150'),
} as const;
const logoImageSx = { width: '100%', height: '100%', display: 'block' } as const;
const placeholderSx = { width: 14, height: 14, display: 'block' } as const;
const brandingNameSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: cssVar('space-400'),
} as const;
const fixedTabSx = { minWidth: 48, width: 48 } as const;
const tabSx = { flexDirection: 'row' } as const;
const tabLabelSx = {
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-100'),
  paddingRight: cssVar('space-100'),
} as const;
const closeSlotSx = { flexShrink: 0, width: CLOSE_SLOT_SIZE, height: CLOSE_SLOT_SIZE } as const;
const actionsSx = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-100'),
  height: '100%',
  flexShrink: 0,
  paddingTop: cssVar('space-100'),
  paddingBottom: cssVar('space-100'),
  paddingLeft: cssVar('space-200'),
  paddingRight: cssVar('space-200'),
} as const;

const iconClass = (icon: string, active: boolean) =>
  `tecton-appbar-icon tecton-${icon}-${active ? 'filled' : 'outline'}`;

type PendingFocus = { kind: 'close'; id: string; index: number } | { kind: 'add'; count: number };

/**
 * Props of the layout: the MUI AppBar props and the navigation props. `children` render in the
 * actions region at the right end of the bar (the drop-in's `actions` slot).
 */
export type AppBarNavigationLayoutProps = MuiAppBarProps & AppBarNavigationProps;

/** Renders the Tecton app bar layout (exported as `AppBar`). */
export const AppBarNavigation = React.forwardRef<HTMLElement, AppBarNavigationLayoutProps>(
  function AppBarNavigation(props, ref) {
    const {
      appName = 'APP',
      logo = null,
      logoSrc = null,
      fixedTabs = EMPTY,
      tabs = EMPTY,
      activeTab = null,
      maxTabs = null,
      disableTabAdd = false,
      children,
      onTabSelect,
      onTabClose,
      onTabAdd,
      tier = 'primary',
      position = 'static',
      component,
      ...other
    } = props;
    const primary = tier === 'primary';
    const tabsRef = React.useRef<HTMLDivElement>(null);
    const strip = useTabStrip(tabsRef, activeTab, tabs.length);
    useScrollButtonCompensation(tabsRef, strip);

    // Latest callbacks, so the handlers below keep stable identities.
    const latest = React.useRef({ onTabSelect, onTabClose, onTabAdd, tabs });
    React.useEffect(() => {
      latest.current = { onTabSelect, onTabClose, onTabAdd, tabs };
    });

    const pendingFocus = React.useRef<PendingFocus | null>(null);
    const focusIsInside = () => {
      const root = tabsRef.current?.closest('[data-region="app-bar"]');
      const active = root?.ownerDocument.activeElement;
      return !!root && !!active && root.contains(active);
    };

    const handleChange = React.useCallback((event: React.SyntheticEvent, id: string) => {
      latest.current.onTabSelect?.(id, event);
    }, []);
    const handleAdd = React.useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      pendingFocus.current = focusIsInside()
        ? { kind: 'add', count: latest.current.tabs.length }
        : null;
      latest.current.onTabAdd?.(event);
    }, []);
    const close = React.useCallback((event: React.SyntheticEvent, id: string) => {
      event.stopPropagation();
      pendingFocus.current = focusIsInside()
        ? { kind: 'close', id, index: latest.current.tabs.findIndex((t) => t.id === id) }
        : null;
      latest.current.onTabClose?.(id, event);
    }, []);

    const activeCloseable = tabs.find((t) => t.id === activeTab && t.closeable !== false);
    const closeableId = activeCloseable ? activeCloseable.id : null;
    const closeContext = React.useMemo<TabCloseContextValue>(
      () => ({ closeableId, onClose: close }),
      [closeableId, close],
    );

    const showAdd = !disableTabAdd && (maxTabs == null || tabs.length < maxTabs);

    // Keep focus in the bar when the element that had it is removed by the page's update.
    React.useEffect(() => {
      const pending = pendingFocus.current;
      const list = tabsRef.current;
      if (!pending || !list) return;
      const done =
        pending.kind === 'close'
          ? !tabs.some((t) => t.id === pending.id)
          : tabs.length !== pending.count || !showAdd;
      if (!done) return;
      pendingFocus.current = null;
      const doc = list.ownerDocument;
      if (doc.activeElement && doc.activeElement !== doc.body) return;
      const all = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
      const enabled = all.filter((t) => t.getAttribute('aria-disabled') !== 'true');
      const fixedCount = primary ? fixedTabs.length : 0;
      const target =
        all.find((t) => t.getAttribute('aria-selected') === 'true') ??
        (pending.kind === 'close'
          ? all[Math.min(fixedCount + Math.max(pending.index, 0), all.length - 1)]
          : undefined) ??
        enabled[0];
      (target && target.getAttribute('aria-disabled') !== 'true' ? target : enabled[0])?.focus();
    });

    return (
      <TabStripContext.Provider value={strip}>
        <TabCloseContext.Provider value={closeContext}>
          <MuiAppBar
            ref={ref}
            position={position}
            tier={tier}
            data-region="app-bar"
            role="banner"
            {...other}
            component={AppBarRootElement}
            {...(component ? { rootComponent: component } : null)}
          >
            <Toolbar
              disableGutters
              variant="dense"
              sx={primary ? toolbarSxPrimary : toolbarSxSecondary}
            >
              <Stack data-region="left" direction="row" sx={leftSx}>
                {primary && (
                  <BrandingRegion data-region="branding" data-component="Branding" sx={brandingSx}>
                    {/* `tecton-appbar-product`: the theme colours the logo and the name with
                        the product colour (`productColor`, else the tertiary text colour). */}
                    <BrandingLockup
                      data-region="branding-lockup"
                      className="tecton-appbar-product"
                      sx={lockupSx}
                    >
                      <Box data-region="branding-container" sx={brandingContainerSx}>
                        <Box data-region="branding-logo" sx={logoSx}>
                          {logo ? (
                            <span
                              className={`tecton-appbar-icon tecton-${logo}`}
                              aria-hidden="true"
                            />
                          ) : logoSrc ? (
                            <Box component="img" src={logoSrc} alt={appName} sx={logoImageSx} />
                          ) : (
                            <LogoPlaceholder sx={placeholderSx} />
                          )}
                        </Box>
                        <Box data-region="branding-name" sx={brandingNameSx}>
                          <Typography variant="caption">{appName}</Typography>
                        </Box>
                      </Box>
                    </BrandingLockup>
                  </BrandingRegion>
                )}
                <Tabs
                  ref={tabsRef}
                  value={activeTab}
                  variant="scrollable"
                  scrollButtons
                  data-region="tabs"
                  onChange={handleChange}
                  slots={tabsSlots}
                >
                  {primary &&
                    fixedTabs.map((tab) => (
                      <Tab
                        key={tab.id}
                        aria-label={tab.label ?? tab.id}
                        component="div"
                        disabled={tab.disabled}
                        icon={
                          <span
                            className={iconClass(tab.icon!, activeTab === tab.id)}
                            aria-hidden
                          />
                        }
                        sx={fixedTabSx}
                        value={tab.id}
                      />
                    ))}
                  {tabs.map(({ id, label, icon, disabled, closeable = true, tags }) => {
                    const active = activeTab === id;
                    const canClose = closeable && active && !disabled;
                    return (
                      <Tab
                        key={id}
                        value={id}
                        component="div"
                        disabled={disabled}
                        sx={tabSx}
                        aria-keyshortcuts={canClose ? 'Delete' : undefined}
                        onKeyDown={
                          canClose
                            ? (event: React.KeyboardEvent) => {
                                if (
                                  (event.key === 'Delete' || event.key === 'Backspace') &&
                                  event.target === event.currentTarget
                                ) {
                                  event.preventDefault();
                                  close(event, id);
                                }
                              }
                            : undefined
                        }
                        label={
                          <>
                            <Box data-region="tab-label" sx={tabLabelSx}>
                              {icon && (
                                <span className={iconClass(icon, active)} aria-hidden="true" />
                              )}
                              <Typography variant="caption">{label}</Typography>
                            </Box>
                            {tags?.map((tag) => (
                              <Chip key={tag} label={tag} size="small" clickable={false} />
                            ))}
                            {closeable && (
                              <Box aria-hidden sx={closeSlotSx} {...(active && closeSlotProps)} />
                            )}
                          </>
                        }
                      />
                    );
                  })}
                </Tabs>
                {showAdd && (
                  <IconButton aria-label="Add tab" onClick={handleAdd}>
                    <span className="tecton-add-outline" aria-hidden />
                  </IconButton>
                )}
              </Stack>
              <Box data-region="right" data-slot="actions" sx={actionsSx}>
                {children}
              </Box>
            </Toolbar>
          </MuiAppBar>
        </TabCloseContext.Provider>
      </TabStripContext.Provider>
    );
  },
);
