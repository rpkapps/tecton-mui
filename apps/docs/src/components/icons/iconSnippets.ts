import type { IconName, IconVariant } from '@tecton-mui/ui/Icon';
import { iconVariants } from './iconSearch';

export const ICON_IMPORT = "import Icon from '@tecton-mui/ui/Icon';";

/**
 * The JSX for an icon in the chosen variant. `variant="filled"` is written only when the icon has a
 * filled glyph; otherwise the default (or the only available variant) is what renders anyway.
 */
export function iconJsx(name: IconName, variant: IconVariant): string {
  return variant === 'filled' && iconVariants(name).includes('filled')
    ? `<Icon name="${name}" variant="filled" />`
    : `<Icon name="${name}" />`;
}

/**
 * SVG markup from a CSS `url("data:image/svg+xml,…")` value, the form in which Tecton's `icons.css`
 * stores each glyph (`--tecton-icon-url`). Returns `null` for anything else.
 */
export function svgFromCssUrl(value: string): string | null {
  // Quoted URLs may contain parentheses (glyphs with `clip-path="url(#id)"`).
  const match = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/.exec(value);
  const url = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!url?.startsWith('data:image/svg+xml')) return null;
  const comma = url.indexOf(',');
  const meta = url.slice(0, comma);
  const data = url.slice(comma + 1);
  let svg: string;
  try {
    svg = meta.endsWith(';base64') ? atob(data) : decodeURIComponent(data);
  } catch {
    return null;
  }
  svg = svg.replace(/\r\n?/g, '\n').trim();
  return svg.startsWith('<svg') ? svg : null;
}

/** The SVG markup of a rendered `Icon` element (read from its computed Tecton CSS). */
export function readIconSvg(element: Element): string | null {
  return svgFromCssUrl(getComputedStyle(element).getPropertyValue('--tecton-icon-url'));
}

/**
 * Copies text to the clipboard. Falls back to a hidden textarea where the async Clipboard API is
 * missing (non-secure origins). Resolves `false` when the browser refuses both.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or document not focused: try the legacy path below.
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  const active = document.activeElement as HTMLElement | null;
  textarea.select();
  let ok: boolean;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  textarea.remove();
  active?.focus();
  return ok;
}
