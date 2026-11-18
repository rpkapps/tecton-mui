/** A fixed-position drop indicator managed outside React (no re-renders while dragging). */
export class DragIndicator {
  private el: HTMLDivElement | null = null;

  show(rect: { left: number; top: number; width: number; height: number }): void {
    if (typeof document === 'undefined') return;
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.className = 'TectonDataGrid-dropIndicator';
      this.el.setAttribute('aria-hidden', 'true');
      Object.assign(this.el.style, {
        position: 'fixed',
        zIndex: '1500',
        pointerEvents: 'none',
        background: 'var(--tecton-color-focus-ring, #1976d2)',
        borderRadius: '1px',
      });
      document.body.appendChild(this.el);
    }
    Object.assign(this.el.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

  hide(): void {
    this.el?.remove();
    this.el = null;
  }
}

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    !!target.closest(
      'button, input, textarea, select, a, [role="separator"], .MuiDataGrid-columnSeparator',
    )
  );
}
