'use client';
// What the heading's parts share with their `Heading`: the current layout, and a registry through
// which `Heading` measures them (see layout.ts and Heading.tsx).
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import type { ActionsMeasure, HeadingLayout, TabsMeasure } from './layout.js';

export interface HeadingPartMeasures {
  title: number;
  tabs: TabsMeasure;
  actions: ActionsMeasure;
}

export type HeadingPart = keyof HeadingPartMeasures;

export interface HeadingPartEntry<P extends HeadingPart = HeadingPart> {
  /** The part's element in the heading's row; its size changes start a new measure. */
  element: HTMLElement;
  /** Reads the part's natural widths. Called while the layout is `measuring`. */
  measure: () => HeadingPartMeasures[P];
}

export interface HeadingContextValue {
  layout: HeadingLayout;
  /** The heading is narrow (720px and below): the tabs are one dropdown, the primary action an icon. */
  narrow: boolean;
  register: <P extends HeadingPart>(part: P, entry: HeadingPartEntry<P>) => () => void;
  /** Measures the parts again (their content changed) and shares the row anew. */
  requestMeasure: () => void;
}

export const HeadingContext = React.createContext<HeadingContextValue | null>(null);

/**
 * Registers a part with its `Heading`, which measures it through `measure`. Returns the heading's
 * context, or `null` outside a `Heading` (the part then shows everything).
 */
export function useHeadingPart<P extends HeadingPart>(
  part: P,
  elementRef: React.RefObject<HTMLElement | null>,
  measure: () => HeadingPartMeasures[P],
) {
  const context = React.useContext(HeadingContext);
  const measureRef = React.useRef(measure);
  useEnhancedEffect(() => {
    measureRef.current = measure;
  });
  const register = context?.register;
  useEnhancedEffect(() => {
    const element = elementRef.current;
    if (!register || !element) return undefined;
    return register(part, { element, measure: () => measureRef.current() });
  }, [register, part, elementRef]);
  return context;
}

/** A computed length in pixels (`0` for `normal` or an empty value). */
export function px(value: string) {
  return Number.parseFloat(value) || 0;
}

/** An element's laid out width, with sub-pixel precision. */
export function widthOf(element: Element | null | undefined) {
  return element ? element.getBoundingClientRect().width : 0;
}
