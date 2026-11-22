/**
 * Reads the Tecton CSS variable contract (`@tecton-mui/ui/styles/tokens.css`) for the Foundations
 * pages. Pure functions: callers pass the stylesheet text, so tests can feed the file directly.
 */

/** One Tecton custom property with its value in each mode. */
export interface TokenVariable {
  /** Custom property name, e.g. `--tecton-color-text-primary`. */
  name: string;
  light: string;
  /** Same as `light` for tokens that are not redefined for dark mode (spacing, radius, …). */
  dark: string;
}

const DECLARATION = /(--tecton-[\w-]+)\s*:\s*([^;]+);/g;

/**
 * Every `--tecton-*` declaration of the light block (`:root` / `[data-theme="light"]`) and the dark
 * block (`[data-theme="dark"]`), in source order.
 */
export function parseTokenCss(css: string): TokenVariable[] {
  const light = new Map<string, string>();
  const dark = new Map<string, string>();
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selector = '', body = ''] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const target = /data-theme=["']?dark/.test(selector)
      ? dark
      : /:root|data-theme=["']?light/.test(selector)
        ? light
        : undefined;
    if (!target) continue;
    for (const [, name = '', value = ''] of body.matchAll(DECLARATION))
      target.set(name, value.trim());
  }
  const names = [...light.keys(), ...[...dark.keys()].filter((name) => !light.has(name))];
  return names.map((name) => {
    const lightValue = light.get(name) ?? dark.get(name) ?? '';
    return { name, light: lightValue, dark: dark.get(name) ?? lightValue };
  });
}

// ---------------------------------------------------------------------------------------------
// Colors

export const COLOR_PREFIX = '--tecton-color-';

export type ColorGroupId =
  | 'text'
  | 'surfaces'
  | 'dividers'
  | 'action-primary'
  | 'action-secondary'
  | 'action-tertiary'
  | 'action-outlined'
  | 'action-text-only'
  | 'action-filled'
  | 'focus-ring'
  | 'status-success'
  | 'status-warning'
  | 'status-error'
  | 'status-info'
  | 'status-neutral'
  | 'accents'
  | 'extended'
  | 'table'
  | 'input-filled'
  | 'input-outlined'
  | 'input-text-only'
  | 'avatar'
  | 'badge'
  | 'top-nav'
  | 'slider'
  | 'disabled'
  | 'branding'
  | 'other';

interface ColorGroupDef {
  id: Exclude<ColorGroupId, 'other'>;
  /** Matches the name without `--tecton-color-`; the matched text is dropped from the row label. */
  match: RegExp;
  /** Label of the token whose name is the whole match (e.g. `status-success`). Default `Main`. */
  main?: string;
}

/** First match wins, so more specific prefixes come first. */
const COLOR_GROUPS: ColorGroupDef[] = [
  { id: 'text', match: /^text-/ },
  { id: 'surfaces', match: /^(?=bg-|surface-|content-|backdrop-)/ },
  { id: 'dividers', match: /^divider-?/, main: 'Default' },
  { id: 'action-primary', match: /^action-primary-/ },
  { id: 'action-secondary', match: /^action-secondary-/ },
  { id: 'action-tertiary', match: /^action-tertiary-/ },
  { id: 'action-outlined', match: /^action-outlined-/ },
  { id: 'action-text-only', match: /^action-text-only-/ },
  { id: 'action-filled', match: /^action-(?=filled-|main$|bold$)/ },
  { id: 'focus-ring', match: /^focus-ring$/, main: 'Focus ring' },
  { id: 'status-success', match: /^status-success-?/ },
  { id: 'status-warning', match: /^status-warning-?/ },
  { id: 'status-error', match: /^status-error-?/ },
  { id: 'status-info', match: /^status-info-?/ },
  { id: 'status-neutral', match: /^status-neutral-?/ },
  { id: 'accents', match: /^accent-/ },
  { id: 'extended', match: /^extended-/ },
  { id: 'table', match: /^(?:component-)?table-/ },
  { id: 'input-filled', match: /^(?:component-)?input-filled-/ },
  { id: 'input-outlined', match: /^(?:component-)?input-outlined-/ },
  { id: 'input-text-only', match: /^(?:component-)?input-text-only-/ },
  { id: 'avatar', match: /^(?:component-)?avatar-/ },
  { id: 'badge', match: /^component-badge-/ },
  { id: 'top-nav', match: /^component-top-nav-/ },
  { id: 'slider', match: /^slider-/ },
  { id: 'disabled', match: /^disabled-/ },
  { id: 'branding', match: /^branding-/ },
];

const STATES = new Set(['hover', 'focus', 'press', 'active']);
const WORDS: Record<string, string> = {
  bg: 'background',
  adornment: 'icon',
  outline: 'outlined',
  alt: 'alternate',
  contrast: '',
  states: '',
};

/**
 * Readable role of a token from the rest of its name: `bg-hover` -> "Background, hover",
 * `states-hover-background` -> "Background, hover", `contrast-text` -> "Text".
 */
export function roleLabel(rest: string, main = 'Main'): string {
  if (!rest) return main;
  const words = rest.split('-');
  const state = words.find((w) => STATES.has(w));
  const base = words
    .filter((w) => w !== state)
    .map((w) => WORDS[w] ?? w)
    .filter(Boolean)
    .join(' ')
    .replace(/\btext only\b/, 'text-only');
  const label = base || state || '';
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
  return base && state ? `${capitalized}, ${state}` : capitalized;
}

/** Short guidance for the tokens people reach for most. Keys omit `--tecton-color-`. */
const DESCRIPTIONS: Record<string, string> = {
  'text-primary': 'Body text, headings and control labels.',
  'text-secondary': 'Supporting text: metadata, captions, table subheadings.',
  'text-subtlest': 'Lowest-emphasis helper text.',
  'text-placeholder': 'Placeholder and hint text in empty inputs.',
  'text-disabled': 'Text of disabled controls.',
  'text-inverse': 'Text on filled action and status surfaces.',
  'bg-default': 'Page canvas behind the shell and the content.',
  'bg-paper': 'Cards, sheets and dialogs that sit on the canvas.',
  'bg-elevated': 'Menus, tooltips and other floating panels.',
  'backdrop-fill': 'Scrim behind modal dialogs and drawers.',
  'content-bg-hover': 'List rows, menu items and other selectable content while hovered.',
  'content-bg-active': 'Selected list rows and menu items.',
  divider: 'Default separator between rows, sections and cards.',
  'divider-subtle': 'Light rules inside dense tables and forms.',
  'divider-strong': 'High-contrast separators around toolbars and major zones.',
  'focus-ring': 'Keyboard focus outline drawn around every focusable element.',
};

/** Descriptions shared by the five status groups, keyed by the rest of the name. */
const STATUS_DESCRIPTIONS: Record<string, string> = {
  '': 'Main hue: icons, text links and progress.',
  muted: 'Low-emphasis tint for banner and chip backgrounds.',
  bright: 'High-emphasis tint for emphasis and callouts.',
};

export interface ColorRow extends TokenVariable {
  label: string;
  description?: string;
  /** Long `component-*` names with the same role and the same value in both modes. */
  aliases?: string[];
}

const isAlias = (name: string) => name.startsWith(`${COLOR_PREFIX}component-`);

/**
 * Splits the color variables into the page's groups. Every `--tecton-color-*` variable lands in
 * exactly one group; anything no rule matches goes to `other`, so a new Tecton prefix still shows
 * up on the page.
 */
export function groupColorTokens(variables: TokenVariable[]): Record<ColorGroupId, ColorRow[]> {
  const groups = Object.fromEntries(
    [...COLOR_GROUPS.map((g) => g.id), 'other'].map((id) => [id, [] as ColorRow[]]),
  ) as Record<ColorGroupId, ColorRow[]>;
  const curated = Object.keys(DESCRIPTIONS);
  const statusCurated = Object.keys(STATUS_DESCRIPTIONS);
  const rank = new Map<string, number>();
  for (const variable of variables) {
    if (!variable.name.startsWith(COLOR_PREFIX)) continue;
    const short = variable.name.slice(COLOR_PREFIX.length);
    const def = COLOR_GROUPS.find((g) => g.match.test(short));
    if (!def) {
      groups.other.push({ ...variable, label: roleLabel(short) });
      continue;
    }
    const rest = short.replace(def.match, '');
    const isStatus = def.id.startsWith('status-');
    const description = DESCRIPTIONS[short] ?? (isStatus ? STATUS_DESCRIPTIONS[rest] : undefined);
    groups[def.id].push({ ...variable, label: roleLabel(rest, def.main), description });
    // Order: the tokens with guidance (in the order above), then the rest in stylesheet order,
    // then the long `component-*` aliases (design-token source paths).
    const position = description
      ? DESCRIPTIONS[short]
        ? curated.indexOf(short)
        : statusCurated.indexOf(rest)
      : undefined;
    rank.set(
      variable.name,
      position !== undefined ? position : short.startsWith('component-') ? 2000 : 1000,
    );
  }
  for (const id of Object.keys(groups) as ColorGroupId[]) {
    const rows = groups[id].sort((a, b) => (rank.get(a.name) ?? 1000) - (rank.get(b.name) ?? 1000));
    // Fold each `component-*` alias into the row of the short name it duplicates.
    const merged: ColorRow[] = [];
    for (const row of rows) {
      const target = isAlias(row.name)
        ? merged.find(
            (r) =>
              !isAlias(r.name) &&
              r.label === row.label &&
              r.light === row.light &&
              r.dark === row.dark,
          )
        : undefined;
      if (target) (target.aliases ??= []).push(row.name);
      else merged.push(row);
    }
    groups[id] = merged;
  }
  return groups;
}

// ---------------------------------------------------------------------------------------------
// Scales

/** Scale entries (`{ '100': 8, round: 1000 }`) in ascending order, named keys last. */
export function scaleEntries(scale: Record<string, number>): [key: string, value: number][] {
  const rank = (key: string) => (/^\d+$/.test(key) ? Number(key) : Number.POSITIVE_INFINITY);
  return Object.entries(scale).sort(([a], [b]) => rank(a) - rank(b));
}

/** A multiplier written the way it goes into `sx` (`0.25`, `1.5`, `2`). */
export function formatFactor(value: number, unit: number): string {
  return String(Math.round((value / unit) * 1000) / 1000);
}
