import * as React from 'react';

/** Attaches behavior to a mounted grid root; the function it returns detaches it again. */
export type GridRootAttach = (root: HTMLDivElement) => void | (() => void);

/**
 * The grid root element as a ref object that also tells observers when a root element mounts.
 *
 * Effects cannot read `ref.current` once on mount: after hydration the Community grid renders its
 * root one render late (`useIsSSR`), so the first client commit has no root, and an effect keyed
 * on the (stable) ref never runs again. Observers attach as soon as a root exists, without a
 * React re-render.
 */
export interface GridRootRef extends React.RefObject<HTMLDivElement | null> {
  /** Stable callback ref for the root element. */
  readonly setRef: (element: HTMLDivElement | null) => void;
  /**
   * Calls `attach` with the root now, when it is mounted, or else as soon as one mounts. What
   * `attach` returns runs on unsubscribe (the effect cleanup) or when a different root element
   * replaces this one. A root that unmounts keeps its attachments until then, so they are torn
   * down with the effects, as with a plain effect. Returns the unsubscribe function.
   */
  observe(attach: GridRootAttach): () => void;
}

export function createGridRootRef(): GridRootRef {
  const detachers = new Map<GridRootAttach, (() => void) | void>();
  /** The element the current attachments belong to. */
  let attachedTo: HTMLDivElement | null = null;
  const ref: GridRootRef = {
    current: null,
    setRef(element) {
      ref.current = element;
      if (!element || element === attachedTo) return;
      attachedTo = element;
      for (const [attach, detach] of detachers) {
        detachers.set(attach, undefined);
        detach?.();
        detachers.set(attach, attach(element));
      }
    },
    observe(attach) {
      detachers.set(attach, ref.current ? attach(ref.current) : undefined);
      return () => {
        const detach = detachers.get(attach);
        detachers.delete(attach);
        detach?.();
      };
    },
  };
  return ref;
}

/** A `GridRootRef` with a stable identity for the lifetime of the component. */
export function useGridRootRef(): GridRootRef {
  const [ref] = React.useState(createGridRootRef);
  return ref;
}
