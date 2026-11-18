import * as React from 'react';
import { DATA_ATTRIBUTE, DEFAULT_STORAGE_KEY, TOKENS_MARKER } from './tecton/index.js';
import tokensCss from './tecton/generated/core/tokens.js';
import type { ThemeModePreference } from './modeStore.js';

export interface TectonModeScriptOptions {
  /** Must match the ThemeManager `storageKey` (default `tecton-theme-mode`). */
  storageKey?: string;
  /** Preference used when nothing is stored (default `light`). */
  defaultMode?: ThemeModePreference;
}

/**
 * Inline script source that sets `data-theme` on <html> from the stored Tecton preference before
 * first paint, avoiding a flash of the wrong mode in SSR/static pages. Mirrors ThemeManager logic.
 */
export function getTectonModeScript({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultMode = 'light',
}: TectonModeScriptOptions = {}): string {
  return (
    `(function(){try{var p=null;try{p=localStorage.getItem(${JSON.stringify(storageKey)})}catch(e){}` +
    `if(p!=='light'&&p!=='dark'&&p!=='system')p=${JSON.stringify(defaultMode)};` +
    `var m=p==='system'?(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;` +
    `document.documentElement.setAttribute(${JSON.stringify(DATA_ATTRIBUTE)},m)}catch(e){}})();`
  );
}

/** Render inside <head> (SSR/static) before content. */
export function TectonModeScript(props: TectonModeScriptOptions & { nonce?: string }) {
  const { nonce, ...options } = props;
  return (
    <script nonce={nonce} dangerouslySetInnerHTML={{ __html: getTectonModeScript(options) }} />
  );
}

/**
 * Server-renders the Tecton CSS variables with the marker Tecton's runtime checks, so the browser
 * has tokens before hydration and the runtime does not inject them again. Use in shells/standalone
 * SSR apps that do not load `styles/global.css`.
 */
export function TectonTokensStyle({ nonce }: { nonce?: string }) {
  return (
    <style
      nonce={nonce}
      {...{ [`data-tecton`]: TOKENS_MARKER }}
      dangerouslySetInnerHTML={{ __html: tokensCss }}
    />
  );
}
