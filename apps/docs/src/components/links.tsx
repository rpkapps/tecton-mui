import * as React from 'react';
import { createLink } from '@tanstack/react-router';
import MuiLink, { type LinkProps as MuiLinkProps } from '@tecton-mui/ui/Link';
import ListItemButton, { type ListItemButtonProps } from '@tecton-mui/ui/ListItemButton';
import Button, { type ButtonProps } from '@tecton-mui/ui/Button';

const LinkBase = React.forwardRef<HTMLAnchorElement, MuiLinkProps>(function LinkBase(props, ref) {
  return <MuiLink ref={ref} {...props} />;
});

/** Router-aware Tecton `Link` (applies the base path, client-side navigation, preloading). */
export const RouterLink = createLink(LinkBase);

const ListItemLinkBase = React.forwardRef<HTMLAnchorElement, ListItemButtonProps<'a'>>(
  function ListItemLinkBase(props, ref) {
    return <ListItemButton component="a" ref={ref} {...props} />;
  },
);

/** Router-aware `ListItemButton` rendered as an anchor (navigation lists). */
export const ListItemLink = createLink(ListItemLinkBase);

const ButtonLinkBase = React.forwardRef<HTMLAnchorElement, ButtonProps<'a'>>(
  function ButtonLinkBase(props, ref) {
    return <Button component="a" ref={ref} {...props} />;
  },
);

/** Router-aware `Button` rendered as an anchor. */
export const ButtonLink = createLink(ButtonLinkBase);
