// Page-level modal layer: modals (Dialog, Drawer, Popover, Menu, Select menus ...) rendered by
// different copies of the library on one page stack like modals of one copy.
//
// Every copy of MUI keeps its open modals in its own private manager, which decides which modal's
// focus trap is active, locks page scroll and hides the rest of the page from assistive
// technology. Micro-frontends that each bundle the library (possibly in different versions) get one
// manager each, so a dialog of one copy over a dialog of another makes the two focus traps fight
// over the focus, and closing them out of order unlocks scroll too early, exposes the page behind
// a still-open dialog, or leaves scroll locked for good.
//
// The layer coordinates them through the DOM only (MUI's public `MuiModal-root` / `MuiModal-hidden`
// classes, `inert`, the page's scroll styles), never through MUI internals:
// - A page-wide stack of the open modal roots, in the order they opened. A lower modal of another
//   copy than the top one is `inert`, so its focus trap cannot take the focus back. Copies are told
//   apart through a ref every copy's theme gives its modal roots (`withModalRegistration`); a
//   modal without one (an old library version, plain MUI) belongs to copy "unknown".
// - While modals of more than one copy took part since the first one opened, page scroll stays
//   locked until the last one closes and then gets the page's own style back, and the page behind
//   the top modal stays hidden from assistive technology. With one copy the layer writes nothing:
//   MUI handles that case itself.
// - It re-syncs in a capture-phase `focusin` listener, which runs before the focus traps'
//   listeners on `document`, and through a MutationObserver.
//
// `ThemeProvider` installs it; consumers set nothing up. One layer runs per page: the one with the
// highest `MODAL_LAYER_PROTOCOL` takes over from an older one (with its state), an older or equal
// one leaves it alone. The global slots, the handover state and the DOM marks below are the
// protocol between library versions: change them only by adding.
import type { Theme } from '@mui/material/styles';
import setRef from '@mui/utils/setRef';

/** Bump when the layer's behavior changes; the newest layer on the page runs. */
export const MODAL_LAYER_PROTOCOL = 1;

const LAYER_SLOT = Symbol.for('tecton-mui.modalLayer');
const COPIES_SLOT = Symbol.for('tecton-mui.modalCopies');
const MODAL_ROOT = '.MuiModal-root';
const MODAL_HIDDEN = 'MuiModal-hidden';
// Focus-trap sentinels lose their tab stop as soon as a modal starts to close. Optional fast path:
// without them a modal counts as closing once its root is gone.
const SENTINEL = ':scope > [data-testid="sentinelStart"]';
/** Marks on what the layer changed itself; it never undoes what it did not do. */
const INERT_MARK = 'data-tecton-modal-layer-inert';
const ARIA_MARK = 'data-tecton-modal-layer-hidden';
const FIXED = '.mui-fixed';
// Same list as MUI's ModalManager: elements that cannot carry `aria-hidden`.
const ARIA_FORBIDDEN = new Set([
  'TEMPLATE',
  'SCRIPT',
  'STYLE',
  'LINK',
  'MAP',
  'META',
  'NOSCRIPT',
  'PICTURE',
  'COL',
  'COLGROUP',
  'PARAM',
  'SLOT',
  'SOURCE',
  'TRACK',
]);
/** After the last modal closed, a copy that restores a stale scroll lock this late is undone. */
const STALE_LOCK_GRACE_MS = 500;
const UNKNOWN_COPY: object = Object.freeze({ copy: 'unknown' });

// ---------------------------------------------------------------- copies

/** This copy of the library. */
const COPY: object = Object.freeze({ copy: '@tecton-mui/ui' });

/** Modal root -> the library copy that rendered it. Shared by every copy on the page. */
export function getModalCopies(): WeakMap<Element, object> {
  const registry = globalThis as unknown as Record<symbol, WeakMap<Element, object> | undefined>;
  return (registry[COPIES_SLOT] ??= new WeakMap());
}

let syncQueued = false;

/** Ref every Modal root gets through the theme. */
export function registerModalRoot(element: Element | null): void {
  if (!element) return;
  getModalCopies().set(element, COPY);
  // A root can be seen before its ref attaches (a Menu focuses its item in a layout effect, before
  // its root's ref): it counted as copy "unknown" until now, so let the layer look again.
  if (syncQueued) return;
  syncQueued = true;
  queueMicrotask(() => {
    syncQueued = false;
    (globalThis as unknown as Record<symbol, Installed | undefined>)[LAYER_SLOT]?.sync();
  });
}

type SlotProps = Record<string, unknown> & { ref?: React.Ref<Element> };
type RootSlotProps = SlotProps | ((...args: unknown[]) => SlotProps) | undefined;

function withRegistrationRef(props: SlotProps | undefined): SlotProps {
  const own = props?.ref;
  return {
    ...props,
    ref: own
      ? (element: Element | null) => {
          registerModalRoot(element);
          setRef(own, element);
        }
      : registerModalRoot,
  };
}

function registeringRoot(root: RootSlotProps): RootSlotProps {
  if (typeof root === 'function') return (...args: unknown[]) => withRegistrationRef(root(...args));
  return withRegistrationRef(root);
}

const registeredThemes = new WeakSet<object>();
const derivedThemes = new WeakMap<object, object>();

function registeredComponents(components: NonNullable<Theme['components']>) {
  const modal = components.MuiModal ?? {};
  const defaultProps = (modal.defaultProps ?? {}) as { slotProps?: { root?: RootSlotProps } };
  return {
    ...components,
    MuiModal: {
      ...modal,
      defaultProps: {
        ...defaultProps,
        slotProps: {
          ...defaultProps.slotProps,
          root: registeringRoot(defaultProps.slotProps?.root),
        },
      },
    },
  } as NonNullable<Theme['components']>;
}

/**
 * Gives the theme's modals the registration ref (as `MuiModal` default `slotProps.root.ref`, next
 * to any ref of the theme's own). Returns the same theme when it is already registered, and a
 * cached derived theme otherwise; themes without `components` (partial nested themes) are left
 * alone, since adding the key would replace the outer theme's components.
 */
export function withModalRegistration<T extends object>(theme: T): T {
  if (registeredThemes.has(theme)) return theme;
  const components = (theme as { components?: Theme['components'] }).components;
  if (!components) return theme;
  let derived = derivedThemes.get(theme) as T | undefined;
  if (!derived) {
    derived = { ...theme, components: registeredComponents(components) };
    registeredThemes.add(derived);
    derivedThemes.set(theme, derived);
  }
  return derived;
}

/** Registers a theme this library just built, in place (keeps its identity). */
export function registerOwnTheme<T extends object>(theme: T): T {
  const target = theme as { components?: Theme['components'] };
  if (target.components) target.components = registeredComponents(target.components);
  registeredThemes.add(theme);
  return theme;
}

// ---------------------------------------------------------------- layer

interface ScrollStyle {
  overflow: string;
  overflowX: string;
  overflowY: string;
  paddingRight: string;
}

interface Session {
  /** The inline styles of `<body>` and `<html>` from before the first modal opened. */
  baseline: { body: ScrollStyle; html: ScrollStyle };
  /** Every modal root open during the session (its copies decide whether the layer acts). */
  roots: Element[];
  /**
   * The element a copy locked (MUI locks `<html>` when that scrolls itself, else `<body>`), once
   * one did: learned from the lock, since the lock itself hides what was scrolling before.
   */
  container: 'body' | 'html' | null;
  /** `.mui-fixed` paddings the layer added when it locked scroll again. */
  fixed: Array<[HTMLElement, string]>;
}

/** What an older layer hands to the newer one that replaces it. Fields are only ever added. */
export interface ModalLayerHandover {
  order: Element[];
  session: Session | null;
  lastFocus: Array<[Element, HTMLElement]>;
}

export interface ModalLayer {
  readonly protocol: number;
  /** Re-reads the page; the layer calls it itself on focus changes and DOM changes. */
  sync(): void;
  /** Stops the layer and returns its state for the layer that replaces it. */
  dispose(): ModalLayerHandover;
}

const STYLE_PROPS = ['overflow', 'overflowX', 'overflowY', 'paddingRight'] as const;
const CSS_NAME: Record<(typeof STYLE_PROPS)[number], string> = {
  overflow: 'overflow',
  overflowX: 'overflow-x',
  overflowY: 'overflow-y',
  paddingRight: 'padding-right',
};

function readStyle(doc: Document, styleText: string | null | undefined): ScrollStyle {
  const probe = doc.createElement('div');
  probe.setAttribute('style', styleText ?? '');
  return {
    overflow: probe.style.overflow,
    overflowX: probe.style.overflowX,
    overflowY: probe.style.overflowY,
    paddingRight: probe.style.paddingRight,
  };
}

function setStyle(el: HTMLElement, prop: string, value: string): void {
  if (value) el.style.setProperty(prop, value);
  else el.style.removeProperty(prop);
}

export interface ModalLayerOptions {
  /** Clock for the stale-lock grace period (tests). */
  now?: () => number;
}

export function createModalLayer(
  doc: Document,
  protocol: number = MODAL_LAYER_PROTOCOL,
  handover?: ModalLayerHandover,
  { now = () => Date.now() }: ModalLayerOptions = {},
): ModalLayer {
  const win = doc.defaultView!;
  const html = doc.documentElement;
  const body = doc.body;
  let order: Element[] = handover?.order.filter((el) => el.isConnected) ?? [];
  let session: Session | null = handover?.session ?? null;
  const lastFocus = new Map<Element, HTMLElement>(handover?.lastFocus ?? []);
  /** Baseline to re-apply if a copy writes a stale lock right after the session ended. */
  let ended: { container: HTMLElement; baseline: ScrollStyle; until: number } | null = null;
  let observed: Element[] | null = null;
  let disposed = false;

  const copyOf = (el: Element) => getModalCopies().get(el) ?? UNKNOWN_COPY;
  const isPresent = (el: Element) => el.isConnected && !el.classList.contains(MODAL_HIDDEN);
  const isClosing = (el: Element) => el.querySelector(SENTINEL)?.getAttribute('tabindex') === '-1';
  const elementOf = (name: 'body' | 'html') => (name === 'html' ? html : body);
  const isStyleRecord = (r: MutationRecord, el: Element) =>
    r.type === 'attributes' && r.target === el && r.attributeName === 'style';

  function startSession(records: MutationRecord[]): Session {
    // A copy may already have locked scroll in this batch: its first write holds the old style.
    const before = (el: HTMLElement) => {
      const first = records.find((r) => isStyleRecord(r, el));
      return readStyle(doc, first ? first.oldValue : el.getAttribute('style'));
    };
    return {
      baseline: { body: before(body), html: before(html) },
      roots: [],
      container: null,
      fixed: [],
    };
  }

  /** Whether modals of more than one copy took part in the session (read fresh: roots register late). */
  const isMixed = (s: Session) => new Set(s.roots.map(copyOf)).size > 1;

  function clearMarks(): void {
    doc.querySelectorAll(`[${INERT_MARK}]`).forEach((el) => {
      el.removeAttribute('inert');
      el.removeAttribute(INERT_MARK);
    });
    doc.querySelectorAll(`[${ARIA_MARK}]`).forEach((el) => {
      el.removeAttribute('aria-hidden');
      el.removeAttribute(ARIA_MARK);
    });
  }

  function lockAgain(s: Session, container: HTMLElement): void {
    // Same measure as MUI: the page scrollbar is visible again now that a copy unlocked.
    const scrollbar = win.innerWidth - html.clientWidth;
    if (scrollbar > 0) {
      const padding = parseFloat(win.getComputedStyle(container).paddingRight) || 0;
      container.style.paddingRight = `${padding + scrollbar}px`;
      doc.querySelectorAll<HTMLElement>(FIXED).forEach((el) => {
        if (s.fixed.some(([fixed]) => fixed === el)) return;
        s.fixed.push([el, el.style.paddingRight]);
        const own = parseFloat(win.getComputedStyle(el).paddingRight) || 0;
        el.style.paddingRight = `${own + scrollbar}px`;
      });
    }
    container.style.overflow = 'hidden';
  }

  function endSession(s: Session): void {
    if (isMixed(s) && s.container) {
      const container = elementOf(s.container);
      const baseline = s.baseline[s.container];
      STYLE_PROPS.forEach((prop) => setStyle(container, CSS_NAME[prop], baseline[prop]));
      s.fixed.forEach(([el, value]) => setStyle(el, 'padding-right', value));
      ended = { container, baseline, until: now() + STALE_LOCK_GRACE_MS };
    }
    clearMarks();
  }

  function hiddenTargets(top: Element): Set<Element> {
    // Mirrors MUI's ModalManager: everything except the top modal and its ancestors' chain.
    const chain = new Set<Element>();
    let el: Element | null = top;
    while (el && el !== body) {
      chain.add(el);
      el = el.parentElement;
    }
    const out = new Set<Element>();
    if (el !== body) return out;
    const collect = (parent: Element) => {
      Array.from(parent.children).forEach((child) => {
        if (child === top || ARIA_FORBIDDEN.has(child.tagName)) return;
        if (child.tagName === 'INPUT' && child.getAttribute('type') === 'hidden') return;
        if (chain.has(child)) collect(child);
        else out.add(child);
      });
    };
    collect(body);
    return out;
  }

  function sync(records: MutationRecord[] = observer.takeRecords()): void {
    if (disposed) return;
    const present = Array.from(doc.querySelectorAll(MODAL_ROOT)).filter(isPresent);
    order = order
      .filter((el) => present.includes(el))
      .concat(present.filter((el) => !order.includes(el)));
    for (const root of lastFocus.keys()) if (!root.isConnected) lastFocus.delete(root);

    if (!session && present.length > 0) {
      session = startSession(records);
      ended = null;
    }
    if (session) {
      for (const el of present) if (!session.roots.includes(el)) session.roots.push(el);
    }
    if (session && present.length === 0) {
      endSession(session);
      session = null;
    } else if (!session && ended) {
      // A copy restored a lock it took before the session ended: the page keeps its own style.
      const { container, baseline, until } = ended;
      if (now() > until) ended = null;
      else if (container.style.overflow === 'hidden' && baseline.overflow !== 'hidden') {
        STYLE_PROPS.forEach((prop) => setStyle(container, CSS_NAME[prop], baseline[prop]));
      }
    }

    if (session && isMixed(session)) reconcile(session, order);
    else if (session) clearMarks(); // one copy after all (a late registration): leave it to MUI
    observe(present);
    observer.takeRecords(); // drop the records of the layer's own writes
  }

  function reconcile(s: Session, opened: Element[]): void {
    // Scroll: once a copy locked the page, it stays locked as long as a modal is present.
    if (!s.container) {
      s.container =
        (['html', 'body'] as const).find(
          (name) =>
            elementOf(name).style.overflow === 'hidden' && s.baseline[name].overflow !== 'hidden',
        ) ?? null;
    }
    if (s.container && elementOf(s.container).style.overflow !== 'hidden') {
      lockAgain(s, elementOf(s.container));
    }

    // Focus: every modal of another copy than the top one is inert. A closing modal is never the
    // top, so the one below gets its focus back as soon as the closing starts; but it stays inert
    // until it is gone, since its trap still listens while it gives the focus back.
    const top = opened.filter((el) => !isClosing(el)).at(-1) ?? null;
    const topCopy = top ? copyOf(top) : null;
    const inert = new Set(
      top
        ? opened.filter((el) => el !== top && copyOf(el) !== topCopy)
        : opened.filter((el) => el.hasAttribute(INERT_MARK)), // all closing: keep what is inert
    );
    let released = false;
    for (const el of Array.from(doc.querySelectorAll(`[${INERT_MARK}]`))) {
      if (inert.has(el)) continue;
      el.removeAttribute('inert');
      el.removeAttribute(INERT_MARK);
      if (el === top) released = true;
    }
    for (const el of inert) {
      if (el.hasAttribute('inert')) continue;
      el.setAttribute('inert', '');
      el.setAttribute(INERT_MARK, '');
    }
    // The closing modal's trap gave the focus back while this one was still inert, which did
    // nothing: put it back on the element this modal had.
    if (released && top) {
      const active = doc.activeElement;
      const lost = !active || active === body || !top.contains(active);
      const target = lastFocus.get(top);
      if (lost && target?.isConnected && top.contains(target)) target.focus();
    }

    // Assistive technology: the page behind the top modal stays hidden. Adds only what is
    // missing and removes only its own marks.
    const hidden = top ? hiddenTargets(top) : new Set<Element>();
    doc.querySelectorAll(`[${ARIA_MARK}]`).forEach((el) => {
      if (hidden.has(el)) return;
      el.removeAttribute('aria-hidden');
      el.removeAttribute(ARIA_MARK);
    });
    hidden.forEach((el) => {
      if (el.getAttribute('aria-hidden') === 'true') return;
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute(ARIA_MARK, '');
    });
  }

  const observer = new MutationObserver((records) => sync(records));

  /** Watches the body's children, the scroll styles and the open modal roots, nothing else. */
  function observe(present: Element[]): void {
    const targets = present.flatMap((root) => {
      const sentinel = root.querySelector(SENTINEL);
      return sentinel ? [root, sentinel] : [root];
    });
    if (observed?.length === targets.length && observed.every((el, i) => el === targets[i])) return;
    observer.disconnect();
    observer.observe(body, {
      childList: true,
      attributes: true,
      attributeFilter: ['style'],
      attributeOldValue: true,
    });
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['style'],
      attributeOldValue: true,
    });
    targets.forEach((el) =>
      observer.observe(el, { attributes: true, attributeFilter: ['class', 'tabindex'] }),
    );
    observed = targets;
  }

  const onFocusIn = (event: FocusEvent) => {
    const target = event.target as Element | null;
    const root = typeof target?.closest === 'function' ? target.closest(MODAL_ROOT) : null;
    if (root && target instanceof win.HTMLElement) lastFocus.set(root, target);
    sync();
  };
  // Capture phase: runs before the focus traps' `focusin` listeners on `document`.
  doc.addEventListener('focusin', onFocusIn, true);
  observe([]);
  sync([]);

  return {
    protocol,
    sync: () => sync(),
    dispose() {
      disposed = true;
      observer.disconnect();
      doc.removeEventListener('focusin', onFocusIn, true);
      return { order, session, lastFocus: Array.from(lastFocus) };
    },
  };
}

/** What the global slot holds (protocol between library versions: only ever add members). */
interface Installed {
  protocol: number;
  sync(): void;
  dispose(): ModalLayerHandover;
}

/**
 * Installs the page's modal layer unless one with this protocol or a newer one already runs; a
 * newer protocol takes over from an older layer and its state. Idempotent; `ThemeProvider` calls
 * it on mount. Browser only.
 */
export function installModalLayer(
  doc: Document | undefined = globalThis.document,
  protocol: number = MODAL_LAYER_PROTOCOL,
): void {
  if (!doc?.body || typeof MutationObserver === 'undefined') return;
  const registry = globalThis as unknown as Record<symbol, Installed | undefined>;
  const current = registry[LAYER_SLOT];
  if (current && current.protocol >= protocol) return;
  registry[LAYER_SLOT] = createModalLayer(doc, protocol, current?.dispose());
}

/** @internal test helper */
export function __uninstallModalLayerForTests(): void {
  const registry = globalThis as unknown as Record<symbol, Installed | undefined>;
  registry[LAYER_SLOT]?.dispose();
  delete registry[LAYER_SLOT];
}
