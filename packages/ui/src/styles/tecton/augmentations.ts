// Public type augmentations for Tecton-specific props and values that the Tecton theme styles via
// `variants`. Upstream declared these in tecton-mui's entry module, which is not part of the source
// map, so they are re-declared here from the variant predicates in the generated theme.
// Color/variant overrides that upstream declares inside createMuiTheme.ts are not repeated.
import type {} from '@mui/material/styles';
// MUI X Chat does not augment the theme from its component types (the other MUI X packages do), so
// `MuiChat*` theme keys would be untyped. Type-only: nothing is loaded at runtime.
import type {} from '@mui/x-chat/themeAugmentation';

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    /** Tecton IconButton shape: `square` uses radius-50 instead of a round button. */
    variant?: 'square';
    /** Persistent selected/pressed visual (Figma State=Activated). */
    activated?: boolean;
  }
}

declare module '@mui/material/Button' {
  interface ButtonOwnProps {
    /** Persistent selected/pressed visual (Figma State=Activated). */
    activated?: boolean;
  }
}

declare module '@mui/material/Accordion' {
  interface AccordionOwnProps {
    /** Tinted "activated" row treatment, distinct from expanded. */
    activated?: boolean;
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    /** Tecton name for MUI's `elevation` surface; `elevation` remains an alias. */
    elevated: true;
  }
}

declare module '@mui/material/Card' {
  interface CardPropsVariantOverrides {
    elevated: true;
  }
}

declare module '@mui/material/ToggleButton' {
  interface ToggleButtonPropsSizeOverrides {
    xsmall: true;
  }
}

declare module '@mui/material/Badge' {
  interface BadgeOwnProps {
    /** Tecton badge shape; `rectangle` uses radius-50. */
    shape?: 'pill' | 'rectangle';
  }
  interface BadgeClasses {
    colorDefault: string;
  }
}

declare module '@mui/material/Chip' {
  interface ChipOwnProps {
    /** Tecton chip shape; `rectangle` uses radius-50. */
    shape?: 'pill' | 'rectangle';
  }
}

declare module '@mui/material/Divider' {
  interface DividerOwnProps {
    /** Tecton divider emphasis. Defaults to medium. */
    emphasis?: 'subtle' | 'medium' | 'strong';
  }
}

declare module '@mui/material/SnackbarContent' {
  interface SnackbarContentProps {
    /** Tecton status treatment. */
    type?: 'success' | 'error';
  }
}

declare module '@mui/material/MenuItem' {
  interface MenuItemOwnProps {
    /** Non-interactive section header item. */
    heading?: boolean;
  }
}

declare module '@mui/material/Slider' {
  interface SliderPropsColorOverrides {
    tertiary: true;
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarOwnProps {
    /** Secondary (40px) in-page navigation tier. */
    tier?: 'primary' | 'secondary';
    /**
     * Product branding color (`color-branding-app1` to `-app4`) for the app bar's logo and app
     * name. Published as `--tecton-appbar-product-color`; without it they use the tertiary text
     * color.
     */
    productColor?: 'app1' | 'app2' | 'app3' | 'app4';
  }
}

export {};
