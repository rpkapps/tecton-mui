'use client';
import * as React from 'react';
import clsx from 'clsx';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { sxList } from '../internal/sxList.js';
import { headingClasses } from './Heading.js';
import { useHeadingPart, widthOf } from './HeadingContext.js';

export interface HeadingTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The title. */
  children?: React.ReactNode;
  /**
   * Shows the home button before the title and is called when it is clicked. A home button with an
   * `href` in `slotProps.homeButton` shows without it.
   */
  onHomeClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Shows the menu button (a chevron) after the title and is called when it is clicked, for example
   * to open a `Menu` that switches to another page of the same kind.
   */
  onMenuClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Props for the title's own parts. */
  slotProps?: {
    /**
     * Props of the title text, a `Typography` (`variant="h4"`, an `<h1>` by default, `noWrap` so
     * that a heading out of room ends it with an ellipsis): for example `component: 'h2'` for a
     * section heading.
     */
    title?: Partial<TypographyProps> & { component?: React.ElementType };
    /**
     * Props of the home button, an `IconButton`: its `aria-label` (default "Home"), or an `href`
     * that makes it a link.
     */
    homeButton?: Partial<IconButtonProps> & { href?: string };
    /**
     * Props of the menu button, an `IconButton`: its `aria-label` (default "Page menu"), and
     * `aria-expanded` and `aria-controls` for the menu it opens (`aria-haspopup` is `"menu"`).
     */
    menuButton?: Partial<IconButtonProps>;
  };
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

const TitleRoot = styled('div', { name: 'TectonHeading', slot: 'Title' })({
  display: 'flex',
  alignItems: 'center',
  // Figma: the home button, the title and the chevron sit space-75 apart.
  gap: cssVar('space-75'),
  // A narrow heading shortens the title, never its buttons.
  [`& > .${headingClasses.homeButton}, & > .${headingClasses.menuButton}`]: { flexShrink: 0 },
  // Figma: their glyphs in the tertiary text color, in every state (`&&`: over the theme's).
  [`&& > .${headingClasses.homeButton}, && > .${headingClasses.menuButton}`]: {
    color: cssVar('color-action-tertiary-text'),
  },
});

// Tecton heading-1 type (the theme's `h4`) without the letter spacing MUI's own h4 adds. When the
// heading has no room left, the title ends with an ellipsis (`noWrap`).
const titleTextSx = { color: 'text.primary', letterSpacing: 'normal', minWidth: 0 } as const;

const MenuIcon = styled('span', { name: 'TectonHeading', slot: 'MenuIcon' })({
  fontSize: cssVar('icon-size-100'),
});

/**
 * The heading's title cluster: the title, with an optional home button before it and an optional
 * menu (chevron) button after it.
 */
const HeadingTitle = React.forwardRef<HTMLDivElement, HeadingTitleProps>(
  function HeadingTitle(props, ref) {
    const { children, onHomeClick, onMenuClick, slotProps, className, ...other } = props;
    const { sx: titleSx, className: titleClassName, ...titleProps } = slotProps?.title ?? {};
    const {
      onClick: onHomeButtonClick,
      className: homeButtonClassName,
      ...homeButtonProps
    } = slotProps?.homeButton ?? {};
    const {
      onClick: onMenuButtonClick,
      className: menuButtonClassName,
      ...menuButtonProps
    } = slotProps?.menuButton ?? {};
    const showHome = onHomeClick != null || homeButtonProps.href != null;
    const showMenu = onMenuClick != null;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(rootRef, ref);
    useHeadingPart('title', rootRef, () => widthOf(rootRef.current));

    return (
      <TitleRoot
        ref={handleRef}
        data-heading-part="title"
        className={clsx(headingClasses.title, className)}
        {...other}
      >
        {showHome && (
          <IconButton
            color="tertiary"
            aria-label="Home"
            {...homeButtonProps}
            className={clsx(headingClasses.homeButton, homeButtonClassName)}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              onHomeButtonClick?.(event);
              onHomeClick?.(event);
            }}
          >
            <span className="tecton-home-filled" aria-hidden />
          </IconButton>
        )}
        <Typography
          variant="h4"
          component="h1"
          noWrap
          {...titleProps}
          className={clsx(headingClasses.titleText, titleClassName)}
          sx={[titleTextSx, ...sxList(titleSx)]}
        >
          {children}
        </Typography>
        {showMenu && (
          <IconButton
            color="tertiary"
            size="small"
            aria-label="Page menu"
            aria-haspopup="menu"
            {...menuButtonProps}
            className={clsx(headingClasses.menuButton, menuButtonClassName)}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              onMenuButtonClick?.(event);
              onMenuClick?.(event);
            }}
          >
            <MenuIcon className="tecton-chevron-down-outline" aria-hidden />
          </IconButton>
        )}
      </TitleRoot>
    );
  },
);

export default HeadingTitle;
