/** `IconButton` -> `icon-button`, `Unstable_TrapFocus` -> `unstable-trap-focus`. */
export function toSlug(name: string): string {
  return name
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** Heading text -> anchor id. */
export function toAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`'"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
