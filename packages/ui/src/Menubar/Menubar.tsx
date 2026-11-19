'use client';
// Application menu bar (File, Edit, View ...). Composes the Base UI `Menubar` and `Menu` (MIT) with
// Material components; adapted from the MIT "Menubar" recipe of mui/material-ui v9.5.0 (see
// THIRD_PARTY_NOTICES.md). Base UI owns the behaviour (roving focus across the bar, opening menus
// with the arrow keys, hover-to-switch while a menu is open, submenus, typeahead, dismissal and focus
// return). The visuals come from the theme: triggers are tertiary text Buttons, popups use the
// `MuiPopover` / `MuiMenu` paper and list overrides, and items are `MenuItem`s, so a menu bar menu
// looks like a `Menu` and follows theme changes.
import * as React from 'react';
import clsx from 'clsx';
import { Menu } from '@base-ui/react/menu';
import { Menubar as BaseMenubar } from '@base-ui/react/menubar';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { styled, useTheme, type CSSObject, type SxProps, type Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Paper from '@mui/material/Paper';
import Icon from '../Icon/Icon.js';
import { cssVar } from '../styles/tecton/index.js';

export const menubarClasses = {
  root: 'TectonMenubar-root',
  trigger: 'TectonMenubar-trigger',
  positioner: 'TectonMenubar-positioner',
  popup: 'TectonMenubar-popup',
  list: 'TectonMenubar-list',
  item: 'TectonMenubar-item',
  submenuTrigger: 'TectonMenubar-submenuTrigger',
  checkboxItem: 'TectonMenubar-checkboxItem',
  radioItem: 'TectonMenubar-radioItem',
  group: 'TectonMenubar-group',
  groupLabel: 'TectonMenubar-groupLabel',
  separator: 'TectonMenubar-separator',
  hint: 'TectonMenubar-hint',
} as const;

/** `sx` for the Material element that renders the part. */
interface SxProp {
  sx?: SxProps<Theme>;
}

/** Content shared by the item parts. */
interface MenubarItemContentProps {
  /** Leading icon, shown in the item's icon column. */
  icon?: React.ReactNode;
  /** Trailing text, typically the keyboard shortcut (for example `Ctrl+S`). Shown only. */
  hint?: React.ReactNode;
}

// A part's `className` may be a Base UI state function; the Material element needs a string.
type StaticClassName<P> = Omit<P, 'className'> & { className?: string };

type Override = CSSObject | ((props: { theme: Theme; ownerState: object }) => CSSObject);
function themeOverride(theme: Theme, component: string, slot: string): CSSObject {
  const components = theme.components as
    Record<string, { styleOverrides?: Record<string, Override> }> | undefined;
  const override = components?.[component]?.styleOverrides?.[slot];
  if (!override) return {};
  return typeof override === 'function' ? override({ theme, ownerState: {} }) : override;
}

/** The hover paint of the theme's `MenuItem`, reused for keyboard highlight and open submenus. */
function itemHoverStyle(theme: Theme): CSSObject {
  const root = themeOverride(theme, 'MuiMenuItem', 'root');
  return (
    (root['&:hover'] as CSSObject | undefined) ?? {
      backgroundColor: (theme.vars ?? theme).palette.action.hover,
    }
  );
}

// ---- Bar ---------------------------------------------------------------------------------------

const MenubarRoot = styled('div', { name: 'TectonMenubar', slot: 'Root' })({
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-25'),
  '&[data-orientation="vertical"]': {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

export interface MenubarProps extends StaticClassName<React.ComponentProps<typeof BaseMenubar>> {
  sx?: SxProps<Theme>;
}

/**
 * The menu bar. Holds one `MenubarMenu` per top-level menu; Tab moves into and out of the bar as one
 * stop, the arrow keys move between its triggers.
 */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(function Menubar(
  { className, sx, ...other },
  ref,
) {
  // Base UI reads the text direction from its own provider (arrow keys, submenu side); follow the
  // theme direction, as the Material components do. Context reaches the portalled menus too.
  const { direction } = useTheme();
  return (
    <DirectionProvider direction={direction}>
      <BaseMenubar
        ref={ref}
        render={<MenubarRoot sx={sx} className={clsx(menubarClasses.root, className)} />}
        {...other}
      />
    </DirectionProvider>
  );
});

// ---- Menus -------------------------------------------------------------------------------------

export type MenubarMenuProps = React.ComponentProps<typeof Menu.Root>;

/** One menu of the bar: a `MenubarTrigger` and its `MenubarPortal`. */
export function MenubarMenu(props: MenubarMenuProps) {
  return <Menu.Root {...props} />;
}

const TriggerRoot = styled(Button, { name: 'TectonMenubar', slot: 'Trigger' })({
  minWidth: 0,
  // Base UI marks the trigger of the open menu.
  '&[data-popup-open]': {
    backgroundColor: cssVar('color-action-tertiary-bg-active'),
    color: cssVar('color-action-tertiary-text-active'),
  },
  '[data-orientation="vertical"] > &': {
    justifyContent: 'flex-start',
  },
});

export interface MenubarTriggerProps
  extends StaticClassName<React.ComponentProps<typeof Menu.Trigger>>, SxProp {
  /** Button size. `medium` matches the menu item text; `small` suits a dense toolbar. */
  size?: 'small' | 'medium';
}

/** The bar button that opens its menu (a tertiary text `Button`). */
export const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  function MenubarTrigger({ className, sx, size = 'medium', ...other }, ref) {
    return (
      <Menu.Trigger
        ref={ref}
        render={
          <TriggerRoot
            variant="text"
            color="tertiary"
            size={size}
            disableRipple
            sx={sx}
            className={clsx(menubarClasses.trigger, className)}
          />
        }
        {...other}
      />
    );
  },
);

export type MenubarPortalProps = React.ComponentProps<typeof Menu.Portal>;

/** Renders the menu into `document.body` (or `container`). */
export function MenubarPortal(props: MenubarPortalProps) {
  return <Menu.Portal {...props} />;
}

const PositionerRoot = styled('div', { name: 'TectonMenubar', slot: 'Positioner' })(
  ({ theme }) => ({
    // Same layer as Menu and Popover, above app bars and drawers.
    zIndex: theme.zIndex.modal,
    outline: 0,
  }),
);

export type MenubarPositionerProps = StaticClassName<React.ComponentProps<typeof Menu.Positioner>>;

/**
 * Places the popup next to its trigger. Takes the Base UI positioning props (`side`, `align`,
 * `sideOffset`, `alignOffset`, `collisionPadding` ...). Top-level menus open below their trigger,
 * submenus beside their item.
 */
export const MenubarPositioner = React.forwardRef<HTMLDivElement, MenubarPositionerProps>(
  function MenubarPositioner({ className, sideOffset = 4, ...other }, ref) {
    return (
      <Menu.Positioner
        ref={ref}
        sideOffset={sideOffset}
        render={<PositionerRoot className={clsx(menubarClasses.positioner, className)} />}
        {...other}
      />
    );
  },
);

const PopupRoot = styled(Paper, { name: 'TectonMenubar', slot: 'Popup' })(({ theme }) => ({
  minWidth: 160,
  maxHeight: 'var(--available-height)',
  overflowY: 'auto',
  outline: 0,
  transformOrigin: 'var(--transform-origin)',
  transition: theme.transitions.create(['opacity', 'transform'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&[data-starting-style], &[data-ending-style]': {
    opacity: 0,
    transform: 'scale(0.95)',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  ...themeOverride(theme, 'MuiPopover', 'paper'),
  ...themeOverride(theme, 'MuiMenu', 'paper'),
}));

const PopupList = styled(List, { name: 'TectonMenubar', slot: 'List' })(({ theme }) =>
  themeOverride(theme, 'MuiMenu', 'list'),
) as typeof List;

export interface MenubarPopupProps
  extends StaticClassName<React.ComponentProps<typeof Menu.Popup>>, SxProp {}

/** The menu surface, styled like the `Menu` paper. */
export const MenubarPopup = React.forwardRef<HTMLDivElement, MenubarPopupProps>(
  function MenubarPopup({ className, sx, children, ...other }, ref) {
    return (
      <Menu.Popup
        ref={ref}
        render={
          <PopupRoot elevation={0} sx={sx} className={clsx(menubarClasses.popup, className)} />
        }
        {...other}
      >
        <PopupList component="div" className={menubarClasses.list}>
          {children}
        </PopupList>
      </Menu.Popup>
    );
  },
);

// ---- Items -------------------------------------------------------------------------------------

type Variant = { props: object | ((p: object) => boolean); style: Override };

/**
 * Item element styled with the theme's `MenuItem` rules. Material's `MenuItem` itself cannot be
 * used: it must live in a `Menu`/`MenuList`, whose roving focus would compete with Base UI's. The
 * base rules mirror `MenuItem`'s own (MIT); the theme's `MuiMenuItem` root, gutters and matching
 * variants (default `size`) are applied on top, so Tecton's menu item paint is reused unchanged.
 */
const ItemRoot = styled('button', { name: 'TectonMenubar', slot: 'Item' })(({ theme }) => {
  const menuItem = (
    theme.components as Record<string, { defaultProps?: object; variants?: Variant[] }> | undefined
  )?.MuiMenuItem;
  const ownerState = {
    dense: false,
    disableGutters: false,
    divider: false,
    ...menuItem?.defaultProps,
  } as Record<string, unknown>;
  const variants = (menuItem?.variants ?? [])
    .filter((v) =>
      typeof v.props === 'function'
        ? v.props(ownerState)
        : Object.entries(v.props).every(([key, value]) => ownerState[key] === value),
    )
    .map((v) => (typeof v.style === 'function' ? v.style({ theme, ownerState }) : v.style));
  const palette = (theme.vars ?? theme).palette;
  return [
    {
      // Native button reset.
      border: 0,
      margin: 0,
      backgroundColor: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      outline: 0,
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      width: '100%',
      textAlign: 'start',
      // Material MenuItem base.
      ...theme.typography.body1,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      textDecoration: 'none',
      minHeight: 48,
      paddingTop: 6,
      paddingBottom: 6,
      paddingInline: 16,
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      '&:hover': { backgroundColor: palette.action.hover },
      '&.Mui-disabled': { opacity: palette.action.disabledOpacity, cursor: 'default' },
      '& .MuiListItemText-root': { marginTop: 0, marginBottom: 0 },
      '& .MuiListItemIcon-root': { minWidth: 36 },
    },
    themeOverride(theme, 'MuiMenuItem', 'root'),
    themeOverride(theme, 'MuiMenuItem', 'gutters'),
    ...variants,
    // Base UI moves focus to the highlighted item; paint it (and an open submenu's trigger) like
    // a hovered item. Disabled items stay unpainted.
    { '&[data-highlighted]:not(.Mui-disabled), &[data-popup-open]': itemHoverStyle(theme) },
  ] as CSSObject[];
});

const Hint = styled('span', { name: 'TectonMenubar', slot: 'Hint' })({});

function ItemContent({
  icon,
  hint,
  children,
  end,
}: MenubarItemContentProps & { children?: React.ReactNode; end?: React.ReactNode }) {
  return (
    <>
      {icon !== undefined ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText>{children}</ListItemText>
      {hint !== undefined ? (
        // `tecton-menu-shortcut` is the theme's MenuItem shortcut style.
        <Hint className={clsx(menubarClasses.hint, 'tecton-menu-shortcut')}>{hint}</Hint>
      ) : null}
      {end}
    </>
  );
}

// Items are native buttons (Base UI `nativeButton`). Base UI keeps disabled items focusable with
// `aria-disabled`, so the disabled paint comes from the `Mui-disabled` class.
function itemElement(
  className: string | undefined,
  sx: SxProps<Theme> | undefined,
  disabled?: boolean,
) {
  return (
    <ItemRoot
      type="button"
      sx={sx}
      className={clsx(
        'MuiMenuItem-root MuiMenuItem-gutters',
        className,
        disabled && 'Mui-disabled',
      )}
    />
  );
}

export interface MenubarItemProps
  extends
    StaticClassName<React.ComponentProps<typeof Menu.Item>>,
    MenubarItemContentProps,
    SxProp {}

/** A command. `onClick` runs it; the menu closes unless `closeOnClick={false}`. */
export const MenubarItem = React.forwardRef<HTMLButtonElement, MenubarItemProps>(
  function MenubarItem({ className, sx, icon, hint, children, disabled, ...other }, ref) {
    return (
      <Menu.Item
        ref={ref}
        nativeButton
        disabled={disabled}
        render={itemElement(clsx(menubarClasses.item, className), sx, disabled)}
        {...other}
      >
        <ItemContent icon={icon} hint={hint}>
          {children}
        </ItemContent>
      </Menu.Item>
    );
  },
);

export type MenubarSubmenuProps = React.ComponentProps<typeof Menu.SubmenuRoot>;

/** A nested menu: a `MenubarSubmenuTrigger` and its `MenubarPortal`. */
export function MenubarSubmenu(props: MenubarSubmenuProps) {
  return <Menu.SubmenuRoot {...props} />;
}

const SubmenuArrow = styled(Icon, { name: 'TectonMenubar', slot: 'SubmenuArrow' })(({ theme }) => ({
  marginInlineStart: 'auto',
  paddingInlineStart: cssVar('space-100'),
  boxSizing: 'content-box',
  color: (theme.vars ?? theme).palette.text.secondary,
}));

export interface MenubarSubmenuTriggerProps
  extends
    StaticClassName<React.ComponentProps<typeof Menu.SubmenuTrigger>>,
    MenubarItemContentProps,
    SxProp {}

/** The item that opens a submenu, with a trailing chevron. */
export const MenubarSubmenuTrigger = React.forwardRef<
  HTMLButtonElement,
  MenubarSubmenuTriggerProps
>(function MenubarSubmenuTrigger({ className, sx, icon, hint, children, disabled, ...other }, ref) {
  return (
    <Menu.SubmenuTrigger
      ref={ref}
      nativeButton
      disabled={disabled}
      render={itemElement(clsx(menubarClasses.submenuTrigger, className), sx, disabled)}
      {...other}
    >
      <ItemContent
        icon={icon}
        hint={hint}
        end={
          <SubmenuArrow
            name="chevron-right"
            size="small"
            sx={{ '[dir="rtl"] &': { transform: 'scaleX(-1)' } }}
          />
        }
      >
        {children}
      </ItemContent>
    </Menu.SubmenuTrigger>
  );
});

export interface MenubarCheckboxItemProps
  extends
    StaticClassName<React.ComponentProps<typeof Menu.CheckboxItem>>,
    Pick<MenubarItemContentProps, 'hint'>,
    SxProp {}

/** An option that toggles on and off (`checked`, `defaultChecked`, `onCheckedChange`). */
export const MenubarCheckboxItem = React.forwardRef<HTMLButtonElement, MenubarCheckboxItemProps>(
  function MenubarCheckboxItem({ className, sx, hint, children, disabled, ...other }, ref) {
    return (
      <Menu.CheckboxItem
        ref={ref}
        nativeButton
        disabled={disabled}
        render={itemElement(clsx(menubarClasses.checkboxItem, className), sx, disabled)}
        {...other}
      >
        <ItemContent
          icon={<Menu.CheckboxItemIndicator render={<Icon name="check" size="small" />} />}
          hint={hint}
        >
          {children}
        </ItemContent>
      </Menu.CheckboxItem>
    );
  },
);

export type MenubarRadioGroupProps = React.ComponentProps<typeof Menu.RadioGroup>;

/** Groups `MenubarRadioItem`s that share one value (`value`, `defaultValue`, `onValueChange`). */
export function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return <Menu.RadioGroup {...props} />;
}

export interface MenubarRadioItemProps
  extends
    StaticClassName<React.ComponentProps<typeof Menu.RadioItem>>,
    Pick<MenubarItemContentProps, 'hint'>,
    SxProp {}

/** One choice of a `MenubarRadioGroup`. */
export const MenubarRadioItem = React.forwardRef<HTMLButtonElement, MenubarRadioItemProps>(
  function MenubarRadioItem({ className, sx, hint, children, disabled, ...other }, ref) {
    return (
      <Menu.RadioItem
        ref={ref}
        nativeButton
        disabled={disabled}
        render={itemElement(clsx(menubarClasses.radioItem, className), sx, disabled)}
        {...other}
      >
        <ItemContent
          icon={
            <Menu.RadioItemIndicator
              keepMounted
              render={(props, state) => (
                <Icon
                  {...(props as React.HTMLAttributes<HTMLSpanElement>)}
                  name="radio-button"
                  variant={state.checked ? 'filled' : 'outline'}
                  size="small"
                />
              )}
            />
          }
          hint={hint}
        >
          {children}
        </ItemContent>
      </Menu.RadioItem>
    );
  },
);

export type MenubarGroupProps = StaticClassName<React.ComponentProps<typeof Menu.Group>>;

/** A labelled section of a menu; give it a `MenubarGroupLabel`. */
export const MenubarGroup = React.forwardRef<HTMLDivElement, MenubarGroupProps>(
  function MenubarGroup({ className, ...other }, ref) {
    return (
      <Menu.Group
        ref={ref}
        render={<div className={clsx(menubarClasses.group, className)} />}
        {...other}
      />
    );
  },
);

const GroupLabelRoot = styled(ListSubheader, { name: 'TectonMenubar', slot: 'GroupLabel' })({
  position: 'static',
  backgroundColor: 'transparent',
}) as typeof ListSubheader;

export interface MenubarGroupLabelProps
  extends StaticClassName<React.ComponentProps<typeof Menu.GroupLabel>>, SxProp {}

/** The heading of a `MenubarGroup` (a `ListSubheader`). */
export const MenubarGroupLabel = React.forwardRef<HTMLDivElement, MenubarGroupLabelProps>(
  function MenubarGroupLabel({ className, sx, ...other }, ref) {
    return (
      <Menu.GroupLabel
        ref={ref}
        render={
          <GroupLabelRoot
            component="div"
            sx={sx}
            className={clsx(menubarClasses.groupLabel, className)}
          />
        }
        {...other}
      />
    );
  },
);

export interface MenubarSeparatorProps
  extends StaticClassName<React.ComponentProps<typeof Menu.Separator>>, SxProp {}

/** A divider between items. */
export const MenubarSeparator = React.forwardRef<HTMLDivElement, MenubarSeparatorProps>(
  function MenubarSeparator({ className, sx, ...other }, ref) {
    return (
      <Menu.Separator
        ref={ref}
        render={
          <Divider component="div" sx={sx} className={clsx(menubarClasses.separator, className)} />
        }
        {...other}
      />
    );
  },
);

export default Menubar;
