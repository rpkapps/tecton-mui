'use client';
// Action Bar: a vertical tool palette docked to one side of a canvas or viewer (Figma
// "<ActionBar>/Vertical", Tecton MUI Library). Material UI has no such component; this one is
// composed from Material parts so that every surface, state and colour comes from the theme:
//
// - The bar is a WAI-ARIA toolbar: one tab stop, Up/Down/Home/End move between its controls.
// - Groups are bordered `Paper` surfaces (Figma <Paper> Border, Elevation 1 unless `elevation`
//   picks 0 or 2), stacked or in a row (two selects side by side); Left/Right move along a row.
// - Buttons are square tertiary `IconButton`s with a `Tooltip` (Figma <IconButton> Medium,
//   Tertiary, Square; "Hovered Long" shows the tooltip beside the button).
// - A tool menu button holds several tools: it shows the last tool picked, marks itself with a
//   corner triangle and opens a `Menu` of the tools beside the bar (Figma "Multiple tools").
// - Selects are compact `Select`s whose menu opens below them (Figma <Select> TextOnly/Filled).
import * as React from 'react';
import clsx from 'clsx';
import { deepmerge } from '@mui/utils';
import useControlled from '@mui/utils/useControlled';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useEventCallback from '@mui/utils/useEventCallback';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { styled, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem, { type MenuItemProps } from '@mui/material/MenuItem';
import Paper, { paperClasses, type PaperProps } from '@mui/material/Paper';
import { inputBaseClasses } from '@mui/material/InputBase';
import Select, {
  selectClasses,
  type BaseSelectProps,
  type StandardSelectProps,
} from '@mui/material/Select';
import Tooltip, { tooltipClasses, type TooltipProps } from '@mui/material/Tooltip';
import { cssVar } from '../styles/tecton/index.js';

export const actionBarClasses = {
  root: 'TectonActionBar-root',
  alignLeft: 'TectonActionBar-alignLeft',
  alignRight: 'TectonActionBar-alignRight',
  group: 'TectonActionBar-group',
  /** On a group that lays its controls out in a row (`orientation="horizontal"`). */
  groupHorizontal: 'TectonActionBar-groupHorizontal',
  button: 'TectonActionBar-button',
  /** On a button whose tool is current (and on a tool menu button while its menu is open). */
  active: 'TectonActionBar-active',
  toolMenu: 'TectonActionBar-toolMenu',
  moreIndicator: 'TectonActionBar-moreIndicator',
  menu: 'TectonActionBar-menu',
  tool: 'TectonActionBar-tool',
  select: 'TectonActionBar-select',
} as const;

/** The value that identifies a tool. */
export type ActionBarValue = string | number;

/**
 * Figma <Paper> Elevation of a group: its background. `0` is surface/base (`color-bg-default`),
 * `1` surface/elevation 1 (`color-bg-paper`, the theme's `Paper`), `2` surface/elevation 2
 * (`color-surface-elevation-2-bg`: white in light mode, black in dark mode).
 */
export type ActionBarElevation = 0 | 1 | 2;

/** Figma "Hovered Long": the tool name appears once the pointer rests on a button. */
const TOOLTIP_ENTER_DELAY = 500;
/** Holding a tool menu button this long opens its menu (as in Adobe tool palettes). */
const LONG_PRESS_DELAY = 500;
const ITEM_ATTRIBUTE = 'data-tecton-action-bar-item';

// ---- Shared state -------------------------------------------------------------------------------
// The current tool and the roving tab stop change often and concern one or two controls at a time,
// so they live in a small external store; each control selects a boolean from it and only the
// controls whose answer changes re-render.

interface StoreState {
  /** `id` of the control that holds the bar's single tab stop. */
  tabStop: string | null;
  /** The current tool. */
  value: ActionBarValue | null;
}

interface ActionBarStore {
  get(): StoreState;
  set(patch: Partial<StoreState>): void;
  subscribe(listener: () => void): () => void;
}

function createStore(value: ActionBarValue | null): ActionBarStore {
  let state: StoreState = { tabStop: null, value };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      const next = { ...state, ...patch };
      if (next.tabStop === state.tabStop && Object.is(next.value, state.value)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const noopSubscribe = () => () => {};

function useStoreSelector<T>(
  store: ActionBarStore | undefined,
  selector: (state: StoreState) => T,
  fallback: T,
): T {
  const getSnapshot = () => (store ? selector(store.get()) : fallback);
  return React.useSyncExternalStore(
    store ? store.subscribe : noopSubscribe,
    getSnapshot,
    getSnapshot,
  );
}

interface ActionBarContextValue {
  store: ActionBarStore;
  /** Physical side the bar sits on (`alignment`, mirrored in RTL). */
  barSide: 'left' | 'right';
  /** Physical side tool menus open on: away from the bar's edge. */
  popupSide: 'left' | 'right';
  /** Tooltip placement; the Popper mirrors it in RTL. */
  tooltipPlacement: 'left' | 'right';
  /** Elevation of the groups that set none. */
  elevation: ActionBarElevation;
  select(event: React.SyntheticEvent, value: ActionBarValue): void;
  /** Moves the tab stop to the first enabled control when its holder is gone or disabled. */
  reconcile(removedId?: string): void;
}

const ActionBarContext = React.createContext<ActionBarContextValue | null>(null);

function enabledItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(`[${ITEM_ATTRIBUTE}]`)).filter(
    (element) => !element.matches(':disabled, [aria-disabled="true"]'),
  );
}

/**
 * Registers a focusable control in the bar's roving tab stop. Returns the props for the element
 * that takes focus: the item marker and, unless disabled, `tabIndex` 0 for the tab stop and -1
 * for the others. Outside an `ActionBar` it returns no props.
 */
function useActionBarItem(disabled: boolean | undefined) {
  const context = React.useContext(ActionBarContext);
  const id = React.useId();
  const isTabStop = useStoreSelector(context?.store, (state) => state.tabStop === id, false);
  const reconcile = context?.reconcile;
  useEnhancedEffect(() => {
    reconcile?.();
  }, [reconcile, disabled]);
  useEnhancedEffect(() => () => reconcile?.(id), [reconcile, id]);
  const itemProps: Record<string, unknown> = {};
  if (context) {
    itemProps[ITEM_ATTRIBUTE] = id;
    if (!disabled) itemProps.tabIndex = isTabStop ? 0 : -1;
  }
  return { context, itemProps };
}

/** Tooltip props shared by the bar's buttons: beside the button, 2px away, after a pause. */
function tooltipProps(
  context: ActionBarContextValue | null,
  slotProps: Partial<TooltipProps> | undefined,
): Partial<TooltipProps> {
  const base: Partial<TooltipProps> = {
    placement: context?.tooltipPlacement ?? 'right',
    enterDelay: TOOLTIP_ENTER_DELAY,
    slotProps: {
      tooltip: {
        // Figma places the tooltip 2px from the button (MUI default: 14px).
        sx: {
          [`.${tooltipClasses.popper}[data-popper-placement] &`]: { margin: cssVar('space-25') },
        },
      },
    },
  };
  return slotProps ? deepmerge(base, slotProps) : base;
}

// ---- Bar -----------------------------------------------------------------------------------------

const ActionBarRoot = styled('div', { name: 'TectonActionBar', slot: 'Root' })({
  display: 'inline-flex',
  flexDirection: 'column',
  // Figma: groups are 0.5 spacing apart and line up on the bar's edge.
  gap: cssVar('space-50'),
  alignItems: 'flex-start',
  [`&.${actionBarClasses.alignRight}`]: { alignItems: 'flex-end' },
});

export interface ActionBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /**
   * The edge of the screen the bar sits on. Tooltips and tool menus open on the other side, and the
   * groups line up on this edge. Mirrored in RTL, like the `Drawer` anchor. Default `left`.
   */
  alignment?: 'left' | 'right';
  /**
   * Figma <Paper> Elevation of the groups, which sets their background: `0` the page background,
   * `1` the `Paper` background (default), `2` the raised surface of a `Dialog` (white in light
   * mode, black in dark mode). A group's own `elevation` wins.
   */
  elevation?: ActionBarElevation;
  /** The current tool (controlled). `null` for none. */
  value?: ActionBarValue | null;
  /** The initial tool (uncontrolled). */
  defaultValue?: ActionBarValue | null;
  /** Called when the user picks another tool. */
  onChange?: (event: React.SyntheticEvent, value: ActionBarValue) => void;
  sx?: SxProps<Theme>;
}

/**
 * A vertical tool palette. Holds `ActionBarGroup`s of `ActionBarButton`s, `ActionBarToolMenu`s and
 * `ActionBarSelect`s. Buttons with a `value` are tools: the bar keeps one of them current (`value`,
 * `defaultValue`, `onChange`).
 */
export const ActionBar = React.forwardRef<HTMLDivElement, ActionBarProps>(function ActionBar(
  {
    alignment = 'left',
    elevation = 1,
    value: valueProp,
    defaultValue = null,
    onChange,
    className,
    onFocus,
    onKeyDownCapture,
    children,
    ...other
  },
  ref,
) {
  const [value, setValue] = useControlled<ActionBarValue | null>({
    controlled: valueProp,
    default: defaultValue,
    name: 'ActionBar',
    state: 'value',
  });
  const [store] = React.useState(() => createStore(value));
  useEnhancedEffect(() => store.set({ value }), [store, value]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const handleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const reconcile = React.useCallback(
    (removedId?: string) => {
      const root = rootRef.current;
      if (!root) return;
      const ids = enabledItems(root)
        .map((element) => element.getAttribute(ITEM_ATTRIBUTE))
        .filter((id) => id !== removedId);
      const { tabStop } = store.get();
      if (tabStop !== null && ids.includes(tabStop)) return;
      store.set({ tabStop: ids[0] ?? null });
    },
    [store],
  );
  // After the first render (and whenever the bar re-renders) one enabled control holds the tab stop.
  useEnhancedEffect(() => reconcile());

  const select = useEventCallback((event: React.SyntheticEvent, next: ActionBarValue) => {
    if (Object.is(next, value)) return;
    setValue(next);
    onChange?.(event, next);
  });

  const { direction } = useTheme();
  const isRtl = direction === 'rtl';
  const barSide = (alignment === 'left') !== isRtl ? 'left' : 'right';
  const context = React.useMemo<ActionBarContextValue>(
    () => ({
      store,
      barSide,
      popupSide: barSide === 'left' ? 'right' : 'left',
      tooltipPlacement: alignment === 'left' ? 'right' : 'left',
      elevation,
      select,
      reconcile,
    }),
    [store, barSide, alignment, elevation, select, reconcile],
  );

  // A control that gets focus (pointer or keyboard) becomes the tab stop. Events from portalled
  // menus also bubble here through the React tree; they are ignored.
  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const target = event.target as HTMLElement;
    if (rootRef.current?.contains(target) && target.hasAttribute(ITEM_ATTRIBUTE)) {
      store.set({ tabStop: target.getAttribute(ITEM_ATTRIBUTE) });
    }
  };

  // Roving focus. Capture phase, so that Up and Down move along the bar instead of opening a
  // focused Select (which still opens with Enter, Space or Alt+Down).
  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDownCapture?.(event);
    const root = rootRef.current;
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || !root?.contains(target) || !target.hasAttribute(ITEM_ATTRIBUTE)) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const items = enabledItems(root);
    const index = items.indexOf(target);
    let next: HTMLElement | undefined;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight': {
        // In a horizontal group, Left and Right move between its controls (mirrored in RTL). Past
        // the end of the row, or outside one, the key is left to the control (a tool menu opens
        // its menu with it).
        const row = target.closest<HTMLElement>(`.${actionBarClasses.groupHorizontal}`);
        if (!row || !root.contains(row)) return;
        const rowItems = items.filter((item) => row.contains(item));
        const step = (event.key === 'ArrowRight') !== isRtl ? 1 : -1;
        next = rowItems[rowItems.indexOf(target) + step];
        if (!next) return;
        break;
      }
      case 'ArrowDown':
        next = items[(index + 1) % items.length];
        break;
      case 'ArrowUp':
        next = items[(index - 1 + items.length) % items.length];
        break;
      case 'Home':
        next = items[0];
        break;
      case 'End':
        next = items[items.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (next) {
      store.set({ tabStop: next.getAttribute(ITEM_ATTRIBUTE) });
      next.focus();
    }
  };

  return (
    <ActionBarContext.Provider value={context}>
      <ActionBarRoot
        ref={handleRef}
        role="toolbar"
        aria-orientation="vertical"
        className={clsx(
          actionBarClasses.root,
          alignment === 'left' ? actionBarClasses.alignLeft : actionBarClasses.alignRight,
          className,
        )}
        onFocus={handleFocus}
        onKeyDownCapture={handleKeyDownCapture}
        {...other}
      >
        {children}
      </ActionBarRoot>
    </ActionBarContext.Provider>
  );
});

// ---- Group ---------------------------------------------------------------------------------------

const GroupRoot = styled(Paper, { name: 'TectonActionBar', slot: 'Group' })({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  // Figma: a Stack with 0.5 spacing inside a Paper padded by space/50, radius borderRadius/50, with
  // the elevation 1 border. Figma strokes inside the frame, CSS outside it, so the padding gives
  // back the border width (a 32px button makes a 40px group, as in Figma).
  gap: cssVar('space-50'),
  padding: `calc(${cssVar('space-50')} - ${cssVar('border-width-100')})`,
  border: `${cssVar('border-width-100')} solid ${cssVar('color-divider-subtle')}`,
  borderRadius: cssVar('radius-50'),
  // Figma <Paper> Elevation, on Paper's own elevation classes; every elevation has the same
  // border. 1 keeps the theme Paper's bg-paper (surface/elevation 1). 0 is surface/base; 2 is
  // surface/elevation 2, the Dialog's surface (white in light mode, black in dark mode).
  [`&.${paperClasses.elevation0}`]: { backgroundColor: cssVar('color-bg-default') },
  [`&.${paperClasses.elevation2}`]: { backgroundColor: cssVar('color-surface-elevation-2-bg') },
  // Figma "Legacy" double dropdown: two selects side by side in one Paper, same spacing.
  [`&.${actionBarClasses.groupHorizontal}`]: { flexDirection: 'row' },
});

export interface ActionBarGroupProps extends Omit<PaperProps, 'elevation'> {
  /**
   * Figma <Paper> Elevation of this group (its background), when it differs from the bar's
   * `elevation`. See `ActionBar`.
   */
  elevation?: ActionBarElevation;
  /**
   * `vertical` stacks the controls (default). `horizontal` puts them in a row, for example two
   * `ActionBarSelect`s; Left and Right then move between them.
   */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * A surface that holds related controls of the bar: a bordered `Paper` at the bar's `elevation`
 * (1 by default), or at its own.
 */
export const ActionBarGroup = React.forwardRef<HTMLDivElement, ActionBarGroupProps>(
  function ActionBarGroup({ orientation = 'vertical', elevation, className, ...other }, ref) {
    const context = React.useContext(ActionBarContext);
    return (
      <GroupRoot
        ref={ref}
        role="group"
        elevation={elevation ?? context?.elevation ?? 1}
        className={clsx(
          actionBarClasses.group,
          orientation === 'horizontal' && actionBarClasses.groupHorizontal,
          className,
        )}
        {...other}
      />
    );
  },
);

// ---- Buttons -------------------------------------------------------------------------------------

const BarIconButton = styled(IconButton, { name: 'TectonActionBar', slot: 'Button' })({
  // The theme's IconButton `activated` paint (Figma State=Activated), keyed on a class because
  // IconButton would pass an `activated` prop on to the DOM. `:where()` keeps the specificity of the
  // theme variant, so hover and keyboard focus still paint over it as they do there.
  [`&:where(.${actionBarClasses.active})`]: {
    backgroundColor: cssVar('color-action-tertiary-bg-active'),
    color: cssVar('color-action-tertiary-adornment-active'),
  },
  // A long press opens a tool menu; keep the touch callout out of the way.
  WebkitTouchCallout: 'none',
});

type BarIconButtonProps = Omit<
  IconButtonProps,
  'children' | 'value' | 'color' | 'size' | 'variant' | 'edge' | 'slots' | 'slotProps'
>;

export interface ActionBarButtonProps extends BarIconButtonProps {
  /** Accessible name of the button, also shown in its tooltip. */
  label: string;
  /** The icon, usually an `Icon`. */
  icon: React.ReactNode;
  /**
   * Makes the button a tool: pressing it makes `value` the bar's current tool, and it shows as
   * activated (`aria-pressed`) while it is. Without a value the button is a plain action.
   */
  value?: ActionBarValue;
  slotProps?: { tooltip?: Partial<TooltipProps> };
}

/** A square tertiary icon button with a tooltip; a tool when it has a `value`. */
export const ActionBarButton = React.forwardRef<HTMLButtonElement, ActionBarButtonProps>(
  function ActionBarButton(
    { label, icon, value, disabled, className, onClick, slotProps, ...other },
    ref,
  ) {
    const { context, itemProps } = useActionBarItem(disabled);
    const isTool = value !== undefined;
    const active = useStoreSelector(
      context?.store,
      (state) => isTool && Object.is(state.value, value),
      false,
    );
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (isTool && !event.defaultPrevented) context?.select(event, value);
    };
    return (
      // A disabled button gets no tooltip (it cannot be hovered or focused).
      <Tooltip title={disabled ? '' : label} {...tooltipProps(context, slotProps?.tooltip)}>
        <BarIconButton
          ref={ref}
          color="tertiary"
          variant="square"
          size="medium"
          aria-label={label}
          aria-pressed={isTool ? active : undefined}
          disabled={disabled}
          className={clsx(actionBarClasses.button, active && actionBarClasses.active, className)}
          onClick={handleClick}
          {...itemProps}
          {...other}
        >
          {icon}
        </BarIconButton>
      </Tooltip>
    );
  },
);

const MoreIndicator = styled('span', { name: 'TectonActionBar', slot: 'MoreIndicator' })(
  ({ theme }) => ({
    // Figma "Multiple tools": a 4px triangle 2px inside the bottom corner, tinted with the
    // tertiary adornment, and with states/activeContrastText while the button is hovered, focused,
    // pressed or open.
    position: 'absolute',
    insetInlineEnd: cssVar('space-25'),
    bottom: cssVar('space-25'),
    width: cssVar('space-50'),
    height: cssVar('space-50'),
    backgroundColor: cssVar('color-action-tertiary-adornment'),
    clipPath:
      theme.direction === 'rtl'
        ? 'polygon(0 0, 100% 100%, 0 100%)'
        : 'polygon(100% 0, 100% 100%, 0 100%)',
    pointerEvents: 'none',
    [[':hover', '.Mui-focusVisible', `.${actionBarClasses.active}`]
      .map((state) => `.${actionBarClasses.toolMenu}${state} > &`)
      .join(', ')]: { backgroundColor: cssVar('color-action-tertiary-text-active') },
    [`.${actionBarClasses.toolMenu}.Mui-disabled > &`]: { backgroundColor: 'currentColor' },
  }),
);

export interface ActionBarToolProps extends Omit<MenuItemProps, 'value' | 'children'> {
  /** The tool. */
  value: ActionBarValue;
  /** Name of the tool: the menu item text, and the button's name and tooltip while it is shown. */
  label: string;
  /** The tool's icon: shown in the menu item, and on the button while the tool is shown. */
  icon: React.ReactNode;
}

const ToolRoot = styled(MenuItem, { name: 'TectonActionBar', slot: 'Tool' })({
  // Figma: the tool's icon keeps the 20px size it has on the bar's button (a 32px row, 12px from
  // the text); the theme's menu leaves icons at the text size.
  [`& .${listItemIconClasses.root}`]: { fontSize: cssVar('icon-size-150') },
});

/** One tool of an `ActionBarToolMenu` (a `MenuItem` with an icon). */
export const ActionBarTool = React.forwardRef<HTMLLIElement, ActionBarToolProps>(
  function ActionBarTool(
    { value: _value, label, icon, selected = false, className, ...other },
    ref,
  ) {
    return (
      <ToolRoot
        ref={ref}
        role="menuitemradio"
        aria-checked={selected}
        selected={selected}
        className={clsx(actionBarClasses.tool, className)}
        {...other}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </ToolRoot>
    );
  },
);

function toolElements(children: React.ReactNode): React.ReactElement<ActionBarToolProps>[] {
  const tools: React.ReactElement<ActionBarToolProps>[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      tools.push(...toolElements((child.props as { children?: React.ReactNode }).children));
    } else {
      tools.push(child as React.ReactElement<ActionBarToolProps>);
    }
  });
  return tools;
}

export interface ActionBarToolMenuProps extends BarIconButtonProps {
  /** The tools, as `ActionBarTool` elements. */
  children?: React.ReactNode;
  /** The tool shown on the button before the user picks one. Defaults to the first tool. */
  defaultValue?: ActionBarValue;
  /** Name of the set of tools (for example "Shapes"); labels the menu. */
  label?: string;
  /**
   * Description read after the tool name, telling keyboard users how to open the menu. Default
   * "Right Arrow for more tools" ("Left Arrow ..." when the menu opens to the left).
   */
  moreToolsHint?: string;
  slotProps?: { tooltip?: Partial<TooltipProps>; menu?: Partial<MenuProps> };
}

/**
 * A button that holds several tools. It shows the tool picked last and makes it current when
 * pressed. Holding it, right-clicking it, or pressing the arrow key toward the menu side opens a
 * menu of all its tools; a corner triangle marks it.
 */
export const ActionBarToolMenu = React.forwardRef<HTMLButtonElement, ActionBarToolMenuProps>(
  function ActionBarToolMenu(
    {
      children,
      defaultValue,
      label,
      moreToolsHint,
      disabled,
      className,
      onClick,
      onKeyDown,
      onContextMenu,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      slotProps,
      id: idProp,
      ...other
    },
    ref,
  ) {
    const { context, itemProps } = useActionBarItem(disabled);
    const tools = toolElements(children);
    const values = tools.map((tool) => tool.props.value);

    // The current tool of the bar when it is one of these tools.
    const activeTool = useStoreSelector(
      context?.store,
      (state) => (state.value !== null && values.includes(state.value) ? state.value : null),
      null,
    );
    const [chosen, setChosen] = React.useState(() => defaultValue ?? values[0]);
    // The button keeps showing the last of its tools that was current.
    if (activeTool !== null && !Object.is(activeTool, chosen)) setChosen(activeTool);
    const shownValue = activeTool ?? (values.includes(chosen) ? chosen : values[0]);
    const shown = tools.find((tool) => Object.is(tool.props.value, shownValue));

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const open = anchorEl !== null;
    const [tooltipOpen, setTooltipOpen] = React.useState(false);

    const generatedId = React.useId();
    const buttonId = idProp ?? `${generatedId}-button`;
    const menuId = `${generatedId}-menu`;
    const hintId = `${generatedId}-hint`;

    const popupSide = context?.popupSide ?? 'right';
    const openKey = popupSide === 'right' ? 'ArrowRight' : 'ArrowLeft';
    const backKey = popupSide === 'right' ? 'ArrowLeft' : 'ArrowRight';

    // Long press. The menu's backdrop appears under the pointer while it is still down; the click
    // that ends the press must not close the menu again.
    const pressTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const longPressed = React.useRef(false);
    const keepOpenUntilRelease = React.useRef(false);
    React.useEffect(() => {
      const timer = pressTimer;
      return () => clearTimeout(timer.current);
    }, []);

    const openMenu = (element: HTMLElement) => {
      if (disabled || tools.length === 0) return;
      setTooltipOpen(false);
      setAnchorEl(element);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      longPressed.current = false;
      clearTimeout(pressTimer.current);
      if (event.button !== 0 || disabled) return;
      const element = event.currentTarget;
      pressTimer.current = setTimeout(() => {
        longPressed.current = true;
        keepOpenUntilRelease.current = true;
        const release = () => {
          setTimeout(() => {
            keepOpenUntilRelease.current = false;
          });
        };
        element.ownerDocument.addEventListener('pointerup', release, { once: true, capture: true });
        element.ownerDocument.addEventListener('pointercancel', release, {
          once: true,
          capture: true,
        });
        openMenu(element);
      }, LONG_PRESS_DELAY);
    };
    const cancelPress =
      <E extends React.PointerEvent<HTMLButtonElement>>(handler?: (event: E) => void) =>
      (event: E) => {
        handler?.(event);
        clearTimeout(pressTimer.current);
      };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // The click that ends a long press is not a press of the tool.
      if (longPressed.current && event.detail > 0) {
        longPressed.current = false;
        return;
      }
      onClick?.(event);
      if (!event.defaultPrevented && shownValue !== undefined) {
        context?.select(event, shownValue);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === openKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        openMenu(event.currentTarget);
      }
    };

    // Right-click, and the keyboard's context menu key (or Shift+F10), open the menu.
    const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      onContextMenu?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      openMenu(event.currentTarget);
    };

    const menuSlotProps = slotProps?.menu;
    const closeMenu: NonNullable<MenuProps['onClose']> = (event, reason) => {
      if (reason === 'backdropClick' && keepOpenUntilRelease.current) return;
      setAnchorEl(null);
      menuSlotProps?.onClose?.(event, reason);
    };

    const pick = (event: React.MouseEvent<HTMLLIElement>, value: ActionBarValue) => {
      setChosen(value);
      setAnchorEl(null);
      context?.select(event, value);
    };

    const baseMenuProps: Partial<MenuProps> = {
      anchorOrigin: { vertical: 'top', horizontal: popupSide },
      transformOrigin: { vertical: 'top', horizontal: popupSide === 'right' ? 'left' : 'right' },
      slotProps: {
        paper: {
          className: actionBarClasses.menu,
          // Figma: the menu sits 2px beside the button and 2px above its top edge. Popover
          // positions are physical, so the offset is an inline style, which the RTL style
          // transform leaves as it is.
          style: {
            marginTop: `calc(-1 * ${cssVar('space-25')})`,
            marginLeft:
              popupSide === 'right' ? cssVar('space-25') : `calc(-1 * ${cssVar('space-25')})`,
          },
        },
        list: label ? { 'aria-label': label } : { 'aria-labelledby': buttonId },
      },
    };
    const menuProps = deepmerge(baseMenuProps, menuSlotProps ?? {});
    const listSlotProps = (menuProps.slotProps?.list ?? {}) as {
      onKeyDown?: React.KeyboardEventHandler<HTMLUListElement>;
    };

    const toolLabel = shown?.props.label ?? '';
    const hint =
      moreToolsHint ??
      (popupSide === 'right' ? 'Right Arrow for more tools' : 'Left Arrow for more tools');

    return (
      <React.Fragment>
        <Tooltip
          title={disabled ? '' : toolLabel}
          {...tooltipProps(context, slotProps?.tooltip)}
          open={tooltipOpen && !open}
          onOpen={() => setTooltipOpen(true)}
          onClose={() => setTooltipOpen(false)}
        >
          <BarIconButton
            ref={ref}
            id={buttonId}
            color="tertiary"
            variant="square"
            size="medium"
            aria-label={toolLabel}
            aria-pressed={context ? activeTool !== null : undefined}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            aria-describedby={disabled ? undefined : hintId}
            disabled={disabled}
            className={clsx(
              actionBarClasses.button,
              actionBarClasses.toolMenu,
              (activeTool !== null || open) && actionBarClasses.active,
              className,
            )}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            onPointerDown={handlePointerDown}
            onPointerUp={cancelPress(onPointerUp)}
            onPointerLeave={cancelPress(onPointerLeave)}
            onPointerCancel={cancelPress(onPointerCancel)}
            {...itemProps}
            {...other}
          >
            {shown?.props.icon}
            <MoreIndicator className={actionBarClasses.moreIndicator} aria-hidden />
            <span id={hintId} style={visuallyHidden}>
              {hint}
            </span>
          </BarIconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          {...menuProps}
          onClose={closeMenu}
          slotProps={{
            ...menuProps.slotProps,
            list: {
              // `aria-controls` of the button points at the element with the menu role.
              id: menuId,
              ...listSlotProps,
              // The arrow key back toward the bar closes the menu, as for a submenu.
              onKeyDown: (event: React.KeyboardEvent<HTMLUListElement>) => {
                listSlotProps.onKeyDown?.(event);
                if (event.key === backKey && !event.defaultPrevented) {
                  event.preventDefault();
                  closeMenu(event, 'escapeKeyDown');
                }
              },
            },
          }}
        >
          {tools.map((tool) => {
            const value = tool.props.value;
            return React.cloneElement(tool, {
              key: String(value),
              selected: Object.is(value, shownValue),
              onClick: (event: React.MouseEvent<HTMLLIElement>) => {
                tool.props.onClick?.(event);
                if (!event.defaultPrevented) pick(event, value);
              },
            });
          })}
        </Menu>
      </React.Fragment>
    );
  },
);

// ---- Select --------------------------------------------------------------------------------------

export type ActionBarSelectProps<Value = unknown> = Omit<
  StandardSelectProps & BaseSelectProps<Value>,
  'variant' | 'size' | 'label'
> & {
  /** `standard` is the Figma TextOnly select (default); `filled` adds the input fill. */
  variant?: 'standard' | 'filled';
  /** Accessible name of the select (it has no visible label). */
  'aria-label'?: string;
};

// Figma `_ActionBarSelectBehavior_*`: the value sits one space/50 further in than the theme's select
// puts it, so it does not touch the group's edge. TextOnly: 4px in, with 28px after the value for the
// chevron ("Value" hugs 67px); Filled: 12px in (79px). Physical sides, like MUI's own select padding,
// so the RTL plugin mirrors both. The extra classes beat MUI's `&&&` padding rule.
const SelectRoot = styled(Select, { name: 'TectonActionBar', slot: 'Select' })({
  [`& .${selectClasses.select}.${selectClasses.standard}.${inputBaseClasses.input}`]: {
    paddingLeft: cssVar('space-50'),
    paddingRight: `calc(${cssVar('space-300')} + ${cssVar('space-50')})`,
  },
  [`& .${selectClasses.select}.${selectClasses.filled}.${inputBaseClasses.input}`]: {
    paddingLeft: cssVar('space-150'),
  },
});

/**
 * A compact `Select` for the bar (for example a zoom level or a view mode). Its menu opens below it,
 * lined up on the bar's edge, above the tools. Two selects can share a row in an
 * `ActionBarGroup orientation="horizontal"`.
 */
export const ActionBarSelect = React.forwardRef(function ActionBarSelect(
  {
    variant = 'standard',
    'aria-label': ariaLabel,
    inputProps,
    SelectDisplayProps,
    MenuProps: menuPropsProp,
    disabled,
    className,
    ...other
  }: ActionBarSelectProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { context, itemProps } = useActionBarItem(disabled);
  const theme = useTheme();
  const side = context?.barSide ?? (theme.direction === 'rtl' ? 'right' : 'left');
  // An instance `MenuProps` replaces the theme's default one; merge them so the theme's Select menu
  // styles stay.
  const menuProps = deepmerge(
    deepmerge(theme.components?.MuiSelect?.defaultProps?.MenuProps ?? {}, {
      anchorOrigin: { vertical: 'bottom', horizontal: side },
      transformOrigin: { vertical: 'top', horizontal: side },
      // Figma: the menu hangs 2px below the select.
      slotProps: { paper: { sx: { marginTop: cssVar('space-25') } } },
    } satisfies Partial<MenuProps>),
    menuPropsProp ?? {},
  );
  return (
    <SelectRoot
      ref={ref}
      variant={variant}
      size="medium"
      disabled={disabled}
      className={clsx(actionBarClasses.select, className)}
      inputProps={{ 'aria-label': ariaLabel, ...inputProps }}
      SelectDisplayProps={
        { ...SelectDisplayProps, ...itemProps } as React.HTMLAttributes<HTMLDivElement>
      }
      MenuProps={menuProps}
      {...other}
    />
  );
}) as <Value = unknown>(
  props: ActionBarSelectProps<Value> & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element;

export default ActionBar;
