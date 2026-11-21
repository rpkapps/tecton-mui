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

// SvgIcon sizes (MUI): small 20px, medium 24px, large 35px.
const FONT_SIZE: Record<string, string> = {
  inherit: 'inherit',
  small: '1.25rem',
  medium: '1.5rem',
  large: '2.1875rem',
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

// Material's checkbox and radio glyphs sit inside their 24px box with a margin; Tecton's fill it.
// Draw them at the size Tecton's own Checkbox and Radio use (20px for a 24px icon).
const CONTROL_ICON_SCALE = 20 / 24;
const isControlIcon = (name: string) => /^(checkbox|radio-button)/.test(name);

export function createMuiIcon(name: IconName, variant: IconVariant, displayName: string) {
  const scale = isControlIcon(name) ? CONTROL_ICON_SCALE : 1;
  const base = (size: string) => (size === 'inherit' ? '1em' : (FONT_SIZE[size] ?? size));
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
    const themeColor = COLOR[color];
    return (
      <Icon
        ref={ref}
        name={name}
        variant={variant}
        title={titleAccess}
        style={htmlColor ? { color: htmlColor, ...style } : style}
        sx={[
          {
            fontSize:
              scale === 1
                ? (FONT_SIZE[fontSize] ?? fontSize)
                : `calc(${base(fontSize)} * ${scale})`,
            // Keep the box of the Material icon so layouts do not move.
            ...(scale === 1 ? null : { margin: `calc(${base(fontSize)} * ${(1 - scale) / 2})` }),
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
