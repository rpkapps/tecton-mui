import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createTheme as createMuiTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider } from '../ThemeProvider.js';
import { createTheme, getDefaultTheme } from '../createTheme.js';
import {
  MODAL_LAYER_PROTOCOL,
  __uninstallModalLayerForTests,
  createModalLayer,
  getModalCopies,
  installModalLayer,
  registerModalRoot,
  withModalRegistration,
  type ModalLayer,
} from '../modalLayer.js';

// Stand-ins for MUI modal roots (classes and focus-trap sentinels as MUI renders them). Each test
// writes the scroll and aria-hidden changes the copies' own ModalManagers would make.
const OTHER_COPY = { copy: 'another copy of the library' };
const INERT_MARK = '[data-tecton-modal-layer-inert]';
const ARIA_MARK = '[data-tecton-modal-layer-hidden]';

let page: HTMLElement;
let layer: ModalLayer | null = null;

/** `copy`: omitted = this copy, an object = another copy, null = unregistered ("unknown"). */
function modal(copy?: object | null, parent: Element = document.body): HTMLElement {
  const root = document.createElement('div');
  root.className = 'MuiModal-root';
  root.innerHTML =
    '<div data-testid="sentinelStart" tabindex="0"></div><button>inside</button>' +
    '<div data-testid="sentinelEnd" tabindex="0"></div>';
  parent.appendChild(root);
  if (copy === undefined) registerModalRoot(root);
  else if (copy) getModalCopies().set(root, copy);
  return root;
}
const button = (root: Element) => root.querySelector('button')!;
const startClosing = (root: Element) =>
  root.querySelector('[data-testid="sentinelStart"]')!.setAttribute('tabindex', '-1');
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const scrollbar = (width: number) =>
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: window.innerWidth - width,
  });

beforeEach(() => {
  page = document.body.appendChild(document.createElement('div'));
  page.id = 'page';
  page.innerHTML = '<button id="opener">open</button>';
});
afterEach(() => {
  cleanup(); // unmount React trees before the DOM is cleared
  layer?.dispose();
  layer = null;
  __uninstallModalLayerForTests();
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  scrollbar(0);
});

describe('modal layer', () => {
  it('writes nothing while modals of one copy are open', async () => {
    layer = createModalLayer(document);
    const a = modal();
    document.body.style.overflow = 'hidden'; // MUI locks scroll
    page.setAttribute('aria-hidden', 'true');
    const b = modal();
    button(b).focus();
    await flush();
    a.remove();
    document.body.style.overflow = ''; // whatever MUI does, the layer leaves it
    page.removeAttribute('aria-hidden');
    await flush();
    expect(document.querySelectorAll(`${INERT_MARK}, ${ARIA_MARK}`)).toHaveLength(0);
    expect(document.body.style.overflow).toBe('');
    expect(page.hasAttribute('aria-hidden')).toBe(false);
  });

  it('makes a lower modal of another copy inert and gives it the focus back as the top closes', async () => {
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    button(a).focus();
    const b = modal();
    button(b).focus();
    await flush();
    expect(a.hasAttribute('inert')).toBe(true);
    expect(b.hasAttribute('inert')).toBe(false);
    // The top modal starts closing (its trap's sentinels leave the tab order): no wait for its exit.
    startClosing(b);
    await flush();
    expect(a.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(button(a));
    expect(b.hasAttribute('inert')).toBe(true); // the closing one, until it is gone
    b.remove();
    await flush();
    expect(document.activeElement).toBe(button(a));
  });

  it('keeps a closing lower modal of another copy inert until it is gone', async () => {
    // Its trap gives the focus back while it still listens: were it not inert, it would pull the
    // focus back from the top modal's trap, and the two would re-focus each other.
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    const b = modal();
    button(b).focus();
    await flush();
    startClosing(a);
    await flush();
    expect(a.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(button(b));
    a.remove();
    await flush();
    expect(document.querySelectorAll(INERT_MARK)).toHaveLength(0);
  });

  it('also gives the focus back when the closing modal has no sentinels', async () => {
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    button(a).focus();
    const b = modal();
    b.querySelectorAll('[data-testid]').forEach((el) => el.remove());
    button(b).focus();
    await flush();
    expect(a.hasAttribute('inert')).toBe(true);
    (document.activeElement as HTMLElement).blur(); // the closing trap's restore found it inert
    b.remove();
    await flush();
    expect(a.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(button(a));
  });

  it('marks the lower modal inert before the focus traps see the focus move', () => {
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    const seen: boolean[] = [];
    const trap = () => seen.push(a.hasAttribute('inert'));
    document.addEventListener('focusin', trap);
    const b = modal();
    button(b).focus(); // synchronously, before any MutationObserver callback
    document.removeEventListener('focusin', trap);
    expect(seen).toEqual([true]);
  });

  it('treats a modal without a registration as copy "unknown"', async () => {
    layer = createModalLayer(document);
    const a = modal(null);
    const b = modal();
    await flush();
    expect(a.hasAttribute('inert')).toBe(true);
    expect(b.hasAttribute('inert')).toBe(false);
  });

  it('keeps scroll locked until the last modal of a mixed session closes, then restores it', async () => {
    scrollbar(15);
    const fixed = page.appendChild(document.createElement('div'));
    fixed.className = 'mui-fixed';
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    document.body.style.overflow = 'hidden'; // copy A locks
    document.body.style.paddingRight = '15px';
    await flush();
    const b = modal(); // copy B finds it locked and saves `hidden` as the style to restore
    await flush();
    // Copy A closes first and restores the page while B's dialog is still open.
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    a.remove();
    await flush();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('15px');
    expect(fixed.style.paddingRight).toBe('15px');
    // Copy B closes last and "restores" the `hidden` it saved.
    document.body.style.overflow = 'hidden';
    b.remove();
    await flush();
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
    expect(fixed.style.paddingRight).toBe('');
  });

  it('locks <html> when that is the scroll container', async () => {
    document.documentElement.style.overflowY = 'scroll';
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    document.documentElement.style.overflow = 'hidden';
    const b = modal();
    await flush();
    document.documentElement.style.overflow = '';
    a.remove();
    await flush();
    expect(document.documentElement.style.overflow).toBe('hidden');
    b.remove();
    await flush();
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.documentElement.style.overflowY).toBe('scroll');
    document.documentElement.removeAttribute('style');
  });

  it('undoes a stale lock written right after a mixed session ended, but not later', async () => {
    let time = 0;
    layer = createModalLayer(document, MODAL_LAYER_PROTOCOL, undefined, { now: () => time });
    const a = modal(OTHER_COPY);
    document.body.style.overflow = 'hidden';
    const b = modal();
    await flush();
    a.remove();
    b.remove();
    await flush();
    expect(document.body.style.overflow).toBe('');
    time = 100; // a copy's manager restores its stale `hidden` after the roots are gone
    document.body.style.overflow = 'hidden';
    await flush();
    expect(document.body.style.overflow).toBe('');
    time = 1000; // the page's own change, later, stays
    document.body.style.overflow = 'hidden';
    await flush();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('keeps the page behind the top modal hidden from assistive technology', async () => {
    const own = page.appendChild(document.createElement('div'));
    own.setAttribute('aria-hidden', 'true'); // hidden by the app itself: never touched
    layer = createModalLayer(document);
    const a = modal(OTHER_COPY);
    page.setAttribute('aria-hidden', 'true'); // copy A hides the page
    const b = modal();
    await flush();
    // Copy A closes first and un-hides the page while B's dialog is still open.
    page.removeAttribute('aria-hidden');
    a.remove();
    await flush();
    expect(page.getAttribute('aria-hidden')).toBe('true');
    b.remove();
    await flush();
    expect(page.hasAttribute('aria-hidden')).toBe(false);
    expect(own.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelectorAll(ARIA_MARK)).toHaveLength(0);
  });

  it('runs once per page: a newer protocol takes over mid-session, an older one stays out', async () => {
    const slot = () =>
      (globalThis as unknown as Record<symbol, { protocol: number } | undefined>)[
        Symbol.for('tecton-mui.modalLayer')
      ];
    installModalLayer(document, 1);
    installModalLayer(document, 1);
    expect(slot()?.protocol).toBe(1);
    const a = modal(OTHER_COPY);
    document.body.style.overflow = 'hidden';
    const b = modal();
    await flush();
    expect(a.hasAttribute('inert')).toBe(true);

    installModalLayer(document, 2); // an MFE with a newer library mounts
    expect(slot()?.protocol).toBe(2);
    installModalLayer(document, 1); // and an older one after it
    expect(slot()?.protocol).toBe(2);
    // The new layer continues the session it took over: same baseline, same stack.
    document.body.style.overflow = '';
    a.remove();
    await flush();
    expect(document.body.style.overflow).toBe('hidden');
    document.body.style.overflow = 'hidden';
    b.remove();
    await flush();
    expect(document.body.style.overflow).toBe('');
  });

  it('modals rendered under ThemeProvider register this copy and install the layer', () => {
    function Example() {
      const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
      return (
        <ThemeProvider>
          <Dialog open>
            <button onClick={(e) => setAnchor(e.currentTarget)}>menu</button>
          </Dialog>
          <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
            <MenuItem>item</MenuItem>
          </Menu>
        </ThemeProvider>
      );
    }
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    const roots = Array.from(document.querySelectorAll('.MuiModal-root'));
    expect(roots).toHaveLength(2);
    const copies = roots.map((root) => getModalCopies().get(root));
    expect(copies[0]).toBeDefined();
    expect(copies[1]).toBe(copies[0]);
    expect(copies[0]).not.toBe(OTHER_COPY);
    expect(
      (globalThis as unknown as Record<symbol, { protocol: number } | undefined>)[
        Symbol.for('tecton-mui.modalLayer')
      ]?.protocol,
    ).toBe(MODAL_LAYER_PROTOCOL);
  });
});

describe('withModalRegistration', () => {
  it('registers the themes the library builds, in place', () => {
    const theme = createTheme();
    expect(withModalRegistration(theme)).toBe(theme);
    expect(withModalRegistration(getDefaultTheme('dark'))).toBe(getDefaultTheme('dark'));
    expect(
      (theme.components?.MuiModal?.defaultProps?.slotProps as { root: { ref: unknown } }).root.ref,
    ).toBe(registerModalRoot);
  });

  it('derives a cached copy of a theme from elsewhere and keeps its own modal ref', () => {
    const own = vi.fn();
    const theme = createMuiTheme({
      components: { MuiModal: { defaultProps: { slotProps: { root: { ref: own } as object } } } },
    });
    const registered = withModalRegistration(theme);
    expect(registered).not.toBe(theme);
    expect(withModalRegistration(theme)).toBe(registered);
    expect(withModalRegistration(registered)).toBe(registered);
    render(
      <ThemeProvider theme={theme}>
        <Dialog open>
          <button>inside</button>
        </Dialog>
      </ThemeProvider>,
    );
    const root = document.querySelector('.MuiModal-root')!;
    expect(own).toHaveBeenCalledWith(root);
    expect(getModalCopies().has(root)).toBe(true);
  });

  it('wraps nested theme functions and function slot props, and leaves partial themes alone', () => {
    const partial = { palette: { primary: { main: '#123456' } } };
    expect(withModalRegistration(partial)).toBe(partial);
    const theme = createMuiTheme({
      components: {
        MuiModal: { defaultProps: { slotProps: { root: () => ({ className: 'own' }) } } },
      },
    });
    render(
      <ThemeProvider theme={(outer) => ({ ...outer, ...theme })}>
        <Dialog open>
          <button>inside</button>
        </Dialog>
      </ThemeProvider>,
    );
    const root = document.querySelector('.MuiModal-root')!;
    expect(root.classList.contains('own')).toBe(true);
    expect(getModalCopies().has(root)).toBe(true);
  });
});
