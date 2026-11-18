'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { tectonIconVariants, type TectonIconName } from '../styles/tecton/index.js';

export type IconName = TectonIconName;
export type IconVariant = 'outline' | 'filled';
export type IconSize = 'inherit' | 'xsmall' | 'small' | 'medium' | 'large';

export interface IconProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children' | 'color'
> {
  /** Tecton icon name (verified against the pinned Tecton icons.css). */
  name: IconName;
  /** Monochrome style. Falls back to the available variant when one is missing. Default `outline`. */
  variant?: IconVariant;
  /** Tecton size step: xsmall 12px, small 16px, medium 20px, large 24px. Default `inherit` (1em). */
  size?: IconSize;
  /** Accessible label. Without it the icon is decorative (`aria-hidden`). */
  title?: string;
  sx?: SxProps<Theme>;
}

const SIZE_CLASS: Record<IconSize, string | undefined> = {
  inherit: undefined,
  xsmall: 'tecton-icon-xs',
  small: 'tecton-icon-sm',
  medium: 'tecton-icon-md',
  large: 'tecton-icon-lg',
};

/** Returns the Tecton CSS class for an icon, resolving missing variants. */
export function getIconClassName(name: IconName, variant: IconVariant = 'outline'): string {
  const variants = tectonIconVariants[name];
  if (!variants || variants.length === 0) return `tecton-${name}`;
  const resolved = variants.includes(variant) ? variant : variants[0];
  return `tecton-${name}-${resolved}`;
}

const IconRoot = styled('span', { name: 'TectonIcon', slot: 'Root' })({});

/**
 * Tecton icon. Renders the Tecton icon-font class (mask-based, tinted with `currentColor`), so the
 * Tecton `icons.css` must be loaded by the host (included in `styles/global.css`).
 */
const Icon = React.memo(
  React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
    { name, variant = 'outline', size = 'inherit', title, className, ...other },
    ref,
  ) {
    const a11y = title
      ? { role: 'img' as const, 'aria-label': title }
      : { 'aria-hidden': true as const };
    return (
      <IconRoot
        ref={ref}
        className={clsx(
          'TectonIcon-root',
          getIconClassName(name, variant),
          SIZE_CLASS[size],
          className,
        )}
        {...a11y}
        {...other}
      />
    );
  }),
);
(Icon as unknown as { muiName: string }).muiName = 'Icon';
Icon.displayName = 'Icon';

export default Icon;
