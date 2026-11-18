// DOM-only drag feedback shared by column and row reordering: a floating ghost that follows the
// pointer and a scoped stylesheet that slides the other columns/rows aside to open the drop slot.
// Nothing here touches React state, so a drag re-renders no cells; React updates once, on drop.

let sequence = 0;

/** Shadow for floating drag feedback. Always black: light shadows read as glows in dark mode. */
const GHOST_SHADOW = '0 2px 4px rgba(0, 0, 0, 0.14), 0 6px 16px rgba(0, 0, 0, 0.2)';
const SLIDE_MS = 150;

export class DragPreview {
  private readonly scope = `tdg-drag-${++sequence}`;
  private style: HTMLStyleElement | null = null;
  private ghost: HTMLElement | null = null;
  private ghostOffset = { x: 0, y: 0 };
  private observer: MutationObserver | null = null;
  private fallback: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly root: HTMLElement) {}

  /** CSS selector prefix that matches only this grid while the drag is active. */
  get selector(): string {
    return `[data-tdg-drag="${this.scope}"]`;
  }

  begin(): void {
    this.root.setAttribute('data-tdg-drag', this.scope);
    this.style = document.createElement('style');
    this.style.setAttribute('data-tecton-grid-drag', '');
    document.head.appendChild(this.style);
  }

  /** Replaces the transform rules. `targets` are selector lists (without the scope prefix). */
  setShifts(transitionTargets: string, shifts: Array<{ targets: string[]; transform: string }>) {
    if (!this.style) return;
    const prefix = (s: string) => `${this.selector} ${s}`;
    let css = `${transitionTargets
      .split(',')
      .map((s) => prefix(s.trim()))
      .join(',')}{transition:transform ${SLIDE_MS}ms ease;}`;
    for (const { targets, transform } of shifts) {
      css += `${targets.map(prefix).join(',')}{transform:${transform};position:relative;z-index:1;}`;
    }
    this.style.textContent = css;
  }

  /** Floating ghost styled from the grid's own tokens, positioned so the grab point stays put. */
  showGhost(
    content: HTMLElement,
    source: DOMRect,
    pointer: { x: number; y: number },
    options: { width?: number; height?: number },
  ): void {
    const vars = getComputedStyle(this.root);
    const read = (name: string, fallback: string) => vars.getPropertyValue(name).trim() || fallback;
    const ghost = content;
    ghost.setAttribute('aria-hidden', 'true');
    ghost.classList.add('TectonDataGrid-dragGhost');
    Object.assign(ghost.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      zIndex: '1600',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      width: `${options.width ?? source.width}px`,
      height: `${options.height ?? source.height}px`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 12px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      background: read('--DataGrid-t-color-background-overlay', '#fff'),
      color: read('--DataGrid-t-color-foreground-base', 'inherit'),
      border: `1px solid ${read('--DataGrid-t-color-border-base', 'rgba(0,0,0,0.12)')}`,
      borderRadius: read('--DataGrid-t-radius-base', '4px'),
      boxShadow: GHOST_SHADOW,
      fontFamily: vars.fontFamily,
      fontSize: vars.fontSize,
      opacity: '0.95',
      cursor: 'grabbing',
      willChange: 'transform',
    });
    this.ghostOffset = {
      x: Math.min(pointer.x - source.left, options.width ?? source.width),
      y: options.height ? options.height / 2 : pointer.y - source.top,
    };
    document.body.appendChild(ghost);
    this.ghost = ghost;
    this.moveGhost(pointer.x, pointer.y);
  }

  moveGhost(x: number, y: number): void {
    if (this.ghost)
      this.ghost.style.transform = `translate(${x - this.ghostOffset.x}px, ${y - this.ghostOffset.y}px)`;
  }

  /**
   * Ends the drag. With `until`, the slide rules stay applied until the grid's DOM reflects the
   * committed order (checked after each mutation, before paint), so the drop does not flicker.
   */
  end(until?: () => boolean): void {
    this.ghost?.remove();
    this.ghost = null;
    if (until && this.style) {
      this.observer = new MutationObserver(() => {
        if (until()) this.dispose();
      });
      this.observer.observe(this.root, { childList: true, subtree: true });
      this.fallback = setTimeout(() => this.dispose(), 600);
      return;
    }
    this.dispose();
  }

  /** Cancels: slides everything back, then removes the rules. */
  cancel(transitionTargets: string): void {
    this.ghost?.remove();
    this.ghost = null;
    this.setShifts(transitionTargets, []);
    this.fallback = setTimeout(() => this.dispose(), SLIDE_MS + 20);
  }

  dispose(): void {
    clearTimeout(this.fallback);
    this.observer?.disconnect();
    this.observer = null;
    this.ghost?.remove();
    this.ghost = null;
    this.style?.remove();
    this.style = null;
    if (this.root.getAttribute('data-tdg-drag') === this.scope)
      this.root.removeAttribute('data-tdg-drag');
  }
}

/** Escapes a value for use inside a double-quoted CSS attribute selector. */
export const cssString = (value: string): string => value.replace(/["\\]/g, '\\$&');

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    !!target.closest(
      'button, input, textarea, select, a, [role="separator"], .MuiDataGrid-columnSeparator',
    )
  );
}

/** Scroll offset along the inline axis, positive towards the logical end in LTR and RTL. */
export function logicalScrollLeft(scroller: HTMLElement | null, rtl: boolean): number {
  if (!scroller) return 0;
  return rtl ? -scroller.scrollLeft : scroller.scrollLeft;
}
