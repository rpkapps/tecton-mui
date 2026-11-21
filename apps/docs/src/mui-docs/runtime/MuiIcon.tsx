// Docs-only stand-in for `@mui/icons-material/<Name>` (wired by a Vite alias in vite.config.ts).
// Synced MUI examples keep their icon imports unchanged; each icon renders the closest Tecton icon
// through the public `Icon` component. It accepts the SvgIcon props the examples pass.
import * as React from 'react';
import Icon, { type IconName, type IconVariant } from '@tecton-mui/ui/Icon';
import type { SxProps, Theme } from '@tecton-mui/ui/styles';

export interface MuiIconShimProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  fontSize?: 'inherit' | 'small' | 'medium' | 'large' | (string & {});
  color?: string;
  htmlColor?: string;
  titleAccess?: string;
  sx?: SxProps<Theme>;
  // SvgIcon-only props: accepted and ignored (the Tecton icon is not an <svg>).
  component?: React.ElementType;
  viewBox?: string;
  inheritViewBox?: boolean;
  shapeRendering?: string;
}

// Material sizes (small 20px, medium 24px, large 35px) mapped to Tecton's icon scale, so synced
// examples use the same icon sizes as the rest of the library: small 16px, medium 20px,
// large 24px. Tecton containers (IconButton, ListItemIcon, ...) still set their own sizes.
const FONT_SIZE: Record<string, string> = {
  inherit: 'inherit',
  small: 'var(--tecton-icon-size-100)',
  medium: 'var(--tecton-icon-size-150)',
  large: 'var(--tecton-icon-size-200)',
};

const COLOR: Record<string, string | undefined> = {
  inherit: undefined,
  action: 'action.active',
  disabled: 'action.disabled',
  primary: 'primary.main',
  secondary: 'secondary.main',
  error: 'error.main',
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
};

export type MuiIconShim = React.NamedExoticComponent<
  MuiIconShimProps & React.RefAttributes<HTMLSpanElement>
> & { muiName: string };

// Material's checkbox and radio icons stand in for the controls in some examples (for example a
// list item acting as a checkbox). Draw them exactly as Tecton's Checkbox and Radio draw their
// icons (glyph, 20px with a 2px frame, state colours) and ignore the example's Material colours
// and padding, so they match the real controls next to them.
const CONTROL_ICONS: Record<string, { name: IconName; variant: IconVariant; color: string }> = {
  CheckBox: { name: 'checkbox-checked', variant: 'filled', color: 'color-action-filled-bg-active' },
  CheckBoxOutlineBlank: {
    name: 'checkbox-unchecked',
    variant: 'outline',
    color: 'color-action-text-only-text',
  },
  IndeterminateCheckBox: {
    name: 'checkbox-indeterminate',
    variant: 'filled',
    color: 'color-action-text-only-text-active',
  },
  RadioButtonChecked: { name: 'radio-button', variant: 'filled', color: 'color-action-filled-bg' },
  RadioButtonUnchecked: {
    name: 'radio-button',
    variant: 'outline',
    color: 'color-action-text-only-text',
  },
};

export function createMuiIcon(name: IconName, variant: IconVariant, displayName: string) {
  const control = CONTROL_ICONS[displayName];
  const MuiIcon = React.forwardRef<HTMLSpanElement, MuiIconShimProps>(function MuiIcon(
    {
      fontSize = 'medium',
      color = 'inherit',
      htmlColor,
      titleAccess,
      sx,
      style,
      component: _component,
      viewBox: _viewBox,
      inheritViewBox: _inheritViewBox,
      shapeRendering: _shapeRendering,
      ...other
    },
    ref,
  ) {
    if (control) {
      return (
        <Icon
          ref={ref}
          name={control.name}
          variant={control.variant}
          title={titleAccess}
          data-mui-icon={displayName}
          sx={{
            fontSize: 'var(--tecton-icon-size-150)',
            padding: 'var(--tecton-space-25)',
            boxSizing: 'content-box',
            flexShrink: 0,
            color: `var(--tecton-${control.color})`,
          }}
          {...other}
        />
      );
    }
    const themeColor = COLOR[color];
    return (
      <Icon
        ref={ref}
        name={name}
        variant={variant}
        title={titleAccess}
        data-mui-icon={displayName}
        style={htmlColor ? { color: htmlColor, ...style } : style}
        sx={[
          {
            fontSize: FONT_SIZE[fontSize] ?? fontSize,
            flexShrink: 0,
            ...(themeColor ? { color: themeColor } : null),
          },
          ...(sx === undefined ? [] : Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      />
    );
  });
  MuiIcon.displayName = `${displayName}Icon`;
  const Memo = React.memo(MuiIcon) as unknown as MuiIconShim;
  // Lets MUI components that inspect `muiName` (e.g. ListItemIcon, SpeedDialIcon) treat it as an icon.
  Memo.muiName = 'SvgIcon';
  return Memo;
}
