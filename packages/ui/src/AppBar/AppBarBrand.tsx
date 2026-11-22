'use client';
import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';

export interface AppBarBrandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The product mark: a Tecton `Icon` (for example `<Icon name="dsg-symbol" />`), an MUI `SvgIcon`,
   * an `<img>` or any element. Icons take the app bar's icon size and the name's color; images fill
   * the logo box. Left out, a placeholder square shows (the Tecton design's generic app icon);
   * `null` shows no logo.
   */
  logo?: React.ReactNode;
  /** The app name. */
  children?: React.ReactNode;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

const BrandingRegion = styled('div', { name: 'TectonAppBarBrand', slot: 'Root' })({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  flexShrink: 0,
  paddingLeft: cssVar('space-150'),
  paddingRight: cssVar('space-150'),
  borderRight: `1px solid ${cssVar('color-divider-subtle')}`,
  color: cssVar('color-action-tertiary-text'),
});

const Lockup = styled('div', { name: 'TectonAppBarBrand', slot: 'Lockup' })({
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-25'),
  padding: cssVar('space-75'),
  borderRadius: cssVar('radius-round'),
});

const Logo = styled('div', { name: 'TectonAppBarBrand', slot: 'Logo' })({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: cssVar('icon-size-150'),
  height: cssVar('icon-size-150'),
  // Images and raw SVG marks fill the box; icons (a Tecton `Icon` or an MUI `SvgIcon`) keep the
  // app bar's icon size from the theme's `.tecton-appbar-icon` rule.
  '& > img, & > svg:not(.MuiSvgIcon-root)': { width: '100%', height: '100%', display: 'block' },
});

const Name = styled('div', { name: 'TectonAppBarBrand', slot: 'Name' })({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: cssVar('space-400'),
});

/** The Tecton design's generic app icon, for a bar without a product mark. */
const LogoPlaceholder = styled('div', { name: 'TectonAppBarBrand', slot: 'Placeholder' })({
  display: 'block',
  width: 14,
  height: 14,
  borderRadius: cssVar('radius-25'),
  backgroundColor: cssVar('color-accent-pink-fill'),
});

/** The theme sizes `.tecton-appbar-icon` glyphs; an element logo joins them. */
function decorateLogo(logo: React.ReactNode) {
  if (!React.isValidElement<{ className?: string }>(logo) || logo.type === 'img') return logo;
  return React.cloneElement(logo, { className: clsx('tecton-appbar-icon', logo.props.className) });
}

/** The app bar's branding: the product mark and the app name. */
const AppBarBrand = React.forwardRef<HTMLDivElement, AppBarBrandProps>(function AppBarBrand(
  { logo, children, ...other },
  ref,
) {
  return (
    <BrandingRegion ref={ref} data-region="branding" data-component="Branding" {...other}>
      <Lockup data-region="branding-lockup">
        {logo !== null && (
          <Logo data-region="branding-logo">
            {logo === undefined ? <LogoPlaceholder /> : decorateLogo(logo)}
          </Logo>
        )}
        {children != null && (
          <Name data-region="branding-name">
            <Typography variant="caption">{children}</Typography>
          </Name>
        )}
      </Lockup>
    </BrandingRegion>
  );
});

export default AppBarBrand;
