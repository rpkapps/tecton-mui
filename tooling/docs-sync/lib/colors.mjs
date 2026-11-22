// Replaces hard-coded colors in synced demos with Tecton color tokens, so every demo (including the
// "Customization" examples) draws from the Tecton palette and follows the light/dark mode.
//
// Each color literal (hex, rgb[a](), hsl[a]()) gets a role from the property it is assigned to
// (background, text, border, shadow) and a token from its lightness (neutral colors) or hue family
// (chromatic colors). Blue and violet "brand" colors become the Tecton primary; other hues become
// the matching status or accent tokens. Translucent colors keep their opacity through color-mix().
//
// Left unchanged, by design:
// - neutral shadows (Tecton defines no shadow color; elevation keeps MUI's black shadows),
// - colors inside `encodeURIComponent(...)` (SVG data URIs, where CSS variables do not resolve),
// - JSX attributes (`stopColor="#…"`: SVG presentation attributes do not resolve CSS variables),
// - theme palette definitions (`main`, `light`, `dark`, `contrastText`, `paper`, `default`): MUI
//   computes derived colors from them and rejects CSS variables.
// Those cases are handled per demo in the manifest (`demoEdits`) where needed. `overrides` maps a
// literal (as written) to a token name, or to `keep`, for one demo (manifest `demoColors`).
import { readFileSync } from 'node:fs';

const TOKENS = new Set(
  [
    ...readFileSync(
      new URL('../../../packages/ui/assets/tecton/tokens.css', import.meta.url),
      'utf8',
    ).matchAll(/--tecton-(color-[\w-]+)\s*:/g),
  ].map((m) => m[1].slice('color-'.length)),
);

const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
/** `theme.palette.grey[N]`, `(theme.vars || theme).palette.grey[N]`, `themePalette.grey[N]`, … */
const GREY_REF =
  /(?:\(theme\.vars\s*(?:\|\||\?\?)\s*theme\)\.palette|theme(?:\.vars)?\.palette|\b\w*[Pp]alette)\.grey\[(\d+)\]/g;
/** Material grey scale (the values MUI's theme exposes as `palette.grey`). */
const GREY = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};
const STRING = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
const PALETTE_KEYS = /^(main|light|dark|contrastText|paper|default)$/;

function parse(text) {
  let m;
  if ((m = /^#([0-9a-f]{3,8})$/i.exec(text))) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  if ((m = /^(rgb|hsl)a?\((.*)\)$/i.exec(text))) {
    const parts = m[2].split(/[\s,/]+/).filter(Boolean);
    const num = (s, max) => (s.endsWith('%') ? (parseFloat(s) / 100) * max : parseFloat(s));
    const a = parts[3] === undefined ? 1 : num(parts[3], 1);
    if (m[1].toLowerCase() === 'rgb')
      return { r: num(parts[0], 255), g: num(parts[1], 255), b: num(parts[2], 255), a };
    const [h, s, l] = [parseFloat(parts[0]), num(parts[1], 1), num(parts[2], 1)];
    const k = (n) => (n + h / 30) % 12;
    const f = (n) => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255, a };
  }
  return null;
}

function hsl({ r, g, b }) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s, l };
}

function role(key, literal) {
  const k = key ?? '';
  if (/shadow|filter/i.test(k)) return 'shadow';
  if (/border|outline|stroke/i.test(k)) return 'border';
  if (/background|bgcolor|fill|stop|gradient/i.test(k)) return 'bg';
  if (/^color$/i.test(k) || (/color$/i.test(k) && !/background|border|stop/i.test(k)))
    return 'text';
  if (/gradient\(/.test(literal)) return 'bg';
  if (/\bsolid\b/.test(literal)) return 'border';
  if (/\d+px[^,]*(?:#|rgb|hsl)/.test(literal)) return 'shadow';
  return 'bg';
}

/** Tecton family for a chromatic hue: Tecton primary for blue/violet, else status or accent tokens. */
function family(h) {
  const status = (x) => ({
    bg: `status-${x}-filled-bg`,
    muted: `status-${x}-muted`,
    deep: `status-${x}-bright`,
    text: `status-${x}-outline-text`,
    border: `status-${x}-outline-border-focus`,
  });
  const accent = (x) => ({
    bg: `accent-${x}-fill`,
    muted: `accent-${x}-fill`,
    deep: `accent-${x}-text`,
    text: `accent-${x}-text`,
    border: `accent-${x}-fill`,
  });
  if (h < 15 || h >= 345) return status('error');
  if (h < 40) return accent('saffron');
  if (h < 65) return status('warning');
  if (h < 95) return accent('lime');
  if (h < 165) return status('success');
  if (h < 195) return accent('azure');
  if (h < 300)
    return {
      bg: 'action-primary-bg',
      muted: 'action-secondary-bg',
      deep: 'action-primary-bg-press',
      text: 'action-outlined-text',
      border: 'action-outlined-border-focus',
    };
  return accent('pink');
}

/**
 * Token (without `color-`) for a parsed color in a role, and whether the color's own opacity is
 * kept (`alpha`); `null` keeps the literal. Translucent neutral "ink" (rgba(0,0,0,.1) and the
 * like) maps to an already-subtle token, so its opacity is not applied a second time.
 */
function tokenFor(c, r, dark) {
  const { h, s, l } = hsl(c);
  const neutral = s < 0.15 || l > 0.97 || l < 0.04;
  const translucent = c.a < 1;
  if (r === 'shadow') return neutral ? null : { token: 'focus-ring', alpha: true };
  if (!neutral) {
    const f = family(h);
    const pick = (token) => ({ token, alpha: true });
    if (r === 'border') return pick(f.border);
    if (r === 'text') return pick(l >= 0.88 ? f.muted : f.text);
    if (l >= 0.88) return pick(f.muted);
    if (l < 0.3) return pick(dark ? f.muted : f.deep);
    return pick(f.bg);
  }
  // Neutral: "ink" is dark on light surfaces and light in dark-mode blocks.
  const ink = dark ? l >= 0.5 : l < 0.5;
  const solid = (token) => ({ token, alpha: false });
  if (r === 'text') {
    if (!dark && l >= 0.95) return { token: 'action-primary-text', alpha: true }; // white text on a colored surface
    if (!dark && l >= 0.75) return solid('divider'); // light grey "text" color: rails, marks
    const depth = dark ? l : 1 - l; // 1 = strongest ink
    const strength = depth * (translucent ? c.a : 1);
    if (strength >= 0.65) return solid('text-primary');
    if (strength >= 0.4) return solid('text-secondary');
    return solid('text-subtlest');
  }
  if (r === 'border') {
    if (translucent && ink)
      return solid(c.a < 0.15 ? 'divider-subtle' : c.a < 0.35 ? 'divider' : 'divider-strong');
    const contrast = dark ? l : 1 - l;
    return solid(
      contrast < 0.2 ? 'divider-subtle' : contrast < 0.45 ? 'divider' : 'divider-strong',
    );
  }
  // Background.
  if (translucent && ink) {
    if (c.a === 0) return { token: 'bg-paper', alpha: true }; // fully transparent stays transparent
    return solid(c.a <= 0.1 ? 'content-bg-hover' : c.a <= 0.3 ? 'content-bg-press' : 'divider');
  }
  if (translucent) return { token: 'bg-paper', alpha: true }; // a veil of the surface color
  if (dark) {
    if (l <= 0.2) return solid('bg-paper');
    if (l <= 0.3) return solid('content-bg-hover');
    return solid('divider');
  }
  if (l >= 0.97) return solid('bg-paper');
  if (l >= 0.93) return solid('bg-default');
  if (l >= 0.85) return solid('content-bg-hover');
  if (l >= 0.7) return solid('divider-subtle');
  if (l >= 0.45) return solid('divider');
  return solid('text-primary'); // a dark surface in light mode: the inverse of the page
}

/** Ranges of `theme.applyStyles('dark', { ... })` blocks. */
function darkRanges(code) {
  const ranges = [];
  for (const m of code.matchAll(/applyStyles\(\s*'dark'\s*,\s*\{/g)) {
    let depth = 0;
    for (let i = m.index + m[0].length - 1; i < code.length; i += 1) {
      if (code[i] === '{') depth += 1;
      else if (code[i] === '}' && --depth === 0) {
        ranges.push([m.index, i]);
        break;
      }
    }
  }
  return ranges;
}

const value = (token, a) => {
  if (!TOKENS.has(token)) throw new Error(`docs-sync colors: unknown Tecton token color-${token}`);
  return a < 1
    ? `color-mix(in srgb, var(--tecton-color-${token}) ${Math.round(a * 100)}%, transparent)`
    : `var(--tecton-color-${token})`;
};

/** Returns the demo code with its hard-coded colors replaced, and how many were replaced. */
export function tectonColors(code, { overrides = {} } = {}) {
  const hasColors = COLOR.test(code) || GREY_REF.test(code);
  COLOR.lastIndex = 0;
  GREY_REF.lastIndex = 0;
  if (!hasColors) return { code, count: 0 };
  const dark = darkRanges(code);
  let count = 0;
  let out = '';
  let last = 0;
  for (const m of code.matchAll(STRING)) {
    const literal = m[0];
    if (!COLOR.test(literal)) continue;
    COLOR.lastIndex = 0;
    const before = code.slice(Math.max(0, m.index - 200), m.index);
    if (/encodeURIComponent\(\s*$/.test(before)) continue;
    if (/=\s*$/.test(before) && !/[=!<>]=\s*$/.test(before) && /<[^>]*$/.test(before)) continue; // JSX attribute
    // The property is the last `key:` before the literal (on its line or the two before).
    const key = [
      ...before
        .split('\n')
        .slice(-3)
        .join('\n')
        .matchAll(/([A-Za-z_$][\w$-]*)['"]?\s*:\s/g),
    ].at(-1)?.[1];
    if (key && PALETTE_KEYS.test(key) && /^['"]/.test(literal)) continue;
    const inDark = dark.some(([s, e]) => m.index > s && m.index < e);
    const r = role(key, literal);
    const quote = literal[0];
    const body = literal.slice(1, -1);
    let changed = false;
    const replaced = body.replace(COLOR, (text, offset) => {
      // Inside a template literal, a color passed to encodeURIComponent() ends up in a data URI.
      if (/encodeURIComponent\(\s*['"]?$/.test(body.slice(0, offset))) return text;
      const override = overrides[text];
      if (override === 'keep') return text;
      const c = parse(text);
      if (!c) return text;
      const pick = override ? { token: override, alpha: true } : tokenFor(c, r, inDark);
      if (!pick) return text;
      changed = true;
      count += 1;
      return value(pick.token, pick.alpha ? c.a : 1);
    });
    if (!changed) continue;
    const whole = /^var\(--tecton-color-([\w-]+)\)$/.exec(replaced);
    out +=
      code.slice(last, m.index) +
      (whole && quote !== '`' ? `cssVar('color-${whole[1]}')` : quote + replaced + quote);
    last = m.index + literal.length;
  }
  out += code.slice(last);
  // Material's grey scale read from the theme (`theme.palette.grey[300]` and aliases) is not part of
  // the Tecton palette either: map it like a literal of the same value, unless a color function
  // (alpha, emphasize, …) needs a real color.
  const greyDark = darkRanges(out);
  out = out.replace(GREY_REF, (ref, shade, offset) => {
    const before = out.slice(Math.max(0, offset - 200), offset);
    if (/(alpha|emphasize|darken|lighten|getContrastText)\(\s*$/.test(before) || !GREY[shade])
      return ref;
    const key = [
      ...before
        .split('\n')
        .slice(-3)
        .join('\n')
        .matchAll(/([A-Za-z_$][\w$-]*)['"]?\s*:\s/g),
    ].at(-1)?.[1];
    const inDark = greyDark.some(([s, e]) => offset > s && offset < e);
    const pick = tokenFor(parse(GREY[shade]), role(key, ''), inDark);
    if (!pick) return ref;
    count += 1;
    if (!TOKENS.has(pick.token))
      throw new Error(`docs-sync colors: unknown Tecton token color-${pick.token}`);
    return `cssVar('color-${pick.token}')`;
  });
  if (!count) return { code, count: 0 };
  if (
    /\bcssVar\(/.test(out) &&
    !/import\s*\{[^}]*\bcssVar\b[^}]*\}\s*from\s*'@tecton-mui\/ui\/styles'/.test(out)
  ) {
    const styles = /import \{([^}]*)\} from '@tecton-mui\/ui\/styles';/.exec(out);
    if (styles)
      out = out.replace(
        styles[0],
        `import {${styles[1].replace(/^\s*/, ' cssVar, ')}} from '@tecton-mui/ui/styles';`,
      );
    else {
      const imports = [...out.matchAll(/^import [^;]+;$/gm)];
      const at = imports.length ? imports.at(-1).index + imports.at(-1)[0].length : 0;
      out = `${out.slice(0, at)}\nimport { cssVar } from '@tecton-mui/ui/styles';${out.slice(at)}`;
    }
  }
  return { code: out, count };
}
