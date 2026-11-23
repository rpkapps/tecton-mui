'use client';
// Heading: the Tecton page heading (Figma "Heading", Tecton Storybook "Organisms/Heading"). Material
// UI has no such component; this one is composed from Material parts, so every surface, state and
// colour comes from the theme. Its parts go in as children, MUI style:
//
//   <Heading>
//     <HeadingTitle onHomeClick={…} onMenuClick={…}>Portfolio</HeadingTitle>
//     <HeadingTabs value={tab} onChange={…} aria-label="Portfolio sections">
//       <Tab label="Overview" />
//       <Tab label="Team" />
//     </HeadingTabs>
//     <HeadingActions>
//       <Button variant="contained" startIcon={…}>New Project</Button>
//     </HeadingActions>
//   </Heading>
//
// The row lays the parts out as the Figma heading frame does: the title cluster, then the tabs, then
// the actions at the end. It never wraps: when the parts do not fit, the actions collapse into an
// overflow button and the tabs into a More pill, and a narrow heading gives the tabs a row of their
// own (layout.ts). `Heading` measures the parts' natural widths in a pass that is never painted
// (all items shown, in a layout effect) whenever its own size or a part's size changes, and the
// parts render what the layout gives them.
import * as React from 'react';
import clsx from 'clsx';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { styled, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';
import {
  HeadingContext,
  px,
  type HeadingContextValue,
  type HeadingPart,
  type HeadingPartEntry,
} from './HeadingContext.js';
import { allocateHeading, FULL_LAYOUT, INITIAL_LAYOUT, type HeadingLayout } from './layout.js';

export const headingClasses = {
  /** The heading row. */
  root: 'TectonHeading-root',
  /** On the root of a narrow heading, whose tabs have a row of their own. */
  compact: 'TectonHeading-compact',
  /** On the root with `disableGutters`. */
  disableGutters: 'TectonHeading-disableGutters',
  /** `HeadingTitle`: the title cluster (home button, title, menu button). */
  title: 'TectonHeading-title',
  /** The title text (a `Typography`). */
  titleText: 'TectonHeading-titleText',
  /** The home button before the title. */
  homeButton: 'TectonHeading-homeButton',
  /** The menu (chevron) button after the title. */
  menuButton: 'TectonHeading-menuButton',
  /** `HeadingTabs`: the `Tabs` root. */
  tabs: 'TectonHeading-tabs',
  /** The tab group's paper surface, holding the tabs and the More pill. */
  tabGroup: 'TectonHeading-tabGroup',
  /** The More pill, for the tabs that do not fit. */
  moreButton: 'TectonHeading-moreButton',
  /** `HeadingActions`: the actions at the end of the row. */
  actions: 'TectonHeading-actions',
  /** The overflow (⋮) button, for the actions that do not fit. */
  overflowButton: 'TectonHeading-overflowButton',
  /** The tray the overflow button opens, holding those actions. */
  overflowTray: 'TectonHeading-overflowTray',
} as const;

export type HeadingClassKey = keyof typeof headingClasses;

export interface HeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The heading's content: `HeadingTitle`, `HeadingTabs`, `HeadingActions` or any of your own. */
  children?: React.ReactNode;
  /**
   * The component used for the root node: a string for an HTML element (for example `'header'`) or
   * a component.
   * @default 'div'
   */
  component?: React.ElementType;
  /**
   * Removes the inline padding (the Figma frame's 72px gutters, narrower below the theme's `md`
   * breakpoint), for a heading inside a container that already has its own.
   * @default false
   */
  disableGutters?: boolean;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

const part = (name: HeadingPart) => `& > [data-heading-part="${name}"]`;

/**
 * The heading's own width class: `lg` from the theme's `md` breakpoint width up, `md` from `sm`,
 * `sm` below. It sets the gutters, so a heading in a narrow panel is as roomy as on a phone.
 */
type HeadingWidth = 'sm' | 'md' | 'lg';

function widthClass(width: number, breakpoints: Theme['breakpoints']['values']): HeadingWidth {
  if (width >= breakpoints.md) return 'lg';
  return width >= breakpoints.sm ? 'md' : 'sm';
}

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const HeadingRoot = styled('div', { name: 'TectonHeading', slot: 'Root' })({
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  // Figma: the title cluster and the tab group sit space-400 apart.
  columnGap: cssVar('space-400'),
  rowGap: cssVar('space-100'),
  // Figma heading frame: space-400 above and below, space-900 gutters. A narrower heading has
  // narrower gutters (its width class, set before the first paint). Variables, so that an `sx`
  // padding still wins.
  '--TectonHeading-gutter': cssVar('space-900'),
  '--TectonHeading-inset': cssVar('space-400'),
  '&[data-width="md"]': { '--TectonHeading-gutter': cssVar('space-400') },
  '&[data-width="sm"]': {
    '--TectonHeading-gutter': cssVar('space-200'),
    '--TectonHeading-inset': cssVar('space-300'),
  },
  paddingTop: 'var(--TectonHeading-inset)',
  paddingBottom: 'var(--TectonHeading-inset)',
  paddingLeft: 'var(--TectonHeading-gutter)',
  paddingRight: 'var(--TectonHeading-gutter)',
  [`&.${headingClasses.disableGutters}`]: { paddingLeft: 0, paddingRight: 0 },
  // The title gives way last, with an ellipsis; the tabs and the actions take what the layout gives
  // them (their own collapsing).
  [part('title')]: { flex: '0 1 auto', minWidth: 0 },
  [part('tabs')]: { flex: 'none' },
  [part('actions')]: { flex: 'none' },
  // Compact: the title and the actions on the first row, the tabs on a row of their own.
  [`&.${headingClasses.compact}`]: {
    flexWrap: 'wrap',
    [part('title')]: { flex: '1 1 0%' },
    [part('tabs')]: { order: 1, flexBasis: '100%' },
  },
  // Measure pass (never painted): every part at its natural width.
  '&[data-measuring]': {
    [part('title')]: { flex: 'none' },
  },
});

/** Reads the parts' widths and shares the row between them. */
function measureHeading(
  root: HTMLElement,
  parts: Map<HeadingPart, HeadingPartEntry>,
): HeadingLayout {
  if (root.getClientRects().length === 0) return FULL_LAYOUT;
  const style = getComputedStyle(root);
  const available = root.clientWidth - px(style.paddingLeft) - px(style.paddingRight);
  if (available <= 0) return FULL_LAYOUT;
  const measure = <P extends HeadingPart>(name: P) =>
    (parts.get(name) as HeadingPartEntry<P> | undefined)?.measure() ?? null;
  return allocateHeading({
    available,
    gap: px(style.columnGap),
    title: measure('title'),
    tabs: measure('tabs'),
    actions: measure('actions'),
  });
}

/**
 * Tecton page heading. Compose it from `HeadingTitle`, `HeadingTabs` (holding MUI `Tab` elements)
 * and `HeadingActions`, or any content of your own. When the parts do not fit in its row, the
 * actions and the tabs collapse into overflow menus.
 *
 * Demos: [Heading](/components/heading)
 */
const Heading = React.forwardRef<HTMLDivElement, HeadingProps>(function Heading(props, ref) {
  const { component, disableGutters = false, className, ...other } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const handleRef = useForkRef(rootRef, ref);
  const [layout, setLayout] = React.useState<HeadingLayout>(INITIAL_LAYOUT);
  const [width, setWidth] = React.useState<HeadingWidth>('lg');
  const breakpoints = useTheme().breakpoints.values;
  const parts = React.useRef(new Map<HeadingPart, HeadingPartEntry>());
  const observer = React.useRef<ResizeObserver | null>(null);

  const requestMeasure = React.useCallback(() => {
    setLayout((current) => (current.measuring ? current : { ...current, measuring: true }));
  }, []);

  const register = React.useCallback(
    <P extends HeadingPart>(name: P, entry: HeadingPartEntry<P>) => {
      const stored = entry as unknown as HeadingPartEntry<HeadingPart>;
      parts.current.set(name, stored);
      observer.current?.observe(entry.element);
      return () => {
        if (parts.current.get(name) === stored) parts.current.delete(name);
        observer.current?.unobserve(entry.element);
        requestMeasure();
      };
    },
    [requestMeasure],
  );

  // Any change of size, of the heading or of one of its parts (a label, a font that loaded, a tab
  // added), measures again. A measure that changes nothing changes no size, so this settles.
  useEnhancedEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    const resizeObserver = new ResizeObserver(requestMeasure);
    observer.current = resizeObserver;
    resizeObserver.observe(root);
    parts.current.forEach((entry) => resizeObserver.observe(entry.element));
    return () => {
      resizeObserver.disconnect();
      observer.current = null;
    };
  }, [requestMeasure]);

  // The parts' layout effects (registration) have run: measure them before the browser paints.
  // First the width class, whose gutters the measure must see (one more pass when it changes).
  useEnhancedEffect(() => {
    const root = rootRef.current;
    if (!layout.measuring || !root) return;
    if (root.getClientRects().length > 0) {
      const next = widthClass(root.getBoundingClientRect().width, breakpoints);
      if (next !== width) {
        setWidth(next);
        return;
      }
    }
    setLayout(measureHeading(root, parts.current));
  }, [layout, width, breakpoints]);

  const context = React.useMemo<HeadingContextValue>(
    () => ({ layout, register, requestMeasure }),
    [layout, register, requestMeasure],
  );

  return (
    <HeadingContext.Provider value={context}>
      <HeadingRoot
        ref={handleRef}
        as={component}
        data-measuring={layout.measuring ? '' : undefined}
        data-width={width}
        className={clsx(
          headingClasses.root,
          layout.compact && !layout.measuring && headingClasses.compact,
          disableGutters && headingClasses.disableGutters,
          className,
        )}
        {...other}
      />
    </HeadingContext.Provider>
  );
});

export default Heading;
