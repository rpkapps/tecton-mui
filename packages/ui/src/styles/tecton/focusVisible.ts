// Keyboard focus ring of Material inputs (TextField, Select, Autocomplete, number fields).
//
// Tecton draws the input focus ring on `.Tecton-focusVisible`, a class that its own Storybook adds
// by hand with `useKeyboardFocusVisible`. A theme cannot add a class, so a plain `TextField` or
// `Select` never showed the ring. Native `:focus-visible` is no substitute: browsers match it on a
// text input focused with the mouse too, and Tecton shows the ring for keyboard focus only.
//
// One page-wide tracker marks the input root that receives keyboard focus with
// `data-tecton-focus-visible` and clears the mark when the focus leaves; `applyThemeCompat` lets every
// Tecton `.Tecton-focusVisible` rule match the mark too. It is an attribute, not the class, because
// React rewrites `className` whenever the input re-renders but leaves attributes it does not own.

/** Attribute set on the `.MuiInputBase-root` of an input focused with the keyboard. */
export const INPUT_FOCUS_VISIBLE_ATTRIBUTE = 'data-tecton-focus-visible';

/** Selector that matches Tecton's own class or the tracker's attribute. */
export const INPUT_FOCUS_VISIBLE_SELECTOR = `:is(.Tecton-focusVisible, [${INPUT_FOCUS_VISIBLE_ATTRIBUTE}])`;

// Shared through the global symbol registry, so two copies of the library on one page (micro
// frontends) install the listeners once.
const INSTALLED = Symbol.for('tecton-mui.inputFocusVisible');

function inputRoot(target: EventTarget | null): Element | null {
  const element = target as Element | null;
  return typeof element?.closest === 'function' ? element.closest('.MuiInputBase-root') : null;
}

/**
 * Starts marking keyboard-focused inputs in `doc`. Idempotent; the `ThemeProvider` calls it. Like
 * `useKeyboardFocusVisible`, the input modality is read when the focus arrives: typing in a field
 * focused with the mouse does not show the ring.
 */
export function installInputFocusVisible(doc: Document | undefined = globalThis.document): void {
  if (!doc) return;
  const scope = doc as unknown as Record<symbol, boolean | undefined>;
  if (scope[INSTALLED]) return;
  scope[INSTALLED] = true;

  let keyboard = false;
  doc.addEventListener(
    'keydown',
    () => {
      keyboard = true;
    },
    true,
  );
  doc.addEventListener(
    'pointerdown',
    () => {
      keyboard = false;
    },
    true,
  );
  doc.addEventListener('focusin', (event) => {
    if (keyboard) inputRoot(event.target)?.setAttribute(INPUT_FOCUS_VISIBLE_ATTRIBUTE, '');
  });
  doc.addEventListener('focusout', (event) => {
    inputRoot(event.target)?.removeAttribute(INPUT_FOCUS_VISIBLE_ATTRIBUTE);
  });
}

type StyleObject = { [key: string]: unknown };

function isStyleObject(value: unknown): value is StyleObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Rewrites every `.Tecton-focusVisible` selector key of a style override in place (same order, same
 * specificity: `:is()` takes its most specific argument), so the rules also match the tracker's
 * attribute.
 */
export function withInputFocusVisible<T>(style: T): T {
  if (!isStyleObject(style)) return style;
  return Object.fromEntries(
    Object.entries(style).map(([key, value]) => [
      key.replaceAll('.Tecton-focusVisible', INPUT_FOCUS_VISIBLE_SELECTOR),
      withInputFocusVisible(value),
    ]),
  ) as T;
}
