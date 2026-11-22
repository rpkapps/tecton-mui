'use client';
// AppBar: the Tecton App Bar. It replaces the MUI AppBar: the bar draws the Tecton row itself (no
// `Toolbar` to add), and its parts go in as children, MUI style:
//
//   <AppBar>
//     <AppBarBrand logo={<Icon name="dsg-symbol" />}>DSG</AppBarBrand>
//     <AppBarTabs value={tab} onChange={…} onAdd={…}>
//       <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
//       <AppBarTab value="orion" label="Orion Discovery" onClose={…} />
//     </AppBarTabs>
//     <AppBarActions>…</AppBarActions>
//   </AppBar>
//
// It is built on the MUI AppBar, so the MUI root props (`position`, `sx`, `className`, `component`,
// `ref`...) and the `MuiAppBar` theme keys still apply. The Tecton theme's `MuiAppBar` overrides
// style the row, the tabs (MUI `Tabs`/`Tab` underneath) and the regions marked with `data-region`,
// as they style the Tecton `<wc-app-bar>` drop-in.
import * as React from 'react';
import MuiAppBar, { type AppBarClasses } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import type { OverrideProps } from '@mui/material/OverridableComponent';
import type { SxProps, Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';

export type AppBarTier = 'primary' | 'secondary';

/**
 * The bar's own props. The MUI `AppBar` color and surface props (`color`, `enableColorOnDark`,
 * `elevation`, `square`, `variant`) are left out: the Tecton theme sets the bar's colors and
 * surface, so they would have no effect.
 */
export interface AppBarOwnProps {
  /** The bar's content: `AppBarBrand`, `AppBarTabs`, `AppBarActions` or any of your own. */
  children?: React.ReactNode;
  /** Override or extend the styles applied to the component. */
  classes?: Partial<AppBarClasses>;
  /**
   * The positioning type, as for the MUI `AppBar`. With `fixed`, pad the content so the bar does
   * not cover it.
   * @default 'static'
   */
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
  /**
   * The bar's height: `primary` for the 48px top bar, `secondary` for the slimmer 40px bar of a
   * page section.
   * @default 'primary'
   */
  tier?: AppBarTier;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

export interface AppBarTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'header',
> {
  props: AdditionalProps & AppBarOwnProps;
  defaultComponent: RootComponent;
}

// `color` is left out entirely: the root element's obsolete HTML `color` attribute would otherwise
// stand in for the MUI color prop.
export type AppBarProps<
  RootComponent extends React.ElementType = AppBarTypeMap['defaultComponent'],
  AdditionalProps = object,
> = Omit<OverrideProps<AppBarTypeMap<AdditionalProps, RootComponent>, RootComponent>, 'color'> & {
  component?: React.ElementType;
};

/** MUI's `OverridableComponent` call signatures, over `AppBarProps` (so without `color`). */
export interface AppBarComponent {
  <RootComponent extends React.ElementType>(
    props: { component: RootComponent } & AppBarProps<RootComponent>,
  ): React.JSX.Element | null;
  (props: AppBarProps): React.JSX.Element | null;
}

/** What the parts need from their bar. */
export const AppBarContext = React.createContext<{ tier: AppBarTier }>({ tier: 'primary' });

interface AppBarRootElementProps extends React.HTMLAttributes<HTMLElement> {
  tier?: unknown;
  /** The consumer's `component`, rendered in place of the default `header`. */
  rootComponent?: React.ElementType;
}

/**
 * The bar's root element. `tier` is a Tecton prop that the `MuiAppBar` theme variants match, so it
 * still goes to the MUI AppBar, but the MUI AppBar passes every prop it does not know on to its root
 * element, where `tier` would render as an invalid attribute. It stops here, after the theme has
 * matched it.
 */
const AppBarRootElement = React.forwardRef<HTMLElement, AppBarRootElementProps>(
  function AppBarRootElement({ tier: _tier, rootComponent = 'header', ...other }, ref) {
    const Root = rootComponent as React.ElementType;
    return <Root ref={ref} {...other} />;
  },
);

// The row: the theme sets its height and gutters per tier; the parts sit edge to edge, each as tall
// as the row (the space before the actions belongs to `AppBarActions`). Other content is centred.
const toolbarSx = { '&&&': { paddingLeft: 0, paddingRight: 0, gap: 0 } } as const;

/**
 * Tecton App Bar. Compose it from `AppBarBrand`, `AppBarTabs` (holding `AppBarTab` elements) and
 * `AppBarActions`, or any content of your own. `tier="secondary"` gives the slimmer in-page bar.
 *
 * Demos: [App Bar](/components/app-bar)
 */
const AppBar = React.forwardRef<HTMLElement, AppBarProps>(function AppBar(props, ref) {
  // `color` would reach the MUI AppBar's palette color classes; the types reject it already.
  const {
    children,
    tier = 'primary',
    position = 'static',
    component,
    color: _color,
    ...other
  } = props as AppBarProps & { color?: unknown };
  const context = React.useMemo(() => ({ tier }), [tier]);
  return (
    <AppBarContext.Provider value={context}>
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
        <Toolbar disableGutters variant="dense" sx={toolbarSx}>
          {children}
        </Toolbar>
      </MuiAppBar>
    </AppBarContext.Provider>
  );
}) as AppBarComponent;

/** Space between the tabs and the actions (the theme's former toolbar gap), per tier. */
export const actionsGap = (tier: AppBarTier) =>
  tier === 'primary' ? cssVar('space-300') : cssVar('space-100');

export default AppBar;
