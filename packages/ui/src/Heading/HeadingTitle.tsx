'use client';
import * as React from 'react';
import clsx from 'clsx';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { sxList } from '../internal/sxList.js';
import { headingClasses } from './Heading.js';

export interface HeadingTitleProps extends Omit<TypographyProps, 'component' | 'ref'> {
  /** The title. */
  children?: React.ReactNode;
  /**
   * The component used for the root node: for example `'h2'` for a section heading.
   * @default 'h1'
   */
  component?: React.ElementType;
  /**
   * The Typography variant.
   * @default 'h4' (Tecton heading-1)
   */
  variant?: TypographyProps['variant'];
  /**
   * The title stays on one line and ends with an ellipsis when the heading has no room left.
   * @default true
   */
  noWrap?: boolean;
}

// Tecton heading-1 type (the theme's `h4`) without the letter spacing MUI's own h4 adds.
const titleSx = { color: 'text.primary', letterSpacing: 'normal' } as const;

/**
 * The heading's title: a `Typography`, an `<h1>` by default, which takes the Typography props. Put
 * an `IconButton` before it (to go home) or after it (to open a menu) in the `Heading` itself: the
 * heading sets them beside the title.
 */
const HeadingTitle = React.forwardRef<HTMLHeadingElement, HeadingTitleProps>(
  function HeadingTitle(props, ref) {
    const { className, sx, ...other } = props;
    return (
      <Typography
        ref={ref}
        variant="h4"
        component="h1"
        noWrap
        {...other}
        data-heading-part="title"
        className={clsx(headingClasses.title, className)}
        sx={[titleSx, ...sxList(sx)]}
      />
    );
  },
);

export default HeadingTitle;
